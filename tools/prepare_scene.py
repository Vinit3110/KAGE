"""Crop transparent exports, encode them, and record compositing geometry.

This is an export/registration step. Source illustrations and generated alpha
are preserved. It does not invent missing pixels or claim a detail upscale.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'assets/layers/source'
RUNTIME = ROOT / 'assets/layers/runtime'
RUNTIME.mkdir(parents=True, exist_ok=True)


def export(name, rect, depth=0, wind=0, mask='none', mobile=False):
    with Image.open(SOURCE / f'{name}.png') as source:
        source.load()
        crop = (0, 0, source.width, source.height)
        if source.mode == 'RGBA':
            # Alpha 1 is isolated generation dust. Keep all alpha >1, plus an
            # eight-pixel safety gutter and untouched alpha inside that box.
            bounds = source.getchannel('A').point(lambda a: 255 if a > 1 else 0).getbbox()
            if not bounds:
                raise ValueError(f'{name} has no visible alpha')
            crop = (max(0, bounds[0]-8), max(0, bounds[1]-8),
                    min(source.width, bounds[2]+8), min(source.height, bounds[3]+8))
        image = source.crop(crop)
        out = RUNTIME / f'{name}.webp'
        image.save(out, 'WEBP', quality=90, method=6, exact=True)
        result = {'id': name, 'file': str(out.relative_to(ROOT)), 'rect': rect,
                  'sourceCrop': list(crop), 'textureSize': list(image.size),
                  'depth': depth, 'windAmount': wind, 'mask': mask,
                  'maskFile': f'assets/layers/masks/{mask}.svg' if mask != 'none' else None,
                  'bytes': out.stat().st_size, 'textureBytes': image.width*image.height*4}
        if name == 'ridge':
            result['restWarp'] = {'centerX': 850, 'width': 410, 'lift': -75, 'falloff': .65}
        return result


desktop = [
    export('valley', [0, 0, 1586, 992], depth=2),
    export('maple', [0, 0, 732, 728], depth=20, wind=3.5, mask='maple'),
    export('ridge', [0, 650, 1586, 342], depth=14, wind=8, mask='grass'),
    export('ronin', [616, 432, 412, 363], depth=14, wind=17, mask='cloth'),
]
mobile = [
    export('mobile-base', [0, 0, 941, 1672]),
    export('mobile-ronin', [550, 565, 304, 290], wind=10, mask='mobile-cloth', mobile=True),
]
manifest = {
    'version': 1,
    'desktop': {'size': [1586, 992], 'anchor': [.55, .55], 'overscan': 1.02, 'layers': desktop},
    'mobile': {'size': [941, 1672], 'anchor': [.65, 0], 'overscan': 1, 'layers': mobile},
    'limits': {'desktopArtworkBytes': 2500000, 'mobileArtworkBytes': 1200000,
               'textureBytes': 250000000, 'desktopDpr': 1.5, 'mobileDpr': 1.25,
               'desktopFps': 60, 'mobileFps': 30},
    'maskDefinitions': {
        'cloth': {'kind': 'cloth', 'anchorX': 810, 'reach': 185, 'top': 484, 'bottom': 765},
        'mobile-cloth': {'kind': 'cloth', 'anchorX': 704, 'reach': 158, 'top': 604, 'bottom': 839},
        'grass': {'kind': 'grass', 'roots': [[0, 718], [300, 744], [600, 795], [850, 826], [1100, 891], [1586, 998]], 'reach': 65},
        'maple': {'kind': 'maple', 'anchorX': 40, 'reach': 690, 'bottom': 345},
    },
    'effects': {
        'desktop': {'sun': [.72, .35], 'river': [.79, .64], 'blade': [[.574, .64], [.645, .78]], 'fogY': .64},
        'mobile': {'sun': [.82, .18], 'river': [.70, .37], 'blade': [[.80, .43], [.90, .51]], 'fogY': .42},
    },
}
for key, scene in [('desktop', desktop), ('mobile', mobile)]:
    total = sum(layer['bytes'] for layer in scene)
    textures = sum(layer['textureBytes'] for layer in scene)
    limit = manifest['limits'][key+'ArtworkBytes']
    assert total < limit, (key, total, limit)
    assert textures < manifest['limits']['textureBytes']
    print(f'{key}: {total:,} bytes, {textures/1024/1024:.1f} MiB uncompressed RGBA textures')
(ROOT / 'assets/layers/layers.json').write_text(json.dumps(manifest, indent=2)+'\n')

# Only QA composites: show the recorded draw order at rest for inspection.
qa = ROOT / 'output/qa'
qa.mkdir(parents=True, exist_ok=True)
for kind in ['desktop', 'mobile']:
    config = manifest[kind]
    composite = Image.new('RGBA', tuple(config['size']))
    for layer in config['layers']:
        x,y,w,h = layer['rect']
        with Image.open(ROOT / layer['file']) as image:
            composite.alpha_composite(image.convert('RGBA').resize((w,h),Image.Resampling.LANCZOS),(x,y))
    composite.convert('RGB').save(qa / f'scene-{kind}-rest.jpg', quality=94)
