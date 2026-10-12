import {readFile,readdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root='docs/design/lobby-engineering';
const sizes=[[1440,900],[1440,650],[1363,936],[768,1024],[390,844],[320,844]];
const modes=['after','reduced','fallback'];
const states=['inspect','denied','joined','allowed','blocked-participant','rejected','blocked-call','reset'];
const img=(file,label)=>`<figure><a href="${file}"><img src="${file}" loading="lazy" alt="${label}"></a><figcaption>${label}</figcaption></figure>`;
let body='<h1>Lobby: connection and access</h1><p>Baseline 76f7575 · source 2c8b1d3. An invitation offers a connection; membership and call access are separate checks. The original ribbon photograph remains fixed.</p><p><a href="source-basis.md">Source basis, attribution and teaching assumptions</a> · <a href="artifact-validation.json">Decoded artifact inventory</a> · <a href="delivery-files.json">Changed files</a> · <a href="../../../design-qa.md">Validation and remaining gaps</a></p><p>Windows Chrome on actual Intel UHD / ANGLE / D3D11 WebGL for normal openings. Phone/tablet sizes, reduced motion and unavailable-WebGL fallback are browser emulation. No physical-device testing. The sample makes no Lobby network or media calls.</p><h2>Complete interaction recordings</h2><p>Both screenshot choices, denied attempt, successful membership change, explicit permitted reattempt, blocked participant, rejected join, denied call and Reset; closing restores Collection focus.</p><div class="pair">';
for(const [w,h]of [[1440,900],[390,844]])body+=`<figure><video controls preload="metadata" src="after/${w}-${h}-interaction.webm"></video><figcaption>${w}×${h} · ${w===390?'phone browser emulation':'desktop, actual GPU opening'} · complete sequence</figcaption></figure>`;
body+='</div>';
for(const [w,h]of sizes){
 body+=`<section><h2>${w}×${h}</h2><h3>Collection screenshot and normal-flow controls</h3><div class="grid">`;
 for(let choice=0;choice<2;choice++)for(const phase of ['before',...modes])body+=img(`${phase}/${w}-${h}-${choice}-selected.jpg`,`${phase} · ${choice===0?'Friends directory':'Audio room and chat'}`);
 body+='</div>';
 for(let choice=0;choice<2;choice++){
  body+=`<details><summary>Every demonstration state · ${choice===0?'Friends directory':'Audio room and chat'}</summary>`;
  for(const state of states){body+=`<h3>${state.replaceAll('-',' ')}</h3><div class="grid modes">`;for(const mode of modes)body+=img(`${mode}/${w}-${h}-${choice}-${state}.jpg`,`${mode==='after'?'Normal motion':mode} · ${state}`);body+='</div>';}
  body+='</details>';
 }
 body+=`<details><summary>Shared case-study reader · before and every principal outcome</summary>${img(`before/${w}-${h}-reader.jpg`,'Before · existing engineering discussion')}`;
 for(const state of ['inspect','denied','joined','allowed','rejected']){body+=`<h3>${state}</h3><div class="grid">`;for(const mode of modes)for(const part of ['heading','controls'])body+=img(`${mode}/${w}-${h}-reader-${state}-${part}.jpg`,`${mode} · ${state} · ${part}`);body+='</div>';}
 body+='</details><details><summary>All six exposed Collection choices · actual assets</summary><div class="grid">';
 for(const kind of ['jobpilot','cedar','lobby'])for(let choice=0;choice<2;choice++)body+=img(`all-previews/after/${w}-${h}-${kind}-${choice}.jpg`,`${kind} · selection ${choice+1} · complete source`);
 body+='</div></details></section>';
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lobby engineering review</title><style>body{margin:0 auto;max-width:1440px;padding:28px;background:#ecebe3;color:#242621;font:16px/1.6 system-ui}h1,h2,h3{line-height:1.25}h1{font-size:32px}h2{font-size:26px}h3{font-size:18px}a{color:#34483d}section{border-top:1px solid #b9b9ae;margin-top:32px;padding-top:12px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.modes{grid-template-columns:repeat(3,minmax(0,1fr))}.pair{display:grid;grid-template-columns:2fr 1fr;gap:20px}figure{margin:0;min-width:0}img,video{display:block;width:100%;height:auto;background:#e4e5db}video{max-height:650px}figcaption{font-size:14px;margin:8px 0 16px}details{margin-block:18px;border:1px solid #b9b9ae;padding:14px}summary{cursor:pointer;min-height:44px;font-weight:600}a:focus-visible,summary:focus-visible{outline:2px solid #a05939;outline-offset:4px}@media(max-width:680px){body{padding:16px}.grid,.modes,.pair{grid-template-columns:1fr}}</style><body>${body}</body></html>`;
await writeFile(`${root}/review.html`,html);
const images=[];
for(const file of (await readdir(root,{recursive:true})).filter(f=>f.endsWith('.jpg'))){const metadata=await sharp(path.join(root,file)).metadata();images.push({path:file.replaceAll('\\','/'),width:metadata.width,height:metadata.height,bytes:(await stat(path.join(root,file))).size});}
const references=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(x=>x[1]).filter(x=>x.endsWith('.jpg')||x.endsWith('.webm'));
for(const file of references)await stat(path.join(root,file));
const videos=[];for(const [w,h]of [[1440,900],[390,844]]){const file=`after/${w}-${h}-interaction.webm`,bytes=await readFile(path.join(root,file));if(bytes.subarray(0,4).toString('hex')!=='1a45dfa3')throw new Error('Invalid WebM');videos.push({path:file,bytes:bytes.length});}
const reports={};for(const mode of ['before',...modes]){const data=JSON.parse(await readFile(`${root}/${mode}/findings.json`,'utf8'));reports[mode]={reviewedSelections:data.findings.length,overlap:data.findings.some(r=>r.geometry.imageBottom>r.geometry.captionTop||r.geometry.imageBottom>r.geometry.controlsTop),overflow:data.findings.some(r=>r.geometry.overflow),errors:data.findings.flatMap(r=>r.errors)};}
await writeFile(`${root}/artifact-validation.json`,JSON.stringify({images:images.length,htmlMediaReferences:references.length,videos,reports,decodedImages:images},null,2)+'\n');
console.log(JSON.stringify({images:images.length,htmlMediaReferences:references.length,videos,reports},null,2));
