"""Package intentional review artifacts; no frontend processing dependency."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from html.parser import HTMLParser
import hashlib
import json
import subprocess
import sys

adoption = '--adoption' in sys.argv
root = Path('docs/design/jobpilot-phase1-adoption' if adoption else 'docs/design/jobpilot-phase1-refinement')
base = '9f048b0d321153bee4f0dfc7defb6bc08da888da' if adoption else 'a7b9c800d63f337b79ec7d6904ece544938732bf'
changed = subprocess.check_output(['git', 'diff', '--name-only', base], text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], text=True).splitlines()
names = sorted(set(changed + untracked + [str(root / name).replace('\\', '/') for name in ['changed-files.txt', 'artifact-hashes.json', 'comparison.zip']]) - {'Codex_Engineered_Landscape_Handoff.md'})
(root / 'changed-files.txt').write_text('\n'.join(names) + '\n', encoding='utf8', newline='\n')
if adoption:
    for p in root.rglob('*'):
        if p.is_file() and p.suffix in ('.json', '.md', '.html', '.txt'):
            p.write_bytes(p.read_bytes().replace(b'\r\n', b'\n'))

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, _tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value and not value.startswith(('/', '#', 'http')):
                self.links.append(value)

parser = Links()
parser.feed((root / 'index.html').read_text(encoding='utf8'))
missing = [link for link in parser.links if link != 'comparison.zip' and not (root / link).is_file()]
if missing:
    raise ValueError(f'Missing review resources: {missing}')
files = sorted(p for p in root.rglob('*') if p.is_file() and p.name not in ('comparison.zip', 'artifact-hashes.json'))
(root / 'artifact-hashes.json').write_text(json.dumps({str(p.relative_to(root)).replace('\\', '/'): {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files}, indent=2), encoding='utf8', newline='\n')
with ZipFile(root / 'comparison.zip', 'w', compression=ZIP_DEFLATED) as archive:
    for p in sorted(root.rglob('*')):
        if p.is_file() and p.name != 'comparison.zip':
            archive.write(p, p.relative_to(root))
with ZipFile(root / 'comparison.zip') as archive:
    if archive.testzip() is not None:
        raise ValueError('Review ZIP CRC check failed')
print(json.dumps({'files': len(files), 'linksChecked': len(parser.links), 'zipBytes': (root / 'comparison.zip').stat().st_size}))
