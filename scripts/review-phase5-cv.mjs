import { readFile, writeFile, mkdir } from 'node:fs/promises';
process.env.CV_STATIC_ONLY='1';
const {generateCvPdfBuffer}=await import('../server/src/lib/cv.js');
const output='docs/design/phase5/local-cv';
await mkdir(output,{recursive:true});
const summary=await readFile('.motion-preview/phase5-real-summary.txt','utf8');
await writeFile(`${output}/tailored.pdf`,await generateCvPdfBuffer({mode:'application',tailor:{summary,projectSlugs:['jobpilot-ai','lobby']}}));
await writeFile(`${output}/standard.pdf`,await generateCvPdfBuffer({mode:'application'}));
await writeFile(`${output}/provenance.json`,JSON.stringify({date:new Date().toISOString(),environment:'Corrected local PDF generator, static fallback records. Tailored summary is the exact genuine production provider text extracted from the downloaded PDF; same two project slugs. No database or provider request. Production PDF remains the pre-fix observation.'},null,2)+'\n');
