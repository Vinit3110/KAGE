# Layered landing animation verification — 2026-10-19

## Result

The latest random-wind/silhouette pass passed **42 animation/fallback checks** in Firefox 148. The earlier **48 frontend workflow/layout checks** remain the frontend milestone evidence; they were not rerun for this animation-only change. The successful result files are local ignored QA artifacts:

- `output/qa/animation-active-results.json`: 33 rendering, motion, weather, lifecycle, and mobile checks.
- `output/qa/animation-reduced-results.json`: 3 reduced-motion checks.
- `output/qa/animation-no-webgl-results.json`: 3 no-WebGL checks.
- `output/qa/animation-missing-results.json`: 3 missing-layer checks.
- `output/qa/results.json`: 48 lesson, note, navigation, and responsive checks.

## Animation checks

Verified four desktop layers, no reported WebGL errors, zero wind weights at the torso and hat, nonzero weights at cloth tips, anchored lower ground, allocation budgets, advancing frames, and smoothed pointer response under desktop mouse emulation. A six-hour phase preview renders without GL errors; shader inputs use wrapped angles to avoid unbounded low-precision time values.

The latest pass also verifies all four weather regimes (calm/mild/breezy/gust), leaf-speed variation greater than threefold, bounded strength, smooth transitions, irregular regime intervals, and continuous integrated phase across a 180-second sample at 0.01-second intervals. Seeded weather seeks and backward-seeking leaf paths reproduce. Upper-body pose changes gently, its displacement stays bounded, and the foot anchor weights stay zero. Leaf budgets remain 45 desktop / 20 portrait. Pause freezes weather as well as rendering. The active browser fixture uses seed `0x4b414745`; production chooses a fresh seed on each page load.

Verified that pause freezes the scene; other routes, offscreen hero, and an inactive browser tab stop the loop; returning resumes it. Losing the WebGL context reveals the original image, and restoring the context rebuilds all four layers.

Verified the separate two-layer portrait composition, zero phone pointer depth, a mobile frame count consistent with the 30 fps cap, no mobile horizontal overflow, and switching back to desktop. Reduced motion skips layer loading and retains the static image. Disabling WebGL and making a character texture unavailable each leave the static artwork and navigation usable.

## Visual checks

Inspected the new strongest-gust desktop frame and portrait frame, alongside the existing rest/wind framing. The figure stays on the corrected ridge, copy remains readable, and the inspected frames show no exposed background gaps or obvious white alpha fringes. The samurai now sways subtly; hat/torso remain excluded from the stronger cloth flutter. The original silhouette/detail is not perfectly reproduced by the generated extraction, so pixel identity is not claimed. New inspection frames include `output/qa/animated-calm.png`, `animated-gust.png`, and `animated-mobile.png`.

Historical measurements from the earlier fixed-wind milestone: mean per-channel absolute pixel differences between its rest and 4-second screenshots (0–255 scale):

| Sample region | Mean difference |
| --- | ---: |
| Hat | 0.000 |
| Torso | 0.043 |
| Cloth/hem | 5.518 |
| Grass | 5.600 |
| Maple | 2.730 |

These numbers document the earlier milestone, when the hat/body were rigid. They do not measure the new silhouette sway and should not be used as current frame comparisons. Bounds and values are saved in `output/qa/animation-pixel-regions.json`. Sample screenshots and automated checks do not prove every frame is artifact-free.

The layout regression covers landing headline bounds and action/feature separation at 320, 390, 620, 768, and 2560-pixel widths. Workflow checks exercise real lesson completion, safe simulations, local notes, persistence after reload, search, filters, mobile navigation, and inert rendering of HTML-like note content.

## Asset and memory budgets

| Variant | Runtime layer files | RGBA texture estimate |
| --- | ---: | ---: |
| Desktop, four layers | 690,684 bytes | 13,347,424 bytes / 12.7 MiB |
| Portrait, two layers | 422,106 bytes | 8.4 MiB |

The original flat fallback adds 266,046 bytes on desktop or 259,772 bytes on mobile. Combined artwork remains below the respective 2.5 MB / 1.2 MB targets. Fonts, application code, and browser overhead are separate.

Known texture allocations plus the measured test color-buffer dimensions are below the 250 MB target. DPR is capped at 1.5 for desktop and 1.25 for portrait; the controller can lower desktop DPR when measured submission cost is consistently high. These are allocation estimates and controls, not a GPU-profiler measurement of all browser/driver memory.

## Remaining limits

- Firefox ran headlessly with software rendering. Chrome, Safari, physical devices, sustained thermal behavior, and actual hardware 60 fps performance remain unverified.
- High-resolution master generation returned at 1586 × 992 despite the requested larger size. Genuine recovered-detail upscaling and the separate art bleed are still open. The renderer uses bounded offsets and a 2% desktop overscan to protect edges.
- Static distant scenery is merged into one layer; there are no individually drifting extracted cloud sprites or per-temple light textures. The current lighting and waterfall effects are deliberately subtle shader changes.
- Static fallback and the animated reconstruction differ in some artwork detail. UI and overall composition remain consistent.
- Backend scanning, authentication, GitHub integration, and cloud persistence are outside this animation task.

## Reproduce

Serve the project with `python3 -m http.server 8000 --bind 127.0.0.1`. Start geckodriver at `127.0.0.1:4444` with a writable profile root, then run `python3 tools/animation_check.py --case all` and `python3 tools/browser_check.py`. The browser helpers require Python `websockets`; the website requires no build or package install.

Artwork sources, complete generation prompts, mask definitions, and registration are described in `animation-assets.md`. Current work and follow-up goals are tracked in the root `track.md`.
