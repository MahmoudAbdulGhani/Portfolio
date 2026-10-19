import { readFile, readdir, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const names = (await readdir('dist/assets')).filter(name => name.endsWith('.js'));
const scripts = await Promise.all(names.map(name => readFile(`dist/assets/${name}`, 'utf8')));
assert(!scripts.some(source => source.includes('"/review/profile-portrait"')), 'Normal build must exclude the review route');
await assert.rejects(access('dist/review/portrait-comparison/index.html'), 'Normal build must exclude comparison artifacts');
console.log('Normal compiled build excludes portrait review route and comparison artifacts.');
