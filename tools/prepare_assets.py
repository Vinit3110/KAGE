"""Optimize approved artwork without changing its composition. Requires Pillow."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'assets/environments'
OUTPUT.mkdir(parents=True, exist_ok=True)
sources = {
    'crimson-horizon': 'landing-clean-plate-v1.png',
    'crimson-mobile': 'landing-mobile-v1.png',
    'mountain-trail': 'mountain-clean-plate-v1.png',
    'night-dojo': 'dojo-v1.png',
    'the-forge': 'forge-v1.png',
    'the-archive': 'archive-v1.png',
    'mastery': 'mastery-v1.png',
}
manifest = []
for name, source in sources.items():
    with Image.open(ROOT / 'assets/source' / source) as image:
        image = image.convert('RGB')
        sizes = [('', 2000)] if name == 'crimson-mobile' else [('', 2000), ('-small', 960)]
        for suffix, width in sizes:
            export = image.copy()
            if export.width > width:
                export.thumbnail((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
            target = OUTPUT / f'{name}{suffix}.webp'
            export.save(target, 'WEBP', quality=88, method=6)
            manifest.append({'file': str(target.relative_to(ROOT)), 'width': export.width,
                             'height': export.height, 'bytes': target.stat().st_size})
        if name == 'crimson-horizon':
            placeholder = image.copy()
            placeholder.thumbnail((40, 25))
            placeholder.save(OUTPUT / 'crimson-placeholder.webp', 'WEBP', quality=30)
(ROOT / 'assets/notes/runtime-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
for entry in manifest:
    print(f"{entry['file']}: {entry['width']}×{entry['height']}, {entry['bytes'] / 1024:.0f} KB")
