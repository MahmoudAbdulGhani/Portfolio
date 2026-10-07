from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parents[2];out=root/'public/projects/cinematic/laptop'
manifest=json.loads((out/'asset-manifest.json').read_text());count=manifest['frameCount']
for group in range((count+7)//8):
 atlas=Image.new('RGBA',(2816,880))
 for slot in range(8):
  i=group*8+slot
  if i>=count:break
  frame=Image.open(out/f'frame-{i:02}.webp').convert('RGBA').resize((704,440),Image.Resampling.LANCZOS)
  atlas.alpha_composite(frame,((slot%4)*704,(slot//4)*440))
 atlas.save(out/f'atlas-{group}.webp',quality=90,method=6)
manifest.update({'atlasCount':(count+7)//8,'framesPerAtlas':8,'frameWidth':704,'frameHeight':440,'frameSource':'46 offline rendered poses packed into six atlases; at most two cached during fallback playback'})
(out/'asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print('Atlases packed:',(count+7)//8)
