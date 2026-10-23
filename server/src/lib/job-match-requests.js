import { createHash, randomInt } from 'node:crypto';
import { prisma } from './prisma.js';
import { consumeRateLimit, rateLimitStorageKey } from './rate-limit.js';

const ACTIVE_LEASE_MS = 120_000; // Crash recovery; longer than the bounded provider request.
const COMPLETED_MS = 30_000;
const PROVIDER_MS = 60_000;
const remaining = (row, windowMs, now) => row ? Math.max(0, Math.ceil((row.windowStart.getTime() + windowMs - now.getTime()) / 1000)) : 0;
const owned = lease => ({ key: lease.key, count: lease.owner, windowStart: lease.started });

// All processes share the existing persistent buckets. Atomic unique-key upsert
// claims one active slot per IP; an owner/time guard prevents stale cleanup from
// deleting a replacement lease. No job text or raw IP is stored in these keys.
export async function beginJobMatchRequest(ip, description) {
  const now = new Date();
  const key = rateLimitStorageKey(`job-active:${ip}`);
  const digest = createHash('sha256').update(description.trim().toLowerCase().replace(/\s+/g, ' ')).digest('hex');
  const lease = { key, owner: randomInt(1, 2_147_483_647), started: now,
    completedKey: rateLimitStorageKey(`job-completed:${ip}:${digest}`), providerKey: rateLimitStorageKey(`job-provider:${ip}`) };
  await prisma.rateLimitBucket.deleteMany({ where: { key, windowStart: { lte: new Date(now.getTime() - ACTIVE_LEASE_MS) } } });
  let row;
  try {
    row = await prisma.rateLimitBucket.upsert({ where: { key }, create: { key, windowStart: now, count: lease.owner }, update: {} });
  } catch (error) {
    // Prisma may emulate an empty-update upsert. A concurrent unique insert is
    // an active request, not an internal error or permission to call the model.
    if (error.code !== 'P2002') throw error;
  }
  if (!row || row.count !== lease.owner || row.windowStart.getTime() !== now.getTime()) return { issue: 'active', retryAfter: 2 };
  try {
    for (const [bucketKey, windowMs, issue] of [[lease.providerKey, PROVIDER_MS, 'provider-quota'], [lease.completedKey, COMPLETED_MS, 'completed']]) {
      const retryAfter = remaining(await prisma.rateLimitBucket.findUnique({ where: { key: bucketKey } }), windowMs, now);
      if (retryAfter) { await retireJobMatchRequest(lease); return { issue, retryAfter }; }
    }
    // Failed attempts still count. Retiring their active lease never refunds
    // the existing four-provider-attempts-per-minute abuse budget.
    const rate = await consumeRateLimit(`job:${ip}`, { limit: 4, windowMs: 60_000 });
    if (rate.limited) { await retireJobMatchRequest(lease); return { issue: 'rate', retryAfter: rate.retryAfter }; }
    return { lease };
  } catch (error) { await retireJobMatchRequest(lease); throw error; }
}

export async function retireJobMatchRequest(lease, { completed = false, providerLimited = false } = {}) {
  return prisma.$transaction(async tx => {
    // The guarded update locks the owned row until completion/release commits.
    // Rollback cannot leave a completed marker behind after a failed release.
    const current = await tx.rateLimitBucket.updateMany({ where: owned(lease), data: { count: lease.owner } });
    if (!current.count) return false;
    const now = new Date();
    for (const key of [completed && lease.completedKey, providerLimited && lease.providerKey].filter(Boolean)) {
      await tx.rateLimitBucket.upsert({ where: { key }, create: { key, windowStart: now, count: lease.owner }, update: { windowStart: now, count: lease.owner } });
    }
    await tx.rateLimitBucket.deleteMany({ where: owned(lease) });
    return true;
  });
}

export async function discardUndeliveredJobMatch(lease) {
  await prisma.rateLimitBucket.deleteMany({ where: { key: lease.completedKey, count: lease.owner } });
}
