"""Offline CPU rendering of the exact original Three.js mesh. No reference tracing.
Requires NumPy and Pillow. Rendered frames share the GPU rig/camera/geometry.
"""
import json,math,time
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter
root=Path(__file__).resolve().parents[2]
data=json.loads((Path(__file__).parent/'model-data.json').read_text())
W,H=1280,800
out=root/'public/projects/cinematic/laptop';out.mkdir(parents=True,exist_ok=True)
meshes=[dict(m,v=np.array(m['vertices'],float),n=np.array(m['normals'],float),ix=np.array(m['indices']).reshape(-1,3)) for m in data['meshes']]
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def rotate(v,a,axis):
 c,s=math.cos(a),math.sin(a)
 mat=np.array([[1,0,0],[0,c,-s],[0,s,c]]) if axis==0 else np.array([[c,0,s],[0,1,0],[-s,0,c]])
 return v@mat.T
for frame,pose in enumerate(data['poses']):
 start=time.time();cam=np.array(pose['camera']);target=np.array(pose['target']);forward=(target-cam);forward/=np.linalg.norm(forward)
 right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward)
 view=np.stack([right,up,forward],axis=1);f=H/(2*math.tan(math.pi/9))
 def project(v):
  cv=(v-cam)@view;return np.column_stack([W/2+cv[:,0]*f/cv[:,2],H/2-cv[:,1]*f/cv[:,2],cv[:,2]])
 pixels=np.zeros((H,W,4),np.uint8);depth=np.full((H,W),np.inf)
 hinge=np.array(data['hinge'])
 for m in meshes:
  v=m['v'].copy();n=m['n'].copy()
  if m['lid']:v=rotate(v-hinge,pose['lidAngle'],0)+hinge;n=rotate(n,pose['lidAngle'],0)
  v=rotate(v,pose['rotation'],1);n=rotate(n,pose['rotation'],1)
  proj=project(v);camdir=cam-v;camdir/=np.linalg.norm(camdir,axis=1)[:,None]
  base=np.array(m['color']);rough=m['roughness'];metal=m['metalness']
  # Broad studio sources, hemispheric fill, subtle metal reflections.
  rgb=np.tile(base*.28,(len(v),1))
  for pos,col,power in [([-4,6,5],[.82,.9,1],1.0),([5,3,-3],[1,.74,.43],.75),([0,5,-4],[.77,.86,1],.5)]:
   light=np.array(pos)-v;light/=np.linalg.norm(light,axis=1)[:,None]
   ndl=np.maximum(0,(n*light).sum(1));half=light+camdir;half/=np.linalg.norm(half,axis=1)[:,None]
   spec=np.maximum(0,(n*half).sum(1))**(12+40*(1-rough))
   rgb+=base[None,:]*ndl[:,None]*np.array(col)*power*.72
   rgb+=spec[:,None]*np.array(col)*power*(.14+.36*metal)
  rgb=np.clip(rgb,0,1)**(1/2.2)*255
  for tri in m['ix']:
   a,b,c=proj[tri];det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
   if abs(det)<.13:continue
   if np.dot(np.cross(v[tri[1]]-v[tri[0]],v[tri[2]]-v[tri[0]]),cam-v[tri[0]])<=0:continue
   x0=max(0,int(min(a[0],b[0],c[0])));x1=min(W-1,math.ceil(max(a[0],b[0],c[0])))
   y0=max(0,int(min(a[1],b[1],c[1])));y1=min(H-1,math.ceil(max(a[1],b[1],c[1])))
   if x1<x0 or y1<y0:continue
   yy,xx=np.mgrid[y0:y1+1,x0:x1+1];xx=xx+.5;yy=yy+.5
   wa=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/det
   wb=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/det;wc=1-wa-wb
   iz=wa/a[2]+wb/b[2]+wc/c[2];z=1/np.maximum(iz,1e-8)
   inside=(wa>=-.0001)&(wb>=-.0001)&(wc>=-.0001)&(z<depth[y0:y1+1,x0:x1+1])
   if not inside.any():continue
   color=(wa[:,:,None]*rgb[tri[0]]/a[2]+wb[:,:,None]*rgb[tri[1]]/b[2]+wc[:,:,None]*rgb[tri[2]]/c[2])/iz[:,:,None]
   region=pixels[y0:y1+1,x0:x1+1];region[inside,:3]=np.clip(color[inside],0,255).astype(np.uint8);region[inside,3]=255;depth[y0:y1+1,x0:x1+1][inside]=z[inside]
 im=Image.fromarray(pixels);draw=ImageDraw.Draw(im)
 for label in data['labels']:
  v=rotate(np.array([label['position']]),pose['rotation'],1);p=project(v)[0];x,y,z=p
  if not (0<=x<W and 0<=y<H) or z>depth[int(y),int(x)]+.014:continue
  sz=max(4,int(label['size']*f/z));ft=ImageFont.truetype(font,sz)
  draw.text((x,y),label['text'],font=ft,fill=(146,155,168,235),anchor='mm')
 # Soft studio contact shadow rendered into the same transparent asset.
 shadow=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shadow);ground=project(np.array([[0,-.1,.45]]))[0]
 sd.ellipse((ground[0]-280,ground[1]-12,ground[0]+280,ground[1]+28),fill=(0,0,0,95));shadow=shadow.filter(ImageFilter.GaussianBlur(24));shadow.alpha_composite(im)
 shadow.resize((1024,640),Image.Resampling.LANCZOS).save(out/f'frame-{frame:02}.webp',quality=88,method=4)
 print(f'{frame:02}: {time.time()-start:.1f}s',flush=True)
(out/'asset-manifest.json').write_text(json.dumps({'author':'Original portfolio model authored for this project','geometry':'src/lib/laptop-model.ts','renderer':'scripts/laptop-assets/render-frames.py','frameCount':len(data['poses']),'width':1024,'height':640,'aspect':1.6,'triangles':sum(len(m['indices'])//3 for m in data['meshes'])},indent=2))
