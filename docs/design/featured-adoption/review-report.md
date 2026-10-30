# Cedar and Lobby normal-route adoption — 30 October 2026

Approved reference: PR #55 / `92842e23f42b5a6aae4606d775b781339de2d1bc`, including PR #54's shared presentation, motion and journey work. Branch `adopt/cedar-lobby-phase2` is stacked above `refine/featured-demo-introductions`. The checkout and fetched remote matched that approved head; only the existing untracked handoff file was present. No reset, stash or handoff edit.

## Adoption and integration

Normal Collection selections and `/projects/construction-project-management-accounting-system` and `/projects/lobby` now use the approved shared presentation without review flags. `featuredPresentation` supplies approved defaults while explicit historical contexts keep their own variants. The Phase 2 stylesheet moves into the shared application import as `featured-presentation.css`; its scoped rules and approved visual values are preserved. There is no separate production component or duplicated content.

Contained articulation, original objects/materials, complete images, mobile identity → image → screen choices → actions order and desktop side column remain. Cedar's 03/title clear the header. Its tall second selection remains naturally proportioned and deliberately makes the reader longer. Original inspection/gallery and source links remain. The concise engineering headings, compact sample labels, container-aware three-column/vertical progress, spacing and full implementation disclosures are adopted unchanged.

The existing history handoff now saves Cedar/Lobby image/position metadata on normal URLs too. The existing route-restoration owner recognizes their normal routes and gives a returning preview's saved position precedence over its engineering hash. This was a necessary integration fix: the first normal compiled run exposed a return-scroll jump when review aliases were replaced by ordinary URLs. No new history entry, scroll controller, timeout, reducer or motion clock.

Intentional differences from the review candidates:

- Ordinary Collection/reader URLs replace `/review/featured/...` aliases.
- Public canonical paths and ordinary indexing metadata apply; review entries remain noindex.
- A reader opened directly, without a Collection origin, retains its established **All projects** return link. A Collection-origin reader returns to its selected preview with screen/demo state, scroll and focus.
- Historical review entries/comparison assets remain available only through the existing explicit review build. The adoption branch is **not** on the automatic review-build allowlist. Vercel Production fails closed even when review mode is requested. No navigation/sitemap or protection changes.

## Compiled verification

Normal output was built without a review flag and tested at 320×844, 390×844, 430×844, 768×1024, 1280×720 and 1440×900. The same journey assertions run against explicit review candidates as well, retaining historical-baseline coverage.

- **49 normal compiled cases passed**, retries disabled. Three historical/comparison-only cases are inapplicable there and remain exercised in review mode.
- **51 explicit-review compiled cases passed**, retries disabled. The normal-only exclusion case is inapplicable there and runs in the normal gate.
- **38 existing Cedar/Lobby/complete-preview regressions passed against normal compiled output**, retries disabled. All calculation, permission, outdated/rejected state, explicit refresh, Reset, source disclosure, keyboard, 44px targets, natural ratios and fallback checks remain.
- The two affected case-study stories passed at their four existing widths against compiled output, including the complete summary retained in Project context. Unrelated case-study expectations remain unchanged.
- Typecheck, lint, normal/review builds, three production guards, review policy checks, 19 geometry/motion/reducer/policy cases and all 62 integrity/API cases passed locally.
- A build forced to `VERCEL_ENV=production` with `featured-design-review` mode also passed the normal Phase 2 exclusion/adoption guard.

Existing tests are adapted to the approved presentation: the accepted Cedar heading and 180px tablet artwork; shared identity/actions order and full-width desktop action; image-area ratios excluding the approved frame inset, with the original ratio precision; concise reader opening plus complete context summary. No assertion deadlines or CI job deadlines were extended. The existing CI gate additionally runs the normal compiled suite. Exact final-head CI conclusions and Preview SHA/access are published in the stacked draft PR delivery so the checked commit remains immutable; pending/cancelled runs are not passes.

Initial failures are not hidden. The first normal run found the real scroll-restoration dependency and two test-address conversions still targeting excluded review paths; both were corrected. Older preview tests measured the decorated outer frame rather than the reserved image area. An early development-server run had a cold `page.goto` timeout and a Vite ResizeObserver overlay/focus interruption; another cold development entry timed out. Compiled runs passed their unchanged deadlines. These local development failures are not counted as passes. No application image/deadline/observer suppression was added to obtain a pass.

## Matched evidence and methods

[Offline comparison](index.html), [download with recordings](comparison.zip), [changed files](changed-files.txt), [artifact hashes](artifact-hashes.json), [48 parity comparisons](adoption-comparison.json).

The approved compiled build was frozen before application edits. Final normal captures use the same archived public GET snapshot and genuine original project image bytes. They are separate from synthetic CMS/image regression fixtures and are **not** a fresh CMS audit. Backend routing rejects non-GET/HEAD requests. Completed capture records have no page errors or attempted writes.

Both sides contain six-size selected preview, second complete image, reader opening, preview/reader demonstration, outdated/rejected result, recovery, Reset and return captures. Phone/desktop native browser recordings include the opening and the complete journey. Additional 200% demo-text captures cover both contexts at 320/390/430/768px. Reduced-motion and deliberately denied-WebGL 390px examples are labelled separately.

All **24 approved-versus-adopted** preview/reader text and measured-geometry comparisons match after normalizing only the intentional direct-reader return label. All **24 unrelated-route** comparisons match text/geometry: unselected Collection, Projects, JobPilot selection/reader, the other five readers, Profile, Contact and AI Job Match at 390/1440px. Some raster byte hashes differ; no universal pixel-identity claim. Normal URL/indexing and direct-entry-link differences are not concealed by those measurements.

Actual local WebGL is identified as Intel UHD / ANGLE Direct3D11. Normal adopted observations use WebGL at 11 of 12 project/size combinations; Cedar 390px takes the existing bounded photographic recovery. A separate Cedar phone/desktop framing pass predecodes genuine originals and uses the existing keyboard-focus module warm-up before selection. Its recordings are labelled **prepared**, not cold-load performance evidence. Neither pass changes application timing. Opening geometry reports distinguish normal and prepared observations, conservative projected mesh bounds and readable-UI intersections. Sampled bounds are not proof of every future pose or GPU smoothness.

The first capture harness used an HTTPS glob that did not intercept the intended remote source URLs; diagnostics confirmed requests escaped to live downloads. The regex matcher was corrected, and final matched/recording/text/parity evidence was regenerated using archived genuine bytes. A separate local decoder check confirmed all archived PNGs decode. This is a harness correction, not a portfolio image-processing or loading change.

Recordings are native browser video, without screenshot animation, speed changes or audio muxing. The inspector briefly plays/decodes each recording and samples 40 source frames through its opening, with full-resolution keyframes and contact sheets. DOM timing gives an approximate recording anchor. Decoder/dropped-frame counts are reported, not presented as a hardware smoothness benchmark.

## Limits and delivery boundary

Windows Chrome viewport/touch-preference emulation is **not** physical Android/iPhone testing. Reduced motion is emulated; unavailable WebGL is deliberately forced. Text enlargement doubles computed demo font sizes and line heights while leaving layout, site header and footer at their normal size; it is not whole-site OS text enlargement or native browser zoom. No physical-device or assistive-technology session was available. Local sampled framing does not establish hardware performance on other devices.

The automatic Vercel Preview must be checked at its exact commit. Anonymous sign-in redirects, if present, mean hosted interaction/content verification is blocked; they do not mean a failed deployment. The PR delivery records actual HTTP/access results and provides public immutable comparison images and downloadable recordings. Existing authentication/protection is retained; noindex is not access protection.

No Projects-index/remaining-reader redesign, Phase 3 work, JobPilot redesign, Profile/media/playback/AI/CV/Contact implementation change, source image/model/material edit, live service action, provider call, Contact submission, CMS/database-content edit, merge, manual deployment or production promotion. This commit makes the approved presentation available in ordinary builds; production promotion remains a separate action.
