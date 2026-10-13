import {readFile,writeFile,readdir,stat,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
const root='docs/design/collection-readiness';
await mkdir(root,{recursive:true});
const inventory=[];
const modes=['before','after','before-cold-paint','after-cold-paint','normal','reduced','fallback'];
for(const mode of modes){
 let files=[];try{files=await readdir(`${root}/${mode}`);}catch{continue;}
 for(const file of files){
  const path=`${mode}/${file}`,bytes=(await stat(`${root}/${path}`)).size;
  if(file.endsWith('.jpg')){const metadata=await sharp(`${root}/${path}`).metadata();inventory.push({path,bytes,width:metadata.width,height:metadata.height});}
  else if(file.endsWith('.webm'))inventory.push({path,bytes,type:'video/webm'});
 }
}
await writeFile(`${root}/artifact-validation.json`,JSON.stringify({inventory},null,2)+'\n');
const sections=modes.map(mode=>{
 const items=inventory.filter(i=>i.path.startsWith(`${mode}/`));
 const cameras=items.filter(i=>i.path.endsWith('.jpg')).map(i=>`<figure><a href="${i.path}"><img loading="lazy" src="${i.path}" alt="${i.path.replaceAll('-',' ')}"></a><figcaption>${i.path} · ${i.width}×${i.height}</figcaption></figure>`).join('');
 const videos=items.filter(i=>i.type).map(i=>`<figure><video controls preload="metadata" src="${i.path}"></video><figcaption><a href="${i.path}">${i.path}</a></figcaption></figure>`).join('');
 return `<section><h2>${mode}</h2><p><a href="${mode}/findings.json">Recorded state and geometry</a></p><div class="grid">${videos}${cameras}</div></section>`;
}).join('');
await writeFile(`${root}/review.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Collection readiness review</title><style>body{margin:0;padding:32px;background:#ecebe3;color:#293532;font:16px/1.6 system-ui}main{max-width:1400px;margin:auto}h1{font-size:32px}h2{border-top:1px solid #b8bbb2;padding-top:24px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px}figure{margin:0;min-width:0}img,video{display:block;max-width:100%;height:auto}video{width:100%;background:#ddd;max-height:720px}figcaption{font-size:13px;overflow-wrap:anywhere;margin:8px 0 24px}a{color:#334b3d}a:focus-visible{outline:3px solid #a44424;outline-offset:4px}</style><main><h1>Collection opening / readiness reliability</h1><p>The delayed-ready recordings withhold initialization notification by 4,200ms. The cold-paint recordings hold the first scene draw until 4,400ms after selection: the baseline starts its opening clock after that paint; the fix owns the paint with an already-running clock and retains WebGL. These are controlled browser fixtures, not physical GPU performance measurements. Original assets, proportions, controls and JobPilot's handoff remain.</p><p>Normal review verified Intel UHD hardware WebGL. Tablet/phone sizes, unavailable WebGL, reduced motion and visibility signals are browser emulation. Native page freezing was also tested through Chromium's lifecycle API. No physical-device tests, application writes or deployment.</p><p><a href="artifact-validation.json">Decoded artifact inventory</a> · <a href="ci-opening-summary.json">Original CI trace summary</a> · <a href="diagnostic-timings.json">Temporary lifecycle timings</a> · <a href="native-lifecycle.json">Native freezing recovery</a></p>${sections}</main></html>`);
console.log(JSON.stringify({screenshots:inventory.filter(i=>i.width).length,recordings:inventory.filter(i=>i.type).length}));
