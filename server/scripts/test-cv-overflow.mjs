// Static PDF regression: inspect rendered text boxes, never query a database.
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
process.env.CV_STATIC_ONLY = '1';
const { generateCvPdfBuffer } = await import('../src/lib/cv.js');
const directory = await mkdtemp(join(tmpdir(),'portfolio-cv-overflow-'));
try {
  const summary = 'This summary describes React, TypeScript and validated API work, distinguishing personal contributions from collaborative delivery. Training dates do not verify completion or an earned certification. '.repeat(3).trim();
  const buffer = await generateCvPdfBuffer({mode:'application',tailor:{summary}});
  await writeFile(join(directory,'long-summary.pdf'),buffer);
  const result = spawnSync('python',['scripts/verify-cv-overflow.py',join(directory,'long-summary.pdf'),summary],{encoding:'utf8'});
  if(result.status!==0) throw new Error(result.stdout+result.stderr);
  console.log(result.stdout.trim());
} finally {
  if(resolve(directory).startsWith(resolve(tmpdir())+'\\portfolio-cv-overflow-') || resolve(directory).startsWith(resolve(tmpdir())+'/portfolio-cv-overflow-')) await rm(directory,{recursive:true,force:true});
}
