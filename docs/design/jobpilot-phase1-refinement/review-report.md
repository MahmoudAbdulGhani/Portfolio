# JobPilot — focused Phase 1 refinement

Continues PR #51 / `a7b9c800d63f337b79ec7d6904ece544938732bf`. The direction remains a review proposal. Normal production routes, other projects, Profile/media, CV, Contact and AI behavior are unchanged. No production adoption or deployment promotion.

## Review entries

The automatic Vercel Preview for `refine/jobpilot-design-phase1` compiles the existing review mechanism with three entries:

- `/review/jobpilot/candidate` — refined candidate.
- `/review/jobpilot/before` — preserved PR #51 composition and opening.
- `/review/jobpilot/baseline` — original PR #50 baseline.

Each entry has a `/reader` child. Start with Collection, select JobPilot, change screen, open the reader, exercise the demo and return to check continuity. Append `?project=jobpilot-ai` for a direct selected preview. Review entries are noindex and absent from normal navigation/sitemaps. Noindex is not access protection. Existing Vercel authentication/protection is preserved.

[Current comparison](index.html) is compiled at `/review/jobpilot-refinement/index.html`. [Download the offline package](comparison.zip), extract it and open `index.html`; all included images and recordings work offline. Working route links require the application. The separate original PR #50 → PR #51 archive remains at `/review/jobpilot-comparison/index.html`; its built working-candidate link points to `/before`. Its committed captures/report remain untouched.

The draft PR delivery comment records the exact final SHA, automatic Preview origin, anonymous hosted-access response and terminal final-head CI. A sign-in redirect is an access limit, not evidence of a failed deployment or a rendered review page. Hosted interaction behind protection remains unverified if sign-in is required.

Local compiled review:

```powershell
npm run build -- --mode jobpilot-design-review
npm run preview -- --host 127.0.0.1
```

Use the repository's ordinary backend for public content. `npx playwright test --config=playwright.jobpilot-design.config.ts --workers=1` builds and serves an isolated fixture-backed compiled review without a database. Vercel Preview opt-in allows the existing PR #51 branch and this refinement branch. Normal Production fails closed even with the explicit review mode.

## Three changes

1. **Contained opening articulation.** The accepted model, joints, materials, lighting, easing and Collection clock remain. The refined camera fits the complete sampled articulation within the reserved product-image area. Its closed/open endpoint bounds alone were insufficient: intermediate poses extended beyond them. The same existing timeline is measured without painting at 61 poses; a conservative perspective fit leaves room around the complete subject. The original photograph is positioned in that same area while initialization is pending. Unselected scenery is hidden in the expanded refined view. Title, navigation and screen choices remain outside the drawing region; the product reveal still starts at 540ms within the existing opening. No new loading overlay, animation engine or autonomous render loop.
2. **Product-first narrow layout.** DOM and visual order below 960px are compact identity/back link → complete image and inspection cue → screen choices → Open case study / Explore the engineering → existing demo. Controls remain at least 44px and are not hover-only. At 390px the observed image top moves from about 514px to 319px. At 320/430px the gain is also about 194–195px. The 768px layout brings imagery forward without squeezing it. Desktop retains the identity/action column beside the full product image, with Collection near the identity. Natural image ratios and viewer/zoom/gallery are preserved.
3. **One demo introduction.** The reader now has one section heading, “The profile save boundary”, a short “Sample data · local demo” label and the existing progress indicator. The full engineering statement and fictional CV-source explanation remain in the existing implementation disclosure. State-specific comparison/review information stays beside the sample values, including its existing space reservation. On phones the values/actions precede the smaller decorative plate. This puts Propose within reach while preserving the same reducer, revision handling, stale-review block, live announcements and Reset. Desktop retains the side-by-side plate and facts.

## Journey review

1. **Collection — preserved.** Accepted asymmetry and original assets/materials remain. Refinement styling applies only to selected JobPilot and its review reader.
2. **Preview — clearer priority.** [Phone before/after](comparison-390-preview.jpg), [320px](comparison-320-preview.jpg), [desktop](comparison-1440-preview.jpg), [short desktop](comparison-1280-preview.jpg). The image appears earlier on phones; the desktop remains two-column.
3. **Reader — less repeated introduction.** [Phone demo](comparison-390-demo-reader.jpg), [320px demo](comparison-320-demo-reader.jpg), [desktop demo](comparison-1440-demo-reader.jpg). Technical explanation remains available through the same disclosure.
4. **Interaction — preserved.** Captures/recordings and compiled regressions exercise Propose → Review → stale refusal → Review again → Accept → Reset. The same state carries back to the preview. No backend writes.
5. **Return — preserved.** Explicit return/native Back retain selected screen, captured scroll and focus. Existing interrupted/late-image, footer clearance, gallery/zoom and assistant-context checks remain.

## Evidence and methods

All evidence in this folder is from the current run. Immediate-before images/recordings use an immutable PR #51 compiled build prepared before editing. Both sides use the same fresh, read-only public GET snapshot and original image assets. API capture routing rejects non-GET/HEAD calls. Each of the six findings files reports zero page errors and attempted writes. Original PR #50 evidence remains separately labelled in the previous archive.

Matched normal-motion captures cover 320×844, 390×844, 430×844, 768×1024, 1280×720 and 1440×900, for the selected preview, preview demo and reader demo. Reduced-motion and forced photographic-fallback examples cover 390/1440px. The [comparison HTML](index.html) exposes every pair and full-resolution image.

Native recordings: [before phone](before/normal/390-opening-journey.webm), [after phone](after/normal/390-opening-journey.webm), [before desktop](before/normal/1440-opening-journey.webm), [after desktop](after/normal/1440-opening-journey.webm). These contain real browser frames through the whole opening and a short interaction/return. They are not screenshot animations, synthetic frames or audio-muxed captures. Brief observation holds do not alter application timings.

[Recording inspection](video-inspection.json) records playback-to-ended in Chrome, decoder counts and 40 decoded opening samples per recording, including lead-in/out around the approximate DOM phase anchor. Contact sheets and full-resolution keyframes show geometry and readable UI throughout the transition. Decoded frame inspection does not establish GPU smoothness or hardware performance.

Final frame review caught a short opaque matte between image readiness and renderer readiness. The refined frame now stays transparent through selection, as well as loading/failure, so the held photograph remains visible. The final phone/desktop recordings were recaptured after that correction. Their playback inspection reported no dropped decoded frames; the before desktop inspection reported dropped frames under local capture load. These decoder counters are not a comparative GPU benchmark.

[Observed geometry](geometry-summary.json) records conservative projected subject bounds and canvas/control rectangles from actual-source normal runs. Observed posed samples at all six sizes have zero control intersections and zero subject-bound violations. This supports the framing in the observed run; it is not a claim about every future frame/device. Normal-run renderer strings identify actual **Intel UHD / ANGLE Direct3D11 WebGL** on this Windows machine. Viewport sizes are **browser emulation**, not physical Android/iPhone tests. Forced-fallback captures deny WebGL context creation and are not WebGL evidence. The demo plate remains photographic SVG in all modes.

[Isolation check](isolation-check.json) compares the immutable PR #51 output with the current build: the new `/before` preview and reader are pixel-identical at 390/1440px. All sixteen sampled comparisons retain main text and measured heading/image/navigation/header/footer geometry, including ordinary Collection, JobPilot, Cedar, Lobby and Profile routes. Independent raster hashes differ on four ordinary-route samples; no blanket pixel-identity claim is made. Normal-build guards separately exclude all review routes/styles/comparison artifacts.

## Validation and limits

- Typecheck and lint passed locally. The local lint command excludes ignored scratch/generated report directories; fresh CI uses full lint.
- Normal/review builds, the review opt-in policy and both production guards passed. The new refinement comparison is checked as real compiled HTML/JPEG content.
- All 20 geometry/motion/boundary and 62 integrity/API cases passed. Reducer behavior, factual content, attribution and CV grounding are unchanged.
- All 54 compiled review cases passed across desktop/tablet/phone configurations with retries disabled. Existing assertions/deadlines remain. Added coverage checks product/control separation during opening in the available renderer, conservative subject containment when WebGL is available, mobile DOM/visual/keyboard order, desktop columns, single demo heading, separate PR #51 before, earlier product image and usable framed-photograph recovery for delayed/failed product images. Existing state/scroll/focus/interruption/fallback/loading/gallery checks remain.
- The terminal final-head full CI result is recorded in the draft PR delivery comment; pending/cancelled runs are never reported as passes.

No physical touch-device or assistive-technology session was available. Browser emulation, fixtures and still frames do not establish physical-device behavior or GPU smoothness. Hosted interaction may remain blocked by Vercel sign-in; the public downloadable evidence is supplied for that case. Detailed product screenshot text still needs the existing zoom control on phones. The opening now presents a contained articulation within the product area; its smaller scale is an intentional tradeoff for calm, readable controls.

Untracked handoff preserved. No Phase 2 work, unrelated redesign, provider/configuration change, Contact submission, live CMS/database change, merge, manual production deployment or promotion. Stop for review of these three refinements.
