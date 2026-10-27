"""Build matched review images/HTML and measured typography findings."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
from html import escape

root=Path('docs/design/featured-demo-introductions')
before=json.loads((root/'before/findings.json').read_text(encoding='utf-8'))['results']
after=json.loads((root/'after/findings.json').read_text(encoding='utf-8'))['results']
summary=[]
for row in after:
    old=next(x for x in before if all(x[k]==row[k] for k in ['kind','place','width','height','state']))
    m=row['metrics'];b=old['metrics'];a=m['steps'];tops=[i['box']['top'] for i in a]
    orientation='row' if max(tops)-min(tops)<1 else 'column' if a[0]['box']['bottom']<=a[1]['box']['top'] and a[1]['box']['bottom']<=a[2]['box']['top'] else 'uneven'
    summary.append({**{k:row[k] for k in ['kind','place','width','state','scale']},'orientation':orientation,'clippedStep':any(s['overflow'] for s in a),'pageOverflow':m['pageOverflow'],'headingFont':m['headingFont'],'labelFont':m['labelFont'],'firstControlEarlierBy':round(b['control']['top']-m['control']['top'],2),'bodyFontUnchanged':b['bodyFont']==m['bodyFont'],'controlFontUnchanged':b['controlFont']==m['controlFont'],'desktopControlGeometryUnchanged':all(abs(b['control'][k]-m['control'][k])<.1 for k in ['left','width']) if row['width']>=768 else None})
    if row['state'] in ['initial','text-200']:
        w,h=row['width'],row['height'];canvas=Image.new('RGB',(w*2+16,h+32),'#ecebe3');draw=ImageDraw.Draw(canvas)
        draw.text((8,8),'PR #54 before',fill='#202629');draw.text((w+24,8),'Refined introduction',fill='#202629')
        for i,phase in enumerate(['before','after']):canvas.paste(Image.open(root/phase/row['file']),(i*(w+16),32))
        canvas.save(root/f"comparison-{row['kind']}-{row['place']}-{w}-{row['state']}.jpg",quality=88)
(root/'layout-summary.json').write_text(json.dumps({'method':'Matched settled reduced-motion browser captures. Initial/control deltas are viewport positions after the same header alignment. State images align the actual result instead. Body/control fonts are compared at the same text scale. No physical-device claim.','results':summary},indent=2),encoding='utf-8',newline='\n')
sizes=[(320,844),(390,844),(430,844),(768,1024),(1280,720),(1440,900)]
def pair(kind,place,w,h,state):
    return '<div class="pair">'+''.join(f'<figure><figcaption>{label}</figcaption><a href="{phase}/{kind}/{place}/{w}-{h}-{state}.jpg"><img loading="lazy" src="{phase}/{kind}/{place}/{w}-{h}-{state}.jpg" alt="{escape(kind)} {place} {state}, {w} by {h}, {label}"></a></figure>' for phase,label in [('before','PR #54 before'),('after','Refined introduction')])+'</div>'
html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Demonstration introductions</title><style>body{font:16px/1.6 system-ui;color:#202629;background:#ecebe3;max-width:1480px;margin:32px auto;padding:0 24px}a{color:#34483d}nav{display:flex;flex-wrap:wrap;gap:12px 24px}nav a,select{min-height:44px}select{font:inherit;padding:8px}section{margin-top:36px;padding-top:24px;border-top:1px solid #c8c6bc}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}figure{margin:0}img{width:100%;height:auto}h1,h2,h3{line-height:1.2;font-weight:500}@media(max-width:680px){.pair{grid-template-columns:1fr}}</style><h1>Demonstration introductions</h1><p>PR #54 / 99b9a99 compared with the focused refinement. Approved previews, original images, sculpture framing, motion and reducers stay unchanged. Normal Cedar/Lobby routes do not adopt these review candidates.</p><nav><a href="review-report.md">Methods and findings</a><a href="changed-files.txt">Changed files</a><a href="comparison.zip" download data-zip>Download offline comparison</a><a href="layout-summary.json">Measured layouts</a></nav><p>Preview may require Vercel sign-in; protection is unchanged. Noindex is not access protection. Extract the ZIP and open index.html for local image review. Windows Chrome viewport emulation and explicit 200% demonstration-text enlargement (header/footer unchanged) are distinct from physical devices and native browser zoom.</p><label for="size">Viewport </label><select id="size">'''
html+=''.join(f'<option value="{w}"'+(' selected' if w==390 else '')+f'>{w} × {h}</option>' for w,h in sizes)+'</select>'
for w,h in sizes:
    html+=f'<section data-size="{w}"><h2>{w} × {h}</h2>'
    for kind in ['cedar','lobby']:
        html+=f'<h3>{kind.title()}</h3><nav><a href="/review/featured/{kind}/candidate">Working candidate journey</a><a href="/review/featured/{kind}/candidate/reader">Reader</a></nav>'
        for place in ['preview','reader']:
            html+=f'<h4>{place.title()} introduction</h4>'+pair(kind,place,w,h,'initial')+f'<a href="comparison-{kind}-{place}-{w}-initial.jpg">Combined comparison</a>'
            if w in [320,390,430,768]:
                html+='<details><summary>200% text enlargement</summary>'+pair(kind,place,w,h,'text-200')+f'<a href="comparison-{kind}-{place}-{w}-text-200.jpg">Combined enlarged-text comparison</a></details>'
    html+='</section>'
html+='<section><h2>Active, error and completed states</h2><p>These captures align the actual result/interpretation, while the initial captures above show the introduction and first meaningful control.</p>'
for kind,states in [('cedar',['active','outdated','refreshed']),('lobby',['denied','rejected','active','allowed'])]:
    for place in ['preview','reader']:
        for w,h in [(390,844),(1440,900)]:
            html+=f'<details><summary>{kind.title()} {place}, {w}px states</summary>'+''.join(f'<h3>{state.title()}</h3>'+pair(kind,place,w,h,state) for state in states)+'</details>'
html+='</section><script>const select=document.getElementById("size");function show(){document.querySelectorAll("[data-size]").forEach(s=>s.hidden=s.dataset.size!==select.value)}select.addEventListener("change",show);show();if(location.protocol==="file:")document.querySelector("[data-zip]").hidden=true</script></html>'
(root/'index.html').write_text(html,encoding='utf-8',newline='\n')
initial=[x for x in summary if x['state']=='initial']
print(json.dumps({'captures':len(after),'initialLayouts':len(initial),'uneven':sum(x['orientation']=='uneven' for x in summary),'clippedProgress':sum(x['clippedStep'] for x in summary),'pageOverflow':sum(x['pageOverflow'] for x in summary),'reader390':[x for x in initial if x['width']==390 and x['place']=='reader']},indent=2))
