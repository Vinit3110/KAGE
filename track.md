# KAGE work tracker

This file records completed tasks, validation, and the next concrete work. Update it at the end of each task. Do not mark an item complete until its deliverable and checks exist.

## Current objective

The visual frontend, layered animation, and random-wind/silhouette motion pass are implemented. Maintain a clear developer handoff, complete browser/device validation and high-resolution artwork follow-up, then proceed to the backend stages when authorized.

## Previously completed — visual frontend

- Built the illustrated landing page and six connected screens with responsive navigation.
- Created coordinated environment illustrations and a separate portrait landing image; saved source files, prompts, and optimized runtime variants.
- Implemented introductory lessons, controlled simulations, assessments, local notes, search, and browser-local progress.
- Preserved the earlier procedural prototype under `prototypes/`.
- Verification: 47 workflow/layout checks and 4 ambient-motion checks passed in Firefox. See `assets/notes/verification.md`.
- Limits: analysis backend, authentication, cloud sync, and public rankings remain unimplemented.

## Layered landing milestone — implemented; high-resolution target open

- [ ] Prepare and inspect the high-resolution master.
- [x] Create background repaints and transparent foreground layers.
- [x] Record layer bounds, wind masks, depth, and asset budgets in a manifest.
- [x] Implement localized wind, pointer depth, fog, birds, petals, and restrained lighting.
- [x] Verify pause/resume, hidden/offscreen suspension, reduced motion, and rendering-failure fallbacks.
- [x] Check rest composition and motion frames at desktop and mobile sizes.
- [x] Run regression checks and record measured results and remaining limits here.

## Future stages

- Validate on physical phones and across Chrome/Safari as well as Firefox.
- Expand animated environment treatment only where it improves the experience.
- Add the isolated scanning service, persistent data, authentication, and GitHub integration in subsequent backend stages.

### Asset task log

- Generated and inspected `assets/source/landing-master-v2.png`. The requested 3200 × 2000 output returned at 1586 × 992. Preserved the candidate and its prompt; the high-resolution target remains open. No interpolated enlargement is being presented as recovered detail.
- Generated a repainted valley and transparent ronin, ridge/grass, and maple layers under `assets/layers/source/`. Initial inspection found that the ronin extraction changed scale; registration and composite inspection are required before integration.
- Portrait background and character generation was completed in the asset/export task below.

### Completed asset/export task

- Saved separate portrait base and character exports. All source alpha remains in `assets/layers/source/`; prompts are in `assets/notes/animation-*-prompt.txt`.
- Added `tools/prepare_scene.py` and `assets/layers/layers.json` with cropped texture bounds, registered positions, depth, wind regions, and limits.
- Runtime layers: desktop 690,684 bytes / 12.7 MiB RGBA textures; mobile 422,106 bytes / 8.4 MiB RGBA textures. These figures exclude the existing static fallback, fonts, and render buffers.
- Rest-composite inspection caught a ground-contact gap. Added a static ridge registration adjustment in the mesh; subsequent browser acceptance checked the corrected contact.

### Completed renderer implementation task

- Added `scripts/scene.js`: dependency-free WebGL mesh rendering, root-weighted cloth/grass/leaf wind, shared gust phase, and smoothed pointer depth. Body/hat masks remain zero; the foreground supporting rock is damped.
- Added river/sun lighting, drifting mist, birds, petals, and an infrequent blade glint. Portrait uses two layers, simplified wind, no pointer parallax, and a 30 fps cap.
- Added static fallback for loading/errors/reduced motion, context-loss recovery, pause/resume, visibility/intersection suspension, DPR caps, and allocation cleanup on variant changes.
- Added deterministic preview and diagnostics for inspection. Browser acceptance subsequently passed as recorded below.

### Completed animation acceptance task

- Corrected a shader precision mismatch caught by the first Firefox WebGL run. Shared shader inputs now use matching precision; phase angles are wrapped on the CPU to remain smooth over long sessions.
- **30 animation/fallback checks passed in Firefox 148** using software rendering. They cover four-layer rendering, anchored body/hat/ground masks, moving cloth, fine-pointer depth under mouse emulation, a six-hour phase preview, pause, route/offscreen/inactive-tab suspension, context loss/restoration, portrait layer switching, mobile frame cap, reduced-motion no-load behavior, no-WebGL fallback, and a missing-layer fallback with working navigation.
- Inspected desktop rest and wind frames plus portrait animation screenshots. The corrected ridge now meets the feet; torso/hat remain rigid while cloth moves. Source reconstruction and character detail differ from the original flat illustration, so this is not a pixel-identity claim.
- Saved screenshots and diagnostic JSON under ignored `output/qa/`. Exported layers remain under `assets/layers/`; artwork prompts and explanations are in `assets/notes/animation-assets.md`.
- Final frontend regression: **48 checks passed**, including lesson simulations/assessments, notes/search/persistence, mobile navigation, and 320, 390, 620, 768 and 2560-pixel landing layouts. Combined with the animation suite: **78 current checks passed**.
- Remaining: genuine high-resolution master/bleed, further individual scenery layers if needed, physical-device checks, and Chrome/Safari validation. No measured 60 fps claim is made for untested hardware.

### End-of-task handoff

- Preview: `python3 -m http.server 8000 --bind 127.0.0.1`, then open `http://localhost:8000`.
- Current evidence and limits: `assets/notes/animation-verification.md`.
- Saved source assets, runtime layers, and masks: `assets/layers/`; provenance and prompt set: `assets/notes/animation-assets.md`.
- Representative screenshots: `output/qa/animated-rest.png`, `animated-wind-4s.png`, `animated-wind-8s.png`, and `animated-mobile.png`.
- The layered-animation milestone is implemented and browser-checked. The high-resolution asset target remains explicitly open; no interpolated enlargement or untested browser/device behavior is marked complete.

## Completed handoff documentation task

- Audited source, dependencies, milestone reports, and Git state against the current implementation.
- Added `HANDOFF.md` with a reading order, document authority, current architecture, file/editing map, storage schema, setup and test commands, intentional preview states, open work, and repository handoff caveats.
- Added `requirements-dev.txt`, pinning the tooling versions present in the verified environment: Pillow 12.1.1 and websockets 15.0.1. The site still needs no package installation to run.
- Corrected stale tracker wording and the README's application-script description. Linked the handoff guide from the README.
- Validation: checked local dependency versions, required files and documentation references. No application code changed; no browser suite was rerun and no dependency installation was performed.
- Repository state: no Git commits; project files remain untracked. A reviewed initial commit and backup/remote checkpoint remain open. This audit did not commit or push files.

## Completed random wind and flowing silhouette task — 2026-10-19

- Replaced repeating wind intensity with seeded random calm, mild, breezy, and strong gusts. Wind changes speed smoothly over 1.8–3.2 seconds, with irregular 5–12-second weather segments. Integrated speed keeps phases continuous through changes.
- Coordinated cloth, grass, maple branches, mist, leaf travel/tumbling, and faint curved wind trails with that wind. Retained sun/river/waterfall lighting, flying birds, pointer depth, and an occasional katana glint.
- Added gentle samurai sway and breathing through a separate body weight. Feet stay pinned to the rock; the hat/torso remain outside the stronger cloth flutter. The blade glint follows the body and pointer pose.
- Replaced simple drifting particles with maple-shaped leaves and petals, depth/size variation, spinning/flipping, smooth offscreen wrapping, and quieter opacity over desktop copy. Budgets remain 45 desktop / 20 mobile. Paths now reproduce when seeking backward.
- Preserved one shared animation clock/loop, full-scene pause, reduced-motion static fallback, route/visibility/offscreen suspension, context recovery, and the portrait 30 fps cap. No new artwork downloads or dependencies.
- Changed runtime: `scripts/scene.js`. Expanded browser checks: `tools/animation_check.py`. Updated `README.md`, `HANDOFF.md`, `VISUAL_IMPLEMENTATION_PLAN.md`, `assets/notes/animation-assets.md`, this tracker, and the current verification report.
- Validation: **42 animation/lifecycle/fallback checks passed in headless Firefox 148**, including 12 added weather/pose/leaf checks, smooth phase sampling, six-hour rendering, pause, phone rendering, reduced motion, unavailable WebGL, and a missing texture. Inspected strongest-gust desktop and portrait screenshots; no exposed gaps or obvious alpha fringes in those frames.
- Evidence: ignored `output/qa/animation-*-results.json`; screenshots include `animated-calm.png`, `animated-gust.png`, `animated-rest.png`, `animated-wind-4s.png`, `animated-wind-8s.png`, and `animated-mobile.png`. Current explanation: `assets/notes/animation-verification.md`.
- The previous 48 workflow/layout checks were not rerun: application routing/content, HTML, and CSS did not change. The earlier pixel-difference table is marked historical because the body now moves.
- Remaining limits: Chrome/Safari and physical-device performance still require validation; genuine high-resolution master/bleed remains open. Distant scenery is still merged. Backend/account/scanning work is unaffected and remains unimplemented. No commit, push, or deployment performed.

## Completed cross-machine Git ignore task — 2026-10-19

- Expanded the existing `.gitignore` with documented rules for local Python environments/caches, browser profiles, reproducible QA output, logs, private `.env` values, root machine-specific `.aws`/`.codex` state, editor recovery files, and OS metadata. Environment example templates remain eligible for Git.
- Retained application code, all project Markdown, handoff/tracker files, dependency requirements, tools, fonts/licenses, supplied images/references, prototypes, generated source artwork, runtime textures, and layer manifests. Team instructions such as `AGENTS.md` and `.agents/` are not blanket-ignored.
- Added README instructions for moving between machines, rebuilding optional tooling, and regenerating ignored browser evidence. Clarified that browser-local notes/progress/preferences do not sync through Git. Corrected one stale README statement about the now-moving samurai.
- Validation: `git check-ignore --no-index --stdin` confirmed 13 local/private/cache paths are ignored and 25 representative shareable paths are retained. Audited all 102 existing source/art/reference/tooling/Markdown files; none are accidentally ignored. No application behavior changed, so browser suites were not rerun.
- Files remain untracked in this workspace. `.gitignore` makes the important files eligible for version control; a commit and push to a chosen remote are still needed before another machine can clone the project. No staging, commit, push, or dependency installation performed.
