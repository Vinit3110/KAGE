# KAGE developer handoff

## Start here

KAGE is currently a working, local, buildless frontend. It includes six screens, introductory web-security lessons, local notes/progress, and a layered landing animation. It is not yet the full learning-and-source-analysis MVP.

There is no backend, database, authentication service, scanner service, GitHub integration, or production deployment. The analysis screen only previews a local ZIP selection. Do not infer implemented capabilities from the original design mockups or technology recommendations.

## Reading order and document authority

| Read | File | Purpose |
| --- | --- | --- |
| 1 | `README.md` | Run the site and see the included features |
| 2 | `HANDOFF.md` | Understand the implementation, dependencies, and editing map |
| 3 | `track.md` | Current work, completed tasks, checks, and open goals |
| 4 | `assets/notes/animation-verification.md` | Latest test evidence and verification limits |
| 5 | `web_application_security_learning_platform.md` | Original product requirements and future backend scope |
| 6 | `design.md` | Visual system, page direction, accessibility expectations |
| 7 | `kage-landing-production-plan.md` | Full artistic/animation production ambition |
| 8 | `VISUAL_IMPLEMENTATION_PLAN.md` | Mapping between the reference plan and current implementation |

For **what works now**, follow source code, this handoff, the latest verification report, and `track.md`. The original three briefs describe intended scope and recommendations; they are not completion reports. `assets/notes/verification.md` is historical evidence from the initial frontend milestone.

## Run without installing packages

From the project root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. Any suitable static HTTP server can replace Python. Serve the whole project root so relative asset URLs resolve. Opening the HTML directly as a `file:` URL is not the supported preview workflow because the scene fetches its JSON manifest.

No `npm install`, Node runtime, bundler, API keys, environment secrets, or external CDN is required. Fonts, illustrations, textures, SVG assets, and JavaScript are local files. WebGL is optional: its failure leaves the static picture and HTML usable.

## Main files and control flow

| File | Responsibility |
| --- | --- |
| `index.html` | Entry point; static landing, shared header/sidebar, SVG icon symbols, dialog and toast containers |
| `styles/site.css` | Local font declarations, design tokens, six screen layouts, responsive rules, UI transitions |
| `scripts/app.js` | Lesson data, hash routes, render functions, dialogs, event handlers, safe simulations, notes, progress and storage |
| `scripts/scene.js` | WebGL mesh renderer, randomized shared weather, anchored silhouette sway, localized cloth/grass wind, leaves, lighting, atmosphere, lifecycle and fallback logic |
| `assets/layers/layers.json` | Desktop/portrait layer files, registered bounds, masks, static ridge correction, depths, effects, budgets |
| `assets/environments/` | Optimized static route environments and fallback illustrations |
| `assets/layers/source/` | Generated original alpha layers and background repaints |
| `assets/layers/runtime/` | Cropped/compressed textures used by the animation |
| `assets/layers/masks/` | SVG review guides; runtime mask formulas use the manifest definitions |
| `assets/source/` | Preserved original reference and generated environment source artwork |
| `assets/notes/` | Generation prompts, artwork provenance, measurements, palettes, reports |
| `kage-landing.html` | Compatibility redirect to `index.html`; do not implement new features here |
| `prototypes/kage-landing-svg.html` | Preserved earlier prototype; not the active site |

`index.html` loads `scene.js` before `app.js`, both deferred. The app creates the scene controller and calls its `update()` method when routing or motion preferences change. Hash routes are `#home`, `#learn`, `#practice`, `#analyse`, `#notes`, and `#profile`.

The scene controller owns one animation loop for WebGL and effects. It lazy-loads its manifest/textures when motion is allowed on the home route. It freezes on pause, suspends when hidden/offscreen/on another route, and uses the static illustration for reduced motion or errors. `window.KageScene.inspect()` returns diagnostics; `previewAt(seconds)` and `resume()` support deterministic visual inspection.

Weather moves smoothly between random calm/mild/breezy/gust conditions. Leaves, cloth, branches, grass, and mist share an integrated wind clock. The figure has gentle sway/breathing with its feet pinned; hat and torso do not receive cloth flutter. `inspectWind(seconds)` samples weather, `inspectPose(v)` exposes the body anchor weight, and `inspect()` includes the session seed, weather, body offset, and leaf count. See `assets/notes/animation-assets.md` for tuning locations and bounds.

## State and storage

Browser localStorage key: **`kage-dojo-v1`**.

```text
completed: lesson ID array (sqli, xss, access)
notes: { id, title, body, topic, updated } array
motionPaused: boolean
```

This state is browser- and origin-specific. Changing host/port can show a different store; clearing site data removes it. There is no sync or backup/export feature. Storage failures display a session-only notice. Notes and experiment input are escaped or rendered as text; do not introduce raw user HTML into the page.

Lesson progress comes from answering a small introductory assessment. It is not a server-validated credential or proof of security mastery. Simulations use fixed logic and fictional records; they never run submitted code or query a live target.

## Dependencies

| Task | Required |
| --- | --- |
| View/use the site | Modern browser; static HTTP server |
| Animate the hero | Browser WebGL and Canvas 2D; static fallback if unavailable |
| Use notes/progress | Browser localStorage; session-only fallback if unavailable |
| Rebuild optimized artwork | Python + Pillow |
| Run browser checks | Python + websockets + Firefox + geckodriver + local preview server |
| Generate new artwork | Image-generation capability; existing artwork works without it |

Optional tooling versions are pinned in `requirements-dev.txt`. The verified environment used Python 3.14.4, Pillow 12.1.1, websockets 15.0.1, and Firefox 148. Other Python/browser environments have not been comprehensively validated.

Optional tooling setup:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

There is currently **no React, TypeScript, Tailwind, FastAPI, PostgreSQL, Redis, Celery, Semgrep, OSV-Scanner, or secret-scanner dependency** in the implemented application. Several appear in the original product recommendations for future work.

## Editing map

- Change colours, typography, spacing or breakpoints: `styles/site.css`.
- Change navigation or static landing copy: `index.html`.
- Change lessons, assessment answers, simulations, notes or screen content: `scripts/app.js`.
- Change wind, motion lifecycle or shader/effect behavior: `scripts/scene.js`.
- Change layer registration, depth, mask geometry or export settings: `tools/prepare_scene.py`, then regenerate its output manifest/textures. Direct edits to `layers.json` will be overwritten by that script.
- Change source artwork: create a versioned source asset and update its export script. Preserve original references, alpha, prompts and provenance.
- The CSS and application script are currently grouped in large files. This is manageable for this prototype; split lesson content, routing, storage and API access into modules as backend scope grows.

## Rebuild assets and verify

```sh
python3 tools/prepare_assets.py
python3 tools/prepare_scene.py
```

These commands rewrite generated runtime exports. Run them only when source images or export configuration change. `prepare_scene.py` also writes intermediate QA composites; the browser screenshots include the renderer's registered mesh correction and are the visual acceptance reference.

For automated checks, keep the preview server running and start geckodriver in a second terminal:

```sh
mkdir -p .browser-profile
geckodriver --host 127.0.0.1 --port 4444 --profile-root "$PWD/.browser-profile"
```

Then run in another terminal:

```sh
python3 tools/animation_check.py --case all
python3 tools/browser_check.py
```

The current helpers assume Firefox is `/usr/bin/firefox`, geckodriver is at `127.0.0.1:4444`, and the preview is `127.0.0.1:8000`. On other setups, adjust those literals in the two browser helper scripts. On the original Linux machine, geckodriver was available inside the Firefox snap rather than on PATH. Browser setup/port permissions are environment-specific.

Latest animation pass: **42 animation/fallback checks** after the random-wind/silhouette update. The previous **48 workflow/layout checks** remain the frontend milestone evidence; that suite was not rerun for the animation-only change. Raw JSON and screenshots are in ignored `output/qa/`; regenerate them after a fresh checkout. Durable summaries are committed-intended Markdown files under `assets/notes/`.

## Open work and next goals

1. Check visuals, input, performance and accessibility in Chrome/Safari and on physical phones/laptops. Current browser evidence is headless Firefox/software rendering, not a hardware 60 fps guarantee.
2. Prepare a genuine higher-resolution master and art bleed. The attempted larger image was returned at native resolution. Original and reconstructed artwork differ in fine detail; do not claim pixel identity.
3. Review lesson content and expand exercise/assessment depth. Current lessons are introductory and have not received a separate expert curriculum review.
4. Decide the backend/API and persistence implementation, then build ZIP validation, isolated jobs/scanners, normalized findings, remediation links and repeat-scan comparison. GitHub integration can follow ZIP upload as the product brief allows.
5. Add accounts, cloud sync, privacy/retention controls and release/deployment checks when that scope is implemented.

Not implemented: real uploads/scanning, repository authorization, reports from actual scanners, scan history/comparison, account sign-in, public rankings, cloud notes/progress, expanded future disciplines, or production hosting. Their preview/dialog/locked states are intentional.

## Repository handoff checkpoint

At this audit, Git reports no commits and all project files are untracked. The work exists in the workspace, but there is no committed revision to clone or roll back to. A reviewed initial commit and backup/remote handoff are still needed; no commit or push was performed as part of this documentation audit.

Do not include `.browser-profile/`, local note/browser data, or temporary QA output in a handoff commit. `.gitignore` already excludes the browser profile, virtual environment, logs, and raw QA directory. Review large source-art files and decide on an appropriate repository/asset-storage policy before publishing them.

At the end of each subsequent task, update `track.md` with changed files, checks actually run, results, and remaining limits.
