"""Offline review evidence. No production application artifacts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path('docs/design/supporting-density').resolve()
target = root / 'evidence.zip'
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for source in sorted(root.rglob('*')):
        if source.is_file() and source != target:
            archive.write(source, source.relative_to(root))
with ZipFile(target) as archive:
    assert archive.testzip() is None
print(f'{target.name}: {target.stat().st_size:,} bytes; complete CRC check passed')
