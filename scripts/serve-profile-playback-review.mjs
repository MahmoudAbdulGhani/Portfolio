// Local compiled-build review only. Uses saved public GET fixtures; never
// forwards a request to the live CMS/database or accepts a mutation.
import {preview} from 'vite';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const fixtures=process.env.PROFILE_REVIEW_FIXTURES??'.motion-preview';
const content=JSON.parse(await readFile(resolve(fixtures,'public-content.json'),'utf8'));
const cv=await readFile(resolve(fixtures,'public-cv.pdf'));
const port=Number(process.env.PROFILE_REVIEW_PORT??5196);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local review port');
const server=await preview({build:{outDir:process.env.PROFILE_REVIEW_DIST??'dist'},preview:{host:'127.0.0.1',port,strictPort:true}});
// Keep Vite's native range requests, ETags and browser HTTP cache. Playwright
// page.route disables HTTP cache and would invalidate a cold/warm comparison.
server.middlewares.stack.unshift({route:'',handle(req,res,next){
  if(!req.url.startsWith('/api/'))return next();
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  const path=new URL(req.url,'http://127.0.0.1').pathname;
  res.setHeader('Cache-Control','no-store');
  if(path==='/api/cv.pdf'){res.setHeader('Content-Type','application/pdf');return res.end(req.method==='HEAD'?undefined:cv);}
  const data=content[path]??content['/api/projects']?.find(p=>path===`/api/projects/${p.slug}`);
  res.writeHead(data?200:404,{'Content-Type':'application/json'});
  res.end(req.method==='HEAD'?undefined:JSON.stringify(data??{}));
}});
console.log(`Compiled Profile with frozen read-only GET fixtures: http://127.0.0.1:${port}`);
