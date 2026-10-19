# KAGE — Cybersecurity Dojo

A local visual frontend following the supplied crimson landing and mountain-map references. All navigation, headings, controls, and cards are real HTML. Original artwork and the earlier SVG prototype are preserved.

New to the project? Read `HANDOFF.md`, then `track.md`. The original three briefs describe the intended product; they do not indicate that its backend is implemented.

## Preview

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://localhost:8000**. No package installation or build is needed. `kage-landing.html` redirects to the new entry point.

## Working from another machine

Commit and push the project to your Git remote, then clone it on the other machine and use the preview command above. `.gitignore` keeps application code, all Markdown briefs/handoff notes, `requirements-dev.txt`, tooling, fonts/licenses, original images/references, and source/runtime artwork eligible for version control. Runtime artwork is included because the site has no build step that downloads or regenerates it automatically.

Local Python environments, browser profiles, QA screenshots/results, logs, private environment values, and machine-specific credential/tool state are ignored. Recreate optional tooling using `requirements-dev.txt`; regenerate browser evidence with the commands in `HANDOFF.md`. Example `.env.example` / `.env.*.example` templates remain shareable if added later. Browser notes, progress, and motion preferences live in localStorage and do not transfer through Git.

## Included

- Responsive illustrated landing page with separate portrait artwork, keyboard navigation, a working mobile menu, and an optional layered WebGL scene.
- Randomized cloth/grass/foliage wind, gentle anchored samurai sway, smoothed pointer depth, mist, birds, leaves, and restrained sun/river/waterfall lighting. Distant mountains remain rigid.
- Learning map and accessible lesson-list view.
- Three introductory lessons with controlled simulations, safer code examples, and assessments.
- Cyber Arena challenge filters and entry into the simulations.
- Field Notes creation, editing, filtering, search, and deletion.
- Progress based on completed assessments and saved notes.
- Global search (also Ctrl/Cmd+K), accessible dialogs, reduced-motion handling, and animation suspension when hidden/offscreen.
- Code Analysis visual preview with local ZIP selection. **No files are uploaded or scanned.**

Notes and progress use browser localStorage and stay on this browser/origin. Account sign-in, cloud sync, rankings, scanner workers, GitHub integration, and a persistent backend are not implemented. Storage failures show an explicit session-only notice.

## Source layout

- `index.html`: static landing and shared shell.
- `styles/site.css`: local fonts, visual tokens, page layouts, responsive styles.
- `scripts/app.js`: route views, lessons, notes, search, progress, storage, and scene integration.
- `scripts/scene.js`: layered mesh rendering, atmosphere, lifecycle, and fallback controller.
- `assets/source/`: original references and generated artwork masters.
- `assets/environments/`: optimized runtime WebP artwork.
- `assets/notes/`: prompts, provenance, measurements, palette, asset manifest.
- `prototypes/kage-landing-svg.html`: the preserved earlier procedural prototype.
- `tools/prepare_assets.py`: reproducible WebP optimization; requires Pillow.
- `tools/prepare_scene.py`: cropped layer exports, registration geometry, masks, and allocation budgets; requires Pillow.
- `assets/layers/`: source alpha exports, runtime textures, review masks, and `layers.json`.
- `track.md`: completed tasks, validation, remaining goals, and the next work.
- `HANDOFF.md`: current architecture, reading order, editing map, tooling setup, and open work.
- `requirements-dev.txt`: optional pinned Python tooling dependencies; no website runtime package install is needed.

Font files are served locally. Sources and license information are recorded under `assets/fonts/`.

## Animation and fallback behavior

Desktop uses a repainted valley plus registered maple, ridge/grass, and ronin layers. Smooth per-vertex masks anchor cloth at its attachment points, grass near its roots, and leaves toward the trunk. The scene does not animate by warping the entire flat background.

Random weather eases between calm, mild, breezy, and strong gusts. Cloth, grass, branches, mist, and tumbling maple leaves share the wind; the samurai has gentle sway/breathing with anchored feet. Faint air currents, birds, water shimmer, and a blade glint complete the atmosphere. Motion tuning and diagnostic helpers are documented in `assets/notes/animation-assets.md`.

Mobile uses a separately composed portrait base and character layer, simplified wind, no pointer parallax, and a 30 fps cap. Pause freezes the scene. Reduced motion, unsupported WebGL, failed layer loading, and context loss retain the original static illustration and working HTML. Offscreen heroes, hidden tabs, and other routes suspend rendering.

The layered reconstruction differs in fine detail from the supplied raster. A true high-resolution master/bleed and physical-device/cross-browser validation remain open. The generation tool returned the master candidate at the original resolution, so no detail upscale is claimed.

See `VISUAL_IMPLEMENTATION_PLAN.md`, `track.md`, and `assets/notes/animation-verification.md` for the current roadmap and verification limits. The original frontend report remains in `assets/notes/verification.md`.
