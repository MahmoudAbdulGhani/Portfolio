// Fail-closed, in-memory Prisma replacement for route/provider QA. No DB client
// is created and rate-limit writes stay in this Map, including live-provider QA.
import http from 'node:http';

export function snapshotPrisma(content) {
  let reads = 0;
  const read = key => async () => { reads += 1; return structuredClone(content[key] ?? []); };
  const buckets = new Map();
  const prisma = {
    profile: { findFirst: read('/api/profile') },
    project: { findMany: read('/api/projects') },
    technology: { findMany: read('/api/technologies') },
    skill: { findMany: read('/api/skills') },
    education: { findMany: read('/api/education') },
    certification: { findMany: read('/api/certifications') },
    rateLimitBucket: {
      findUnique: async ({ where }) => buckets.get(where.key),
      upsert: async ({ where, create, update }) => {
        const value = buckets.has(where.key) ? { ...buckets.get(where.key), ...update } : create;
        buckets.set(where.key, value);
        return value;
      },
      update: async ({ where, data }) => {
        const value = { ...buckets.get(where.key), count: buckets.get(where.key).count + data.count.increment };
        buckets.set(where.key, value);
        return value;
      },
      updateMany: async ({ where, data }) => {
        const row = buckets.get(where.key);
        if (!row || row.count !== where.count || row.windowStart.getTime() !== where.windowStart.getTime()) return { count: 0 };
        buckets.set(where.key, { ...row, ...data }); return { count: 1 };
      },
      deleteMany: async ({ where }) => {
        let count = 0;
        for (const [key, row] of buckets) {
          if (where.key && key !== where.key) continue;
          if (where.count !== undefined && row.count !== where.count) continue;
          if (where.windowStart instanceof Date && row.windowStart.getTime() !== where.windowStart.getTime()) continue;
          if (where.windowStart?.lte && row.windowStart > where.windowStart.lte) continue;
          if (where.updatedAt) continue; // Test buckets have no historical updatedAt.
          buckets.delete(key); count++;
        }
        return { count };
      },
    },
    $transaction: async callback => {
      const previous = structuredClone(buckets);
      try { return await callback(prisma); }
      catch (error) { buckets.clear(); for (const [key, row] of previous) buckets.set(key, row); throw error; }
    },
    $disconnect: async () => {},
  };
  return { prisma, buckets, readCount: () => reads };
}

export async function serve(app) {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise(resolve => server.close(resolve)),
    postBinary(path, payload) {
      return new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
        });
        req.on('error', reject);
        req.end(JSON.stringify(payload));
      });
    },
    post(path, payload) {
      return new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port, path, method: 'POST', headers: {
          'Content-Type': 'application/json', Accept: payload.stream ? 'text/event-stream' : 'application/json',
        } }, res => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', chunk => { body += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        req.end(JSON.stringify(payload));
      });
    },
  };
}
