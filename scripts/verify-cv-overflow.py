"""Validate actual PDF text placement, separate from generator coordinates."""
import sys
import json
from pathlib import Path
import pymupdf

folder = Path(sys.argv[1])
for case in json.loads((folder / 'expectations.json').read_text()):
    document = pymupdf.open(folder / case['file'])
    if 'pages' in case:
        assert len(document) == case['pages'], f"{case['file']}: compact CV must retain one Letter page"
    if 'minPages' in case:
        assert len(document) >= case['minPages'], 'Long fixture must exercise actual pagination'
    full_text = ' '.join(' '.join(page.get_text().split()) for page in document)
    assert case['summary'] in full_text, 'Approved factual fallback must be preserved in full'
    assert case['forbidden'] not in full_text, 'Provider assessment must never become CV copy'
    for name in case['projects']:
        assert name in full_text, f'Missing selected project: {name}'
    if not case['projects']:
        assert 'PROJECT EXPERIENCE' not in full_text, 'No empty project heading or reserved slots'
    if 'repeatedPhrase' in case:
        assert full_text.count(case['repeatedPhrase']) == case['repeatCount'], 'Long source content must not be clipped'
        assert case['skillPhrase'] in full_text, 'Wrapped skill content must be preserved'
    lines = []
    for page_index, page in enumerate(document):
        assert (page.rect.width, page.rect.height) == (612, 792)
        page_lines = [line for block in page.get_text('dict')['blocks'] if 'lines' in block for line in block['lines']]
        assert all('Carlito' in span['font'] for line in page_lines for span in line['spans']), 'Keep application fonts'
        assert min(line['bbox'][1] for line in page_lines) >= 35, 'Keep top margin'
        assert max(line['bbox'][3] for line in page_lines) <= 757, 'Keep bottom margin'
        assert min(line['bbox'][0] for line in page_lines) >= 35, 'Keep left margin'
        assert max(line['bbox'][2] for line in page_lines) <= 578, 'Keep right margin'
        lines.extend((page_index, line) for line in page_lines)
    text = lambda item: ''.join(span['text'] for span in item[1]['spans'])
    summary = next(i for i, item in enumerate(lines) if text(item) == 'PROFESSIONAL SUMMARY')
    experience = next(i for i, item in enumerate(lines) if text(item) == 'PROFESSIONAL EXPERIENCE')
    assert max(item[1]['bbox'][3] for item in lines[summary+1:experience]) + 5 < lines[experience][1]['bbox'][1], 'Summary overlaps experience'
    if case['projects']:
        project = next(i for i, item in enumerate(lines) if text(item) == 'PROJECT EXPERIENCE')
        skills = next(i for i, item in enumerate(lines) if text(item) == 'TECHNICAL SKILLS')
        previous_page, previous = lines[skills-1]
        next_page, next_line = lines[skills]
        if previous_page == next_page:
            gap = next_line['bbox'][1] - previous['bbox'][3]
            assert 5 <= gap <= 32, f"{case['file']}: project-to-skills spacing is {gap:.2f}pt"
        assert skills > project
    print(f"{case['file']}: {len(document)} Letter page(s), full factual copy, selection, margins, fonts and flowing spacing passed.")
