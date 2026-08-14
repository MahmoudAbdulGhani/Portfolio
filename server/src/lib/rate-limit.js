import { prisma } from "./prisma.js";
import { createHash } from "node:crypto";

export const rateLimitStorageKey = (key) => {
  const namespace = String(key).split(":", 1)[0].replace(/[^a-z0-9_-]/gi, "").slice(0, 32) || "limit";
  return `${namespace}:${createHash("sha256").update(String(key)).digest("hex")}`;
};

async function consumeWithClient(client, key, { limit, windowMs }, now) {
  const cutoff = new Date(now.getTime() - windowMs);
  const keyHash = rateLimitStorageKey(key);
  const current = await client.rateLimitBucket.findUnique({ where: { key: keyHash } });
  const result = !current || current.windowStart < cutoff
    ? await client.rateLimitBucket.upsert({ where: { key: keyHash }, create: { key: keyHash, windowStart: now, count: 1 }, update: { windowStart: now, count: 1 } })
    : await client.rateLimitBucket.update({ where: { key: keyHash }, data: { count: { increment: 1 } } });
  return { limited: result.count > limit, retryAfter: Math.max(1, Math.ceil((result.windowStart.getTime() + windowMs - now.getTime()) / 1000)) };
}

async function maybeCleanup(now) {
  if (Math.random() >= 0.02) return;
  const expiresBefore = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  await prisma.rateLimitBucket.deleteMany({ where: { updatedAt: { lt: expiresBefore } } }).catch(() => undefined);
}

export async function consumeRateLimit(key, { limit, windowMs }) {
  const now = new Date();
  const result = await prisma.$transaction((tx) => consumeWithClient(tx, key, { limit, windowMs }, now));
  await maybeCleanup(now);
  return result;
}

export async function consumeRateLimits(entries) {
  const now = new Date();
  const results = await prisma.$transaction(async (tx) => {
    const values = [];
    for (const entry of entries) values.push(await consumeWithClient(tx, entry.key, entry, now));
    return values;
  });
  await maybeCleanup(now);
  return results;
}
