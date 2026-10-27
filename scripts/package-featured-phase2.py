"""Package intentional review evidence, without frontend runtime dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from html.parser import HTMLParser
import hashlib
import json
import subprocess
import re

root = Path('docs/design/featured-phase2').resolve()
for p in root.rglob('page@*.webm'):
    assert p.resolve().is_relative_to(root)
    p.unlink()  # Abandoned individual recordings from failed capture attempts.
for p in root.glob('*/index.html'):
    text = p.read_text(encoding='utf-8')
    text = re.sub(r'<a href="[^"]+">Original PR #50 baseline</a>', '', text)
    text = text.replace('href="review-report.md"', 'href="../review-report.md"').replace('href="comparison.zip"', 'href="../comparison.zip"')
    text = text.replace('Native browser video includes the whole opening and a short review/accept/return walkthrough.', 'Native browser video includes opening, screen change, reader entry, project-specific rejection/outdated state, explicit recovery, Reset and return.')
    p.write_text(text, encoding='utf-8', newline='\n')
changed = subprocess.check_output(['git','diff','--name-only','c4f18c73a0184e8304327afcf80c22279b0f1bca'], text=True).splitlines()
untracked = subprocess.check_output(['git','ls-files','--others','--exclude-standard'], text=True).splitlines()
names = sorted(set(changed + untracked + ['docs/design/featured-phase2/'+n for n in ['changed-files.txt','artifact-hashes.json','comparison.zip']]) - {'Codex_Engineered_Landscape_Handoff.md'})
(root/'changed-files.txt').write_text('\n'.join(names)+'\n',encoding='utf-8',newline='\n')
for p in root.rglob('*'):
    if p.is_file() and p.suffix in ('.json','.md','.html','.txt'):
        p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, _tag, attrs):
        self.links += [v for k,v in attrs if k in ('src','href') and v and not v.startswith(('/','#','http'))]
count = 0
for html in root.rglob('*.html'):
    parser = Links();parser.feed(html.read_text(encoding='utf-8'))
    for link in parser.links:
        if link.endswith('comparison.zip'): continue
        assert (html.parent/link).is_file(), (html,link)
        count += 1
files = sorted(p for p in root.rglob('*') if p.is_file() and p.name not in ('comparison.zip','artifact-hashes.json'))
(root/'artifact-hashes.json').write_text(json.dumps({p.relative_to(root).as_posix():{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files},indent=2),encoding='utf-8',newline='\n')
with ZipFile(root/'comparison.zip','w',compression=ZIP_DEFLATED) as archive:
    for p in sorted(root.rglob('*')):
        if p.is_file() and p.name != 'comparison.zip': archive.write(p,p.relative_to(root))
with ZipFile(root/'comparison.zip') as archive:
    assert archive.testzip() is None
print(json.dumps({'files':len(files),'linksChecked':count,'zipBytes':(root/'comparison.zip').stat().st_size}))
