import {readFile,readdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root='docs/design/profile-record',sizes=[[1440,900],[1440,650],[768,1024],[390,844],[320,844]],tabs=['experience','education','capabilities'];
const img=(file,label)=>`<figure><a href="${file}"><img loading="lazy" src="${file}" alt="${label}"></a><figcaption>${label}</figcaption></figure>`;
let body='<h1>Profile: working record with evidence</h1><p>Baseline bc957ee / PR #26. Roles and qualifications lead, dates remain grouped, and uncertainty stays readable. The portrait asset, frame, palette and normalized source records are preserved.</p><p><a href="source-basis.md">Source basis and scope</a> · <a href="artifact-validation.json">Decoded screenshot inventory</a> · <a href="delivery-files.json">Changed files</a> · <a href="../../../design-qa.md">Validation and remaining gaps</a></p><p>Windows Chrome with actual current public records, the original portrait and published CV. Tablet/phone sizes and reduced motion are browser emulation, not physical-device testing. Viewport captures retain the stated dimensions; complete captures extend the camera height to expose the entire inner scrolling record.</p>';
for(const [w,h]of sizes){
 body+=`<section><h2>${w}×${h}</h2>`;
 for(const tab of tabs){body+=`<h3>${tab==='education'?'Education & training':tab}</h3><div class="pair">`;for(const phase of ['before','after'])body+=img(`${phase}/${w}-${h}-${tab}-viewport.jpg`,`${phase} · ${tab} · original viewport`);body+='</div><details><summary>Complete records and reduced motion</summary><div class="pair">';for(const phase of ['before','after','reduced'])for(const kind of phase==='reduced'?['viewport','complete']:['complete'])body+=img(`${phase}/${w}-${h}-${tab}-${kind}.jpg`,`${phase} · ${tab} · ${kind}`);body+='</div></details>';}
 body+='<details><summary>All four expanded Experience entries and collapsed status</summary><div class="pair">';
 for(let i=0;i<4;i++)for(const phase of ['before','after','reduced'])body+=img(`${phase}/${w}-${h}-experience-${i}.jpg`,`${phase} · expanded entry ${i+1}`);
 for(const phase of ['before','after','reduced'])for(const kind of ['viewport','complete'])body+=img(`${phase}/${w}-${h}-experience-collapsed-${kind}.jpg`,`${phase} · collapsed entries · ${kind}`);
 body+='</div></details></section>';
}
body+='<section><h2>Actual capability evidence destinations</h2><p>Reached with keyboard Enter from the current Profile data. <a href="evidence-destinations.json">Navigation findings</a>.</p><div class="pair">';
for(const w of [1440,390,320])for(const key of ['ai-api-integration','django','supabase'])body+=img(`after/${w}-evidence-${key}.jpg`,`${w}px · ${key} engineering section`);
body+='</div></section>';
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Profile record review</title><style>body{max-width:1440px;margin:auto;padding:28px;background:#ecebe3;color:#242621;font:16px/1.6 system-ui}h1,h2,h3{line-height:1.25}h1{font-size:32px}h2{font-size:26px}h3{font-size:18px;text-transform:capitalize}section{border-top:1px solid #b9b9ae;margin-top:32px;padding-top:12px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}figure{margin:0;min-width:0}img{display:block;width:100%;height:auto}figcaption{font-size:14px;margin:8px 0 16px}details{border:1px solid #b9b9ae;margin-block:18px;padding:14px}summary{cursor:pointer;min-height:44px;font-weight:600}a{color:#34483d}a:focus-visible,summary:focus-visible{outline:2px solid #a05939;outline-offset:4px}@media(max-width:680px){body{padding:16px}.pair{grid-template-columns:1fr}}</style><body>${body}</body></html>`;
const images=[];
for(const file of (await readdir(root,{recursive:true})).filter(f=>f.endsWith('.jpg'))){const metadata=await sharp(path.join(root,file)).metadata();images.push({path:file.replaceAll('\\','/'),width:metadata.width,height:metadata.height,bytes:(await stat(path.join(root,file))).size});}
const references=[...html.matchAll(/(?:src|href)="([^"]+\.jpg)"/g)].map(x=>x[1]);for(const file of references)await stat(path.join(root,file));
for(const file of images)if(!references.includes(file.path))throw new Error(`Unlinked screenshot ${file.path}`);
const reports={};for(const phase of ['before','after','reduced']){const data=JSON.parse(await readFile(`${root}/${phase}/findings.json`,'utf8'));reports[phase]={viewports:data.findings.length,tabs:data.findings.flatMap(r=>r.tabs).length,expandedEntries:data.findings.flatMap(r=>r.entries).length,overflow:data.findings.some(r=>r.tabs.some(t=>t.overflow)),errors:data.findings.flatMap(r=>r.errors),writes:data.findings.flatMap(r=>r.writes),cv:data.findings.map(r=>r.cv)};}
const before=JSON.parse(await readFile(`${root}/before/findings.json`,'utf8')),after=JSON.parse(await readFile(`${root}/after/findings.json`,'utf8'));
for(let i=0;i<before.findings.length;i++){const a=before.findings[i].capabilities.competencies,b=after.findings[i].capabilities.competencies;if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('Competency inventory changed');}
await writeFile(`${root}/review.html`,html);
await writeFile(`${root}/artifact-validation.json`,JSON.stringify({images:images.length,htmlMediaReferences:references.length,competencyInventoryPreserved:true,reports,decodedImages:images},null,2)+'\n');
console.log(JSON.stringify({images:images.length,reports},null,2));
