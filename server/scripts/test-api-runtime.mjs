// Exercise the actual function entry from a package containing JavaScript only.
// No TypeScript loader, database, provider or production network is used.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const stage = mkdtempSync(join(tmpdir(), 'portfolio-api-runtime-'));
function copyJs(directory) {
  for (const item of readdirSync(join(root, directory), { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) copyJs(path);
    else if (item.name.endsWith('.js')) {
      mkdirSync(dirname(join(stage, path)), { recursive: true });
      copyFileSync(join(root, path), join(stage, path));
    }
  }
}
try {
  copyJs('api');
  copyJs('server/src');
  copyJs('shared');
  copyFileSync(join(root, 'package.json'), join(stage, 'package.json'));
  copyFileSync(join(root, 'server/package.json'), join(stage, 'server/package.json'));
  symlinkSync(join(root, 'node_modules'), join(stage, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  if (existsSync(join(root, 'server/node_modules'))) symlinkSync(join(root, 'server/node_modules'), join(stage, 'server/node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  writeFileSync(join(stage, 'smoke.mjs'), `
    import assert from 'node:assert/strict';
    import app from './api/index.js';
    import { prisma } from './server/src/lib/prisma.js';
    prisma.project.findMany = async () => [{ id: 'fixture', slug: 'runtime-fixture', name: 'Runtime fixture' }];
    prisma.profile.findFirst = async () => ({ id: 'fixture-profile', name: 'Runtime fixture', experience: [], socials: [] });
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const base = 'http://127.0.0.1:' + server.address().port;
      for (const [path, verify] of [
        ['/api/health', body => assert.equal(body.ok, true)],
        ['/api/projects', body => assert.equal(body[0].slug, 'runtime-fixture')],
        ['/api/profile', body => assert.equal(body.id, 'fixture-profile')],
      ]) {
        const response = await fetch(base + path);
        assert.equal(response.status, 200, path);
        verify(await response.json());
      }
      console.log('JavaScript-only function startup and health/projects/profile routes passed.');
    } finally {
      await new Promise(resolve => server.close(resolve));
      await prisma.$disconnect();
    }
  `);
  const output = execFileSync(process.execPath, ['--no-experimental-strip-types', join(stage, 'smoke.mjs')], {
    cwd: stage,
    env: { ...process.env, NODE_ENV: 'test', DOTENV_CONFIG_PATH: join(stage, 'no-env-file'), CV_STATIC_ONLY: '1' },
    encoding: 'utf8', timeout: 30_000,
  });
  console.log(output.trim());
} finally {
  assert.equal(dirname(resolve(stage)), resolve(tmpdir()));
  assert.ok(basename(stage).startsWith('portfolio-api-runtime-'));
  rmSync(stage, { recursive: true, force: true });
}
