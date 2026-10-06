# Three-device projects and split hero — design QA

final result: passed (responsive-screen correction, 2026-10-06)

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
