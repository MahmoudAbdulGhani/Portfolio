from pathlib import Path
import json,math
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[2];out=root/'public/projects/cinematic/laptop'
data=json.loads((Path(__file__).parent/'model-data.json').read_text());pose=data['poses'][27]
cam=np.array(pose['camera']);target=np.array(pose['target']);fw=target-cam;fw/=np.linalg.norm(fw);rt=np.cross(fw,[0,1,0]);rt/=np.linalg.norm(rt);up=np.cross(rt,fw);view=np.stack([rt,up,fw],axis=1)
f=640/(2*math.tan(math.pi/9));screen=data['screen'];hinge=np.array(data['hinge']);a=pose['lidAngle'];c,s=math.cos(a),math.sin(a);rx=np.array([[1,0,0],[0,c,-s],[0,s,c]])
quad=[]
for x,y in [(-1,1),(1,1),(1,-1),(-1,-1)]:
 v=np.array([x*screen['screenWidth']/2,screen['screenY']+y*screen['screenHeight']/2,screen['screenZ']])@rx.T+hinge
 cv=(v-cam)@view;quad.append([512+cv[0]*f/cv[2],320-cv[1]*f/cv[2]])
source=[(0,0),(1024,0),(1024,607),(0,607)];A=[];b=[]
# PIL takes inverse mapping, output (plate) -> input (screen).
for (x,y),(u,v) in zip(quad,source):
 A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);b.extend([u,v])
coeff=np.linalg.solve(np.array(A),np.array(b))
paths={'jobpilot-ai':'projects/cinematic/jobpilot-screen.webp','lobby':'projects/lobby/cover.webp','gamezone-arena':'projects/gamezone-arena/cover.webp','construction-project-management-accounting-system':'projects/cinematic/cedar-screen.webp','unihub':'projects/unihub/usercourses.webp'}
for slug,path in paths.items():
 actual=Image.open(root/'public'/path).convert('RGBA');actual.thumbnail((1024,607),Image.Resampling.LANCZOS)
 plane=Image.new('RGBA',(1024,607),(8,13,21,255));plane.alpha_composite(actual,((1024-actual.width)//2,(607-actual.height)//2))
 projected=plane.transform((1024,640),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
 img=Image.open(out/'frame-27.webp').convert('RGBA');img.alpha_composite(projected);img.save(out/f'poster-{slug}.webp',quality=90,method=6)
 print(slug)
