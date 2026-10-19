# Artwork provenance

The subsequent layered landing assets, generated repaints, registration, and masks are documented separately in `animation-assets.md`. The entries below preserve the original visual-milestone history.

## Landing clean plate v1

- Tool: built-in `image_gen.imagegen`, edit mode; no CLI/API fallback.
- Input: `images/Cyber Samurai Discipline Landing Page.png`.
- Output: `assets/source/landing-clean-plate-v1.png`.
- Purpose: faithful illustrated background without interface text or controls.
- Inspection: the returned full image has no visible interface text, buttons, statistics strip, side calligraphy, or seal. The sun, ronin, foreground ridge, river, temples, and waterfalls retain the reference composition. Repaired foliage and hillside occupy the former headline area.
- Remaining work: enlarged repair/edge inspection, high-resolution master and bleed, cutouts, hidden-area repaints, masks, responsive/mobile artwork, and browser overlay comparison. This is a static raster, not a completed animation layer set.
- Complete generation prompt: `landing-clean-plate-prompt.txt` in this directory.

## Coordinated environment assets

All assets below used the built-in `image_gen.imagegen` tool, with no CLI/API fallback. Originals are preserved. Image output was visually inspected before integration. `tools/prepare_assets.py` performs resizing and WebP compression without changing the artwork composition.

| Source deliverable | Reference / role | Runtime asset | Complete prompt |
| --- | --- | --- | --- |
| `assets/source/mountain-clean-plate-v1.png` | Mountain Learning Paths mockup, edit target to remove UI | `assets/environments/mountain-trail.webp` | `mountain-prompt.txt` |
| `assets/source/landing-mobile-v1.png` | Landing clean plate, style and subject reference for portrait composition | `assets/environments/crimson-mobile.webp` | `mobile-prompt.txt` |
| `assets/source/dojo-v1.png` | Six-screen montage, night-dojo style reference | `assets/environments/night-dojo.webp` | `dojo-prompt.txt` |
| `assets/source/forge-v1.png` | Six-screen montage, workshop style reference | `assets/environments/the-forge.webp` | `forge-prompt.txt` |
| `assets/source/archive-v1.png` | Six-screen montage, study style reference | `assets/environments/the-archive.webp` | `archive-prompt.txt` |
| `assets/source/mastery-v1.png` | Six-screen montage, profile style reference | `assets/environments/mastery.webp` | `mastery-prompt.txt` |

These are generated environment illustrations, not independently extracted animation layers. The mountain reconstruction retains a few painted petals and distant birds as part of the static artwork. No application controls or textual labels are baked into the runtime illustrations.

Runtime sizes and byte counts are recorded in `runtime-manifest.json`. The portrait source is 941 × 1672; landscape sources are approximately 1586 × 992. No high-resolution upscaling is claimed.
