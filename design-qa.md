# Engineered Landscape media bounds and visual proposals

Date: 8 October 2026. Status: **image bounds and approved equal-width gallery implemented; Medicare cover not adopted; faithful portrait cutout unresolved**.

## Scope and source evidence

Read `Portfolio_Portrait_Project_Images_Plan_2026-10-08.html`, its implementation brief, and all three embedded screenshots. The attachment supplies review evidence; the user's direct request defines the work and preview-before-adoption boundary.

Inspected repository instructions, branch history and remote refs before creating `fix/engineered-landscape-media` from `866c836`. This preserves `f3fa087`, selected-project refinement `dd708c3`, and mobile Contact correction `866c836`. No later promoted code was found in the fetched refs.

Read-only public CMS inspection and repository asset inventory are recorded in [asset-audit.json](docs/design/engineered-landscape-media/asset-audit.json). All eight current published projects were inspected. Medicare's CMS cover/screenshots are empty; the repository contains its 1000×1000 identity illustration, with no genuine clinic interface capture found. Home Services' existing 1348×926 capture stays complete. GameZone's current 1366×1446 overview stays the preview source; a separate genuine 1600×741 landscape cover already exists, but this change does not substitute it.

## Implemented bounds and state handling

`ResponsiveProjectImage` now owns an opt-in `fit="frame"` mode: both `picture` and `img` fill the available frame, have zero minimum size, and stay bounded in both dimensions. Generated AVIF/WebP sources and remote/unoptimized images use the same containment path. Natural-height reader, inspector and selected-project consumers retain their previous behavior.

The Gallery uses this mode through `ProjectPreview`. Its loading placeholder reserves the same frame, the image appears after decoding, and failed previews show a readable status while retaining the enclosing case-study link and keyboard access. Alt text now describes the chosen screenshot rather than a potentially unrelated CMS promotional cover. Hover zoom was removed because it could crop image edges after successful containment.

After seeing the comparison, the user explicitly chose **"Adopt equal-width gallery only"**. Gallery now uses equal desktop columns, 16:10 frames, 12px desktop / 8px phone padding, aligned caption starts and reserved desktop title rows. Index styling stays separate. Medicare retains its existing illustration treatment, and Home Services retains its complete image. Palette, typography, CMS content, routes, portrait and motion engine are preserved.

## Before/after verification

Installed Chrome 154.0.8037.99, headed desktop capture, DPR 1 and reduced motion; current public CMS records intercepted locally. All public writes were blocked. Complete image boxes and intrinsic dimensions were measured, not just computed `object-fit`.

| Viewport | GameZone before | GameZone after | All eight / modes |
| --- | --- | --- | --- |
| 1363×936 | 605.9px image / 288.6px frame | 335.1px image / 359.1px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |
| 1280×720 | 568.9px image / 270.8px frame | 312.2px image / 336.2px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |
| 390×844 | 352.6px image / 162.5px frame | 192.2px image / 208.2px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |
| 320×568 | 287.0px image / 132.3px frame | 153.5px image / 169.5px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |

[Before measurements](docs/design/engineered-landscape-media/before-review.json), [after measurements](docs/design/engineered-landscape-media/after-review.json). Per-project card screenshots for all four sizes are in the same directory (`1` JobPilot, `2` Lobby, `3` GameZone, `4` Construction, `5` UniHub, `6` User Management, `7` Medicare, `8` Home Services).

| Evidence | Before | After |
| --- | --- | --- |
| GameZone desktop | [1363×936](docs/design/engineered-landscape-media/before-1363x936-3.jpg) | [1363×936](docs/design/engineered-landscape-media/after-1363x936-3.jpg) |
| GameZone short desktop | [1280×720](docs/design/engineered-landscape-media/before-1280x720-3.jpg) | [1280×720](docs/design/engineered-landscape-media/after-1280x720-3.jpg) |
| GameZone phone | [390×844](docs/design/engineered-landscape-media/before-390x844-3.jpg) | [390×844](docs/design/engineered-landscape-media/after-390x844-3.jpg) |
| GameZone narrow phone | [320×568](docs/design/engineered-landscape-media/before-320x568-3.jpg) | [320×568](docs/design/engineered-landscape-media/after-320x568-3.jpg) |
| Home Services proportions | [desktop](docs/design/engineered-landscape-media/before-1363x936-8.jpg) | [desktop](docs/design/engineered-landscape-media/after-1363x936-8.jpg) |
| Index mode | [320px](docs/design/engineered-landscape-media/before-320x568-index.jpg) | [320px](docs/design/engineered-landscape-media/after-320x568-index.jpg) |

Compiled production preview additionally verified [loading](docs/design/engineered-landscape-media/loading-320.jpg) and [intercepted failure](docs/design/engineered-landscape-media/error-320.jpg) at 320px. Both retain an identical 271.2×169.5px frame and a focusable case-study link; [production-review.json](docs/design/engineered-landscape-media/production-review.json) records no page errors.

The compiled build also used **actual WebGL** on Intel UHD / ANGLE Direct3D11 for Lobby selection, settled view, Escape reversal and focus restoration. [Screenshot](docs/design/engineered-landscape-media/production-webgl-lobby.jpg), [hardware/result](docs/design/engineered-landscape-media/production-motion.json). The full existing regression suite separately exercises reduced motion, photographic fallback, chapter switching, interrupted selection, selected layouts and Contact states with intercepted submissions.

## Reviewed visuals and adoption decision

Shown to the user before adoption, as requested:

- [Interactive comparison sheet](docs/design/engineered-landscape-media/gallery-comparison.html) / [image](docs/design/engineered-landscape-media/gallery-comparison.jpg): accepted composition with clipping fixed beside equal-width columns, matching **16:10** frames, **12px** desktop padding and aligned captions. Each card is an actual browser capture; the sheet arranges those captures for comparison.
- [Medicare landscape identity cover](docs/design/engineered-landscape-media/proposed-medicare-identity.jpg): original illustration contained beside its existing name/category/stack, explicitly labelled **Project identity**. No product interface is invented.
- [Mobile GameZone frame proposal](docs/design/engineered-landscape-media/proposed-mobile-card-3.jpg) and [complete Home Services proposal](docs/design/engineered-landscape-media/proposed-mobile-card-8.jpg): **8px** mobile padding, single column. Desktop proposal screenshots `proposed-card-1` through `8` and phone proposal screenshots `proposed-mobile-card-1` through `8` are included.

The user approved the **equal-width gallery only** after viewing these artifacts. The comparison's right-hand sheet includes a Medicare cover proposal that is **not adopted**; the actual implementation is shown in the `after-*` screenshots. Original comparison captures remain available for the review history. No portrait integration was approved or performed.

## Portrait limitation

Inspected the original `public/myphoto.jpeg` and approximate `portrait-silhouette.svg`. The available image editor produced a transparent candidate, shown as a proposal, but it retained colored edge fringes and changed clothing texture; its canvas also changed from 960×1280 to 1086×1448. It is unsuitable for the requested faithful photographic extraction and was rejected rather than integrated. The generated candidate stays outside the repository. No replacement person, new rough SVG, shadow or color correction was adopted.

The original photograph remains byte-for-byte unchanged, SHA-256 `e6af23208df8739c79c2b379c418a182a0d65e20c184bc6e1626b85ba99c2b05`. Its dark trousers and green reflections are present in the original. The old approximate mask remains an unresolved visual defect until an accurate matte can be made with a suitable photo extraction tool. [Original profile baseline](docs/design/engineered-landscape-media/before-profile-320x568.jpg) / [unchanged after](docs/design/engineered-landscape-media/after-profile-320x568.jpg).

## Checks and remaining limits

- `npm run typecheck`, `npm run lint`, `npm run build`: pass. The build retains the existing >500kB motion chunk warning.
- `npm run test:landscape`: **10/10 pass**.
- Final full browser run: **116/117 pass**, including all 15 new preview cases across desktop, tablet and mobile Chrome. One Chromium header case was interrupted by a Vite development reload while screenshot artifacts were written; its targeted rerun passes. All 117 current cases therefore have a passing result. The initial new tests also exposed an incomplete profile fixture, corrected before this final run. No application defect was hidden by retrying a failing assertion.
- New coverage checks all eight representative real aspect ratios at each requested viewport, optimized and unoptimized image paths, actual picture/image/painted bounds, hover containment, Gallery/Index transitions, routes, reserved slow/failure frames and keyboard access.
- Physical phones, Safari/WebKit and real device keyboards were not available. Chrome touch/DPR emulation is not physical-device verification. Remote image host availability can vary; local fixtures cover transport failure independently.
- The approved gallery is implemented; the Medicare identity cover is not adopted. A faithful portrait cutout remains unavailable. No clinic interface was found in the inspected CMS/repository assets; no authenticated clinic workflows were accessed.
- No merge, deployment, production Contact submission, or live database content change occurred. Generated build outputs, credentials, temporary helpers and rejected portrait candidate are excluded from the commit.

---

# Engineered Landscape mobile Contact correction

Date: 8 October 2026. Status: **implemented and locally verified; physical phone keyboards and Safari remain unverified**.

## Scope and cascade findings

Inspected repository instructions, the clean current branch and commits, and
fetched remote refs. Work continues on the dedicated
`refine/engineered-landscape-selected-views` branch, based on its existing
`dd708c3` selected-project refinement and `f3fa087` fixes. This Contact correction
is a follow-up in draft PR #6. The selected-project components, stylesheet,
sculpture assets, and motion engine were not edited.

Reviewed the live [Contact page](https://mahmoud-portfolio-omega.vercel.app/contact)
in installed Chrome at the requested widths, using read-only navigation and a
browser route guard that blocked every non-GET `/api` request. Captured the local
`dd708c3` baseline separately with the same read-only CMS snapshot used for the
after captures. No production Contact submission or live database write occurred.

The live and local CSS cascades reproduced these problems:

- The landscape page used 6% outer padding, while a legacy mobile
  `.public-container` rule still subtracted another 40px. At 320px, Contact's
  container measured approximately 242px wide with asymmetric remaining space.
- `.contact-form-column .contact-form` won against the landscape form styling,
  resetting mobile padding and borders to zero. Inputs were 40px high, and the
  Send button stayed at its content width.
- Desktop grid areas and explicit placements competed with responsive rules.
  The existing viewport-height shell made Contact scroll inside `main`, while
  its footer remained at the shell bottom rather than after the whole page.

## Scoped correction

Contact now owns a page stylesheet scoped to `.landscape-contact` and the
Contact-only `.portfolio.is-contact` modifier. It applies below 768px and to
phone landscape up to 960px wide / 500px high. Desktop Contact and other routes
retain their existing geometry.

Mobile Contact uses one **16px content gutter**, a **100%-width inner container**,
and `min-width: 0` throughout the form column. Grid areas and explicit child
placements reset to automatic single-column flow in DOM order: introduction,
form, contact details. The form has **18px internal padding** and one theme-token
border. Name/Email stack; controls fill the available width with **48px input
height and 16px text**. Enquiry choices wrap deliberately, and Send fills its row.
Email links, validation/error messages, and success content wrap without document
horizontal overflow. CMS copy, field semantics, validation, submitted payload,
honeypot, backend protections, and success/failure behavior remain intact.

The mobile Contact document grows naturally instead of retaining an internal
viewport-height scroll trap. The footer follows the content. A Contact-only hook
checks focused fields/buttons after focus, content resize, and VisualViewport
resize/scroll events, keeping them within the visible area. The footer/AI launcher
is hidden while an active Contact control has a substantially reduced visual
viewport and returns when editing ends. Other pages keep their existing footer.

State regressions exposed an existing focus race on `Send another message`:
its animation-frame callback could run before the reset form mounted. Focus now
runs after the success state resets and the new Name input exists. This restores
the intended focus behavior without changing validation or delivery contracts.

## Verification

Reviewed initial, focused, validation-error, pending, failure, and success states
at **320 x 568, 360 x 800, 390 x 844, 430 x 932, and 844 x 390** using installed
Chrome 154.0.8037.99 on Windows, DPR 1. All submissions were intercepted:
validation made zero requests, pending stayed disabled behind an explicit response
gate, failure retained entered values, and local 201 success focused the status
panel. Returning to the form restored Name focus and empty fields.

| Width | Content width after | Gutter | Form padding | Input height |
| --- | --- | --- | --- | --- |
| 320px | 288px | 16px | 18px | 48px |
| 360px | 328px | 16px | 18px | 48px |
| 390px | Approximately 358px | 16px | 18px | 48px |
| 430px | Approximately 398px | 16px | 18px | 48px |
| 844px phone landscape | 812px | 16px | 18px | 48px |

No horizontal overflow occurred. Before/after desktop geometry at 1363 x 936
matched exactly: the two-column grid/areas, paired Name/Email row, 28px form
padding, 40px desktop inputs, form/content dimensions, and footer bounds remain.

**Synthetic keyboard coverage is not physical keyboard coverage.** Simulated
VisualViewport events left 300px visible with a 24px offset in portrait and
180px visible in landscape. Name, Email, Subject, Message, and Send remained
inside those bounds with approximately 16px clearance, the footer/AI launcher
was hidden, and the launcher returned after blur/dismissal. This verifies the
layout response and event logic; it does not emulate an OS keyboard's rendering
or all Safari/Android viewport behavior.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 717 modules |
| `npm run test:landscape` | 10/10 pass |
| Full Playwright suite, local port 5175 | 102/102 pass without retries across desktop, tablet, and mobile Chromium |
| `git diff --check` | Pass |
| Compiled 320 x 568 production preview | 16px gutter, 18px padding, 48px inputs, intercepted success, correct payload/honeypot, restart focus pass |

Seven new Contact scenarios run in each browser project: five widths/state flows,
portrait/landscape visual-viewport handling, and desktop preservation. Existing
selected-project layout, fallback, reversal/focus, AI/header, CMS, gallery,
Contact, Job Match, admin, and navigation regressions also pass. No new GPU or
performance claim is made for this Contact-only change.

## Screenshots and reports

The [Contact evidence directory](docs/design/engineered-landscape-contact) includes
live before captures, local before/after captures, and intercepted state captures.
After images show the full naturally scrolling document; before images show the
old viewport shell and its clipped inner scroll area, without stretching images
to equal heights.

| Size | Before/after comparison | Focused | Validation | Pending | Failure | Success |
| --- | --- | --- | --- | --- | --- | --- |
| 320 x 568 | [Compare](docs/design/engineered-landscape-contact/comparison-320x568.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-success.jpg) |
| 360 x 800 | [Compare](docs/design/engineered-landscape-contact/comparison-360x800.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-success.jpg) |
| 390 x 844 | [Compare](docs/design/engineered-landscape-contact/comparison-390x844.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-success.jpg) |
| 430 x 932 | [Compare](docs/design/engineered-landscape-contact/comparison-430x932.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-success.jpg) |
| 844 x 390 | [Compare](docs/design/engineered-landscape-contact/comparison-844x390.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-success.jpg) |

Machine-readable reports: [live baseline](docs/design/engineered-landscape-contact/live-before-review.json),
[local baseline](docs/design/engineered-landscape-contact/before-review.json),
[after geometry](docs/design/engineered-landscape-contact/after-review.json),
[intercepted states](docs/design/engineered-landscape-contact/states-review.json),
[synthetic viewport checks](docs/design/engineered-landscape-contact/keyboard-review.json),
and [compiled preview](docs/design/engineered-landscape-contact/build-review.json).
The synthetic viewport captures are explicitly labelled and cropped to their
simulated visible area; they are not screenshots of a physical keyboard.

## Remaining limitations

- Physical iOS Safari and Android keyboards, address-bar transitions, autofill,
  pinch zoom, and device-specific viewport panning still need device review.
- The fix is not deployed; the production page remains subject to its current
  deployed CSS until a separately authorized deployment. No PR was merged.
- Production mail delivery was intentionally not tested. All pending/failure/
  success results use intercepted browser responses; no live database content
  changed.
- The existing lazy motion chunk advisory remains unchanged at 502.76kB
  (126.82kB gzip). No threshold, motion engine, or selected-project asset changed.

---

# Engineered Landscape selected-project refinement (dd708c3 baseline)

Date: 8 October 2026. Status: **implemented and verified locally on actual WebGL hardware, with separate fallback coverage; ready for draft PR review**.

## Scope and branch

Read the repository AGENTS.md and RTK.md, inspected the original checkout and
the existing integration worktree, fetched remote refs, and reviewed current
commits/open PRs. The latest available Engineered Landscape code is
`f3fa087f2d3fc9babe47a575d0f9756c1f6547b8`; remote promotion branches had not moved
beyond the previously recorded integration. The dedicated
`refine/engineered-landscape-selected-views` branch starts at `f3fa087` and targets
`fix/engineered-landscape-live-review` (draft PR #5), retaining all its fixes.

Reviewed the three supplied `selected-title-01-jobpilot.jpg`,
`selected-title-02-construction.jpg`, and `selected-title-03-lobby.jpg` images as
evidence of the existing defects. The user's requested composition and copy
define the implementation, rather than any inferred instructions in the images.
No merge, deployment, production Contact submission, or live database write was
performed. The original main checkout and untracked handoff remain untouched.

## Implemented composition

The selected screenshot and caption now share an 880px maximum, 88%-width
responsive frame. A reserved image slot uses `object-fit: contain`, with the
complete image aligned to its left/bottom edges. It adds no cropping, border,
or decorative browser frame. The caption starts 24px below the image slot, with
52px desktop / 32px mobile titles and readable tight line height. Title/category
and controls occupy separate rows, so title length cannot squeeze navigation.
Preview choices stay on one horizontally scrollable row when space is limited.
The CTA stays on one line, exceeds 180px wide and 44px high, and fills the mobile
frame. Only selected views use natural document height and vertical scrolling.

Collection and selected-view presentation labels now read:

| Title | Category |
| --- | --- |
| JobPilot AI | AI career workspace |
| Lobby | Real-time communication |
| Cedar Construction | Project operations & accounting |

Full CMS names remain available in accessible descriptions when the display name
differs, screenshot alt text, readers, URLs, and AI context. All original CMS
names/descriptions, real screenshot sources, case-study content, and other pages
remain intact. The visible Cedar label supersedes the earlier `Construction OS`
presentation label in the historical review below.

## Motion and image readiness

The caption uses a restrained upward mask reveal after the screenshot transition
and WebGL fade settle. Its layout space exists throughout loading and animation.
Reversal, Escape, keyboard selection, chapter switching, focus restoration,
reduced motion, articulation geometry, joints, materials, palette, portrait, and
existing motion durations are preserved.

Cold CMS PNGs were observed painting partially during the handoff. The opening
sequence now waits for the first preview's browser decode, with a restrained
loading status in the reserved slot. Chapter changes keep their reserved image
space and hide incomplete images until decoded. A failed image exposes a useful
status and retains the case-study and Collection controls; Escape works during
loading. Image readiness does not restart the selection on chapter switching.

The WebGL target is measured from the reserved, untransformed image frame.
A camera ray maps its center onto the assembly plane, and the existing movement
interpolates from the original sculpture position to that target. Measurements
update when the stage or shared frame resizes. The three models and articulation
paths themselves are unchanged.

## Verification results

Captured all three settled views before and after at **1363 x 936, 1280 x 720,
390 x 844, and 320 x 568**, DPR 1, using headed installed Chrome 154.0.8037.99 on
Windows. Every settled after-view used `data-renderer="webgl"` and an actual
WebGL 2 canvas with this device renderer:

`ANGLE (Intel, Intel(R) UHD Graphics (0x00009A60) Direct3D11 vs_5_0 ps_5_0, D3D11)`.

Visually reviewed the complete screenshots, titles, category spacing, and
control rows across the twelve layouts. Before desktop title/image left edges
differed by approximately 191px at 1363px width and 179px at 1280px. After the
refinement, the measured difference is **0px** in every layout, with **24px**
caption spacing. All three projects share the same caption position at each
tested size. Responsive image candidates can differ in resolution as the frame
width changes; their source captures and aspect ratios remain unchanged.

| Viewport | Title | CTA | Document behavior |
| --- | --- | --- | --- |
| 1363 x 936 | 52px | Approximately 186 x 53px, one line | Fits the viewport |
| 1280 x 720 | 52px | Approximately 186 x 53px, one line | Approximately 852px document; normal vertical scrolling |
| 390 x 844 | 32px | Full frame width, approximately 344 x 53px | Fits the viewport |
| 320 x 568 | 32px | Full frame width, approximately 282 x 53px | Approximately 668px document; normal vertical scrolling |

Actual GPU opening/handoff/reversal recordings and frame samples confirm that
each caption remains at one document position and appears only after the rig is
settled and the image has full opacity and its final transform. Keyboard chapter
switching changed the screenshot for all three projects without moving the
caption. Every reversal restored the originating button's focus and left zero
canvases. Resizing during opening to 320 x 568 retained WebGL and reachable
controls; Escape during opening succeeded. Navigating to Profile during opening
disposed the canvas. Deliberate context loss exposed fallback. No page exceptions
occurred. These are functional/timing observations, not a fresh performance
benchmark or a claim about another device's GPU.

Separately forced unavailable WebGL at 320 x 568 for all three projects. Each
photographic fallback retained the complete preview, caption, case link, reversal,
and focus restoration, with zero canvases. Reduced-motion and slow/failed-image
regressions passed across all three automated browser projects.

| Required check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 715 modules |
| `npm run test:landscape` | 10/10 pass |
| Full Playwright suite with local base URL on port 5175 | 81/81 pass, no retries; desktop, tablet, mobile Chromium |
| `git diff --check` | Pass |
| Compiled production preview at 320 x 568 | Aligned Cedar composition, full-width single-line CTA, reduced motion, and intercepted AI stream pass |

New regressions verify all three views at all four sizes, complete image loading,
contain behavior, caption spacing/alignment, exact presentation copy, full
accessible names, title sizes, CTA text line count/dimensions, scrolling reach,
chapter switching, focus restoration, fallback reveal order and reserved space,
and slow/failed-image recovery. Existing AI/header, CMS reader, gallery, Job Match,
Contact, admin, and navigation regressions also pass. The production-preview
assistant fixture verifies the original construction slug plus JSON Content-Type
and streaming Accept. This refinement made no new production AI-service requests.
Contact/admin writes remain intercepted fixtures only.

## Screenshot and recording evidence

All raw before/after captures are in
[`docs/design/engineered-landscape-selected`](docs/design/engineered-landscape-selected).
Short-screen captures include the full naturally scrolling document; they are
not represented as content fitting entirely within the shorter viewport.

| Project | Desktop before/after | Short mobile before/after |
| --- | --- | --- |
| JobPilot AI | [Comparison](docs/design/engineered-landscape-selected/comparison-jobpilot-1363x936.jpg) | [Comparison](docs/design/engineered-landscape-selected/comparison-jobpilot-320x568.jpg) |
| Lobby | [Comparison](docs/design/engineered-landscape-selected/comparison-lobby-1363x936.jpg) | [Comparison](docs/design/engineered-landscape-selected/comparison-lobby-320x568.jpg) |
| Cedar Construction | [Comparison](docs/design/engineered-landscape-selected/comparison-cedar-1363x936.jpg) | [Comparison](docs/design/engineered-landscape-selected/comparison-cedar-320x568.jpg) |

| Project | 1280 x 720 after | 390 x 844 after | Separate fallback |
| --- | --- | --- | --- |
| JobPilot AI | [Capture](docs/design/engineered-landscape-selected/after-jobpilot-1280x720.jpg) | [Capture](docs/design/engineered-landscape-selected/after-jobpilot-390x844.jpg) | [Capture](docs/design/engineered-landscape-selected/fallback-jobpilot-320x568.jpg) |
| Lobby | [Capture](docs/design/engineered-landscape-selected/after-lobby-1280x720.jpg) | [Capture](docs/design/engineered-landscape-selected/after-lobby-390x844.jpg) | [Capture](docs/design/engineered-landscape-selected/fallback-lobby-320x568.jpg) |
| Cedar Construction | [Capture](docs/design/engineered-landscape-selected/after-cedar-1280x720.jpg) | [Capture](docs/design/engineered-landscape-selected/after-cedar-390x844.jpg) | [Capture](docs/design/engineered-landscape-selected/fallback-cedar-320x568.jpg) |

Evidence reports: [before geometry](docs/design/engineered-landscape-selected/before-review.json),
[after geometry](docs/design/engineered-landscape-selected/after-review.json),
[actual GPU motion and separate fallback](docs/design/engineered-landscape-selected/motion-review.json),
[compiled preview](docs/design/engineered-landscape-selected/build-review.json), and
[opening, chapter switching, reversal, resize, and Escape recording](docs/design/engineered-landscape-selected/selection-motion.webm).
Opening/handoff/reversal stills are included beside the reports.
The [collection copy and loading-Escape review](docs/design/engineered-landscape-selected/collection-review.json)
also records all four collection sizes and focus restoration while an image
request is deliberately held, with zero remaining canvases.

## Remaining gaps

- Physical iOS/Android, Safari, browser-chrome viewport changes, and touch-device
  GPU qualification remain unverified. Mobile sizes here are Chromium viewport
  emulation on the Windows Intel GPU.
- No deployment or post-deployment frontend verification was performed. This is
  a draft PR stacked on the available `f3fa087` code, not a promotion or merge.
- Remote CMS image latency can delay the opening while the image decodes; the
  loading state and Escape remain available. Backend/CMS images were not edited.
- The existing 500kB Vite advisory remains for the lazy motion chunk, now
  502.76kB (126.82kB gzip) after image-position mapping. No threshold was raised.
- Production Contact delivery and live database writes were intentionally not
  tested. The read-only CMS snapshot/QA adapter stays outside application source;
  no secrets, signed tokens, PDFs, or dist artifacts are committed.

---

# Engineered Landscape live-review fixes (historical f3fa087 baseline)

Date: 8 October 2026. Status: **all four requested fixes implemented and verified locally; ready for draft PR review**.

## Review source and branch

Read the complete supplied `Engineered_Landscape_Live_Review_2026-10-08.html`
from Downloads and visually inspected all ten embedded screenshots. Its findings
were used as evidence for the user's requested fixes; the user's instructions
define the scope and prohibit merge, deployment, production Contact submissions,
and live database changes.

Inspected the branch, commits, remote refs, and open PRs before implementation.
The dedicated `fix/engineered-landscape-live-review` branch starts at integration
commit `31dc81bc3fbef6a36820ac8d808be8769065f4c0`, including the streaming whitespace
fix `3a09264`. It targets `feat/engineered-landscape`, the head of existing draft
PR #4. The original checkout and previous integration evidence remain intact.

## Fixes in requested order

1. **Assistant request headers.** `apiResponse` now builds a native `Headers`
   object and applies it after spreading the caller's options. Streaming POSTs
   preserve both `Content-Type: application/json` and `Accept: text/event-stream`.
   All three `HeadersInit` forms, case-insensitive explicit content types,
   caller credentials, FormData boundaries, and admin unauthorized events are
   covered. The JSON-header regression failed against the previous code.
2. **Screenshot gallery.** `CaseGallery` imports its own stylesheet. Removed its
   orphaned rules from the former project page and competing global overrides.
   A bounded dialog grid keeps the header, scrollable image region, 84 x 56px
   thumbnail buttons, and footer inside the viewport. Close/navigation targets
   remain at least 44px. Fit width, actual-size scrolling, thumbnail selection,
   arrow keys, Escape, and focus restoration remain functional.
3. **Construction collection label.** The sculpture uses the display title
   `Construction OS` at the accepted label size. Its accessible description,
   project reader, route, selection content, and CMS name still use the full
   `Construction Project Management & Accounting System` name. No CMS record
   was edited.
4. **Metadata and search spacing.** Team size is a nonbreaking phrase in a
   wrapping role row. The Projects input explicitly reserves 40px on the left
   for its positioned 16px icon, including narrow widths.

The accepted palette, sculptures, motion engine/timelines, portrait, CMS hooks,
backend validation/security, and existing features are preserved. No production
adapter or fixture content was added to application source.

## Checks and browser results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 714 modules |
| `npm run test:landscape` | 10/10 pass |
| Playwright full suite, local base URL on port 5175 | 63/63 pass across desktop, tablet, and mobile Chromium |
| `git diff --check` | Pass |
| Built production preview on port 5176 | Mobile gallery CSS loaded, controls visible, JSON + streaming headers preserved, fixture stream completed |

New browser regressions check actual outgoing browser headers, multipart uploads,
gallery image loading and geometry, compact/full construction names, team phrase
line bounds, search icon separation, and real filtering. The assistant fixture
now rejects missing request headers instead of masking the defect. A rerun
exposed an existing Contact fixture's 150ms timing race; its response is now
released explicitly after verifying the disabled pending button. The final full
suite passed without retries. All Contact/admin writes in tests are intercepted.

Headed installed Chrome 154.0.8037.99 on Windows captured the public CMS snapshot
at 1363 x 936 (desktop) and 390 x 844 (mobile), DPR 1. Automated tests also cover
1024 x 1366, Pixel 7 emulation, and a 320 x 568 gallery/metadata resize.

| Layout evidence | Desktop | Mobile |
| --- | --- | --- |
| Gallery frame | 1260 x 900; fully inside viewport | Approximately 370 x 824; fully inside viewport |
| Close and footer navigation | Visible inside dialog | Visible inside dialog |
| Thumbnails | Small, decoded images | Small, decoded visible images; horizontal scrolling |
| Escape focus restoration | Pass | Pass |
| Search text-to-icon gap | 12px | 12px |
| Projects document horizontal overflow | None | None |

Screenshots were captured after decoding the visible gallery images. Public
remote PNG thumbnails took about 12 seconds to finish in one cold local run;
their underlying CMS image URLs and assets remain unchanged.

## Real assistant verification and QA correction

The earlier integration QA adapter forced `Content-Type: application/json` when
forwarding requests, which masked the client header defect. That limitation
invalidates the earlier report's inference that the deployed client transport
was correct. For this review, the external, local-only adapter forwards the
browser's actual Content-Type and Accept values. It serves read-only public CMS
snapshots and blocks Contact and all other writes.

The fixed client received genuine HTTP 200 completed streams for both general
and JobPilot-specific questions, with JSON + streaming headers, correct project
context, and usable case-study links. A deliberately malformed text/plain
request received the genuine upstream HTTP 415 `Content-Type must be
application/json.` response, proving that forwarding no longer bypasses header
validation. On mobile, a locally intercepted first-response 503 exposed
`Try again`; the subsequent real upstream retry returned 200, preserved both
headers and `jobpilot-ai` context, and produced a completed answer with its case
link. No page exceptions occurred. These results verify the fixed local client
against the existing published backend; they do not claim a deployment.

Machine-readable evidence:
[layout and real assistant results](docs/design/engineered-landscape-live-review/browser-review.json),
[real retry](docs/design/engineered-landscape-live-review/assistant-retry.json),
[compiled build smoke](docs/design/engineered-landscape-live-review/build-smoke.json).

## Screenshots

| View | Desktop / comparison | Mobile |
| --- | --- | --- |
| Collection label | [Before/after](docs/design/engineered-landscape-live-review/collection-comparison.jpg) | [Collection](docs/design/engineered-landscape-live-review/mobile-collection.jpg) |
| Screenshot gallery | [Before/after](docs/design/engineered-landscape-live-review/gallery-comparison.jpg) | [Fit width](docs/design/engineered-landscape-live-review/mobile-gallery.jpg), [actual size](docs/design/engineered-landscape-live-review/mobile-gallery-actual.jpg) |
| Full Construction name | [Reader](docs/design/engineered-landscape-live-review/desktop-construction-reader.jpg), [gallery](docs/design/engineered-landscape-live-review/desktop-construction-gallery.jpg) | [Reader](docs/design/engineered-landscape-live-review/mobile-construction-reader.jpg), [gallery](docs/design/engineered-landscape-live-review/mobile-construction-gallery.jpg) |
| Case metadata | [Before/after](docs/design/engineered-landscape-live-review/case-metadata-comparison.jpg) | [Metadata](docs/design/engineered-landscape-live-review/mobile-case-metadata.jpg) |
| Projects search | [Before/after](docs/design/engineered-landscape-live-review/projects-search-comparison.jpg) | [Search](docs/design/engineered-landscape-live-review/mobile-projects-search.jpg) |
| Real assistant | [General](docs/design/engineered-landscape-live-review/live-assistant-general.jpg), [JobPilot](docs/design/engineered-landscape-live-review/live-assistant-jobpilot.jpg) | [Retry error fixture](docs/design/engineered-landscape-live-review/mobile-assistant-retry-error.jpg), [real retry success](docs/design/engineered-landscape-live-review/mobile-assistant-retry-success.jpg) |

## Remaining limitations

- Physical iOS Safari and Android device layouts, touch/keyboard behavior,
  browser UI viewport changes, and GPU/motion qualification remain unverified.
  Chromium emulation is not physical mobile-device evidence.
- No fresh motion performance benchmark was taken for this scoped fix; the
  unchanged engine retains the integration measurements below. Award/readiness
  claims still require the earlier outstanding device review.
- These fixes have not been deployed. Production frontend verification remains
  pending a separately authorized deployment. No PR was merged.
- Production Contact delivery and live database writes were intentionally not
  exercised. No secrets, signed tokens, PDFs, dist output, or QA adapters are
  included in this change.
- The existing lazy Three.js chunk is 501.11 kB (126.26 kB gzip), producing the
  existing Vite 500 kB advisory. The threshold and engine were not changed.

---

# Engineered Landscape integration QA (historical baseline)

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
