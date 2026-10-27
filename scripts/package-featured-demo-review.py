"""Validate and package only the focused introduction review artifacts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from html.parser import HTMLParser
import hashlib
import json
import subprocess

root=Path('docs/design/featured-demo-introductions')
changed=subprocess.check_output(['git','diff','--name-only','99b9a99628cc60d0a819da1811773089d258bc1d'],text=True).splitlines()
untracked=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()
names=sorted(set(changed+untracked+[str(root/name).replace('\\','/') for name in ['changed-files.txt','artifact-hashes.json','comparison.zip']])-{'Codex_Engineered_Landscape_Handoff.md'})
(root/'changed-files.txt').write_text('\n'.join(names)+'\n',encoding='utf-8',newline='\n')
for p in root.rglob('*'):
    if p.is_file() and p.suffix in ['.json','.md','.html','.txt']:
        p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))
class Links(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[]
    def handle_starttag(self,_tag,attrs):
        self.links += [v for k,v in attrs if k in ['src','href'] and v and not v.startswith(('/','#','http'))]
parser=Links();parser.feed((root/'index.html').read_text(encoding='utf-8'))
for link in parser.links:
    if link != 'comparison.zip': assert (root/link).is_file(),link
files=sorted(p for p in root.rglob('*') if p.is_file() and p.name not in ['comparison.zip','artifact-hashes.json'])
(root/'artifact-hashes.json').write_text(json.dumps({p.relative_to(root).as_posix():{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files},indent=2),encoding='utf-8',newline='\n')
with ZipFile(root/'comparison.zip','w',compression=ZIP_DEFLATED) as archive:
    for p in sorted(root.rglob('*')):
        if p.is_file() and p.name != 'comparison.zip': archive.write(p,p.relative_to(root))
with ZipFile(root/'comparison.zip') as archive: assert archive.testzip() is None
print(json.dumps({'files':len(files),'linksChecked':len(parser.links),'zipBytes':(root/'comparison.zip').stat().st_size}))
