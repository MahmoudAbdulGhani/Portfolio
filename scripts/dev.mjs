import { spawn } from 'node:child_process';

// Keep the usual full-stack workflow. Forward Vite flags for frontend previews.
const args = process.argv.slice(2);
const preview = args.includes('--strictPort') && args.includes('4173');
const child = args.length
  ? spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...(preview ? ['--config', 'vite.motion-preview.config.js'] : []), ...args], { stdio: 'inherit' })
  : spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:full'], { stdio: 'inherit', shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
