"""Inspect saved Phase 1 PDFs without database or network access."""
import json
from pathlib import Path
import pymupdf

folder = Path('docs/design/phase1/cv')
reports = []
for filename in ['application.pdf', 'tailored.pdf', 'master.pdf']:
    document = pymupdf.open(folder / filename)
    application = filename != 'master.pdf'
    if application:
        assert len(document) == 1, f'{filename}: application CV must stay on one page'
    pages = []
    for index, page in enumerate(document):
        width, height = (612.0, 792.0) if application else (595.28, 841.89)
        assert abs(page.rect.width - width) < 0.01 and abs(page.rect.height - height) < 0.01
        spans = [span for block in page.get_text('dict')['blocks'] if 'lines' in block
                 for line in block['lines'] for span in line['spans']]
        fonts = sorted({span['font'] for span in spans})
        assert not application or all('Carlito' in font for font in fonts), fonts
        assert application or all('SourceSans3' in font for font in fonts), fonts
        assert min(s['bbox'][0] for s in spans) >= 0
        assert max(s['bbox'][2] for s in spans) <= page.rect.width
        assert max(s['bbox'][3] for s in spans) < page.rect.height
        links = [link['uri'] for link in page.get_links() if link.get('uri')]
        text = page.get_text()
        if application:
            assert 'Participated in a full-stack' in text
            assert 'Completed a full-stack' not in text
            assert 'Jun 2026' in text and 'Sep 2026' in text
            assert 'Jul 2025' in text and 'Oct 2025' in text
            assert text.count('Co-developed') == 2
            assert 'authenticated and guest access' in text
            assert 'backend integration across bookings' in text
            assert any(link.startswith('mailto:') for link in links)
            assert any(link.startswith('tel:') for link in links)
            assert any('linkedin.com' in link for link in links)
            titles = sorted([s for s in spans if s['text'] in ['JobPilot AI', 'Lobby', 'GameZone Arena', 'TECHNICAL SKILLS']], key=lambda s: s['bbox'][1])
            for title, following in zip(titles, titles[1:]):
                paragraph = [s for s in spans if title['bbox'][1] + 8 < s['bbox'][1] < following['bbox'][1]]
                assert max(s['bbox'][3] for s in paragraph) <= following['bbox'][1] - 1, f'{filename}: overlapping project paragraphs'
        page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5)).save(folder / (filename.replace('.pdf', '.png') if index == 0 else filename.replace('.pdf', f'-page-{index + 1}.png')))
        pages.append({'page': index + 1, 'size': list(page.rect), 'fonts': fonts, 'links': links, 'textLength': len(text), 'contentBottom': max(s['bbox'][3] for s in spans)})
    extracted = '\n'.join(p.get_text() for p in document)
    # PDF extraction often leaves visual-line padding; retain all words and
    # reading order while keeping the committed evidence whitespace-clean.
    (folder / filename.replace('.pdf', '.txt')).write_text('\n'.join(line.rstrip() for line in extracted.splitlines()) + '\n', encoding='utf8')
    reports.append({'file': filename, 'pages': pages})
(folder / 'inspection.json').write_text(json.dumps(reports, indent=2) + '\n', encoding='utf8')
print('PDF inspection passed: one-page standard/tailored, A4 master, body fonts, selectable text, contact annotations and project spacing.')
