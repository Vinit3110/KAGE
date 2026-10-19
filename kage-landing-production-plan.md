# KAGE Landing Page: Pixel-Match Production Plan

Goal: the live website looks like the reference mockup (`Cyber_Samurai_Discipline_Landing_Page_1.png`, 1586×992) and moves with wind, in the browser.

All coordinates below are approximate, in mockup pixels (1586×992). To convert to a percentage, divide x by 1586 and y by 992.

---

## 0. How this works (the whole idea in 10 lines)

1. The mockup is a flat picture with text and UI burned into it.
2. Remove all text and UI from the picture, so only the artwork is left (the **clean plate**).
3. Upscale the clean plate to high resolution.
4. Cut the plate into **layers** (sky, mountains, ronin, grass, leaves, etc.).
5. Repaint the hidden area behind every cut-out so layers can move without leaving holes.
6. Paint a **motion mask** for every layer that should move (white = moves in wind, black = stays still).
7. Optionally generate a **depth map** for parallax.
8. Export optimized WebP/AVIF files.
9. Build a WebGL scene that stacks the layers, with a shader that moves the masked areas.
10. Rebuild all text, buttons, nav and the stats strip as real HTML/CSS on top, measured against the mockup.

---

## 1. Honest constraints

- **"Exactly like the mockup" is reachable for the still frame.** Once things move, a pixel-for-pixel match only exists at rest.
- **The hardest part is the artwork, not the code.** The clean plate and the hidden-area repaints decide the final quality.
- **The mockup is low resolution.** At 1586×992 it will look soft on a 1440p or 4K display. Upscaling is mandatory.
- **Some mockup text is garbled AI text.** The seal under 学び続ける is not a real, verified character set. Do not copy it. Redraw it (see 9.9).
- **Check the licence** of the tool that generated the mockup before using its output commercially.
- **GPU memory is a hard limit.** A full-screen RGBA layer at 2816×1760 costs about 20 MB of GPU memory. See 3.4 for the budget.

---

## 2. Tool kit

| Job | Options |
|---|---|
| Layered master file | Photoshop (best), Photopea (free, browser), Krita + AI diffusion plugin (free) |
| Remove text/UI, repaint hidden areas | Photoshop Generative Fill, Firefly, ComfyUI inpainting workflow, Krita AI inpaint |
| Upscale | Upscayl, Real-ESRGAN, Topaz Gigapixel, Magnific |
| Cut-outs | Photoshop Select Subject + Color Range, Segment Anything (SAM), rembg, manual pen/lasso |
| Depth map | Depth Anything V2 or MiDaS |
| Compression | Squoosh, `cwebp`, `avifenc` |
| Tileable fog / noise | Photoshop Clouds filter + offset, Krita, or a procedural noise texture in the shader |
| Seal / icons / ornaments | Figma or Inkscape → SVG |
| WebGL | PixiJS (easiest), OGL (lightweight), three.js (heaviest) |
| Frontend | React + TypeScript + Tailwind (your decision), implemented in Antigravity IDE |
| Overlay comparison | Browser devtools opacity trick, or Figma/Photopea with the mockup at 50% opacity |

---

## 3. Master specs (decide once, then keep)

### 3.1 Resolutions

| Item | Value |
|---|---|
| Mockup aspect ratio | 16:10 (1586×992 ≈ 1.6) |
| Visible design frame (master) | 3200×2000 |
| Bleed per side | 5% (160 px left/right, 100 px top/bottom) |
| Master layer canvas (with bleed) | 3520×2200 |
| Runtime desktop layers (full-frame) | 2816×1760 (that is 2560×1600 + 5% bleed) |
| Runtime mobile layers (full-frame) | 1408×880 |

The bleed exists so parallax and wind never reveal an edge. Every layer must be painted out to the bleed, not just the visible frame.

### 3.2 Colour

- Work in sRGB, 8-bit for exports, 16-bit for the PSD if you can.
- Sample the UI reds from the mockup with an eyedropper. Do not guess them.
- Keep a swatch file (`palette.json`) with: sky dark, sky mid, cloud bright red, sun core, sun edge, headline red (light to dark), button red, grey for "SECURES", cream text, nav white.

### 3.3 Naming and folders

```
kage/
  source/
    mockup_original.png
    clean_plate_upscaled.png
    kage_master.psd
  layers/
    master/        (PNG, full quality, with alpha)
    runtime/       (WebP/AVIF, optimized)
    masks/         (PNG, grayscale)
    depth/         (PNG, grayscale)
  ui/
    seal.svg
    icons/
  notes/
    palette.json
    measurements.md
```

Layer file naming: `NN_group_name.png`, where NN is the stacking order (00 = back).
Example: `16_ronin_body.png`, `17_ronin_cloak_tails.png`.

### 3.4 GPU texture budget

- A full-frame 2816×1760 RGBA texture ≈ 20 MB in GPU memory (width × height × 4 bytes). File size on disk does not matter for this.
- Target a total of **250 MB or less** on desktop. That is about 8 to 10 full-frame layers plus many small tight-cropped ones.
- Rules:
  - Layers that cover the whole frame (sky, mountains, valley) are full-frame.
  - Small things (cloak tails, leaf clusters, katana, torii, birds, petals) are **cropped to their bounding box**, with a recorded x/y offset, not full-frame.
  - Merge layers that move together (for example far mountains and the pagoda hill) into one texture.
- Mobile gets its own smaller set (see Phase 10).

---

## 4. Inventory: every element in the mockup

### 4.1 Artwork (goes into layers)

| # | Element | Where (mockup px) | Notes |
|---|---|---|---|
| A1 | Sky gradient | whole top | Black-red at the top, bright red toward the horizon |
| A2 | Sun disc | center ≈ (1140, 345), radius ≈ 140 | Horizontal cloud streaks cut across its lower half |
| A3 | Sun glow | around the sun, radius ≈ 400 | Soft red halo, separate additive layer |
| A4 | Far clouds | across the sky right of center | Bright red wisps and bands |
| A5 | Near dark clouds | top right (x 600–1586, y 0–260) and top left | Heavy dark-red masses with bright edges |
| A6 | Cloud bands low on horizon | x 400–1500, y 400–470 | Thin glowing streaks |
| A7 | Birds | ≈ 12 birds, x 1000–1350, y 150–340 | Three sizes |
| A8 | Far mountains | horizon, x 0–1586, y 380–500 | Purple-red haze |
| A9 | Hill with castle/pagoda | x 1000–1120, y 380–480 | Tiered pagoda on a peak |
| A10 | Mid mountains and mist bands | x 600–1586, y 450–600 | Fog between ridges |
| A11 | River with red sun reflection | x 1090–1450, y 490–720 | S-curve through the valley |
| A12 | Pine forests (mid) | x 700–1586, y 520–800 | Dark silhouettes in mist |
| A13 | Torii bridge | x 1210–1300, y 640–690 | Small, on the river |
| A14 | Large temple with lit windows | x 1340–1460, y 590–690 | Tiered roofs, warm red lights |
| A15 | Second temple, far right | x 1520–1586, y 520–600 | Partly cut by the frame edge |
| A16 | Waterfalls | (1490–1530, 545–610), (1405–1430, 725–780), (1480–1510, 770–820), (1150–1165, 690–710) | Four separate thin falls |
| A17 | Lower torii gates | (1090–1140, 770–850), (1160–1230, 795–850) | Foreground of the right side |
| A18 | Ronin body | x 690–1015, y 430–805 | Silhouette with kasa hat |
| A19 | Kasa hat | x 775–895, y 430–475 | Part of the ronin, keep sharp |
| A20 | Cloak tails / torn ribbons | left of the body, x 640–780, y 510–700 | The main cloth to animate |
| A21 | Hat ribbon / scarf | left of the hat, x 690–780, y 510–540 | Thin streamer |
| A22 | Katana | from (895, 640) to (1010, 765) | Thin blade with a highlight |
| A23 | Cliff and rocks | x 560–1000, y 760–830 | Where the ronin stands |
| A24 | Foreground left hill with red grass | x 0–700, y 640–992 | Dark with red-lit grass tips |
| A25 | Grass near the ronin's feet | x 600–1000, y 740–830 | Tufts in front of the legs |
| A26 | Foreground right red foliage | x 950–1586, y 780–992 | Red ground cover |
| A27 | Top-left tree branch and trunk | x 0–720, y 0–200 | Dark branches |
| A28 | Red maple leaf clusters | on the branch, 6 to 10 clusters | Bright red against dark |
| A29 | Falling petals | ≈ 10 visible (e.g. (650,517), (232,732), (125,562), (618,812), (760,675), (915,915), (1030,960), (860,955)) | Remove from the plate and recreate as particles |
| A30 | Fog / mist | valley, lower mid, foreground | Separate soft layers |
| A31 | Vignette | all edges | Dark corners |

### 4.2 UI (rebuilt as HTML/CSS, **not** part of the image)

| # | Element | Where (mockup px) |
|---|---|---|
| U1 | Left-edge red dotted line | x ≈ 30–50, y 0–380, with 3 to 4 dots near the bottom |
| U2 | Logo 影 (red kanji, with glow) | x 92–133, y 40–82 |
| U3 | Wordmark "K A G E" | starts x 166, y ≈ 60, very wide letter spacing |
| U4 | Nav links: Learn, Practice, Analyse, Notes, Leaderboard | x 385, 489, 609, 727, 827 at y ≈ 60 |
| U5 | Search icon | x ≈ 1325, y 60 |
| U6 | Vertical divider | x ≈ 1364, y 40–80 |
| U7 | Sign In button | x 1392–1539, y 40–80 (147×40) |
| U8 | Hero vertical line | x ≈ 113, y 215–640, with a small red tick at y ≈ 455 |
| U9 | Eyebrow "// CYBERSECURITY DOJO" + line | x 152–470, y 220 |
| U10 | Headline, 3 lines | x 158–620, y 255–478 |
| U11 | Subtext, 2 lines | x 160–585, y 505–560 |
| U12 | Button BEGIN YOUR JOURNEY → | x 158–468, y 594–650 |
| U13 | Button EXPLORE PATHS | x 487–662, y 596–648 |
| U14 | Left vertical text 影の道 | x ≈ 49, y 475–550 |
| U15 | Red dash + THE / SHADOW / PATH | x ≈ 40–90, y 570–620 |
| U16 | Right vertical text 学び続ける | x ≈ 1505, y 185–445 |
| U17 | Red seal stamp | x ≈ 1490–1520, y 455–495 |
| U18 | Bottom red line | y ≈ 832, x 100 to about 1250 (fades to the right) |
| U19 | Stats strip: 4 icon + text items with dividers | y 865–915, items start x 100, 310, 515, 715 |

---

## 5. Phase plan (in this order)

Do not skip ahead. Each phase has an exit check. If the check fails, fix it before moving on.

### Phase 0: Prepare (about 1 hour)

1. Save the mockup untouched as `source/mockup_original.png`.
2. Create `palette.json` and `measurements.md`.
3. In `measurements.md`, write down for every UI element in 4.2: pixel position, size, font look, colour hex (eyedropper), and spacing. Use the table in 4.2 as the start.
4. Set up the folder structure from 3.3.
5. Decide the tool path for step 1 (Photoshop vs ComfyUI vs Krita).

**Exit check:** the folder exists and `measurements.md` is filled in for at least the headline, nav, buttons and strip.

---

### Phase 1: Clean plate (remove all text and UI)

Remove everything listed in 4.2 from the picture, so only artwork remains.

1. Work at the original size first to keep the edges honest, then upscale in Phase 2. (If your inpainting tool handles larger sizes, you can upscale first. Test both on one region.)
2. Remove in this order, one area at a time, one inpaint pass each:
   1. Header: logo, wordmark, nav, search icon, divider, Sign In (top strip, y 30–90).
   2. Headline, eyebrow, subtext, buttons (left block, x 150–670, y 210–660).
   3. Left vertical text, dash, THE SHADOW PATH (x 30–100, y 470–630).
   4. Right vertical text and seal (x 1480–1530, y 180–500).
   5. Left-edge red dotted line and the hero vertical line (x 25–55 and x ≈ 113).
   6. Bottom red line and the whole stats strip (y 825–920).
3. For each area, mask only the UI pixels plus a small margin (4 to 8 px), then inpaint.
4. Use the inpainting prompt in 8.1.
5. What to expect underneath each area:
   - Behind the headline: dark hillside, dark red leaves and sky. Quiet and easy to fill.
   - Behind the header: red clouds and the dark branch. Keep the branch continuous.
   - Behind the stats strip: dark grass and red foliage. Keep grass tips pointing the same way.
6. Remove the baked-in **birds** and **petals** too (A7, A29). They return as animated sprites.
7. Compare to the original at 50% opacity: composition, colours and brightness must match everywhere outside the repaired areas.

**Exit check:** zoom to 200%. There is no leftover text, outline, glow halo or smudge. No repeated-texture pattern in the repaired areas.

---

### Phase 2: Upscale

1. Upscale the clean plate to **3200×2000** (about 2× on the longest side). Use a painterly/anime-style upscaling model, not a photo model.
2. Do not push sharpening. Over-sharpened upscales look crunchy on gradients and silhouettes.
3. Check the sun edge, the ronin silhouette, the leaf edges and the tiny temples. These show artifacts first.
4. If one region comes out badly (temples, torii), repaint it by hand or re-run just that region.
5. Save as `source/clean_plate_upscaled.png`.
6. Bring it into `kage_master.psd` on a canvas of **3520×2200**, centered, so there is a 160/100 px bleed band around it.
7. **Outpaint the bleed.** Extend the sky, mountains, grass and foliage out into the empty band, using generative expand or inpainting. Do it per layer later if easier (see Phase 4), but the flat plate should already have it as a visual reference.

**Exit check:** the plate looks sharp and clean at 100% on a 2560-wide display, and the bleed band has no obvious seams.

---

### Phase 3: Separate the layers

Cut the plate into the layers below. **Back to front.** Use a duplicate of the plate for each cut, so the original stays untouched.

For every cut:
- Make the selection, **feather 1 to 2 px**, then **contract 1 px** to avoid light halos.
- Save the cut onto its own layer with alpha.
- Do **not** delete from the plate yet. Phase 4 handles what is behind.
- Remove edge fringing: use Defringe/Decontaminate Colors. Red-lit edges against dark backgrounds fringe badly.

#### Layer list

| Order | Name | Contains | How to separate |
|---|---|---|---|
| 00 | `00_sky_base` | Gradient sky only, no clouds | Repaint from scratch with a gradient + soft clouds removed. Full-frame, opaque. |
| 01 | `01_sun_glow` | Halo around the sun | Paint a soft radial in screen/add mode, sampled from the sky colours. Full-frame, alpha. |
| 02 | `02_sun_disc` | Sun disc only, round, with the horizontal cloud streaks left out | Ellipse selection on the sun. Repaint the streaks removed. Crop to ≈ 640×640. |
| 03 | `03_clouds_far` | Bright red wisps and bands (A4, A6) | Color Range on bright red against dark. Paint masks for soft edges. Full-width strip. |
| 04 | `04_clouds_near` | Heavy dark clouds with bright edges (A5) | Luminosity selection of the dark cloud masses, manual cleanup on the edges. Two crops: top-right and top-left. |
| 05 | `05_birds` | **Not cut.** Recreated at runtime. | See 9.7. Remove from the plate in Phase 1. |
| 06 | `06_mountains_far` | A8 | Pen tool along the ridge line. Include the haze. Full-width strip. |
| 07 | `07_hill_castle` | A9 hill with pagoda | Pen tool. Merge with 06 if they move together. |
| 08 | `08_mist_a` | Fog between far and mid ridges | Paint new soft fog bands (see 9.6). Not cut from the plate. Tileable, loopable. |
| 09 | `09_mountains_mid` | Mid ridges + pine forests behind the river (A10, A12) | Pen tool along the lower edge of the ridge. |
| 10 | `10_river` | A11 river, with sun reflection | Pen tool on the river polygon. Separate the reflection streaks into `10b_river_reflection`. |
| 11 | `11_bridge_torii` | A13 | Pen tool. Small crop (~ 160×110 at mockup scale). |
| 12 | `12_temple_main` | A14 | Pen tool. Separate the lit windows into `12b_temple_lights` (glow sprites). |
| 13 | `13_temple_edge` | A15 | Pen tool. Crop to the right edge. |
| 14 | `14_waterfalls` | A16, four falls | Four tight crops, each with a mask for the falling water shape. |
| 15 | `15_forest_mid` | Pines in front of the river (A12 lower part) | Luminosity cut, manual cleanup. |
| 16 | `16_torii_lower` | A17 | Pen tool. Two crops. |
| 17 | `17_ground_right` | A26 foreground red foliage, right side | Color Range on red foliage, plus the dark ground beneath. |
| 18 | `18_ronin_body` | A18 + A19 + A23 contact area, **without** cloak tails, ribbon, katana | Select Subject, then Color Range/luminosity. He is a near-black silhouette against red, so edges are clean on the right side. Paint the left edge by hand (the cloak merges into dark grass). |
| 19 | `19_ronin_cloak_tails` | A20 | See 5.3. |
| 20 | `20_hat_ribbon` | A21 | See 5.3. |
| 21 | `21_katana` | A22 | Pen tool, thin polygon. Keep the highlight line on the blade. Crop to ≈ 140×140. |
| 22 | `22_cliff_rocks` | A23 | Pen tool. Includes the rim lighting. |
| 23 | `23_grass_back` | Grass behind the ronin, left hill | Luminosity + red color range. Band along the hill. See 5.4. |
| 24 | `24_hill_left` | A24 dark hill (no grass tips) | Pen tool. Opaque base. |
| 25 | `25_grass_mid` | Mid grass band | See 5.4. |
| 26 | `26_grass_front` | Grass in front of the ronin's feet (A25) and bottom | See 5.4. |
| 27 | `27_branch_trunk` | A27 dark branch and trunk | Luminosity cut (dark on red). |
| 28 | `28_leaves_cluster_A` … `_J` | A28, each cluster as its own layer | See 5.5. |
| 29 | `29_fog_front` | Low mist at the very bottom | Paint new. Tileable. |
| — | `petals`, `birds`, `vignette`, `grain` | Runtime effects | Not layers in the PSD. See Phase 7. |

#### 5.3 Cloak tails, ribbon and the ronin (extra detail)

This is the most visible animation, so it gets the most care.

1. **Ronin body** is static. It must be a clean silhouette, cut so the cloak area at the left shoulder ends at a clear seam. Leave a **small overlap** (about 8 to 12 px) where tails attach, so they hide the join.
2. **Cloak tails** (the torn cloth streaming left): the cloth merges into dark grass, so luminosity cuts will fail. Do this instead:
   - Cut what you can, then **repaint the tails by hand** on a new layer: draw 3 to 5 tail shapes as separate strips (upper, middle, lower, plus 1 or 2 small tatters), with torn, jagged ends, in the plate's dark red-black.
   - Keep the base of each tail at the shoulder/hip where it attaches. Note that attachment point (x, y) for each tail, because it becomes the **pivot** for the animation.
   - Give each tail a rim light on the sun side (right edge) to match the body.
3. **Hat ribbon:** a thin streamer behind the hat. Same method, one strip, pivot at the hat rim.
4. **Katana:** separate, so a glint can run along the blade. Keep the blade slightly lighter than the body.
5. After cutting, the ronin has to hold together as one figure when everything is put back at rest. Check by overlaying at 50% against the clean plate.

#### 5.4 Grass: separation rules

- **Never cut individual blades.** Separate in **bands**:
  - `23_grass_back` (behind the ronin, dim, small),
  - `25_grass_mid` (middle height),
  - `26_grass_front` (in front of the feet and bottom, largest and darkest).
- Each band has dark blade bodies with red-lit tips. Keep the tips in the same layer as the blades.
- Make the band edges soft at the top (tips) so a wind shader can bend them without a hard edge.
- Optionally cut 3 to 5 **hero tufts** near the ronin's feet as small sprites (e.g. `26b_tuft_01.png`). They can sway on their own phase.

#### 5.5 Leaf clusters

- The plate has about 6 to 10 visible red clusters on the top-left branch. Cut **each cluster** separately.
- Use Color Range on the bright reds. Dark leaves partly merge into the dark sky and branch, so add manual masking there.
- Name them `28_leaves_cluster_A` through `_J`. Record each cluster's **pivot** (where it joins the branch).
- Leave a few small loose leaves around the clusters as separate sprites (`28_leaf_loose_01`…).
- Keep the branch and trunk in `27_branch_trunk` (static or barely moving).

**Exit check (Phase 3):** every layer is on its own, named, with clean alpha. Toggling all layers on reproduces the clean plate with no visible seam when compared at 50% opacity.

---

### Phase 4: Repaint what is behind each cut

When a layer moves, the area behind it shows. That area must exist.

For every layer in Phase 3 that sits in front of another layer, **fill the hole it leaves** on the layer behind. Work **front to back** (start with the foreground, finish with the sky).

| Cut layer | What to paint behind it (on the layer behind) |
|---|---|
| Leaf clusters | Dark sky and branch continuing through the cluster area |
| Branch and trunk | Sky and clouds continuing |
| Grass bands | Dark hillside, plus a little red ground glow |
| Cloak tails and ribbon | Dark grass, hill and sky exactly where the cloth was, so the swing exposes a believable background |
| Ronin body | Valley, mist, pines and river continuing behind him. This is a large hole, so generate it carefully (see 8.2). |
| Katana | Valley/river behind the blade |
| Cliff/rocks | Dark hillside |
| Temples, torii, bridge | Forest, mist and river as appropriate |
| Waterfalls | Cliff face |
| Sun disc | Sky behind it (so it can pulse or glow without a hole) |
| Clouds | Sky gradient |

Rules:
- Extend each background beyond the exact hole by at least **30 to 60 px** (the maximum travel distance of any moving layer in front, plus the parallax shift).
- Paint **out into the bleed** for every layer (Phase 2, step 7).
- Keep the lighting direction consistent: the light is at the sun, right of center.

**Exit check:** push each moving layer 60 px in the direction it will move (left for wind items). No holes, no hard lines, no lighting that contradicts the plate.

---

### Phase 5: Masks and depth maps

#### 5.1 Motion masks (grayscale PNG, same size as the layer)

White = full wind effect. Black = no movement. Grey = partial.

| Layer | Mask rule |
|---|---|
| `19_ronin_cloak_tails` | Black at the attachment point, a **smooth gradient to white** at the free ends. White for the tatters. |
| `20_hat_ribbon` | Same: black at the hat, white at the free end |
| `23_grass_back`, `25_grass_mid`, `26_grass_front` | Black at the root (bottom of the band), **white at the tips**. Paint a vertical gradient, then paint noise to break up uniformity. |
| `28_leaves_cluster_*` | Mostly white on the leaves, grey near the branch join |
| `26b_tuft_*` | Black at the root, white at the tips |
| `10_river` / `10b_river_reflection` | White over water only |
| `08_mist_a`, `29_fog_front` | All white (they drift as a whole) |
| `14_waterfalls` | White inside the fall shape only |
| `04_clouds_near`, `03_clouds_far` | All white for drift, with grey near the sun |
| `02_sun_disc`, `01_sun_glow` | All white for pulse (very small amplitude) |

Tips:
- Use a large **soft brush** (hardness 0 to 20%). Hard mask edges show up as visible tearing lines when the shader bends the pixels.
- A mask must **never** have an abrupt black/white edge crossing an area of detail.
- Also paint a second mask for **flutter** (high-frequency motion) on the cloak tails and leaves: white on the tips only, black elsewhere.

#### 5.2 Optional: pack masks into channels

To save texture memory, one mask texture can hold four masks:
- R = wind amount
- G = flutter amount
- B = phase offset (random per region, for desynchronization)
- A = unused (or parallax weight)

#### 5.3 Depth maps (optional, but gives the 3D feel)

1. Run Depth Anything V2 (or MiDaS) on the **clean plate**.
2. Check the result: the sun and sky should be far (dark or white, depending on the convention), the ronin close, the grass closest.
3. Fix errors by hand: depth models usually get the ronin silhouette and the grass wrong.
4. Save as 8-bit grayscale, at **half** the resolution of the layers (depth does not need to be sharp).
5. Used for: a subtle camera shift driven by mouse position (2.5D parallax), applied on top of the per-layer parallax.

**Exit check:** each mask, viewed alone, has smooth gradients and no hard edges. The depth map shows the ronin clearly in front of the valley.

---

### Phase 6: Export and optimize

1. Export every layer from the PSD:
   - **Master:** PNG with alpha → `layers/master/`.
   - **Runtime:** WebP or AVIF with alpha → `layers/runtime/`.
2. Sizes:
   - Full-frame layers: 2816×1760 (desktop), 1408×880 (mobile).
   - Small layers: tight crop at the same pixel density as the full-frame layers, with a recorded offset.
3. Quality: start at 75 to 85 for lossy, check gradients (sky, sun glow, fog) for banding. If banding shows, raise quality or add a tiny bit of noise before compressing.
4. Opaque layers (sky, mountains base, hill) don't need alpha. Use AVIF or JPEG-quality WebP.
5. Write a `layers.json` manifest, one entry per layer:
   ```
   name, file, x, y, width, height, order, depthParallax, mask file,
   windAmount, flutterAmount, pivotX, pivotY, blendMode
   ```
6. Targets: whole hero **under 2.5 MB** on desktop (stretch goal 1.5 MB), under 1.2 MB on mobile.
7. Generate the lowest-quality **blur-up placeholder** (a tiny 32 px version of the flattened scene) to show while the real layers load.

**Exit check:** all runtime files load, total weight is within target, no visible banding.

---

### Phase 7: Build the WebGL scene (in Antigravity IDE)

1. Canvas sits behind the HTML at `position: absolute; inset: 0; z-index: 0`. HTML content sits above it.
2. Use PixiJS (recommended) or OGL.
3. Load `layers.json`. For each layer, create a textured sprite at its recorded position and scale. Position everything relative to the 3200×2000 design frame, scaled to **"cover"** the viewport (like `object-fit: cover`), anchored at the center-right (about 55% x, 55% y) so the ronin and sun stay in view.
4. Stack in the order from the layer table.
5. Apply a **displacement/wind filter** to each layer that has a mask (see section 7 for parameters). Core idea in the shader:
   - Sample a scrolling noise texture.
   - Offset the layer's UV by `(noise - 0.5) * amplitude * mask`.
   - Wind moves toward the left (it blows from the right, as the cloth and grass lean in the mockup).
6. Add the global **wind function**: `wind(t) = base + sin(t·0.5)·gust1 + sin(t·1.3)·gust2`. All layers read the same value, so gusts hit the whole scene together. Add a small per-layer phase offset (from the mask's B channel) so it does not look robotic.
7. Add **gust travel**: the gust phase also depends on x, so gusts sweep right to left across the grass.
8. Add the particles:
   - **Petals/leaves:** 40 to 60 sprites. 2 to 3 sprite types. Foreground ones are larger, blurred and faster; background ones are smaller and slower. Motion: wind drift to the left, slow fall, tumble (flip by scaling Y with cosine).
   - **Embers/dust (optional):** 20 tiny red dots drifting upward near the horizon.
   - **Birds:** 10 to 12 sprites on slow loops (see 9.7).
9. Add the **parallax**: layers shift opposite to the pointer, scaled by a per-layer depth value (see section 7). Smooth with an exponential lerp (≈ 0.06 per frame). Disable on touch devices.
10. Add **post effects** (CSS or shader, whichever is cheaper):
    - Vignette (dark corners).
    - Film grain (static texture, very low opacity, overlay blend).
    - A very light left-side darkening behind the headline (only if the text contrast needs it).
11. **Fallback:** if WebGL is unavailable or the user prefers reduced motion, show the **static flattened clean plate** (a single image) instead of the animated scene.

**Exit check:** at rest the scene matches the mockup when overlaid at 50% opacity (outside the UI areas). Wind moves only what it should.

---

### Phase 8: Build the UI on top of it

Match each element to your `measurements.md`. Use the overlay trick to check: put the mockup as a 50% opacity image over the page at 1586×992 and line things up.

#### 8.1 Typography

| Element | Look in the mockup | Starting point |
|---|---|---|
| Headline | Very bold, high-contrast serif, tight leading | Test Playfair Display 700/800, Cormorant Garamond 700, DM Serif Display. Identify with WhatTheFont and pick the closest. |
| Subtext | Regular-weight serif, ~ 24 px at 1586 wide | Cormorant Garamond 500 |
| Nav, buttons, stats | **Serif**, not sans | Cormorant Garamond 500/600. For small sizes, check legibility. |
| Eyebrow | Monospace, red, letter-spaced, `//` prefix | IBM Plex Mono 500 |
| Wordmark | Serif, very wide letter spacing (~ 0.6 em) | Cormorant Garamond 500 |
| Japanese text | Light serif | Noto Serif JP |

Headline size: the mockup's headline is about **92 px tall at 1586 wide**, which is about **5.8 to 6 vw**, with a line pitch of about **0.87 × font size**. (The first prototype was larger than that.)

Headline colours:
- DISCIPLINE: warm white.
- SECURES: vertical gradient from light to mid grey (metallic).
- FREEDOM.: red gradient, lighter at the top to darker at the bottom, with a very subtle dark-red outline/glow.

#### 8.2 Element details

- **Logo 影:** red kanji, 42 px tall, red text-shadow glow. Wordmark K A G E ~ 22 px, letter spacing ~ 0.6 em, cream.
- **Nav:** ~ 17 px serif, cream/white, gaps about 60 px, no underline at rest. Hover: color shift and a thin red underline.
- **Search icon:** thin white line icon, 22 px.
- **Divider:** 1 px, grey at ~ 20% opacity, 40 px tall.
- **Sign In button:** 147×40, 1 px red border, ~ 4 px radius, red text, faint red inner glow. Hover: fill red.
- **Eyebrow:** red, ~ 13 px, letter spacing ~ 0.2 em, followed by a 1 px red line ~ 120 px long.
- **Primary button (BEGIN YOUR JOURNEY →):** 310×56, 1 px bright red border, dark red-tinted fill (~ 10%), red caps serif text with letter spacing, outer red glow, arrow icon on the right. Hover: solid red fill + white text.
- **Secondary button (EXPLORE PATHS):** 175×52, dark translucent fill, 1 px grey border, cream caps serif text with letter spacing.
- **Hero vertical line:** 1 px, grey-red at low opacity, from y 215 to 640 at 1586 scale. Small red tick at y ≈ 455.
- **Left-edge red line:** 1 px red from the top, becoming a dotted line with 3 to 4 red dots near y 190–370. Make it an SVG.
- **Left vertical text:** 影の道 set with `writing-mode: vertical-rl`, ~ 22 px, light grey. Below it a short red dash (~ 10 px), then "THE / SHADOW / PATH" in three tiny lines (~ 8 px, letter spaced, grey).
- **Right vertical text:** 学び続ける, `writing-mode: vertical-rl`, ~ 44 px glyph size, light cream, text shadow for contrast.
- **Seal:** see 9.9.
- **Bottom line:** 1 px red line at y ≈ 832, from x 100 to about x 1250, **fading to transparent** on the right.
- **Stats strip:** four items. Each: red line icon 34 px + 2 lines of serif text (top line brighter/larger, ~ 17 px; second line smaller, grey). Thin vertical dividers between items (grey-red, ~ 20% opacity), item pitch ≈ 205 px.

Stats content: the mockup says "5 Learning Paths", "80+ Hands-on Labs", "Code Analysis Tooling", "Global Leaderboard". Those figures are not real yet. Use your real numbers, or neutral wording ("3 Core modules", "Safe practice labs", "Code analysis tooling", "Track your progress"). Your design doc forbids fake statistics.

#### 8.3 Responsive and accessible behavior

- Header: nav collapses into a menu button under about 880 px.
- Hide the side vertical texts under about 880 px.
- Strip becomes a 2×2 grid on mobile.
- Visible focus states on every link and button.
- Contrast: check the headline, subtext and nav against the artwork. Add a subtle scrim only where needed.
- Alt text: the canvas gets one descriptive label ("A lone ronin on a ridge facing a vast crimson sunset…"). Decorative parts are `aria-hidden`.

**Exit check:** the page at 1586×992 overlaid with the mockup at 50% opacity lines up to within a few pixels.

---

### Phase 9: Detail pass (the smallest details)

#### 9.1 Wind on cloth
- Cloak tails swing around their pivots, mostly horizontally to the left, with 10 to 25 px of travel at the free ends (at 1586 wide). Each tail has a slightly different speed (about 2.2 to 3.6 s period).
- Add a quick flutter on top (small, fast) at the very tips.
- The hat ribbon is the fastest (≈ 2 s).
- The ronin body and legs stay still. At most 1 px of subtle breathing movement on the shoulders.

#### 9.2 Grass
- Tip movement 6 to 14 px at 1586 wide, leaning left, back to nearly upright.
- The back band moves least, the front band the most.
- A gust travels from right to left across the field in about 3 s.
- Hero tufts near the ronin's feet sway with their own phase.

#### 9.3 Leaves on the branch
- Each cluster sways ±2 to 3° around its pivot, 3 to 8 px of travel, 3.6 to 6.4 s periods, each with a different phase.
- A few loose leaves release and fall from time to time (spawn from the cluster positions).

#### 9.4 Sky and sun
- Far clouds drift left slowly (20 to 40 px over about 60 s).
- Near dark clouds drift even slower, in the opposite direction if you want a sense of depth.
- Sun glow pulse: ±3% scale/brightness over about 8 s. Very subtle.
- Optional "camera breathing": the whole scene scales 1.000 to 1.015 over about 20 s.

#### 9.5 Water and waterfalls
- River: horizontal band ripple with tiny amplitude (1 to 2 px) and a **sparkle** on the sun reflection streaks (opacity flicker).
- Waterfalls: a looping texture scrolling downward inside the fall mask, at about 40 to 80 px/s.

#### 9.6 Fog
- `08_mist_a`: a tileable horizontal band, drifting left at about 10 to 20 px/s.
- `29_fog_front`: a slower band, drifting in the same direction, very low opacity.
- Use a **seamless tile** (offset-and-heal the edges) so it loops.

#### 9.7 Birds
- Remove the baked birds from the plate (Phase 1).
- Recreate 10 to 12 birds as small sprites in three sizes. Either a 3-frame wing flap sprite sheet or simple silhouette "V" shapes with a slight scale pulse.
- Slow, gentle paths from the right toward the left, with different speeds and a loop reset off-screen.

#### 9.8 Lights
- Temple windows (A14): warm red/orange glow sprites with a very slow flicker (opacity 0.7 to 1.0, random phase).
- Katana glint: one bright highlight travels along the blade about every 6 to 8 s.

#### 9.9 Seal stamp
- Do **not** copy the mockup's seal text: it is not a verified character set.
- Draw a clean square seal in SVG: red fill, with a single verified character cut out (for example 影), slightly rough edges, small rotation (−2°).
- Place it under 学び続ける.

#### 9.10 Petals
- 40 to 60 total. About 25% are rounder "petal" shapes, the rest maple-leaf shapes.
- Colours: 4 reds from the plate (bright, mid, deep, hot coral).
- Foreground petals: larger, blurred slightly, faster. Background petals: smaller, slower, a little transparent.
- Tumble: flip with a cosine on the Y scale so they flutter.
- A few petals pass **in front of the headline area**, which is fine, but keep them small there for readability.

#### 9.11 Load-in
- One orchestrated entrance: the scene fades in from the blur-up placeholder, then the headline and buttons rise in a quick stagger (60 to 120 ms each). No other scattered entrances.

---

### Phase 10: Responsive artwork

| Viewport | Plan |
|---|---|
| Desktop 16:10 and 16:9 | Main composition. 16:9 crops about 10% off top and bottom, so keep the sun and the ronin inside the central band. |
| Ultrawide (21:9) | Crops more vertically, so the clouds at the top and the grass at the bottom lose space. Anchor at about 55% y and test. |
| Laptop 1366×768 | Same artwork, smaller. Check that the headline does not collide with the ronin. |
| Tablet (4:3 / portrait) | Crop on the ronin and the sun. Reduce the headline size. |
| Mobile portrait | **Separate composition**: ronin centered and larger, sun partially visible at the top, valley below, text stacked in the dark lower-left or lower area. Use the mobile layer set (1408×880 source, reframed) or a dedicated 9:16 export. |

- Mobile also gets: fewer particles (about 20), no pointer parallax, simpler wind (skip the flutter), and a lower-resolution layer set.
- Keep a static fallback image for each breakpoint.

---

### Phase 11: Performance and quality checks

- Target 60 fps on a mid-range laptop. Test on an older laptop and one phone.
- Cap the device pixel ratio at 2.
- Pause the animation loop when the tab is hidden or the hero is scrolled out of view (`IntersectionObserver`).
- Respect `prefers-reduced-motion`: stop the wind, particles and parallax. Show the static plate.
- Lazy-load anything below the hero.
- Make sure the page is **usable before the art finishes loading** (text and buttons are HTML, the blur-up is behind them).
- Check texture memory against the 250 MB target (browser GPU profiler).
- Test Chrome, Firefox, Safari. Check Safari's WebP/AVIF alpha support and fall back to PNG/WebP where needed.

---

### Phase 12: Final acceptance checklist

Appearance
- [ ] At rest, overlaid on the mockup at 50%, nothing is visibly out of place.
- [ ] Headline size, colours and line spacing match.
- [ ] Nav, Sign In, buttons and strip match in position, size and look.
- [ ] Red glow is controlled, not on everything.
- [ ] No leftover mockup text or artifacts in the art.
- [ ] No halos or fringes around cut-out layers.
- [ ] No holes revealed during any animation.

Motion
- [ ] Cloak tails, hat ribbon, grass, leaves and petals all move with the same wind direction.
- [ ] Gusts travel across the scene instead of everything moving in sync.
- [ ] Motion is subtle at the headline and calm behind text.
- [ ] Reduced-motion mode shows a good static scene.

Technical
- [ ] Hero loads under the weight targets.
- [ ] Stable 60 fps on the test laptop.
- [ ] Texture memory within budget.
- [ ] Works without WebGL (static fallback).
- [ ] Focus states visible, keyboard works, contrast passes.
- [ ] Mobile layout is its own composition and not a shrunken desktop.

---

## 6. Layer animation parameters (starting values, tune by eye)

Amplitudes are in pixels at a 1586-wide viewport. Scale them with the viewport.

| Layer | Motion | Amplitude | Period / speed | Parallax (px of mouse shift) |
|---|---|---|---|---|
| Sky base | none | 0 | none | 2 |
| Sun glow | pulse | ±3% | 8 s | 3 |
| Sun disc | none (or tiny scale pulse) | ±1% | 8 s | 3 |
| Far clouds | drift left | 20–40 px | 60 s | 4 |
| Near dark clouds | drift | 15–30 px | 90 s | 5 |
| Birds | sprite paths | n/a | 40–70 s loops | 6 |
| Far mountains + hill | none | 0 | none | 6 |
| Mist A | drift left | 10–20 px/s | continuous | 8 |
| Mid mountains | none | 0 | none | 9 |
| River | ripple + sparkle | 1–2 px | 3–4 s | 10 |
| Temples, torii | none (lights flicker) | n/a | 2–5 s | 12 |
| Waterfalls | scroll down | 40–80 px/s | continuous | 12 |
| Mid forest | tiny sway | 1–2 px | 6 s | 14 |
| Ground right | grass-style sway | 3–6 px | 4–5 s | 18 |
| Ronin body | none | 0–1 px | 8 s | 14 |
| Cloak tails | pivot swing + flutter | 10–25 px | 2.2–3.6 s | 14 |
| Hat ribbon | pivot swing + flutter | 8–15 px | ≈ 2 s | 14 |
| Katana | glint | n/a | every 6–8 s | 14 |
| Rocks | none | 0 | none | 18 |
| Grass back | tip bend | 4–8 px | 4–5 s | 20 |
| Grass mid | tip bend | 6–11 px | 3.5–5 s | 24 |
| Grass front | tip bend | 8–14 px | 3.2–5 s | 28 |
| Branch/trunk | none | 0–1 px | n/a | 30 |
| Leaf clusters | pivot sway | 3–8 px, ±2–3° | 3.6–6.4 s | 30 |
| Front fog | drift left | 6–12 px/s | continuous | 34 |
| Petals | particles | n/a | continuous | 36 (front), 20 (back) |

Global wind: `wind(t) = base + sin(0.5t)·gustA + sin(1.3t)·gustB`, direction **right to left**.

---

## 7. Prompts

### 7.1 Removing text and UI (inpainting)

> Remove all text, buttons, icons, lines and interface elements from this region. Reconstruct the artwork underneath: dark atmospheric anime landscape, deep crimson and near-black palette, painterly brush texture, soft haze. Match lighting from a large red sun on the right. Do not add any text, symbols, logos or characters.

Per-area additions:
- Header: "…red clouds and a dark tree branch continuing across the top."
- Headline area: "…dark hillside and shadowed foliage with faint red highlights, mostly empty and quiet."
- Stats strip: "…dark grass blades and red-lit foliage, grass tips pointing left."

### 7.2 Repainting behind the ronin

> Continue the misty valley behind where the figure stood: layered pine forests in dark silhouette, a winding river reflecting a red sun, soft fog, distant temples. Keep the same crimson palette, painterly style and light direction. No people, no figures, no text.

### 7.3 Repainting behind the cloak tails

> Continue the dark hillside grass and shadowed slope behind where the torn cloth was, with subtle red rim highlights on the grass tips. No cloth, no figures.

### 7.4 Fog layers

> Seamless horizontal band of soft red-tinted mist, painterly, low contrast, transparent edges, tileable left to right.

### 7.5 Bleed outpainting

> Extend this scene outward in the same style, palette and lighting. Continue the sky, ridges and foliage naturally. No new subjects, no text.

Rules that apply to all prompts: always inpaint small regions, one at a time; keep the same seed or style reference where the tool allows; check each result against the original before keeping it.

---

## 8. Hand-off notes for the implementation (Antigravity IDE)

Give the IDE these items together:
1. This plan.
2. `layers.json` and all runtime layer files.
3. The mask and depth files.
4. `palette.json` and `measurements.md`.
5. The mockup image (for overlay comparison).

Implementation order for the code:
1. Static page with the clean plate as one background image, real HTML text over it, matched to the mockup. Verify the overlay first.
2. Replace the static plate with the stacked WebGL layers at rest. Verify the overlay again.
3. Add the wind shader for masked layers.
4. Add parallax, particles, birds and lights.
5. Add the reduced-motion and mobile paths.
6. Performance pass.

---

## 9. Risks and how to handle them

| Risk | Impact | Mitigation |
|---|---|---|
| Inpainting leaves visible patches | Looks fake at the UI areas | Repaint small regions, compare at 200%, redo by hand where needed |
| Upscaling creates artifacts on small temples/torii | Soft or crunchy details | Repaint those regions manually or upscale them separately |
| Ronin cut-out has halos | Obvious cut-out look | Defringe, contract 1 px, hand-paint the left edge |
| Holes appear behind moving layers | Breaks the illusion | Phase 4 overpaint by at least 30–60 px beyond the hole |
| Wind shader shows tearing | Looks glitchy | Soft masks, low amplitude, gradient masks |
| GPU memory too high | Crashes on phones, stutters | Tight-crop small layers, merge static layers, use a mobile set |
| Hero too heavy | Slow first load | Blur-up placeholder, AVIF/WebP, lazy-load the rest |
| Text hard to read over art | Poor accessibility | Contrast check, light scrim only where needed |
| Garbled kanji or seal copied from the mockup | Culturally wrong text | Redraw the seal with a verified character |
| Fake stats on the page | Breaks your own design rules | Use real numbers or neutral wording |
