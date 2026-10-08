# Engineered Landscape integration QA

Date: 8 October 2026. Status: **integrated and locally reviewed on actual WebGL hardware; real mobile-device qualification remains open**.

## Scope and source

The user supplied the correct articulated prototype at
`C:/Users/Admin/Downloads/Engineered_Landscape_Articulated_WebGL_2026-10-08/engineered-landscape`.
Read its AGENTS.md, README.md and design-qa.md, the repository instructions, RTK.md
and handoff before implementation. Earlier Complete Preview artifacts contained
only a 2.5D implementation; that mismatch is resolved by the corrected path.

The integration uses a separate worktree at
`C:/Users/Admin/Desktop/portfolio-engineered-landscape` on `feat/engineered-landscape`,
based on `origin/feat/minimal-scroll-portfolio` commit
`4ef93dc127e47e76aedab9f121f089e3f2655cbc`. PR #3 commit
`22039218821ea0e6966fcba5a457940fdda51fd5` was incorporated as `3a09264`.
The original main checkout and its untracked handoff remain untouched.
No existing PR was merged, no deployment or production settings change was made,
no live database content changed, and no production Contact message was submitted.

## Actual GPU review and fixes

Prototype npm ci, production build and all 11 prototype tests passed.
Used headed installed Chrome 154.0.8037.99 through Playwright without graphics
override flags or security changes, Windows x64, Intel Core i7-11850H,
1363 × 936 CSS pixels at DPR 1. Each actual mounted `.motion-rig` reported
`data-renderer="webgl"` and contained a WebGL 2 canvas. Its renderer was:

`ANGLE (Intel, Intel(R) UHD Graphics (0x00009A60) Direct3D11 vs_5_0 ps_5_0, D3D11)`.

Observed opening, settled screenshot reveal and reverse for JobPilot, Lobby and
Cedar in the GPU browser and recordings. This evidence is actual application
rendering, distinct from the packaged historical CPU/SVG geometry diagnostics.
Only the WebGL engine and photographic fallback were ported to the application.

Resolved defects:

1. JobPilot sheets intersected and detached while translating. Reduced angular
   sector widths, extended sheet roots to their hinges and rotated around fixed
   base pivots. Lobby band paths now occupy separate depths. Mesh thickness,
   pins, metal response and floor shadows were inspected in actual GPU frames.
2. Materials were too bright and mesh arrival jumped from photographic artwork.
   Corrected oxide/forest colors, light intensity and exposure; register the
   initial assembly against the artwork's DOM bounds before moving to center.
   Start the fade at 1.35 seconds and align reverse with the return transition.
3. Narrow framing and resized DPR needed correction. Camera distance adapts
   to aspect; DPR is recomputed and capped at 1.25 narrow / 1.5 desktop.
4. A settled timeline could resume when the document became visible. Settled
   rigs now remain idle. Context loss stops motion and exposes photographic
   fallback; disposal releases geometry, materials, shadows and environment.
5. Existing public styles collided with Contact and the project index. Scoped
   the accepted styles, supplied compatible theme tokens and preserved the
   existing functional form/report components inside the new visual shell.
6. Collection navigation from a case lost the originating sculpture's focus.
   Header/footer/identity navigation now carries the return slug; opening and
   closing timelines also withstand Escape during selection initialization.

## Integrated GPU measurements and stress

`docs/design/engineered-landscape/integrated-gpu.json` records six selection/return
cycles, two for each rig. Opening default-framebuffer clear timestamps were
measured without screenshots or video in that measurement run. Intervals at or
below 2 ms are setup/multiple-clear calls and excluded; larger intervals are
retained. Across the final six cycles, median render spacing was 16.6–16.7 ms and p95 was
17.2–17.3 ms. A concurrent build/browser-test stress run had p95 of 24.9–28.3 ms
in its first three cycles (`integrated-stress.json`), then 17.1–17.3 ms after that
load subsided. These are CPU-side render-call intervals, not GPU timer queries or
a promise of performance on another machine. Cold engine download/shader setup
is outside this animation interval statistic.

Each settled rig emitted **zero renders during a 700 ms idle window**. Every
return restored the originating button's focus and left zero canvases. Eight
contexts were created and eight received context-loss events after cleanup or
the one deliberate loss test. Resizing during opening retained actual WebGL;
navigation during opening left zero canvases. No page exceptions occurred.
The engine was absent from network resources in a separate cold Chrome page
without pointer interaction; all GPU evidence above came from the headed browser.
Hover/focus prewarms its dynamic import. Earlier headed probes inadvertently
hovered an artwork and correctly triggered that prewarm.

Forced no-WebGL at 390 × 844 produced zero canvases and a usable photographic
selection with a case link. Reduced-motion keyboard tests produced zero canvases.
An intentionally failed engine import also reached the labelled photographic
fallback with zero canvases and a working case link (`route-fallback-review.json`).
Prototype repeated selection, mid-opening resize and navigation during loading
also passed (`prototype-stress-report.json`). Prototype pacing with screen/video
capture overhead is recorded separately and is slower than the dedicated run.
A prototype favicon 404 was observed; no application GPU failure accompanied it.

## CMS and real services

Production components consume the existing hooks/API client. No prototype
content.js records or network bridge were copied into application source.
All eight published CMS records and slugs remain available in gallery/index,
search and complete case readers: JobPilot AI, Lobby, GameZone Arena,
Construction Project Management & Accounting System, UniHub, Full-Stack User
Management System, Medicare Hub and Home Services. Existing screenshot galleries,
engineering evidence, project links, `/cv`, admin/auth and backend schema remain.
Profile uses CMS identity, experience, education, certifications, technologies
and skills. Its supplied mask/crop uses the unchanged original photograph:
SHA-256 `e6af23208df8739c79c2b379c418a182a0d65e20c184bc6e1626b85ba99c2b05`.
Manrope, IBM Plex Mono and the accepted seven palette colors are retained.
Longer CMS titles/descriptions intentionally replace the shorter design fixture.

For browser-only local QA, an adapter outside this repository served a read-only
snapshot of the published public CMS, cached the genuine public CV, and forwarded
only assistant/job-match/tailored-CV requests to the existing published service.
It rejects Contact and all other writes and is not a production dependency.
The application itself uses the same-origin `/api` routes and normal API client.

Real general and JobPilot-specific assistant requests returned HTTP 200 and
completed answers. Verified project evidence links and the genuine `/api/cv.pdf`
PDF signature; CMS resumeUrl is currently null. Added placeholder/unsafe-link
guards and kept the real fallback endpoint. `live-assistant.json` and its two
captures record the results. The deployed upstream predates PR #3: its whitespace
behavior is not being claimed as deployed fixed. Backend and browser decoder
regressions prove whitespace preservation in this branch. The drawer retains
streaming, project/general history, native modal focus management, stop/route
cancellation, 55-second timeout, visible errors and retry. No offline AI replies.

The actual Job Match service returned HTTP 200 and a 2,089-character rendered
report with real Lobby, UniHub and GameZone evidence links. Its signed-token
tailored CV downloaded as a valid 30,825-byte `%PDF-` document. The signed token
and PDF were not committed or recorded. Copy/export and route continuity were
also tested with intercepted contracts. See `live-job-match.json` and capture.
Contact's existing name/email/subject/message/website payload, honeypot,
validation, loading, retained-error values and success focus passed with local
intercepted fixtures only. Existing security, validation and rate limits remain.

## Visual artifacts and validation

All review artifacts are under `docs/design/engineered-landscape/`:

- `collection-comparison.jpg`, `profile-comparison.jpg`: source and runtime
  together at equal 1363 × 936, DPR 1, with a 48px label strip. CMS content
  differences are intentional; portrait, composition, palette and hierarchy
  are compared at matching viewports. Source captures wait for settled artwork.
- `integrated-motion.webm`, `prototype-motion.webm`: actual headed-browser motion
  recordings. These are visual review evidence, not timing benchmark runs.
- Opening/spread/reverse frames, settled selection, all main public surfaces,
  assistant and live services; responsive collection/profile/contact/job-match/
  Lobby and forced photographic fallback at 390 × 844.

Passed: typecheck, lint, production build, all 51 Playwright tests across desktop,
tablet and phone viewports, and all 10 landscape/backend streaming/CV-link unit
tests. The static Application CV reference geometry/content check also passed;
its fixture and CV layout were unchanged. Browser coverage includes all eight deep links at 320px, gallery zoom,
admin structured updates, keyboard selection/return, interrupted selection,
assistant context/whitespace/retry/stop, intercepted Contact, Job Match export and
token-gated CV. No horizontal body overflow was observed in the captured narrow
surfaces. Build emits a size advisory for the lazy Three engine (501.11 kB
minified / 126.26 kB gzip); no warning threshold was raised.
Final collection and CV/terminal changes passed their relevant six-test browser
subsets again. The standalone `/cv` route retained its real PDF preview and
visible download control at desktop and narrow widths.

## Remaining qualification

No physical phone/tablet, mobile GPU, Safari/iOS/Android, touch latency, battery
or thermal measurements were available. Responsive desktop-browser viewports
are not real-device evidence. Cold-load startup and GPU execution time are not
benchmarked. Live upstream behavior can change independently of this branch.
No award-level polish or deployment acceptance is claimed. Review the recordings
and qualify actual target devices before release.

---

# Historical refinement QA (preserved from the base branch)

# Three-device projects and split hero — design QA

final result: passed (readability and motion refinement, 2026-10-06)

## Source and scope

Source visual truth: user attachment `jobpilot(1).png`, Library identity `libfile_33dc29c416d08191bfefbee283b48712`; local input `../attachments/219e89cc-6243-4a71-90b0-e2af665173fc/jobpilot.png` (1254 × 1254).
The approved target is the device arrangement only: central laptop, front-left phone, front-right tablet. The user explicitly removed promotional scenery, slogans, features, stack and role paragraphs; retain project title, Explore project, Selected work and View all projects. Real CMS screens replace the attachment's illustrative interfaces.

Implementation screenshots: `docs/design/three-device-showcase/projects-desktop.jpg`, `projects-mobile.jpg`, `split-hero.jpg`.
Desktop viewport 1353 × 929 CSS pixels, capture 1353 × 929; mobile review 390 × 844 CSS iframe (380px content with scrollbar) and narrow 320 × 844 (310px content). Browser captures are 1× density. Mobile proof includes review chrome; no density precision is claimed for the outer screenshot.
Comparison: `docs/design/three-device-showcase/reference-comparison.jpg` places the source device region and rendered desktop composition together, preserving both aspect ratios inside equally sized panels. It excludes the poster's intentionally removed marketing material. This is composition comparison, not a claim of pixel-identical app content or hardware.

## Findings and iteration history

- [P2, fixed] Initial side-device crops started too far into desktop captures and cut primary screen headings. Reduced scaling, aligned crops to the main content and limited crop offset on long screenshots. Later desktop capture shows Your resumes and Live voice interview as distinct visible products; long GameZone/Cedar screens retain more of the interface. These are authentic desktop-derived detail crops, not native responsive captures.
- [P2, fixed] Global paragraph line height created excessive space between Software and Engineer. Explicitly scoped hero display line height now keeps the two lines together.
- [P2, fixed] Narrow Cedar caption pushed Explore project outside the section's intended padding. At <=380px, title and link stack; all five link right edges are 131.45px inside the 310px content width.
- [P2, fixed] Floating assistant overlapped the lower-right device. Hide the closed launcher while a project preview is active; preserve an already open assistant and contact access.
- Hardware uses generated raster frame assets, not CSS-drawn devices. Measured screen masks cover the matte; raster frame grayscale removes colour fringes without touching project screenshots. Final comparison shows a large laptop and two unobstructed separate devices.

## Required fidelity surfaces

- Typography: portfolio Inter/Instrument Serif preserved. Split hero title has one accessible h1 and visible left/right fragments; right display line-height .98. Project headings remain clear at 28–44px; narrow titles get their own row. The illustrative poster typography is not substituted for real app text.
- Spacing/layout: desktop devices overlap as in the selected reference; phone/tablet remain in front of laptop. Mobile uses laptop first, then two separate side devices; no horizontal overflow at 380 or 310 content pixels. Selected work has clear separation before the first project. Long project titles retain visible links.
- Colours/tokens: preserve approved midnight/ivory/champagne portfolio palette and original project UI branding. Promotional environment images are removed from this section.
- Image quality: all 15 CMS screenshots loaded successfully; three raster frames reused across five projects, roughly 717 KiB total. Screens have independent image elements, masks and GSAP timelines. Original full screenshots remain available in the viewer. Focused screen headings and viewer enlargement were inspected separately from the composition board.
- Copy/content: only project titles and Explore project remain per project. Section heading, View all projects and discreet accessibility motion control retained. No promotional claims, invented product data, role paragraphs or fabricated mobile UI.

## Interactions and verification

- Independent scrolling observed with three different transform offsets; laptop/phone/tablet timings staggered 1.1/1.7/2.3s and scroll durations 5.2/5.8/6.4s, with bottom hold and smooth return.
- Only the most visible project's previews run; offscreen and hidden-document previews stop. ResizeObserver recalculates real overflow; cleanup kills timelines and observers.
- Pause control stopped all running device previews. Resume restarted active previews. Current screen positions are retained while paused.
- Reduced-motion fixture rendered all 15 devices with zero running previews. Portrait turns are omitted when landing motion is disabled.
- Mobile screen click opened full-size gallery; Escape closed it. Desktop keyboard Enter also opened a screenshot. Explore project reached `/projects/jobpilot-ai` and browser Back returned to landing.
- App console error filter returned no errors; unrelated browser extension metadata errors excluded.
- Typecheck, ESLint, production build and git diff whitespace check passed.

## Responsive-screen correction — 2026-10-06

The earlier desktop-derived side-device crop was rejected by the user and is superseded. All ten phone/tablet slots now have separately rendered responsive assets. Five laptop slots retain their CMS screenshots. Width fitting and x=0 replace forced scaling/offsets for every device. Short images remain still; real vertical overflow alone drives scrolling. Device clicks append responsive captures to the original CMS gallery and open the selected capture.

Sources and exact capture sizes are documented in `docs/design/responsive-devices/capture-notes.md`. Public pages were used where dashboard access was unavailable. JobPilot and Cedar used read-only public DOM snapshots with the deployed sites' original styles because those sites disallow framing; no UI was invented and no authenticated data was accessed. UniHub uses public student registration and sign-in, not a claimed dashboard capture.

Fresh desktop and mobile proof: `docs/design/responsive-devices/desktop.jpg` and `mobile.jpg`. Browser checks confirmed 15/15 preview images loaded, ten responsive source slots, zero images wider than their masks, and no document overflow at 310, 380 or 1014 CSS content pixels. Phone enlargement opened `/projects/responsive/jobpilot-phone.webp`; pause stopped all running devices and resume restored the control state. Independent motion was observed with the tablet at y=-52.97px while the phone was at its own start/hold position. Typecheck, ESLint, production build and whitespace checks passed.

Signed-in dashboard screenshots can replace the public-page captures through the optional phone/tablet source mapping without changing the layout or animation renderer.


## Readability and motion refinement — 2026-10-06

- The screenshot gallery defaults to the full available width instead of shrinking tall captures to the viewport height. Its bounded image region scrolls vertically and can receive keyboard focus. Actual size remains an optional inspection mode; Fit width returns to the readable default. Changing screenshots or display mode resets the inspection region to the top.
- At 390px review width (380px document content), the JobPilot phone image renders at 312px wide instead of approximately 144px, with 998px image height inside a 462px scroll region. No horizontal scrolling in the default mode. At 320px review width (310px content), it fits the available 242px image region without horizontal overflow.
- ArrowDown scrolls the focused image region (observed scrollTop 40px). Next changes the selected screen and resets scrollTop to zero. Actual size / Fit width switch modes; Escape dismisses the modal. Desktop enlargement fits a 1249px-wide image region without horizontal overflow in default mode.
- Explore project now uses 14px semibold text, a restrained champagne underline and arrow, and a 44px minimum hit area. All five captions remain within the 310px narrow document width, with links wrapping beneath titles where required.
- Independent screen timelines now hold their starting view for 3 / 3.6 / 4.2 seconds, scroll over 7 / 8 / 9 seconds, hold the bottom for 3 seconds, and return over 2.4 seconds. Repeats add a 2-second hold. Hover with a mouse or keyboard focus pauses only that screen's existing timeline; leaving it resumes the same timeline. Touch pointer entry does not establish a persistent hover pause. Global pause, reduced motion, hidden-document and offscreen behavior remain active.
- Browser verification observed the phone preview at y=-160.2px; keyboard focus held that position while the tablet retained its running state. Moving focus resumes the phone and pauses the newly focused screen. The reduced-motion review fixture has zero running device previews.
- Proof: docs/design/readability-refinement/mobile-viewer.jpg (390 × 844 mobile review viewport, 1× density).
- Typecheck, ESLint and production build passed. Whitespace check passed. Existing CMS and responsive screenshot assets, split hero, colours and three-device composition are preserved. Authenticated workflow captures remain a separate content improvement.

## Editorial case studies and laptop fitting — 2026-10-06

final result: passed

This is the approved redesign of `/projects/:slug`, not a pixel clone of the rejected laptop stage. The rejection reference is `../upload/{EB72CC79-2D46-48DA-A372-8FC9CEE83726}.png` (1920 × 787). The new light-theme proof is `docs/design/editorial-case-studies/light.jpg` (1353 × 929 browser capture); it replaces the black hardware stage with the original product screenshot beneath a compact two-column introduction. These captures demonstrate the structural correction at different viewport sizes; no pixel-identical comparison is claimed.

- All eight CMS project routes render the editorial template without hardware in the detail hero. Original narrative, links, features, workflow, engineering evidence and chapter navigation are preserved. Projects without additional screenshots retain their existing cover asset; no product UI is invented.
- Six projects with genuine phone captures select those captures initially below 760px. Existing featured-project phone/tablet captures are reused. User Management adds a capture of its actual public registration form at a 390px browser viewport, cropped to the form card and converted to WebP. No form was submitted, no account was accessed, and it is labelled Mobile registration rather than an authenticated dashboard. Its live public statistics page remained loading during capture, so that page was not used as a new asset. Existing desktop CMS statistics capture remains intact.
- Desktop product hero uses full-width original screenshots, thumbnail tabs, crossfades and one gentle scrolling preview cycle for real overflow: 3-second opening hold, 7–12-second downward travel, 3-second bottom hold, 2.4-second return. Hover/focus, manual inspection, offscreen visibility, document visibility and reduced-motion settings govern playback. Short captures remain static. Portrait screenshots cap at 480px on desktop to avoid excessive enlargement.
- Desktop gallery walkthrough remains sticky at 104px and switches to the most visible numbered step. Browser scrolling changed JobPilot's active screen to Screen 03 and its matching CMS image. Mobile displays individual screenshot sections instead of the desktop sticky arrangement.
- Screen tabs support arrow keys, Home and End with roving focus; selected thumbnails scroll horizontally into view without moving the page vertically. ArrowRight selected Discover jobs from Prepare your resume.
- Native dialog enlargement uses fit-width vertical inspection, accessible controls, Escape dismissal, focus restoration, thumbnails and next/previous navigation. JobPilot phone inspection measured 310px width with no horizontal overflow, 992px image height and 552px viewport height. ArrowDown advanced scrollTop to 40px. Next switched to its tablet capture. Actual size loads the original asset directly; JobPilot's original measured 1899px wide. Native dialog provides modal focus containment.
- All eight routes checked at 320px review width (310px content). Existing chapter-navigation intrinsic sizing initially overflowed JobPilot, Cedar and User Management; constrained grid sizing fixed it. Rechecks measured scrollWidth = clientWidth = 310px. Tablet Cedar checked at 1024px review width (1014px content), with no overflow. JobPilot inspected at 390px review width (380px content). Dark and light themes were visually inspected. Reduced-motion fixture reports no running preview and no pause control.
- Landing keeps the requested three-device arrangement. All five laptop originals loaded and filled their 808 × 494px masks. JobPilot/Cedar rendered 1070 × 494, Lobby 1090 × 494, UniHub 1042 × 494, GameZone 808 × 855. Proportional cover fitting removes empty bands and retains the left navigation, cropping the right edge of wider images. Full originals remain available on enlargement; no image is stretched.
- Proof: `desktop.jpg`, `light.jpg`, `mobile.jpg`, `mobile-gallery.jpg`, `walkthrough.jpg` in `docs/design/editorial-case-studies`. Mobile proofs include the local review wrapper around a 390 × 844px iframe. Browser capture density is 1×; no export-resolution fidelity is claimed.
- No application console errors were found; browser-extension metadata messages were excluded. Typecheck, ESLint, production build and whitespace checks passed.

Remaining content limitation: authenticated phone/tablet dashboard captures can replace the public-page captures later. The CMS currently supplies only a cover for Medicare Hub and Home Services; the template does not fabricate extra screenshots for them.


## Final portfolio refinement — 2026-10-06

final result: passed

Approved visual direction: first desktop concept (`../generated_images/exec-b0a62ec0-df0a-4573-b86f-564f1d455bd1.png`, 974×1618) and third mobile concept (`../generated_images/exec-13777dfd-8470-42e7-ac27-ce1e8e3d3250.png`). Reference and rendered captures were inspected together. Normalized comparison boards in `docs/design/final-refinement/desktop-comparison.jpg` and `mobile-comparison.jpg` preserve aspect ratios and label each side. Desktop comparison crops the reference to the hero/capabilities region; mobile comparison crops decorative side canvas and the review wrapper to the app region. Browser captures are 1353×929 and 1363×936 at 1× density, with the mobile app inside a 390×844 iframe (380px content).

This implements the selected hierarchy, colours, serif/sans pairing, original portrait, primary enquiry action and readable mobile focus. It is not a pixel clone of generated mockup content. Intentional adaptations: original portrait pixels, real CMS copy and links, 44px controls, search/theme utilities, a compact desktop hero, and a hiring disclosure retain existing functionality. Capabilities avoid unsupported performance promises. Three curated projects lead to the full eight-project index; selection and new presentation copy are editable in the CMS editor through optional defaults. No database records were changed.

### Findings resolved

- P1: Duplicate sibling route keys caused duplicate navigation after client-side route changes. Unique route keys fix it; home → index → detail navigation now has one header.
- P2: Mobile hero hierarchy and actions did not match the chosen direction. Larger serif subtitle and separate primary/secondary buttons now precede the portrait.
- P2: Tiny three-device previews were difficult to inspect on phones. Mobile now selects one readable capture with Desktop/Phone/Tablet tabs, companion thumbnails and separate enlargement controls. Desktop keeps the three genuine scrolling screens.
- P2: Grid illustrations did not match the detail pages. Cards now use genuine CMS screenshots, choosing the same primary screen as the landing showcase where available; actual cover assets remain the fallback.
- P2: Light-mode navigation conflicted with fixed dark landing sections. Shared light colours now carry through the landing and index typography, borders and capabilities.
- P2: Mobile contact details displaced the form below the first screen. DOM and visual order are now introduction → form → contact details. The Name field is visible in the first viewport.
- P2: Closed assistant launcher overlapped screenshot and enquiry inspection. It hides while product captures are visible or the form has focus; an open assistant remains available.
- P2: Empty contribution data emitted a literal zero on cover-only projects. Boolean conditional fixes it.
- P2: The old reduced-motion fixture did not cover Motion's shorthand media query. The local fixture now covers both query forms; production uses the actual browser preference. Final review shows zero running previews and no pause controls under the fixture.

### Validation

- TypeScript, ESLint, production build and whitespace check passed after the final implementation.
- All eight case-study routes at 320px viewport (310px content) have scrollWidth = clientWidth, one header, a loaded primary hero asset and zero running previews in the reduced-motion fixture. Recorded in `narrow-route-checks.json`.
- Landing inspected at 390px and 320px, desktop at 1353px, and Cedar case study at 768px (758px content). No horizontal page overflow observed.
- Independent desktop transforms observed: laptop at 0px, phone at -0.32px, tablet at -70.8685px. Mobile phone scroll was also observed at -611.979px before manual inspection. Active/offscreen, global pause and manual inspection govern playback.
- Mobile tabs: ArrowRight selected Tablet; Home selected Desktop; gallery Escape returned focus to the triggering Expand button. Global pause recorded zero running previews.
- Project filter selected Personal and changed the visible count from eight to one. Hiring disclosure closes with Escape and restores summary focus.
- Contact validation focuses Name and exposes required-field errors. Local fixtures verified disabled Sending state, successful focused confirmation, and failure recovery with entered content retained. No production enquiry was sent.
- Application duplicate-key error was corrected and rechecked. Browser-extension metadata errors are unrelated to the application. Expected reduced-motion warning is from the local fixture.

### Content limitations

Phone/tablet assets are authentic existing responsive captures of public project pages, not invented authenticated dashboards. Medicare Hub and Home Services still have only their CMS cover asset. Replacing these with additional actual screenshots remains a content update, not fabricated proof.
