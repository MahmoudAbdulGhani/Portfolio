## Approved static portrait adoption on /profile — 2026-10-20

The static design from PR #37 / `5db900a204c5f475f6906bd28d05913227f8a8f5` is accepted. Inspected the branch, tree, remote head and draft stack before editing; local/origin matched that commit, with no newer tracked work. Continued on `feat/profile-portrait-adoption`, stacked above PR #37. The untracked `Codex_Engineered_Landscape_Handoff.md` is preserved and excluded. Historical review notes below describe earlier iterations, not the adoption behavior.

[Before/after comparison HTML](docs/design/profile-portrait-adoption/comparison.html) · [390px](docs/design/profile-portrait-adoption/comparison-390.jpg) · [320px](docs/design/profile-portrait-adoption/comparison-320.jpg) · [1440px](docs/design/profile-portrait-adoption/comparison-1440.jpg) · [compiled measurements](docs/design/profile-portrait-adoption/after.json) · [changed files](docs/design/profile-portrait-adoption/changed-files.json) · [offline ZIP](docs/design/profile-portrait-adoption/portrait-review.zip).

### Production integration and preservation

`/profile` now unconditionally uses the accepted head-to-hands composition. The former review component/styles are named `ProfileStandingPortrait.tsx` and `profile-standing-portrait.css`; the old default-vs-prototype presentation branch is removed. The remaining `review` prop controls noindex metadata only. No review flag, query parameter, CMS update or development server is required for the adopted portrait. The default route remains indexable. The previous `ProfileEntry` group wrappers are no longer rendered on Profile, so they cannot add a second entrance over the accepted single 600ms opacity/12px portrait entrance. Immediate reduced-motion cancellation and no replay after preference changes remain.

The approved PNG and optimized lossless WebP are reused byte for byte at `public/review-assets/profile-original-hands.png` and `.webp`. The historical folder name is only a static asset URL; it does not gate or enable production rendering. No copy of the portrait, new processing, backpack removal, face/body reshaping or dependency change is introduced. PNG SHA-256: `5fc9eae59bcff7677bbd549c9dfb58f17aef2110d16e10178adaabde94114c91`; WebP: `48398672854c525626ebc289321890a3896ad0f78d348c0d0b5a3c821d3faba6`. Original likeness, restrained brightening, skin texture, proportions, hands and watch are preserved. A new unit regression ties both files to PR #37's approved hashes.

Mobile keeps the exact accepted DOM/visual order: label/H1 → name, portrait, location/CV → introduction → languages/socials → record tabs/panels. At 320px the 180×318px figure is centered with location/CV below; at 390px it is 190×335.66px and at 430px 200×353.33px, with location/CV grouped beside the lower half. At 768px the figure is 240×424px; at 1440px it is approximately 294.33×519.97px within the existing 300px portrait column. Layout, typography, colors, complete hands, natural ratio, spacing and footer clearance match PR #37. Body/metadata/heading sizes remain unchanged. All Profile record text, uncertainty wording, tab/disclosure state behavior, evidence destinations and the introduction are retained.

Success mounts and requests one WebP and one entrance, with one H1 and one CV control. The previous portrait component, responsive fallback assets and any supplied CMS photo are retained as the failure fallback and are requested only after primary-image failure. The neutral status now reads “Portrait unavailable. Previous portrait shown.” The stage reserves the same dimensions through pending load, decode and failure, with separate readable status below the fallback image. Existing CV component, URL validation, API flow and document are untouched; keyboard downloads at all five widths match the existing frozen public PDF byte for byte (31,205 bytes).

### Compiled visual and interaction checks

Baseline captures show the **previous normal-build `/profile` at PR #37**; adoption captures show the **new normal-build `/profile`**. These are separate from the approved PR #37 review screenshots used for preservation checks. `scripts/review-profile-adoption.mjs --before` captures the baseline before changing the compiled frontend; run without the flag after a normal build of this branch. Reproduction uses the same frozen read-only public GET/CV fixtures and viewport dimensions on both versions.

The visible main-content pixels match the approved PR #37 review at all five widths and at the supplied introduction/record scroll positions on all three phones. The comparison excludes the header and the first 16px of blank main padding to avoid JPEG-block spill: `/profile` correctly activates the Profile navigation underline, unlike the old `/review/profile-portrait` URL. This expected header change is preserved rather than hidden in the actual screenshots. No image or content differences are masked within the compared main-content area.

Visual review covers all five before/after compositions, complete hands and face visibility, mobile action placement, readable text, introduction/social/record transitions and loading/failure states. The approved composition is adopted without another visual direction. The figure ends intentionally below both hands; there is no rectangular frame, outline, heavy shadow or playback control. Profile remains naturally scrollable; CV, tabs and the last contact link can scroll fully above the footer. Normal-build browser checks verify DOM order, 44px phone targets, visible focus, keyboard CV/tabs/disclosures, retained tab/portrait across resizing, and no horizontal overflow.

Normal-build regression coverage is in `playwright.profile-production.config.ts` and includes the actual `/profile` route, records/Capabilities/evidence, single requests, CMS fallback, image alpha/native resolution, loading/failure geometry and exclusion of review routes/comparison artifacts. All 108 compiled cases across desktop/tablet/phone emulation pass with retries disabled. Existing frame-specific expectations are updated to the adopted design; the previous CMS portrait remains covered as the failure fallback. Signature motion coverage now checks static records and the single accepted portrait entrance instead of requiring the retired extra group movement. Additional affected checks and final-head CI are recorded with the adoption draft PR.

An additional exact-width run observed one document-wide animation count at 1440px; the retained trace does not identify its owner, and twelve direct reduced-motion samples did not reproduce it. The regression now measures the entire Profile main (including portrait and records), with target diagnostics, so independently owned header/assistant motion cannot affect a Profile-only assertion. It still rejects any active Profile animation under reduced motion; no portrait timing or motion implementation changed. The final focused run passes all 39 cases with exact 180/190/200px assertions, and all 18 affected signature-motion/supporting-page cases pass, with retries disabled. Final-head CI is recorded on the draft PR.

Typecheck, lint (generated Playwright reports/results excluded locally), ordinary build, updated production-artifact assertions and 29 portrait/build-policy/matte/integrity Node checks pass. The normal build includes the approved source while excluding the review route literal and comparison bundle. Six other-page comparisons retain authored content, heading geometry/typography/colors and links on Projects, Contact and AI Job Match at 390/1440px; transient lazy-image loading notices are recorded but excluded from authored-text comparison. No unrelated page, engineering interaction, cover, case-study content or provider configuration changes. Existing broader browser/CI suites verify those interactions.

All six explicit-review comparison/alias browser checks pass across the three emulated configurations, including intended content, noindex and the downloadable bundle. The offline ZIP passes integrity checks; all 17 embedded/linked JPEGs decode from a file URL without a server or sign-in. CI now tests the compiled normal-build Profile separately before its explicit-review checks, so a passing review-only build cannot substitute for production adoption.

### Preview, promotion and remaining gaps

Use **`/profile` on the adoption draft PR's Git-triggered Vercel Preview**, not PR #37's review deployment. The adoption branch is deliberately **not** in the review-build allowlist: its automatic Preview exercises the normal build. Explicit review builds/dev still retain `/review/profile-portrait` as a noindex alias and can include this comparison; normal builds exclude both review routes and comparison artifacts. Review routes remain outside navigation/sitemaps. Noindex is not access protection. Vercel authentication/deployment protection is unchanged.

The exact immutable Preview URL, adoption commit to promote and final CI/access results are recorded on the draft PR and in the delivery after Git integration finishes. Previous Previews required authorized Vercel sign-in. A 302 to Vercel SSO verifies protection before the app, not protected hosted content or an application 404. If blocked, authenticated hosted content/CV behavior remains unverified and is disclosed. The public comparison images and offline ZIP provide review without Vercel sign-in; extract and open `index.html`. The production domain remains on its existing deployment until an authorized promotion of this adoption commit; this task performs no merge, promotion or manual deployment.

Post-promotion checklist for the authorized operator:

1. Confirm the Production deployment's Git SHA equals the **adoption commit recorded on the draft PR**, then open the production domain's `/profile` without flags or query parameters.
2. Check 320/390/430/768/1440px: accepted cutout, complete hands, mobile heading first, introduction before secondary information, correct location/CV grouping, no frame/overflow and footer clearance.
3. Tab through CV, social links and records; download the existing PDF; exercise tab arrows/Home/End and disclosures/evidence links. Confirm focus is visible and final controls scroll above the footer.
4. Check reduced motion, a delayed image and blocked-image fallback; confirm other navigation pages work and review routes/comparison remain excluded from the normal build. No live form submission or CMS/database change is needed.

Windows Chrome desktop/viewport/touch emulation is used with frozen public data; physical Android/iOS, physical safe-area behavior, other device GPUs and screen-reader testing remain unverified. The reported Android freeze remains separate. **Speaking/gesturing video is unfinished and separate**; no placeholder controls, synthetic voice or animation claiming speech is included. Stop at static adoption.

## Profile portrait mobile hierarchy correction — 2026-10-20

Started from PR #36 / `f4851863056b2dd3ebc4528c4f935434acabd176`; inspected the local tree, remote branch and open draft stack. Both heads matched. New branch `prototype/profile-portrait-mobile-hierarchy` is stacked above `prototype/profile-portrait-mobile-composition`. The untracked `Codex_Engineered_Landscape_Handoff.md` is preserved and excluded.

[Before/after comparison](docs/design/profile-portrait-mobile-hierarchy/comparison.html) · [390px initial](docs/design/profile-portrait-mobile-hierarchy/comparison-390.jpg) · [320px initial](docs/design/profile-portrait-mobile-hierarchy/comparison-320.jpg) · [390px introduction](docs/design/profile-portrait-mobile-hierarchy/comparison-introduction-390.jpg) · [320px records](docs/design/profile-portrait-mobile-hierarchy/comparison-records-320.jpg) · [measurements](docs/design/profile-portrait-mobile-hierarchy/after.json) · [offline ZIP](docs/design/profile-portrait-mobile-hierarchy/portrait-review.zip).

### Order, geometry and visual findings

Within the existing max-width 719px breakpoint, the review DOM now contains the existing working-record label and single professional H1, name/portrait/location/CV, existing introduction, languages/social links, then existing record tabs/panels. Shared content is rendered once at its appropriate position; CSS does not mask a conflicting reading order. A native media-query subscription chooses the correct layout on the first client render and updates on resize. The portrait instance and selected record survive breakpoint changes. The normal `/profile` markup and tablet/desktop review structure are preserved.

At 390/430px, location and CV are a single group aligned 24px above the figure's bottom, both within its lower half. At 320px the group moves beneath the centered figure; its available width accommodates the existing location and CV without compression. Body text stays 16px/25px, metadata 14px/24px, heading 32px/1.16, and mobile interactive targets at least 44px. The name retains its 12px/20px typography. Spacing is 20px between the main mobile groups, with 8–12px inside identity/action groups. Neither portrait nor type is shrunk to force a complete first screen.

| Viewport | Portrait width × natural height | H1 top, PR #36 → correction | Intro paragraph top, PR #36 → correction |
| --- | --- | --- | --- |
| 320 × 844 | 180 × 318px | 736.30 → 163px | 832.52 → 675.22px |
| 390 × 844 | 190 × 335.66px | 701.95 → 163px | 798.17 → 640.88px |
| 430 × 932 | 200 × 353.33px | 695.63 → 163px | 791.84 → 658.55px |
| 768 × 1024 | 240 × 424px | 148 → 148px | 207.11 → 207.11px |
| 1440 × 900 | 294.33 × 519.97px | 148 → 148px | 223.36 → 223.36px |

These are actual H1/paragraph bounds, not the containing record's top reported in some earlier notes. The full heading is now visible before the figure on each phone. The introduction starts about 133–157px earlier; it remains naturally scrollable at 320/390px rather than hiding content or reducing type. Both hands and natural proportions are complete. Face size is unchanged from the approved enlarged portrait. Initial, introduction-scrolled and record-scrolled captures are provided at all three phone widths. The scrolled record comparisons retain identical text, disclosures and evidence destinations.

The footer sits outside the main scroll container. The review's mobile scroll padding (20px top/24px bottom) and end padding (at least 48px, including safe-area allowance) let focused CV, tabs and the final contact link scroll completely above it. Keyboard regressions check actual focus rectangles against both the main viewport and footer, including at the document end. No shared footer or unrelated page changed.

### Preservation and verification

- Image files and processing are untouched: PNG SHA-256 `5fc9eae59bcff7677bbd549c9dfb58f17aef2110d16e10178adaabde94114c91`; WebP `48398672854c525626ebc289321890a3896ad0f78d348c0d0b5a3c821d3faba6`. Same 960×1696 transparent asset, original likeness, hands, watch and retained backpack. No image generation, retouching, sharpening or dependency changes.
- Compiled before/after captures compare asset hashes, introduction, all record text and evidence links. Default `/profile` is pixel-identical at all five widths; review at 768/1440px is also pixel-identical. No horizontal overflow, duplicate heading, or application exceptions/non-GET/HEAD requests were observed. Existing 600ms opacity/12px entrance and immediate reduced-motion cancellation are retained.
- Loading, decode and failure reserve identical heading, intro, portrait, identity, CV, socials and record rectangles at all five widths. Failure uses the existing accepted portrait and separate readable status. Keyboard Enter downloads the same valid 31,205-byte existing PDF at every width using the unchanged component and validation flow. Arrow/Home/End tab behavior and disclosures remain intact.
- Focused regression coverage verifies visual **and DOM** order, single content instances, grouped lower-half action placement, below-figure placement at 320px, touch targets, footer clearance, stable geometry and breakpoint transitions. Typecheck, lint, ordinary/review builds, Production exclusion, 28 portrait/build-policy/matte/integrity unit checks, 42 compiled review browser cases and 22 existing Profile/records/Capabilities cases pass locally; browser retries are disabled. The offline ZIP passes integrity checks and all nine embedded comparisons decode from a file URL. Final-head CI and hosted access results are recorded on the stacked draft PR.
- An intermediate browser run caught the moved name inheriting 24px line height; restored the original 20px rule. A parallel existing-Profile run passed its assertions but timed out during one context teardown; its original trace is retained locally and the unchanged suite passed 22/22 when rerun alone. A concurrent lint attempt encountered a regenerating Playwright-report file; final lint passes with generated `playwright-report/**` and `test-results/**` excluded. No source exclusions, test deadlines, retries or assertions were relaxed.

### Preview, offline review and limits

Use the **new hierarchy draft PR's Git-triggered Vercel Preview**, with interactive path `/review/profile-portrait` and comparison `/review/portrait-comparison/index.html`. The exact immutable Preview URL, deployment/access result and final CI link are recorded on that PR after the commit. The explicit review flag allows this branch in Preview and fails closed in Production. Review routes remain out of navigation/sitemaps and noindex; noindex is not access protection. Promoting a deployment cannot adopt this composition on `/profile`, which retains the accepted production portrait. No merge or manual deployment occurs.

Previous Previews required authorized Vercel sign-in. Protection is not changed or bypassed. Anonymous access, when redirected to Vercel SSO, cannot verify protected hosted content/CV; the delivery and PR disclose that result. The compiled local routes and comparison are checked independently. The downloadable ZIP contains the static comparisons, measurements, asset copies and this QA record; extract and open `index.html` without Vercel sign-in. It is a screenshot review, not a running app or speaking avatar.

Visual inspection and interaction checks use Windows Chrome desktop/viewport/touch emulation with frozen read-only public GET/CV fixtures. No physical Android/iOS, physical safe-area or screen-reader test is claimed. Visual acceptance remains pending. Speaking/gesturing video, Android-freeze diagnosis, live data and unrelated portfolio changes remain separate. No image regeneration, video controls, provider changes, merge, manual deployment or live write.

# Android opening investigation and shared mobile inspection — 14 October 2026

Started from actual HEAD/origin `6b4b845e6ce10a73660fc3c89c285d473ea7d5d4` on `fix/collection-readiness`, preserving its readiness correction and the user's untracked handoff document. Work is isolated on `fix/phone-opening-inspection`, stacked above draft #31. [Draft PR #32](https://github.com/MahmoudAbdulGhani/Portfolio/pull/32). All eleven supplied phone images were inspected before edits. They show eventual layout, not elapsed freeze duration. The user identified Android only; model, browser/version and remote device diagnostics remain unavailable.

[Before/after HTML, all readers and recordings](docs/design/phone-opening-inspection/review.html) · [decoded artifact inventory](docs/design/phone-opening-inspection/artifact-validation.json) · [public deployment comparison](docs/design/phone-opening-inspection/deployed-version.json) · [baseline measurements](docs/design/phone-opening-inspection/baseline-diagnostic.json) · [final hardware measurements](docs/design/phone-opening-inspection/after-diagnostic.json) · [controlled cold trace](docs/design/phone-opening-inspection/cold-trace.json).

**Opening reliability — confirmed corrections, physical report still pending.** Before editing, a fresh build of the approved baseline was compared with the public production assets: 31/31 JavaScript files were byte-identical. This establishes source-equivalent deployed code at inspection time, without asserting unavailable Vercel Git metadata. All network operations were public GETs. Instrumentation measured two `decode()` calls for the same Collection image candidate, caused by native load/cached-image readiness and Collection's extra decode. One shared candidate-specific promise now owns decoded visibility in the retained component and reader frame. Retired, disconnected or replaced candidates cannot publish readiness. Loading and failures retain reliable natural dimensions and the prior complete image.

Controlled first-image network delay and a held decode reproduced a silent visual wait: opening could recover before a usable screenshot, fading the photographic sculpture while no decoded replacement existed. The active photographic composition now remains visible until the actual screenshot is decoded, then hands over using the existing short fade. Loading/preparing notices distinguish pending image from pending decoration; unavailable preview remains explicit. Identity, selectors and navigation stay available before decorative readiness, and a keyboard-focused decoded screenshot action is visible. GPU creation remains behind a completed image attempt; only its module is prewarmed. The existing absolute 2,500ms owner still performs real photographic fallback and disposal, ignores late readiness, and retires pending work on visibility changes. No new settlement timer or blanket phone WebGL disable was added.

The canvas previously included the entire engineering panel: 390×1791 and 1440×1425 CSS/drawing pixels at DPR 1. The measured corrected drawing surface is 390×671 and 1440×1145. A view offset preserves the accepted full-stage perspective, sculpture geometry/materials and camera fitting while bounding the drawing surface around the subject, target image and shadow allowance. Settled hidden artwork defers resize allocation until reverse motion needs it; hardware measurements show unchanged draw count after engineering reflow and visibility events. Different opening draw counts are not a performance benchmark. Existing finite pose ownership and reverse choreography remain intact; pending image arrival does not cancel the opening clock.

**Unresolved timing limits:** a paired cold trace on Windows Intel UHD/ANGLE D3D11 recorded native shader/program calls and first paint consuming substantial synchronous main-thread time, followed by an intentional 1,100ms blocking draw fixture. One current trace settled around the unchanged five-second deadline. Later local hardware and explicit SwiftShader runs had cold/late-init deadline failures; this does not identify the physical Android fault. A shader preparation experiment made startup worse and was removed. The fresh-server final readiness batch passes all 14 original tests with retries disabled; earlier failures remain part of this record. JavaScript cannot cancel an external synchronous native call while it is executing. No GPU-only cause, physical-device fix or guaranteed response time is claimed.

**Mobile presentation — shared, complete and inspectable.** Screenshot buttons and a visible “Tap to inspect” cue open the existing modal, including from Collection. The redundant reader “View full screen” actions are removed. Fit preserves the complete overview; Fit width, Actual size, explicit zoom buttons, keyboard +/−/0 and touch pinch/pan support detail reading. Original-resolution requests are limited to the selected inspected image; thumbnails use available optimized variants rather than eagerly downloading every remote original. Source changes reset Fit and retire gestures. Close remains visible, Escape/focus trapping/return and background scroll lock are retained. Browser Ctrl/Meta zoom shortcuts remain native. Image captions remain outside complete image frames.

At phone widths the header measures 106px instead of 125px, retaining existing font sizes and comfortable navigation targets. Related reader controls/captions use 12–24px spacing and narrative sections 36px. Progress wraps, the existing fictional data/review/stale/acceptance logic is unchanged, and the persistent footer accounts for bottom safe-area insets. Reader end padding lets final content scroll clear. Top scroll padding remains zero to preserve the original exact engineering-anchor alignment; an intermediate 16px top inset failed the unchanged Back/hash CI assertion and was corrected. No project covers, portrait, source claims, Cedar caption, other engineering reducers or backend/provider routes changed.

**Review coverage:** all eight readers at 320, 390, 430, 768 and 1440px, with complete Fit and original-resolution inspection; additional Cedar and User Management portrait images at every width. Normal, reduced and unavailable-WebGL Collection captures cover all five widths; regression checks cover both selections for all three Collection projects, retained portrait/landscape switching and failure. JobPilot rest, stale and accepted states are captured at each width. Matched desktop/390px recordings hold the actual first screenshot for 3,500ms, then show screenshot appearance → reader → inspection/pan → Fit → Close/focus. This is controlled delay, not a reproduction of the exact phone report. Artifact validation decodes every JPEG and checks video dimensions/duration/nonblank midpoint.

**Validation:** final typecheck, lint and build pass (existing large WebGL chunk advisory remains); 51 Node motion/content/media/cover/portrait checks pass. Fresh local Chromium: 14/14 original readiness and 59/59 affected preview/handoff/inspection/profile-boundary/signature checks, retries disabled. All 59 media cases had passed locally; final-head CI verifies all media engines and original regression deadlines. Ten cold-opening runs and ten formerly failing rapid-reset/opening runs pass, zero failures, retries disabled; the final cue correction also passes all 8 inspection tests. Final-head CI is linked through PR #32 and is checked after the delivery commit. No assertion or deadline was weakened; the existing superseded-decode fixture releases its deliberately blocked decode before expecting decoded readiness, matching the corrected readiness contract.

**Verification limits:** Windows Intel UHD WebGL was checked on real desktop hardware. Phone/tablet sizes, reduced motion, unavailable WebGL, slow images/frames and Chromium touch/CDP events are browser emulation or controlled fault injection. Physical Android/iOS, Android browser/version, safe-area behavior on a physical device and other GPUs remain untested. The reported Android freeze therefore remains pending confirmation. The mobile composition and touch viewer are verified in browsers, not certified on the reported device.

Runnable read-only preview: `npm run dev:motion -- --host 127.0.0.1 --port 5185`; `http://127.0.0.1:5185/?project=jobpilot-ai`, `/projects/jobpilot-ai`, and `/docs/design/phone-opening-inspection/review.html`. Existing public snapshot is required (`npm run preview:content` prepares it). No merge, manual deployment, production Contact/provider submission or live CMS/database write occurred.


# Collection opening and readiness reliability — 13 October 2026

Inspected HEAD/branch/tree, fetched origin, repository and RTK instructions and this record. HEAD and origin agreed on `87dab71a60caa68e0d4c3cdbb40d2d4117743e50`; no newer descendant was replaced. Work is isolated on `fix/collection-readiness`, stacked above draft #30 / `refine/jobpilot-reader-handoff`. The user's untracked handoff document remains unchanged and excluded. Draft review: [PR #31](https://github.com/MahmoudAbdulGhani/Portfolio/pull/31).

[Before/after review and recordings](docs/design/collection-readiness/review.html) · [artifact inventory](docs/design/collection-readiness/artifact-validation.json) · [original CI trace summary](docs/design/collection-readiness/ci-opening-summary.json) · [temporary lifecycle timing](docs/design/collection-readiness/diagnostic-timings.json) · [native freeze/resume](docs/design/collection-readiness/native-lifecycle.json).

**Confirmed mechanism:** the initial selection waited for sculpture assets, a completed preview attempt and renderer readiness. `mountRig`'s first `size()` synchronously painted the scene *before* publishing `onReady('webgl')`; only afterward did Collection start its finite 980ms opening clock. A slow first paint therefore consumed time and was followed by a fresh full opening duration. An unresolved import/asset/ready notification also had no bounded recovery from selecting. This readiness/render ordering is inherited: `MotionRig`, `motion-rig`, `finite-motion` and `collection-motion` are identical between `a3a4b2e` and the approved handoff commit. Instrumentation found paired finite completions in successful runs, not evidence of a cancelled completion causing the reported stall.

The retained #91 trace confirms that the relevant assets completed quickly, all three failures occurred before demonstration/handoff actions, and the third post-timeout snapshot was already settled. A driver ReadPixels warning is retained as an observation. It does not establish a GPU-specific cause. Temporary instrumentation measured the first normal scene paint before readiness (238ms on Intel UHD in one run; 602ms with explicit SwiftShader and CPU throttling), proving the serial ordering. These observations are not a performance benchmark or a claim about physical phones.

An isolated archive of `87dab71`, sharing unchanged public assets, reproduces the original five-second failure at 1440×900 and 390×844 when the first scene paint is withheld until 4,400ms after selection: both baseline assertions fail in `opening`. Under the identical condition, both final assertions pass in `settled` with **WebGL retained**, and the first scene paint belongs to `opening`, rather than `selecting`. A separate 4,200ms delayed initialization-notification fixture leaves the baseline loading/opening and the fix in photographic recovery. Before/after recordings for both conditions are linked in the review. Both conditions are explicitly controlled browser fixtures.

**Correction:** scene measurement/initialization no longer paints until the selection sends its first pose, after the existing elapsed opening clock is running. The model still uses that single clock and the unchanged articulation/materials/camera fitting. A selection owns an absolute 2,500ms opportunity for initialization; expiration or hidden pending content cancels its finite work, disables/disposes its renderer, applies the final photographic pose and exposes the honest loading/unavailable image state. Late synchronous initialization checks that same deadline before starting an obsolete opening. This is actual fallback and cleanup, not a timer that only changes a label. Loading images retain their known natural height and can paint when available; content, links and focus remain usable beforehand. Initialization and later render exceptions use the existing photographic fallback. Cancelled imports cannot enqueue new frames, and timers/listeners/timelines are removed on retirement.

Image decode signals now belong to their `currentSrc` candidate as well as their connected element. Every responsive load can notify Collection; a rejection from a superseded candidate cannot overwrite a newer successful load. The retained image component and all image sizing/cropping rules are unchanged. Repeated decoded notifications do not create redundant state changes. A repeated reader test also exposed rapid Back that cancels the next route before it commits: the existing JobPilot restoration owner now restores reader focus and engineering-hash priority with a destination-checked frame. Its preview-return behavior remains. No Cedar/Lobby handoff is added.

Firefox preservation checks exposed two additional ordering cases. The held eager-image fixture can prevent the browser load event itself, so that one navigation setup now waits for DOMContentLoaded while keeping the asset pending, every assertion and every deadline unchanged. Another trace captured 327px at the opening click, then 309px while the reader URL already existed but the preview remained mounted, and 270px on return. Scroll capture now requires the document address to match its owned route entry; an outgoing document clamp cannot overwrite the captured source position. The unchanged image-two Firefox return passed 10/10 repetitions, the complete Firefox/WebKit handoff passed 18/18, and the Chromium desktop/tablet/phone handoff passed 27/27, all without retries. A new forced outgoing-scroll regression passed all three configurations; it captures the actual opening click after any browser actionability scroll. No tolerance or timeout changed.

Opening durations (820ms articulation, 240ms handoff, 980ms GPU opening) and 560ms reverse duration remain. Reduced motion communicates the same immediately available state. No test deadline, existing assertion, retry policy, animation library, project narrative, screenshot, cover, portrait or Cedar caption changed. The selected JobPilot image, sample review state, disclosure, scroll, originating-action focus, explicit return, Back/Forward, direct reader, engineering anchors and modified-click/new-tab semantics remain.

| Verification | Result |
| --- | --- |
| Original failing test before edits | 10/10 local runs passed, retries disabled; local success alone did not explain CI's three failures |
| Final repeated original case | **30/30 passed, zero failures**, ten per desktop/tablet/phone configuration, retries disabled, original 5,000ms assertion |
| Matched first-paint reproduction | Baseline 0/2 passed; final 2/2 passed with WebGL retained and unchanged 5,000ms assertion |
| Final focused browser run | **150/150 passed**, retries disabled: 39 new readiness/cancellation checks, 36 boundary checks, 48 existing motion checks and 27 accepted handoff checks |
| Navigation ownership follow-up | 18/18 Firefox/WebKit + 27/27 Chromium handoffs, 10/10 repeated Firefox image-two returns, 3/3 forced retiring-scroll regressions, retries disabled |
| Typecheck / lint / build | Passed; existing large WebGL chunk warning remains |
| Motion / integrity / asset preservation | 20 / 24 / 7 tests passed, including three new state-ownership tests, complete-reader variants and all eight covers/portrait |
| Actual-asset visual review | 1440×900, 1440×650, 768×1024, 390×844, 320×844; normal, reduced and unavailable-WebGL modes; both choices for all three Collection projects, plus both JobPilot reader-return journeys |
| Artifacts | 142 JPEGs and eight short before/after desktop/mobile WebM recordings; all 142 screenshots fully decoded; all eight videos have finite duration, expected dimensions and nonblank decoded midpoint frames (7.32–9.28 seconds) |
| Source-code CI | [#92](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38424250516), commit `1a0fc12`: **12/12 jobs passed**; 878 browser cases. Boundary and all three smoke groups passed without retries. |
| Final-head CI | [PR #31 checks](https://github.com/MahmoudAbdulGhani/Portfolio/pull/31/checks); terminal run and exact final SHA are recorded on the draft PR before delivery |

Intermediate investigations are retained rather than counted as green: one of 60 early repetitions lost return focus after a development reload during a test-file edit (zero opening failures); an intermediate 183-case run had a reader-return focus failure and a native decode cancellation during a Lobby resize. The cancelled reader navigation/engineering-hash gap and Collection's candidate ownership were corrected without altering the existing tests. The final 150-case run passed without retries, and the unchanged Lobby reduced-motion resize case passed **9/9 additional repetitions** without retries (three per configuration). Source-code CI #92 also passed every original preview case. The real Cedar tall PNG was also fully decoded at 1920×2333; visual capture waits for actual asset decode independently of the unchanged opening assertions.

Normal visual review verified **Intel UHD / ANGLE D3D11 hardware WebGL** at all five viewports. Phone/tablet dimensions, OS motion preference and unavailable-WebGL are browser emulation. Visibility events use a controlled browser fixture; native Chromium frozen/active lifecycle was separately exercised without overriding `document.hidden` and resumed into photographic content with no canvas. Physical iOS/Android, other hardware/driver families and the hosted protected preview were not tested. The earlier uninstrumented 15-second live capture cannot be retrospectively attributed; the now-bounded readiness paths are directly tested. JavaScript cannot preempt an external synchronous browser/driver call while that call is executing; recovery rejects obsolete work when control returns.

Runnable read-only local preview: `http://127.0.0.1:5185/?project=jobpilot-ai`, reader `http://127.0.0.1:5185/projects/jobpilot-ai`, review `http://127.0.0.1:5185/docs/design/collection-readiness/review.html`. No redesign, merge, manual deployment, production submission, provider configuration or live CMS/database change occurred.


# JobPilot preview → reader handoff — 13 October 2026

Started from actual HEAD `a3a4b2e8247e0fce5cab6089c9771932e7bdbdbe`, fetched origin and confirmed the accepted branch agreed with its remote. Preserved the user's untracked handoff document. Work is isolated on `refine/jobpilot-reader-handoff`, stacked above draft PR #29 / `refine/supporting-pages`.

[Before/after HTML and desktop/phone recordings](docs/design/jobpilot-handoff/review.html) · [decoded artifact validation](docs/design/jobpilot-handoff/artifact-validation.json) · [inventory](docs/design/jobpilot-handoff/inventory.json) · [normal observations](docs/design/jobpilot-handoff/after/findings.json) · [reduced motion](docs/design/jobpilot-handoff/reduced/findings.json) · [photographic fallback](docs/design/jobpilot-handoff/fallback/findings.json).

Both Collection choices, **Resume library and upload** and **Discover jobs**, already exist as complete images in the reader. Their exact source identities select the corresponding reader image without reordering its gallery or inventing a new capture. **01 / JobPilot AI** continues into the existing header. The real image frame changes position and uniform scale over **380ms**; identity adjusts scale within the reader header with a small displacement. The preview puts its title below the image and the reader puts it above, so keeping identity in the destination header avoids crossing live controls or supporting text. Supporting paragraphs and the image caption enter over **180ms**, beginning at 200ms. The cream background stays stable. There are no clones, blocking overlays, new assets or animation libraries.

Navigation starts through the existing React Router link immediately. Modifier clicks and new tabs retain native behavior. Frame motion uses the requested source's reliable natural bounds, and only carries the exact decoded preview identity. A retained different image or unavailable preview uses an honest opacity treatment instead. The reader's existing loading/error/retry states remain available; an old snapshot is not animated when destination loading takes more than 800ms. That age check skips obsolete decoration and never delays navigation. Reduced motion skips displacement. The real header and media navigation paint above moving artwork and remain clickable during interruption.

**State ownership:** the public layout owns an in-memory Map keyed by the originating Collection history entry. It retains the screenshot identity, fictional review state and disclosure state; edits made after returning also survive Forward/Back. History carries the origin key and image identity, without serializing fictional profile values. The existing route-restoration hook continues to own scroll positions. An adjacent explicit return uses Back to the same entry, preserving Forward; unavailable/nonadjacent origins use the stable Collection URL, source-image identity and the existing restoration hook's explicit-position fallback. Direct reader visitors use All projects. Query parameters are preserved. A restored JobPilot origin prioritizes its captured position and opening-action focus over an old engineering hash; intentional engineering navigation still focuses and scrolls its heading.

**Cleanup:** the existing finite GSAP clock owns the 380ms timeline. Route changes, unmount, image selection and reduced-motion changes cancel its frame/timeout and restore inline styles. React's development lifecycle may restart an unfinished setup for the same source; completed navigation and intentional selection changes do not replay. Restored Collection scenes are immediately active, use the photographic composition and do not replay the original WebGL opening. The engineering reducer, source descriptions, accepted sculpture/assets, Cedar caption, all eight gallery covers and supporting pages are unchanged.

**Visual evidence:** actual published media and frozen public GET records at **1440×900, 1440×650, 1024×1024, 768×1024, 390×844 and 320×844**. Before: opening always led to the default image and explicit return lost the second choice. After: all twelve journeys per mode retain their selected choice, opening-action focus and scroll position. Complete image/caption captures show natural proportions, a 16px reader caption clearance and no document horizontal overflow. The HTML contains **188 decoded JPEGs**, including controlled-clock intermediate poses, plus independently recorded normal-speed journeys: **11.40s desktop / 6.68s phone**. Chrome decoded both videos' metadata and midpoint frames successfully. Normal opening used actual Intel UHD WebGL through ANGLE/D3D11; tablet/phone dimensions and disabled WebGL are browser emulation, not physical-device tests.

| Validation | Result and scope |
| --- | --- |
| Typecheck, lint, production build | Pass; existing large-chunk advisory remains. |
| Integrity / engineering state / original assets | 24 integrity, 17 motion/state and 7 original-media/cover/portrait Node checks pass. |
| Existing reader, preview and boundary regressions | 111 production browser cases pass across the three Chromium configurations; complete tall/portrait images, all six preview choices, stale review, reset, keyboard, focus and fallback remain covered. |
| Original signature motion and initial handoff coverage | 72 cases pass on Vite across desktop/tablet/mobile, without retries. |
| New handoff tests | 27 final production cases pass across Chromium desktop/tablet/mobile. All 18 distinct Firefox/WebKit cases pass after correcting rapid Back focus (16 initial passes and four focused rechecks, including the two corrected failures). Nine cases cover every choice, Back/Forward, explicit return, keyboard, retained review/disclosure edits, direct/missing origins, hashes, modifier activation, slow/failed images, slow shared project data and interrupted motion. Retries are disabled, including CI. |
| Other-page preservation | 31 additional Chromium cases pass for all eight reader deep links, Cedar/Lobby complete previews, Profile inventory/evidence and supporting-page layouts/contracts. Contact and AI requests use intercepted fixtures, never production submissions. |

**Investigated failures and gaps:** the first production-only regression batch failed the existing source-module fault injection in three configurations because its unchanged matcher aborts `/motion-rig.ts`, while production loads a hashed chunk. The correct Vite run passes all three injections without deadline or matcher changes. Early new tests exposed pointer interception by the moving image and a development setup-cleanup race; both are corrected and covered. Synthetic-frame tests now drive the next frame until React commits setup, retaining their original assertion deadlines. One normal camera attempt remained in the original Collection selecting/loading phase for 15 seconds. Its asset/readiness code is unchanged; a subsequent full real-asset capture with failure diagnostics enabled completed all twelve journeys without recurrence. The earlier stall's cause is not conclusively established and is retained as a GPU/opening verification gap, rather than claimed fixed by this handoff. Navigation while imagery/renderer are unready is separately verified. Physical iOS/Android and a hosted protected preview were not visually tested. No merge, manual deployment, production submission, provider configuration or live-data change occurred.

Firefox/WebKit also exposed a rapid Back before the reader committed: the same preview remained mounted, so its mount effects could not restore focus. The existing restoration owner now refocuses the JobPilot opening action on the next frame, checks that the destination is still JobPilot, and captures intentional clicks while a hash scroll settles. Intentional engineering navigation clears the return-position hint and retains heading focus. Scroll assertions measure the opening click and verify the exact saved position up to the document's physical scroll limit; retiring an old image can shorten the document by a few pixels. No deadlines or image layout rules were weakened. Final terminal CI is recorded on the draft PR.

Local preview: `http://127.0.0.1:5185/?project=jobpilot-ai` → **Open case study** → `http://127.0.0.1:5185/projects/jobpilot-ai`. Review HTML: `http://127.0.0.1:5185/docs/design/jobpilot-handoff/review.html`. The result improves continuity through a truthful selected image and a predictable return; Cedar and Lobby handoffs remain for later review.

# Projects, AI Job Match and Contact — 13 October 2026

Inspected actual HEAD `366ce64369c2851854c130771336b6bf2e6dcae0`, fetched origin, remote descendants, working tree, repository/RTK instructions, shared tokens, current pages and this record. The accepted Capabilities branch/origin agreed, with no newer descendant replaced. Work is isolated on `refine/supporting-pages`, stacked above draft PR #28 / `refine/profile-capabilities`. The user's untracked handoff remains unchanged and excluded. Captured the three pages and their important states before source edits.

[Three-page before/after review](docs/design/supporting-pages/review.html) · [decoded screenshot inventory and state checks](docs/design/supporting-pages/artifact-validation.json) · [separate real-provider attempt](docs/design/supporting-pages/provider-check.json) · [changed files](docs/design/supporting-pages/delivery-files.json).

The shared stylesheet applies only to the three explicit `supporting-page` roots. Headings now use the accepted Profile scale, 32–46px, with restrained Manrope typography, readable metadata, fine rules and visible actions. Existing palette/font tokens remain unchanged. Content is immediately available. Feedback reuses the existing 160ms opacity treatment and 180ms control transitions; the former staggered AI report-section animation is disabled locally. Reduced motion removes displacement and unnecessary sequencing. No new library, WebGL scene, scroll reveal, cursor effect or animation dependency is introduced.

**Projects:** all eight accepted equal-width 16:10 covers, their assets and image-fitting behavior remain intact. Collection's existing **01 JobPilot AI / 02 Lobby / 03 Cedar Construction** assignments replace display-order numbering; the other five projects remain unnumbered. Search and Gallery/Index changes no longer change those assignments. Titles remain 25px, including long names, and wrap naturally. Subgrid aligns title/type/action rows within each two-column desktop pair; phones use one column. An always-visible “Open case study” label accompanies every existing whole-card keyboard link. Project types and stack snippets remain sourced from the current records. No new project facts or conflicting numbers are invented.

**AI Job Match:** the existing response already provides `strongMatches`, `partialMatches`, `gaps`, `relevantExperience` and `relevantProjects`; no response schema, prompt, provider route or database change was necessary. The result presents Supported strengths, Gaps or unverified requirements, Related or partial evidence, Experience and training, Supporting project evidence and Recruiter summary from their respective fields. It does not classify free-form text. Existing qualitative match levels remain; no percentage, hiring prediction or new scoring is added. Registry resolution supplies current project names, the three assigned numbers, canonical case-study links, explicit team scope and small accepted cover thumbnails. Unknown/hidden/unpublished references are omitted and duplicate references consolidate once. Report export uses the same resolved identities/links. Provider explanations remain text; a project reference does not establish personal ownership of every technology.

Input length limits, 70-second timeout, duplicate guard, streaming parser, in-memory route continuity, copy/report export and token-gated tailored PDF download remain. The explicit “Try again” action resubmits the retained description after an analysis failure. Service failures leave valid input marked valid; validation failures focus the input. A separate concise live region announces progress and completion while result prose stays outside live announcements. The existing bounded server status events and fallback phases are retained; no token-by-token announcement is added.

**Contact:** the existing form fields, honeypot, validation, payload, delivery hook, enquiry intents, error/success behavior, retained failure values and success/restart focus are unchanged. Shared layout styling aligns the heading and desktop columns, uses 24px desktop form padding and comfortable 48px controls, readable persistent labels/errors, fine intent underlines and descriptive contact methods. The accepted 18px phone form padding, document scrolling, single-column/full-width fields and submit action, visual-viewport keyboard handling and safe-area footer behavior remain. Status content wraps in flow, with no overlap. No animation delays editing or submission.

Reviewed **1440×900, 1024×1024, 768×1024, 390×844 and 320×844** with current public GET records and all eight actual covers. The baseline reproduced report overflow at 768px and 320px in completed/retry states; the revised states have none. Each mode covers Gallery/Index; AI empty, loading, real incremental sample-status streaming, completed, failure, retry and CV download; Contact empty, validation, failure, pending and success. Final normal/reduced reports each contain 65 reviewed states, with no page/document horizontal overflow or browser errors. All eight cover sources, native dimensions, project destinations and 16:10 ratios match the baseline at every size. Complete captures temporarily extend camera height to expose the inner scrolling pages; viewport captures retain their stated dimensions. The review includes **400 decoded JPEGs**, with every image linked, including additional AI evidence close views.

AI/Contact browser submissions are intercepted deterministic **sample fixtures**, labelled as such in the output and review. No production enquiry or real tailored CV mutation occurs. CV browser checks exercise the existing download flow with the unchanged published PDF bytes or an explicit regression fixture. A separate direct SDK streaming attempt used the existing matcher/learning/project instructions and a normalized frozen public snapshot, without app endpoints, database rate-limit writes or CMS mutation. It failed with a provider error before returning an answer; **no successful real-provider response is claimed**. The sanitized result is linked above. Existing training/completion uncertainty and team contribution records remain intact.

| Validation | Result and scope |
| --- | --- |
| Typecheck, lint, build, whitespace | Passed; existing 503.95kB motion-rig chunk advisory remains. |
| Content/source integrity | All 24 tests passed, including actual assistant/Job Match JSON/SSE context paths under isolated stubs and new authoritative project-reference checks. |
| Preservation/evidence Node checks | All 23 passed: complete original media, eight accepted covers, portrait, three engineering state machines and project identity/numbering (two overlap the integrity suite). |
| Affected Chrome checks | All 84 passed across desktop/tablet/mobile configurations: supporting pages, existing gallery fitting/loading/failure, Contact responsive/keyboard states and accessibility readiness. All 27 new cases passed again after the final tablet header alignment. |
| Existing flow continuity | All six original Contact payload and Job Match report/evidence/export/token-CV/route-return cases passed across three Chrome configurations. These exercise the real contract with fixtures, not a real provider. |
| Additional engines | All 18 new supporting-page cases passed on Firefox/WebKit, including all five widths, paired metadata/actions, registry/thumbnail scope, retry, non-PDF rejection and Contact retained values/focus. |
| Actual-content review | Three pages × five sizes × normal/reduced, all important states, all eight covers and scoped evidence thumbnails; successful mocked PDF downloads and no overflow. |
| Final head CI | Terminal results, automatic Preview status and any retries are recorded on the stacked draft PR. Original workflow deadlines remain unchanged. |

The first browser run identified outdated exact assertions for Contact's former 28px padding/40px desktop input height, and a new fixture serving content at `/api/site-sections` instead of the existing `/api/site-content` endpoint. The expected dimensions now reflect the requested 24px/48px refinement while preserving grid, pairing and footer assertions; the fixture now supplies the actual contract and complete heading copy. No overflow, image-fitting, accessibility or timeout threshold was weakened.

Windows Chrome screenshots use actual public content/assets. Tablet/phone viewports, reduced motion and visual-viewport keyboard scenarios are **browser emulation**, not physical-device testing. Firefox/WebKit are browser automation. Remaining gaps: physical iOS/Android, authenticated hosted-preview visual review and a successful real-provider answer. Contact delivery is mock-only. Collection sculptures/opening, Profile, all three engineering interactions, complete case-study images, gallery cover assets, portrait, backend security/validation and shared normalization are not modified. The **preview-to-case-study visual handoff remains a separate future task**, along with real-device closeout.

Runnable local routes: `http://127.0.0.1:5185/projects`, `/job-match`, `/contact`; [review HTML](http://127.0.0.1:5185/docs/design/supporting-pages/review.html). Use `npm run preview:content` then `npm run dev:motion -- --host 127.0.0.1 --port 5185` if the local frozen snapshot/server is absent. Capture scripts default to the immutable build at 5190; `PLAYWRIGHT_BASE_URL` overrides the main capture server. Contact/AI fixture interactions are local review evidence; the preview's ordinary POST requests remain blocked unless its explicit review fixture is selected.

This ends the supporting-page refinement. Their hierarchy now reflects the same numbered evidence and fine-rule language as Collection/Profile while preserving their functions. No merge, manual deployment, production Contact submission or live CMS/database changes occur.

# Profile Capabilities: inventory and evidence — 13 October 2026

Inspected current HEAD `983c8b781a219fe11cde92deed1d030dcde37bd6`, fetched origin, verified ancestry and remote descendants, working tree, repository/RTK instructions and this record. The accepted Profile branch and origin agreed; no newer descendant was present. Work is isolated on `refine/profile-capabilities`, stacked above draft PR #27 / `refine/profile-record`. The user's untracked handoff remains unchanged and excluded.

[Before/after screenshot review](docs/design/profile-capabilities/review.html) · [same-viewport measurements and preservation checks](docs/design/profile-capabilities/comparison.json) · [decoded screenshot inventory](docs/design/profile-capabilities/artifact-validation.json) · [changed files](docs/design/profile-capabilities/delivery-files.json).

The measured baseline reproduced exactly at 1440×900: **71 distinct competencies, 34 evidence links, 18 JobPilot links and 4,525px of panel height**. Links beneath individual technologies created 34 repeated references to six unique destinations. Capabilities now presents the existing five categories as readable wrapping text lists with fine separators and restrained spacing. Names and specific details remain attached at 15px/25px. MySQL/MariaDB and Git/GitHub remain distinct. The shared normalization and deduplication rules are unchanged.

Engineering evidence follows the inventory in three editorial rows: **01 JobPilot AI / Reviewed AI changes**, **03 Cedar Construction / Financial calculation and interpretation**, and **02 Lobby / Guest membership and call access**. Each has its existing number/name, one short factual explanation, a descriptive link and grouped competency associations. Cedar and Lobby remain explicitly **team-project evidence**. Explanations reuse the accepted demonstrations verbatim: JobPilot's review-before-save sentence, Cedar's read-only calculated-figures explanation, and Lobby's separate invitation/join/call checks. The existing contribution gates and repository matching still control preferred engineering associations; unsupported records retain their original reference. These are project references with stated contribution scope, not proof of ownership of every listed technology. Source qualifications remain in the accepted reader disclosures.

UniHub, GameZone Arena and the Full-Stack User Management System remain available once each in **Additional project evidence**, with their existing scope and grouped related capabilities. The disclosure reuses `CaseDisclosure`; keyboard Enter/Space, visible focus, rapid toggles, tab state retention and reduced-motion completion remain supported. All six original engineering destinations are reachable. No new card styling, artwork, animation library, motion delay or horizontal navigation is added.

| Same reviewed viewport | Before panel | After, collapsed | After, expanded | Evidence destinations |
| --- | ---: | ---: | ---: | ---: |
| 1440×900 | 4,525px | 1,508px | 1,921px | 34 → 6 |
| 768×1024 | 5,791px | 1,858px | 2,271px | 34 → 6 |
| 390×844 | 5,791px | 2,033px | 2,471px | 34 → 6 |
| 320×844 | 5,816px | 2,333px | 2,796px | 34 → 6 |

JobPilot appears once instead of 18 times. Counts include the three disclosure references present in the DOM; three editorial links are initially visible and all six are visible after expansion. The expanded measurements include every additional reference and association. Reduction is supporting evidence for improved hierarchy, not a reason to omit information. The comparison script checks all 71 original keys, names and details, every original competency/project association and the six unique destinations against the baseline at each width, including reduced motion.

Before editing, captured the current published public GET records at all four widths. Final review uses those same frozen records and the original portrait, with normal and reduced motion. **40 decoded JPEGs** include before/after inventory views, the three engineering rows, expanded additional references, visible keyboard focus and complete-record captures. Every screenshot is linked in the HTML review. Complete captures extend camera height to paint the entire inner scrolling record; viewport captures retain the stated dimensions. No page/document overflow, browser errors or API writes occurred. The 24 actual evidence-navigation checks per final motion mode reach the intended engineering sections using keyboard Enter.

| Validation | Result and scope |
| --- | --- |
| Typecheck, lint, production build, whitespace | Passed. Existing 503.95kB motion-rig chunk advisory remains. |
| Content/source integrity | All 22 tests passed, including shared Profile/CV/assistant learning evidence, source attribution and new unique-project grouping/association checks. |
| Affected Chrome checks | All 60 cases passed across desktop/tablet/mobile configurations: content integrity, Profile record and the six new Capabilities cases. All 18 new cases passed again after the final disclosure-width correction. |
| Firefox / WebKit | All 30 Profile/Capabilities cases passed after the local disclosure geometry correction, including keyboard focus, reduced motion, association retention and all six destinations. |
| Actual content review | 320, 390, 768 and 1440px; normal/reduced motion, collapsed/expanded references, unchanged inventory and associations, no horizontal overflow. |
| Final head CI | Terminal workflow results and any retries are recorded on the stacked draft PR; no workflow deadline or existing test threshold is changed. |

WebKit initially rounded the rotated disclosure indicator's 0.14px visual overhang into one extra panel pixel. Reserving a 28px indicator column locally removes that overhang; no clipping or global disclosure change is used. The first test run also checked scope inside the former combined link and used programmatic focus after a mouse click to assert keyboard-only focus styling. The assertions now check the explicit row scope and navigate with real keyboard keys. The capture report reads additional associations after expanding their disclosure, rather than treating a closed element's empty `innerText` as missing data. No inventory or accessibility requirement was relaxed.

Only Capabilities presentation and its verification changed. Portrait, introduction, Experience, Education & training, completion uncertainty, professional/CV controls, navigation and accepted Profile motion are unchanged. Shared content normalization, CV/assistant behavior, engineering interactions, Collection image flow, gallery covers and case-study assets are not edited. No live CMS patch, database change, production Contact submission, merge or manual deployment occurs.

Review environment: Windows Chrome with actual public records; tablet/phone sizes and reduced motion are **browser emulation**, not physical-device tests. Firefox/WebKit are browser automation. Remaining gaps: physical iOS/Android and authenticated hosted-preview visual review. Existing preview-to-reader focus/timing gaps remain outside this focused change. Projects, AI Job Match, Contact, the preview-to-reader handoff and real-device closeout remain future tasks.

Runnable local route: `http://127.0.0.1:5185/profile`; [local review](http://127.0.0.1:5185/docs/design/profile-capabilities/review.html). Use `npm run preview:content` then `npm run dev:motion -- --host 127.0.0.1 --port 5185` if the ignored GET snapshot/server is absent. `scripts/review-profile-capabilities.mjs` defaults to the immutable production build served at 5190; `PLAYWRIGHT_BASE_URL` can select another local preview. `scripts/report-profile-capabilities.mjs` regenerates the review and validates inventories, associations and artifact links.

This stops after the focused Capabilities refinement. The inventory is easier to scan and the evidence reads as six project references instead of repeated technology-level links, while retaining the complete information and accepted visual direction.

# Profile working record — 12 October 2026

Inspected actual HEAD `bc957ee65f2e85ce8a07eafedc15475d10666e28`, fetched origin, ancestry, working tree, repository/RTK instructions and this record. The accepted PR #26 baseline was current, with no newer branch work replaced. Implementation is isolated on `refine/profile-record`, stacked above `refine/lobby-engineering`. The user's untracked handoff remains unchanged and excluded.

[Before/after review of all tabs and entries](docs/design/profile-record/review.html) · [source basis and attribution](docs/design/profile-record/source-basis.md) · [decoded screenshot inventory](docs/design/profile-record/artifact-validation.json) · [actual evidence navigation](docs/design/profile-record/evidence-destinations.json) · [changed files](docs/design/profile-record/delivery-files.json).

Profile now reads as a working record: roles and qualifications lead; organizations, dates and evidence status follow together. The introduction uses the two brief sentences supported by the current project records. Full source records and the original professional summary remain intact. Experience body copy is 16px/25px with a maximum 66ch measure; dates and uncertainty are 14px/24px. Numbered entries and fine rules carry the existing visual language. Disclosure bodies align with their summary copy; uncertainty remains visible when collapsed. Education and training dates do not establish verified graduation/completion/certification. The portrait asset, finish, frame geometry, palette and font pairing are unchanged. Professional links and Download CV remain in the portrait column; phone links use two comfortable columns before the CV and reading record.

Capabilities preserves the existing deduplicated inventory and distinct technologies. Contribution-supported AI integration links to **01 JobPilot AI / Reviewed AI changes**; Django links to **03 Cedar Construction / Financial calculation and interpretation**; Supabase links to **02 Lobby / Guest membership and call access**. Cedar and Lobby are explicitly **team-project evidence**. These links reach the existing reader engineering sections, without duplicating their demonstrations. Unsupported associations retain their original reference. The existing skills category reads as Practices within Capabilities, without adding a second skills list. Source attribution and technical limitations remain in the accepted readers.

Tabs now expose tablist/tab/tabpanel relationships, roving focus and Arrow/Home/End keyboard selection. Hidden panels leave the focus order and retain disclosure state across tab changes. Tabs update immediately. Existing whole-group Profile entry motion and 220ms disclosure motion are reused; no new animation stack, per-line stagger or animation-gated content was added. Rapid toggles, reduced-motion changes, CV download and professional link semantics remain covered.

Captured the accepted baseline before editing, then reviewed every tab and all four expandable entries with actual current public content at **1440×900, 1440×650, 768×1024, 390×844 and 320×844**, in normal and reduced motion. The longest FALA organization and Digital Hub description remain readable. Every view has exact viewport captures and additional complete-record captures; the latter temporarily extend camera height to expose the inner scrolling record. The review contains **189 decoded JPEGs**, with every image linked. No page/document horizontal overflow, browser errors or API writes occurred. Before/after competency inventories are identical. Keyboard Enter from actual current capability records reached each engineering section at desktop, 390px and 320px. The original published **31,205-byte PDF** downloaded successfully in each review viewport; external professional URLs, targets and `noopener noreferrer` were checked without sending messages.

| Validation | Result and scope |
| --- | --- |
| Typecheck, lint, production build, whitespace | Passed; existing 503.95kB motion-rig chunk advisory remains. |
| Node regressions | 43 passed: new evidence-source gates, unchanged competency normalization, source attribution, three engineering state machines, rig geometry, complete authored media, eight gallery covers and portrait. |
| Affected Chrome regressions | 63 passed across three configurations: Profile record, content integrity and portrait. After the final phone-link spacing change, all 27 Profile record cases passed again. |
| Existing Profile motion | 3 passed across desktop/tablet/mobile Chrome using the original development-source setup. Accepted motion and deadlines remain unchanged. |
| Additional engines | All 18 new Profile cases passed on Firefox and WebKit, including keyboard, reduced motion, dates/uncertainty, CV and engineering destinations. |
| Actual-asset review | All three tabs × five sizes, all four expanded records, collapsed status, normal/reduced motion; CV and nine actual evidence-navigation checks passed. |
| Final head CI | Terminal results are recorded on the stacked draft PR. Existing workflow groups and deadlines are unchanged. |

Regression layout checks initially used the disclosure container's padded edge instead of its paragraph edge, and a formerly unscoped date query also included the now-retained hidden Education panel. Both queries were corrected to the visible intended content before the passing runs; no readability threshold or existing content requirement was relaxed. Local screenshot review and new checks use the immutable production build. The existing Profile motion check uses its original source server. Historical capture scripts now target the semantic tab role.

Review environment: Windows Chrome; phone/tablet sizes and OS reduced motion are browser emulation. Firefox/WebKit automation is browser testing, **not physical-device testing**. Profile uses the existing photographic portrait; no new WebGL behavior was introduced. Shared normalization, CV/assistant logic, other pages, the three accepted engineering components, Collection image layout, gallery covers and case-study assets were not edited. Physical iOS/Android and an authenticated hosted-preview visual review remain gaps. Existing Windows preview-to-reader focus intermittency remains outside this Profile change.

Runnable local preview: `http://127.0.0.1:5185/profile`; review: `http://127.0.0.1:5185/docs/design/profile-record/review.html`. If the ignored public snapshot is absent, run `npm run preview:content`, then `npm run dev:motion -- --host 127.0.0.1 --port 5185`. Capture scripts default to the immutable production build at 5190; `PLAYWRIGHT_BASE_URL` overrides the main record capture server. The review/report scripts reproduce screenshots and validate all artifact references.

The result improves the reading hierarchy and connects capabilities to useful engineering evidence while preserving the portrait as the visual anchor. **This ends Profile only.** Coordinated Projects/AI Job Match/Contact refinement, preview-to-reader visual handoff and real-device closeout remain outstanding future tasks. No merge, manual deployment, production Contact submission or live CMS/database write is performed.

# Lobby engineering interaction — 12 October 2026

Inspected actual HEAD `76f7575d858feab4b4640d6650f150abce0812ee` on `fix/collection-natural-preview`, origin, ancestry, the working tree, repository/RTK instructions and this record. Origin contained no newer work on that branch. Implementation is isolated on `refine/lobby-engineering`, stacked above draft PR #25. The user's untracked handoff remains unchanged and excluded.

[Before/after review and complete recordings](docs/design/lobby-engineering/review.html) · [source basis and attribution](docs/design/lobby-engineering/source-basis.md) · [decoded screenshot inventory](docs/design/lobby-engineering/artifact-validation.json) · [recording playback verification](docs/design/lobby-engineering/video-validation.json) · [changed files](docs/design/lobby-engineering/delivery-files.json).

**A connection becomes access only when the rules allow it.** The inspected public Lobby revision is `2c8b1d3948b799acfe76d2559723aace143a1f52`, also the existing reader's pinned revision. A guest invitation code can create or restore membership through `guest.join_channel`; a block is rejected before that write. The guarded HTTP call path independently requires active membership and an active, unexpired room. Guest room-data policies and Postgres Changes share the membership condition, but their helper does not check expiry/status. The source disclosure makes that distinction explicit. Code inspection does not prove deployed policies, immediate revocation, production security or individual authorship.

The shared local component demonstrates invited Mira without membership → denied call attempt → joining with a valid invitation → explicit permitted reattempt. Selecting fictional Rowan demonstrates an existing room block: the same valid invitation cannot override it, the join is rejected and a call attempt still lacks membership. Denial preserves membership; no room contents are read or changed. Reset clears local sample membership and results. Session validity, room activity/expiry, code validity and available capacity are fixed sample assumptions, with later provider/capacity checks outside the illustration. No invitation, socket, media permission, Lobby API mutation, production Contact submission or live database/CMS write occurs.

The original intertwined ribbon photograph remains fixed at 260px on desktop, 240px on tablet and at most 220px below the information on phones. Numbered pale/dark ribbon associations match participant/room labels. A dashed connection retains a structural gap until a permitted attempt; permitted access connects and emphasizes the guides. Text supplies every outcome independently of color or movement. Guide emphasis lasts 380ms; result opacity lasts 180ms. State and controls update immediately; finite-motion cleanup handles Reset, rapid interaction, reduced-motion changes and closing without delayed state writes. The quiet opaque reading surface follows the accepted JobPilot/Cedar treatment.

Lobby's primary “Open case study” remains unchanged; its new secondary “Explore the engineering” uses the accepted replace-history fragment navigation, focuses a visible heading and preserves Back/Escape focus. The reader uses the same component in place of its related static media-boundary disclosure, retaining the shared-contract decision and detailed source/limitations disclosure. Mahmoud's documented contribution and all six collaborators remain unchanged. No other project interaction, supporting page, motion rig, authored image, media registry, gallery cover, portrait or Cedar caption was modified.

Real assets were reviewed at **1440×900, 1440×650, 1363×936, 768×1024, 390×844 and 320×844**. Both actual Lobby selections (Friends directory / Audio room and chat) were captured in every state: inspect, denied, joined, permitted, blocked participant, rejected join, blocked call and Reset. Normal, reduced and forced photographic-fallback captures include the shared reader. The review also includes all six actual JobPilot/Cedar/Lobby preview choices at every size. Selected screenshots preserve natural proportions and end before caption and controls, with no horizontal overflow. Retained/loading/failure/rapid-switch behavior is covered by the existing natural-image regressions, now including Lobby's engineering destination and its actual Friends/audio selections.

Evidence comprises **558 decoded JPEGs**, including 18 baseline images and 36 fresh all-project preview captures, plus complete **35.24s desktop / 33.88s mobile** WebM recordings. Local Chrome validated recording dimensions, duration and midpoint decoding. Every screenshot/video has a link in the review HTML; source/geometry/GPU findings accompany the captures.

| Validation | Scope and result |
| --- | --- |
| Typecheck, lint, production build, whitespace check | Passed. Existing 503.95kB motion-rig chunk advisory remains. |
| Node regressions | 32 passed, including the original call-authorization method executed under isolated database stubs and compared with the sample gate; existing JobPilot/Cedar logic, rig geometry, source attribution, complete media, eight gallery covers and portrait remain covered. |
| Affected Chrome regressions | Eight suites / 306 cases across desktop, tablet and phone configurations: Lobby, JobPilot, Cedar, Collection images, engineering navigation, opening/reverse/interruption, all readers and retained media. Terminal results are recorded on the stacked draft PR for this branch. Existing deadlines remain unchanged. |
| Additional engines and final CI | Focused Lobby Firefox/WebKit checks and final head CI outcomes are recorded on the draft PR. |
| Actual-asset geometry and visual evidence | Both Lobby choices × six sizes × normal/reduced/fallback, all states; no image/control overlap, horizontal overflow, browser errors or project writes in the capture reports. All six Collection preview choices additionally passed the fresh normal-motion actual-asset review. |

Validation setup: screenshot review and most local browser checks use the immutable production build. Existing source-module failure injection must use its original development-server setup, because a `.ts` module URL does not exist in a production bundle. The new socket regression records application constructor attempts, excluding only Vite's explicit `vite-hmr` development subprotocol; the initial CI attempt identified that diagnostic connection as the cause of its assertion failure. No application access rule, deadline or existing regression assertion was relaxed. Terminal run details and any follow-ups are reported on the draft PR.

Review environment: Windows Chrome with actual **ANGLE / Intel UHD Graphics / Direct3D11 WebGL** for normal openings. Tablet/phone viewport sizes, reduced motion and unavailable-WebGL fallback are browser emulation, **not physical-device tests**. Firefox/WebKit automation is likewise browser testing. Remaining gaps: physical iOS/Android; actual Lobby database migrations/RLS, authenticated backend and LiveKit integration were not run. The source-method test uses database stubs, and the SQL joining rules are source observations. Automatic preview/CI outcomes belong to the draft PR; no merge or manual deployment is performed.

Working read-only local preview: `http://127.0.0.1:5185/?project=lobby#lobby-engineering`; reader: `http://127.0.0.1:5185/projects/lobby#engineering`. Run `npm run preview:content` if the ignored public snapshot is absent, then `npm run dev:motion -- --host 127.0.0.1 --port 5185`. The capture script defaults to the immutable locally served production build at port 5190; set `PLAYWRIGHT_BASE_URL` to the development preview to reproduce it there. `scripts/report-lobby-engineering.mjs` rebuilds the review and validates its artifact references. `REVIEW_OUTPUT_ROOT` lets the existing all-project capture script write a separate review without overwriting previous evidence.

The result explains a specific engineering distinction through a visible change in relationship: an offered connection is separate from membership, and membership is separate from a permitted call attempt. It strengthens the existing ribbon identity while preserving its original materials and geometry. This ends the Lobby prototype; no other project's next interaction is started.

# Collection preview complete-image flow — 12 October 2026

Inspected actual HEAD `03eccaa5cac93818ed7cb7eedc85a2631887c9ce` on `refine/cedar-engineering`, its ancestry (including `2c00c35`), the working tree, repository/RTK instructions and this record. Origin had no newer commits. Work is isolated on `fix/collection-natural-preview`, stacked above draft PR #24. The user's untracked handoff is excluded and unchanged.

[Before/after review of every exposed preview choice](docs/design/collection-preview/review.html) · [before measurements](docs/design/collection-preview/before/findings.json) · [normal after](docs/design/collection-preview/after/findings.json) · [reduced motion](docs/design/collection-preview/reduced/findings.json) · [photographic fallback](docs/design/collection-preview/fallback/findings.json) · [decoded artifact inventory](docs/design/collection-preview/artifact-validation.json) · [changed files](docs/design/collection-preview/delivery-files.json).

The reported production mismatch reproduced with the actual 1920×2333 Cedar operations capture at 1363×936: an 880×409.30 frame held an 880×1069.28 rendered image. The caption began 635.98px before the image ended. The former geometry regressions compared the caption against the fixed frame, which missed this outflow. Cedar's two desktop selector labels also occupied 395px of a 354px scrolling slot.

The Collection product surface now participates in normal flow. The retained natural-image wrapper reserves the selected source's shape immediately using `screenGeometry` (complete-media metadata, measured published identities or local asset dimensions), then uses browser image dimensions when available. It reserves enough room for the previous and requested image during handoff and keeps the previous reservation on failure. Source-specific attempts retain their existing unmount/decode guards. The empty-preview fallback alone keeps a placeholder shape. No screenshot is clipped, cropped, stretched or moved behind another reading surface to hide the defect; defaults elsewhere remain unchanged.

At the reproduced size the frame and rendered Cedar image both measure **880×1069.28**, the caption starts **24px below the image**, and selectors reserve their own wrapping row (890px including existing focus padding, with no excess scroll width). Desktop case-study actions keep their compact width; phone actions remain full width and stacked. A failed replacement's notice flows above the retained image so both remain readable. Titles, selectors, navigation and the existing engineering components follow the complete screenshot in document flow. Decorative opacity and the WebGL clock do not gate layout or controls. The accepted opening/handoff/reverse code, focus return, browser Back, engineering anchors and both engineering state machines remain unchanged.

Actual published assets and frozen public GET records were used for **all six exposed Collection choices**: JobPilot's Resume library / Discover jobs; Cedar's Portfolio overview / Project details and operations; Lobby's Friends directory / Audio room and chat. All choices were captured and checked at 1440×900, 1440×650, the reproduced 1363×936, 768×1024, 390×844 and 320×844, in normal motion, reduced motion and forced photographic fallback. There is no horizontal overflow or image/control overlap. The HTML review includes all 36 before captures and 108 after captures, preserving complete-page evidence. Camera setup waits for the final opacity paint; interaction regressions independently exercise controls during animation.

| Validation | Result and scope |
| --- | --- |
| Typecheck, lint, production build, diff whitespace | Passed. Existing large-bundle advisory remains. |
| Node regressions | 26 passed: complete original media/variants, eight accepted gallery covers, portrait, story attribution, rig geometry and both engineering state machines. |
| Affected browser regressions | All 237 cases validated across desktop, tablet and mobile Chrome configurations. First run: 235 passed; one app bootstrap request hit Windows Chrome `ERR_NO_BUFFER_SPACE`, and one development-page reload destroyed the execution context before a source-switch action. Both original cases passed in a 12-case production-build follow-up without changing their tests or deadlines; the follow-up also checked the retained-image failure notice. |
| Final desktop action width | 9 Chrome layout cases passed, each exercising six viewport sizes and both preview choices in normal/reduced/fallback modes. |
| Additional engines | All 28 focused Firefox/WebKit cases passed, including loading reservations, tall/portrait proportions, rapid switching, failed replacement, decoded unfamiliar sources, keyboard focus, engineering navigation and reduced motion. |
| Real-asset visual/geometry evidence | 36 before + 108 after screenshots; all reviewed after choices end before their caption and controls, retain source proportions within browser pixel rounding, and have no horizontal or selector overflow. |

All eight case-study readers, the accepted gallery covers, portrait, Cedar caption correction, JobPilot review/accept/stale/Reset logic and Cedar calculation/interpretation/refresh/Reset logic are preserved. No source artwork, authored screenshot, media registry, reader implementation, motion rig, backend or live data was changed. The older Cedar section's broken punctuation encoding was repaired without changing its content. This ends the Collection image-flow fix; Lobby's engineering interaction has not begun.

Review environment: Windows Chrome with actual ANGLE / Intel UHD Graphics / D3D11 WebGL, plus Firefox and WebKit automation. Phone/tablet sizes and unavailable-WebGL/reduced-motion settings are browser emulation, **not physical-device testing**. Before evidence used the development preview; after evidence used the locally served production build with the same original assets. Unknown future media reserves a provisional shape until browser dimensions are available; the loaded image's reservation updates before reveal. Physical iOS/Android testing remains a gap. Final CI and automatic Vercel preview outcomes are reported on the draft PR; no merge, manual deployment, production Contact submission or live CMS/database write is performed.

Local preview: `http://127.0.0.1:5185/?project=construction-project-management-accounting-system` (read-only public snapshot; select “Project details and operations”). Start with `npm run dev:motion -- --host 127.0.0.1 --port 5185`. Production-build validation also used the local read-only server at port 5190. Reproduce captures with `node scripts/review-collection-preview.mjs after` plus `--reduced` or `--fallback`; `PLAYWRIGHT_BASE_URL` can target a local built preview.

---

# Creative Refinement — Cedar engineering interaction — 12 October 2026

Inspected HEAD `2f2eb61ad0ca2c2cd3fe97b8711ac67a583185da` on `refine/jobpilot-presentation`, the working tree, repository/RTK instructions and this record. Origin fetch found no newer work on the accepted branch. Work is isolated on `refine/cedar-engineering`, stacked above draft PR #23. The untracked user handoff remains untouched and excluded.

[Before/after review and recordings](docs/design/cedar-engineering/review.html) · [pinned source basis, assumptions and attribution](docs/design/cedar-engineering/source-basis.md) · [source-generated calculation fixture](tests/fixtures/cedar-advisor-calculations.json) · [normal observations](docs/design/cedar-engineering/after/findings.json) · [reduced motion](docs/design/cedar-engineering/reduced/findings.json) · [fallback](docs/design/cedar-engineering/fallback/findings.json) · [artifact validation](docs/design/cedar-engineering/artifact-validation.json) · [changed-file inventory](docs/design/cedar-engineering/delivery-files.json).

The requested boundary is supported by the inspected public Cedar source at **ab4aff541fb46b6c54831f16a4352657369c1063**. The financial roll-up totals project-linked billed supplier/contractor invoices; the advisor computes a trend estimate from invoiced cost and clamped average phase progress before optional Groq narration. The payload contains project identity, calculated figures/risk and thresholds, not raw invoice/phase records. Groq returns explanation text; this inspected GET path has no financial write. Missing credentials/SDK, provider exceptions or unusable text retain deterministic explanation. Nonempty provider text is not numerically verified. The advisor/financial code is identical to the reader's earlier pinned revision. Detailed paths, checks and limits are in the source basis; no substitute boundary was needed.

Cedar now has a distinct **Inspect → Interpret → Recalculate** interaction. A fictional USD 100,000 contract and USD 40,000 invoiced cost produce an USD 80,000 trend estimate at 50% average phase progress, with 20% margin. Interpret reveals prewritten text without changing those figures. The accessible progress select recalculates immediately; at 25% the estimate becomes USD 160,000 and margin −60%, while the old 50% explanation remains visibly labelled outdated. Explicit Refresh changes only the explanation. At 0% the verified fallback retains current invoiced cost rather than extrapolating, with a clear caution about what that fallback means. Reset restores the initial sample. Outdated/refresh behavior is explicitly a teaching aid, not a verified Cedar freshness mechanism. Everything stays in local React memory; no live accounting or AI request is made.

The original green-beam photograph stays fixed: moving its joined members would imply unsupported mechanics. Numbered guides identify the front cross-beam as calculated facts and the diagonal as their relationship to interpretation. Only the interpretation connector's emphasis changes over 380ms, with a 180ms text fade. Numerical results update immediately and stay visually stable while explanation is revealed. Reset, closing, unmount and preference changes cancel obsolete finite transitions; reduced motion communicates the same state immediately. There is no perpetual motion or new asset/model/animation engine.

The Collection reuses JobPilot's primary/secondary action treatment. Explore the engineering reaches the existing component heading at #cedar-engineering, focuses it and preserves selected-entry history depth and browser Back. Phone actions stack with the accepted spacing. The same component replaces Cedar's static Calculate first, narrate second explanation inside the existing reader engineering section; the other decisions and full source/contribution disclosures remain. All eleven contribution statements and four collaborators are retained. No exclusive personal authorship is inferred from the source.

The quiet opaque paper surface, fonts, rules, 12px metadata, 14px explanation/control text and 260px desktop/240px tablet artwork match the accepted JobPilot benchmark. Phone inputs, figures and text come first; the 220px artwork follows the controls. The current step, recalculated figure and outdated text are understandable without color or motion. Semantic buttons/select, visible focus and concise polite announcements remain usable during animation. Long source explanations stay in disclosure. Natural image proportions, screenshot navigation and the accepted Cedar Collection caption correction remain intact.

| Validation | Result and scope |
| --- | --- |
| Final typecheck, lint and build | Passed. Existing large-bundle advisory remains. |
| Source-function evidence | 9 Python/Decimal reference cases and 8 isolated narration/fallback checks passed. AST extraction and stubs avoid Django startup, database access and provider traffic. The real Django/provider/concurrency suite was not run. |
| Focused Node regressions | 26 passed: arithmetic/state separation/reset, JobPilot boundary, rig geometry, story/source attribution and cover/portrait/complete-media provenance. |
| Cedar Chromium coverage | 36/36 passed across the original desktop/tablet/phone projects: calculation and separate interpretation, input/refresh, zero/full progress, rapid Reset/close/reopen, keyboard, reduced motion, direct fragment/Back, fallback, axe, typography, no overflow and no perpetual artwork updates. |
| Firefox and WebKit | 24/24 passed, covering the complete Cedar file in both engines. Browser emulation, not physical Safari. |
| Existing affected coverage | 159 distinct cases covered. The initial broad run passed 157; two tablet-configured legacy focus tests (JobPilot touch return and reader Back) failed while capture jobs were active. Both original tests then passed in isolation on all three configurations, 6/6, with no changes to assertions/deadlines/product behavior. This records the transient result rather than calling the initial run wholly green. |
| Normal visual/GPU review | 1440×900, 1440×650, 768×1024, 390×844 and 320×844. Selection, visible destination, figures, interpretation, changed/outdated, refresh, zero-progress fallback and Reset captured. Original opening uses actual Intel UHD / ANGLE D3D11 in installed Windows Chrome. No captured page errors, writes or horizontal overflow. Phone/tablet dimensions are viewport emulation. |
| Resilience and shared reader | Reduced-motion and forced unavailable-WebGL journeys at 1440×650, 390×844 and 320×844, with the same complete explanation/controls. Reader heading/controls use separate natural-scroll screenshots. Zero recorded errors, writes or overflow. |
| Review artifact | 92 referenced images decode. Desktop recording 16.36s; mobile 16.08s; both playable complete journeys. Native full-document clipping paints the entire long Collection panel, avoiding unpainted bands from locator capture under a clipped ancestor. Product layout is not altered for capture. |
| Preview tooling | Windows locked a recording while Vite tried to watch it, stopping the first capture server. The explicit read-only preview now excludes generated QA and ignored source-checkout directories from its watcher while serving them normally. Subsequent captures complete; production build/config is unchanged. |
| CI | Final-head GitHub Actions and Vercel preview statuses are recorded separately in the stacked draft PR closeout. The existing CI gates, configurations, retries and deadlines remain. Cedar's 36 browser cases join the three smoke runners; source-fixture/state checks join test:motion. |

Working local preview: http://127.0.0.1:5185/?project=construction-project-management-accounting-system#cedar-engineering. Reader: /projects/construction-project-management-accounting-system#engineering. Review: /docs/design/cedar-engineering/review.html. Start with npm run dev:motion -- --host 127.0.0.1 --port 5185; prepare missing public GET content with npm run preview:content. Captures use frozen public records and cached complete originals, blocking API writes.

Judgment: the arithmetic and separate explanation make the calculation/narration boundary concrete. The fixed joined beams gain an understandable role while retaining Cedar's visual identity; the demonstration does not reuse JobPilot's approval metaphor. This stops at Cedar for review.

Remaining gaps: physical phone/tablet/Safari and spoken screen-reader testing; live Django accounting, provider accuracy, concurrency and financial validation; future CDN availability; the existing opening/focus reliability limitations under stressed test environments. Source inspection and isolated fixtures are not a live accounting audit. JobPilot, Lobby and supporting pages, original assets, WebGL/model code, portrait, covers and complete case images are preserved. No merge, manual deployment, production Contact submission or live CMS/database change.

---

# JobPilot prototype presentation refinement — 11 October 2026

Inspected current HEAD `4a501ad8ebb95bfa01e6d665ad89652cb6bbbff6`, branch `refine/jobpilot-review-boundary`, the working tree, repository/RTK instructions and this QA record. Origin fetch found no newer commits above the approved prototype. Work is isolated on `refine/jobpilot-presentation`; [draft PR #23](https://github.com/MahmoudAbdulGhani/Portfolio/pull/23) is stacked above draft PR #22. The user's untracked handoff remains untouched and excluded.

[Updated before/after HTML and recordings](docs/design/jobpilot-boundary/review.html) · [original prototype comparison](docs/design/jobpilot-boundary/prototype.html) · [refinement/source-preservation notes](docs/design/jobpilot-boundary/presentation/refinement.md) · [before](docs/design/jobpilot-boundary/presentation/before/findings.json) · [after](docs/design/jobpilot-boundary/presentation/after/findings.json) · [reader benchmark](docs/design/jobpilot-boundary/presentation/reader/findings.json).

The JobPilot preview now places a secondary **Explore the engineering** link beside the primary Open case study action. It targets the existing `#jobpilot-engineering` heading, focuses it and uses the existing immediate route/hash restoration. Replacing the current selected history entry avoids adding an extra Back/close step; Back still returns to the originating Collection and restores focus. Direct fragment loading works too. The link has an explicit tab stop for WebKit, a visible keyboard outline and a 44px target; phone actions stack with 12px spacing. Screenshot proportions remain intact. The additional 56px phone action height is accounted for in the first grid row, retaining the previous preview/caption position rather than moving the image to accommodate the demonstration.

The shared component uses the existing photograph at 260px on desktop, 240px on tablet and up to 220px on phones. Its original complementary masks, plate pivot, 3.5° pose and 380ms articulation remain unchanged. A restrained guide identifies the foreground ivory plate; its labelled proposed-change caption and the adjacent proposed-value column share a dashed pending emphasis. Approval restores alignment as the saved value changes. This remains an artistic photographic metaphor. No new image, material, model, animation engine, hero or section stack is introduced.

An opaque paper surface and local foreground layer remove the faded Lobby sculpture from behind the comparison while retaining the atmosphere outside this component. The reader receives the same surface, typography and layout. Metadata is at least 12px; explanations and actions are at least 14px. Fictional-data labelling remains visible. Proposed and saved columns now exist from Rest onward, with **None yet** before a proposal; minimum message/card/action space reduces avoidable jumps without clipping mobile content. Long implementation details stay in the existing disclosure. The comparison's metadata now lives inside its definition-list values, preserving valid semantic grouping.

The isolated phase marker is replaced by the noninteractive ordered progress list **1 Propose → 2 Review → 3 Accepted**. Exactly one item has `aria-current="step"`; its underline, weight and numbered outline complement color. Narrow screens can stack the steps. Stale review stays on Review, labels Byblos as **Changed during review**, identifies the Beirut comparison as an **Outdated review**, and explicitly says another review is required. The existing blocked-approval action and subsequent Review again remain unchanged. State meaning does not depend on animation or color alone.

The reducer `profile-boundary-state.ts` is byte-identical to `4a501ad` (Git blob `7a575f84e8f9781741e88d2a5cc2f9bc747f9aa3`). Saved/proposed separation, explicit approval, stale blocking, Reset, announcements, accepted-action guards and fictional memory-only values are preserved. The [pinned source basis](docs/design/jobpilot-boundary/source-basis.md), private source links and technical/runtime limitations remain intact. Public assets, original WebGL/model code, full case-study images, covers, portrait and Cedar caption correction have no diff from the baseline. No other project or supporting page is redesigned.

| Validation | Result and scope |
| --- | --- |
| Final typecheck, lint and build | Passed. Existing bundle-size advisory remains. |
| Node regressions | 21 passed: approved state logic, sculpture geometry, source/case-story integrity, complete-image provenance, gallery covers and portrait preservation. |
| Affected Chromium regressions | 159 passed across desktop/tablet/phone: complete Collection, signature-motion, case-study and boundary files. After the WebKit tab-stop repair, the complete boundary file passed again, **36/36**. Existing assertions and timeouts are retained. |
| Firefox and WebKit | Final **18/18 passed**: saved/proposed/stale/accepted progress, keyboard and reduced motion, Back/close/direct fragment navigation, fallback, responsive destination bounds, metadata/explanatory sizes, axe and opaque foreground layering. WebKit initially skipped the new implicit anchor on Tab; explicit `tabIndex=0` fixes the product, rather than weakening the test. |
| Actual assets and GPU | 1440×900, 1440×650, 768×1024, 390×844 and 320×844. Selected preview, destination, Rest, Propose, Review, Accepted, changed saved value, blocked stale review and fresh acceptance captured at every size. Original opening uses actual Intel UHD / ANGLE D3D11 on installed Windows Chrome. Zero recorded page errors, writes or horizontal overflow. |
| Reduced motion and photographic fallback | Native reduced-motion emulation and forced unavailable-WebGL journeys at 1440×650, 390×844 and 320×844; same controls, explanations and complete state journeys, without overflow or writes. These are controlled browser fixtures. |
| Shared reader | Normal, accepted and stale states at all five sizes; 30 separate heading/controls viewport captures preserve the reader's natural inner scrolling. Its clean background is matched by the Collection surface. |
| Review artifact | 131 referenced images decode. Desktop recording is 13.52s; mobile is 12.8s. Both play with complete journeys including engineering navigation, Reset, stale rejection and closing/focus return. Original Step 1 artifact is retained as `prototype.html`. |
| CI partition | Baseline [CI #81](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38149075937) reached the existing 15-minute verify-job limit during its 315-case browser step; other jobs completed successfully. New CI retains every original smoke configuration and test plus the complete boundary suite, using independent runners and one worker each. The unchanged `verify` status is an aggregate requiring checks, all smoke runners and the boundary job. All original deadlines, retries and assertions remain. Static/media/accessibility jobs remain intact. Final-head results are recorded in the stacked draft PR closeout. |

CI [run #82](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38153294949) completed every suite, but the desktop Escape-reversal test exceeded its unchanged 30-second deadline. Its downloaded trace shows the original focus/disposal/reversal assertions succeeding after software WebGL spent 6.16s drawing 180ms of synthetic frames and 20.51s drawing 600ms. The fixture now samples the same elapsed poses at several points rather than rasterizing every 16ms frame. All original assertions, real WebGL, the 600ms completion budget and test timeout remain; a new assertion requires at least four closing samples. Three repeats on each original configuration pass (**9/9**). Product code, opening geometry, motion timing and the approved boundary reducer are unchanged by this correction. Final-head CI results are recorded in [draft PR #23](https://github.com/MahmoudAbdulGhani/Portfolio/pull/23).

Local read-only preview remains `http://127.0.0.1:5185/?project=jobpilot-ai`; the direct destination is `/?project=jobpilot-ai#jobpilot-engineering`. The same demonstration is in `/projects/jobpilot-ai#engineering`. Start with `npm run dev:motion -- --host 127.0.0.1 --port 5185`; prepare missing frozen public GET content with `npm run preview:content`. Review captures block writes and use cached whole originals.

The larger artwork, labelled plate/proposal relationship and explicit current-step/stale messages make the engineering easier to find and read. The quiet surface provides separation from the atmospheric sculptures without changing the Collection's visual identity. This refinement stops at JobPilot.

Remaining gaps: browser viewport emulation is not physical phone/tablet or Safari proof; no spoken screen-reader session, real JobPilot mutations, transaction/concurrency/replay test or future-CDN guarantee. Existing tablet opening limitations are not claimed repaired. No merge, manual deployment, production Contact submission or live CMS/database change occurred.

---

# Creative Refinement — JobPilot review boundary — 11 October 2026

Started from actual HEAD `2c00c354d7b6c727f26efb4fdaaabce4f9212588` on `refine/registration-media-cleanup` after inspecting the tree, repository instructions and this document and fetching origin. Ancestry verification confirms the complete-image work and Cedar caption correction are included; no newer fetched work was present. Work is isolated on `refine/jobpilot-review-boundary`, stacked above draft PR #21. The untracked handoff document is untouched and excluded.

[Before/after comparison and recordings](docs/design/jobpilot-boundary/prototype.html) · [source basis](docs/design/jobpilot-boundary/source-basis.md) · [before observations](docs/design/jobpilot-boundary/before/findings.json) · [after observations](docs/design/jobpilot-boundary/after/findings.json) · [changed-file inventory](docs/design/jobpilot-boundary/delivery-files.json).

JobPilot selection now exposes “Suggestions become saved information only after review.” immediately above its complete preview. The compact boundary demonstration below the existing opening controls uses four states: Rest → Propose → Review → Accept, plus Reset. Clearly fictional sample data compares saved Beirut with proposed Tripoli. Propose and Review cannot modify saved information. Explicit acceptance updates the saved value. Changing the saved profile to Byblos during review leaves the original Beirut comparison stale; attempting acceptance is blocked, and another explicit review is required before approval. No JobPilot mutation endpoint is called, and no sample state is persisted.

The reusable component replaces JobPilot’s former static “The profile save boundary” figure in the reader’s existing engineering section. It does not add a competing diagram. The full source boundary remains in disclosure alongside the original engineering decisions and references. Read-only inspection of the available private checkout at pinned `344b0d77d3d3525e8617df0a48e303055fbb024f` confirms separate current/proposed profiles, reviewed-profile revision comparison, confirmed-CV freshness checks under row locks, atomic profile/provenance acceptance, and identical-request replay returning the existing applied result. This demonstration models only the profile revision rule, using a local counter. CV source changes require fresh suggestions in the documented implementation; another profile review alone is not represented as repairing changed CV text. Backend transaction/concurrency tests and live saves were not executed.

The accepted Collection composition and sculpture asset are unchanged. Complementary SVG masks reuse the original photographic pixels, isolating one existing foreground ivory plate. Its restrained 3.5° turn around the pictured lower support holds the proposal apart, then returns to the original alignment after approval. Articulation is 380ms and explanatory text is 180ms, on the existing GSAP/finite-motion stack. This is photographic articulation and an artistic metaphor, not a new 3D reconstruction or architecture diagram. Visual review rejected an early photo-to-existing-mesh switch because its apparent shape changed too much; no changes to the original WebGL model, materials or opening implementation remain.

Data changes and controls act immediately. Reset snaps to the original sample and cancels superseded finite animation. Closing suspends articulation and makes the component inert, then the existing Collection return restores focus. Native reduced motion updates the same states/pose immediately; switching the preference during a text fade restores full text opacity. Accepted and already-used optional actions use `aria-disabled` with reducer guards, retaining predictable keyboard focus. A polite status announces intentional changes; the sculpture itself is decorative. Heading levels adapt to the selection and reader contexts. The comparison stacks vertically below 600px, keeping HTML text readable. A dedicated first grid row preserves the accepted preview/caption geometry across JobPilot, Lobby and Cedar; short windows scroll naturally. Routes, original screenshot navigation, gallery covers, portrait, Cedar caption fix and all other project designs remain intact.

| Verification | Result and scope |
| --- | --- |
| Typecheck, lint, build and diff whitespace | Passed after final implementation changes. Existing bundle-size advisory remains. |
| Node regression checks | 30 passed: three boundary state tests, geometry, case-study/content integrity, API learning-context fixtures, cover/portrait preservation and complete-media provenance. |
| Chromium browser coverage | 189 distinct cases covered across desktop/tablet/phone configurations. Initial broad run: 187 passed, two failures from a formerly page-wide status locator now matching the new demonstration announcement. The locator is scoped to the screenshot region with all assertions/deadlines retained; all three affected configurations pass separately. Final rerun of the complete Collection and boundary files: **78/78 passed**, including all 30 new boundary cases. The remaining 111 case-study, content, preview and signature-motion cases passed in the broad run. |
| Firefox and WebKit | **14/14 passed**: normal/stale acceptance and no writes, keyboard/reduced motion/disclosure/axe, unavailable WebGL, and comparison/introduction geometry at 1440, 768, 390 and 320px in both engines. Browser emulation, not physical Safari. |
| Focus and transition regressions | Proposals stay separate until approval; old review is blocked; fresh review accepts; rapid reset/close/reopen retires old transitions; repeated acceptance cannot write again; accepted controls retain keyboard focus; reduced-motion pose/text update immediately; context loss retains explanation; settled plate has no perpetual updates. |
| Actual-asset visual review | Desktop 1440×900, short desktop 1440×650, tablet 768×1024, 390×844 and 320×844. Collection, selected preview, all four states, stale rejection and fresh approval captured at each size. No captured page errors, API writes or horizontal overflow. |
| GPU review | Unchanged opening uses actual Intel UHD / ANGLE Direct3D11 in installed Windows Chrome at all five sizes. Diagram motion uses the original photograph and SVG. This is not a phone GPU performance test. |
| Recordings | Desktop and mobile recordings show selection, the complete normal interaction, Reset, stale rejection, fresh review/acceptance and closing/focus return. Duration metadata is in `docs/design/jobpilot-boundary/recording-metadata.json`. |
| Remote CI | Final-head CI status is recorded in the stacked draft PR closeout; local results above are independent of it. |

Local read-only preview: `http://127.0.0.1:5185/?project=jobpilot-ai`. The same demonstration is at `/projects/jobpilot-ai#engineering`. Run `npm run dev:motion -- --host 127.0.0.1 --port 5185`; `npm run preview:content` prepares the public GET snapshot if it is absent. Review artifacts use the frozen public records and cached original screenshot files, with all API writes blocked. Screenshots remain complete and naturally proportioned. The HTML comparison includes all five viewport pairs and six demonstration states per size; its two videos are directly playable.

Judgment: the interaction makes the proposal/acceptance boundary concrete through separate values, explicit approval and a visible stale-review failure. The ivory plate now has a specific role while retaining the existing terracotta/ivory identity. Its small movement supports the explanation rather than becoming a second spectacle. This prototype is sufficient to judge the approach before extending it; no other project is redesigned.

Remaining gaps: no physical phone/tablet, physical Safari or spoken screen-reader session; no real JobPilot save, CV source change, locking, database concurrency or network-replay test. Cached-original observations do not establish future CDN availability. The previously documented tablet opening limitation is not claimed repaired. No merge, manual deployment, production Contact submission, live CMS/database change or next creative-refinement step occurred.

---

# User Management registration media cleanup — 11 October 2026

Started from `bddad2570fb114670b4c1aea132e6c61fe555a25` on `fix/cedar-collection-caption` (draft PR #20), which contains PR #19's complete-screenshot commit `8c3ba6f`. Branch/tree inspection and an origin fetch found no newer tracked changes. Work is isolated on `refine/registration-media-cleanup`, stacked on PR #20. The untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched and uncommitted.

[Before/after HTML comparison](docs/design/registration-media-cleanup/comparison.html) · [before observations](docs/design/registration-media-cleanup/before/findings.json) · [after observations](docs/design/registration-media-cleanup/after/findings.json) · [real-asset viewer modes and panning](docs/design/registration-media-cleanup/viewer-panning.json) · [preservation summary](docs/design/registration-media-cleanup/review-summary.json) · [Collection caption recheck](docs/design/registration-media-cleanup/collection/findings.json).

The shared `detailScreens` helper appended the incomplete registration excerpt on every User Management read. Removing that append alone would still allow CMS screenshots, a legacy cover or a generated variant to select it again. The helper now excludes the known excerpt identity and its WebP/AVIF variants at read time, including absolute URLs, encoded filenames and query/hash suffixes. Known local sources are canonicalized before deduplication, so CMS aliases cannot duplicate the retained complete registration capture. The public reader's metadata cover also rejects the excerpt. The active primary chooser, expanded gallery, workflow, Collection preview and enlarged viewer all consume the shared normalized list; raw admin records and the original asset are preserved.

User Management now has two contiguous selections: Public platform statistics and Public registration form · portrait capture. The existing registration workflow keeps the complete 1040×1688 portrait. Chooser numbering, image counts, thumbnail labels and previous/next navigation derive from those two entries. The viewer tracks the selected source identity instead of a stale numeric position, retaining the complete registration image when a refreshed CMS record changes its index. A controlled reconnect test shrinks the list to one image, confirms disabled navigation and no redundant thumbnail strip, then restores the two-image list and verifies the registration remains selected. The existing small-native-image density regression now uses the retained complete Home Services mobile navigation capture (390×844), preserving that assertion's purpose after retiring its former excerpt fixture.

Real-asset Chrome review covers 320, 390, 430, 768, 1024 and 1440px. Before evidence contains three selections at every width; after evidence contains two and no empty slot. Every remaining primary selection, expanded-gallery image, registration workflow and corresponding viewer opens successfully. Forty-eight after-state observations plus six introduction captures document the results. The complete portrait remains at its natural ratio, bounded by 420px on wide layouts and the available width with 16px phone gutters. The statistics screen reaches the existing 1180px column on desktop. All inline frames use contain, automatic height and no transform. Thirty-six separate real-asset viewer mode observations confirm Fit, Fit width, native Actual size, scrolling to the image boundaries, Escape and focus return. Responsive variants and original files are unchanged.

The archived 343×654 excerpt is still present with SHA-256 `3b3acefd7c0a5766600bc7f575b62d6b0e4c86065ab1f0a695108bbadc1b70f9`. The archival 50-identity manifest remains intact; the public readers now expose 48 images across eight projects. No source asset, crop metadata, project-card cover, portrait, factual attribution, AI/CV path, media geometry, loading gate, 15-second deadline, retry cleanup or motion code was edited.

Cedar's inherited Collection correction is unchanged. Actual-artwork captures at 1280×720, 1440×650 and 1120×600 place “03” at y=108px below the 92px navigation header; title and purpose remain visible. The existing seven-size caption regression passes in all three Chromium configurations without changing its assertions or thresholds.

Focused regressions cover every excerpt alias, missing/legacy-only CMS screenshots, complete-source deduplication, record immutability, both primary selections at all six widths, gallery/viewer navigation, keyboard closing/focus return, metadata fallback and an open viewer's refreshed selection. These network/geometry tests use synthetic same-dimension rasters and mocked CMS responses; the separately linked visual captures use actual project assets and frozen read-only public records. The initial local media run passed 269 checks but exceeded the existing 30-second test deadline in the new WebKit test that combined six complete viewport journeys. That same aggregate check passed in Linux CI. The regression now gives each viewport its own test, retaining every assertion and the original timeout, consistent with the existing per-width media suite. The full 295-case media suite and required final-head CI run for closeout; final counts and workflow links are recorded in the stacked draft PR. Typecheck, lint, original-image provenance, API-package startup, content integrity, sculpture geometry, gallery covers, portrait assets and static CV checks pass. Build retains the existing bundle-size advisory.

Remaining gaps: these checks use browser emulation, not a physical Android/iOS device. Local actual-asset and cached-original observations do not guarantee future external CDN availability. The earlier tablet opening instability remains documented separately and is not claimed fixed. The removed excerpt's complete source is still unavailable in the archive, but that incomplete selection is no longer public. No merge, manual deployment, live CMS/database changes, production Contact submission, booking/payment or authenticated project operation occurred.

---

# Cedar Collection caption — 11 October 2026

Started from `8c3ba6f06100accaf14cdf90962241e7ebf5bfb3` after checking the branch/tree and fetching origin. No newer tracked work was present. Work is isolated on `fix/cedar-collection-caption`; the handoff file remains untouched and uncommitted.

The user's screenshot identifies Collection item 03, rather than a case-study screenshot. Fresh read-only production captures reproduce the number behind the navigation at 1280×720, 1440×650 and 1120×600. The caption's `bottom:48%` anchor places its 116px text block above the stage when desktop height is short. Cedar's description is now visible, but the original anchor did not accommodate the increased text height. A small horizontal overhang also occurs near the desktop breakpoint.

The scoped desktop caption rule keeps a 16px top boundary, intrinsic content height and overflow-safe lower alignment. It retains the original bottom alignment when the content fits and otherwise lets the text extend down. Its left position is bounded by the existing clickable area. At 1440×900 the number remains at y=125.98px; at 1920×1080 it remains at y=162.48px. Short desktop layouts place it at y=108px below the 92px header. No artwork, portrait, collection object positions, motion implementation, case-study image presentation, caption facts, AI or CV code is changed. Existing phone/tablet styles remain in effect.

[Live/local HTML comparison](docs/design/collection-caption-fix/comparison.html) · [production geometry](docs/design/collection-caption-fix/live-before/findings.json) · [local geometry](docs/design/collection-caption-fix/local-after/findings.json) · [Chrome regressions](docs/design/collection-caption-fix/caption-chromium-3.json) · [Firefox/WebKit regressions](docs/design/collection-caption-fix/caption-engines-2.json) · [live reader check](docs/design/collection-caption-fix/live-readers/findings.json).

Ten current production/local viewport pairs use actual artwork and fresh public GET records. No header clipping remains in the local captures. The regression checks the number, title and description against navigation, footer and viewport bounds at seven desktop sizes; it passes in all three Chromium configurations, Firefox and emulated phone WebKit. Firefox's initial intrinsic-height behavior required `safe flex-end`; the final assertions remain intact.

The additional production review checks every project's primary image and its three viewer modes at 390 and 1440px (16 reader states / 48 mode observations), including Escape and focus return. All load successfully. Home Services uses `/projects/complete/home-services-page.webp`, confirming that the complete page is deployed. This is a focused live check, not a repeat of every gallery selection at every width. Full original-image verification remains documented in the preceding review.

Typecheck, lint and build pass; the existing bundle-size warning remains. The full affected Collection/motion suite and final-head CI are run for closeout; their final results are recorded in the draft PR. An initial motion run used the compiled preview, where the existing lazy-import fixture's TypeScript URL cannot intercept the bundled import. It was stopped and rerun against the development server expected by that fixture, without changing assertions, imports or motion behavior.

All observations are browser emulation, not physical-device testing. The earlier tablet opening instability remains separate and is not claimed fixed. The local caption fix is not yet deployed. No merge, manual deployment, live CMS/database changes, Contact submission, booking/payment or authenticated project operation is performed. Live browsing allows GET/HEAD and blocks writes; any Contact success in automated tests uses mocked routes.

---

# Complete original case-study media — 11 October 2026

Started from approved d4c349f21d8f585a35b147b2c89df69db1756ef0 on refine/mobile-case-media after checking the branch and tree and fetching origin. No newer tracked changes were present. Work is on refine/complete-case-screenshots; Codex_Engineered_Landscape_Handoff.md remains untouched and uncommitted. This section supersedes the earlier task-detail-main-presentation direction; its captures and provenance remain historical evidence below.

[Before/after HTML comparison](docs/design/complete-case-media/comparison.html) · [per-image observations](docs/design/complete-case-media/after/findings.json) · [whole-source dimensions and hashes](docs/design/complete-case-media/sources.json) · [public source checks](docs/design/complete-case-media/current-public-sources.json) · [repository source search](docs/design/complete-case-media/repository-source-check.json) · [viewer scrolling and panning](docs/design/complete-case-media/viewer-panning.json) · [browser zoom](docs/design/complete-case-media/zoom/findings.json).

## Confirmed cause and implementation

The prior reading flow selected 21 authored crop files, plus three cropped phone task captures. CSS contain could not restore pixels absent from those files. A height-greater-than-width rule also restricted tall desktop workflow figures to 360px, while primary-image sizing imposed an effective 650px height limit. Expanded-gallery images used fixed 250px boxes.

The workflow now uses the complete matching original at every viewport. Cedar's separate 572×768 advisor upload is visibly a fragment of the complete 1920×2333 operations screen: that screen contains the same forecast, margin, cost ratio, explanation and progress values, plus the surrounding project and health context. The duplicate advisor image is retired; both workflow explanations precede one complete operations screen. Fourteen workflow figures and 49 reader-image selections remain.

Primary, workflow and expanded-gallery screenshots share normal document flow, responsive width and automatic height. The measured source ratio reserves loading space and prevents fractional responsive-density rounding from moving frames on decode. There is no common aspect ratio, height cap, crop transform or automatic enlargement. Explicit content roles bound desktop/document captures by the 1180px content column, genuine phone and registration portraits by 420px and their native width, tablet captures by 768px/native width, and artwork by 520px/native width. Phone side gutters are 16px. Tall desktop captures remain desktop captures. The accepted card-cover files, proportions, portrait, palette and motion code are unchanged.

The reading sequence is heading → short explanation/evidence note → complete recorded image → View full screen. Primary images also retain the chooser and top Enlarge control. The expanded gallery uses the same visibility-gated ScreenshotFrame instead of fixed-height thumbnails. Its collapsed images have no request URLs even after 16 seconds in the controlled regression.

Seven full-resolution PNG masters restore the pixels previously discarded by optimization: four GameZone demonstration screens, the registration portrait Medicare's public viewport and Home Services' complete local page. New lossless complete originals retain every decoded master pixel. Scoped reader/viewer variants use whole-image resizing, WebP quality 92 and AVIF quality 65, with sizes up to 2360px and the native width where available. No variant exceeds its source width. Existing source files, historical detail files, project-card cover assets and their manifests are untouched. The new pipeline detects duplicate basenames so Lobby and GameZone cover variants cannot overwrite one another.

ScreenshotFrame retains the 600px visibility gate, eager request start only after eligibility, one-shot 15,000ms deadline, keyed source/retry attempts, cached completion, timer/observer cleanup and existing reduced-motion/handoff behavior. Natural-image grid items have min-width:0. Feedback and retry stay near the beginning of tall frames rather than halfway down them; retry can complete without scrolling the caption. Full-screen Fit, Fit width and Actual size, original retry, keyboard focus containment, Escape and focus return remain available.

## Per-project results

| Project | Reader images | Result and source limits |
| --- | ---: | --- |
| JobPilot AI | 7 | Complete discovery, saved-workspace and voice screens; source/filter and action fragments removed. Public phone/tablet captures remain distinct from authenticated workflow evidence. |
| Lobby | 8 | Complete guest-access, invitation and audio/chat screens, including the surrounding interface. Documented team attribution remains intact. |
| GameZone Arena | 15 | Complete desktop session/device/review screens use the 1180px column at desktop widths. Complete room and older phone/tablet captures remain available. Synthetic availability, prices and booking/payment limitations remain disclosed, including in the expanded gallery. |
| Cedar Construction | 6 | Complete operations and report screens replace fragmented panels. The advisor explanation shares the operations screen; duplicate fragment removed. Financial figures remain demonstration data. |
| UniHub | 6 | Complete 1914×896 transcript screenshot retains its surrounding application, rows, totals and demonstration disclaimer. No higher-quality screenshot or actual PDF was located in local sources or the reviewed/latest source repository. No transcript is fabricated. |
| User Management | 3 | Complete 1040×1688 registration portrait is centered. The exact full original of the separate 343×654 registration excerpt was not located. That available file is explicitly labelled “Registration form excerpt · complete source unavailable” in chooser, primary caption, gallery and viewer; it is not used as the workflow's main image. Its source UI overlap remains visible. |
| Medicare Hub | 2 | Higher-quality complete public homepage viewport and identity artwork, with the existing source-based appointment diagram. Authenticated clinical media remains unavailable and unverified. |
| Home Services | 2 | Complete local 1920×8828 supplied-design page through its footer replaces the hero fragment; the genuine phone menu capture remains at its recorded proportions. Supplied-design attribution and marketing-evidence limitations remain intact. |

“Complete” describes the entire recorded image. A viewport capture does not establish or invent content outside its original captured boundaries. Genuine phone welcome/registration images are not substituted for unrelated desktop workflows.

## Validation and evidence

- Typecheck, lint and production build pass. The existing bundle-size warning remains; no limit is raised.
- Asset/provenance tests: 3 pass, including all measured identities, archived crop provenance, unique variant ownership, original proportions, no upscaling and decoded-pixel equality for all seven complete masters.
- Integrity tests: 17 pass; geometry/motion unit tests: 3 pass; JavaScript-only API startup and health/projects/profile checks pass. No AI, CV, learning evidence, attribution or motion implementation changes are made.
- Affected Chromium checks: [93 pass](docs/design/complete-case-media/affected-chromium-93.json), including controlled 15-second deadlines, offscreen eligibility, retry, stale attempts, cached loading, captions, navigation and accessibility. [Three collapsed-gallery checks pass](docs/design/complete-case-media/collapsed-gallery-3.json) across desktop/tablet/phone emulation. After the final gallery evidence-note and primary full-screen-link markup, [20 affected reader checks pass again](docs/design/complete-case-media/final-reader-20.json).
- [255 media checks pass](docs/design/complete-case-media/multi-engine-media-255.json): all eight workflows at 320, 390, 430, 768, 1024 and 1440px across desktop/tablet/phone Chromium, Firefox and phone WebKit, plus complete-portrait Fit/width/actual, original-retry and small-source density regressions. [Ten Firefox/WebKit readiness checks pass](docs/design/complete-case-media/accessibility-engines-10.json). These are browser emulation, not physical-device results. Controlled network fixtures use synthetic rasters of the actual source proportions; they do not establish real asset quality.
- Real-asset Chrome review: all eight projects, every primary selection, every expanded-gallery image and every viewer selection at all six requested widths. The final capture set contains 1050 recorded states: 294 primary, 294 expanded gallery, 294 viewer, 84 workflow and 84 workflow-viewer states, plus 48 introduction captures. Native viewport clips are stitched only to show complete tall figures inside the reader's scroll area; no product CSS or viewport is altered for the captures. Original boundaries, proportions, column widths, loading and focus return are checked against the actual sources.
- Separate real-asset viewer audit: 294 selections × three modes = 882 mode checks. Fit includes every boundary; width/actual modes pan horizontally and scroll vertically where overflow exists, Actual size uses native original dimensions, and Escape returns focus. Genuine 200%/400% Chromium tab zoom is confirmed by the tabs API across 26 route states and 16 reader viewers. The 320×234 short-height audit keeps tools/navigation within the dialog and a positive 22–32px image region. Fine text still needs enlargement at phone widths.
- Ordinary production GET confirms unchanged media identities for all eight projects. Ten original remote image hashes match the recorded originals, including a Cedar operations request that timed out in the bounded source probe and recovered on retry. The probe's 30-second network bound is separate from the unchanged 15-second application deadline.
- CI retains Prisma generation after server dependency installation. Expanded media coverage is distributed by Chromium, Firefox and WebKit, with one worker and the existing 15-minute job limits. The required case-media status remains an aggregate that requires every engine to succeed; no test, assertion, timeout or browser is removed. Exact-commit CI results are recorded in the draft PR closeout after the final push, without merging or deploying.
- [CI run 75](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38095298083) passed all 255 media checks, ten accessibility engine checks and the CV job. Its main verification job passed 279 cases and failed three copies of the retained-reader-image test: the fixture intercepted only the old remote PNG, so the new responsive variant loaded before the controlled request was released. The fixture now intercepts both original and responsive requests and returns a raster with the recorded source dimensions. All original assertions and deadlines remain unchanged; [the three focused desktop/tablet/phone tests pass](docs/design/complete-case-media/retained-image-handoff-3.json) without retries or skips. This correction changes no motion code. Typecheck and lint are repeated after the fixture correction. Final-head workflow results are recorded in [draft PR 19](https://github.com/MahmoudAbdulGhani/Portfolio/pull/19).

## Remaining gaps

Physical Android portrait/landscape confirmation, physical iOS/Safari, virtual-keyboard behavior and screen-reader speech remain unverified for this revised build. The user's earlier physical Android observation concerned the prior production presentation, not this branch. Browser emulation cannot close those gates.

The transcript's higher-quality original/PDF and the exact complete registration-excerpt source remain unavailable. The inspected repository candidates are background/decorative artwork and are rejected as unrelated replacements. Remote image/CDN latency remains external; a successful retry does not guarantee future delivery. The separately documented tablet opening instability remains unchanged and is not claimed fixed by this image work.

No merge, manual deployment, live CMS/database changes, production Contact submission, booking/payment or authenticated project operation is performed. Contact success checks use mocked routes. The handoff file is preserved.

## Local-source follow-up and final checks

The user highlighted locally available screenshots. A fresh source search found the complete Home Services page in `Desktop/home proj/home-services/Screenshots of the website/website screen.png`, also present in Downloads. It includes every page section and footer matching the supplied-design hero interface. The copied PNG is unchanged; its lossless reader original and whole-image responsive variants replace the main hero fragment while the project-card cover remains unchanged. The primary caption now describes the complete supplied-design page. No UI is invented. [Local source recheck](docs/design/complete-case-media/local-source-recheck.json) confirms nine JobPilot/Cedar originals by exact SHA-256; eight older GameZone workflow/dashboard dimensions match their intact originals. The older GameZone full landing page has a different hero image and signed-in state, so it is not misrepresented as the exact source of the selected hero viewport. The unrelated university enrollment document and decorative artwork are rejected as transcript/registration replacements.

Refreshed Home Services primary, expanded-gallery, workflow and viewer captures cover all six requested widths; the complete page reaches the footer without clipping or page overflow. Both selections pass all three viewer modes at each width (36 refreshed mode checks), including scrolling and Escape/focus return. All eight readers pass the short-height checks again, and all 26 routes/16 viewers pass genuine 200%/400% Chromium tab zoom again. The comparison is rebuilt and its 2100 image references decode. [Thirty Home Services workflow cases pass](docs/design/complete-case-media/home-local-source-30.json) across all five browser configurations without retries or skips. The three asset tests pass, with explicit 1920×8828 source assertions. Decoded-pixel equality normalizes opaque alpha to RGBA and compares SHA-256 hashes of every decoded pixel; this preserves the assertion and avoids a memory-heavy buffer diff. Typecheck, lint and build pass; existing bundle warning remains.

[Full CI run 76](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38126889068) is green on `73df868016f7d6bf551884a05a21eb591ce2bf8c`: 282 Chromium smoke tests, 255 media tests, ten accessibility engine tests, CV, typecheck, lint, build, Prisma generation, API startup, integrity and geometry checks. That run precedes this local-source correction. Final-head CI is rerun and recorded in draft PR 19; it is not predeclared green here.

---

# Mobile case-study media refinement — 10 October 2026

Started from Phase 5 ef76dab47d050ce37641c24e283553758c3d209f on verify/phase-5-readiness after inspecting the branch/tree. Origin still points to that Phase 5 head after refresh. New branch: refine/mobile-case-media. The untracked Codex_Engineered_Landscape_Handoff.md is untouched and excluded from commits. The attached All_Project_Case_Media_Audit.html supplies observations; the pasted request defines scope. Product Design audit captures use genuine assets; no replacement UI artwork or fabricated responsive screens are introduced.

[Self-contained before/after comparison](docs/design/mobile-case-media/comparison.html) · [original/source verification](docs/design/mobile-case-media/current-public-sources.json) · [authored compositions and hashes](docs/design/mobile-case-media/compositions.json) · [phone capture provenance](docs/design/mobile-case-media/phone-captures.json).

## Confirmed cause and implementation

The baseline revalidates all 50 gallery entries and 15 workflow tasks across eight readers. Twelve workflow previews had forced phone 3:2 frames plus cover/transform enlargement up to 3×. Five tall desktop task screens became excerpts through a dimension heuristic. This cut or hid meaningful task areas. Existing captions matched their sources, but appeared after the image. The original inspector fitted width alone: Cedar's small portrait could expand beyond its image-region height.

Retired the shared crop fields, dimension-based excerpt decisions and phone transform/cover rules. The measured, explicit identity manifest now classifies all 50 originals, records task associations and reserves original geometry even for older phone/tablet captures that lacked responsive metadata. Unknown media keeps a safe uncropped fallback. The accepted Collection/gallery cover proportions, sculptures, palette, portrait, motion and AI/CV integrity remain unchanged.

The workflow uses title → explanation → labelled image detail(s) → View full screen, with 16px phone gutters, 12–16px internal spacing and 32px between tasks. The 15 tasks now contain 27 inline frames: 21 authored details, three genuine GameZone phone task captures and three preserved original portrait captures. Authored rectangles retain relevant controls rather than uniformly shrinking entire dashboards. Every detail opens its complete source; phone task views record an explicit complete-source path. The 50 original gallery entries remain selectable.

Fit uses both region dimensions with scale-down; it never enlarges a small original. The responsive sizes hint is also bounded by the measured source width, preventing width descriptors from inflating a small source's CSS intrinsic dimensions on desktop. Separate Fit width / Actual size controls retain scrolling and raw originals. Controls are 48px; safe-area padding, keyboard arrows, Escape, native dialog containment, focus return and the existing finite handoff/reduced-motion behavior remain. Original-image retry now works in the inspector and moves focus into the stable image region before removing its button.

Two additional failures found during verification were repaired without changing motion: at a genuine 400% zoom / 320×234 equivalent, the old short-height header pushed navigation outside the dialog. The compact layout keeps navigation/tools visible and the image region positive; full title/qualification text stays in a keyboard-focusable, scrollable caption region. WebKit pointerdown could focus the reader main, causing the chooser's blur handler to close before click. A scoped internal-pointer guard preserves click delivery, with pointer-up/cancel cleanup and normal outside/keyboard dismissal. The accepted chooser layout is unchanged.

ScreenshotFrame's visibility gate, one-shot 15,000ms deadline, keyed source/retry isolation, cached-image handling, timer cleanup and 220ms/reduced-motion handoff are unchanged. Responsive variants and measured metadata are generated through the existing pipeline; no viewer library or dependency is added.

## Per-project decisions and limits

1. **JobPilot AI — improved:** source/city and country/sort details; saved-role context, original-posting reference and complete workspace tabs; complete voice consent/draft context plus readable start/text actions. Existing public welcome phone captures are retained in the gallery and never substituted for these authenticated tasks. Fine print in the full consent context still needs viewer zoom.
2. **Lobby — improved:** complete code/Join panel; complete invitation dialog including QR, link, Copy/Download/Share; audio context plus readable Start audio/Hide chat actions; complete chat panel/composer. No active conversation is fabricated and no call-quality claim is added.
3. **GameZone — improved:** genuine same-task phone session, device and review views, captured from the deployed frontend with synthetic GET records and a declared demonstration clock. All writes are blocked; final submission is never activated. Date/slot/duration, selected device, price, cash-pending explanation and confirmation control stay visible. Desktop originals and older room-only phone/tablet captures remain distinct gallery evidence. Backend availability, booking/payment outcomes and deployed source revision remain unverified.
4. **Cedar — improved:** project identity/actions/tabs; complete budget and cost tile groups; phase progress/detailed-plan action; posted revenue/expense totals, receivables, complete Profit & Loss tile and Coming soon inventory tile. Full financial originals remain accessible and numbers remain demonstration data. The original 572×768 advisor is complete and bounded in Fit. Public landing phone captures never stand in for financial work.
5. **UniHub — improved within available evidence:** a complete transcript document retains its header, every column label and row, credits/GPA and source demonstration disclaimer. Student registration does not replace transcript evidence. Fine text/columns need Fit width / Actual size on a narrow phone; no academic credential is established.
6. **User Management — preserved and clarified:** complete original portrait registration is clearer than the genuine phone version, whose source password guidance overlaps. Both remain available; no fields or validation context are painted over. This portfolio change does not repair the source application's layout.
7. **Medicare — honest fallback:** public homepage and identity are contained at measured proportions, with consistent complete-image access. The source-based appointment diagram remains; authenticated clinical screenshots are unavailable.
8. **Home Services — preserved:** genuine 390×844 mobile menu keeps its proportions and supplied-design attribution. The entire source fits in the viewer, with width/native modes available for detail.

## Visual evidence and validation

The before build is an isolated checkout of ef76dab; the after build is the compiled refinement. Frozen public GET records make comparisons repeatable, and actual local project assets / unmodified cached remote originals are used. Fresh production GETs confirmed all eight media source lists unchanged and all ten remote original SHA-256 hashes unchanged (HTTP 200). Cached layout checks therefore use the current published originals, but do not promise future CDN uptime.

At 320, 390, 768 and 1363px: 60 workflow task checks / 108 inline-frame observations, 60 complete-source workflow viewer captures, and all 200 original-gallery viewer captures. Every original loads; all default Fit observations stay within their region. Each of the 200 gallery selections was exercised in Fit width, Actual size and Fit (600 mode observations). Gallery thumbnails and accepted covers remain separate from evidence-frame proportions. Complete workflow figures are stitched from native clips inside the reader scroll area; sticky navigation is excluded by capture position, with no product CSS/viewport alteration. Invalid earlier overlay captures were rejected and replaced.

The standalone comparison embeds 704 real before/after captures for all eight projects and all four widths, plus every per-image decision. All 704 embedded images decode and all four width selectors expose the correct eight project sections. It needs no external script/style/image resource. [Comparison validation](docs/design/mobile-case-media/comparison-validation.json).

Genuine Chromium tab zoom was verified through chrome.tabs.setZoom/getZoom at 200% and 400%: 26 route checks and 16 reader-viewer openings. Explicit 320×234 checks across all eight readers keep footer controls inside the viewport and leave a positive image region. At this extreme height the image is necessarily small; width/native modes scroll, and caption text can be scrolled with keyboard or touch. No physical browser chrome, notch or virtual-keyboard result is claimed.

- Typecheck, lint and production build pass. Existing approximately 504KB motion chunk warning remains; no motion code is altered. Main entry gzip is approximately 83.7KB versus 76.7KB baseline; explicit metadata and viewer controls add approximately 7KB. Images remain visibility-gated and responsive; this is a build-size observation, not a new LCP/field-performance claim.
- 19 focused Node tests pass: learning/context/content integrity, source links, attribution/captions and two new independent source-dimension/provenance tests. JavaScript-only API startup and health/projects/profile pass; all three sculpture geometry tests pass.
- 93 affected existing Chromium desktop/tablet/phone tests pass without retries/skips or relaxed deadlines: case stories, chooser, public gallery/form fixtures, assistant accessibility, lazy requests, exact deadline, source changes, original retry and caching. Mock Contact success is a local route fixture, never a production submission.
- The portrait/viewer regression passes in all five configurations (three Chromium configurations, Firefox and emulated phone WebKit), including 320×234, portrait, landscape, all fit modes, control bounds and complete source dimensions.
- The complete 170-case media run passes locally (7.5 minutes), followed by all five configurations passing an additional small-responsive-source regression. The resulting 175-case multi-engine media suite and required GitHub jobs are run for final closeout. Immutable final-head results are recorded in the draft PR closeout; pending CI is not predeclared green in this committed note. The media suite has its own 15-minute job, preserving the original smoke/motion suite and timeouts. No assertion/deadline is loosened. An intermediate same-size fixture incorrectly compared density-rounded intrinsic dimensions and a picture wrapper; those checks now assert measured source geometry and absence of responsive sources. Exact actual-size CSS dimensions avoid fractional DOMRect noise. Pointer-selection and short-height failures led to product fixes. Intermediate results remain separately labelled and are superseded by final runs.

## Remaining gaps

Physical Android portrait signoff remains open: the user's original report is valuable evidence, but no phone model/version or post-change physical result is supplied. Browser emulation is not a substitute for that gate. Physical Safari/iOS, browser chrome/safe areas/keyboards and screen-reader speech remain unverified. Genuine matching phone evidence is unavailable for JobPilot, Lobby, Cedar and UniHub; reviewed authentic details are the documented fallback, and full source zoom remains necessary for fine text. Medicare clinical media and User Management's source-form layout remain source-project gaps.

Keep the previously documented tablet opening instability and Phase 4 motion findings separate. This media change does not claim to repair that historical issue. No merge, manual deployment, live CMS/database change, production Contact enquiry, reservation/payment submission or authenticated source-project operation was performed.

## Every original image decision

| Project / image | Role / measured dimensions | Workflow association | Presentation / complete-source policy |
| --- | --- | --- | --- |
| jobpilot-ai / Resume library and upload | overview; 1900 × 881 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| jobpilot-ai / Discover jobs | overview; 1899 × 877 | Find an opportunity | Authored complete task details; full original remains available. Source and city filters; Country and sort filters. |
| jobpilot-ai / Saved job and application workspace | overview; 1898 × 876 | Keep the application together | Authored complete task details; full original remains available. Saved role and workspace identity; Original posting reference; Overview, application pack and tracking tabs. |
| jobpilot-ai / Live voice interview practice | overview; 1900 × 870 | Prepare the conversation | Authored complete task details; full original remains available. Complete voice consent and draft-status panel; Start voice practice or choose text instead. |
| jobpilot-ai / JobPilot product overview artwork | artwork; 1254 × 1254 | Gallery evidence only | Contained identity/artwork; no workflow claim. |
| jobpilot-ai / Mobile welcome and application workflow | phone; 375 × 1200 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| jobpilot-ai / Tablet application workflow | tablet; 753 × 1200 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| lobby / Screen sharing in an audio room | overview; 1600 × 729 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| lobby / Friends directory | overview; 1920 × 877 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| lobby / Audio room and chat | overview; 1919 × 863 | Keep chat beside the call | Authored complete task details; full original remains available. Audio and chat context; Start audio or hide chat; Complete chat panel and message composer. |
| lobby / Community chat | overview; 1920 × 870 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| lobby / Room invitation and QR code | overview; 1920 × 867 | Share one invitation | Authored complete task details; full original remains available. Complete invitation dialog, QR and sharing actions. |
| lobby / Guest room access | overview; 1920 × 873 | Join a temporary room | Authored complete task details; full original remains available. Invitation code and Join room action. |
| lobby / Mobile welcome and workspace preview | phone; 380 × 1210 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| lobby / Tablet welcome and workspace preview | tablet; 758 × 1100 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| gamezone-arena / Room selection Â· demonstration data | overview; 1920 × 1966 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Session date and time Â· demonstration data | overview; 1920 × 2117 | Choose the session | Genuine same-task phone capture for workflow; complete desktop original retained in gallery. |
| gamezone-arena / Device selection Â· demonstration data | overview; 1920 × 1966 | Choose the devices | Genuine same-task phone capture for workflow; complete desktop original retained in gallery. |
| gamezone-arena / Booking review Â· demonstration data | overview; 1920 × 1966 | Review before confirmation | Genuine same-task phone capture for workflow; complete desktop original retained in gallery. |
| gamezone-arena / Customer bookings dashboard | overview; 1366 × 1446 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Choose a gaming room | overview; 1920 × 3135 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Booking date and time | overview; 1920 × 2287 | Choose the session | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Device selection | overview; 1920 × 1963 | Choose the devices | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Booking confirmation and payment | overview; 1920 × 2059 | Review before confirmation | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Arena administration overview | overview; 1920 × 2076 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Room management | overview; 1920 × 1918 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / User management | overview; 1920 × 916 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Arena landing page | overview; 1600 × 741 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| gamezone-arena / Mobile gaming rooms | phone; 380 × 1200 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| gamezone-arena / Tablet gaming rooms | tablet; 758 × 1200 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| construction-project-management-accounting-system / Construction portfolio overview | overview; 1904 × 879 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| construction-project-management-accounting-system / Project details and operations | overview; 1920 × 2333 | Read the project together | Authored complete task details; full original remains available. Project identity, actions and section tabs; Contract value and approved budget; Actual cost and forecast profit; Complete phase progress and detailed-plan action. |
| construction-project-management-accounting-system / Financial reports | overview; 1920 × 1760 | Inspect the posted results | Authored complete task details; full original remains available. Posted revenue and expense totals; Outstanding receivables from unpaid invoices; Complete Profit & Loss report tile; Inventory valuation remains Coming soon. |
| construction-project-management-accounting-system / AI project risk and forecast advisor | task; 572 × 768 | Explain a calculated estimate | Uncropped original at measured proportions; use viewer for fine detail. |
| construction-project-management-accounting-system / Cedar public landing page | overview; 1897 × 880 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| construction-project-management-accounting-system / Mobile public landing page | phone; 375 × 1100 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| construction-project-management-accounting-system / Tablet public landing page | tablet; 753 × 1200 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| unihub / Student dashboard | overview; 1911 × 906 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| unihub / Administration dashboard | overview; 1919 × 918 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| unihub / Professor course catalog | overview; 1905 × 901 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| unihub / Student academic transcript | document; 1914 × 896 | Bring courses and grades together | Authored complete task details; full original remains available. Complete demonstration transcript document. |
| unihub / Mobile student registration | phone; 390 × 844 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| unihub / Tablet sign in | tablet; 768 × 1024 | Gallery evidence only | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| full-stack-user-management-system / Public platform statistics | overview; 1920 × 877 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| full-stack-user-management-system / Public registration form Â· portrait capture | task; 1040 × 1688 | Registration is a client operation | Uncropped original at measured proportions; use viewer for fine detail. |
| full-stack-user-management-system / Mobile registration | phone; 343 × 654 | Registration is a client operation | Complete authentic capture; no forced desktop proportions or workflow substitution. |
| medicare-hub / Public Medicare Hub homepage | overview; 1920 × 1319 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| medicare-hub / Medicare project identity | artwork; 1000 × 1000 | Gallery evidence only | Contained identity/artwork; no workflow claim. |
| home-services / Home services landing page | overview; 1348 × 926 | Gallery evidence only | Uncropped original at measured proportions; use viewer for fine detail. |
| home-services / Mobile navigation on the public demonstration page | phone; 390 × 844 | A mobile navigation sidebar | Complete authentic capture; no forced desktop proportions or workflow substitution. |

## Changed files

Runtime: CaseNarrative.tsx / case-narrative.css, ProjectReader.tsx, CaseGallery.tsx / case-gallery.css, CaseMediaNav.tsx, case-media.css, project-detail-screens.ts, generated case-media.ts / project-images.ts, and removal of unused shared case-study crop fields. ScreenshotFrame, ResponsiveProjectImage, Collection/portrait/sculpture/motion implementations, backend protections, learning policy, CV geometry and fixtures are preserved.

Regression/CI: case-media-assets.test.mjs, mobile-case-media.spec.ts, focused asset/first-focus updates in case-media.spec.ts / case-study.spec.ts / readiness.spec.ts, playwright.media.config.ts, scoped testIgnore in the base config, and an additional media job in ci.yml. Existing smoke assertions remain owned by the original verify job.

Assets/tooling/evidence: public/projects/case-media (21 authored detail masters, six phone full/task masters and responsive variants), prepare-case-media.mjs, capture-case-media-phone.mjs, review-case-media.mjs, build-case-media-comparison.mjs, this QA section, and docs/design/mobile-case-media (actual captures, standalone comparison, manifests/provenance, zoom and regression evidence). Build output, generated Prisma clients, local cached API records and the user's handoff are excluded.

---

# Phase 5: final validation — 10 October 2026

Started on approved Phase 4 `de9f6657903c4e308ea4e3887f23cebc59fdb056` after checking branch/tree, refreshing origin and checking newer commits. Branch: `verify/phase-5-readiness`. The user's untracked handoff is untouched. Read the Phase 1–4 QA and evidence before testing. The Product Design audit used fresh captures; the accepted composition, portrait, palette, gallery, captions, motion and integrity rules are preserved. Draft review targets `refine/phase-4-signature-motion`. Implementation/final SHA, draft PR URL and immutable final-head CI are recorded in the PR closeout returned with this review; the committed matrix does not predeclare a pending workflow green.

[Evidence viewer](docs/design/phase5/review.html) · [machine-readable matrix](docs/design/phase5/validation-matrix.json) · [environment](docs/design/phase5/environment.json) · [physical-device checklist](docs/design/phase5/device-checklist.md).

## Decision and evidence boundaries

**Blocked for production closeout by named defects in the deployed build:** the tailored CV overlaps its Experience heading; inspector Tab can reach the body; an async Contact link can be unnamed; one engineering URL uses unencoded brackets; and Job Match can mistake absent qualification evidence for an unearned qualification. The branch repairs these defects within verified local coverage. Release/promotion remains a separate authorized action; no merge/manual deployment is performed. An interrupted production Cedar answer recovered once; two local upstream provider 503s remain observed service failures, with useful errors. Finite successful samples do not guarantee provider availability or future reasoning.

Physical Android is **not** signed off. The user reports clear landscape presentation but partial case-study imagery in portrait, without a specific image/model/version. Every selectable image was checked locally at all four requested widths; normal overviews use contain, while long cropped screens are explicitly labelled excerpts with complete originals in Enlarge. Full phone screenshots can extend below a single viewport and require page scrolling. No unintended crop was reproduced in local coverage. This does not resolve the user's physical observation by assumption. iPhone/iPad, desktop Safari, real browser chrome/safe areas/keyboards, spoken screen-reader behavior, mail delivery and field performance remain open.

Production revision is identified by [GitHub deployment metadata](docs/design/phase5/deployment.json): successful Vercel Production deployment `6981103025`, created `2026-10-10T12:59:43Z`, for approved `de9f665`. The production alias's initial JS/CSS/engine filenames matched the compiled approved build. This is deployment metadata plus fingerprint corroboration, not a SHA returned by the runtime itself. Production observations below are from that older deployed build, not the repaired branch.

## Confirmed causes and repairs

1. **Conversation announcements:** the complete message history used `aria-live=polite` with additions/text while partial Markdown replaced the current response. A single persistent status outside the busy transcript now announces progress/completion or the current error. The transcript remains normally readable, without repeatedly publishing prior/partial answers as live updates. Streaming whitespace, cancellation, 55-second deadline, retry, context and evidence links remain.
2. **Async unnamed links:** Contact rendered an empty `mailto:` before profile resolution, and its Job Match promotion could lack text before CMS resolution. Render the email link only with an address; preserve a meaningful Job Match link name while optional copy is pending. No form layout/payload/security change.
3. **Inspector focus wrap:** actual-media Tab traversal reached the document body with the native dialog still open. Scope forward/reverse wrapping to visible enabled controls in the inspector; preserve image-region arrow scrolling, screenshot arrows, native Escape, exit motion and trigger restoration. The pre-fix observation and new boundary regression are retained.
4. **Skip link in WebKit:** default Windows WebKit keyboard navigation skipped the implicit link. A minimal browser probe reproduced this independently; explicit `tabIndex=0` makes ordinary Tab reach Skip to content. The original main-focus assertion remains across all engines. An exploratory Option-Tab attempt did not repair the behavior; the product fix passes plain Tab.
5. **Tailored PDF overlap:** a genuine 628-character provider summary required more lines than the fixed reference reserved, but Experience still began at 162.33pt. The generator measures its real paragraph bottom and shifts subsequent sections only for overflow. Standard three-line anchors, APPLICATION geometry constant, typography, reference fixture and 2pt/1pt/1pt tolerances remain unchanged. The downloaded production PDF fails an independent rendered-text-box assertion; the corrected local generator with the same real summary passes. A separate long-summary regression checks preserved text, section separation, Letter bounds and Carlito, and master remains A4/Source Sans.
6. **Engineering link encoding:** GameZone's immutable `bookings/[id]/approve-cash/route.ts` link returned anonymous HEAD 404; the percent-encoded version and raw source returned 200. Encode each repository path segment in the shared source builder. The same sources serve readers and AI context. Existing revision/content/attribution remain. All 20 public references now resolve; three JobPilot private references remain explicitly access-limited.
7. **Unknown versus unearned:** production Job Match wrote “no formal AWS vendor certification is earned or documented.” Missing verification does not establish that nothing was earned. The shared instruction already prohibited positive completion inference; it now prohibits negative factual inference too. All four outgoing assistant/Job Match JSON/SSE paths assert that policy. One genuine corrected local answer preserved “unknown”; two other local calls hit upstream 503/API 502 and are not counted as successful reasoning checks. No canned question-specific answer, CMS update or date/credential fact is introduced.

## Validation matrix

Each status belongs to its stated environment. The final-head CI row is superseded only by immutable CI evidence in the PR closeout.

| Check | Result | Environment and evidence |
| --- | --- | --- |
| Production revision | **passed** | GitHub successful Vercel Production deployment for de9f665; alias asset fingerprint corroborates the approved build · [evidence](docs/design/phase5/deployment.json) |
| Public routes and eight readers | **passed** | Actual production: 26 route/width scans; live list/profile/site GETs, detail counters intercepted · [evidence](docs/design/phase5/production-chromium/findings.json) |
| Current public layouts and axe scan | **passed** | Local compiled build: Chromium, Firefox and WebKit; 234 route/size scans, zero detected violations/errors · [evidence](docs/design/phase5/final-chromium/findings.json) |
| All selectable project images | **passed** | Actual assets: 50 images × four widths = 200 decoded/framed observations; not synthetic pixels · [evidence](docs/design/phase5/media-review/findings.json) |
| Inspector/media/disclosures | **passed** | Local actual-media: all eight readers × desktop/390px × three engines = 48 reader walkthroughs · [evidence](docs/design/phase5/interactions-chromium/findings.json) |
| Production inspector focus wrap | **failed** | Actual production native Tab reaches the body while dialog remains open; corrected local wrap passes · [evidence](docs/design/phase5/production-interactions-chromium/findings.json) |
| Async link names / streaming announcements / skip link | **passed** | Corrected local DOM and fixture regressions across Chromium, Firefox and WebKit; spoken reader behavior not verified · [evidence](docs/design/phase5/local-browser-compiled.json) |
| Production transient Contact link name | **failed** | Actual production capture found an empty mailto link while profile was pending; corrected branch guards it · [evidence](docs/design/phase5/production-chromium/findings.json) |
| Collection motion and bounded cleanup | **passed** | Local actual Intel UHD/ANGLE D3D11: all three × four widths, 12 recordings and isolated timings; zero idle draws · [evidence](docs/design/phase5/motion/after/timings.json) |
| Reduced motion / unsupported WebGL | **passed** | Native preference and controlled fallback separately; fallback is simulated, not phone-GPU proof · [evidence](docs/design/phase5/motion/fallback/findings.json) |
| Visibility gate and stalled-request deadline | **passed** | Real assets wait 16s offscreen then load; fixture regressions retain exact 14,999/15,000ms and original retry · [evidence](docs/design/phase5/resilience/findings.json) |
| Resize, landscape and focused fields | **passed** | Local three-engine reduced viewport/resize observations; actual keyboard/chrome behavior remains open · [evidence](docs/design/phase5/interactions-webkit/findings.json) |
| 200% and 400% browser zoom | **passed** | Genuine isolated Chromium tab zoom via tabs.setZoom/getZoom; 26 routes at 640/320 CSS px · [evidence](docs/design/phase5/zoom/findings.json) |
| Initial performance and image/JS transfer | **passed** | Separate local/production lab runs: three HTTP-cold/warm pairs per route; no production throttling · [evidence](docs/design/phase5/performance/navigation.json) |
| AWS/Digital Hub uncertainty and team attribution | **passed** | Actual production genuine AWS/Digital Hub/Lobby samples retain status and team boundaries; finite sample only · [evidence](docs/design/phase5/production-provider/findings.json) |
| AI initial Cedar response | **failed** | Actual production SSE interrupted; one bounded fresh attempt recovered successfully, failure retained · [evidence](docs/design/phase5/production-provider/findings.json) |
| Job Match negative qualification inference | **failed** | Actual production report asserted no formal AWS certification was earned; shared policy repaired locally · [evidence](docs/design/phase5/production-provider/findings.json) |
| Corrected qualification policy | **passed** | Outgoing JSON/SSE context regressions + one genuine local answer preserves unknown versus unearned · [evidence](docs/design/phase5/local-provider/findings.json) |
| Current local provider availability | **failed** | Two of three bounded local provider calls returned upstream 503/API 502; not mocked, no overload/retry loop · [evidence](docs/design/phase5/local-provider/findings.json) |
| Standard CV download/font/content | **passed** | Actual production download: one Letter page, Carlito, 10 links, neutral training and co-developed attribution · [evidence](docs/design/phase5/production-provider/pdf-inspection.json) |
| Production tailored CV readability | **failed** | Actual genuine-provider download overlaps summary and Experience; repaired local render passes · [evidence](docs/design/phase5/production-provider/overlap-regression.json) |
| Repaired CV / unchanged reference | **passed** | Static local generator; same real provider summary + long fixture; Letter/Carlito, A4/Source Sans master and strict reference · [evidence](docs/design/phase5/local-cv/provenance.json) |
| Public engineering evidence links | **passed** | 19 direct public HEAD successes; one original bracket path 404 repaired with segment encoding/200; three private links remain access-limited · [evidence](docs/design/phase5/source-links.json) |
| Android physical portrait/keyboard | **unverified** | User reports clear landscape and partial case-study imagery in portrait; model/version/specific image and keyboard results unavailable · [evidence](docs/design/phase5/device-checklist.md) |
| Physical iPhone/iPad and desktop Safari | **unverified** | Unavailable; automated Windows WebKit is separately verified and does not close these gates · [evidence](docs/design/phase5/device-checklist.md) |
| Screen reader spoken walkthrough | **unverified** | No connected reader audio/control walkthrough; DOM live-region tests do not prove speech · [evidence](docs/design/phase5/device-checklist.md) |
| Production Contact delivery | **unverified** | No authorized test destination or external mail; local fixture payload/client path checks passed · [evidence](docs/design/phase5/device-checklist.md) |
| Production INP/phone GPU/sustained CDN reliability | **unverified** | No field dataset, physical GPU measurement or prolonged CDN study; bounded probes are not reliability guarantees · [evidence](docs/design/phase5/device-checklist.md) |
| Final-head complete CI | **unverified** | Pending at this evidence commit; immutable final-head result is recorded in draft PR closeout, without another documentation-only commit · [evidence](docs/design/phase5/validation-matrix.json) |

## Fresh visual, keyboard and media evidence

Chromium, Firefox and Windows WebKit each captured Collection, Projects, all eight readers, Profile, Contact and Job Match at 1363×936, 1024×1366, 390×844, 320×844, 844×390 and 640×468: **234 current scans**, zero detected axe violations and no page exceptions. Axe 4.13 checks WCAG A/AA including 2.2 targets; incomplete background-contrast findings are retained. This is no claim of complete accessibility compliance. Portrait and normal text/control framing were visually inspected; known image-background text needs human/device confirmation beyond an automated contrast result. Navigation remains the accepted visible links at narrow sizes; the portfolio does not have a hidden hamburger to certify.

Collection's narrow `main.scrollWidth` includes deliberately clipped sculpture geometry. The recorded main width flag is false at some sizes, while document width stays within the viewport and the clipped stage does not provide horizontal user scrolling. This is not relabelled as a repaired overflow defect or used to remove accepted artwork. Other reading surfaces and real 200%/400% zoom retain page reflow.

The all-image audit records **200** decoded current-image/size observations using real local media and unmodified cached public PNG bytes. Inspector/selection/workflow/disclosure walkthroughs cover **48 reader/width/engine combinations**, including focus containment, actual-size region scrolling, arrow navigation, Escape/trigger return, reserved workflow heights and captions. Individual narrow overviews for all eight readers, explicit GameZone/Cedar excerpt labels, Home's complete phone capture and representative desktop/320px/inspector/portrait frames were inspected. The full artifact set is linked in the viewer. Actual-size mode intentionally shows a scrollable portion of the original rather than shrinking it; Fit width is separately available.

Bounded production checks include 26 route captures and JobPilot/GameZone media/inspector selection and workflow checks at desktop/390px. Public list/profile/site responses and actual CDN images are live. Detail counters are intercepted from the current public list for these visual checks. Navigation performance uses ordinary live public GETs separately. No production Contact submission or authenticated linked-project operation occurs.

Local actual-image resilience waits **16 real seconds** at each JobPilot/GameZone introduction: the later frame remains unrequested/loading, then becomes ready on eligibility at identical 228.8125px height. Synthetic regression requests/clocks separately verify offscreen waiting, genuine errors/stalls, original retry, cached readiness and source/attempt retirement at the unchanged **15,000ms** request deadline. Local 150ms latency/1.6Mbps down/CPU 4× preserves immediately usable selection content and interrupted return; production services are not stressed. Native reduced motion and six controlled unsupported-WebGL recordings are separate from actual GPU qualification.

The user's Android report and unavailable Safari/reader sessions remain separate from emulated viewports. The checklist specifies expected results and required device/browser versions; viewport reduction proves neither keyboard behavior nor safe-area/browser-chrome correctness. Contact payload, pending/error/success/client validation are intercepted local fixtures; actual mail delivery is unverified.

## Lab performance and motion

[Navigation samples](docs/design/phase5/performance/navigation.json): **three cold/warm pairs per route/environment**, Collection and JobPilot; Windows desktop Chrome at 390px, unthrottled, native reduced motion, four-second observation. Cold means fresh browser HTTP cache, not cold Vercel/CDN/OS/GPU caches. Local API fetches use a frozen public snapshot and exclude backend latency; production uses actual public GETs. These are separate lab LCP/non-input shift observations, not production INP/real-user field data or a Lighthouse/device guarantee.

| Route/environment | Cold LCP, three samples (ms) | Warm LCP, three samples (ms) | Cold total bytes |
| --- | --- | --- | --- |
| Local Collection | 360 / 328 / 276 | 148 / 148 / 156 | 1,183,045 |
| Production Collection | 1616 / 1520 / 2820 | 476 / 820 / 472 | 1,213,292–1,213,336 |
| Local JobPilot | 268 / 276 / 268 | 112 / 100 / 132 | 614,026–614,139 |
| Production JobPilot | 1088 / 1252 / 1132 | 268 / 332 / 284 | 648,093–648,364 |

Collection image encoded bodies total **767,498 bytes** in cold runs; module-preloaded JS must be included, not just resources whose initiator says script. Local initial JS encoded bodies total approximately **245KB**; production approximately **260KB** including analytics. Three.js is absent in all initial Collection/reader samples and loads only after selection/module warming. The existing lazy engine remains approximately **504KB minified / 127KB build-reported gzip**. Warm same-context navigations reuse most bytes. Shift sums stay below 0.0015 in these four-second samples; these are bounded observations, not an unrestricted CLS study. No evidence justifies blanket asset recompression, reduced artwork quality or changed choreography; retained costs and the single slower cold production sample remain visible.

[Isolated motion timings](docs/design/phase5/performance/motion-summary.json): real Intel UHD 0x9A60 / ANGLE Direct3D11, no video/screenshots or other browser tests during sampling. Twelve sequences measured acknowledgement **27–48ms**, opening **981–990ms**, and return-to-actual-focus **570–582ms**. RAF-gap p95 across the sequence is **16.7–16.8ms**; initialization includes a cold maximum gap of approximately **500ms**, which must not be hidden by quoting only the p95. These are observed browser frame gaps, not GPU timer queries or phone animation budgets. Every settled 500ms sample recorded **zero draws**, and return/unmount disposed the canvas. Twelve fresh actual-GPU recordings include interruption/repeated Escape; six fallback recordings are labelled controlled. No motion source/choreography/renderer coverage or deadline is relaxed. The historical tablet instability and Phase 4 clock diagnosis remain in the previous section; this phase does not claim a new universal tablet repair.

## Regression and CI evidence

Local typecheck, lint, production build, API package startup, **17 integrity tests**, **3 geometry tests**, static CV/master/reference tests and rendered overflow regression passed. **45 readiness/lazy-media browser tests** and **10 additional Firefox/WebKit readiness tests** passed without retries/skips/flakies. The existing public/Collection/AI/Contact/Job Match regressions passed **66/66** against the compiled build without changing assertions/deadlines.

The first 66-test development run was **58 passed / 8 failed** and remains in [its report](docs/design/phase5/local-browser-development.json), rather than counted green. Traces show repeated full document navigations and new Vite connections clearing fixture application state during concurrent capture/artifact work. The exact reload trigger was not isolated. After all capture browsers stopped, the same 66 tests on the compiled production preview passed **66/66**; [compiled report](docs/design/phase5/local-browser-compiled.json). Raw failed traces are retained locally. Earlier development-only setup failures (blank fixture CMS promotion, a profile fixture missing phone, ES2023 findLast on this ES2022 target, and the uncorrected WebKit skip-link behavior) were corrected; no existing timeout, retry setting or meaningful assertion was weakened. Exploratory zoom comparison used exact floating equality for 4.0 and included browser-window chrome; the final real tab zoom uses floating precision and an explicit 1280px content viewport, producing actual 640/320 CSS px.

Complete final-head CI is recorded in the draft PR closeout after this commit. The original verification job keeps clean frontend/server installs, explicit server Prisma generation, typecheck/lint/build, API startup, integrity/geometry and the complete Chromium desktop/tablet/mobile suite with its existing one-worker/retry/deadline configuration. Separate jobs add Firefox/WebKit readiness and static CV/reference/overflow checks (PyMuPDF 1.26.4); no migration or database action is required. The result belongs to the exact final SHA and is not inferred from Phase 4's earlier green CI.

## Changed files and remaining gates

Product: `src/components/landscape/{Assistant,Layout}.tsx`, `src/components/CaseGallery.tsx`, `src/sections/ContactSection.tsx`, `server/src/lib/{cv,evidence-instructions}.js`, `shared/case-study-runtime.js`. Regression/CI: `tests/e2e/readiness.spec.ts`, `tests/case-study.test.mjs`, `server/test/learning-context-routes.test.mjs`, `server/scripts/test-cv-overflow.mjs`, `scripts/verify-cv-overflow.py`, `playwright.cross-browser.config.ts`, `.github/workflows/ci.yml`, package manifest/lock with the dev-only axe runner. Review support: `scripts/review-phase{3-media,4-motion}.mjs` optional Phase 5 destinations, the new Phase 5 review/provider/resilience/CV/zoom/performance/viewer helpers, this QA entry and intended screenshots/recordings/JSON/PDF artifacts under `docs/design/phase5/`. Generated builds/dependency clients and the user's handoff are excluded.

Open: physical Android portrait report and real keyboard/browser chrome, iPhone/iPad/desktop Safari, spoken screen-reader traversal, physical GPU budgets, field INP, prolonged CDN/offline reliability, private project-source access and production Contact delivery. Provider interruption/503 observations are service gaps, not relabelled as successes. Deployment of these repairs is outside this task. No merge, manual deployment, production enquiry/external email, CMS/database edits, migrations, authenticated linked-project actions, bookings/payments or further design phase.

---

# Phase 4: signature motion — 10 October 2026

Branch `refine/phase-4-signature-motion` starts at approved `66bba231335c391117dda39209301759925a5b90` / draft #15. Refreshed origin and checked branch/tree first; the user's untracked handoff remains untouched. No newer tracked work was present. Phase 1–3 integrity, media loading deadlines and accepted design are preserved.

[Draft PR #16](https://github.com/MahmoudAbdulGhani/Portfolio/pull/16) targets `fix/phase-3-lazy-image-lifecycle` at the approved base. Main implementation: `083a990de96bbce923964fd5d8520119438c05a1`. The final head also includes the fallback overlap correction and this CI closeout.

## Opening diagnosis before choreography changes

An isolated approved checkout and the current checkout used the same installed Chrome, 1024×1366 touch viewport, dependencies, one browser worker, cold contexts, service fixtures and original deadlines. The unchanged slow/failed screenshot test passed **3/3** in each ordinary hardware-GPU run. Current captures identify **Intel UHD Graphics via ANGLE/Direct3D11**, rather than inferring hardware from the word WebGL. These healthy observations do not erase the historical failures.

The confirmed application failure mechanism is **UI readiness coupled to GSAP's lag-smoothed animation clock**. The installed GSAP code and [primary documentation](https://gsap.com/docs/v3/GSAP/gsap.ticker/#gsaptickerlagsmoothing) show that a frame gap above 500ms counts as 33ms. Both mesh and DOM timelines used that global clock, and project controls remained inert until timeline `onComplete`. Long frames could therefore extend a nominal 2.25-second opening beyond the unchanged five-second readiness deadline. Resource readiness and the opening itself were measured separately.

Controlled evidence: six explicitly injected **650ms** frame stalls on the real Intel WebGL renderer reproduced the deadline failure **3/3** on approved code and **3/3** on current, with no forced fallback or retry. Opening-to-interactive measured **5.96–5.97s**; at the five-second observation the page was still `opening` and controls inert. This is a reproducible stress fixture, not a claim that those precise stalls occurred in production. Exploratory supported SwiftShader WebGL observations separately measured long frame gaps around 2.1–2.3s and ordinary openings around 4.53s; software rendering is not hardware-GPU proof. The exact environmental trigger in the older October 9 failures cannot be reconstructed because those traces did not record GPU identity or frame timings.

The first correction keeps the original choreography/durations unchanged and advances only each finite GSAP timeline from `performance.now()`. A scoped frame/deadline owner handles completion, interruption and cleanup independently of a decorative GSAP callback; global ticker settings remain untouched. The same six-stall experiment then passed **3/3**, settling in **2.65–2.66s** with controls usable at five seconds. The first focused regression uses supported WebGL and retains the existing five-second assertion. This demonstrates the elapsed-time correction before any faster Phase 4 tuning can influence the result.

Evidence: `docs/design/phase4/diagnosis/{baseline,current}-original-test.json`, `{baseline,current}-frame-stalls.json`, `clock-fix-frame-stalls.json`; local raw traces remain ignored. Ordinary timing runs, software-renderer probes and controlled long-frame tests are distinct. An initial warm-browser exploration and interrupted/contended diagnostic attempts are excluded from the matched evidence.

The Product Design audit captured all three accepted sculptures on actual Intel WebGL at **1363×936, 1024×1366, 390×844 and 320×844**, using a frozen public GET snapshot, real local sculpture/project media and hash-verified original PNGs. Writes and project view-counter routes were intercepted. **12 before recordings and 60 sequence screenshots** include idle → opening → active → reverse → restored focus, saved in `docs/design/phase4/before/`. Actual screenshots were inspected before refining choreography. Confirmed defects: brief ghosted photo/mesh substitution, visibly different closed silhouettes and roughly 1.55-second GPU return. Opening and return work in these unstressed observations; the three mechanisms remain distinct. The temporary baseline checkout was safely removed after head/path/status validation and unlinking its shared dependency junction; shared dependencies remain intact. An initial lint attempt encountered that temporary nested checkout's duplicate config roots; standard lint is rerun after removing it.

The clock-only correction is independently reviewable in commit `4497f0a`, before choreography tuning.

## Final motion and interaction behavior

Each keyed collection scene owns one explicit `idle → selecting → opening → active → closing` store, with separate renderer readiness/fallback and native preference fields. The first selection wins rapid clicks. A finite elapsed-time owner drives the existing paused GSAP timeline; that timeline sends poses to the paused mesh timeline. There is one opening clock, no competing engine loop. Project title, controls and case-study navigation are usable and focused immediately, independently of image decode, shader initialization and decorative completion. Late imagery, failed engine imports and WebGL context loss retain usable content and a photographic handoff. Changing previews before the first asset finishes cannot strand the opening; retired decode promises cannot erase a newer preview's failure.

Escape/Close reverses the current pose over 560ms and restores the original collection position/focus once. Source/route replacement, Back and unmount retire obsolete clocks and renderers. Back from a reader restores the selected photographic view without replaying its opening. The shared route-restoration hook records both the window and the actual inner reading surface per history entry; hashes deliberately take priority. It cancels observers, pending frames and the existing bounded asynchronous-content wait on retirement. No normal scrolling is intercepted.

JobPilot keeps its attached panel fan, Lobby its ribbon articulation and Cedar its beam assembly. Hinges now meet physical supports; Lobby pivots around its rods and Cedar around its lower bolts. Cedar depth layers leave over 0.015 units clearance rather than intersecting. Existing 0.035-unit panel thickness, closed skins and rims remain. Camera/assembly placement fits the unchanged photograph's opaque subject bounds and the opened mesh to the reserved project frame; movement uses controlled acceleration/deceleration rather than an abrupt scale substitution. Main articulation is 820ms; a 240ms opacity handoff overlaps it, with the full opening ending at 980ms. The returned photograph dissolves from the reverse pose. Idle objects remain still; hover/focus only warms the lazy module and applies existing emphasis.

Supporting motion is scoped: existing emphasis 160ms; image selection crossfade 220ms while retaining the last ready image; inspector entry/exit 220ms; native disclosure height/opacity 220ms with explicit expanded state, inert closing content and final auto height. Reader captions and enlargement follow the last actually loaded image while a replacement is pending. Inspector teardown handles repeated non-cancelable native Escape requests and restores scroll/focus synchronously. The portrait and its treatment are unchanged; its major group and the record group each enter once per mount at 14px/280ms. Native preference changes finish this entry without replay when motion is re-enabled. Contact/Job Match forms have no entry reveal; brief opacity status changes preserve all existing validation, announcements, streaming, cancellation, retry, evidence and CV contracts. Streaming text receives no character animation.

Reduced motion is read natively on the first render and on OS changes. Reduced/restored selections retire GPU work without replay when the preference is disabled. Engine loading stays lazy; phone density is capped at 1.25 and desktop at 1.5. There is no autonomous render loop: only pose, resize and visibility changes render. Disposal owns observers, listeners, model/environment geometry/materials, shadow targets, timelines and context loss. No dependency was added.

The Phase 3 image gate, per-attempt isolation, genuine errors, raw-original retry and **15,000ms request deadline** remain. Offscreen URLs stay absent until eligibility; eligible requests still start immediately. Crossfade cleanup has its own short timer and does not restart the request deadline.

## Actual media, sequence and performance evidence

[Before/after review with local video links](docs/design/phase4/review.html). Twelve before and twelve after recordings cover all three sculptures at all four widths. After recordings include a second, interrupted opening and repeated Escape. Sequence screenshots include idle, articulation, active, reverse and restored focus. The public GET snapshot and SHA-256-verified original PNG cache are distinct from synthetic regression services/pixels. Actual local photographs/project assets are served unchanged; writes and view counters are blocked. Every recorded opening used **Intel UHD Graphics / ANGLE Direct3D11**; none was substituted with fallback. The separate fallback/context-loss cases are controlled tests.

Whole-video 64-frame strips were visually inspected for every sculpture's desktop before/after and 320px after sequences. They show distinct articulation, continuous reverse from the current pose, an opacity handoff inside stable media bounds and restored stationary artwork/focus. The image does not grow during handoff, and no blank selection interval was observed in these samples. The caption/actions retain their foreground layer while the mesh travels behind them. Supporting screenshots inspected include desktop/tablet Profile, the complete JobPilot desktop inspector and GameZone's 390px inspector with its demonstration qualification.

[Final timings without video/screenshot work](docs/design/phase4/after/timings.json) record the next rendered selection frame and the actual collection `focusin` event, rather than the time a later Playwright assertion notices focus. Across all twelve actual-GPU observations: acknowledgement **31–47ms**, input-to-opening including assets/renderer **215–584ms**, opening **981–995ms**, closing-to-restored-focus **570–583ms**, and **zero draws during the settled 500ms observation**. Startup includes local asset/module/renderer work and later driver-cache warming; it is not a CDN or physical-phone benchmark. Recorded settled frame dimensions and the **24px caption gap** match the approved before geometry, with no horizontal overflow, page exceptions or write attempts. Earlier recording-loop focus observations included screenshot/automation latency, particularly on narrow viewports; the direct event timings are the return measurement.

[Retained-effects probe](docs/design/phase4/effects-cost.json): three alternating diagnostic CSS pairs at 1363px and 390px, after excluded warm-up, on the same Intel renderer. No product style is changed by the probe. Opening main-thread task medians with/without existing static shadows: **132.7/130.4ms** desktop and **129.8/112.5ms** narrow, spread across the opening. Opening layout work is approximately **0.15ms** total; frame-gap p95 **16.7–16.8ms**. Inspector entry+exit task medians with/without its static 8px backdrop blur are **122.0/121.1ms** desktop and **111.7/141.3ms** narrow, showing sample/cache variance rather than a portable blur cost. Disclosure open+close layout totals are **7.5–8.7ms** with retained styles. These are browser main-thread counters and observed frame gaps, not GPU timer queries. Static accepted effects and the bounded shadow pass remain; no animated blur/filter/shadow or new post-processing pass was introduced. Mobile tessellation and shadow-map size are bounded; PMREM intermediates are disposed immediately after initialization.

[Supporting-page findings](docs/design/phase4/supporting-pages/findings.json), four walkthrough recordings and screenshots cover Profile/Capabilities, Projects, JobPilot, GameZone, Contact, Job Match and reduced motion at every requested width. Each reader review waits **16 real seconds** at its introduction, then loads all workflows with identical before/after frame heights. Selection, inspector Arrow navigation/actual size/Escape/focus, disclosure expanded state and immediately editable forms passed. Zero unavailable messages, page exceptions, horizontal overflow or write attempts occurred. The records identify whether a given last workflow was genuinely outside eligibility during the introduction. GameZone's demonstration-data notice and the learning/team qualifications remain visible. Provider responses are tested separately with contract fixtures; no live provider or Contact operation is performed for this visual review.

## Regression and validation record

Sixteen signature-motion cases per browser cover the diagnosed long-frame deadline, delayed-asset navigation/cancellation, rapid selection, route replacement, preview replacement before readiness, retired decode rejection, partial reverse/double close, Back, first/later reduced-motion preferences, context loss, failed lazy engine, held image/caption handoff, native inspector interruption/unmount, disclosure interruption, touch/bounded density/no idle draws, reading/hash restoration and once-per-entry Profile groups. Tests use controlled requests and clock controls where appropriate. Node geometry tests separately check manifold skins/rims, finite vertices, attached hinges/distinct mechanisms and Cedar clearance; they do not substitute for GPU observation.

Local validation: typecheck, lint, production build, API package startup, **16 integrity tests**, **3 geometry tests**, **45 signature tests**, **3 additional Profile-entry tests** and **21 affected portrait tests** passed. No retries/skips/flakies in those browser runs. Immutable local reports are saved in `docs/design/phase4/`. The first complete local run passed **257/258**; the new hash test assumed a desktop header's absolute screen position and failed on the correct 125px mobile header. It now checks alignment with the actual scrolling surface, with the same one-pixel tolerance at all widths. The corrected case passed in the final 45-test run. A deliberately rejected retired decode first reproduced the erased-error bug; its pre-fix failure and final passing regression are recorded separately.

Existing opening startup/readiness thresholds and renderer coverage are preserved, including the five-second settled assertion. The existing fallback test now asserts that essential content stays usable during handoff, while retaining image readiness/visibility, geometry and caption-position checks; the slow-image case asserts immediate content readiness/focus rather than expecting controls to remain inert. This is the requested user-experience signal, not a relaxed animation deadline. Active-image locators are scoped to the current attempt so the deliberately retained previous layer cannot create ambiguous matches. Native cached loading, source/retry isolation and exact 14,999/15,000ms deadline tests remain. The build retains its existing large lazy-engine chunk advisory.

Complete [GitHub CI #71](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38051924009) **passed** on implementation `083a990`: clean frontend/server installs, explicit server Prisma generation, typecheck, lint, production build, JavaScript-only API startup, **16 integrity tests**, **3 geometry tests** and **264 browser tests**. Ubuntu / Node **22.23.3**, job `114212613464`; browser execution **9.6m**, summary `2026-10-10T12:36:42.4915701Z`, with no failures, retries, skips or flaky results. Failure-artifact upload was correctly skipped. [Immutable CI evidence](docs/design/phase4/ci-run-71.json). Prisma generates code without migrating a database. Final-head CI, including the last fallback correction below, is recorded in draft PR #16 to avoid another documentation/CI commit loop.

Final handoff review identified an **80ms photographic-fallback gap**: without a mesh, the photo faded out at 600ms and the ready preview started at 680ms. The existing fallback test was strengthened to sample both visible layers and reproduced that blank interval before the fix. The photo now fades from 680–800ms while the preview fades from 680–920ms, preserving the opening duration, all existing assertions and deadlines. Supported WebGL timing/recordings are unchanged. Typecheck, lint and build were rerun successfully; **nine affected fallback/slow-image/Escape tests** passed across all three configurations. Separate pre-fix and passing reports are committed.

[Six actual-media fallback observations](docs/design/phase4/fallback/findings.json) and recordings cover every sculpture at 1363px and 390px. Unsupported WebGL is deliberately simulated at `getContext`; these are photographic-fallback observations, not hardware-GPU proof or spontaneous failures. Actual unchanged photographs/project media are used. Overlapping handoff, reserved geometry, return/interruption, focus and cleanup passed without exceptions, horizontal overflow or writes. Review helpers and the local paired-video report identify this controlled mode separately.

## Changed files and remaining gaps

Implementation: `src/App.tsx`; `src/lib/{use-motion-preference,use-route-restoration}.ts`; `src/components/{CaseGallery,ResponsiveProjectImage}.tsx` and their CSS; `src/components/landscape/{Collection,MotionRig,ProfilePage,ProfileEntry,ProjectReader,ScreenshotFrame,CaseDisclosure}.tsx`, `{collection-motion,finite-motion,motion-rig,rig-models}.ts`, `{motion-language,selected-project,case-media,case-disclosure}.css`, and `Layout.tsx`; `src/pages/JobMatch.tsx`; `src/sections/ContactSection.tsx`. Validation: `tests/e2e/{signature-motion,engineered-landscape,case-media}.spec.ts`, `tests/rig-geometry.test.mjs`, `package.json`, `.github/workflows/ci.yml`; review/measurement/build-report helpers in `scripts/`, the current-image selector in `scripts/review-lazy-image-lifecycle.mjs`, this QA entry and intended evidence under `docs/design/phase4/`. Backend, shared evidence normalization, original media, CV geometry/fixtures and dependency lockfiles remain unchanged.

Remaining gaps: no physical phone/tablet or Safari checks; viewport touch emulation on an Intel Windows GPU is not those devices. Historical October 9 environmental triggers remain unrecorded even though the application clock failure mechanism is now reproduced and fixed. Sustained CDN/offline reliability and slow physical GPU budgets remain unverified; actual-image review uses verified cached original bytes, not a fresh reliability claim. Unsupported-WebGL and transport/decode failures are deliberate regressions, not spontaneous production incidents. No merge, manual deployment, live CMS/database changes, Contact submission, authenticated project actions, bookings/payments or Phase 5 work. The user's handoff remains untouched.

---

# Phase 3 follow-up: lazy-image lifecycle — 10 October 2026

Branch `fix/phase-3-lazy-image-lifecycle` is stacked on approved Phase 3 `21bf413ffc0ec63f7d13d69a6d03b7bffbb61442` / draft #14. [Draft PR #15](https://github.com/MahmoudAbdulGhani/Portfolio/pull/15) targets `refine/phase-3-composition-media`. Implementation commit: `c8372437852bb94f58c0d480bd051232e92e1098`. Checked branch and working tree first, refreshed origin, and preserved the user's untracked handoff. No newer tracked work was present.

## Confirmed cause and implementation

`ScreenshotFrame` started its 15,000ms deadline on mount whenever status was `loading`. `CaseNarrative` mounted all workflow frames, while `ResponsiveProjectImage` deferred their requests with native `loading="lazy"`. Time spent waiting offscreen therefore counted as request time. Scrolling could later complete the image and clear a false unavailable state. `ProjectReader` uses the same frame with priority loading; its chooser also changes sources. Original retry used a raw image but shared state with earlier callbacks.

Each source/retry now has a keyed attempt with its own status, image ref, observer and timer cleanup. Non-priority frames use a one-shot IntersectionObserver with a 600px vertical margin. No image URLs are mounted before eligibility. On eligibility, both the request and unchanged 15-second deadline start: the mounted image uses `loading="eager"` because this shared visibility gate already performs lazy loading. This avoids a second, browser-dependent lazy threshold delaying the request after the deadline starts. Priority images still start immediately; unrelated `ResponsiveProjectImage` callers retain their existing native loading defaults and fetch priorities. Offscreen frames keep their aspect ratio and loading overlay.

Load/error and cached `complete` + positive `naturalWidth` resolve the current attempt. Timer cleanup runs on completion, failure, source/retry retirement and unmount. Key isolation keeps retired callbacks from updating a replacement attempt. Eligibility stays latched and the observer disconnects, so scrolling/rerenders do not restart the deadline. A late successful response can still recover a stalled current attempt; Retry creates a fresh attempt using the complete original without responsive derivatives. Genuine errors and visible stalled-request fallback remain.

## Regression and local validation

- `npm run test:e2e -- tests/e2e/case-media.spec.ts tests/e2e/case-study.spec.ts --workers=1`: **57 passed**, across desktop, tablet and mobile Chrome. Six new cases per browser cover both projects waiting offscreen beyond 15 seconds, a precisely clocked eligible workflow failing at 15,000ms (still loading at 14,999ms), repeated visibility without a reset, source replacement during loading, retired responsive failure after successful original retry, and returning to a decoded cached image without another request. Existing true-error/retry, late stall recovery, chooser, viewer focus, frame/caption and portrait assertions remain.
- The cached-image case uses a separate browser page with fetch-only API fixtures, retaining native image caching; network routing would disable HTTP caching. Other contract cases use synthetic CMS/pixel responses and held/failed requests. These are controlled regressions, not production asset availability measurements.
- The existing delayed-workflow test now waits for the image to attach after visibility activation before reading `naturalWidth`; its dimensions, caption and decode assertions are unchanged. Development runs exposed this missing wait and an automatically advancing test clock; the final exact-boundary case pauses the clock after content is ready and scrolls without Playwright's RAF-dependent stability wait. No production timeout or existing assertion threshold was relaxed.
- Typecheck, lint, production build, JavaScript-only API startup, **16 integrity tests** and whitespace checks passed. The build retains its existing large-chunk advisory.
- Complete [GitHub CI #69](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38042145687) **passed** on implementation `c837243`. Clean Ubuntu/Node 22 runner: both dependency installs, explicit server Prisma generation (no migration), typecheck, lint, build, API startup, all **16 integrity tests** and all **216 browser tests** passed. Browser execution took **5.7 minutes**, with no failures, skips, retries or flaky results. Job `114184348926` completed at `2026-10-10T09:46:06Z`. [Immutable CI evidence](docs/design/phase3/lazy-image-followup/ci-run-69.json). Final documentation-head CI result is recorded in draft PR #15 to avoid another documentation/CI commit loop.

## Actual-image observations

[Findings](docs/design/phase3/lazy-image-followup/findings.json) and **24 screenshots** in `docs/design/phase3/lazy-image-followup/` cover JobPilot and GameZone at **1363×844** and **390×844**. The local production build uses the frozen Phase 3 public GET records. Detail reads are intercepted to avoid view counters; network writes are blocked. Local assets are served normally; public JobPilot PNGs use unmodified cached bytes verified against their recorded SHA-256. GameZone retains its genuine frontend captures with explicitly synthetic demonstration business data. No pixel fixtures replace these visual assets.

Each of the four reviews spent **16 real seconds at the introduction** before scrolling. The last workflow remained unrequested and loading, with no unavailable message. All **12 workflow observations** then became ready on scroll; frame height and caption offsets stayed identical. Workflow frame heights were approximately 549–554px for desktop JobPilot, 750px for desktop GameZone, and 229px on phones. Selection restored chooser-summary focus. Enlargement opened the full image; Escape and the Close control returned focus. A deliberately aborted request exposed retry, and retry displayed the actual original. Selected/failed/retried frame heights and caption offsets matched exactly. No page exceptions, horizontal overflow or write attempts occurred.

Visually inspected the desktop JobPilot workflow, its phone detail excerpt and caption, desktop GameZone retry, and the phone GameZone full-image viewer. Accepted media geometry, captions and demonstration qualification remain. Proof examples: [JobPilot desktop](docs/design/phase3/lazy-image-followup/jobpilot-ai-later-workflow-1363.jpg), [JobPilot phone](docs/design/phase3/lazy-image-followup/jobpilot-ai-later-workflow-390.jpg), [GameZone retry](docs/design/phase3/lazy-image-followup/gamezone-arena-retry-ready-1363.jpg), [GameZone phone viewer](docs/design/phase3/lazy-image-followup/gamezone-arena-viewer-390.jpg).

[Fresh CDN probes](docs/design/phase3/lazy-image-followup/cdn-probe.json): all five published JobPilot original PNG GETs succeeded and matched their Phase 3 hashes. This is a point-in-time transport check. Visual retry failures were deliberately injected, not spontaneous CDN failures. Sustained CDN reliability, slow/offline physical devices and Safari remain unverified; an eligible genuinely slow image may still reach the unchanged deadline and can recover or retry.

## Separate motion limitation and scope

The earlier **tablet collection opening instability** remains documented below: local approved-baseline and Phase 3 runs sometimes stayed `opening` beyond the unchanged settled-state assertion. Its cause remains unestablished. This image fix does not repair or diagnose that motion issue. No motion/Collection/rig source, stylesheet, renderer coverage, retry configuration or assertion deadline changed. Local validation here is the 57 affected tests; the complete suite is assessed on GitHub separately.

Changed implementation/test files: `src/components/landscape/ScreenshotFrame.tsx`, `src/components/ResponsiveProjectImage.tsx`, `tests/e2e/case-media.spec.ts`, `tests/e2e/case-study.spec.ts`. Review support: `scripts/review-lazy-image-lifecycle.mjs`, this QA entry, and the follow-up screenshots/JSON. Portrait, gallery implementation, image chooser, disclosures, media styling, Phase 1–2 evidence, CV geometry and backend/security paths are unchanged. No merge, manual deployment, live CMS/database change, project operation, Contact submission or Phase 4 work.

---

# Phase 3: composition, media and editorial polish — 10 October 2026

Branch `refine/phase-3-composition-media`, based on accepted Phase 2 `32b75f87a8547393d6b655566543485f0a9c293d` (implementation `cb047a8`, draft #13). [Draft PR #14](https://github.com/MahmoudAbdulGhani/Portfolio/pull/14) uses `refine/phase-2-case-study-evidence` as its base. Implementation commit: `3b09cd5a575d000d2d9facbe2045c2d67e51bfb4`. Checked the branch, working tree, instructions and refreshed refs before branching; the approved Phase 2 head remains unchanged. The user's untracked `Codex_Engineered_Landscape_Handoff.md` is preserved and excluded.

[Before/after viewer](docs/design/phase3/comparison.html) · [four-width findings](docs/design/phase3/after/findings.json) · [all-image audit](docs/design/phase3/media-review/findings.json) · [capture provenance](docs/design/phase3/media-captures.json) · [original-image dimensions/hashes](docs/design/phase3/published-image-dimensions.json).

## What changed

The first JobPilot reader and Cedar title/media area established the shared pattern, with actual desktop/phone inspection before applying it elsewhere. All eight readers use professional **Engineering decisions**, **What was built.**, and **Scope and limitations.** headings. Introductions are short; Home's phone caption describes the sidebar. Capture procedures move here, while source revision/access/provenance remain in the deeper disclosure. Team scope, undocumented attribution, Home's supplied-design credit, source/runtime boundaries, AWS/Digital Hub uncertainty and Capabilities deduplication remain. The same read-time case records supply assistant/Job Match context; no CMS reconciliation or backend change was needed.

Shared native disclosures provide a visible plus/expanded cue, full heading targets of at least 44px, keyboard focus and restrained feedback disabled for reduced motion. Media navigation provides active title/count, a structured named chooser with selected state, and separate enlargement. Selection closes the chooser and restores focus; every original remains selectable and inspectable. Frames reserve known geometry before loading. A loading overlay keeps lazy images eligible to load; failed/stalled requests offer retry of the original, bypassing a failed responsive derivative. Frame/caption positions remain stable. Portrait proportions are preserved; intentional document/phone workflow excerpts are labelled, and full overviews remain complete on phones.

Captions follow the selected image: Medicare identity artwork no longer inherits the homepage claim, and earlier GameZone images do not inherit the new capture provenance. Cedar, GameZone and UniHub demonstration qualifications also appear in the full-image inspector. Cedar's supplied mobile/tablet captures show its public landing page and are named accordingly. The title grid separates long names from concise role/program metadata. Captions use 14px Manrope; reading measure and section spacing share tokens. AI Job Match's extra inner width gutter is removed; Profile's phone introduction is 15px. Profile/Projects switches retain touch targets and focus. Contact's accepted narrow form and keyboard/footer behavior remain. Sculpture, palette, portrait assets, equal-width 16:10 covers and motion code are unchanged.

## Media provenance

- **GameZone:** four clean captures of the genuine deployed booking frontend lead the workflow. All API responses use intercepted, explicitly synthetic rooms/devices/prices/availability; non-GET/HEAD requests are blocked. Cash was selected for review, and the final reservation/payment control was never activated. Stored complete PNGs contain no painted-over indicator, fabricated UI, DOM restyling or crop. Source is pinned to `2b25a97`; the deployed revision is not independently established. Older complete images remain. This demonstrates frontend interaction, not live availability, booking, OTP, settlement or concurrency.
- **User Management:** retained the existing public-statistics capture and corrected its constrained display geometry. A fresh high-resolution empty registration form at **520px** supplements the earlier complete phone image. A read-only 390px probe found source-app navigation extending to 491px and an overlapping password icon. The portfolio does not claim to fix or certify that app's narrow layout. No account was created.
- **Medicare:** a read-only browser reached the actual public homepage and login, unlike Phase 2's historical host challenge. The new capture waits for fonts, decoding and finite entrance animations. It is explicitly separate from appointment/clinical screenshots. Authenticated workflow media is still unavailable; the PHP diagram, original identity and undocumented personal attribution remain. No clinical record/operation was accessed.
- **Others:** retained authentic material and evidence boundaries, team scope and Home's supplied Figma credit. Cedar money remains demonstration data and its advisor a deterministic estimate with optional Groq narration. UniHub's academic screen is not a verified credential. Home's genuine `390×844` menu original is unchanged; Phase 2's Enter/open, close and blocked-write procedure remains historical verification, not an operational booking claim.

The six new assets use the existing responsive pipeline with selective inputs, preserving older files. Lossless intermediates totalled **2,683,114 bytes**; optimized originals total **448,024 bytes** (83% smaller), plus AVIF/WebP variants. Complete PNG masters are in `docs/design/phase3/media-masters/`. Gallery/portrait assets and their pipelines were not regenerated.

## Evidence and validation

Baseline screenshots were captured **before product editing**: eight readers plus Collection, Projects, Profile, Contact and AI Job Match at **1363×936, 1024×1366, 390×844 and 320×844**. Deployed Phase 2 assets use an immutable public GET snapshot. Project-detail counter and PDF initialization routes are intercepted; writes are blocked. Final local captures use the Phase 3 **production build**. Both `before/` and `after/` also contain complete compositions at **1363×1400 and 390×1600**; additional baseline frames still use the unchanged deployed Phase 2 interface.

Remote PNG requests intermittently stalled in an early browser pass; subsequent public GET downloads succeeded for all ten originals. Repeatable final comparisons use their **unmodified bytes**, with recorded dimensions/SHA-256, plus authentic local media. This is image caching, not fixture screenshots or proof that CDN timing is solved. Unavailable/retry behavior is tested separately. Early development capture attempts interrupted by reloads were replaced by completed production-build captures.

Final review: **52 route/viewport combinations**, no horizontal scrolling, page exceptions or media errors. Findings retain the Collection's deliberately clipped decorative bounds separately from actual scrolling; existing reader scroll-container assertions remain strict. The all-image audit covers **100 loaded image/viewport combinations** at desktop/390px. Individual captures/contact sheets retain names, counts, scale, proportions and complete inspection access. Visually inspected all eight desktop/phone readers, disclosures and workflow crops, all public pages, and representative tablet/320px layouts. No portrait defect was found.

- Typecheck, lint, build and JavaScript-only API startup passed. Existing 502.76KB motion chunk warning remains.
- Integrity **16/16**, landscape **10/10**, gallery **2/2**, portrait **2/2** passed. New editorial/caption tests retain learning, Capabilities, attribution and actual outgoing JSON/SSE context assertions.
- Static CV generation/reference checks passed with no database/network: unchanged Letter/Carlito application/tailored layout, A4/Source Sans master, reference fixture and tolerances.
- **12 new browser cases** cover every chooser image at 320px, keyboard/selected state, selection versus enlargement, disclosure Enter/Space/mouse behavior, long headings, 44px targets/focus, stable page position, reduced motion, failed/stalled images, original retry, frame/caption stability, phone/advisor proportions, inspector qualification and Escape/focus return. Prior chapter actions open the chooser before selection; existing assertions/timeouts are preserved. Early new-test failures were an ambiguous selector and an immediate count before reader mounting, corrected with scoped selectors and normal locator waiting.
- Initial complete local browser run: **197 passed / 1 failed**, 21.7 minutes, including all 12 new cases passing. The unchanged tablet failed-image test remained `opening` beyond its five-second `settled` assertion; Escape was not reached. The trace showed no Vite reload. [Failure observation](docs/design/phase3/motion-observation/initial-local-failure.json) and screenshot are retained, with the raw trace preserved locally. The Collection, rig, models and selected-project stylesheet are byte-identical to approved Phase 2 ([hash comparison](docs/design/phase3/motion-observation/source-comparison.json)).
- A separate approved `32b75f8` worktree, with the same installed dependencies, actual renderer, viewport, test and assertion deadlines, reproduced that failure in **2/3 repetitions** ([matched baseline result](docs/design/phase3/motion-observation/baseline-diagnostic.json)). Its local Vite file allowlist was extended only to serve the shared installed font files. An earlier font-blocked setup attempt is recorded separately and excluded from this comparison. This establishes a pre-existing timing instability, not its underlying cause. No renderer, motion timing, assertion, timeout or retry setting was changed. The initial full run and baseline failures are not counted as green.
- A fresh isolated Phase 3 repetition reproduced the same opening deadline in **3/3 runs** ([current diagnostic](docs/design/phase3/motion-observation/current-diagnostic.json)). The local full suite therefore remains **197/198**, with all new Phase 3 cases passing. This Windows renderer timing gap remains unresolved; the complete clean-runner workflow is assessed separately. Advanced motion changes remain outside Phase 3.
- [Complete GitHub CI #67](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/38001502559) **passed** on implementation `3b09cd5a575d000d2d9facbe2045c2d67e51bfb4`: dependency installation, explicit server Prisma generation, typecheck, lint, build, JavaScript-only API startup, **16 integrity tests** and **198 browser tests**. Browser execution took **7.3 minutes**, with no failures, skips, retries or flaky results reported. The job completed at `2026-10-09T23:01:00Z`; failure-artifact upload was correctly skipped. [Machine-readable run evidence](docs/design/phase3/ci-run-67.json) records its steps. The local Windows motion deadline failures remain separate observations; this green run does not establish their cause or claim a motion repair.
- The final documentation head's complete workflow, exact SHA and result are recorded in [PR #14's validation entry](https://github.com/MahmoudAbdulGhani/Portfolio/pull/14). No migration, assertion/timeout waiver or motion change is involved.

Browser regressions use intercepted **synthetic fixtures**, including pixel images and Contact/AI/admin responses. They verify UI/transport contracts, not model reasoning or project backends. Public-record/image review is separate. **No new real-provider evaluation ran in Phase 3**; Phase 1/2 samples remain historical local-route observations and are not relabelled as current deployed answers. No production Contact submission occurred.

Remaining gaps: the pre-existing local renderer opening deadline; authenticated project/backend/provider behavior; Medicare clinical media/personal attribution; JobPilot private-source access; the linked User Management app's narrow-layout defects; external image reliability; physical phones/Safari. Source inspection and pictured interfaces establish no operational, hiring, adoption or financial outcomes. No merge, manual deployment, live CMS/database changes or Phase 4 work.

Changed product files: `shared/case-study-runtime.js`/`.d.ts`; new `CaseDisclosure`, `CaseMediaNav`, `ScreenshotFrame`/styles; `CaseNarrative`, `ProjectReader`, `Layout`, `composition.css`, `case-narrative.css`; `CaseGallery`/style; `project-detail-screens.ts`; Cedar's two `project-cover-directions.ts` labels; selective image optimizer; generated `project-images.ts` and six media sets. Tests/QA: case-study unit/browser tests, new `case-media.spec.ts`, public-media cache/capture/review scripts, this report and `docs/design/phase3/`. Dependencies, CV geometry/fixtures, public route protections, motion code and accepted gallery/portrait assets are unchanged.

---

# Phase 2: case-study storytelling and engineering evidence — 9 October 2026

Branch `refine/phase-2-case-study-evidence` starts from the approved `6aac725`. Checked the branch, working tree, ancestry and refreshed remote refs before editing: no newer tracked work was present. The user's untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched. [Draft PR #13](https://github.com/MahmoudAbdulGhani/Portfolio/pull/13) follows draft PR #12 and uses `refine/phase-1-evidence-capabilities` as the base. Final pushed SHA, clean-runner CI result and run link are recorded in PR #13's validation entry; earlier green Phase 1 runs do not certify this change.

[Evidence inventory](docs/design/phase2/evidence-inventory.md) · [Before/after comparison](docs/design/phase2/comparison.html) · [32 final route/viewport findings](docs/design/phase2/after/browser-findings.json) · [Local checks](docs/design/phase2/checks.json) · [Public demo GET results](docs/design/phase2/demo-status.json) · [Real local-provider answers](docs/design/phase2/provider-answers.json).

## Evidence and reading experience

Completed the eight-project inventory **before implementation**, inspecting current public GET records, linked READMEs, relevant code at the inventory's pinned revisions and original published media. Source observations are labelled separately from executed behavior. JobPilot's linked repository is private: authorized connected-repository access supported inspection, while the reader labels its source links as requiring access. All **20 public pinned source files** resolved through anonymous HEAD requests; [link evidence](docs/design/phase2/source-link-status.json) distinguishes private references from publicly resolved files. Repository implementation is not used to infer individual authorship. No test count, production-scale result, revenue, performance improvement or security guarantee from these projects is claimed.

Completed JobPilot first and inspected actual desktop/mobile results before extending the other seven. That review found lazy images could reserve no height and whole desktop interfaces were too small on phones. Workflow frames now reserve their known aspect ratios; desktop screens span the reading column. Selected mobile details use explicitly labelled CSS excerpts and sufficient image-source resolution. Originals are unchanged and remain accessible through the existing inspector. The original JobPilot prototype captures remain in `docs/design/phase2/jobpilot/`; final captures are under `after/`.

The opening now has a concise product explanation and existing CMS role/team context, followed by a relevant genuine product image. Selective workflow captions replace long feature inventories; documented personal work is separated from team implementation. Native disclosures hold complete contributions, collaborators, engineering choices with pinned sources, the full stack and supporting images. Flagships have two or three decisions; smaller projects have shorter compositions. Constraint, implemented choice and consequence are available without a dense initial scan. Existing navigation, project reader controls, media inspector, AI entry points, portrait, gallery assets, palette and signature motion are retained.

| Project | Reviewed story and evidence | Important limit |
| --- | --- | --- |
| JobPilot AI | Resume lead; discovery → saved opportunity → voice setup; source-backed review/save boundary, queued generation and approval of a specific application-pack version. | A pictured application-pack tab is not proof of an approved export. Profile revision uses its update timestamp; source freshness is a separate check. Authenticated saves, exports and project-provider execution were not rerun. |
| Cedar Construction | Project context → reports → advisor; balanced posting, allocation-derived balances and Django calculations with optional Groq narration. Four-person delivery remains separate from personal contributions. | Public Render GET timed out. Demo financial figures are not business results; an inventory “Coming soon” tile is not delivered functionality. |
| Lobby | Guest invitation → screen-sharing room → audio setup; shared validation and room-specific media grants described as team mechanisms. Six collaborators retained. | Published room/connection states do not establish a fresh successful join or call; broad personal collaboration statements do not assign Zod, QR or media mechanisms to the owner. |
| GameZone Arena | Session → device selection → payment-choice screens; overlap checks and pending cash approval explained. Three-person team retained. | Source checks do not establish race-free concurrent booking; payment UI is not proof of settlement. |
| UniHub | Student dashboard and transcript; student-scoped data and printable transcript. Personal scope remains the student portal within a three-person system. | Professor/admin images are supporting team media; an application transcript is not a verified academic credential. |
| User Management | Public statistics lead and mobile registration; server-assigned Client role, current-user checks and soft-delete behavior. Selected independent-app contributions retained. | Pictured account totals are not adoption metrics or proof of admin access; retained deleted rows do not prove email reuse. |
| Medicare Hub | Short identity opening and lightweight HTML appointment selection → confirmation → history code-path diagram, with PHP source links. | No genuine workflow screenshots or documented personal contributions were available. HTTP 200 served a host challenge. Clinical behavior, compliance and security are unverified; personal attribution stays omitted. |
| Home Services | Supplied-design landing page and genuine new mobile-sidebar capture; React section composition and breakpoint navigation. | Supplied Figma UI-kit credit retained; original creator is unidentified. Personal attribution stays omitted. Placeholder navigation does not demonstrate bookings, payments or an operational service backend. |

Home Services' new capture uses the existing public template with no accounts or private records: keyboard Enter opened the actual menu and its close button dismissed it, with all non-GET/HEAD requests blocked. [Original PNG](docs/design/phase2/media/home-services-mobile-menu-original.png) and [capture provenance](docs/design/phase2/home-services-capture.json) are retained; the application asset is a lossless WebP conversion with no crop or fabricated UI. Existing product captures were reused without modification. Mobile excerpts are labelled “Detail excerpt · full screen in the gallery”; textual captions describe what each visual establishes. Medicare's diagram explicitly says it is an inspected code path, not a simulated product screen or a new appointment test.

## Shared claims and provider verification

`shared/case-study-runtime.js` supplies the reader and `getPortfolioContext` with the same reviewed summaries, decisions, sources and limits. Editorial content applies only when both slug and linked repository match; future or unrelated CMS records retain the existing reader. Names, links, stack, complete personal contribution records and collaborators remain CMS-owned. Changes occur at read time; no live CMS patch, seed, migration or database update was made. The JavaScript-only API package explicitly includes the shared runtime modules. Phase 1's display names, learning evidence/uncertainty and Capabilities rules remain intact. Standard/tailored CV layout and export contracts are preserved.

Real provider checks exposed a context-boundary problem: a model could turn broad CMS collaboration statements into specific personal mechanisms found in team code, or fill an empty attribution record from portfolio inclusion. The first four answers are retained in [initial provider evidence](docs/design/phase2/provider-answers-initial.json), including incorrect Lobby mechanism attribution and Home frontend attribution. Context now includes an explicit authorship contract copied only from CMS personal statements; each engineering decision marks individual authorship as unestablished. Both assistant and Job Match, in JSON and SSE, require that boundary and distinguish source inspection from executed tests. No canned question-specific reply was added.

A second real run preserved individual/team separation but inferred “Figma Community” as the original designer; [that evidence](docs/design/phase2/provider-answers-attribution.json) is retained. The design-credit record now states that the creator is unidentified, and shared instructions prohibit interpreting hosts/community labels as author identities or inventing method names from source links. The final four independently phrased prompts all received HTTP 200 real Gemini answers: JobPilot's review/approval limits, Cedar's Django/Groq boundary, Lobby's team/personal scope, and Medicare/Home attribution and supplied-design uncertainty. The final responses preserved these boundaries. This is a four-sample observation, not a guarantee about every future model answer.

These provider results exercise **corrected local Express routes with a read-only public snapshot and fail-closed in-memory Prisma**, using an actual provider. They are not deployed-portfolio answers or tests of the eight projects' providers/backends. Separate regression tests use mocked Prisma/provider responses and inspect outgoing prompts; those do not evaluate model reasoning. Public demo GET checks establish only the returned page/shell, except the explicitly tested Home menu interaction. No authenticated project workflows or project backend test suites were executed.

## Validation and remaining gaps

- Typecheck, lint, production build and `git diff --check`: passed. No heavy dependency was added. Existing large motion-chunk and Prisma configuration-deprecation warnings remain.
- Integrity: **14/14** passed, including five new case-study contract/context tests and actual assistant/Job Match JSON/SSE prompt checks. Covers repository matching, empty attribution, per-decision authorship boundaries, media identity, source-versus-runtime limits, unknown designer, shared summaries, team context and unchanged learning uncertainty.
- JavaScript-only API startup/health/public routes passed with no TypeScript loader. Landscape **10/10**, gallery **2/2**, and portrait **2/2** tests passed.
- Static CV and reference checks passed: standard/tailored Letter with Carlito, master A4 with Source Sans, and unchanged application fixture/tolerances. No database or network was required for these CV checks.
- Complete local Playwright suite: **186/186 passed**, no failures, skips or flaky results; one worker, 7.3 minutes. This includes 27 new cases across desktop/tablet/mobile contexts, covering all eight readers at **1363×936, 1024×1366, 390×844 and 320×844**, native keyboard disclosures, source links, gallery Escape/focus return, next-reader lead reset, meaningful alt text/captions, and delayed-image frame/caption stability. Existing admin, navigation, motion, Contact, assistant and CV contracts remain covered. Contact tests use intercepted fixtures, never production submissions. The 27 affected cases also passed after the final source-link spacing review. Assertions and timeouts were not loosened.
- Actual local Chrome review of captured public records: **32/32 route/viewport combinations**, zero horizontal overflow, page exceptions or empty text blocks. Visually inspected all eight desktop/mobile presentations, representative tablet/320px views, readable captions, preserved originals, crop labels and expanded engineering decisions. Fonts were loaded and reduced motion enabled. Actual screenshots are separate from synthetic fixture browser tests.
- Initial clean-runner [CI #65](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37950973770), head `cb047a8544db6f341ab33e39682bc3ef23f77611`, passed dependency installation, explicit server Prisma generation, typecheck, lint, build, JavaScript-only API startup and all 14 integrity tests. Browsers finished **185 passed / 1 failed**, including all **27 new case-study tests passing**. The existing tablet failed-screenshot test could not find the restored Explore JobPilot AI button after Escape, on all three configured attempts. [Run/step evidence](docs/design/phase2/ci-run-65.json) retains the failure; it is not relabelled as green. The unchanged test passed three times against a fresh CI-style local server and three times against the local snapshot server; diagnostic software-renderer runs at CPU-throttle factors 1, 4 and 8 also passed. The cause is not established from those passes. CI now retains the existing failure screenshots, error context and traces for seven days so a recurrence can be inspected. No assertion, timeout, retry count, viewport, renderer coverage or application motion changed for this diagnostic step. The subsequent complete workflow's exact final SHA, run link and result are recorded in [PR #13's validation entry](https://github.com/MahmoudAbdulGhani/Portfolio/pull/13).

Remaining gaps: Cedar's public GET timeout; JobPilot source links require permission; Medicare has no genuine workflow media and its demo returned a host challenge; no authenticated project/backend/provider workflows were retested; physical-device Safari and a new performance study remain outside this phase. Existing screenshots demonstrate their recorded interface state, not fresh end-to-end execution. Phase 2 work ends here: no merge, manual deployment, CMS/database change, production Contact enquiry or Phase 3 implementation.

---

# Phase 1 CI closeout — 9 October 2026

The clean GitHub runner exposed a setup gap that the already-generated development clients did not: after `npm ci --prefix server`, that server dependency tree's `@prisma/client` was not generated. [CI #61](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37935070974) failed at the JavaScript-only API startup test with `@prisma/client did not initialize yet`, and subsequent integrity/browser steps were skipped.

Commit `6909ea3` adds **Generate server Prisma client** immediately after the server dependency install in `.github/workflows/ci.yml`, using exactly `npm run db:generate --prefix server`. It generates client code from the existing schema; no migration, database update, schema change or application behavior change is involved.

[Complete GitHub CI #62](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37936287529) passed on `6909ea3cac0ab6875483d7c4c698b95759c3bd2b`, with a clean Ubuntu runner and Node 22.23.3. Both dependency installs, explicit server Prisma generation (6.19.3), typecheck, lint, build, JavaScript-only API startup, all **9** integrity tests, browser dependency installation and the full **159-test** desktop/tablet/mobile Playwright suite passed. No tests were skipped, failed or reported flaky. The workflow completed at `2026-10-09T13:25:26Z`; browser execution took 2.7 minutes. [Machine-readable run and step evidence](docs/design/phase1-followup/ci-run.json) records the tested SHA and GitHub run/job IDs. Local generation, typecheck, lint, build, API startup, integrity tests and diff check also passed before pushing. The existing large motion-chunk and Prisma package-configuration deprecation warnings remain.

The documentation commit's full run [CI #63](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37936997616) subsequently passed generation and backend checks but exposed an intermittent tablet motion assertion: the delayed-image test remained in `opening` beyond its five-second settled-state deadline (158 browser tests passed, one failed including its two configured retries). Three repeated local tablet runs passed unchanged. Concurrent renderer contention on the hosted runner is a plausible cause, not a demonstrated application defect. CI now runs Playwright with **one worker**, removing concurrent renderer load without changing any test, real renderer coverage, application timing or assertion timeout. The focused test also passed on all three local viewport projects with one worker. A fresh complete workflow verifies this configuration; its final result is recorded in [PR #12's CI closeout entry](https://github.com/MahmoudAbdulGhani/Portfolio/pull/12). The prior green #62 result remains recorded with its exact SHA and does not certify later commits.

Case-study storytelling and engineering evidence are the next Phase 2 scope; no Phase 2 implementation is included here. PR #12 remains draft, and the existing no-merge/no-manual-deployment boundary is retained. The user's untracked handoff file is untouched.

---

# Phase 1 follow-up: learning evidence and Capabilities — 9 October 2026

Branch `refine/phase-1-evidence-capabilities` starts from `1d5a04e`, the latest Phase 1 runtime repair. Checked the branch, tree, ancestry and refreshed remote refs first: there were no newer tracked changes or commits. The user's untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched. This draft follows PR #11 as its base; no merge or manual deployment is part of this follow-up.

[Recorded checks](docs/design/phase1-followup/checks.json) · [Browser findings](docs/design/phase1-followup/browser-findings.json) · [Real provider answers](docs/design/phase1-followup/provider-answers.json).

## Cause and context trace

The supplied production answer asserted that the snapshot documented AWS bootcamp completion. Phase 1 removed the stale expected-2026 clause and retained July–October 2025, but returned no explicit completion evidence status. The generic assistant instruction prohibited inventions without explaining that past training dates cannot establish completion. Digital Hub's legacy contradictory Completed/Completing prose was already neutralized, but likewise lacked an explicit evidence limit. Removing misleading prose alone left the model room to infer a completed bootcamp from past dates and the AWS issuer.

The path is `src/components/landscape/Assistant.tsx` → POST `/api/assistant` → `getPortfolioContextWithRetry` / `getPortfolioContext` → Prisma selections → shared normalization → Gemini system instruction and serialized snapshot. Both JSON and SSE paths now use the same evidence policy. The record schema lists dates/prose and optional credential metadata; it contains no independent completion or certification verification evidence. Read-time `learningEvidence` therefore explicitly marks those statuses **unverified**, separates listed participation/dates from self-reported completion prose and credential metadata, and states that past dates do not establish completion or graduation. Degree names, issuer names, IDs and course URLs cannot promote an unverified record to proof. Other education/training records receive the same contract; normal employment records are not relabelled as training. No special-case visitor question or canned answer was added.

Caching was inspected rather than assumed: context is read fresh on every assistant/Job Match request, and `gemini.js` makes a direct provider request without a response or context cache. The browser keeps displayed conversations in React state; each new question sends a fresh request and does not include that history in the provider prompt. The public API cache and React Query data cache do not supply the assistant snapshot. Duplicate-question throttling rejects repetitions; it does not replay an answer. JSON responses already use `no-store`; assistant SSE now also explicitly uses `private, no-store, no-transform`. The public PDF's existing five-minute cache is unrelated to assistant generation and is unchanged. Route tests mutate a record between requests and confirm the next prompt receives the changed dates.

Profile and CV resolution share the learning evidence contract. Profile explicitly displays unverified program completion and training/certification status. Standard CV already uses neutral Digital Hub participation and AWS dates, so its rendered copy/layout needed no change; resolved education data now also carries evidence metadata while retaining explicit CV date overrides. Job Match uses the same snapshot and policy for both transports, including the recruiter summary that feeds the signed tailored-CV export. Team fields, named collaborators, team size and documented personal contributions remain in the context; the policy distinguishes team features from personal work.

## Capabilities and visual evidence

The earlier check compared whole normalized names and only removed exact overlaps from Skills. Composite labels and specific variants therefore survived across category summaries and Skills. `capabilityGroups` now assigns canonical competency atoms one location across the complete rendered content, with specific details under that competency. HTML/HTML5 and CSS/CSS3 stay under Languages; MySQL and MariaDB remain two distinct Databases entries; Git and GitHub remain two distinct Operations entries. Argon2 includes password hashing once, and AI API Integration includes its OpenAI detail once. JWT authentication also groups with JWT. Django/DRF and SQL/SQLAlchemy remain distinct. Project evidence follows the competency into its selected location and still requires documented personal role/ownership/contribution plus matching stack evidence; OpenAI API stack evidence supports the OpenAI integration detail. CMS records and selection IDs are untouched.

Read-only Chrome review at **1363×936**, **390×844**, and **320×844** uses captured public GET records, loaded Manrope, reduced motion, and blocked API writes. Each viewport renders **71 unique competency keys**, with no duplicates, horizontal overflow (including the actual scroll container), or page exceptions. Visually inspected category wrapping, distinct database/operations items, project links, Skills spacing and training uncertainty. [Desktop Capabilities](docs/design/phase1-followup/capabilities-1363.jpg), [phone Capabilities](docs/design/phase1-followup/capabilities-390.jpg), [desktop databases](docs/design/phase1-followup/capabilities-databases-1363.jpg), [phone operations](docs/design/phase1-followup/capabilities-operations-390.jpg), [phone Skills](docs/design/phase1-followup/capabilities-skills-390.jpg) and [training status](docs/design/phase1-followup/training-1363.jpg) show the result. Earlier accepted Phase 1 captures remain in `docs/design/phase1/after/`; they were not overwritten or relabelled as new captures. Portrait, gallery assets, palette, navigation and motion implementation are preserved.

## Validation and limits

- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`: passed. Existing 502.76KB motion chunk warning remains.
- `npm run test:integrity`: **9/9** passed. Covers absent proof, past/future dates, self-reported completion, credential metadata, other training, ordinary employment, cross-section grouping, useful evidence links, and actual assistant/Job Match JSON/SSE outgoing prompts with in-memory Prisma/provider fixtures. These fixture responses do **not** evaluate model reasoning. CI now runs this suite.
- `npm run test:landscape`: **10/10** existing stream/link tests passed. `npm run test:api-runtime`: JavaScript-only function package and health/projects/profile routes passed without TypeScript runtime dependencies.
- Static `CV_STATIC_ONLY=1 npm run test:cv --prefix server` and `npm run test:cv-reference --prefix server`: passed. Added resolved-data evidence assertions; standard/tailored exports remain one Letter/Carlito page and master retains A4/Source Sans. Reference geometry, text fixture and tolerances are unchanged. One initial nested-PowerShell static command lost its environment assignment and was stopped; the successful rerun assigned the variable in the calling shell. Only the successful static runs are counted here.
- Profile/content/portrait Playwright suite: **36/36**, no skipped, unexpected, flaky results or retries, across desktop/tablet/mobile. Includes 320px cross-section alias/evidence checks and accepted portrait geometry/delivery checks. Browser review independently confirms the real public snapshot renders without duplicate keys or overflow.
- **Real provider evaluation:** three independently phrased questions ran through the corrected local Express assistant route using the configured **Gemini 3.5 Flash** provider. All returned HTTP 200. AWS: listed July–October 2025 participation, completion unverified, certification unverified. Digital Hub: June–September 2026 participation, graduation/completion unverified. Lobby/UniHub: collaborative delivery, specific documented personal work and named collaborators retained. Exact questions/answers are in `provider-answers.json`. Data reads and rate-limit writes used a fail-closed in-memory Prisma replacement; no production assistant POST was used. This is real provider output using locally corrected code and captured public records, **not deployed production output**.

Completion/certification evidence is still absent; code cannot establish those facts. Future verified evidence needs an explicit source/record contract, not inferred dates or a credential URL. Production behavior after deployment, authenticated production CV overrides, live database-backed CV tests, physical phones and Safari remain unverified. The three provider samples are observations, not a guarantee against every future model response. No CMS reconciliation patch, merge, manual deployment, production Contact submission or Phase 2 work was performed.

Changed implementation files: `shared/content-integrity-runtime.js` / `.d.ts`, `src/lib/hooks.ts`, `src/components/landscape/ProfilePage.tsx`, `src/landscape-integration.css`, `server/src/lib/portfolio-context.js`, `server/src/lib/cv-config.js`, `server/src/lib/evidence-instructions.js`, `server/src/routes/assistant.js`, and `server/src/routes/job-match.js`. Tests/QA: `tests/content-integrity.test.mjs`, `tests/e2e/content-integrity.spec.ts`, `server/test/learning-context-routes.test.mjs`, `server/test/helpers/snapshot-api.mjs`, `server/scripts/test-cv.mjs`, both new `scripts/review-phase1-*.mjs` follow-up/provider scripts, `package.json`, `.github/workflows/ci.yml`, this report and `docs/design/phase1-followup/` evidence.

---

# Vercel API startup repair — 9 October 2026

The user deployed Phase 1 and supplied production runtime logs showing `ERR_MODULE_NOT_FOUND` for `/var/task/shared/content-integrity.ts`, imported by `server/src/lib/cv-config.js`. This is a regression introduced by Phase 1: the new JavaScript backend imports referenced a TypeScript source path that was absent from the deployed function package. Because `api/index.js` loads all routers, the missing dependency stopped the entire backend before requests reached Prisma; Collection, Projects, Profile and other API consumers therefore failed together. A direct read of the live `/api/health` confirmed HTTP 500 with `X-Vercel-Error: FUNCTION_INVOCATION_FAILED` before this repair was deployed.

Repair branch: `fix/vercel-content-integrity-runtime`, based on `a08200d`. Content rules now have one canonical JavaScript implementation in `shared/content-integrity-runtime.js`; its matching declaration file preserves TypeScript signatures. The existing `shared/content-integrity.ts` remains a typed frontend re-export. Backend CV/context modules import the actual `.js` runtime, and `vercel.json` explicitly includes that file in `api/index.js`'s package. There are no content, layout, PDF geometry, database, environment-value or security-rule changes.

Added `npm run test:api-runtime` and a CI step that copies the real API/backend plus JavaScript shared files into an isolated temporary package, leaves out all TypeScript source files, disables Node's TypeScript loader, imports the actual `api/index.js`, and checks health/projects/profile HTTP 200 responses with explicitly mocked data reads. This reproduced the **exact missing-module error before the fix** and passes afterward. It uses no database, external provider, environment-file content or production write. The temporary package path is checked before cleanup.

Validation: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:api-runtime`, six content/context tests, ten existing stream/link tests, static CV generation/reference tests and all **33** desktop/tablet/mobile content/Profile/portrait checks passed. The final browser run has zero skipped, unexpected or flaky results. The application reference geometry and tolerances are unchanged. The frontend's emitted main bundle hash remains `index-CrFsOXR3.js`, matching the preceding Phase 1 build; only the shared backend runtime packaging is repaired. The existing 502.76KB motion chunk warning remains.

The first direct network attempts failed due to temporary DNS/connectivity failures; later origin fetch, GitHub reads and the live health check succeeded. Vercel's published configuration schema confirms `includeFiles` accepts the explicit string used here. No Vercel settings, live database or Contact messages were changed. The new commit must be deployed before production recovery can be verified; local/mock success is not a claim that the currently deployed API is repaired. Full Vercel function artifact generation and post-deployment real-data responses remain unverified in this session.

---

# Phase 1: content integrity and presentation consistency

9 October 2026. Branch: `refine/phase-1-content-integrity`, based on approved `refine/engineered-landscape-portrait-finish` at `f84c580` (draft PR #9). Refreshed origin before choosing this base. The original checkout's untracked `Codex_Engineered_Landscape_Handoff.md` is preserved and excluded from this change. The review PDF was read as observations to verify, with work limited to the user's Phase 1 request.

[Matched before/after browser comparison](docs/design/phase1/comparison.html) · [Browser findings](docs/design/phase1/after/browser-findings.json) · [Checks](docs/design/phase1/checks.json) · [Exact proposed CMS patch](docs/design/phase1/proposed-cms-patch.json) · [PDF inspection](docs/design/phase1/cv/inspection.json).

## Findings fixed and source boundaries

- The reader always mounted a personal-contribution heading, paragraph and list. It now trims optional values, removes empty paragraphs/lists/metadata, and collapses the unused column when no personal record exists. Team-only records retain named collaborators in a separate team section. No responsibilities, collaborators, results or metrics were invented.
- A shared display-name mapping supplies **Cedar Construction** and **User Management** to reader H1s, gallery/index captions, collection selection/reveals, next-project navigation, assistant context and Job Match evidence/export labels. Full functional names remain secondary reader descriptions and search terms. Slugs, IDs, routes and CMS names are unchanged. Independent work reads **Independent project.**; team phrases and their separators stay together.
- Profile, resolved CV data and the AI snapshot share month/year formatting and experience sorting. Profile now orders Digital Hub, Oigetit, Ishtari and FALA by most recent end date. The targeted standard CV retains its existing two selected roles; sorting does not add omitted roles. Role titles are preserved.
- Digital Hub's public `description` said “Completing,” while `details` and `cvBullets` said “Completed.” Neither a completion certificate nor a separate authoritative status record was established. All those fields use neutral participation wording. The existing internship title is retained; its program description is explicitly training, not an earned credential.
- AWS's current year field and the repository's explicit date correction (`afbde5a`) support **Jul 2025 – Oct 2025**. Removed the conflicting expected-2026 description/date from returned training records without claiming completion. Training/course records have an explicit label and use “Program information” for links; credential labels require a documented credential ID. The application CV heading reads **Education & training**.
- Public skills, technologies, CV selection and AI context collapse case duplicates and the known SOLID/JavaScript aliases. Distinct Django/DRF, SQL/SQLAlchemy, hashing and provider-specific capabilities remain. Profile avoids repeating the same skill in its technology groups and skills list. Unsupported public “verified” badges are removed. A demonstrated-in link requires an exact normalized project-stack match and documented personal role/ownership/contribution; a broad category no longer points to the same two projects.
- Labels were assigned only after viewing local originals and retrieving/inspecting the actual public CMS images. Corrected Lobby friends/audio/invitation views, GameZone administration/room/user views, Home Services landing page, the UniHub professor course catalog and student transcript, User Management public statistics, JobPilot resume/interview/artwork views, and Cedar's risk/forecast capture. Labels, captions, gallery selectors and alt text use the same screen record. Known image identities replace positional guesses; unfamiliar future assets use a neutral “Project image” label. No image, gallery frame, portrait, color, sculpture or motion was replaced.

| Case study | Personal-contribution finding |
| --- | --- |
| JobPilot AI | Existing role, ownership and seven public contribution statements retained; independent metadata corrected. |
| Lobby | Existing two contribution statements and six named team members retained. CV now says co-developed, followed by the documented access/invitation/validation/service contribution. |
| GameZone Arena | Existing two statements and three-person team retained. CV now says co-developed, followed by the documented frontend/backend integration contribution. |
| Cedar Construction | Existing role, ownership, four-person metadata and contribution statements retained; display title unified. |
| UniHub | Existing student-portal contribution and collaborative attribution retained. The inspected professor screenshot is accurately labelled; it is not relabelled as student evidence. |
| User Management | Existing role, ownership and fourteen statements retained; display title and independent metadata corrected. |
| Medicare Hub | Personal role/ownership/contribution fields are absent. Entire empty section and unused column omitted. Existing CV bullets are not promoted into a new personal ownership claim. |
| Home Services | Personal role/ownership/contribution fields are absent. Entire empty section omitted; supplied-Figma-kit attribution retained. |

Home Services' [repository README](https://github.com/MahmoudAbdulGhani/home-services/blob/main/README.md) confirms responsive implementation from a supplied Figma design and identifies the original kit link. No kit creator was inferred. Medicare's current [README](https://github.com/MahmoudAbdulGhani/Clinic-management-system/blob/main/README.md) contains PHPMailer library documentation; that is not evidence of personal clinic-workflow ownership. Both records remain eligible for later documented CMS contributions.

Already correct: equal-width borderless covers and responsive delivery, accepted portrait geometry, explicit team attribution on collaborative cases, Home Services' design-source distinction, structured experience dates, the corrected AWS 2025 year field, stream whitespace preservation, JSON streaming headers, and valid CV-link fallback. These were retained.

## Visual and CV evidence

Chrome captures use the same read-only public CMS snapshot at **1363×936** and **390×844**, with additional **320×844** route/tab geometry checks. The before frontend is the actual archived approved commit, with its original assets and successfully loaded Manrope; the after frontend uses this change. Files with `-notes-` or `-records-` capture actual scrolling inside the existing reader. No crop, stretched comparison, document expansion or browser preference override was used. Reduced motion was requested through the browser's test context. All eight routes and three Profile tabs have zero reported horizontal overflow or page exceptions; case paragraphs/lists have no empty blocks. Both missing contribution sections are absent; six documented sections remain.

Inspected the desktop and phone reader headings, metadata wrapping, Medicare/Home Services section removal, Profile ordering/training and the skill/evidence-link spacing. [Medicare before](docs/design/phase1/before/medicare-hub-notes-1363.jpg) / [after](docs/design/phase1/after/medicare-hub-notes-1363.jpg), [Home Services phone after](docs/design/phase1/after/home-services-notes-390.jpg), [Cedar phone after](docs/design/phase1/after/construction-project-management-accounting-system-390.jpg), and [training after](docs/design/phase1/after/profile-education-records-1363.jpg) provide direct evidence.

The application generator explicitly selected Caladea for JobPilot. That source branch is removed; all application body copy uses Carlito at the existing 10pt size. Standard and reordered tailored exports are each **one Letter page**, with selectable text and **10 link annotations** including email, phone, LinkedIn, GitHub and portfolio. The existing A4/Source Sans master remains four pages in the static catalog. [Standard PDF](docs/design/phase1/cv/application.pdf), [tailored QA PDF](docs/design/phase1/cv/tailored.pdf), [master PDF](docs/design/phase1/cv/master.pdf), [before render](docs/design/phase1/cv/before.png), [standard render](docs/design/phase1/cv/application.png), [tailored render](docs/design/phase1/cv/tailored.png) and extracted `.txt` files are retained. The tailored sample is a declared generator fixture, not a live AI recommendation.

Reordering Lobby before JobPilot exposed an existing paragraph collision. Subsequent project positions and later sections now accommodate actual text height while retaining the standard reference anchors. PDF inspection checks embedded fonts, page size/count, extracted wording, contact annotations, text bounds and paragraph separation. Profile's Download CV action saved the regenerated PDF byte-for-byte through an intercepted local response. External link destinations were not all visited.

The reference fixture was **not regenerated**. Fourteen intended text expectations and the obsolete Cambria font expectation were hand-edited for these requested content/font corrections. All recorded line coordinates, rules, page geometry and 2pt/1pt/1pt tolerances are unchanged; the conformance test passes. JobPilot's Carlito wrapping is now explicitly locked by the intended text fixture. Broad résumé rewriting and new outcome claims remain deferred.

## Commands and actual results

Shell commands use `rtk proxy` because this machine's filtered RTK commands require an unavailable Claude config directory. The final checks are recorded in `checks.json`.

- `npm.cmd ci`: completed; no manifest/lock change. npm reported 38 dependency advisories. Dependency remediation was outside this content pass.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`: passed. Existing lazy motion-rig warning remains at approximately 502.76KB minified.
- `node --test tests/content-integrity.test.mjs`: **6/6** passed, including a fully mocked Prisma AI-context read with no database/provider access.
- `npm run test:landscape`: **10/10** existing stream/link tests passed.
- `npm run test:gallery`, `npm run test:portrait`: **2/2 each** passed; original gallery and portrait assets are unchanged.
- `CV_STATIC_ONLY=1 npm.cmd run test:cv --prefix server` and `npm.cmd run test:cv-reference --prefix server`: passed. The former also checks A4/Source Sans master generation; both avoid database access.
- `node scripts/review-phase1-cv.mjs` and `python scripts/verify-phase1-cv.py`: passed for regenerated standard, master and reordered tailored artifacts.
- Playwright public/API/reader/gallery/portrait/Contact suites, two workers against the explicit local preview: **144/144**, zero skipped/unexpected/flaky and no retries. After the final skill spacing and team-only preservation changes, Profile/content/portrait followup: **33/33** across desktop/tablet/mobile, zero skipped/unexpected/flaky. These cover navigation, real request contracts, assistant whitespace/focus/retry/cancel, Job Match report/export/token request and intercepted Contact states. They do not establish live provider reliability.
- `node scripts/review-phase1.mjs before http://127.0.0.1:5181` / `after`: **36 checks each**, matched captures and findings saved. A local CV-download smoke check passed byte-for-byte against the regenerated export.

Intermediate failures were resolved: the first CV tests correctly rejected the old font/content expectations before the narrow fixture update; an early concurrent browser run had a hover failure and its owned development-server shutdown stalled, then a reused server caused connection-refused failures when that earlier process was stopped. The explicit independent preview run passed all 144. A capture was interrupted by development HMR and rerun. The first archived-base captures could not load fonts from the parent dependency directory; they were replaced after narrowly allowing that local dependency directory and asserting font readiness. The temporary archive caused ESLint to discover a second config root; it was moved out of the checkout after capture and the final unmodified lint command passed. No application deadlines, retries, tolerance or security settings were loosened to obtain these results.

## Unresolved facts and CMS dependencies

The eight exact proposed patches cover three experience records, Angular/AWS date/status text, university dates, and the two collaborative CV summaries (only fields that actually differ are included). Each patch includes current-value preconditions and a record ID. **Nothing was applied.** Public presentation, PDF resolution and AI context already correct these records at read time; the patch would reconcile stored raw CMS copy for other consumers. There is no destructive skill deletion or configuration-selection rewrite.

Digital Hub/AWS completion and an earned vendor credential remain unestablished; neutral wording is intentional. Medicare/Home Services detailed personal attribution remains a CMS factual dependency; omission is the implemented fallback. Their media is unchanged, including Medicare's identity image and the scrollbar embedded in the Home Services capture. New workflow media, media replacement, flagship rewriting and motion refinement belong to later phases.

Physical iOS/Android devices, Safari, real keyboards and a new GPU/performance audit were not performed. No live AI-provider completion, authenticated production CV override/configuration read, database-backed CV test, every external URL, production Contact delivery, merge or manual deployment was verified or performed. AI and Contact UI checks used clearly identified local fixtures. No production content/database write was made, and no Contact enquiry was submitted. Stop after Phase 1.

---

# Profile portrait: final lighting and image delivery

8 October 2026. Implemented locally on `refine/engineered-landscape-portrait-finish`, based on the accepted borderless-gallery commit `3a8d208`. The accepted portrait crop, frame, size, placement, ivory background and surrounding Profile design are preserved. No unrelated work was changed.

[Actual Profile before/after comparison](docs/design/engineered-landscape-portrait/finish/comparison.html) · [Preservation and delivery measurements](docs/design/engineered-landscape-portrait/finish/preservation-and-delivery.json) · [Checks](docs/design/engineered-landscape-portrait/finish/checks.json). Working local page: http://127.0.0.1:5175/profile.

## Photographic finishing

Verified the original attachment at `C:/Users/Admin/Downloads/WhatsApp Image 2026-10-08 at 15.02.08.jpeg`: 1200 × 1600; SHA-256 remains `1065223bac21b80db1758710b469b55e0277e18fad5c352eeb7dbfbc174481ce`. Used the existing full-resolution registered cutout, retaining the exact alpha and crop rectangle (376, 341, 768, 1259). The original JPEG, previous PNG master and previous WebP assets remain unchanged.

Applied deterministic per-pixel linear-light correction to the existing head pixels: a restrained red gain (up to 2.5%), blue reduction (7.5–13% in linear light depending on shade), smoothly feathered to preserve surrounding clothing, and up to 0.10 stop additional face shadow lift. Corrected observed blue spill on fractional perimeter pixels using adjacent existing subject colors; bright-halo correction is limited to hair. Alpha and coordinates are unchanged. Hands/watch are excluded; near-opaque clothing below the head remains pixel-identical. No generation, face replacement, skin smoothing or sharpening.

The separate [finished master](docs/design/engineered-landscape-portrait/finish/portrait-finished-master.png) is transparent 1200 × 1600. Tests compare all 1,920,000 alpha values to the prior master, verify unchanged clothing interior and hands, and verify exact visible RGB/alpha round trips for every lossless WebP variant.

## Image delivery

The live page was checked in Chrome at 1363px and DPR 1/2 with all writes blocked. Its reported 436px natural width was density-adjusted: actual fetched WebP files were 480px at 1× and 768px at 2×. It already met 2× detail for the approximately 344px rendered desktop image. The old sizes attribute advertised 32vw instead of the actual inset image slot.

The corrected sizes calculations mirror the accepted column widths and padding. Native-source variants are 320, 384, 480, 640 and 768px wide, generated from the registered PNG rather than a small WebP. All use lossless WebP and preserve transparency; explicit 768 × 1259 dimensions remain. The main file is `public/landscape/portrait-striped-finished.webp`; responsive siblings are `portrait-striped-finished-{width}w.webp`. [Exact paths, dimensions and bytes](docs/design/engineered-landscape-portrait/finish/delivery.json).

At DPR 2: 1363px desktop receives 768px (2.23×); 1280px receives 768px (2.40×); 390px phone receives 384px (2.23×); 360px receives 320px (2.03×). Phone downloads drop about 31% and 49% respectively. The native 768px file is 603,372 bytes, about 0.7% larger after the pixel-preserving color finish. An intermediate 704px export was larger than the native file and removed from srcset and delivery. Lossless AVIF was also larger; lower-quality AVIF changed alpha, so it was not adopted.

## Layout and checks

Before/after Profile viewports, complete layouts and portrait-panel captures cover 1363 × 936, 1280 × 720, 390 × 844, 360 × 800 and 1920 × 1080 at DPR 2. Chrome before/after comparisons and WebKit after renders were inspected against the actual ivory page background. Panel geometry, image width/position and heading alignment have zero measured change. Mobile image-height rounding from responsive integer dimensions is less than 0.2 CSS pixels; the fixed crop frame is unchanged. No portrait or surrounding CSS was modified, and reduced-motion behavior remains static. Future custom CMS photos retain their own source without a person-specific cutout treatment.

Lint, typecheck, production build and **2/2 image regression tests** pass. Full Chrome desktop/tablet/phone suite: **144/144**; WebKit portrait/public suite: **28/28**. After removing the redundant source candidate, regenerated assets and reran lint/typecheck/build/image checks plus the affected portrait suites: **21/21 Chrome** and **14/14 WebKit**. All final results have zero unexpected, skipped or flaky tests. Browser tests verify decoded file dimensions at 2×, native-width caps, accepted frames, explicit sizing, delayed-load stability and future CMS-photo precedence. Existing motion-rig chunk-size warning remains, approximately 503KB minified.

## Limitations and changed files

The native trimmed source is only 768px wide. At the unchanged 1920px desktop layout, the image renders around 501px, so true 2× would need around 1002 native pixels; current delivery is capped at 1.53×. A higher-resolution original would be needed for that width. Physical phones, on-screen keyboards and calibrated display/color-reference testing remain unavailable; Windows WebKit is engine coverage, not physical Safari verification.

Changed: `src/components/landscape/ProfilePortrait.tsx`, `src/generated/profile-portrait.ts`, `scripts/optimize-profile-portrait.mjs`, `package.json`, `tests/profile-portrait.test.mjs`, `tests/e2e/profile-portrait.spec.ts`, six new WebP assets under `public/landscape/`, this QA section and `docs/design/engineered-landscape-portrait/finish/`. Original/current assets and the accepted CSS remain unchanged. On 9 October 2026, the user authorized committing and pushing this finished pass on its dedicated branch for draft review. No merge, manual deployment, production Contact submission or live database modification is authorized or performed.

---

# Approved borderless gallery refinement

8 October 2026. The user accepted the borderless comparison and authorized implementation, testing, commit and branch push. Work continues on `refine/engineered-landscape-gallery-covers` from `6c0451e`, updating draft PR #8. This section supersedes the matte presentation described below.

[Before/after comparison](docs/design/engineered-landscape-covers/gallery-comparison.html) · [Current checks](docs/design/engineered-landscape-covers/refinement-3/checks.json) · [Sources and treatments](docs/design/engineered-landscape-covers/cover-treatments.json) · [High-density phone measurements](docs/design/engineered-landscape-covers/refinement-3/device-layout-review.json).

## Change and preservation

The wide 80px/50px gray surround is removed from all eight covers. Rebuilt 1600 × 1000 lossless masters directly from the same hash-verified high-resolution captures; full screenshots now fill their frames. All source captures already match 16:10, so there is no screenshot cropping, stretch or upscaling. This increases visible product width by about 11% within the accepted frame geometry. Exported WebP/AVIF assets were regenerated with the existing quality settings.

Authored covers have zero CSS padding and a transparent frame background. Square edges, image containment, loading/error space, and the existing oxide keyboard outline remain intact. Renamed the preview flag from `embeddedMargins` to `authoredCover` to reflect the new treatment. Original source photographs and product captures, case-study media, selected views, sculptures/WebGL motion, full CMS names and routes, descriptions, search, Gallery/Index modes, Contact and AI functionality remain unchanged. Future CMS screenshots still use their contained inset presentation.

## Visual verification

Fresh before/after full galleries and original viewports were captured at 1363 × 936, 1280 × 720, 390 × 844 and 360 × 800. Desktop and mobile complete galleries were visually inspected against the accepted borderless comparison: all eight retain complete images, consistent frame bounds, aligned caption spacing, flat edges and readable product content. Captures are in [refinement-3](docs/design/engineered-landscape-covers/refinement-3/). Complete-gallery expansion is capture-only.

Chrome and Windows WebKit phone/touch review used DPR 3 at 320 × 568, 360 × 800, 390 × 844, 430 × 932 and 844 × 390. All ten layouts loaded eight images, filled the frames without transforms or borders, and had no horizontal overflow or page errors. Physical phones, on-screen keyboards and browser-chrome behavior remain unverified.

## Checks

- Lint, typecheck and production build passed. Existing motion-rig chunk warning remains, approximately 503KB minified.
- Image regression: **2/2** passed. Tests check actual painted pixel bounds at all four master edges, complete-source crop metadata, and every responsive format/fallback. **56** delivery files decode; total asset bytes: **2,302,864**.
- Complete Chrome desktop/tablet/mobile suite: **123/123**, no skipped or unexpected results, no automatic retries. Covers, selection/reversal, assistant, Contact, search/routes and original case-study media remain functional.
- Relevant WebKit gallery/public interaction suite: **28/28**, no skipped or unexpected results, no automatic retries. Includes all eight previews, Gallery/Index modes, loading/failure states, full CMS search names and routes, case-gallery keyboard/focus, and public navigation.
- The initial WebKit run missed Ctrl+K before requesting the lazy Command Palette module. The test now waits for rendered navigation before sending the shortcut; its 5s dialog assertion is unchanged. Final WebKit results and a **3/3** targeted Chrome desktop/tablet/phone followup pass. No palette application code or global timeout changed.

## Remaining limits and delivery

No physical iOS/Android device, actual phone keyboard or browser-chrome testing was possible. Windows WebKit automation is not physical Safari verification. Medicare still uses its verified public homepage because no approved populated clinical screenshot was available. Protected project captures retain the previously disclosed published/repository fixtures; this styling refinement makes no claim of live backend/authentication testing.

Commit and push are authorized for this branch and draft PR #8. No merge, manual deployment, production Contact submission, live CMS/database write, dependency change or unrelated source-repository edit.

Changed files: `src/components/ProjectPreview.tsx`, `src/components/project-preview.css`, `src/pages/Projects.tsx`, `tests/gallery-covers.test.mjs`, `tests/e2e/project-preview.spec.ts`, `tests/e2e/public.spec.ts`, gallery masters/delivery assets and QA metadata/screenshots.

---

# Gallery refinement 2: fresh matching captures

8 October 2026. Local branch: `refine/engineered-landscape-gallery-covers`, based on `f1fdade`. This review supersedes the first-pass cover selections and its timeout result below. All eight covers are now integrated with exactly matching painted bounds; protected workflow and physical-device qualifications remain explicit.

[Complete before/after comparison](docs/design/engineered-landscape-covers/gallery-comparison.html) · [Sources, resolutions, hashes and treatments](docs/design/engineered-landscape-covers/cover-treatments.json) · [Checks](docs/design/engineered-landscape-covers/refinement-2/checks.json) · [Device measurements](docs/design/engineered-landscape-covers/refinement-2/device-layout-review.json). Local preview: http://127.0.0.1:5175/projects.

## Findings and implementation

1. The rejected pass had equal outer frames but unequal painted screenshot bounds. Fresh captures now fill identical 1440 × 900 product areas inside 1600 × 1000 masters, at 80px horizontal and 50px vertical offsets. Original capture ratios are 16:10; no cropping, stretching, generated UI, decorative frames or extra CSS padding. Source product colors and original case-study images remain intact.
2. Real product code supplied stronger populated views. JobPilot uses existing Resume Library unit fixtures. Lobby reuses exactly the six messages, reply and reaction already published in its community-chat screenshot; no private conversation was accessed or invented. GameZone reuses the two known published bookings and real room assets; its footer is excluded. Cedar uses its repository's saved project overview and actual styles. UniHub reuses its published dashboard figures and course bars. User Management uses the current administrative table with six original repository demo records, discarding password fields before capture. Home Services was recaptured to retain both worker photographs and the complete hero.
3. Medicare's real public homepage was recaptured at 1280 × 800, DPR 2; the other seven captures use 1536 × 960, DPR 2. Its admin and appointment templates were inspected, but no approved populated clinical screenshot was available. The existing admin backdrop was a weaker presentation and rejected. No patient records were invented, and the unapproved identity proposal remains unintegrated.
4. Desktop captions, responsive frames, concise labels, full CMS search names, accessible link names, routes, Gallery/Index switching and image loading/failure behavior passed regression checks. The portfolio's accepted design, sculptures, WebGL motion, portrait, CMS content, selected views and other pages are preserved.
5. WebKit exposed focus restoration after mouse opening the case-study gallery. The opener is now recorded explicitly rather than inferred from document.activeElement, because WebKit does not focus mouse-clicked buttons. Contact now rechecks visibility after a keyboard-time document scroll, correcting WebKit's delayed textarea focus scroll without restricting ordinary page scrolling. Gutter assertions measure the page's padding without counting a native scrollbar.
6. The previous selected-image test timeout combined lazy WebGL/resource startup with animation. The test now waits separately for opening (15s resource allowance), then retains the original 5s settled-animation assertion. No global timeout, retries, animation speed or application motion was relaxed.

## Screenshots and visual review

Before and after complete galleries plus original viewports are linked in the comparison at 1363 × 936, 1280 × 720, 390 × 844 and 360 × 800. Desktop complete-gallery and mobile renders were visually inspected. High-density Chrome and Windows WebKit screenshots are in [refinement-2](docs/design/engineered-landscape-covers/refinement-2/), at 320 × 568, 360 × 800, 390 × 844, 430 × 932 and 844 × 390. All ten layouts loaded eight bounded images, retained 16:10 frames, and had no horizontal overflow or page errors. Complete-gallery capture expansion is capture-only; viewport screenshots show actual layout.

## Checks and limitations

- Lint, typecheck and production build passed. Existing motion-rig chunk warning remains (approximately 503KB minified).
- Image regression: **2/2** passed, checking actual non-matte pixel bounds for all eight masters and decoding all 56 responsive delivery files. Total delivery assets: **2,011,747 bytes**.
- Existing assistant/stream checks: **10/10** passed.
- Complete Chrome desktop/tablet/mobile suite: **123/123**, zero skipped, unexpected or flaky results.
- WebKit desktop/phone API, Contact, Gallery/Index and public interactions: **46/46**, zero skipped, unexpected or flaky results. Contact initial, focus, validation, pending, failure and success states use intercepted submissions.
- Phone layout review uses DPR 3 and touch contexts. **No physical iOS/Android phone, actual on-screen keyboard or browser-chrome behavior was tested.** Windows WebKit automation is not a claim of physical Safari verification.
- Protected project captures use isolated actual frontends and disclosed existing published/repository fixtures; backend/authentication/live-data functionality was not exercised. Medicare's authenticated clinical workflow remains unavailable as a populated approved screenshot.
- Local source repositories and existing unrelated edits were preserved. Capture-only servers were stopped; the read-only portfolio preview remains available. No new dependencies, live database/CMS changes, production Contact submissions, merge or manual deployment. On 8 October 2026, the user authorized committing and pushing this verified refinement branch. Branch delivery is separate from the local QA results and does not change production.

## Changed implementation files

Gallery assets and provenance: `docs/design/engineered-landscape-covers/`, `public/projects/gallery-covers/`, `src/generated/gallery-covers.ts`, `scripts/optimize-gallery-covers.mjs`, `scripts/optimize-project-images.mjs`. Presentation: `src/pages/Projects.tsx`, `src/lib/gallery-presentation.ts`, `src/components/ProjectPreview.tsx`, `src/components/ResponsiveProjectImage.tsx`, `src/components/project-preview.css`, `src/landscape.css`. Cross-browser corrections: `src/components/CaseGallery.tsx`, `src/components/landscape/ProjectReader.tsx`, `src/lib/use-contact-viewport.ts`. Coverage: `tests/gallery-covers.test.mjs`, `tests/e2e/project-preview.spec.ts`, `tests/e2e/engineered-landscape.spec.ts`, `tests/e2e/contact-responsive.spec.ts`, `package.json`.

---

# Engineered Landscape: eight dedicated gallery covers

Date: 8 October 2026. Status: **all eight available real-material covers integrated and locally verified; protected workflow capture limitations documented below**. The Medicare identity alternative is a proposal only.

## Scope and source inspection

Read the complete attached gallery-cover brief. It replaces the earlier two-project comparison task. Inspected repository instructions, working tree, branch and commits before creating `refine/engineered-landscape-gallery-covers` from the clean portrait branch at `f1fdade`. This preserves `f3fa087`, selected-project, mobile Contact, approved equal-width gallery and portrait improvements. The original Desktop/portfolio checkout and its untracked handoff remain untouched.

Read the eight published projects from the public CMS, retrieved original remote screenshots, inspected local originals and each product repository, and visited the actual product URLs. [Source inventory](docs/design/engineered-landscape-covers/source-inventory.json) records the original resolution/aspect ratio and product/repository URLs. [Cover treatments](docs/design/engineered-landscape-covers/cover-treatments.json) records the exact selected file, source hash, individual crop and final product rectangle. Downloaded originals and inspection helpers are outside the app; no live project or CMS records were edited.

| Gallery title | Selected original / aspect ratio | Selected content and treatment | Fresh capture availability and limitations |
| --- | --- | --- | --- |
| JobPilot AI | Repository QA PNG, 1488×1121 / 1.327 | Existing populated Resume Library, saved document, sidebar and upload action. Select top 1488×930; render 1440×900 at 80,50. | The repository's `evidence/refinement-final/after-resumes-1488.png` is an actual application capture with existing QA test data. Public live site available; private workflow requires authentication, with no shared demo account. No new documents/data were fabricated. |
| Lobby | Original `audio-room.webp`, 1919×863 / 2.224 | Select real room interface at 1430×863, excluding unused chat pane; keep brand, room navigation and Start audio call. Render at 85,69 without enlargement. | Public landing page accessible; no approved populated server/conversation capture or shared demo account found. No private conversations were accessed or republished. This room view remains less populated than an authenticated conversation. |
| GameZone Arena | Original `user_overview.webp`, 1366×1446 / 0.945 | Deliberate top 1366×954: navigation, all four metrics and both confirmed upcoming sessions. Footer excluded. Render 1289×900 at 156,50. | Authenticated dashboard not publicly accessible. Original source is smaller than the preferred capture width; it is downscaled rather than enlarged. |
| Cedar Construction | Public repository QA `local-project-detail.png`, 1440×1289 / 1.117 | Sidebar, four financial metrics, complete progress and project-health panels. Select top 1440×948; render 1367×900 at 117,50, comparable to GameZone. | Real repository capture with existing example-project data and Cedar Control branding. Public site warms up after a cold backend response; private workflow requires authentication. CMS case-study screenshots remain unchanged. |
| UniHub | Original `Admin.webp`, 1919×918 / 2.090 | Keep navigation, all summary cards, enrollment chart and account status. Remove only the captured right scrollbar; render 1440×692 at 80,154. | Repository-published demo login was tested after backend warm-up and returned 401. No further credential attempts. Highest available original retained; its compression and wide aspect limit sharper recapture and increase vertical matte. |
| User Management | Fresh public capture, 1440×900 / 1.600 | Loaded real statistics, navigation, all three cards and complete Platform Overview. Remove irrelevant lower blank area; render 1440×650 at 80,175. | Fresh public overview possible. An actual authenticated management workflow was unavailable; this cover is explicitly a public statistics view, not an admin screen. |
| Medicare Hub | Fresh public capture, 1440×900 / 1.600 | Verified public homepage, navigation, introduction and existing reception artwork. Select top 1440×750; render at 80,125. | Real public interface available. No dashboard/appointment screenshot found in CMS/repository; protected clinic/patient workflow unavailable. The separate identity proposal below is not integrated. |
| Home Services | Fresh public capture, 1920×1200 / 1.600 | Complete navigation, headline, both original worker photos and service facts. Downscale whole view to 1440×900 at 80,50. | Fresh capture possible. At 1440px the live responsive design hides the side photos; 1920px was deliberately used to retain both. Capture-only scrollbar suppression removes browser chrome; the intentional lower white shape belongs to the original design and is preserved. |

All selections were reviewed individually. No generated interfaces, fabricated messages, perspective, decorative device frames, gradients, new motion or interface recolouring were introduced. Existing illustration material remains unchanged. Restricted workflow sources remain a limitation; every project nevertheless has a dedicated, verified-material gallery cover in this local pass.

## Cover assets and integration

Eight lossless **1600×1000 PNG masters** live in [masters](docs/design/engineered-landscape-covers/masters). The common matte is the existing preview colour **#deded3**. The 1440×900 product view at 80/50px is the starting point; wider/narrower originals retain their proportions and complete selected panels, so their exact matte differs as documented. GameZone and Cedar now have similar product height and apparent scale. UniHub and User Management retain more vertical matte to preserve their content without distortion.

[Delivery assets](public/projects/gallery-covers) contain WebP and AVIF at **480, 960 and 1600px**, plus a primary WebP fallback: **56 files / 2,123,730 bytes** across all variants, not a single page download. Largest full-size WebP is 105,270 bytes. WebP quality 92 and AVIF quality 72 with 4:4:4 preserve interface colour/text. [Asset validation](docs/design/engineered-landscape-covers/asset-validation.json) confirms every asset decodes, every master is 1600×1000, matte pixels match, and resize ratio rounding remains below 0.00036. No source original was enlarged.

`npm run images:gallery` rebuilds optimized delivery sets and `src/generated/gallery-covers.ts` from the reviewed masters. The existing case-study optimizer excludes this directory so it cannot recompress the separately authored covers. No image-generation dependency was added.

`Projects` selects the dedicated cover by slug and supplies explicit **1600×1000** dimensions and responsive sources through the shared image component. Authored covers receive **zero additional CSS padding**, avoiding doubled margins. Unknown/future CMS projects retain the bounded original-image path and ordinary frame padding. Loading/decode/error states reserve the same 16:10 frame.

Gallery and Index use concise presentation titles, including **Cedar Construction** and **User Management**. Search matches both the short title and original CMS name/technology. Link accessible names, identifiers, routes and case-study headings retain full CMS names. Case-study and selected-collection media remain original screenshots; no cover map is applied there. Portrait source/assets/code are unchanged in this branch.

## Complete eight-project before/after evidence

Open [gallery-comparison.html](docs/design/engineered-landscape-covers/gallery-comparison.html) for side-by-side complete galleries, original viewport captures, treatment table, masters and the separate Medicare proposal. Local live gallery: `http://127.0.0.1:5175/projects`.

| Viewport | Before complete eight-project gallery | After complete eight-project gallery | Unmodified after viewport |
| --- | --- | --- | --- |
| 1363×936 | [before](docs/design/engineered-landscape-covers/before-1363x936-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-1363x936-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-1363x936-viewport.jpg) |
| 1280×720 | [before](docs/design/engineered-landscape-covers/before-1280x720-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-1280x720-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-1280x720-viewport.jpg) |
| 390×844 | [before](docs/design/engineered-landscape-covers/before-390x844-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-390x844-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-390x844-viewport.jpg) |
| 360×800 | [before](docs/design/engineered-landscape-covers/before-360x800-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-360x800-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-360x800-viewport.jpg) |

Complete-gallery captures temporarily expand the existing inner scroll container for capture only. Original viewport captures and measured geometry accompany them; the expansion is not application CSS. Installed Chrome, DPR 1, reduced motion, read-only public-content snapshot. [Before measurements](docs/design/engineered-landscape-covers/before-review.json) / [after measurements](docs/design/engineered-landscape-covers/after-review.json): all eight loaded, eight Index links, no Index images, no horizontal overflow or page errors at every viewport. Desktop row captions and short titles align; 360/390px titles remain readable on one line.

[Loading screenshot](docs/design/engineered-landscape-covers/loading-390x844.jpg) and [failure screenshot](docs/design/engineered-landscape-covers/failure-390x844.jpg) use intercepted image responses. The frame remains **343.22×214.5px** through loading/failure, with a readable fallback and usable case-study link.

[Compiled-build delivery/state verification](docs/design/engineered-landscape-covers/production-loading-and-delivery.json) checks all eight decoded covers at 1363px DPR 1 and **390/360px DPR 2.75**. Chrome selects native AVIF; removing AVIF sources in the capture DOM separately verifies decoded WebP selection. This is a fallback simulation, not a physical unsupported-codec browser test. No page errors. [Medicare identity alternative](docs/design/engineered-landscape-covers/proposals/medicare-identity-1600x1000.png) uses only the existing illustration, project name and verified stack; it is shown for review and not adopted.

## Checks, changed files and limitations

- `npm run images:gallery`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`: pass. Existing >500kB WebGL motion chunk warning remains.
- `npm run test:landscape`: **10/10 pass**.
- Full Playwright suite: **122/123 passed** across desktop/tablet/mobile Chrome. All **21/21 gallery-cover regressions passed**. One existing mobile selected-screenshot test exceeded its five-second `settled` assertion while the stage was still `opening`; its isolated repeat passed **2/2** without changing application code or loosening the deadline. This transient timing failure is retained here rather than reporting a wholly green full run. [Check summary](docs/design/engineered-landscape-covers/checks.json). Cover tests verify all-eight bounds, undoubled margins, dimensions, Gallery/Index switching, image failure without layout shift, keyboard navigation, short/full-title search, full case-study names/original media, and future tall CMS-source containment. Other existing Contact, AI, navigation and focus regressions passed.
- Changed code: `src/pages/Projects.tsx`, `src/lib/gallery-presentation.ts`, `src/generated/gallery-covers.ts`, `ProjectPreview.tsx`, `ResponsiveProjectImage.tsx`, `project-preview.css`, caption-height rule in `src/landscape.css`, `scripts/optimize-gallery-covers.mjs`, exclusion in `scripts/optimize-project-images.mjs`, `package.json` script, and `tests/e2e/project-preview.spec.ts`. Added dedicated cover assets and this QA evidence. No dependencies, server routes, CMS records, case-study sources, portrait, Contact or sculpture code changed.
- Source gaps: no approved populated Lobby conversation, no authenticated User Management workflow, no Medicare clinic dashboard/appointment capture, and unavailable UniHub demo authentication. The integrated covers use the verified sources documented above; these unavailable workflows are not represented as verified. Source compression limits GameZone/UniHub detail; no artificial sharpening or invented detail was used.
- Physical phones, Safari/WebKit and real device codec fallback were not available. Visual checks are Chrome desktop/mobile emulation; no hardware-device assurance is claimed.
- Local work remains uncommitted on `refine/engineered-landscape-gallery-covers`. No push, PR update, merge, deployment, production Contact submission or live database write occurred for this pass.

---

# Engineered Landscape Profile photograph integration

Date: 8 October 2026. Status: **refined photograph integrated and locally verified; follow-up commit/push authorized for online review**.

## Source, preservation and method

Verified and opened the actual attachment at `C:/Users/Admin/Downloads/WhatsApp Image 2026-10-08 at 15.02.08.jpeg`: **1200×1600**, light striped button-down shirt and blue-faced watch. No `/workspace/scratch/` path was used. Source SHA-256 remains `1065223bac21b80db1758710b469b55e0277e18fad5c352eeb7dbfbc174481ce`. The older `public/myphoto.jpeg` remains unchanged too.

Read repository instructions and inspected the clean `fix/engineered-landscape-media` branch at `b6246b5` before creating the local `refine/engineered-landscape-profile-portrait` branch. This includes the approved equal-width gallery, `f3fa087`, selected-project composition and mobile Contact fixes. No unrelated source or dependencies were changed.

The first built-in imagegen edit changed facial/watch details and was rejected. Its image is not used or copied into the portfolio. To satisfy the user's explicit requirement for accurate segmentation without regenerating the face, the final asset uses local IMG.LY medium/ISNet segmentation **only as an alpha source**, applied to the decoded original photograph's RGB pixels. This follows the [segmentation/mask implementation](https://github.com/imgly/background-removal-js/blob/main/packages/node/src/index.ts). The original pixel positions and subject geometry are retained; no generated face, fingers, watch, shirt, or invented body parts are used.

Refinement removes disconnected low-alpha background flecks and decontaminates semi-transparent perimeter pixels using adjacent outdoor colour estimates. Opaque interior pixels are not spatially filtered. A smoothly feathered face exposure lift peaks at approximately **0.20 stop**; restrained white-balance gains are red **1.015**, green **1.0**, blue **0.99** in linear light. No skin smoothing, sharpening, dramatic lighting, filters or synthetic shadows were applied. Processing dependencies and model weights are outside the repository; the app receives only static images.

## Assets and composition

- [Full registered edited master](docs/design/engineered-landscape-portrait/portrait-refined-master.png): transparent **1200×1600**, retaining the source's hands and watch. The original photo already ends partway through the hands; missing parts were not invented.
- [Main transparent WebP](public/landscape/portrait-striped-cutout.webp): **768×1259**, **598,898 bytes**. Only unused transparent canvas is trimmed, at source origin **376,341**.
- [Phone WebP](public/landscape/portrait-striped-cutout-480w.webp): **480×787**, **317,718 bytes**. Both variants use lossless WebP encoding; the main asset is approximately 62% smaller than its 1,596,112-byte full PNG master. Fully transparent PNG pixels have their unused RGB cleared.
- [Ivory/dark background review](docs/design/engineered-landscape-portrait/cutout-background-review.png): browser-composited check of hair, ears, shoulders, sleeves, hands and watch. The actual page-background captures below are the decisive presentation check.

[Pixel proof](docs/design/engineered-landscape-portrait/pixel-proof.json) verifies **627,000 opaque interior pixels** against the original photograph with only the documented photometric adjustment, with **zero mismatches**. Main WebP optimization preserves **646,533 visible pixels** and every alpha value, with **zero changed visible RGB or alpha pixels**.

`ProfilePortrait` owns the image and its responsive CSS. It replaces the old `/myphoto.jpeg` default with the new asset, while a future custom CMS photo still takes precedence and receives no person-specific mask. Image dimensions are explicit, with responsive source selection and eager/high-priority loading. The obsolete approximate SVG and all its mask/185%-zoom/negative-offset styles are removed.

The flat warm ivory panel uses a **4:5** desktop frame, **20px** internal headroom/gutter, and the original 32% portrait column. At 1363px it measures **380.6×475.7px** and aligns with the Profile record at **y=117px**. The lower presentation crop ends above the wrists; hands/watch remain intact in the asset. The shoulders remain inside the panel, the face is closer, and proportions are unchanged.

Phones retain the accepted two-column portrait/contact-detail grouping, with **220px** portrait height, **10px** internal padding, and top alignment. This reduces portrait height from approximately **280px at 390px / 257px at 360px**. Biography, heading, experience, education, capabilities, links, navigation, CV behaviour and CMS text remain intact. No border, shadow, gradient, floating/cursor motion or entrance animation was added; reduced motion has no portrait animation to disable.

## Complete before/after Profile layouts

| Viewport | Before complete layout | After complete layout | Unmodified after viewport |
| --- | --- | --- | --- |
| 1363×936 | [before](docs/design/engineered-landscape-portrait/before-1363x936-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-1363x936-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-1363x936-viewport.jpg) |
| 1280×720 | [before](docs/design/engineered-landscape-portrait/before-1280x720-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-1280x720-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-1280x720-viewport.jpg) |
| 390×844 | [before](docs/design/engineered-landscape-portrait/before-390x844-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-390x844-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-390x844-viewport.jpg) |
| 360×800 | [before](docs/design/engineered-landscape-portrait/before-360x800-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-360x800-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-360x800-viewport.jpg) |

Complete-layout captures temporarily expand the existing inner scroll container for screenshot purposes; unmodified viewport captures and measured panel geometry are supplied separately. This capture-only override is not application CSS. [Before measurements](docs/design/engineered-landscape-portrait/before-review.json) / [after measurements](docs/design/engineered-landscape-portrait/after-review.json). Installed Chrome 154, headed capture, DPR 1, reduced motion, read-only public content.

[Compiled-build verification](docs/design/engineered-landscape-portrait/production-profile.json) additionally checks desktop, 390px and 360px with **DPR 2.75**: explicit dimensions, source selection, preserved aspect ratio, visible headroom, no masks/transforms/horizontal overflow, pointer movement, record-tab switching and an intercepted custom CMS photo override. [Compiled phone capture](docs/design/engineered-landscape-portrait/production-390-viewport.jpg). No page errors were recorded.

## Checks, changed files and limits

- `npm run typecheck`, `npm run lint`, `npm run build`: pass. Existing >500kB motion chunk warning remains.
- `npm run test:landscape`: **10/10 pass**.
- Full existing Playwright suite: **117/117 pass** across desktop, tablet and mobile Chrome. Selected views, complete gallery images, AI headers, Contact state/keyboard fixtures, navigation and focus checks remain green.
- Changed code: `src/components/landscape/ProfilePage.tsx`, new `ProfilePortrait.tsx` and `profile-portrait.css`, and portrait-only cleanup in `src/landscape.css`. Replaced `public/landscape/portrait-silhouette.svg` with the two transparent WebP assets; added this QA evidence.
- Original JPEG compression limits recovery of the finest hair detail; the edit preserves available detail and does not invent strands. Extremely magnified edge colour can still reflect the original outdoor light; no obvious retained background or halo was observed at tested page sizes on ivory. Physical phones and Safari/WebKit were not available.
- Work is on `refine/engineered-landscape-profile-portrait`. After local verification, the user requested committing and pushing the portrait to view it online. This authorizes the connected Vercel branch deployment; no production promotion or merge is included. No production Contact submission or live database/CMS content write occurred. Existing PR #7 remains unchanged.

---

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

## Profile standing portrait prototype — 2026-10-14; completed 2026-10-19

Status: isolated review prototype; acceptance pending. Baseline: `90428751cec6ed500e4347b63465dc29936155a5`, draft #32 (`fix/phone-opening-inspection`). The existing untracked `Codex_Engineered_Landscape_Handoff.md` was preserved and excluded from this change. `/profile` retains its accepted portrait. `/review/profile-portrait` exists only in development; no default navigation or provider configuration changes.

Review locally with `npm run dev:motion -- --host 127.0.0.1 --port 5190`, using the existing ignored public-content/CV snapshot. Open `/docs/design/profile-standing-portrait/comparison.html`. It includes matched side-by-side captures at 390×844 and 1440×900, cream/white/dark alpha inspection, enlarged original/extracted face comparison, loading/fallback captures and validation data. Additional current/proposed and Capabilities captures cover 320×844 and 768×1024. `changed-files.json` lists the scoped delivery.

### Asset processing and fidelity

- The sole person source is `WhatsApp Image 2026-10-14 at 12.52.44.jpeg` from the supplied ZIP: 1071×1428 pixels; SHA-256 `d5449cfc03fcb2c76ba12c3c3d9ecbb7ea130e081e046e3f687304d261b0180a`. The supplied AI cutout was examined as a composition reference and rejected as a shipping asset. The 12.31-second reel was inspected at three positions for standing-person integration only; its layout and gestures were not reproduced.
- Extraction runs locally on CPU with ONNX Runtime and the [ISNet general-use segmentation weights distributed by rembg](https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx). Model MD5 is verified against `fc16ebd8b0c10d971d3513d564d01e29`. The photograph is never uploaded. No image generation, face replacement, retouching, sharpening, colour correction, upscaling or body transformation is used.
- A small U2Net trial retained railing/scenery around sleeves and was rejected. Raw ISNet also retained a railing loop and low-opacity scenery. Final alpha cleanup uses one native-pixel mask erosion, a 35–225 alpha remapping, a bounded person region, a supersampled trace of the left sleeve/waist edge, and removal of floor pixels below the complete shoe soles. The source-specific coordinates are reviewable in `scripts/standing-portrait-alpha-cleanup.json`; the extractor checks the original hash before applying them. Only alpha and crop change.
- Final crop is `[331,401,657,1428]`, producing a 326×1027 transparent PNG and lossless WebP in `public/review-assets/`. Both shoes, hands, watch, sleeves, ears and hair were inspected against cream `#ecebe3`, white and dark `#171b18`. The railing loops, between-leg scenery and floor residue are removed. No drawn outline or coloured matte is added. `alpha-mask.png` and `processing.json` preserve the mask and processing record.
- The script verifies every exported PNG RGB pixel against the decoded original crop, including the face, expression, skin texture, pose, clothing and footwear. It also verifies exact RGBA equality of the lossless WebP and PNG. These are stronger fidelity checks than visual resemblance alone. Reproduce with Python packages `numpy`, `onnxruntime`, `Pillow`, then `python scripts/extract-standing-portrait.py <original.jpeg> <output-directory> --model-path <isnet-general-use.onnx>`. Extraction dependencies/model downloads live under ignored `.motion-preview/portrait-prototype`; application dependencies and lockfiles are unchanged.

### Composition, motion and behavior

- Desktop places the complete figure in the existing left column, at 480px height with reserved natural-ratio space and transparent background. A restrained radial CSS floor shadow sits beneath the shoes. Mobile uses a 196px figure beside the existing identity/location and real Download CV control. Professional links follow; the accepted introduction and record controls remain easy to reach. Visual review caught and corrected an inherited grid rule that initially placed the mobile CV button across the shoes; explicit non-overlap checks now cover it.
- The original introduction, experience, education/training, Capabilities and evidence destinations are reused unchanged. The review script compares record text and links with the current route using the same frozen public content. CV downloads use the existing `CvDownloadButton`, URL validation and `/api/cv.pdf` fallback, rather than a new download implementation.
- A single entrance applies opacity 0→1 and translateY 12px→0 over 600ms. The record is static in the prototype. Reduced motion is static; changing the preference cancels the entrance immediately and returning to normal motion does not replay it. There is no continuous movement, distortion, Play control, audio, synthetic voice or lip animation.
- Loading reserves the same stage/record geometry and exposes a status. Image failure shows the accepted current portrait in the reserved stage with an explanatory status; records and CV remain usable. Space remains stable through pending load, successful decode and failed extraction-image load.

### Verification and limits

- `npm run typecheck`, `npm run lint`, `npm run build`, portrait unit checks (2), content-integrity checks (24), motion checks (20), and whitespace checks pass. Existing Profile portrait/records/Capabilities Chromium tests pass (22). All 30 new prototype checks pass across desktop, tablet and phone Chromium configurations, with retries disabled. These cover all four widths, normal/reduced motion and preference changes, keyboard tabs, default isolation, CV non-overlap, and pending/decode/error geometry. Total: 46 unit checks and 52 affected browser checks. The first prototype-only run exposed a too-strict dimension-ratio assertion at mobile sizes (0.013px CSS rounding); the rendered-pixel check corrects that test error without changing the image's aspect ratio. Final checks pass without retries.
- The read-only review script successfully downloads the existing 31,205-byte CV using keyboard Enter at all four widths, verifies `%PDF-`, and checks identical text/evidence destinations. No horizontal document/main overflow, no portrait-load-induced change to stage/record rectangles, no application exceptions and no non-GET/HEAD requests occur in the normal comparison captures. Browser layout quantization is checked in rendered pixels (at most 1/64px aspect-ratio rounding), rather than treating subpixel rounding as image distortion.
- Screenshots are 1× browser captures. The original WhatsApp JPEG is compressed and the retained body is about 310×1019 source pixels; fine hair and fabric detail remain limited by that photograph. Soft alpha removes mixed scenery pixels at the boundary, so subpixel hair/cloth outlines cannot be recovered perfectly from the compressed source. Enlarged inspection views show this source limitation; the app asset is never upscaled. Phone/tablet widths and touch are browser emulation on Windows Chrome, not physical Android/iOS confirmation. The existing large WebGL chunk advisory remains unrelated.
- The speaking/gesturing asset remains separate future production. Reserved script: “Hi, I’m Mahmoud. I build full-stack applications with clear interfaces and dependable backend workflows. Explore my work, or download my CV.” It is documentation only and adds no paragraph to Profile.
- Collection, case-study content/media, engineering interactions, text-hierarchy refinement, the reported Android freeze, backend/CV layout, CMS/database and provider settings are outside this change. No merge, manual deployment, production submission or live data writes were performed.

## Compiled Profile portrait review — 2026-10-19

This stage is stacked above draft #33 and commit `fe6ec7382075b51d2a4b51263eb5a7a6095b11ce` on a **new** branch, `prototype/profile-portrait-hosted-review`. The production branch `prototype/profile-standing-portrait` is unchanged. Draft #33's [CI #99](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/39245935618) completed successfully.

### Reconciliation

The successful deployment of `fe6ec73` was configured to preserve `/profile` and include the prototype only when `import.meta.env.DEV` was true. Therefore the compiled production app correctly shows its accepted portrait and routes `/review/profile-portrait` to NotFound. A direct read-only browser check confirmed the accepted portrait on `/profile` and the “404 / This page wandered off” view on the review path. Both HTTP responses were 200 because Vercel serves the SPA shell; this is an application route omission, not a failed deployment. Evidence: `docs/design/profile-portrait-hosted-review/production-state.json`.

| Item | Implemented in this review | Remaining |
| --- | --- | --- |
| Original-photo extraction | Existing faithful 326×1027 PNG/WebP and alpha cleanup reused byte for byte | Source compression limits fine facial/hair detail; a new capture is needed for more authentic detail |
| Standing composition | Larger complete figure; natural aspect ratio, both shoes, transparent background and subtle floor shadow | Visual acceptance |
| Entrance | One 600ms opacity/12px entrance; static reduced motion and preference cancellation | No talking, gestures or looping animation |
| Download CV | Existing validated URL and download component reused; keyboard/PDF checks at four widths | Hosted use follows existing Preview authentication/API availability |
| Hosted comparison | Explicit compiled review build packages comparison HTML, images, QA, validation and downloadable offline ZIP | Hosting/authentication verification recorded with the draft PR |
| Speaking/gesturing video | Script and production brief documented | Actual performance, audio, moving matte, browser encodes, accessible player and acceptance are not produced |

### Layout and source limits

At 390px the figure changes from 196px to 336px high (62.2px to 106.7px wide), making the head approximately 71% larger on screen. Identity, CV and social links sit beside the figure. The introduction starts at y=495px, compared with y=537px for the accepted production layout. At 320px, a 300px figure retains full-width social links beneath it; the introduction starts at y=555px versus the accepted y=548px. The figure never becomes a full-screen introduction. At 768/1440px it is 620px high (196.8px wide); desktop's portrait column is 224px instead of about 406px, reducing unused column width from about 254px to 27px. Tablet uses a 200px column. Desktop's real CV action directly follows the figure and remains visible in the 1440×900 capture.

The PNG/WebP are unchanged. CSS display size and layout changed, not face, expression, texture, pose, proportions or footwear. The supplied 326×1027 crop is a hard information limit. Browser resampling at high pixel density does not restore missing facial detail; no generative upscaling, sharpening or invented likeness was used. Full-body and face readability remain a tradeoff on narrow phones.

### Compiled review and protection

`npm run build:portrait-review` selects the explicit `portrait-review` mode locally. Vercel's ordinary `npm run build` enables the same flag **only** when `VERCEL_ENV=preview` and `VERCEL_GIT_COMMIT_REF=prototype/profile-portrait-hosted-review`. `VERCEL_ENV=production` always disables it, even with the local review mode. See `scripts/profile-portrait-review-build.mjs`. This uses Vercel's [documented build environment and Git-ref variables](https://vercel.com/docs/environment-variables/system-environment-variables), not a client query parameter or changes to project settings.

- Interactive route: `/review/profile-portrait`.
- Compiled comparison: `/review/portrait-comparison/index.html`.
- Download: `/review/portrait-comparison/portrait-review.zip`. The same ZIP is committed under `docs/design/profile-portrait-hosted-review/` and can be downloaded from the draft PR/repository when Vercel sign-in is required. Open its `index.html` to review the static comparisons offline; it contains no environment files or private API snapshots.
- `build.json` in the compiled comparison reports the Preview branch/commit and enabled review flag. The ordinary build excludes the route and comparison directory; `scripts/assert-portrait-production-build.mjs` verifies this independently.
- Neither review route is in navigation or the sitemap. The prototype uses `PageMeta noIndex`, the comparison includes a robots meta tag, and Vercel adds `X-Robots-Tag: noindex, nofollow` to review paths/assets. **Noindex is not access protection.** No Vercel authentication, passwords, deployment protection or bypass settings were changed. Reviewers must use the Preview deployment in the new draft PR, not the production domain or the old `fe6ec73` deployment.

### Verification and video requirements

Compiled Chromium checks pass for 320, 390, 768 and 1440px across desktop/tablet/phone configurations: natural aspect ratio, no horizontal overflow, visible and separate CV action, keyboard tabs, noindex, hidden navigation entry, static reduced motion, single entrance/cancellation, default portrait preservation and stable pending/decode/error geometry. All 33 compiled cases pass with retries=0. The read-only capture script verifies the existing 31,205-byte `%PDF-` download with Enter at each width and compares Profile text/evidence destinations against the current route. Captures and measured rectangles are in `docs/design/profile-portrait-hosted-review/validation.json`; matched comparisons are `comparison-390.jpg` and `comparison-1440.jpg`. Screenshots use frozen public GET data, not live writes, at 1× capture density; phone/tablet sizes are emulation.

Typecheck, lint, normal/review builds, the Production-exclusion assertion, 24 integrity checks, 2 existing portrait checks and the new build-policy check pass locally. CI adds a dedicated compiled-review job covering both normal-build exclusion and the flagged build. Final CI and hosted status are recorded with the new draft PR. The existing large WebGL chunk advisory is unchanged. Collection, case-study content/media, engineering behavior, the Android freeze and outstanding text hierarchy remain outside this work.

The moving, speaking portrait goal is **not complete**. `docs/design/profile-portrait-hosted-review/video-production.md` specifies a new full-body performance/audio recording, per-frame matting, poster, captions/transcript, browser-tested encodes and a real user-controlled player. Filming Mahmoud is the preferred faithful option; a separately consented performance-transfer workflow is an available alternative with identity/hand/footwear drift requiring review. No video was generated or uploaded, and no playback control, synthetic voice, lip animation or autoplay audio was added. No merge, manual deployment, production-branch push or live CMS/database write is part of this stage.

### Hosted access and review instructions

Draft [PR #34](https://github.com/MahmoudAbdulGhani/Portfolio/pull/34) is stacked on #33. The Git-triggered Vercel **Preview** for code commit `e5b5d76e75f748cc96005651c0adecf7eabe4d4f` completed successfully at `https://mahmoud-portfolio-bljw2ctks-mahmoud-abdul-ghani-s-projects.vercel.app`. The [branch Preview](https://mahmoud-portfolio-git-pro-ded3c7-mahmoud-abdul-ghani-s-projects.vercel.app/review/profile-portrait) follows subsequent review-branch commits; the final immutable deployment and completed CI result are linked in PR #34. Use the Preview, not `mahmoud-portfolio-omega.vercel.app` or the old production deployment.

Direct anonymous requests to `/review/profile-portrait`, `/review/portrait-comparison/index.html`, `/review/portrait-comparison/build.json`, the ZIP, and `/profile` returned **302 to Vercel SSO**, not an application 404. Authorized Vercel sign-in is required. Authentication runs before the app and cannot establish whether a protected page renders correctly; hosted content behind SSO was not inspected or claimed as inspected. No bypass token, cookie extraction or protection change was attempted. The compiled content itself was verified locally by 33 passing browser cases and the downloadable comparison was opened from a `file:` URL with all images decoded, without a server. `hosted-verification.json` preserves the initial deployment/authentication evidence. CI's [final-head checks](https://github.com/MahmoudAbdulGhani/Portfolio/pull/34/checks) include the independent compiled review job; see the final PR status before acceptance.

After sign-in, open `/review/profile-portrait` for the interactive static prototype and `/review/portrait-comparison/index.html` for current/proposed 390px and 1440px views. `build.json` identifies the review branch and deployed commit. When sign-in is unavailable, download `docs/design/profile-portrait-hosted-review/portrait-review.zip` from PR #34/the repository, extract it and open `index.html`. This is a comparison of the static prototype; the speaking/gesturing video remains unproduced.

## Original-photo head-to-hands refinement — 2026-10-19

This iteration starts at PR #34's latest head, `160cfda7c579477de33d20fa6b1371c1194b087b`, on `prototype/profile-portrait-original-refinement`. The earlier review evidence is preserved. The existing untracked `Codex_Engineered_Landscape_Handoff.md` is untouched and excluded. Neither the production branch nor default `/profile` is changed. The earlier successful production deployment intentionally kept the accepted portrait; it was not a failed deployment.

### Master, processing and honest limitations

- The user confirmed `C:\Users\Admin\Downloads\1000689121.jpg` after the named file became available. This exact 1536×2048 JPEG is preserved byte for byte at `docs/design/profile-portrait-original-refinement/1000689121.jpg`; SHA-256 `a7e497a5ac66f10f3c48030ae4e248fa6e8705c4c036572bc8de98154d35791e`. Neither AI reference supplies any pixels to the delivered portrait.
- `scripts/extract-profile-review-portrait.py` verifies the source hash and the existing ISNet model's MD5, then runs local CPU ONNX inference for **alpha only**. Pillow/numpy/ONNX Runtime and model weights remain outside the frontend dependencies, under ignored `.motion-preview/portrait-prototype/`. No photograph upload or generative editing is used.
- Native crop `[210,330,1170,2026]` produces a 960×1696 PNG master and lossless transparent WebP in `public/review-assets/profile-original-hands.*`. Hair, both ears, natural asymmetric posture, sleeves, watch, both complete hands and a small jeans margin remain. There is no resizing, facial reconstruction, beautification, sharpening, denoising or body transformation. Native source compression still limits fine detail; increasing display size does not restore detail.
- The sole RGB adjustment is a mild global monotonic curve, `round(255 * (channel / 255) ** 0.92)`, lifting existing shadows without a local face reconstruction or flattened skin. Every PNG RGB pixel is checked against the original crop plus that exact curve; WebP and PNG decode to identical RGBA. The untouched JPEG's hash is rechecked after copying. `processing.json` records the recipe and assertions. Equal-scale native face crops in `likeness-inspection.png` show original versus edited face, rather than comparing two differently sized images.
- Alpha cleanup uses a native-pixel minimum erosion and 25–230 black/white points. Visual inspection on charcoal caught ISNet making the pale left sleeve translucent. `scripts/profile-review-alpha-cleanup.json` registers a supersampled sleeve-interior trace; the processor extends opaque fill to two pixels inside the inferred exterior contour. A subsequent close inspection found pale paving retained in the narrow openings beside both backpack straps, which was hard to distinguish on cream. Both openings now have registered source-space traces with antialiased edges and a one-pixel expansion to remove mixed scenery pixels. This changes alpha only, never the underlying shirt RGB or backpack hardware. `arm-openings-inspection.png` compares original/cream/white/charcoal at native scale for each gap. A focused regression checks zero alpha at known paving points and full opacity at face, sleeve, watch and hand landmarks in both PNG and WebP. Initial masks are rejected; the final assets include these corrections.
- **Backpack and straps are retained.** The available deterministic matting tools cannot convincingly reconstruct the covered striped shirt. Clothing-only retouching remains a separate requirement if a backpack-free result is desired. The rejected AI portrait is not substituted, and no face or hand pixels are reconstructed.
- Visual checks cover actual cream `#ecebe3`, white and charcoal `#171b18`; full native composites, contact sheet and alpha mask are supplied. Hair, ears, shoulder contours, sleeves, arm openings, hands and jeans were checked. No large translucent sleeve patches, colored outline, scene debris or rectangular matte remains in the delivered asset. Compressed edge pixels and fine hair remain a source limitation; this is a review candidate, not a claim of perfect studio matting.

Reproduce using external Python packages `Pillow`, `numpy`, `onnxruntime` and the existing verified `isnet-general-use.onnx`: `python scripts/extract-profile-review-portrait.py <1000689121.jpg> <output-folder> --model-path <model.onnx>`. The PNG is 2,329,639 bytes; the pixel-identical lossless WebP is 1,473,210 bytes. The runtime uses the WebP only.

### Composition and behavior

The existing review route and `CvDownloadButton` are reused. The head-to-hands crop sits directly on cream, with no rectangular card, outline or shadow beneath a torso crop. The bottom aligns on a short jeans margin below both hands. Desktop uses a 300px portrait column and 520px reserved stage, balanced against the existing records; 768px uses 240px/424px. Mobile stages are 240px at 320px and 272px at 390px, with identity and the real CV button alongside. Natural ratio is preserved as width constrains the image. The introduction begins at y=495px (320px) and y=459px (390px), earlier than the preceding full-body review's y=555/495px. The face is substantially larger relative to the portrait, without inventing detail.

The accepted introduction, records, tabs, Capabilities and evidence destinations are unchanged and compared with `/profile` using the same frozen public GET data. The single 600ms opacity/12px entrance and immediate reduced-motion cancellation remain. There is no loop, fake playback control, synthetic voice, lip motion or audio. Loading reserves stage space and exposes status; image failure reuses the accepted portrait without shifting records or disabling the CV action. Final visual inspection caught the old status overlaying the fallback image; a reserved 64px message area now separates them, with a focused regression at all four widths.

### Review build and verification

The compiled comparison remains `/review/portrait-comparison/index.html`, with the interactive route `/review/profile-portrait`. The existing explicit flag now allowlists this refinement branch as well as the prior review branch in Vercel **Preview**, and always fails closed for Vercel Production. Ordinary local builds omit review routes/artifacts. Review routes remain outside navigation/sitemaps and noindex; noindex is not access protection. No Vercel authentication or deployment protection is changed. Promoting a deployment does not adopt this portrait on `/profile`; adopting it requires a separate accepted code change.

The new comparison folder is `docs/design/profile-portrait-original-refinement/`. It supplies matched 390/1440px current/proposed screenshots, individual 320/768px captures, native-scale face comparison, cream/white/charcoal edge checks, loading/fallback views, processing/validation records and `portrait-review.zip`. Extract the ZIP and open `index.html` without a server if Preview sign-in is unavailable. Earlier review folders remain historical evidence.

Typecheck, lint, normal/review builds, Production-exclusion assertion, build-flag/matte policies (2), 2 existing portrait unit checks and 24 integrity checks pass. All 33 compiled desktop/tablet/phone browser cases and 22 existing Profile/records/Capabilities Chromium cases pass with retries disabled. The read-only compiled capture verifies all four widths, no horizontal overflow, natural ratio, stable pending/decode/error rectangles, identical record text/evidence destinations, keyboard tabs and the existing keyboard CV download (31,205 bytes, `%PDF-`). The normal build also enables the review with simulated public Vercel Preview/ref variables; this is a local build-policy check, not hosted-content verification. The offline ZIP passes integrity checks and opens from a file URL with all comparison/inspection images decoded. CI and exact protected Preview access are recorded with the refinement draft PR after automatic Git deployment. Screenshots use Windows Chrome at 1× with frozen public GET fixtures; phone/tablet testing is emulation, not physical Android/iOS testing. No live CMS/database writes or actual contact messages occur.

Remaining: visual acceptance, optional faithful clothing-only backpack removal, and **the separate speaking/gesturing video production**. `video-production.md` retains the future script, performance/audio capture, moving matte, poster/captions/encodes and accessible real player requirements. No video is produced by this static prototype. Collection, case studies, engineering interactions, text hierarchy, Android freeze, provider settings and CV geometry remain outside scope. No merge or manual deployment.

### Refinement Preview access

The first Git-triggered refinement Preview, source commit `b1b001d2b5b0cfb4690b9649d082ae8ee425398c`, is Ready at `https://mahmoud-portfolio-ijtoq8zna-mahmoud-abdul-ghani-s-projects.vercel.app`. Its review route, compiled comparison, build manifest, download ZIP and current Profile all return **302 to Vercel SSO** anonymously, not an application 404. `hosted-verification.json` records these checks. Authorized Vercel sign-in is required; protected page content and hosted CV behavior could not be inspected from this session. Neither authentication nor deployment protection was changed or bypassed.

Use the **final refinement draft PR's Preview URL** for the completed fallback and arm-opening corrections and refreshed package; the first deployment above predates those corrections. After authorized sign-in, open `/review/portrait-comparison/index.html` for the matched comparisons or `/review/profile-portrait` for the interactive static prototype. `build.json` identifies the deployed branch and commit. If sign-in is unavailable, download this iteration's `portrait-review.zip` from the draft PR/repository, extract it and open `index.html`. The default `/profile` remains the accepted portrait in Preview and Production; the production domain is not the review deployment. Final deployment and CI status are reported on the draft PR without claiming access to content behind SSO.

## Mobile portrait composition — 2026-10-20

This iteration starts at draft PR #35, commit `376584bbc8297b2e0afaa8a80a36d69df3591af2`, on a new stacked branch, `prototype/profile-portrait-mobile-composition`. The local and remote PR #35 heads matched at inspection; no newer tracked work was present. The existing untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched and excluded. The faithful asset and accepted desktop direction are retained. No image processing, image regeneration, production-branch update, manual deployment or live-data write is part of this refinement.

### Mobile arrangement and measured tradeoff

The name now spans the full portrait column above the figure. At 390–430px, the figure takes a bounded 180–200px width with natural 960:1696 proportions; location and the existing CV action occupy the remaining width. Language information and social links use the full content width below that arrangement. Below 390px, the figure is centered on its own row and location/CV move together beneath it, with enough width for a one-line location and the uncompressed action. Mobile links and CV targets are at least 44px high; location/language type remains 14px with 24px line height. CV precedes social links in the prototype's keyboard order; the existing download component, URL validation and fallback remain unchanged.

| Viewport | PR #35 image width | Refined image width × height | Introduction top before → after |
| --- | --- | --- | --- |
| 320px | 135.17px | 180 × 318px | 495 → 709px |
| 390px | 153.95px | 190 × 335.66px | 459 → 674.66px |
| 430px | 153.95px | 200 × 353.33px | 459 → 668.33px |
| 768px | 240px | 240 × 424px | 117 → 117px |
| 1440px | 294.33px | 294.33 × 519.97px | 117 → 117px |

The larger natural figure makes the face 23–33% wider in the checked phone layouts and preserves both complete hands. Moving the metadata below adds about 209–216px before the introduction. At 390px the heading remains visible in the initial 844px viewport; at 320px its second line requires a small scroll past the existing footer. This is the explicit tradeoff for a recognizable face and uncramped metadata, rather than reducing type or cutting off hands. The portrait itself stays 318–353px high, not a full-screen figure. No extra spacer, photo frame, outline or shadow is introduced.

### Preservation and comparison evidence

- `public/review-assets/profile-original-hands.png` and `.webp` are unchanged byte for byte. SHA-256: PNG `5fc9eae59bcff7677bbd549c9dfb58f17aef2110d16e10178adaabde94114c91`, WebP `48398672854c525626ebc289321890a3896ad0f78d348c0d0b5a3c821d3faba6`. Source, alpha, hands, watch, backpack, lighting and processing remain exactly as approved in PR #35. There is no generative or synthetic detail.
- A fresh compiled PR #35 baseline was captured before changing the frontend, using the same read-only public-content/CV fixtures as the final capture. `scripts/review-portrait-mobile.mjs --before` records the baseline; the script without that flag records the refinement and produces side-by-side comparisons. Reproduction requires building the baseline commit before the first phase and the refinement before the second. All five widths use the same viewport dimensions and data on both sides.
- The 768px and 1440px before/after review screenshots have identical decoded-pixel hashes. Default `/profile` screenshots also match pixel for pixel at all five widths. The accepted introduction, records, tabs, Capabilities and evidence destinations are compared against the PR #35 baseline without modifying their text or links.
- `docs/design/profile-portrait-mobile-composition/` contains before/after 320/390/430/768/1440px captures, all five matched comparisons, phone loading/fallback screenshots, baseline/final geometry, unchanged asset hashes, changed-file list and an offline ZIP. The comparison explicitly labels the left side PR #35, rather than confusing it with production `/profile`.
- Visual inspection covers complete hands, recognizable face, one-line full-width name, one-line location, full-width languages, 44px actions, text wrapping and the transition into the records. Failure status remains separate from the replacement portrait. The existing 600ms opacity/12px entrance and immediate reduced-motion cancellation are unchanged.

### Verification, hosting and limits

Typecheck, lint, normal/review builds, the Production-exclusion assertion, portrait/build-policy/matte checks and 24 content-integrity checks pass. All 39 compiled desktop/tablet/phone review cases and 22 existing Profile/records/Capabilities cases pass with retries disabled. The capture runner verifies five widths with no horizontal overflow, unchanged portrait ratios, no application exceptions or non-GET/HEAD requests, and stable stage/record/CV rectangles through pending load, decode and image failure. Enter on the existing CV button downloads the same valid 31,205-byte PDF at all five widths. Affected browser regressions cover the new 430px width, full-width identity/languages/socials, larger mobile figure, comfortable action placement, CV-to-social keyboard order, static reduced motion and stability of all identity/action rectangles. The offline ZIP passes integrity checks and all five comparisons decode from a file URL without a server. Final CI results are recorded with the stacked draft PR.

The existing interactive route `/review/profile-portrait` and compiled comparison `/review/portrait-comparison/index.html` are reused. The explicit flag adds this named branch to the Preview allowlist, keeps prior review branches allowed and always fails closed in Production. Review routes remain absent from navigation/sitemaps and noindex; noindex is not access protection. The normal production build and default `/profile` retain the accepted portrait. Production promotion does not adopt this composition on `/profile`.

Use the mobile composition draft PR's exact Git-triggered Vercel Preview URL for this iteration. Prior Preview deployments required authorized Vercel sign-in; the final access result and CI link are reported on the PR after deployment. No authentication or deployment protection is changed or bypassed. If sign-in is required, protected hosted content/CV behavior cannot be claimed as inspected; extract `portrait-review.zip` and open `index.html` for the full comparison without a server. Local compiled-route verification is distinct from authenticated hosted verification.

Screenshots and keyboard/viewport checks use Windows Chrome emulation, with frozen public data. No physical Android/iOS device or screen-reader verification is claimed; the separate Android freeze report remains out of scope. Visual acceptance remains pending. Desktop redesign, text hierarchy, Collection, case studies, engineering interactions, provider configuration and speaking/gesturing video remain separate tasks. No merge or manual deployment.


## Approved speaking portrait integration — 2026-10-20

This stage follows the user's delegated `CODEX_PROMPT.md` in `Mahmoud_Speaking_Portrait_Codex_Package.zip`. Its instructions approve supplied take 2 and Mahmoud's supplied voice. It continues directly above open draft PR #38 at `c86d1824ce1568085d07c6c7f69a7382bb7904d6`, on `feat/profile-speaking-introduction`. Fetch confirmed the intended base; no reset, image regeneration, retouching or handoff-file changes were made. Earlier static-only/video-unfinished notes describe previous stages. This stage integrates the delivered video; it does not claim to have filmed or generated a new performance.

### Implementation and preserved scope

- The ordinary production build exposes the working player directly on **`/profile`**. There is no review flag/query dependency. Review aliases remain gated, noindex and absent from navigation; the comparison plugin/branch allowlist, production domain and deployment protection are unchanged. Promoting an older review-only deployment still cannot adopt this feature.
- First render retains the exact approved WebP URL/bytes and original priority, entrance, failure fallback and reserved dimensions. Phone figures remain 180/190/200px at 320/390/430px. Tablet is 240×424; desktop is a 300×520 stage containing the natural 294.34×520 figure. Both video encodes share the exact 30:53 image ratio. No cropping, cover, zoom, background card, body transformation or extra animation is applied.
- Native-button Meet Mahmoud / Pause / Resume / Replay, Stop and Listen instead controls follow the portrait actions across the full available column. They do not enter the narrow phone side column or cover the person/CV. Stop remains focusable after reset. Buttons have at least 44×44px targets and visible focus. Captions reserve 72px outside the figure; the transcript uses native details/summary. This adds a media-control group before the mobile introduction; heading → identity/portrait/location/CV → introduction → languages/socials → records remains the content order. On a 1440×900 initial viewport, the controls require scrolling below the unchanged portrait/identity block. No type or portrait was shrunk to make them fit.
- The existing `CvDownloadButton`, URL validation/document, Profile text, uncertainty, records, evidence links, tabs and disclosures are untouched. The spoken CV invitation does not initiate a download. Other pages, providers, CMS/backend and data are unchanged.
- `PortraitIntroduction` owns one fresh media element per session. No video/audio element, source or preload request exists before intentional activation. Phone selection uses 480px below 720px; otherwise 720px. The poster remains visible during load. Video stays hidden and muted until an actual decoded frame passes a same-origin 2D canvas alpha check on both top corners. Codec support alone never reveals it. Opaque/unreadable/unsupported video returns to the still image and requires a new explicit audio action.
- Pause/Resume, Stop, ended/Replay, loading/buffering/errors and a cancellable 15-second watchdog share the same owner. Abortable listeners, generation checks, canceled frame callbacks and retired-element cleanup prevent old promises/events from reviving a stopped/unmounted session. Stop/ended remove sources and restore the still. Page exit/unmount cancels; visibility/offscreen changes pause and require explicit resume. Reduced motion defaults to still + MP3, and switching the preference on stops safely. There is no autoplay, hover playback, automatic replay, scroll hijacking, synthetic CSS talking or decorative motion switch.
- Cue timing and exact transcript are parsed from the supplied VTT at build time. Captions do not use live cue announcements; one status region announces playback/errors. Transcript: “Hi, I am Mahmoud, a full-stack developer. I build clear interfaces and dependable back-end systems. Explore my projects, or download my CV.”

### Delivered assets, unchanged bytes

Only these four files are copied into `public/media/profile/` (4,467,048 bytes total). No source/intermediate encode, package review code, processing dependency or duplicate poster enters the frontend bundle.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `mahmoud-introduction-480.webm` | 1,523,283 | `343efe0a20731c7acd8056b5ec35ab80510c9dd0d03629b3720d83dd7d808f6d` |
| `mahmoud-introduction-720.webm` | 2,654,346 | `f15deb5ec861c231b555989975464ece43581a71241101f6a173dc08e6bc6b18` |
| `mahmoud-introduction.mp3` | 289,197 | `41225f959543f2ffe7f0ab10c46846ef772110efe7ad1fa47e5826a22f864a6a` |
| `mahmoud-introduction.en.vtt` | 222 | `30416c551129cced422e17e780704fb971fba539382990e9a1300a9ac05531c8` |

Poster remains `/review-assets/profile-original-hands.webp`, SHA-256 `48398672854c525626ebc289321890a3896ad0f78d348c0d0b5a3c821d3faba6`; its master PNG is unchanged. Neither supplied photo nor video was re-encoded or enhanced. An ignored local FFmpeg tool decoded review samples only; no dependency/package-lock changes were needed.

### Actual compiled-build evidence and visual findings

`docs/design/profile-speaking-introduction/comparison.html` and `comparison.zip` provide static offline evidence without Vercel sign-in. There are five before/after comparisons against a fresh compiled c86d182 baseline, two actual playback captures, a 390px introduction scroll capture, browser-decoded alpha composites and native decode contact sheets. `validation.json` records actual measured stage geometry, all three observed captions, complete playback, errors/writes, network body sizes and keyboard PDF hashes. `assets.json` and `changed-files.json` provide provenance/inventory. `scripts/review-profile-speaking.mjs --before` records a built baseline; without that option it verifies/captures the normal compiled integration with the same read-only fixtures.

- Complete real 12-second playback ran at 320/390/430/768/1440px, with correct completion, a restored static portrait and no horizontal overflow. Stage rectangles exactly match PR #38 at all five widths. Layout offsets/heights remain stable before/during/after playback. The original portrait proportions and complete hands remain visible; moving hands stay within the natural video frame in sampled images.
- Browser network traces show **zero media requests/bytes before activation**. Each phone loads only the 480px WebM, with encoded body size **1,523,283** bytes; tablet/desktop load only the 720px WebM, **2,654,346** bytes. No MP3 or second resolution loads during video playback. Audio mode uses only the MP3. Timing entries distinguish body bytes from response overhead.
- FFmpeg/libvpx independently confirms VP9 alpha, 480×848/720×1272, 25fps and Opus stereo at 48kHz, approximately 12.008s. Decode samples at 0/1/5/9/11.6 seconds from both encodes are inspected on actual cream `#ecebe3`, white and charcoal `#202629`; no black rectangle or detached matte fragment appears in these samples. Hair/ears, shoulders, arm gaps, shirt/backpack, watch and both hands remain legible. Some normal video softening, animated expression/hand changes and faint edge softness remain; sampled checks do not certify every generated frame. Corner alpha is 0–2/255 in sampled/browser frames (lossy alpha residue), below the fail-closed threshold of 16; it is not asserted to be numerically zero everywhere.
- Keyboard checks cover all playback buttons' focus/44px targets/footer clearance; CV Enter downloads the same existing **31,205-byte** PDF at every width, SHA-256 `ab0cb56f309799838a77d344a11c4b8ea3c2145008ae6deaeea65a8121964c8a`. Existing Profile regressions retain tabs/disclosures/evidence and delayed/failed-image geometry. CV/records also remain operable during an active media session and after blocked/failed playback.

### Checks, delivery and limitations

Typecheck, lint, normal and explicit-review builds, production inclusion/review-exclusion guards, 24 integrity checks and six portrait/media-identity Node checks pass locally. **150 normal compiled Profile cases** pass across desktop/tablet/phone configurations with retries disabled, followed by **six final cases** for rejected play promises and independent CV/record use. These include 16 focused playback tests per project: actual files, request deferral/selected encode, pause/resume/stop/replay/completion, real network failures, unsupported/opaque decode fallback, caption boundaries, watchdog/buffering recovery, preference/hidden/offscreen behavior, stale callbacks after reset/unmount and safe navigation return. The existing explicit-review suite also passes 15 cases, and three existing Profile entrance/motion cases pass. A final 16-case compiled playback run passes after the Vite-safe caption import adjustment; a byte-identity check keeps that source VTT identical to the downloadable delivered VTT. Scoped Git attributes prevent newline conversion of the two VTT copies on Windows/Linux. The race/opaque/timeout cases use an explicitly mocked media surface; real decoded playback and real failed requests are tested separately. Geometry checks use layout offsets/sizes rather than transient subpixel entrance transforms. A short viewport is used to genuinely scroll the whole stage offscreen; a tall empty-record fixture can retain a visible stage sliver at its scroll limit. Existing image-status tests are scoped to the stage because playback adds its own status region; assertions/deadlines are not weakened.

The stacked draft PR's delivery block records the exact immutable Git SHA, Git-triggered Vercel Preview **`/profile`** URL, final CI and anonymous access result after commit/deployment. That metadata is authoritative for the SHA to promote; a document cannot include its own future commit hash. No manually deployed, review-flag or mutable branch alias is presented as the production candidate. Follow the PR's final-head checks before promotion.

Windows Chrome viewport/touch emulation and frozen read-only public GET/CV fixtures are the verified environment. Physical Android/iOS, physical safe areas, Safari, Firefox, spoken screen-reader behavior and real production/CDN performance are not verified here. Safari transparency is **not** claimed; unsupported or unverified alpha uses the safe still + voice + captions/transcript option. The voice was supplied/approved by the user, but the assistant did not directly audition it or independently judge pronunciation/lip sync. Hosted protected content, media delivery and API behavior require authorized Vercel access if SSO redirects are returned; that is distinct from local compiled verification. No protection bypass/change, merge, manual deployment/promotion, Contact submission or live data write occurs.

After an authorized promotion of the PR's exact final deployment SHA: confirm the Git SHA and real `/profile`; check no media network activity until click; test phone/desktop transparency or explicit audio fallback, captions, pause/resume/stop/replay; verify reduced motion, keyboard CV/tabs, route exit, image/media failure and footer clearance; then audition the voice/lip sync on physical Android/iOS/Safari. Stop at integration review until those acceptance gaps are resolved.


### Immutable hosted candidate and CI timing follow-up

The first verified integration commit is `2a6cfddd6153197d59cf1a11bf984d13fa9c74be`, with Ready automatic normal-build Preview at https://mahmoud-portfolio-53clfcxcc-mahmoud-abdul-ghani-s-projects.vercel.app/profile. Draft [PR #39](https://github.com/MahmoudAbdulGhani/Portfolio/pull/39) is stacked directly on #38. Anonymous GETs to Profile, both encodes, MP3, VTT, CV and the review alias return 302 to Vercel SSO (noindex); authorized sign-in is required. Protected hosted player/media/API content was not inspected. Public comparison JPEGs/ZIP and changed-file list return 200 without sign-in.

CI #107 passed the 52 compiled normal Profile cases and 15 explicit-review cases without a retry in that job. The full desktop/mobile suites exposed a race in the existing Profile entrance assertion: it expected a fresh 600ms entrance after two navigation clicks without waiting for the lazy Projects destination to commit; it also inspected a transient computed duration. Those cases passed on retry; a separate unchanged Lobby link case also retried. The Profile regression now records the real animation-start event and checks exactly one entrance with its original `0.6s` duration, plus no reduced-motion/re-enable replay. No product animation code or test deadline is changed. This follow-up changes testing/documentation only; the supplied media, production player, all screenshots and measured output remain the same. The final PR delivery block records the follow-up head SHA, its exact immutable Preview and terminal CI; use that final SHA after review. Unrelated Lobby behavior remains outside this task.


The event-capture follow-up at `1fe5c68216e7348c5f2eb7a23e5a502b7edecbe2` has the identical production source/media, Ready Preview https://mahmoud-portfolio-2hwayjyts-mahmoud-abdul-ghani-s-projects.vercel.app/profile and the same SSO protection. CI #108's tablet smoke first attempt recorded **no entrance event**, then passed on retry. That evidence identifies the underlying navigation race: returning before the lazy Projects route commits can cancel that pending transition and retain the existing Profile component. No new entrance should occur in that case. The final regression therefore waits for the actual Profile DOM exit before returning, then asserts the captured single `0.6s` entrance and reduced-motion behavior. It changes no production behavior, duration or timeout. The PR's final delivery block identifies the final test/documentation follow-up commit, Preview and CI result; earlier immutable URLs above identify the observed iterations.

## Automatic speaking-portrait loop — 2026-10-20

This focused revision starts from draft PR #39 at `c058ba66e9dd3a9b53781b09da88e6c19bf3074b`, on `feat/profile-portrait-automatic-loop`. The inspected local/remote head matched that reference. No newer tracked work was replaced; the untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched and excluded. The new user request explicitly **supersedes** this document's earlier click-only, no-media-before-click, one-play/replay and explicit-resume-on-return requirements. Those historical statements describe PR #39, not this revision. Source photos, the approved still, both WebMs, MP3 and VTT retain their exact previously documented bytes. No regeneration, retouching, backpack removal, speed change or reverse playback occurs.

### Actual /profile behavior

- The normal compiled `/profile` first renders the approved still and its existing single 600ms entrance. Only after the still is ready, the entrance has finished, the stage intersects the viewport, the document is active and motion is allowed does the controller select and attempt the 480px (below 720px) or 720px WebM. It is muted, inline and hidden until a decoded frame passes the existing two-corner alpha check. No MP3 loads automatically.
- Healthy playback reuses one controller and one video element/source across visual cycles, audible takes and visibility changes. A blocked autoplay promise leaves the still and an explicit Resume/Hear action; hiding/showing does not continuously retry. Media/decode/opaque-alpha failure retires that video and retains the still. The same Hear action then uses the supplied MP3. A failed audio element is retired and can be retried only explicitly. A cancellable 15-second loading/buffering watchdog and stale-command guards remain.
- Hear introduction restarts the approved take at zero, enables sound only after verified video decode, and synchronizes the supplied VTT captions. The same button reads Mute introduction while speech is active. Speech completes once, then returns to muted visual looping when animation is allowed. Reduced motion and manually paused animation use the still plus optional MP3 instead. There is no separate mode selector, automatic speech, prominent Meet/Stop panel or fake playback control.
- Pause/Resume animation persists across hidden/offscreen transitions. Both conditions pause and mute immediately and cancel pending transitions/frames. Return resumes only the eligible muted loop; interrupted speech never resumes audibly. Preference changes, page exit and route cleanup invalidate outstanding work. Two always-visible, native 44px controls with text/icons/focus outlines sit outside the silhouette near its lower edge, beneath the prominent existing CV action. Captions retain a fixed 72px minimum and do not cover the person or shift the introduction/records. Captions are not live announcements; ordinary visual cycles leave the status message unchanged. The native transcript disclosure remains available.
- Portrait geometry, natural ratio, complete hands, established mobile heading/introduction order, tablet/desktop grid, record content/uncertainty, tabs, evidence, disclosures and CV implementation/document are unchanged. Figure stages remain 180/190/200px at 320/390/430px; tablet 240×424 and desktop 300×520 containing the natural-ratio figure. Review routes remain gated/excluded from ordinary builds and navigation. No Vercel authentication, providers, Collection or other page is modified.

### Source transition and review evidence

Independent first/last-frame inspection of **both delivered encodes** shows a real pose jump: mouth/eyes, hand placement and torso differ. Native hard looping would not be seamless. Each cycle therefore crossfades to the approved still over 180ms, waits for the actual opacity transition to finish (rather than assuming a fixed timer means it rendered), holds that still for 140ms, and decodes/reveals the forward start at 1×. Command-generation checks cancel a pending fade/hold when the visitor pauses, leaves or changes preference. This is a restrained still bridge, not an assertion of seamless source footage. Sampled frames show no black rectangle, disappearance, reversed gesture or cropped hand. Existing source motion/edge softness remains; it is not retouched.

`docs/design/profile-portrait-loop/comparison.html` is the offline review entry, with `comparison.zip`, original first/last-frame sheets, before/after and speech captures at all five widths, 390/1440px matched comparison JPEGs, actual bridge samples, two MP4 browser recordings and measured timelines/network/geometry/CV hashes. The baseline is a separately compiled c058 checkout, captured as a static reduced-motion reference; revised captures enable normal motion. It was removed after capture without resetting the working tree. `scripts/review-profile-loop.mjs --before` captures the baseline and `--record` captures the revision against a compiled build with frozen read-only GET fixtures. Set `PROFILE_REVIEW_FFMPEG` to an external FFmpeg executable for recording export; no processing tool enters the frontend bundle.

The phone and desktop recordings show arrival → a complete muted cycle and still bridge → Hear introduction → the full spoken take/captions → muted looping again. They use actual browser screenshot samples with measured wall-clock timing, encoded at 25fps; they are not 25fps hardware screen captures. This capture method preserves the compositor-only opacity frames that CDP screencast omitted in an earlier discarded review export. Audio is the unchanged approved Opus source muxed at the measured spoken-take origin, **not microphone/system-audio capture**; silence precedes the hearing action. Timeline JSON records the origin, native playback events, fully restored still at fade completion, same-element identity, one selected WebM request, no page errors and no non-GET/HEAD requests. This demonstrates player timing/presentation, not independently auditioned pronunciation, speaker output or hardware lip sync.

### Verification and delivery boundary

The broad compiled normal-build Profile pass completes **159 cases across desktop/tablet/phone configurations with retries disabled**, including existing records/Capabilities, original-image delayed/error geometry, footer/focus access, exact stage dimensions and production inclusion/review exclusion. Focused loop regressions additionally exercise three consecutive **actual** 12-second cycles with still-bridge completion and one complete audible take, selected-resolution loading, genuine hidden/offscreen arrival deferral, pause persistence, interrupted speech, preference changes, blocked autoplay, unsupported codecs, opaque frames, failed video/audio requests, buffering/watchdog cancellation, stale play promises/events, route exit, caption boundaries, status quietness and independent keyboard CV/record access. Only deterministic failure/race cases mock the media surface; responsive and full-cycle cases decode the delivered files. Old no-media-before-click expectations now require no media before eligible visibility/readiness, or under reduced motion. Unrelated regressions remain.

After the render-aware loop bridge, **60 final focused loop cases** pass across the three configurations without retries. A further **13 normal-build portrait cases**, **three existing Profile motion cases** and **15 explicit-review/comparison cases** pass. Typecheck/lint, normal/review builds, inclusion/exclusion assertion, 11 media/portrait/build/evidence Node checks and 24 integrity checks pass. The offline package verifies its ZIP entries, all 21 comparison images decode from a file URL and both recordings load their metadata without sign-in. The normal build is restored after explicit-review testing; only the existing chunk-size advisory remains.

Rapid preference emulation exposed a cancellation race in the old entrance regression: CSS can become static before the queued media-query cancellation commits, and re-enabling immediately could capture a second start. The portrait now consumes the change event's own `matches` snapshot and clears its entrance attribute synchronously with the matching state update. The test awaits that cancellation before emulating the next settings change; its exact single entrance and `0.6s` assertions and deadlines remain unchanged. No other motion test or page is changed. An added empty-Capabilities fixture check asserts the selected tab and panel's `hidden=false` property; an empty zero-height panel cannot satisfy a visibility-box assertion. Existing nonempty Capabilities/record regressions remain intact.

All five read-only visual captures preserve the exact c058 stage rectangles and no horizontal overflow. Complete hands and the natural-ratio face/body remain visible. Keyboard CV downloads produce the existing 31,205-byte `%PDF-` fixture, SHA-256 `ab0cb56f309799838a77d344a11c4b8ea3c2145008ae6deaeea65a8121964c8a`. Typecheck, lint, normal/review builds, production/review guards, media/still identity checks, integrity checks and final affected browser counts are recorded in the stacked draft PR delivery block alongside the final immutable source SHA, automatic Vercel Preview `/profile` URL, terminal CI and anonymous access result. That block is authoritative for the deployment commit; this document cannot contain its own future commit hash.

Verified environment: Windows Chrome desktop/tablet/touch viewport emulation and frozen public GET data; no CMS/database writes or Contact submissions. **Physical Android/iOS, Safari/Firefox transparent playback, physical safe areas, hardware audio, spoken screen readers and production/CDN performance are not verified.** The supplied face/voice are retained, but the assistant has not directly auditioned pronunciation or certified physical-device lip synchronization. If anonymous Preview access redirects to Vercel SSO, authorized sign-in is required and protected hosted player/media/API behavior remains unverified; the downloadable recordings/comparison remain available independently. No protection bypass/change, merge, manual deployment or production promotion occurs.

After review and any separately authorized promotion of the PR's exact final SHA: verify `/profile` arrives on the still then starts muted only while eligible; watch three loop bridges; use Hear/Mute and confirm one spoken take with captions then silence; check manual Pause across scrolling/tab switches, reduced-motion optional audio, transparent-video failure, keyboard CV/tabs/transcript and footer clearance; then audition on physical Android/iOS/Safari. This revision stops at the focused playback review.

## Profile portrait visual integrity — follow-up to PR #40

See [focused review](docs/design/profile-portrait-visual-integrity/review.md). Removed the facial-pose dissolve, corrected the Profile-only short-phone shell height, and revealed captions once on explicit hearing while retaining figure visibility where space permits. All accepted media bytes and existing playback options remain. Local typecheck/lint/build and 14 Node checks pass; focused browser regressions were added for CI. Source facial animation and a natural idle take remain separate, unfinished media work. No production promotion.

## Approved speaking-portrait refinement integration — 21 October 2026

Base: draft PR #41, `2b62f15f3f31d444f23a4750d9f124043be5ce92`, on new branch `refine/profile-portrait-approved-finish`. The original checkout was PR #40; fetch/PR inspection found #41 as its latest descendant. No newer overlapping tracked changes were present. The existing untracked `Codex_Engineered_Landscape_Handoff.md` is preserved and excluded. An independent compiled #41 checkout supplies the before captures; it does not reset or replace the working checkout.

Read the supplied `START_HERE.md`, `implementation-files.json`, review report and processing manifest. Applied **`implementation.patch`**, after a successful `git apply --check`; no attempt was made to fetch the unpublished `8aed1704814dfa4ed85275401489fc3c51a3492b`. Immediately after application, all ten resulting Git blobs matched the patch's declared implementation blobs, including both binary WebMs. This initial comparison respects Git's Windows text normalization. `docs/design/profile-portrait-refinement/package-verification.json` records that initial provenance check; final controller/test adjustments are described below. The supplied report is archived as `supplied-review-report.md`, distinct from this integration's own findings.

### Integrated behavior and preservation

- The approved silent repeat seeks from **11.60s to 0.20s** while retaining the last decoded video layer. No photograph, dissolve, reversed gesture or speed change is inserted at a cycle boundary. Hear starts at **zero**, bypasses the silent cut and reaches the natural end; Mute retains the current pose before continuing silently. The original still remains the loading/reduced-motion/error presentation. Unsupported transparency uses the existing explicit MP3 hearing action. Sound requires user activation.
- Compact visible Hear intro / Mute and Pause / Resume retain full accessible names and 44px targets. Transcript remains a native disclosure. Captions now sit directly below controls, outside the silhouette, with reserved two-line space. The existing explicit Hear scroll adjustment is retained; it does not follow each cue or move focus. On short phones, ordinary main scrolling or Hear reveals the whole figure/caption group. The initial heading/identity/portrait may extend below the first short-phone fold; the source image itself is not cropped to force all content into one screen.
- Phone widths remain **180/190/200px** at 320/390/430px. Tall tablet/desktop stage limits remain 424/520px. Short desktop height uses `clamp(240px, 100svh - 350px, 520px)` (424px cap on tablet); at **1280×720** the 370px stage contains the complete natural-ratio figure, controls, CV and captions. No face/body reshaping or backpack removal occurs.
- Approved still/master, MP3, both VTT copies, existing CV component/document, heading/introduction order, records/uncertainty, evidence, tabs and disclosures remain. Read-only captured record text matches compiled #41 at all six layouts. The existing keyboard CV flow downloads the same 31,205-byte PDF fixture, SHA-256 `ab0cb56f309799838a77d344a11c4b8ea3c2145008ae6deaeea65a8121964c8a`. No Collection, case-study, provider, backend or live-data change is included. Review aliases remain gated/excluded from the ordinary build and navigation; deployment protection is preserved.

### Assets and processing verification

Only the two approved **transparent WebMs from the patch** replace the website videos. The flattened MP4 review export and supplied comparison HTML are not used as Profile components or website portrait sources. The offline Python processing script remains outside the frontend bundle; no frontend dependencies or lockfiles are added.

| Website video | Bytes | SHA-256 |
| --- | ---: | --- |
| 480×848 | 2,703,633 | `41ef037004110db063d855915a0a78da7cc4f8a0ae51a743c43727a2b658cf49` |
| 720×1272 | 5,051,086 | `f29880da2d56148ffd8cc74d2707481359dc93a90f8870bc1d10c23dcd9de5af` |

Both decode to **300 frames at 25fps**, natural 30:53 ratio. Independent decoding of the previous approved 720 WebM and both new exports produces identical **2,301,952-byte PCM**, SHA-256 `8a6a84c426fb7ce285b966d9e9abd450df28ddf3416b1f545df082275ce5a62e`. This establishes audio preservation, including the source's complete final sentence; it is not a subjective voice/lip-sync audition. Native browser playback also reaches the final CV caption and natural end before muted return.

`processing.json` is retained as supplied. Its 95,549 edge-pixel corrections, zero interior changes and unchanged pre-encode alpha describe the package author's offline two-pixel cyan cleanup; this integration does **not** claim an independent rerun of that authoring pipeline. Output hashes, decoded frame count, PCM identity and browser alpha checks are independently verified here. The higher-detail exports add approximately **1.18MB / 2.40MB** over the old 480/720 files. This is deliberately larger media, not a bandwidth improvement or restoration of invented facial detail.

### Necessary integration adjustment

The unchanged existing buffering regression exposed a real issue in the supplied continuous-frame implementation: a queued frame could mark playback as looping and clear the watchdog after `waiting`. Each media owner now tracks buffering, cancels pending frame work on `waiting`, and resumes it only on `playing`. A late frame cannot clear loading or unmute while buffering. Stale generation callbacks also return before clearing the newer callback handle. This preserves the 15-second watchdog and prevents losing cancellation ownership. A focused Node regression verifies late-frame buffering/recovery; existing ten-cycle/stale-speech tests additionally assert exactly one pending callback. **No existing assertion is weakened and no deadline is increased.** The rest of the approved implementation is retained.

### Actual browser and moving-media evidence

`docs/design/profile-portrait-refinement/comparison.html` and its offline ZIP combine matched #41/current page captures, representative phone/short-desktop recordings, actual browser cut samples, consecutive native facial frames and edge composites. `scripts/review-profile-refinement.mjs` captures the compiled application using frozen read-only public GET/CV fixtures. It tests 320×640, 390×640, 430×844, 768×900, 1440×900 and 1280×720, including initial and after-Hear views. All inspected after-Hear figure/caption bounds fit the main surface above the footer, without horizontal overflow or control/silhouette overlap. Keyboard buttons keep visible focus and 44px targets. Existing regressions cover initial reading order, image loading/failure stability, records and disclosures.

Ten real muted repeats were audited independently for both resolutions. Per-render samples find no still layer, overlap or gap after video reveal; decoded corner samples remain below the alpha-rejection threshold. One persistent media element/source is reused, pending application video-frame callbacks never exceed **one**, and navigation cleanup leaves **zero**. `ten-cycles-390.json` / `ten-cycles-1280.json` retain samples, cut positions, callback counters, requests, native events and recording timing. Only the selected WebM loads; no automatic MP3 request or audible speech occurs. The phone recording uses a representative 390×844 viewport; the separate 390×640 captures and existing browser cases verify the shorter scrolled/Hear composition.

The approximately 26-second recordings show a real silent boundary, explicit Hear, the full spoken take and muted return. They use browser screenshot samples with measured wall-clock timing, exported at 25fps; they are **not hardware-rate screen captures**. The approved source audio is muxed at the measured speech origin, **not captured from system audio/microphone**. Native source inspection includes 64 consecutive facial frames across opening, name, middle and final-sentence runs, plus the 11.28–11.56s → 0.20–0.48s boundary sequence. Browser cut sheets are sampled from the recordings, not generated mockups.

The small source pose cut remains visible. Mouth/teeth shapes still vary in the supplied facial animation; retaining more detail does not correct that anatomy or create a genuinely natural idle performance. Full-figure cream (`#ecebe3`), white and charcoal (`#202629`) composites retain hair, shoulders, arm spaces, watch and hands with no black rectangle in the inspected samples. Lossy edge softness/residue remains; samples do not certify every pixel of every frame. No source performance is regenerated or retouched during integration.

### Constrained loading, checks and limits

CDP experiments apply **150ms latency and 1.5Mbps** after UI/still/fonts are cached, isolating media transfer. First verified playback is about **1.7s for 480** and **2.2s for 720**. The phone is still looping after the observation period; the desktop buffers while retaining the decoded frame. At **400kbps**, desktop first plays at about **6.1s** but repeatedly buffers over the longer observation. Only its selected resolution is requested; no sound starts. These experiments do not establish whole-page, hardware-network or live-CDN performance. Larger assets impose a real loading/buffering cost; no bandwidth improvement is claimed. `network.json` records timings and sampled states.

Local typecheck, lint, normal build and production inclusion/review-exclusion guard pass (existing chunk advisory only). The exact START_HERE Node command passes **14 checks** after adding the buffering regression; including existing review-build policies gives **17**. The existing integrity suite passes **24**. **189 normal compiled Profile browser cases** across desktop/tablet/phone and **15 explicit-review/comparison cases** pass with retries disabled. The normal build is restored afterward. Final-head CI results are recorded in the stacked draft PR delivery block, along with the immutable automatic Vercel Preview `/profile` URL and exact source SHA. That block is authoritative for deployment metadata; this document cannot contain its own future commit hash.

Verified environment is Windows Chrome viewport emulation, plus the existing desktop/tablet/touch browser regression configurations with frozen public GET data. Physical Android/iOS/Safari, hardware speaker output, subjective lip sync, spoken screen readers, safe areas and production/CDN performance remain unverified. Protected hosted playback/API/media requires authorized Vercel access if SSO is returned; local compiled verification does not claim access behind sign-in. Offline evidence remains available independently. No protection bypass, merge, manual deployment/promotion, Contact submission or CMS/database write occurs.

## Profile playback readiness and recovery — 21 October 2026

Baseline is open draft PR #42 at `767db8207fcaa0bc973bc65f9dbe519ba2e7afab`. Fetch/PR/working-tree inspection found no newer tracked work. Branch `refine/profile-portrait-buffering` continues directly above it; the existing untracked `Codex_Engineered_Landscape_Handoff.md` is untouched. Six compiled before layouts and the complete baseline loading matrix were captured before replacing the compiled baseline. Production is not promoted or modified.

### Reproduction and confirmed causes

`docs/design/profile-portrait-buffering/before-network.json` records 24 baseline visits: 390px/480 video and 1280px/720 video, unthrottled loopback, 1.5Mbps/150ms and 400kbps/150ms, cold/warm, whole-page/media-only. Whole-page throttling starts before navigation. Media-only tests load UI/still/fonts with reduced motion first, then enable throttling and motion. No Playwright request routing is used in these measurements: it disables browser HTTP cache. A Vite Preview server serves native static ranges/ETags with frozen GET-only API/CV fixtures. These are local compiled/browser measurements, not live CDN, server/database or physical-network measurements. Three independent CDP-throttled contexts run concurrently; CPU/browser variation limits numerical precision.

Cold uses an empty browser context. Warm revisits in that same context after the observation window; at 400kbps the earlier visit may leave a **partial** media cache. The separate `after-extended-network.json` waits long enough to observe cold recovery and then measures a completed-cache warm visit. Raw events, buffered ranges, readiness, sampled states, selected URLs, range requests/cache flags and geometry remain available. First-frame times refer to the first alpha-verified revealed video frame, not an independent perceptual movement detector. Startup waits and ordinary loop seeks are excluded from the in-take buffering count.

Three causes are supported by the baseline evidence:

- The unchanged 12-second assets average approximately **1.8Mbps / 3.4Mbps**, exceeding the constrained links. Starting with only about **0.5 seconds** buffered cannot sustain the take. The 480px cold 1.5Mbps media-only visit has three in-take waits; 720 has five. Warm/full-cache visits behave differently. This is principally a throughput/runway problem, not duplicated controllers.
- The existing 15-second wait watchdog can discard a **progressing** download. In the 480px/400kbps media-only run, the last wait is near media time **3.95s**; the buffered end continues advancing to **6.78s**, but the video is retired around 32 seconds. The 720px run also reaches the error fallback while data is still arriving.
- Each automatic visit uses one media element and only its existing breakpoint-selected resolution. Chrome makes metadata/seek range GETs, including suffix/index requests; multiple range GETs do not establish repeated whole-file downloads. Baseline capture did not account for every overlapping payload byte, so no byte-saving claim follows from the request count. The final measurement helper additionally records received payload/transfer chunks and cancelled ranges. Network Information API `effectiveType` reports `4g` even in the 400kbps experiment, so it does not justify silently changing resolution here.

### Focused implementation

Only `src/lib/portrait-introduction.ts` changes production behavior. The eligible visible video uses `preload="auto"` for **one selected existing file**, while the still/page remain usable. Silent startup and refill wait for the browser's native `HAVE_ENOUGH_DATA` / `canplaythrough` prediction, rather than an arbitrary fixed sleep or invented bandwidth threshold. An explicit Hear still starts at zero; the full take and final CV sentence remain untouched. After a genuine wait, the owned pause retains the last decoded video layer. Readiness resumes that command once; it does not repeatedly issue play from progress events. Native readiness is a prediction, not a guarantee: a partial-cache 400kbps warm visit can still need a refill.

The timeout number stays **15 seconds**. Its video loading/refill semantics now allow **genuinely advancing buffered data** to refresh it. Repeated progress events with the same buffered end do not refresh it; a load without advancement still reaches the existing still/voice/transcript fallback. This deliberately permits a slow, progressing load to last longer than 15 seconds in total. It does not make that load faster. Pause, Mute, visibility/preference changes and disposal invalidate pending recovery tokens and callbacks. The pause used to refill also invalidates its interrupted play promise before calling `pause()`; an expected AbortError cannot retire that same ongoing take. No file reload or new controller is introduced per cycle.

The component markup, CSS, controls, image/video/audio/VTT files, entrance, typography, order, CV and Profile records are unchanged; `preservation.json` records hashes and confirms the controller is the sole changed production path. There is no speculative second-resolution download, new export, facial/voice edit, retiming, reverse playback or facial dissolve. Offline source inspection and browser recordings stay outside the frontend bundle.

### Observed tradeoff

Representative cold **media-only** first revealed frames and in-take waits:

| Selected video / link | Before | After | In-take waits before → after |
| --- | ---: | ---: | ---: |
| 480 / unthrottled loopback | 0.39s | 0.30s | 0 → 0 |
| 720 / unthrottled loopback | 0.21s | 0.29s | 0 → 0 |
| 480 / 1.5Mbps, 150ms | 1.95s | 4.96s | 3 → 0 |
| 720 / 1.5Mbps, 150ms | 2.27s | 16.13s | 5 → 0 |
| 480 / 400kbps, 150ms | 4.60s, later error | 43.02s, extended recovery run | 4 before error → 0 |
| 720 / 400kbps, 150ms | 6.16s, later error | 90.13s, extended recovery run | 4 before error → 0 |

This is a **longer-still, fewer-interruptions tradeoff**, not a startup-speed or bandwidth improvement. At 400kbps, cold whole-page starts in the extended runs take **84.62s / 131.65s**, compared with early but interrupted baseline frames at **45.97s / 47.66s**. UI/font loading accounts for roughly another 41 seconds before video loading. The original 60-second observation is censored for those final cold whole-page starts; the extended run supplies the actual times. Completed-cache 400kbps warm media starts are approximately **0.51s / 0.40s**, with no observed in-take waits. Partial-cache warm behavior is separately retained and must not be presented as a completed-cache result. None of this guarantees uninterrupted playback on fluctuating real networks. Smaller/new performance assets would require a separately reviewed quality/size candidate; none is adopted or needed to fix this false-failure/recovery bug.

### Layout, moving media and source limitations

Before/after comparisons cover **320×640, 390×640, 430×844, 768×900, 1440×900 and 1280×720**. Arrival and after-Hear captures retain the same stage geometry, natural proportions, complete hands, 180/190/200px phone widths, heading/introduction order, records and caption/footer clearance. Short-phone arrival still extends below the fold; normal main scrolling/Hear exposes the complete group. Keyboard CV delivers the same 31,205-byte frozen PDF; tabs, disclosures and visible focus remain independently usable.

Ten actual muted repeats per resolution reuse one element/source: **6,901 phone / 6,942 desktop render samples**, no still flashes, overlaps or gaps, one pending application video-frame callback maximum and zero after navigation. Decoded corner alpha is checked at each cut. The 26-second phone/short-desktop recordings show the last audited cut, explicit full Hear/captions including “download my CV,” then muted return. They are measured-time sampled browser screenshots exported at 25fps, **not hardware-rate capture**. Audio is the unchanged approved source aligned to measured speech origin, **not system-audio capture or independent audition**. `rendered-motion-*.jpg` samples those actual-size browser recordings; source-time captions on the native sheets are separate from approximate recording offsets.

Native frame comparisons use the earlier delivered 720 WebM (`f15deb5e…`, extracted unchanged from the previous user ZIP), current 720 and current 480. `source-provenance.json` records hashes. The pre-encode `e536e2cf…` master cited by the refinement package is not supplied here, so attribution between original generation and earlier encoding is limited:

- **0.44–0.56s and 5.12–5.24s:** the mouth/teeth band and its fine boundaries change across the performance. The same structural appearance is present in the earlier delivered encode and both current exports; 480 loses additional fine detail. These frames do not support blaming the runtime or claiming that sharpening/compression repairs generated anatomy. Naturalness/pronunciation/lip sync are not independently certified.
- **8.88s and 8.92s:** detached grey matte fragments outside the lower forearms are confirmed in native decoded frames **and** the actual desktop recording. They appear in the earlier delivered 720 and both current exports. This is existing source/matte debris, not two composited facial poses, a black rectangle or a buffering interruption. `source-edge-8s.jpg` shows 8.80–9.04s across all three encodes. A corner-alpha support check cannot certify every interior alpha pixel.
- **11.56s → 0.20s** at the 11.60s silent cut: head, mouth and hand pose jump. It remains a source cut, not seamless footage. The spoken take bypasses that cut and reaches its natural end.

Separate media recommendation: review exterior alpha cleanup around the **8.80–9.04s** forearm motion against cream/white/charcoal, without touching hands/face or adopting a changed asset in this playback PR. If facial naturalness or the pose cut is unacceptable, obtain a new approved human performance with complete hands and compatible neutral start/end poses; compare the full sentence, original voice and those exact intervals before replacing anything. No CSS blend, speech retiming or extra sharpening is proposed as an anatomy repair.

### Verification and delivery boundary

Local typecheck, lint, normal build/production guard and explicit-review build pass (existing chunk advisory only). **192 compiled normal Profile cases** pass across desktop/tablet/phone, with retries disabled: 28 focused desktop cases plus 164 remaining cases, covering each configuration once. **15 compiled review/comparison cases**, **22 Node playback/media/matte/build/evidence checks** and **24 integrity checks** pass. The normal build is restored after review testing. The offline comparison's 23 referenced images decode and both recording tracks load metadata without a server/sign-in; ZIP integrity and local links pass. Final-head CI/Preview metadata is recorded in this stacked draft PR's delivery block. Existing assertions and deadlines remain; focused Node/browser regressions cover readiness, genuine/no-progress timeout behavior, retained-frame refill, explicit Mute/Pause, stale recovery/disposal and owned-pause AbortError handling. The browser media double now gives a `playing` event the native unpaused state so it correctly models an owned refill pause; no playback expectation is weakened. Final normal-build guard keeps review content excluded.

Verified environment: Windows Chrome viewport/touch emulation and real WebM decoding with frozen read-only fixtures. Deterministic failure/visibility/race cases also use explicit doubles. Physical Android/iOS/Safari, hardware speaker output, subjective lip sync, spoken screen readers, safe areas and live CDN/backend behavior remain unverified. If Preview returns Vercel SSO, protected hosted playback/media/CV remains unverified and the offline comparison/recordings are available without sign-in. Protection is unchanged. No merge, manual deployment/promotion, Contact submission or live CMS/database write.

## Approved still-body speaking portrait — 22 October 2026

This revision supersedes the earlier muted-only loop and one-audible-take policies. It starts directly above draft **PR #43 / `f992c7f2de462516f4a0f9e248991cf2ba0a1fd7`** on `feat/profile-still-body-loop`. Branch, remote heads and draft stack were inspected; no newer tracked work was discarded. The untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched and excluded. The normal compiled `/profile` adopts the supplied assets and playback behavior when this code is deployed; production is not promoted in this task. Review routes/protection/navigation policy remains unchanged.

[Offline comparison](docs/design/profile-still-body/comparison.html) · [downloadable ZIP](docs/design/profile-still-body/comparison.zip) · [390px before/after](docs/design/profile-still-body/comparison-390.jpg) · [320px](docs/design/profile-still-body/comparison-320.jpg) · [1440px](docs/design/profile-still-body/comparison-1440.jpg) · [short desktop](docs/design/profile-still-body/comparison-1280.jpg) · [phone recording](docs/design/profile-still-body/playback-390.mp4) · [desktop recording](docs/design/profile-still-body/playback-1280.mp4) · [changed files](docs/design/profile-still-body/changed-files.json).

### Assets and visual inspection

Read the ZIP's START_HERE, verification, processing and browser-review reports and its authoring/export/verification scripts before adoption. Its original “comparison, not adopted” status describes the package, rather than overriding this user's explicit approval. Only `Mahmoud_Still_Body_480.webm` and `Mahmoud_Still_Body_720.webm` are copied byte-for-byte to the existing `public/media/profile/mahmoud-introduction-{480,720}.webm` website paths. No supplied MP4 or previous-moving-body WebM is a production source. No frontend image-processing dependency, regenerated face/voice, retouching, gesture, speed change or facial crossfade is introduced.

Independent SHA-256 verification matches the package: **480: `be05f8501d8f902e5f79c2d543437dbe5f76c618889550bf9b0357c5ee6f6be9` (510,176 bytes)**; **720: `bcc8c7da11828be2800d472c9cc04ce66d2d19ab08dd3e6bdf5144a320685f23` (818,600 bytes)**. Both decode to **300 frames**, 12.008-second media duration and the same complete decoded PCM SHA **`8a6a84c426fb7ce285b966d9e9abd450df28ddf3416b1f545df082275ce5a62e`**. Existing MP3/VTT and approved PNG/WebP still remain unchanged. [Verification](docs/design/profile-still-body/asset-verification.json) and [preservation](docs/design/profile-still-body/preservation.json) record independent results; text comparisons normalize checkout CRLF only.

The supplied processing report describes unchanged speaking face rows 0–329, a premultiplied neck transition at 330–399 and body/clothing/hands fixed to source frame zero below row 400. Those **pre-encode invariance claims are package evidence**: its lossless master frames are not supplied, so this integration cannot independently reproduce that authoring audit. The website uses the supplied finished exports, not a recreation of the pipeline.

Inspected native decoded frames at **3.12s and 8.88s** on actual **cream `#ecebe3`**, white and charcoal: complete hands, cuffs, shoulders and watch remain visible; the frozen body avoids the earlier moving forearm debris. Hair/ears, shirt edges and neck/collar blend are visible in [3.12s](docs/design/profile-still-body/edges-3.12.jpg) / [8.88s](docs/design/profile-still-body/edges-8.88.jpg). Fine hair/ear edges retain source softness; this is not a perfect matte or anatomy certification. The [boundary sheet](docs/design/profile-still-body/boundary.jpg), native playback and temporal recording sheets expose the head/mouth change at **11.96s → 0s**, including the initial blink. **It is a visible source pose cut, not seamless looping.** No photograph bridge, new facial dissolve, reversed gesture, synthetic ending or trim is added. The `.32–11.96s` comparison boundaries are never used in runtime playback.

### Playback policy and lifecycle

The accepted still renders immediately. Only an eligible visible/active portrait after its entrance creates one breakpoint-selected inline WebM element. Native enough-data readiness and decoded alpha support are checked before playback/reveal. A fresh session attempts audible `play()` normally. `NotAllowedError` immediately retries muted once and latches that preference; the clear **Enable sound** action is required to enable it again. If muted playback is also rejected, the still and **Play introduction** remain usable, with no visibility-triggered retry storm. Audible autoplay is browser-controlled and **not guaranteed**; no unrelated click, scroll or hidden interaction enables sound.

Native `video.loop` repeats the **complete 12.008-second recording indefinitely**, with original final “download my CV” speech and synchronized, non-live captions. There is no finite repeat count, manual time cut or single-take audible stop. Explicit Enable sound restarts at zero to avoid beginning mid-sentence; subsequent cycles remain audible. **Mute changes sound without pausing or seeking.** Pause/Resume persists until the visitor changes it. Both sound and pause choices survive route revisits in session storage, with an in-memory fallback if storage is unavailable. Sound changes never override a manual pause.

The ten-cycle audit caught Chrome's brief `waiting` during a **fully cached native loop seek**. The controller now lets that native seek finish rather than manufacturing a refill pause/play command on every cycle. The same 15-second watchdog still guards a stalled wrap. Genuine underruns retain the decoded layer, wait for native enough-data readiness and refresh the unchanged watchdog only when buffered data advances. Commands still invalidate stale promises/recovery tokens and own their cleanup. No media reload or controller creation occurs per cycle.

Offscreen, hidden-tab and route exit stop both video and sound; visibility return resumes only when not manually paused, honoring the saved sound preference through the normal play promise/policy. Reduced motion initially creates no media and retains the still with explicit **Play introduction**. Existing MP3 fallback is explicit and **one-shot**, never an invisible repeating audio loop. Unsupported alpha/codecs, media failure, blocked playback, transcript, CV and record access retain usable fallbacks. Captions are `aria-live="off"`; the status region does not announce every native wrap.

### Compiled verification and evidence limits

Six layout captures cover **320×640, 390×640, 430×844, 768×900, 1440×900 and 1280×720**. Baseline left images are the committed **PR #43 speech captures**, reused without claiming a new baseline deployment. Right images use this normal compiled build and the same frozen public GET/CV data. Existing layout/CSS/Profile content and still assets are preserved: **180/190/200px** phone stage widths, natural proportions, complete hands, heading/introduction order, desktop/tablet grid, reserved captions, CV prominence, entrance and reduced motion. An explicit sound action reveals the reserved caption area once on short screens, as before. Initial-arrival captures remain separate from that scrolled speech view. Keyboard targets are at least 44px, have visible focus and sit below the silhouette. No horizontal overflow; captions clear main/footer; keyboard CV downloads the same **31,205-byte** fixture PDF; tabs and uncertainty/evidence content remain intact.

**Ten real native repeats per resolution** use a single selected source/element, **one application play call**, maximum **one pending video-frame callback**, no sampled still flashes/overlapping layers/gaps, and zero pending callbacks after navigation. Native `played` coverage reaches **[0, 12.008]**, rather than inferring full duration from a screenshot sampler that can miss the last 40ms under load. [Phone audit](docs/design/profile-still-body/ten-cycles-390.json) / [desktop audit](docs/design/profile-still-body/ten-cycles-1280.json) retain events and measurements. Recordings demonstrate an automatic muted repeat, explicit sound, **two complete audible cycles including the final CV caption**, then Mute and Pause/Resume. They are timestamped sampled browser screenshots with approved source audio muxed at the **first** measured audible play origin, not hardware-frame-rate or system-audio capture. Temporal sheets supplement the actual native browser playback observations; subjective lip-sync and independent listening are not certified.

[Fresh-browser evidence](docs/design/profile-still-body/fresh-browser.json) is actual Windows headless Chrome decoding with the Playwright autoplay-permission argument removed: **audible autoplay resolved** here. A separate requested `document-user-activation-required` browser-policy run also resolved audible playback in this environment; it must **not** be reported as an observed rejection. Audible rejection → muted success and both-rejected → explicit Play are covered with explicit **mocked play-promise policy conditions**, separately from native decoding. Physical fresh-visitor autoplay restrictions remain a verification gap. No production policy bypass is added.

[Constrained-network measurements](docs/design/profile-still-body/policy-network.json) use real decoding/native HTTP range/cache, **400kbps / 150ms CDP media-only** throttling after UI/still are loaded, cold and then completed-cache warm in the same context. First verified playback: **480 cold 2.888s / warm 0.341s; 720 cold 4.910s / warm 0.946s**. Only the appropriate resolution is selected. These are local media-only observations, not whole-page/live-CDN/physical-network guarantees or an encoding-quality/bandwidth comparison. Progressing-load/no-progress, delayed/failed image geometry, alpha failure, unsupported codecs, audio/video failures, keyboard/transcript/CV/tabs, hidden/offscreen/reduced-motion and stale-unmount cases retain focused Node/browser coverage. Assertions and deadlines are not increased to conceal failures.

Local typecheck, lint, normal build and production inclusion/review-exclusion guard pass (existing large-chunk advisory only). **29 Node playback/media/matte/build/evidence checks** and **24 integrity checks** pass. The broad normal compiled run passed **195/198** cases; two navigation responses failed while its `dist` was being rebuilt, and one fake-clock media case lost its element under concurrent load. The unchanged affected cases then pass in a serial **six-case** tablet/phone run; the controller passes all **30 focused desktop playback cases**, retries disabled. A final cancellation review also found that Mute before the first play/frame resolves must rearm the same inactivity watchdog; the added exact-15s Node regression verifies this without pausing playback. Typecheck/lint/build/guard and affected compiled lifecycle/watchdog cases are rerun for that focused follow-up. This is not described as a clean 198-case local run. CI rechecks the final commit from a clean build; its terminal results are authoritative in the draft PR delivery block.

An initial review-config run accidentally reused the normal server, correctly rejecting its absent review routes. A separately compiled explicit-review build on an isolated port passes all **six compiled comparison/alias cases** across desktop/tablet/phone, including noindex and offline assets. Normal `dist` stays normal. The offline comparison opens as a file URL: **nine images decode**, both MP4 tracks load metadata, all **21 local links** resolve and ZIP integrity passes. The recordings' temporal inspection sheets and source sheets remain review-only assets. No test assertion or deadline is relaxed to obtain these passes.

Final-head CI/access metadata is recorded on the draft PR delivery block once terminal. Physical Android/iOS/Safari, hardware audio, independent lip-sync/voice audition, spoken screen readers, safe areas and live CDN/backend remain unverified. A protected Preview requiring Vercel SSO does not establish hosted playback or an application 404; the public evidence ZIP/recordings provide review separately. No protection changes, merge, manual deployment, production promotion, Contact submission or live CMS/database writes.

## Public-production loop investigation — 22 October 2026

**Decision: retain the approved PR #44 media and controller.** This is a documentation/evidence-only review above `141bfddcbdf929d35fcb17ba96f352aefc2dfa8d`; no runtime, image/video/audio, layout, Profile data, test or deployment change. The untracked handoff is preserved. [Full review, source/native-frame evidence, silent recordings and physical-device checklist](docs/design/profile-production-loop-review/review-report.md).

### Independently observed production results

The actual public [`/profile`](https://mahmoud-portfolio-omega.vercel.app/profile) returns HTTP 200 without sign-in. Fresh deployed 480/720 downloads match approved SHA-256 `be05f8501d8f902e5f79c2d543437dbe5f76c618889550bf9b0357c5ee6f6be9` / `bcc8c7da11828be2800d472c9cc04ce66d2d19ab08dd3e6bdf5144a320685f23` (510,176 / 818,600 bytes). All seven entry-linked production JS/CSS files match the ordinary local baseline build; this is payload identity, not independent Vercel deployment-SHA metadata.

Fresh Windows headless **Chrome 155** at **390×844 and 1440×900**, with the autoplay-permission override removed and initial raw CDP evaluation marked `userGesture:false`, genuinely rejects audible autoplay with **NotAllowedError**, then resolves the immediate muted attempt. Both activation flags are false. Enable sound then explicitly restarts from zero; Mute preserves time/motion. This is actual native browser policy, not a rejected-promise mock. Earlier DOM-driven probing permitted sound after automation primed activation; [calibration](docs/design/profile-production-loop-review/activation-calibration.json) distinguishes that from the no-gesture sequence. Sound autoplay is not guaranteed.

Both selected resolutions complete **ten consecutive muted native loops**: 3,001/2,998 presented frames, 7,263/7,264 render samples, zero sampled still flashes/overlapping layers/gaps, zero sampled blank-shirt or opaque-corner tiles. One video element, two initial play calls (audible rejection + muted success), nine stable owned media listeners, maximum one pending application frame callback; route cleanup leaves zero active listeners/callbacks. No per-cycle application replay/reload. Native `played` covers **0–12.008s**. This is targeted sampling/instrumentation, not exhaustive pixel or hardware certification. [Metrics and raw traces](docs/design/profile-production-loop-review/findings-summary.json).

Two additional complete unmuted-state cycles per size show the final “Explore my projects, or download my CV.” caption. Pause persists across offscreen return and route revisit; changing sound while paused does not resume it. Actual scrolling suspends video/sound at both sizes and returns muted unless paused. Keyboard controls have visible focus and ≥44px targets; valid 31,205-byte live CV downloads and Profile tabs/Capabilities work. Live-generated CV hashes differ; no byte-identity claim is made for them.

### Root cause and evidence

Independent FFmpeg 7.1 decoding of fresh live files exposes the same expression discontinuity in **source frames 299→0**: neutral/closed-mouth final pose, then different initial expression/blink. [Last six/first six source frames](docs/design/profile-production-loop-review/source-consecutive-boundary.jpg), [actual phone boundary](docs/design/profile-production-loop-review/rendered-boundary-390.jpg), [desktop boundary](docs/design/profile-production-loop-review/rendered-boundary-1440.jpg). Face RGB change is approximately **19.6–19.8/255**, versus approximately 1.2–3.7 for neighboring inspected face pairs. The approved export endpoints do not match; the cut exists before browser/controller behavior. Unseen pre-encoding performance provenance is not established by this measurement.

Native wrap frame delivery takes approximately **83–117ms** in the instrumented headless capture (ordinary sampled median 33.4ms), so native seeking can add a small interval. This includes instrumentation/compositor overhead and is not hardware frame pacing. There is no observed controller pause, poster switch, black layer or facial overlap at the cut. No safe code-only change removes the endpoint expression mismatch. **No facial dissolve, frozen expression, synthetic/reverse frame, speech trim, retiming or added pause is introduced.** There is no changed-media candidate or artificial before/after comparison. A future matching-endpoint source take needs separate approval and full-sentence phone/desktop comparison; keep the approved source meanwhile.

Fresh **3.12s/8.88s** source composites on actual cream (`#ecebe3`), white and charcoal retain complete hands, cuffs, shoulders and visible neck/collar join. No detached white fragment was visible in inspected sheets/recording samples. Source edge softness remains; no claim of perfect anatomy, matte, lip-sync or seamless looping.

### Listening, lifecycle and device limits

[Phone](docs/design/profile-production-loop-review/production-loop-390-silent.mp4) / [desktop](docs/design/profile-production-loop-review/production-loop-1440-silent.mp4) recordings show native muted repetition, explicit sound-state change, two full repeated caption cycles and Mute. They are **silent Chrome compositor captures**, encoded to review MP4 from variable-cadence timestamps, with no source-audio mux. They do not establish hardware AV synchronization. The [complete decoded source WAV](docs/design/profile-production-loop-review/approved-full-audio.wav) is provided separately for human audition. Both WebMs have identical complete decoded PCM SHA-256 `8a6a84c426fb7ce285b966d9e9abd450df28ddf3416b1f545df082275ce5a62e`. Direct listening, speaker-output overlap and subjective lip-sync could not be verified by this agent; PCM identity/captions/media state are narrower evidence.

An actual foreground-tab change in headless Chrome left `document.hidden` false, so **real background-tab/OS suspension remains unverified**, despite source/environment-test coverage. No physical Android Chrome or iPhone Safari was available through this session. Phone viewports are browser emulation; desktop WebKit is not iPhone evidence. The review includes a short actual-device checklist for first-visit permission/alpha, full repeated speech, mute/pause persistence, scrolling/background/lock, reduced motion, poor network, focus/touch/CV/tabs and documented hardware listening/capture methods.

### Controlled checks and validation

Separately labelled [production-page controlled conditions](docs/design/profile-production-loop-review/production-controlled-conditions.json) pass: browser reduced motion retains the still and explicit one-shot MP3/transcript; client-aborted WebMs retain working failure/MP3 fallback; CDP media-only **400kbps/150ms** after UI/still load selects 480, verifies transparency and starts in **2.369s** with recorded stage/control/details/intro/tab geometry unchanged. These are induced/emulated conditions, not a production outage, physical connection, unsupported Safari decoder or bandwidth comparison.

Cold exploratory page readiness took **4.84–5.40s**; an earlier five-second probe was insufficient. A later up-to-30s observation measured completion without modifying any regression deadline. An early single-frame startup probe yielded an empty portrait and was rejected as normal-arrival evidence; accepted compositor-driven captures follow verified frame presentation. [Capture notes](docs/design/profile-production-loop-review/capture-notes.json) preserve this limitation; initial physical-device paint remains open.

Current-run **typecheck, lint, ordinary build, production inclusion/review-exclusion guard and all 24 focused Node playback/media/portrait/build-policy checks pass** on unchanged application code. Build retains its existing chunk-size advisory. Node media doubles/source assertions are distinguished from real production decoding. No tests/deadlines are weakened; no frontend dependencies or processing tools are bundled. This review does not claim a new clean broad browser run; final documentation-PR CI metadata is reported separately. No merge, manual deploy, production promotion, live-data writes or Contact submission.

## Portfolio accuracy and public copy — 23 October 2026

Focused follow-up above PR #46. [Full review, before/after captures, genuine provider observations and PDF evidence](docs/design/portfolio-accuracy/review-report.md). Recruiter assessment no longer enters the signed candidate-summary plan or tailored PDF. Invalid/legacy plans use the approved factual summary. Shared employment rules retain recorded types and month precision; no contractor or exact-duration inference. Digital Hub/FALA and two case-study introductions use factual public copy while internal evidence and meaningful limitations remain. Accepted design, portrait/media/controller, records/dates, handoff and PR #45 historical findings are preserved.

Tailored sections now follow actual content; one-project gap falls from 87.4pt to 9.8pt. Standard CV reference geometry remains unchanged. PDFs were rendered and visually inspected in addition to bounds/text checks. Local typecheck/lint/build/production guard, integrity (39), landscape/provider (13), CV/reference/overflow and affected compiled browser checks pass. All five requested widths are covered through Chrome emulation, not physical devices. A genuine local Job Match SSE answer and actual signed PDF download succeeded; genuine assistant attempts returned upstream 503, leaving that provider-answer check open. No uncontrolled retries were added. The historical production error cannot be diagnosed definitively without its request logs.

CI #117 cancellation was traced to slow Ubuntu mirror downloads plus job deadlines, without a preceding assertion failure in cancelled jobs. The official HTTPS archive and complete two-shard smoke matrix preserve tests, assertions, workers and existing deadlines. Coverage listing proves all 237 cases per viewport appear once. Final-head terminal CI and protected Preview access are recorded in the stacked draft PR delivery block; pending status is not a pass. No live data writes, Contact submission, merge, manual deployment or production promotion.

Preview access was checked: /profile redirects HTTP 302 to Vercel SSO. [PR #47](https://github.com/MahmoudAbdulGhani/Portfolio/pull/47) records the exact final SHA and terminal CI results. Candidate CI #118 revealed that runner apt sources use mirror+file lists; the initial direct-source rewrite did not change the active Azure mirror. The corrected installer also updates /etc/apt/apt-mirrors.txt and its security counterpart, retaining signed repositories and unchanged tests/deadlines. Superseded-run cancellation is not a final-head pass.

## Job Match failure and retry recovery — 23 October 2026

Focused follow-up above PR #47 / a8ef192. [Full root-cause review, before/after captures and PDF evidence](docs/design/job-match-recovery/review-report.md). The old duplicate bucket was a submission cooldown consumed before provider work and retained after errors, not a completed/cached report. The normal compiled baseline reproduces simulated upstream failure → misleading duplicate 429. One fresh actual public Chrome comparison succeeded; the historical initial provider error remains undiagnosed without production logs.

Active owned leases, successful-report cooldown and rate/provider waits are now separate. Failure/cancellation retires active state without refunding the existing four/minute budget. Transactional completion/release prevents false completion after storage rollback. UI honors real retry metadata, preserves input, offers cancellation, requires stream completion and ignores stale responses/tokens. No automatic provider retry, deadline increase, schema migration or live content edit. Accepted portrait/media/controller, layouts, images, grounding and both CV implementations remain unchanged.

A controlled first failure followed by exactly one genuine local Gemini retry succeeded in 6.138s and returned an actual signed PDF. Renders retain factual candidate summary, recorded dates, team scope and AWS training; a current one-project fixture retains the accepted 9.8pt skills gap and standard CV reference passes. Screenshots cover loading/error/recovery/cooldown at 320/390/430/768/1440px: Chrome emulation, not physical devices. Local typecheck/lint/build/guard, 50 integrity, 14 landscape/provider, CV/reference/overflow and affected compiled browser checks pass. The isolated baseline was moved outside the repo after a temporary ESLint TSConfig discovery conflict; rules were unchanged.

Final-head terminal CI status, exact Preview SHA/access and changed-file manifest are recorded in the stacked draft PR delivery comment once complete; pending is not success. Production logs, physical-device/screen-reader checks and live PostgreSQL concurrency/failure validation remain gaps. No merge, manual deployment, production promotion, Contact submission or CMS/database-content changes.

Candidate CI #120 exposed an immediate cancellation assertion running before the existing animated route exit unmounted the page. The test now waits for the actual unmount and retains the strict cancellation assertion within the existing expectation deadline. It also verifies keyboard-focused CV action clearance against header/footer at every width. No application transition, assertion or timeout was relaxed. Five additional scrolled report captures make success/actions visible at every width (40 compiled state captures total). Final-head CI is rerun in full; the candidate failure is not reported as a pass.
# Public wording refinement after PR #48 — 24 October 2026

Started from `d91555b296d21dec053c8667062fdd295c58b2d6`; preserved the untracked handoff and the complete draft stack. [Detailed copy decisions, changed areas, before/after comparison, PDF renders and limitations](docs/design/public-portfolio-copy/review-report.md). [Offline comparison](docs/design/public-portfolio-copy/comparison.html).

Reviewed Collection, Projects, all eight case studies, all Profile tabs, Job Match, Ask Portfolio AI and standard/tailored CVs. Visitor copy now describes relevant work and meaningful scope without routine evidence/verification/audit commentary. Internal source notes and qualification/attribution constraints remain in the application. Exact legacy CMS section/SEO descriptions are normalized at read time, so a refresh cannot restore the old wording; no live CMS edit.

All requested Job Match labels adopted. A genuine initial AI sample showed prompt-only cleanup still allowed false AWS completion/negative credential commentary and an Ishtari internship inference. Final summaries now use source-owned skills and role/date references; direct qualification/design-origin answers have factual source handlers. Explicit AWS qualification differences appear concisely under Requirements to discuss. Confirmed LIU graduation/Digital Hub completion, self-directed Angular, team contribution boundaries, supplied-design credit and practical frontend/backend scope preserved.

Validation: typecheck/lint/normal build/production guard; 59 integrity/API, 14 landscape/provider and 20 motion/boundary cases; 52 affected compiled desktop-Chrome cases plus 45 final split cases across desktop/tablet/phone configurations, all with retries disabled; all five requested widths. Static CV/reference/overflow checks pass. 36 before/after captures and real/source/replayed AI methods are labelled in the review report. CI identified three remaining old-copy expectations in User Management, Medicare and Cedar; they now require the rewritten descriptions, retaining all image, keyboard, focus and geometry checks. The corrected 18 media cases passed locally in Chrome/Firefox/WebKit and six reader cases passed across desktop/tablet/phone Chrome configurations, with retries disabled. Final-head CI and automatic Preview access are appended to the PR delivery comment once complete; no pre-emptive CI pass claim.

Actual public standard CV downloaded and PDFs rendered/visually reviewed. Standard CV line text and geometry match PR48 exactly in both modes for identical data/config. Existing *uncustomized default-catalog* application skill rows overlap education and overrun the right margin (609.32pt); actual public standard CV has neither problem and stays within bounds (571.70pt). No CV geometry/config/fixture edits. Initial genuine tailored download valid; later final-path matcher probes returned one formatting failure and two provider 503s, so no final-path genuine success is claimed. Physical devices, production logs and protected hosted verification remain gaps. Browser emulation is labelled separately.

No CSS/layout/media/playback/sculpture, streaming/retry implementation, deployment protection, live content or unrelated project changes. No merge/manual deployment/promotion/Contact submission. Earlier review findings below are preserved.

## Job Match requirement interpretation after PR #49 — 26 October 2026

Continues `448ca6fd6e06202213840bee6ba183072ce12b8e` on `fix/job-match-requirement-scope`, stacked above `refine/public-portfolio-wording`. The handoff and previous QA findings are preserved. [Focused review, before/after and methods](docs/design/job-match-requirement-scope/review-report.md), [offline comparison](docs/design/job-match-requirement-scope/comparison.html), [comparison download](docs/design/job-match-requirement-scope/comparison.zip), [changed files](docs/design/job-match-requirement-scope/changed-files.txt).

Root cause confirmed in source: provider-authored gaps/related experience/strengths/project prose were not bound to the job’s requirement type and topic. PR49 had source-owned summaries and an AWS-specific comparison guard, leaving the reported accessibility-certification/formal-audit sentence able to pass through. Production logs are unavailable; the provider’s internal reasoning is not inferred. A shared requirement interpretation now supplies explicit formal requirements to the prompt and guards the public formatter. Practical accessibility/security requests do not authorize credentials, formal audits or named compliance standards. Actual certification/audit/standard requests retain their scopes, AWS preferences remain, waived qualifications do not become requirements, and useful separate work descriptions survive.

Controlled before: “Dedicated web accessibility certifications or formal audits are not listed.” After: “Discuss the approach to implementing and testing accessible interfaces.” The before/after fixture uses the same report and PR49/current source formatters; it is not an archived production report or model A/B. Existing public labels, candidate summary construction, internal grounding, qualifications, team attribution and supplied-design credit remain covered.

Validation passed: typecheck, lint, normal build, JavaScript-only API startup, production portrait/review-exclusion guard and unchanged application-CV reference. All 62 integrity/API cases passed, including the exact reproduction through JSON/SSE and the five requested practical/explicit/preferred/waived scenarios, audits, standard versions and mixed-topic comparisons. All 36 existing compiled Job Match retry/streaming regressions passed with retries disabled across desktop/tablet/phone Chrome configurations; no deadlines or assertions changed. Fifteen additional report inspection samples at 320/390/430/768/1440px showed no page errors or horizontal overflow; all six 390/1440px captures were visually inspected. Keyboard CV replay downloaded the exact genuine PDF bytes. This is Windows Chrome emulation, not physical-device testing.

One genuine configured Gemini request using the exact reproduction completed through local Express SSE (upstream/report HTTP 200, about 5.3s); its real signed tailored-CV download returned HTTP 200, 32,636 bytes. No added accessibility credential/audit/compliance requirement appeared; the preferred AWS comparison remained. [Actual response/method](docs/design/job-match-requirement-scope/real-provider.json). It used a fresh read-only public snapshot and fail-closed in-memory Prisma/rate/config state, with no production comparison POST or live DB access. Browser captures separately replay that archived response. A final formatter recheck leaves the genuine sampled result unchanged.

The actual downloaded PDF was rendered and both pages visually inspected: factual candidate summary separate from assessment, recorded role labels/month ranges, AWS training and co-developed project wording preserved; no added verification disclaimers, clipping or overlap. The existing two-page pagination leaves education/languages on a short second page, using uncustomized local initialModes rather than protected deployment CV settings. No CV geometry/configuration changes. [PDF and renders](docs/design/job-match-requirement-scope/pdf-review.json).

Remaining gaps: no physical Android/iPhone or production logs; hosted Preview access depends on existing Vercel protection. The explicit English topic/type guard covers the tested scenarios/common named standards and is not a complete natural-language parser or guarantee for every future model statement. Final-head terminal CI and exact automatic Preview SHA/access are recorded in the stacked draft PR delivery comment. No frontend/layout/media/playback, streaming/retry/rate-limit, provider configuration, live content, merge, manual deployment, production promotion or Contact submission changes.

## Design refinement Phase 1 — JobPilot journey, 26 October 2026

Working design prototype above PR #50 / f7baa57. [Five-step review and exact instructions](docs/design/jobpilot-design-journey/review-report.md), [before/after comparison](docs/design/jobpilot-design-journey/index.html), [offline ZIP](docs/design/jobpilot-design-journey/comparison.zip), [changed files](docs/design/jobpilot-design-journey/changed-files.txt). This is distinct from the historical integrity phases; their findings and the untracked handoff remain intact.

The candidate separates identity/actions from complete product imagery and screen choices, retains a small original object detail and removes settled unselected-object ghosts. “Review before saving” connects the preview to the defining decision. The reader carries number/title/selected image/object identity, brings the existing single profile-save demonstration before workflow figures, and varies figure/caption widths. Secondary workflow/context use disclosures without deleting original content, contribution or gallery. The existing reducer, stale-review protection, Reset, zoom, navigation and Ask Portfolio AI remain. Candidate reader state also returns to the source preview.

Only compiled review entries adopt the composition: /review/jobpilot/baseline and /review/jobpilot/candidate, each with a /reader child. The comparison is real static HTML at /review/jobpilot-comparison/index.html. Exact automatic Preview origin/SHA and access results are in the draft PR delivery block. Preview branch opt-in is explicit; Vercel Production fails closed even with review mode. Noindex is not access protection. Existing authentication/protection, normal navigation and sitemaps remain unchanged. Normal production JobPilot preview/reader render identically to the immutable PR #50 normal build at 390/1440px in the captured comparisons. Other independent raster hashes can differ slightly; all twelve captured main-text comparisons match.

GSAP remains the sole owner of Collection object/rig/product properties: 220ms candidate recession, 540ms image-reveal start within the existing 820ms articulation, 240ms handoff. Existing reader handoff remains 380ms with 180ms label fades; existing route restoration owns scroll/focus. ProfileBoundary retains its plate/state animation and reducer. No additional engine, cloned title, synthetic screenshot or smooth-scroll dependency. Readiness deadlines/cancellation/late-decode recovery are preserved. The sculpture is a metaphor, not a literal source-architecture diagram.

Evidence covers 320/390/430/768/1440px and 1280×720, with matched baseline/candidate states, reduced motion and forced photographic fallback. Four native desktop/phone browser recordings show actual opening, selected-screen handoff, stale refusal, acceptance, Reset and return. Decoded opening/journey frame sheets supplement playback inspection. Normal runs at all six widths report actual Intel UHD / ANGLE Direct3D11 WebGL. Phone/tablet sizes are Windows Chrome viewport emulation; no physical Android/iPhone claim. Forced fallback is explicitly separate. Captures use the same fresh read-only public snapshot and original images, with zero page errors or attempted backend writes in the six findings files.

Local typecheck/lint, normal/review builds, both production guards, 62 integrity/API cases, 20 geometry/motion/boundary cases and all 42 new compiled review regressions passed. New coverage includes navigation, state carry, native Back/explicit return focus and source scroll, interruption/late assets, loading/failure reserves, footer keyboard clearance, complete gallery/disclosures, assistant context, six widths and build-served comparison files. Existing affected regression outcomes and required final-head CI are recorded in the draft PR delivery; no existing assertions or deadlines were loosened. Scratch generated capture folders are excluded only from the local lint invocation; fresh-checkout CI runs full lint.

The first existing dev-server run had 106 passes/five failures; its failure details remain in the review package. A fresh-port twelve-case follow-up passed all JobPilot and missing-ready cases, with one remaining tablet Cedar selector-focus failure (11 passed/one failed). Capture/build work overlapped part of the first run, and Vite ResizeObserver output was observed; this is not a proven root cause. No Cedar fix or weakened assertion was added. Final-head CI and any retry/flaky outcomes are reported separately in the PR delivery.

CI #126 also exposed a new-test race: focus can settle before the existing font-ready/animation-frame hash scroll. The return-position test now observes the heading in view and positive scroll before capturing its source position, retaining the exact restoration assertion and existing deadline. All three focused local configurations passed. The superseded run's 40 passes/two failures are disclosed; final-head CI is recorded separately.

Manual assessment: the selected preview has clearer focus and a deliberate identity/product balance; the earlier demonstration improves reader pacing. Mobile remains a scrolling single column with legible reading text. Detailed screenshot text still needs existing zoom, and content length is intentionally retained. Hardware GPU review was available locally; physical touch devices and assistive technology were not. If Preview redirects to Vercel sign-in, hosted interaction remains unverified and the offline comparison is supplied. Stop for JobPilot design review. No changes to accepted Profile/media/playback, other project designs, provider configuration or live data; no merge, manual deployment or production promotion.
