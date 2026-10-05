# Animated project covers — design QA

final result: passed

## Source and evidence

- Original source visual truth: `/workspace/scratch/17adca926edc/upload/jobpilot.png`, 1254×1254 pixels. Inspected, optimized reference retained as `docs/design/animated-project-covers/jobpilot-reference.webp` at 1254×1254.
- Approved adaptation: one prominent real CMS screen, separate photographic environment and live typography, three-screen animated sequence. The square poster's illustrative laptop/tablet/phone interfaces, QR code and flattened feature panel are intentionally not copied. Typography follows the surrounding portfolio's Inter + Instrument Serif system.
- Actual implementation: `http://terminal.local:4173/`, existing production repository and landing-page route.
- Desktop screenshots: `docs/design/animated-project-covers/{jobpilot,lobby,gamezone,cedar,unihub}.jpg`, each 1353×929 raster pixels (captured browser content approximately 1353×929 CSS pixels, 1× capture density). Cover width approximately 1191 CSS pixels and height approximately 754 CSS pixels. A cover-region crop is `jobpilot-cover.jpg`, 1191×751 pixels; the very bottom edge falls at the viewport boundary.
- Full-view combined input: `comparison-final.jpg`, 1950×820, places the original square art direction and the implemented landscape live cover together, retaining each aspect ratio and normalizing their height to approximately 750px. This is an art-direction comparison, not a pixel-exact poster clone.
- Focused combined input: `comparison-focused.jpg`, 1800×800, compares headline/background and product imagery. Source is illustrative UI; implementation is actual CMS UI. Screenshot text and logos are inspected at their natural source quality in the full-resolution viewer.
- Collection evidence: `all-covers.jpg`. This lower-density overview checks consistency and distinct settings; individual captures are the sharpness evidence.
- Mobile: `phone390.jpg`, `phone320.jpg` and `phone-zoom.jpg` (1363×936 raster captures), unscaled iframe widths 390 and 320 CSS pixels, heights 844px; content client widths 380 and 310px due to scrollbar. Captures include the surrounding review stage and are normalized to their iframe content when judging layout.
- Tablet: `tablet-reduced.jpg`, unscaled 1024×844 CSS-pixel iframe; actual content client width 1014px. Uses a local reduced-motion fixture, without changing browser or OS settings.
- State: real featured projects and actual screenshots; final desktop covers are still frames for direct comparison. Normal autoplay was separately tested. Gallery inspection and zoom were separately tested on phone.

## Findings and comparison history

1. Initial comparison (`comparison-initial.jpg` / `initial.jpg`) was **blocked** by [P2] excessive cover height. A cover measured 896px, so its headline and transport could not fit together below the persistent navigation. The full-page screenshot attempt timed out; the saved visible browser capture and measured cover geometry establish the viewport issue. Source poster composition puts headline, product and footer together.
   - Fix: reduce desktop padding and display scale, tighten copy spacing, and set the live screen viewport to 2.45:1. Real screenshot overflow is gently panned and the original is always available through the viewer.
   - Post-fix evidence: `jobpilot.jpg` and `comparison-final.jpg`; cover height is approximately 754px and all cover layers fit in the browser view when aligned below the chapter dock.
2. [P2] transport overlapped the persistent chat control at the lower-right edge; narrow numbered targets were also too small.
   - Fix: center the desktop transport alongside screen steps; on mobile use two centered rows and 44×44px border-box targets.
   - Post-fix evidence: final desktop captures, `phone320.jpg` and `phone390.jpg`; transport is clear of chat, with no page overflow (scrollWidth equals clientWidth at 310, 380 and 1014px).
3. [P2] Cedar's initial generic third-screen label said “Project details” while the actual screenshot showed financial reports.
   - Fix: inspect actual screenshots and label them “Platform overview”, “Project overview”, “Financial reports”. Shorten the frame brand to “Cedar Construction”.
   - Post-fix evidence: `cedar.jpg` and the focused real-screen inspection in browser.

No actionable P0/P1/P2 findings remain after the final combined comparisons. Known intentional differences are the landscape live-cover layout, portfolio typography, a single real product frame, and product navigation outside the cover instead of poster QR/footer content.

## Required fidelity surfaces

- **Fonts / typography:** live Inter display and UI text with Instrument Serif italic emphasis harmonize with the landing page. The reference's bold serif lead is intentionally adapted to the existing portfolio font system. Green/lavender emphasis, generous line height and optical hierarchy remain. Narrow headline wraps cleanly into three lines; labels shorten to numbered controls at narrower widths.
- **Spacing / layout:** headline → features → prominent interface → transport hierarchy retained. Desktop, tablet, 390px and 320px checked. Project caption stays separate, Selected work retains its section gap, and controls do not overlap the persistent chat button. Rounded screen frame, moderate shadow and real environment layers support the presentation.
- **Colors / tokens:** JobPilot and Cedar use ivory/forest green, Lobby charcoal/lavender, GameZone navy/violet, UniHub cream/violet. Live text stays against the photograph's clear central wall. Selected control border and focus outline use each cover's accent; dark/light surfaces have dedicated tokens. Surrounding page stays midnight/gold.
- **Image quality / fidelity:** five built-in image-generation environments inspected after WebP optimization; no fabricated UI, text or devices inside them. CMS sources remain the true project screenshots, with loaded natural widths 1899–1920px (GameZone overview 1366px). Landscape frames deliberately mask overflow for the approved scrolling-preview behavior. Native full-resolution inspection preserves all pixels. Phones communicate the project at a glance; fine desktop UI text is read using Inspect / Zoom rather than claiming it is legible at thumbnail scale.
- **Copy / content:** JobPilot uses the reference's career headline and four verbs. Other covers use accurate concise product descriptions. All captions, screenshot counts, stacks and case-study targets still come from the real project records. Cedar screen labels were corrected from observed UI. No implementation notes appear in the product flow.

## Primary interactions and runtime checks

- Manual next/previous and numbered screen selection: real source URL changes, selected step updates, per-project autoplay pauses.
- Per-project Play: the active cover resumes; tall GameZone screen transform changes vertically during its pan.
- Chapter navigation: reaches all five project articles; only one cover reports `data-running=true` when motion is enabled and a cover is visible. Leaving JobPilot for Lobby makes JobPilot false and Lobby true.
- Global Pause motion: all five report `data-running=false`; manual controls remain usable.
- Reduced motion: after independently clearing the global pause in the reduced-motion tablet fixture, all five covers still show “Still preview”, have disabled autoplay controls and remain `data-running=false`; manual screenshot selection works.
- Phone native dialog: opens the selected real screenshot. Zoom displays approximately 1900px native width inside a 312px scroll viewport; keyboard panning moved scrollLeft to 595px without changing screenshot selection (`phone-zoom.jpg`). Next screenshot wraps from screenshot 4 to screenshot 1; Close and Escape return to the landing page and leave no open dialog.
- Application console: checked errors for the `terminal.local` frontend; none. Browser extension metadata errors are external to the app and excluded.
- Build / lint / typecheck: passed. No backend, CMS records, CV templates, or authentication logic changed. Hidden-document suspension and resize recalculation are implemented, but no browser visibility emulation or animated viewport-resize test is claimed.

## Follow-up polish / test limits

- [P3] A real mobile-specific screenshot set in the CMS would allow larger mobile UI text without native-pixel zoom. Current screenshot truth is primarily desktop imagery; existing gallery inspection provides clear access.
- Final publication requires authenticated Vercel promotion and a live-domain check. Browser QA passing and Vercel branch deployment success do not assert that the production alias has changed.
