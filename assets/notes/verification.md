# Visual milestone verification — 2026-10-19

This is the historical report for the initial visual frontend. The subsequent layered-animation implementation and its current limits are documented in `animation-verification.md` and the root `track.md`.

## Browser and environment

Checked with local headless Firefox 148 through geckodriver, using the local HTTP preview. Exact content viewport sizes use the WebDriver BiDi `browsingContext.setViewport` command, rather than relying on the browser window's minimum width. The browser helper requires Python's `websockets` package; the site itself has no package dependencies.

## Passed checks

- **47 browser workflow/layout checks** passed in one complete run. The output is `output/qa/results.json`.
- **4 additional motion checks** passed. The output is `output/qa/motion-results.json`.
- HTML resource paths, CSS font/image URLs, unique static IDs, seven generation-prompt files, and runtime artwork availability were checked locally.

The workflow run exercises CTA navigation; map/list switching; opening lessons; SQL, XSS, and ownership simulations; rejection of an incorrect assessment answer; completion after a correct answer; progress updates; note creation, search, editing, persistence after reload, inert rendering of HTML-like input, and confirmed deletion; global search; arena filters; and mobile navigation. It checks that the analysis view does not claim a scan has run.

Desktop and phone route views were checked for horizontal overflow. Landing headline bounds and separation of actions from the feature strip were checked at 320 × 740, 390 × 844, 620 × 900, 768 × 1024, and 2560 × 1080. Representative screenshots also cover 1586 × 992 and 1366 × 768. The smallest-phone check found an overlap; the final layout uses document flow for mobile copy/actions/features and passes that check.

The functional/layout run used the reduced-motion preference. The separate motion run verifies that the canvas changes when animation is allowed, the pause control changes its state, pausing clears the canvas, and changing routes clears the particles. The implementation also suspends work for a hidden document or an offscreen hero, though those two lifecycle transitions were not separately automated.

## Visual inspection

Inspected desktop landing, laptop landing, full portrait landing, learning map, and profile screenshots, plus a contact sheet of the six desktop and phone screens. A 50% overlay comparison is saved at `output/qa/landing-reference-overlay.png`.

The illustrated composition and broad layout follow the supplied reference closely. Font shapes, some spacing, the reconstructed hidden artwork, verified Japanese seal, and factual feature-strip copy differ. This is not a claim of a pixel-identical result or alignment within a few pixels everywhere.

Screenshots are local ignored QA artifacts under `output/qa/`, not deployed public files. `landing-mobile-full.png` captures the complete flowing phone composition.

## Runtime artwork

| Asset | Compressed bytes | Approximate KiB |
| --- | ---: | ---: |
| Desktop landing | 266,046 | 260 |
| Portrait landing | 259,772 | 254 |

Both artwork files are below the production plan's respective 2.5 MB and 1.2 MB budgets. These figures exclude HTML, CSS, JavaScript, and fonts. Full route artwork sizes are in `runtime-manifest.json`. Local font assets total approximately 1.4 MB; actual font loading depends on the text displayed. Route environments are applied only on their corresponding route.

## Remaining work and verification limits

- No Chrome, Safari, physical-phone, GPU-memory, or measured 60 fps validation was performed.
- Browser-driver sessions were terminated by the execution environment during supplementary attempts; the complete successful workflow/layout and motion results above were retained. A subsequent redundant screenshot run could not start after the driver stopped.
- High-resolution upscaling, bleed, independent depth layers, character/cloth/grass masks, hidden-area repaints, and WebGL wind effects are not implemented. The current image remains undistorted; motion consists of optional foreground particles.
- Code analysis, GitHub integration, authentication, cloud persistence, public rankings, and production hosting remain future stages.
- The lessons are introductory content and controlled simulations, not a complete expert-reviewed curriculum or a scanner.

## Preview again

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. The older `kage-landing.html` URL redirects to `index.html`. No Node installation is needed for this milestone.
