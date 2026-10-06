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
