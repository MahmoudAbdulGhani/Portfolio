"""Build an offline, public comparison without copying it into normal builds."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from html.parser import HTMLParser
import hashlib
import json
import subprocess

root=Path('docs/design/featured-adoption')
sizes=[(320,844),(390,844),(430,844),(768,1024),(1280,720),(1440,900)]
steps={'preview':'Selected preview','preview-screen-2':'Second complete image','reader':'Reader opening','demo-preview':'Preview demonstration','demo-reader':'Reader demonstration'}
style='body{font:16px/1.6 system-ui;margin:32px auto;padding:0 24px;max-width:1480px;color:#202629;background:#ecebe3}h1{font-size:36px;line-height:1.2;font-weight:500}a{color:#34483d}nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin:24px 0}a,select{min-height:44px}section{border-top:1px solid #c8c6bc;margin-top:32px;padding-top:24px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0;min-width:0}figcaption{font-size:14px;margin:8px 0}img,video{width:100%;height:auto;display:block}select{font:inherit;padding:8px}video{max-height:760px;background:#202629}@media(max-width:680px){.pair{grid-template-columns:1fr}}'
html=[f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Cedar and Lobby adoption</title><style>{style}</style><h1>Cedar and Lobby · approved versus adopted</h1>',
'<p>Immutable PR #55 / 92842e23f42b5a6aae4606d775b781339de2d1bc review candidates compared with the normal compiled routes. No review flag is needed for the adopted presentation.</p>',
'<nav><a href="review-report.md">Findings and limits</a><a href="changed-files.txt">Changed files</a><a href="adoption-comparison.json">48 parity checks</a><a href="comparison.zip" download>Download comparison and recordings</a></nav>',
'<p>Windows Chrome viewport emulation, archived read-only public records and genuine project images. Not physical-device testing or a fresh CMS audit. Real WebGL, readiness recovery, reduced motion and denied WebGL are labelled separately. Hosted verification may require Vercel sign-in; protection remains unchanged.</p>',
'<label for="size">Viewport </label><select id="size">'+''.join(f'<option value="{w}"'+(' selected' if w==390 else '')+f'>{w} × {h}</option>' for w,h in sizes)+'</select>']
for kind in ['cedar','lobby']:
    html.append(f'<section><h2>{kind.title()}</h2>')
    for w,h in sizes:
        html.append(f'<div data-size="{w}"><h3>{w} × {h}</h3>')
        for step,label in steps.items():
            html.append(f'<h4>{label}</h4><div class="pair">')
            for phase,title in [('approved','Approved PR #55'),('adopted','Adopted normal route')]:
                src=f'{kind}/{phase}/normal/{w}-{h}-{step}.jpg'
                html.append(f'<figure><figcaption>{title}</figcaption><a href="{src}"><img loading="lazy" src="{src}" alt="{kind}, {title}, {label}, {w} by {h}"></a></figure>')
            html.append(f'</div><a href="{kind}/comparison-{w}-{step}.jpg">Combined comparison image</a>')
        state='outdated' if kind=='cedar' else 'rejected'
        html.append('<nav>'+''.join(f'<a href="{kind}/adopted/normal/{w}-{h}-{s}.jpg">{s.title()} state</a>' for s in [state,'result','return'])+'</nav></div>')
    html.append('<h3>Phone and desktop journeys</h3>')
    mode='prepared' if kind=='cedar' else 'normal'
    if kind=='cedar':html.append('<p>Cedar recordings below are controlled framing passes: original images were decoded and the existing keyboard-focus module warm-up ran before selection. Cold arrival also exercised the unchanged readiness recovery. These are not cold-load performance measurements.</p>')
    for w in [390,1440]:
        html.append(f'<h4>{w}px journey</h4><div class="pair">')
        for phase,title in [('approved','Approved PR #55'),('adopted','Adopted normal route')]:
            src=f'{kind}/{phase}/{mode}/{w}-journey.webm'
            html.append(f'<figure><figcaption>{title}</figcaption><video controls playsinline preload="metadata" src="{src}"></video><nav><a href="{src}" download>Download recording</a><a href="{kind}/transitions/{phase}-{w}-opening-sheet.jpg">Opening samples</a></nav></figure>')
        html.append('</div>')
    html.append('<details><summary>Enlarged text, reduced motion and photographic fallback</summary>')
    for place in ['preview','reader']:
        for w,h in sizes[:4]:
            html.append(f'<h4>{place.title()} · {w}px · 200% demo text</h4><div class="pair">')
            for phase in ['approved','adopted']:
                src=f'text/{phase}/{kind}/{place}/{w}-{h}-text-200.jpg'
                html.append(f'<figure><figcaption>{phase.title()}</figcaption><a href="{src}"><img loading="lazy" src="{src}" alt="{kind} {place}, {phase}, {w}px, demo text enlarged to 200 percent"></a></figure>')
            html.append('</div>')
    for mode in ['reduced','fallback']:
        html.append(f'<h4>Adopted · {mode} · 390px</h4><div class="pair">')
        for step in ['preview','demo-reader']:
            src=f'{kind}/adopted/{mode}/390-844-{step}.jpg'
            html.append(f'<figure><figcaption>{steps[step]}</figcaption><a href="{src}"><img loading="lazy" src="{src}" alt="{kind}, {mode}, {steps[step]}"></a></figure>')
        html.append('</div>')
    html.append('</details></section>')
html.append('<script>const select=document.getElementById("size");function show(){document.querySelectorAll("[data-size]").forEach(s=>s.hidden=s.dataset.size!==select.value)}select.addEventListener("change",show);show()</script></html>')
(root/'index.html').write_text('\n'.join(html),encoding='utf-8',newline='\n')
changed=subprocess.check_output(['git','diff','--name-only','92842e23f42b5a6aae4606d775b781339de2d1bc'],text=True).splitlines()
untracked=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()
names=sorted(set(changed+untracked+[str(root/name).replace('\\','/') for name in ['changed-files.txt','artifact-hashes.json','comparison.zip']])-{'Codex_Engineered_Landscape_Handoff.md'})
(root/'changed-files.txt').write_text('\n'.join(names)+'\n',encoding='utf-8',newline='\n')
for p in root.rglob('*'):
    if p.is_file() and p.suffix in ['.json','.md','.html','.txt']:p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,_tag,attrs):self.links += [v for k,v in attrs if k in ['src','href'] and v and not v.startswith(('/','#','http'))]
parser=Links();parser.feed((root/'index.html').read_text(encoding='utf-8'))
for link in parser.links:
    if link!='comparison.zip':assert (root/link).is_file(),link
files=sorted(p for p in root.rglob('*') if p.is_file() and p.name not in ['comparison.zip','artifact-hashes.json'])
(root/'artifact-hashes.json').write_text(json.dumps({p.relative_to(root).as_posix():{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files},indent=2),encoding='utf-8',newline='\n')
with ZipFile(root/'comparison.zip','w',compression=ZIP_DEFLATED) as archive:
    for p in sorted(root.rglob('*')):
        if p.is_file() and p.name!='comparison.zip':archive.write(p,p.relative_to(root))
with ZipFile(root/'comparison.zip') as archive:assert archive.testzip() is None
print(json.dumps({'files':len(files),'linksChecked':len(parser.links),'zipBytes':(root/'comparison.zip').stat().st_size}))
