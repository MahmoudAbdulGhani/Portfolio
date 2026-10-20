"""Package the static comparison for offline review; never include env/snapshots."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parent.parent
folder = root / 'docs/design/profile-portrait-mobile-hierarchy'
output = folder / 'portrait-review.zip'
hosted_file = folder / 'hosted-verification.json'
hosted = json.loads(hosted_file.read_text(encoding='utf-8')) if hosted_file.exists() else {}
html = (folder / 'comparison.html').read_text(encoding='utf-8')
html = html.replace('href="/review-assets/', 'href="review-assets/')
html = html.replace('href="/profile"', 'href="https://mahmoud-portfolio-omega.vercel.app/profile"')
html = html.replace('<a href="/review/profile-portrait">Interactive review prototype</a>',
                    '<span>Interactive prototype: use the Vercel Preview URL in the draft PR</span>')
html = html.replace('<a href="portrait-review.zip" download>Download comparison package</a>',
                    '<span>Offline comparison package</span>')
entries = {'index.html': html.encode('utf-8'), 'design-qa.md': (root / 'design-qa.md').read_bytes(),
           'README.txt': (
               'Open index.html to review the matched desktop and phone screenshots offline.\n'
               'This is a static comparison package, not a video or a running application.\n'
               'Use the mobile hierarchy draft PR stacked above #36 for the exact Vercel Preview URL.\n'
               f'Review branch URL: {hosted.get("branchPreview", "See the refinement draft PR")}\n'
               f'First verified Preview: {hosted.get("preview", "See the refinement draft PR")}\n'
               'Interactive path: /review/profile-portrait\n'
               'Hosted comparison: /review/portrait-comparison/index.html\n'
               'Sign in with an authorized Vercel account if deployment protection requires it.\n'
               'The production domain and /profile retain the accepted portrait.\n'
               'Before: PR #36, commit f4851863056b2dd3ebc4528c4f935434acabd176.\n'
               'The existing 960x1696 portrait and processing are unchanged.\n'
               'Backpack retained. Speaking/gesturing production remains separate.\n'
           ).encode('utf-8')}
for file in folder.iterdir():
    if file.is_file() and file.suffix in ['.jpg', '.png', '.json', '.md']:
        entries[file.name] = file.read_bytes()
for file in (root / 'public/review-assets').glob('profile-original-hands.*'):
    entries[f'review-assets/{file.name}'] = file.read_bytes()
with ZipFile(output, 'w') as archive:
    for name, content in sorted(entries.items()):
        info = ZipInfo(name, date_time=(2026, 10, 20, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, content, compresslevel=9)
print(f'Offline portrait comparison: {output.relative_to(root)} ({output.stat().st_size} bytes; {len(entries)} files)')
