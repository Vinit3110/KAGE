# KAGE --- Visual Design System & Website Direction

**Document purpose:** The visual source of truth for the KAGE
cybersecurity-learning platform.\
**Design keywords:** Cinematic, anime-inspired, Japanese landscape art,
disciplined, atmospheric, dark, tactile, premium, technically credible.

------------------------------------------------------------------------

## 1. Design vision

KAGE should feel like entering a beautifully illustrated world built
around the discipline of cybersecurity---not a generic SaaS dashboard
with a samurai wallpaper.

The visual identity combines:

1.  **Cinematic Japanese-inspired environments** --- lone ronin
    silhouettes, enormous suns, layered mountains, forests, temples,
    torii gates, waterfalls, mist, rivers, and drifting sakura.
2.  **A refined dark interface** --- near-black panels, thin borders,
    restrained glow, clear hierarchy, readable text, and compact
    technical details.
3.  **Warm paper and ink** --- parchment, brush strokes, field journals,
    archival notes, and traditional print textures used selectively.
4.  **A purposeful red accent** --- red communicates focus, active
    navigation, progression, danger, and important actions.
5.  **Real learning structure** --- clear paths, challenges, code
    findings, notes, achievements, and skill progression.

The experience should balance **atmosphere and usability**. The artwork
creates the world; the interface makes learning clear and efficient.

### Core design principle

> The world should feel expansive and mysterious. The tools should feel
> precise, calm, and trustworthy.

Avoid turning every screen into a busy illustration. Use detailed
scenery in the hero, learning map, empty states, and selected panels;
keep code, analysis, and lesson workspaces focused.

------------------------------------------------------------------------

## 2. Brand identity

### Name

**KAGE** --- a concise, atmospheric name suited to the shadow, stealth,
and discipline motifs.

Suggested supporting label: **CYBERSECURITY DOJO**

Optional short phrases: - **Discipline secures freedom.** - **Know the
system. Find the weakness. Protect the realm.** - **Learn. Practice.
Analyse. Grow.** - **Train your instincts. Understand the systems. Learn
to defend what matters.**

Use one main headline per page, not every slogan at once.

### Brand mark

Use a minimal, custom-feeling mark that can evoke a shadow, brushstroke,
or Japanese seal. It may pair a stylised kanji-inspired symbol with the
spaced wordmark `K A G E`.

-   Main wordmark: elegant, spaced lettering.
-   Symbol: vermilion/red brush mark or compact geometric emblem.
-   Keep the mark legible at small sizes.
-   Treat Japanese characters as decorative design only when their
    meaning has been verified. Do not add random kanji as filler.

### Voice

-   Calm, disciplined, concise.
-   Slightly mysterious, never melodramatic.
-   Technical copy should remain direct and understandable.
-   Use terms such as *path*, *discipline*, *mission*, *field notes*,
    *arena*, and *mastery* as flavor---not at the cost of clear labels.

------------------------------------------------------------------------

## 3. Visual references and atmosphere

The chosen references establish a distinctive mix of anime landscapes
and Japanese-inspired cinematic scenery:

-   A lone, dark ronin silhouette against a giant red or pale sun.
-   Deep crimson skies, dramatic clouds, distant mountain layers, and
    red-lit grass.
-   Blue and teal valleys, waterfalls, misty rivers, and snow-capped
    peaks.
-   Pink sakura trees and drifting petals.
-   Dense green forests, sunlit shrine paths, stone steps, and torii
    gates.
-   Warm lantern light, wooden buildings, pagodas, and temple
    silhouettes.
-   Ink-wash or painted edges that blend artwork into dark UI surfaces.
-   Occasional parchment, brush strokes, and archival textures.

### Desired feeling

The world should feel like a journey through distinct places: a
red-sunset threshold, a mountain learning trail, a night-time dojo for
challenges, a quiet workshop for code analysis, a warm archive for
notes, and a personal mastery screen.

### Artwork treatment

-   Prefer wide, landscape-oriented images for desktop hero sections.
-   Use rich depth: foreground foliage, middle-ground structures,
    distant mountains, atmospheric haze.
-   Keep a clear focal point, usually the sun, path, shrine, or lone
    figure.
-   Place text over the quieter, darker part of an image; apply a
    gradient overlay where needed.
-   Preserve negative space for interface content.
-   Use subtle grain, ink texture, and drifting particles sparingly.
-   Avoid putting critical text inside generated artwork. Render
    interface text as real HTML.
-   Use images as backgrounds or bounded visual panels, not as
    substitutes for interactive UI.
-   Ensure each page's imagery has enough contrast for readable
    controls.

------------------------------------------------------------------------

## 4. Colour system

The colour palette is not limited to red and black. It should move
between **crimson, ink-black, midnight blue, misty blue, forest green,
sakura pink, warm parchment, and lantern gold**. Each colour has a role.

### Core interface colours

  --------------------------------------------------------------------------
  Token                   Suggested value            Purpose
  ----------------------- -------------------------- -----------------------
  `--ink-950`             `#080B10`                  Main page background

  `--ink-900`             `#0D1219`                  Sidebar and primary
                                                     surfaces

  `--ink-850`             `#121A23`                  Raised panels

  `--ink-800`             `#18232D`                  Hover surfaces and
                                                     secondary panels

  `--line-subtle`         `rgba(220,230,240,0.12)`   Thin panel borders and
                                                     separators

  `--text-primary`        `#F2EEE7`                  Main headings and key
                                                     content

  `--text-secondary`      `#B8BDC5`                  Body text and
                                                     descriptions

  `--text-muted`          `#7F8995`                  Metadata, timestamps,
                                                     disabled details
  --------------------------------------------------------------------------

### Crimson and red accents

  ------------------------------------------------------------------------
  Token                   Suggested value          Purpose
  ----------------------- ------------------------ -----------------------
  `--red-500`             `#F23845`                Primary accent, active
                                                   navigation, key CTA

  `--red-600`             `#D92736`                Hover/pressed CTA

  `--red-glow`            `rgba(242,56,69,0.22)`   Small, controlled
                                                   active-state glow

  `--red-deep`            `#741B2A`                Deep gradients and
                                                   decorative shadows
  ------------------------------------------------------------------------

Red should be memorable because it is **selective**. Use it for active
items, important actions, current learning checkpoints, critical
findings, and a few visual details. Do not make every border, icon, and
card glow red.

### Blues and teals

  -----------------------------------------------------------------------
  Token                   Suggested value         Purpose
  ----------------------- ----------------------- -----------------------
  `--blue-500`            `#69B7E8`               Information,
                                                  network-related details

  `--blue-deep`           `#243F59`               Cool environmental
                                                  panels and gradients

  `--teal-500`            `#55C9B5`               Successful checks,
                                                  defensive status, safe
                                                  states

  `--teal-deep`           `#163D3A`               Forest/water-inspired
                                                  surfaces
  -----------------------------------------------------------------------

Blue and teal should echo the landscapes and provide a cool
counterbalance to red. Use them for informational states, networking
concepts, and success/defense indicators---not as competing primary
accents.

### Greens

  -----------------------------------------------------------------------
  Token                   Suggested value         Purpose
  ----------------------- ----------------------- -----------------------
  `--green-500`           `#79C78B`               Passed checks, secure
                                                  state, completed
                                                  defensive tasks

  `--green-deep`          `#244C3A`               Forest-inspired
                                                  backgrounds and subdued
                                                  status surfaces
  -----------------------------------------------------------------------

Green should communicate **safe, passed, or defended**, rather than
general decoration.

### Sakura pinks

  -----------------------------------------------------------------------
  Token                   Suggested value         Purpose
  ----------------------- ----------------------- -----------------------
  `--sakura-400`          `#F19BB7`               Small decorative
                                                  accents and
                                                  illustration highlights

  `--sakura-500`          `#D96F98`               Selected tags or
                                                  special visual details

  `--sakura-deep`         `#6B354D`               Muted pink surfaces and
                                                  atmospheric gradients
  -----------------------------------------------------------------------

Pink belongs primarily in the artwork: blossoms, petals, distant trees,
and occasional decorative highlights. Keep the functional interface pink
usage restrained.

### Parchment and warm neutrals

  -----------------------------------------------------------------------
  Token                   Suggested value         Purpose
  ----------------------- ----------------------- -----------------------
  `--paper-100`           `#F1E7D4`               Main note-card
                                                  background

  `--paper-200`           `#DCC9A9`               Paper borders and
                                                  secondary note surfaces

  `--paper-ink`           `#28251F`               Text on parchment

  `--lantern-gold`        `#D8AC68`               Rare achievement and
                                                  lantern highlights
  -----------------------------------------------------------------------

Use parchment for Field Notes, lesson callouts, quotes, or selected
editorial sections. Do not turn the entire app into a beige interface.

### Colour usage rules

-   Keep most functional pages dark.
-   Let scenery introduce the broadest colour range.
-   Use red as the main interface accent.
-   Use blue/teal for information and cool environmental depth.
-   Use green for safe/passed states.
-   Use pink primarily in artwork and selected decoration.
-   Use gold for rare rewards and warm lighting.
-   Maintain accessible contrast; never rely on colour alone to convey
    status.
-   Severity colours must be paired with labels and icons.

------------------------------------------------------------------------

## 5. Typography

The design combines elegant editorial typography with precise technical
text.

### Recommended roles

1.  **Display headings:** A high-contrast serif with cinematic,
    editorial character. Examples to evaluate: `Cormorant Garamond`,
    `DM Serif Display`, or `Playfair Display`.
2.  **Body and interface:** A clean sans-serif that remains readable at
    small sizes. Examples: `Inter`, `Manrope`, or `IBM Plex Sans`.
3.  **Code and technical metadata:** A monospace family such as
    `IBM Plex Mono` or `JetBrains Mono`.

Use no more than two main families plus a monospace face for technical
areas.

### Type behaviour

-   Large landing headline: short, strong, and broken into deliberate
    lines.
-   Highlight one word or line in crimson rather than colouring entire
    paragraphs.
-   Navigation labels should be compact and readable.
-   Metadata can use small uppercase labels with generous letter
    spacing.
-   Lesson body copy and code explanations should prioritise readability
    over atmosphere.
-   Avoid tiny text, excessive letter spacing, or decorative fonts for
    important instructions.

------------------------------------------------------------------------

## 6. Layout, surfaces, and components

### Overall layout

-   Desktop-first visual composition that adapts cleanly to laptop
    screens.
-   Target a usable experience around 1366×768 and larger.
-   Use a consistent top navigation and/or sidebar on authenticated
    application pages.
-   Keep the landing page more immersive and less dashboard-like.
-   Use a responsive grid and avoid fixed dimensions that cause content
    to overflow.
-   Leave breathing room around headings and primary actions.

### Navigation

Primary sections: - **Home** - **Learning Paths** - **Cyber Arena** -
**Code Analysis** - **Field Notes** - **Profile**

Top-level links may be shortened to **Learn**, **Practice**,
**Analyse**, **Notes**, and **Leaderboard**, provided the meaning
remains clear.

Navigation style: - Near-black background. - Thin separators and
understated icons. - Active item uses a restrained red background, red
icon, or red left marker. - Hover states are subtle. - Sidebar should
not overpower the artwork. - Mobile navigation should collapse into a
drawer or compact menu.

### Cards and panels

-   Dark translucent surfaces where background art should remain
    visible.
-   Thin low-contrast borders rather than heavy outlines.
-   Small radius, generally around 8--14 px; avoid excessive pill-shaped
    UI.
-   Soft shadow for separation, not dramatic glow.
-   Red outline or glow reserved for the current selection or primary
    action.
-   Use consistent internal spacing and clear title/description/action
    hierarchy.

### Buttons

-   Primary: crimson fill or crimson outline, high contrast, clear
    action label.
-   Secondary: dark or transparent fill with a subtle border.
-   Text links: understated, with a clear hover treatment.
-   Use concise verbs: **Begin training**, **Open lab**, **Analyse
    project**, **Continue path**.
-   Buttons must have visible keyboard-focus states.

### Icons and decorative details

-   Use a consistent icon family with restrained line weight.
-   Use torii, brush marks, seals, topographic lines, coordinates, and
    tiny technical markers as decorative motifs.
-   Avoid mixing many unrelated icon styles.
-   Decorative elements must not interfere with reading or interaction.

### Motion

-   Slow, subtle atmospheric movement: drifting petals, gentle fog, or a
    small parallax shift.
-   Short, purposeful transitions for tabs, cards, and progress.
-   No constant heavy animation behind technical content.
-   Respect `prefers-reduced-motion`.
-   Do not make important information depend on animation.

------------------------------------------------------------------------

## 7. Page-by-page design direction

### Page 1 --- Landing: The Entrance

**Purpose:** Establish the world, explain the value, and guide the
visitor into training.

**Visual direction** - Full-width cinematic Japanese-inspired
landscape. - Giant crimson sun, layered mountains, dark forests,
temples, distant water, and a lone ronin silhouette. - Foreground
foliage or red-lit grass adds depth. - Dark gradient on the text side so
the headline remains readable. - Slim header with KAGE branding,
navigation, search, and sign-in. - Vertical brush/calligraphy detail may
sit at the far edge, with verified text only.

**Content hierarchy** 1. Small label: `CYBERSECURITY DOJO` 2. Headline:
`DISCIPLINE SECURES FREEDOM.` 3. Supporting copy:
`Learn. Practice. Analyse. Grow. Master the skills to defend what matters.`
4. Primary CTA: `BEGIN YOUR JOURNEY` 5. Secondary CTA: `EXPLORE PATHS`
6. Small credibility strip: learning paths, hands-on labs, code
analysis, community/leaderboard.

**Important:** The artwork should dominate, but the text and buttons
must remain HTML components and responsive. Avoid making the whole
landing page one flattened image.

### Page 2 --- Learning Paths: The Journey

**Purpose:** Make structured learning feel like exploring a living
world.

**Visual direction** - A large illustrated landscape with winding paths,
shrine gates, stone steps, waterfalls, mountain ridges, forests, and
sakura. - The environment can transition from warm lantern-lit
foreground to cool blue mountains in the distance. - Learning
checkpoints appear as small, readable dark cards attached to points
along the trail. - The selected checkpoint gets a red accent; locked
paths use muted cool tones. - A compact progress panel sits in a corner
rather than covering the scenery.

**Suggested paths** 1. Foundations --- Linux, networking, CLI. 2.
Reconnaissance --- OSINT, scanning, enumeration. 3. Web Security ---
OWASP concepts, exploitation, defense. 4. Cryptography --- encryption,
hashing, PKI. 5. Defensive Security --- monitoring, incident response.
6. Digital Forensics --- evidence handling, analysis, investigation (can
be added as a separate path).

**Checkpoint card information** - Number and title. - Short skill
summary. - Progress or completion count. - Locked/unlocked state. -
Clear action when selected.

**Interaction** - Clicking a node opens a path overview or lesson. - The
selected path is clearly indicated without relying only on colour. -
Progress should be based on real completion data, not arbitrary
decorative percentages. - On smaller screens, provide an accessible list
alternative to the illustrated map.

### Page 3 --- Cyber Arena: The Dojo

**Purpose:** Let learners practise concepts in controlled challenges.

**Visual direction** - Night-time dojo, lantern-lit temple, deep blue
mountains, dark wood, red lanterns, and restrained crimson highlights. -
The artwork is a header or side/background panel; the challenge
catalogue remains readable. - Use a structured grid of challenge cards
and filters rather than placing all controls on top of a busy image.

**Challenge categories** - Web Exploitation - Network Security - Linux
Privilege Escalation - Cryptography - Digital Forensics - Miscellaneous

**Challenge cards** - Name and brief. - Category and difficulty. -
Estimated time or prerequisites where useful. - Progress state. -
`Start Challenge` or `Continue`.

**Lab workspace** - Mission briefing and objectives. - Isolated target
application or lab environment. - Terminal/request tools as
appropriate. - Hints and validation. - Completion result and
remediation/explanation.

**Safety and clarity** - Labs must be authorised and isolated. - Clearly
distinguish simulated exercises from real targets. - Do not make the
atmospheric visuals compromise tool readability.

### Page 4 --- Code Analysis: The Forge

**Purpose:** Analyse a user's own source code or connected repository
and teach them how to fix security issues.

**Visual direction** - A quiet, warm-lit workshop or open Japanese
veranda overlooking mountains and sakura. - Dark editor surfaces with
thin borders. - Small parchment-inspired explanatory panels may
accompany findings. - Keep the main work area functional and
professional; do not put busy art behind code.

**Primary actions** - `Upload Project` - `Connect GitHub`

**Workflow** 1. Choose or connect a repository. 2. Select the analysis
scope. 3. Run supported checks. 4. Review findings. 5. Understand impact
and remediation. 6. Re-run analysis to verify the fix.

**Findings layout** - Severity label and icon. - Rule or vulnerability
name. - File and line reference. - Explanation and potential impact. -
Recommended remediation. - Secure code example where supported. - Link
to the relevant learning module.

**Status colours** - Red/orange for issues according to severity. - Blue
for informational findings. - Green/teal for passed checks. - Always
include text labels; do not communicate severity through colour alone.

**Trust:** Clearly explain what is uploaded, how repository access
works, and how source code is handled. Never imply a scan has run when
it has not.

### Page 5 --- Field Notes: The Archive

**Purpose:** Give learners a personal place to save notes, concepts,
walkthroughs, and discoveries.

**Visual direction** - A warm wooden study or archive with a window
opening onto a pink-sakura mountain landscape. - Parchment note cards,
subtle paper grain, ink-like dividers, and lantern light. - Dark
navigation and surrounding interface keep the overall product
consistent. - This is the page where cream and parchment can be most
prominent.

**Features** - Search and filter by topic. - Categories for Web
Security, Linux, Networking, Cryptography, Forensics, Cheat Sheets, and
custom topics. - Create, edit, tag, bookmark, and delete notes. -
Optional links to lessons, challenges, and code findings. - Clear empty
state inviting the user to create their first note.

**Readability:** Text and note editing must remain comfortable for long
sessions. Avoid noisy textures behind paragraphs.

### Page 6 --- Profile: Shinobi

**Purpose:** Show the learner's progress and mastery without reducing
learning to meaningless gamification.

**Visual direction** - A dark mountain or forest scene with restrained
red foliage. - Character/avatar illustration or emblem. - Elegant dark
stat cards, subtle borders, and a clear skill tree. - Rare gold
highlights for notable achievements.

**Content** - Display name and rank/level. - XP and progress to the next
level. - Paths started/completed. - Labs solved. - Projects analysed. -
Notes written. - Skill tree across Foundations, Reconnaissance, Web
Security, Cryptography, and Defense. - Achievements and recent activity.

**Progress rules** - Reward completed work and demonstrated
understanding. - Show what is unlocked and what prerequisite remains. -
Avoid fake rankings, fake activity, or decorative statistics presented
as real data. - Provide privacy controls for public profile and
leaderboard visibility.

### Supporting views

These do not need to be primary navigation destinations, but the design
system should support them:

-   Sign in / create account.
-   Lesson detail and interactive lesson player.
-   Challenge detail and lab workspace.
-   Challenge completion/results.
-   Finding detail and remediation view.
-   Search results.
-   Notifications.
-   Settings, privacy, and account management.
-   Loading, error, empty, and offline states.

------------------------------------------------------------------------

## 8. Illustration and environment library

Create a reusable set of environment illustrations so the site feels
cohesive without reusing the same hero everywhere.

### Environment A --- Crimson Horizon

Use for the landing page and major milestones: - Giant red sun. - Ronin
silhouette. - Crimson clouds. - Layered dark mountains. - Red-lit grass
and distant temples.

### Environment B --- Sakura Mountain Trail

Use for Learning Paths: - Winding stone path. - Torii gates and
shrines. - Pink cherry blossoms. - Waterfalls and mist. - Blue mountains
and a snowy summit. - Small lanterns marking checkpoints.

### Environment C --- Night Dojo

Use for Cyber Arena: - Temple or training courtyard at night. - Dark
timber, deep navy mountains. - Red lanterns and subtle reflections. - A
focused, disciplined atmosphere.

### Environment D --- The Forge

Use for Code Analysis: - Wooden workshop or veranda. - Open windows
framing mountains. - Warm lantern/candle light. - Desk, paper, scrolls,
and technical diagrams. - Enough uncluttered space for UI panels.

### Environment E --- The Archive

Use for Field Notes: - Bookshelves, paper, ink, wooden desks. - A window
overlooking sakura or distant hills. - Cream parchment cards. - Quiet,
warm lighting.

### Environment F --- Forest Shrine

Use for completion, onboarding, or reflective states: - Dense green
forest. - Sunbeams through foliage. - Stone path and moss-covered
steps. - Torii gate and a tranquil destination. - Green and teal tones
balanced by warm sunlight.

### Environment G --- Profile / Mastery

Use for the profile and achievements: - Dark forest or mountain
silhouette. - A single red tree or crimson leaves. - Sparse composition
with room for profile and skill UI. - Optional emblem or shrine marker.

### Image requirements

-   Use high-quality, wide landscape artwork for desktop scenes.
-   Generate separate images for separate environments, not one giant
    image containing the entire interface.
-   Keep important scenery away from text-heavy areas.
-   Prefer consistent lighting, detail level, and palette across the
    library.
-   Prepare responsive crops for desktop, tablet, and mobile.
-   Add meaningful alt text to informative images; mark purely
    decorative backgrounds as decorative.
-   Avoid stretching images or relying on text baked into generated
    images.

------------------------------------------------------------------------

## 9. Information design and status system

Atmosphere should never make the technical meaning ambiguous.

### Common states

-   **Active/current:** red accent, icon, and explicit label.
-   **Completed/passed:** green or teal accent plus a checkmark and
    label.
-   **Informational:** blue accent plus an information icon.
-   **Locked/unavailable:** muted surface and clear explanation of
    prerequisites.
-   **Warning:** amber/gold plus a warning icon.
-   **Critical finding:** red severity label, icon, and explanatory
    text.
-   **Loading:** quiet skeletons or a clear progress indicator.
-   **Error:** concise explanation and a recovery action.

Do not use red for every state. Reserve the most vivid red for primary
actions, active selections, and important security warnings.

### Data integrity

Progress bars, completion counts, analysis results, leaderboard
positions, and achievement states must reflect actual application data.
Use clearly labelled sample/demo data only when real data is
unavailable.

------------------------------------------------------------------------

## 10. Accessibility and responsive behaviour

-   Maintain readable text contrast over every background.
-   Place dark gradients behind text over illustrations.
-   Ensure all controls work with keyboard navigation.
-   Provide visible focus states.
-   Use semantic headings and accessible names for icon-only controls.
-   Never rely on colour alone for progress, status, or severity.
-   Respect reduced-motion preferences.
-   Provide a list-based alternative to the map-like Learning Paths
    visual.
-   Keep technical editors and code findings usable at laptop widths.
-   On mobile, simplify the artwork and stack content rather than
    shrinking desktop UI.
-   Ensure buttons and interactive targets have comfortable touch sizes.
-   Provide descriptive alt text for meaningful illustrations.

------------------------------------------------------------------------

## 11. Performance and implementation guidance

-   Use compressed WebP/AVIF assets when supported.
-   Lazy-load below-the-fold environment art.
-   Use responsive image sizes and appropriate `object-fit` behaviour.
-   Avoid loading every large illustration on every route.
-   Add a subtle overlay rather than editing all text into the
    background image.
-   Keep content, navigation, cards, maps, code, and controls as real
    components.
-   Ensure the site remains usable if a decorative image fails to load.
-   Avoid excessive blur, giant shadows, and large animated effects that
    harm performance.
-   Keep the visual system reusable through colour tokens, spacing
    tokens, type styles, and shared components.

### Suggested component inventory

-   `BrandMark`
-   `PrimaryNavigation`
-   `SidebarNavigation`
-   `PageHeading`
-   `EnvironmentHero`
-   `PrimaryButton` / `SecondaryButton`
-   `PathCheckpoint`
-   `PathProgressCard`
-   `ChallengeCard`
-   `SeverityBadge`
-   `ProgressBar`
-   `FindingCard`
-   `NoteCard`
-   `SkillTree`
-   `AchievementCard`
-   `EmptyState`
-   `LoadingState`
-   `ErrorState`

Use shared components to keep all pages visually consistent.

------------------------------------------------------------------------

## 12. What to avoid

-   Generic green Matrix rain as the primary visual identity.
-   Neon on every element.
-   A red glow around every card and button.
-   Dense, unreadable text layered over busy artwork.
-   Using a background illustration as the entire UI.
-   Repeating the exact same landscape on every page.
-   Excessive random kanji or culturally inaccurate decorative text.
-   Parchment textures behind code or long technical explanations.
-   Gamification that rewards clicks rather than learning.
-   Fake progress, fake scan results, or fake security claims.
-   Animations that distract from reading or using tools.
-   Tiny controls and low-contrast metadata.
-   Overly rounded, generic SaaS components that conflict with the
    sharper, editorial aesthetic.

------------------------------------------------------------------------

## 13. Design acceptance checklist

A page is aligned with KAGE when:

-   [ ] It feels like part of the same Japanese-inspired world.
-   [ ] Its environment art suits the page's purpose.
-   [ ] The interface uses near-black surfaces and restrained red
    accents.
-   [ ] Blue, teal, green, pink, parchment, and gold appear
    intentionally---not randomly.
-   [ ] Typography combines elegant display headings with readable UI
    and code fonts.
-   [ ] Main actions and current selections are immediately obvious.
-   [ ] Text remains readable over artwork.
-   [ ] Cards, borders, spacing, and navigation follow shared patterns.
-   [ ] Status and progress are communicated clearly and accurately.
-   [ ] The page works at common laptop sizes and adapts to mobile.
-   [ ] Interactions remain accessible without relying on colour or
    animation.
-   [ ] The result feels atmospheric but still functions as a serious
    cybersecurity learning platform.

------------------------------------------------------------------------

## 14. Final direction

**KAGE is a cinematic Japanese-inspired cybersecurity dojo.** Its world
is built from crimson sunsets, blue mountain ranges, misty waterfalls,
green shrine forests, pink sakura, dark temples, and warm lanterns. Its
interface is built from near-black panels, elegant serif headings, clean
technical typography, subtle borders, and deliberate red accents.
Parchment and ink provide warmth in the Field Notes and learning
content.

Each page should feel like a different destination in one connected
world:

-   **Landing:** enter the world.
-   **Learning Paths:** follow the trail.
-   **Cyber Arena:** train in the dojo.
-   **Code Analysis:** inspect and repair in the forge.
-   **Field Notes:** preserve knowledge in the archive.
-   **Profile:** see the path toward mastery.

The visual ambition is cinematic; the product experience must remain
clear, accessible, fast, and technically credible.
