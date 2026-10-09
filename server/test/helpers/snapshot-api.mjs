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
      deleteMany: async () => ({ count: 0 }),
    },
    $transaction: async callback => callback(prisma),
    $disconnect: async () => {},
  };
  return { prisma, readCount: () => reads };
}

export async function serve(app) {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return {
    close: () => new Promise(resolve => server.close(resolve)),
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
