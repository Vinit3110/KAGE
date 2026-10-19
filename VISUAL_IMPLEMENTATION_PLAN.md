# KAGE visual implementation plan

Current priority: a visually polished, responsive frontend that closely follows the supplied artwork and production plan. The full source-analysis backend is a subsequent workstream.

## Implementation status — 2026-10-19

The local visual frontend is implemented in `index.html`, `styles/site.css`, and `scripts/app.js`. `scripts/scene.js` adds a layered WebGL landing scene with irregular calm/mild/strong wind, localized cloth/grass/foliage motion, anchored silhouette sway/breathing, pointer depth, mist, birds, tumbling maple leaves, faint gust trails, and restrained lighting. Six connected screens, local fonts, responsive navigation, and static/reduced-motion fallbacks remain available.

The three introductory lessons have simulations, safer code examples, and assessments. Notes, search, and progress work in this browser with localStorage. These are local functionality, not a cloud account or backend. Code analysis is an explicitly labelled visual preview and local file selection only.

Artwork source images, generation prompts, optimized WebP variants, and an asset manifest are saved in `assets/`. See `assets/notes/verification.md` for verification evidence and limitations.

The extracted/reconstructed animation layers, hidden-area repaints, geometric wind masks, and WebGL scene are implemented. Desktop uses four merged layers and portrait uses two; this is a smaller texture set than the full suggested layer inventory. A genuine high-resolution master/bleed and further scenery separation remain open. See `track.md` and `assets/notes/animation-verification.md` for the current checks and limits.

## Reference hierarchy

1. `images/Cyber Samurai Discipline Landing Page.png` controls the landing composition.
2. `images/KAGE Mountain Learning Paths.png` controls the learning-map composition.
3. `images/KAGE Cybersecurity Dojo Dashboard.png` controls the arena, forge, archive, and profile environments and layout relationships.
4. `design.md` controls the reusable interface system and accessibility.
5. `kage-landing-production-plan.md` controls landing artwork preparation and animation.
6. `references/` supplies atmosphere and detail inspiration. Screenshot controls, labels, and unverified lettering are not production assets.

The parchment landing is an alternate treatment, with its paper/ink language reserved primarily for the archive. Do not combine both landing compositions.

## Asset production

Create project-owned deliverables in `assets/`, preserving the original supplied files.

| Asset | Purpose | Initial state |
| --- | --- | --- |
| Original landing reference | Immutable comparison source | Copied to `assets/source/mockup-original.png` |
| Landing clean plate | Remove burned-in UI while preserving landscape | Generated and visually inspected; `assets/source/landing-clean-plate-v1.png` |
| Upscaled clean plate and bleed | Large displays, animation travel | Pending; current source is 1586 × 992 |
| Sky, sun, clouds, mountain/valley layers | Background depth | Static distant scenery merged in a repainted valley layer; subtle sun/water lighting implemented |
| Ronin, cloak tails, ribbon, katana | Character and localized wind/glint | Registered figure with anchored sway/breathing, localized cloth weights, and a pose-following glint |
| Grass bands, branch, leaf clusters | Foreground depth and wind | Merged ridge and maple meshes with localized weights and phases |
| Repainted backgrounds | Prevent holes behind moving cutouts | Desktop valley and portrait hidden-area repaints created |
| Wind/flutter masks and layer manifest | Animation parameters and positioning | Geometric mask definitions, SVG guides, depth and registration stored in `assets/layers/layers.json` |
| Fog, petals, birds, grain | Restrained atmospheric motion | Wind-driven fog, birds, tumbling maple leaves/petals, faint gust trails and light effects implemented; additional film grain omitted |
| Mountain trail background | Illustrated learning map without baked-in controls | Created and integrated |
| Night dojo background | Cyber Arena environment | Created and integrated |
| Workshop/veranda background | Code Analysis environment | Created and integrated |
| Archive background and paper texture | Field Notes environment | Background created; paper surfaces use CSS |
| Mastery background | Profile environment | Created and integrated |
| Seal, ornaments, consistent icons | Small sharp interface assets | Implemented with SVG/CSS |
| Mobile compositions and static fallbacks | Portrait layouts and reduced motion | Separate portrait base/character animation, 30 fps cap, no pointer depth; original flat fallbacks retained |

Use the built-in image generation tool for raster artwork preparation and variants. Keep prompts and output provenance in `assets/notes/`. Use SVG/CSS for interface marks, lines, simple icons, and effects where appropriate. Never generate a flattened image of the functioning UI.

## Delivery sequence

### 1. Prepare and validate the landing artwork

Record palette and reference measurements. Produce a clean plate, inspect text-removal areas, and correct artifacts before upscaling or separating layers. Preserve the sun, ronin, foreground ridge, and valley positions. The existing procedural SVG scene is a prototype, not the final illustration.

Exit: no leftover text, controls, garbled lettering, or obvious repair patches; original composition remains recognizable.

### 2. Build the static landing page

Implement actual HTML navigation, headline, side ornaments, buttons, and factual feature strip over the clean artwork. Match the reference first at 1586 × 992, then adapt to laptop, tablet, mobile, and ultrawide layouts. Prepare the mobile composition deliberately. Use serif landing navigation/buttons and readable sans-serif controls within the app.

Exit: screenshot overlay comparison verifies composition, typography, spacing, and contrast; keyboard focus and mobile menu work; artwork failure does not hide essential content.

### 3. Add depth and atmospheric motion

Prepare clean overlapping layers and repainted hidden areas. Add masked wind to cloth, grass, and leaves; coordinated gusts; slow fog; sparse petals and birds; and restrained water/light effects. Add gentle pointer parallax only on appropriate devices. Verify the layered scene at rest before enabling animation.

Exit: no exposed holes or edges, no distortion of the ronin body or mountains, reduced-motion and no-WebGL fallbacks, animation pauses when hidden or offscreen.

### 4. Extend the visual system to the app

Build shared navigation, surfaces, buttons, status labels, typography, and spacing. Apply the coordinated environments to Learning Paths, Cyber Arena, Code Analysis, Field Notes, and Profile. Provide an accessible list alternative to the map. Keep scenery away from code and long reading areas.

Frontend demonstrations must be labelled. Do not imply real scans, authentication, leaderboard rankings, or earned progress before the supporting functionality exists. Unavailable features must have honest states.

Exit: every main screen feels part of the same world, with purposeful artwork and usable responsive controls.

### 5. Visual and performance acceptance

Compare reference-size screenshots; inspect artwork edges and generated repairs at enlarged scale. Check mobile layouts, keyboard interaction, readable contrast, missing-asset states, and reduced motion. Test available browser/hardware combinations and record any untested combinations honestly.

Targets from the production plan: desktop hero artwork under 2.5 MB, mobile under 1.2 MB, desktop texture allocation under 250 MB, and smooth animation with a 60 fps target on representative hardware. These are acceptance targets, not measured results yet.

## Fidelity and scope

The aim is close adherence to the supplied composition and visual identity. Generated reconstruction may alter fine artwork details; inspect and iterate instead of promising pixel identity. Static alignment is checked before animation, and motion is checked separately.

Current setup has Python/Pillow but no `node` or `npm` on PATH. The visual milestone uses buildless HTML/CSS/JavaScript and can be served with Python. A future React/TypeScript migration will need a Node runtime.

Credentials and deployment decisions are not required for the artwork stage. GitHub integration, scanner workers, persistence, authentication, and production hosting follow after the visual foundation.
