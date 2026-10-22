import {execFileSync} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const ff=process.env.PROFILE_REVIEW_FFMPEG??'.motion-preview/speaking-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe',out='docs/design/profile-still-body';
await mkdir(out,{recursive:true});await mkdir('.motion-preview/still-frames',{recursive:true});
const results=[];
for(const size of [480,720]){
 const input=`public/media/profile/mahmoud-introduction-${size}.webm`;
 const pcm=execFileSync(ff,['-v','error','-i',input,'-map','0:a:0','-f','s16le','-acodec','pcm_s16le','-'],{maxBuffer:10e6});
 const frames=execFileSync(ff,['-v','error','-c:v','libvpx-vp9','-i',input,'-map','0:v:0','-f','framemd5','-'],{maxBuffer:10e6}).toString().split('\n').filter(l=>l&&!l.startsWith('#'));
 results.push({size,bytes:(await readFile(input)).length,sha256:createHash('sha256').update(await readFile(input)).digest('hex'),pcmSha256:createHash('sha256').update(pcm).digest('hex'),pcmBytes:pcm.length,frames:frames.length});
}
for(const time of [0,.04,.32,3.12,8.88,11.64,11.96]){
 const file=`.motion-preview/still-frames/${time}.png`;
 execFileSync(ff,['-v','error','-c:v','libvpx-vp9','-i','public/media/profile/mahmoud-introduction-720.webm','-ss',String(time),'-frames:v','1','-pix_fmt','rgba','-y',file]);
 const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
 results.push({time,width:info.width,height:info.height,channels:info.channels,cornerAlpha:[data[3],data[(info.width-1)*4+3]]});
 if([3.12,8.88].includes(time)){
  const panels=[];for(const [i,bg]of ['#ecebe3','#ffffff','#242624'].entries())panels.push({input:await sharp(file).resize({height:636}).flatten({background:bg}).png().toBuffer(),left:i*360,top:0});
  await sharp({create:{width:1080,height:636,channels:3,background:'#fff'}}).composite(panels).jpeg({quality:95}).toFile(`${out}/edges-${time}.jpg`);
 }
}
const contacts=[];for(const [i,time]of [11.64,11.96,0,.04,.32].entries())contacts.push({input:await sharp(`.motion-preview/still-frames/${time}.png`).resize({height:480}).flatten({background:'#ecebe3'}).jpeg().toBuffer(),left:i*272,top:0});
await sharp({create:{width:1360,height:480,channels:3,background:'#ecebe3'}}).composite(contacts).jpeg({quality:94}).toFile(`${out}/boundary.jpg`);
await writeFile(`${out}/asset-verification.json`,JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));
