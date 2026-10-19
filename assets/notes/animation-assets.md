# Layered landing assets and rendering

## Provenance

Used the built-in `image_gen.imagegen` editing tool, not the CLI/API fallback. The approved desktop and portrait clean plates were the edit targets. Source output alpha is preserved under `assets/layers/source/`. The original supplied mockups and existing static fallbacks are unchanged.

| Source | Purpose | Complete prompt |
| --- | --- | --- |
| `assets/layers/source/valley.png` | Reconstructed valley behind the figure, foreground hill, and maple tree | `animation-valley-prompt.txt` |
| `assets/layers/source/ronin.png` | Transparent character, cloth, ribbon, and sword | `animation-ronin-prompt.txt` |
| `assets/layers/source/ridge.png` | Transparent foreground hill, rock, and grass | `animation-ridge-prompt.txt` |
| `assets/layers/source/maple.png` | Transparent foreground trunk, branches, and leaves | `animation-maple-prompt.txt` |
| `assets/layers/source/mobile-base.png` | Portrait scene with the figure's hidden area repainted | `animation-mobile-base-prompt.txt` |
| `assets/layers/source/mobile-ronin.png` | Portrait character extraction | `animation-mobile-ronin-prompt.txt` |

`assets/source/landing-master-v2.png` is a separately generated master candidate. Its requested 3200 × 2000 resolution was not delivered by the tool: the output is 1586 × 992. It is preserved but not used as a claimed high-resolution upscale. See `animation-master-prompt.txt`.

## Export and registration

Run `python3 tools/prepare_scene.py` to crop, compress, and write `assets/layers/layers.json`. Requires Pillow. Cropping removes empty margins and retains an eight-pixel alpha gutter. No RGB correction or manual matte replacement is applied; original alpha inside the crop is retained. Alpha ≤1 outside the useful crop is generation dust.

The image tool did not preserve character scale exactly. The manifest registers cropped characters back to the original composition. A small static mesh correction lifts the foreground ridge beneath the desktop feet; it is recorded as `restWarp`. The character and supporting ground share a depth value so pointer motion does not separate their contact points.

Generated reconstruction and character detail differ somewhat from the supplied raster. The goal is close composition and coherent animation, not pixel identity. The original flat artwork remains the loading/reduced-motion/error fallback.

## Masks and depth

`maskDefinitions` in `layers.json` is the runtime source of truth. Mesh vertices receive smooth wind and flutter weights from those geometric definitions. `assets/layers/masks/*.svg` provides reviewable visual guides to the mask regions; these are not additional GPU textures. Cloth weights fade to zero at the body/hat, grass weights fade toward the roots and supporting rock, and maple motion fades toward the trunk. The shader deforms the transparent layer mesh; it does not warp the entire landscape image.

Static distant scenery is merged into one layer. Desktop uses four draw layers, portrait uses two. Explicit per-layer depths provide 2.5D pointer movement without a generated depth map. A 2% desktop overscan and bounded offsets protect viewport edges. Mobile uses its own portrait framing, no pointer depth, lower DPR, no high-frequency flutter, and a 30 fps rendering cap.

## Effects and lifecycle

- One controller schedules the WebGL scene and effect canvas together.
- A seeded weather timeline randomly alternates calm, mild, breezy, and strong gusts. Each 5–12-second segment eases into its target over 1.8–3.2 seconds; strength stays between 0.12 and 1.58. Speed is integrated continuously, so faster wind does not jump the animation phase.
- Shared right-to-left gust phases drive cloth, grass, foliage, leaf travel/tumbling, mist, and faint curved air currents with individual phase offsets. A new page session chooses a new seed; seeking within that session is reproducible.
- Wrapped shader angles prevent long-duration floating-point phase degradation.
- Sun brightness, river reflections, and narrow waterfall regions receive subtle shader lighting changes; the mountains stay rigid.
- The silhouette has a separate connected sway/breathing weight, with zero movement in the bottom 8% of its registered bounds. Maximum upper-body displacement is under 2.2 source pixels horizontally and 0.33 vertically, before ramp/projection; free cloth moves more strongly. Hat/torso cloth weights remain zero, avoiding rubber-like cloth deformation of the figure.
- A separate transparent effect canvas draws soft mist, small birds, maple-shaped leaves and petals, faint gust trails, and an infrequent sword glint that follows the body pose. There are 45 leaves on desktop and 20 on portrait. Paths are functions of the scene clock, with offscreen wrapping, perspective size variation, rotation, flipping, and quieter opacity over desktop copy.
- Pause freezes the complete scene. Reduced motion, missing assets, WebGL failure, and context loss reveal the original static artwork.
- Hidden tabs, offscreen hero, other routes, and page lifecycle transitions stop scheduling frames. Context restoration rebuilds resources.
- Text, buttons, navigation, and their contrast overlays remain HTML/CSS above both renderers. Their operation does not depend on WebGL.

Runtime limits and byte counts are recorded in the manifest. Texture-byte figures describe known RGBA allocations, not a measurement of all browser or GPU-driver memory.

## Motion tuning and inspection

The wind schedule, strength/speed ranges, `bodyPose`, `poseWeight`, and `drawEffects` live in `scripts/scene.js`. Layer amplitude and cloth/grass/branch geometry remain in the generated manifest; edit `tools/prepare_scene.py` to change those persistent export settings. No new raster assets or runtime dependencies are needed for this motion pass.

`KageScene.inspect()` includes current weather, session seed, body pose, and leaf count. `inspectWind(seconds)` samples the session's weather without moving the scene; `inspectPose(v)` reports the body anchor weight at normalized layer height. Use `previewAt(seconds)` to freeze a composition and `resume()` to continue. Weather, particles, shaders, and silhouette all use the same pausable clock. The animation browser suite fixes the seed to make calm/gust screenshots and checks repeatable; production uses browser randomness.
