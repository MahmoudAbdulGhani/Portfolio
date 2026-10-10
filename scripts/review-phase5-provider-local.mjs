// Genuine provider, current local routes, fail-closed in-memory public snapshot.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import dotenv from 'dotenv';
import {snapshotPrisma,serve} from '../server/test/helpers/snapshot-api.mjs';
if(!process.argv.includes('--live'))throw new Error('Explicit --live required');
dotenv.config({path:'server/.env',quiet:true});
if(!process.env.GEMINI_API_KEY)throw new Error('Provider unavailable');
process.env.NODE_ENV='test';
globalThis.__portfolioPrisma=snapshotPrisma(JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'))).prisma;
const {default:app}=await import('../server/src/app.js');
const api=await serve(app),findings=[];
try{
 for(const question of ['What qualification status can a recruiter actually establish for the AWS program and Digital Hub from this portfolio? Include dates and the limits of the available evidence.','Does an absent AWS credential verification prove that Mahmoud never earned a certificate or failed to finish the program? Explain the evidentiary distinction.']){
  const response=await api.post('/api/assistant',{question});
  findings.push({question,status:response.status,...JSON.parse(response.body)});
 }
 const jobDescription='We need a full-stack developer who works with React, TypeScript, validated APIs and SQL databases in collaborative teams. AWS certification is optional. Describe the strongest relevant project evidence, individual contribution boundaries, and qualifications that still need recruiter verification.';
 const response=await api.post('/api/job-match',{jobDescription});
 const {result,message}=JSON.parse(response.body);
 findings.push({jobDescription,status:response.status,result,message});
}finally{await api.close();delete globalThis.__portfolioPrisma;}
await mkdir('docs/design/phase5/local-provider',{recursive:true});
await writeFile('docs/design/phase5/local-provider/findings.json',JSON.stringify({date:new Date().toISOString(),environment:'Real configured Gemini provider through corrected local Express routes; frozen public snapshot; Prisma reads/rate limits are fail-closed in memory. Not deployed production answers. No DB writes. Signed export token intentionally excluded.',findings},null,2)+'\n');
console.log(JSON.stringify(findings,null,2));
if(findings.some(x=>x.status!==200))process.exitCode=1;
