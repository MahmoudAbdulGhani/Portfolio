# JobPilot design journey — Phase 1

This is a working design proposal above PR #50 / `f7baa57a57e589c4171c94eb9f6f54f931a822c6`. Normal portfolio routes retain the accepted presentation. Review the candidate against the baseline before adopting any of it.

## Open the review

The automatic Vercel **Preview** for branch `prototype/jobpilot-design-journey` compiles these entries:

- Baseline: `/review/jobpilot/baseline`
- Candidate: `/review/jobpilot/candidate`
- Direct selected preview: append `?project=jobpilot-ai` to either entry.
- Reader: append `/reader` to either entry. Opening through Collection additionally carries the selected screen, origin bounds, focus and return position.
- [Comparison HTML](index.html): hosted at `/review/jobpilot-comparison/index.html`.
- [Offline comparison ZIP](comparison.zip): extract it and open `index.html`. Images and browser recordings work without a server; the working route links require the compiled application.

The draft PR delivery comment records the exact commit, immutable Preview URL, terminal CI and observed access response. Vercel authentication/protection is unchanged. Noindex is not access protection. Both review entries set noindex; they are absent from normal navigation and sitemaps. Normal Production fails closed even if the explicit review mode is supplied. Promoting this branch's deployment does **not** adopt the candidate on normal routes.

Local compiled review:

```powershell
npm run build -- --mode jobpilot-design-review
npm run preview -- --host 127.0.0.1
```

Open the paths above on the printed port. Use the repository's normal backend for public content. For automated fixture-backed verification, `npx playwright test --config=playwright.jobpilot-design.config.ts --workers=1` builds and serves its own isolated output and needs no database. No provider/configuration changes are required.

## Journey review

1. **Collection — preserved.** The asymmetric three-object composition, geometry and materials are unchanged. The candidate class applies only after JobPilot is selected or its reader opens. [Phone Collection](candidate/normal/390-844-collection.jpg), [desktop Collection](candidate/normal/1440-900-collection.jpg).
2. **Selected preview — clearer focus.** The selected object becomes a small, original photographic detail; other objects finish at zero opacity. Number, category, title, “Review before saving” and navigation form one identity column. The complete product image has a separate surface and labelled screen choices. Mobile puts identity/actions before the image, with no hover-only controls. [Phone pair](comparison-390-preview.jpg), [desktop pair](comparison-1440-preview.jpg), [short desktop](candidate/normal/1280-720-preview.jpg), [tablet](candidate/normal/768-1024-preview.jpg).
3. **Reader opening — stronger continuity.** Number, title, original object identity and the exact selected screenshot carry through. The opening summary is shorter; its full approved text remains in Project context. The primary image keeps its natural ratio and existing inspection controls. [Phone pair](comparison-390-reader.jpg), [desktop pair](comparison-1440-reader.jpg).
4. **Defining decision — reached earlier.** The single existing Propose → Review → Accept demonstration precedes workflow figures. It retains the original reducer, stale-review block, revision values and Reset. Reader changes are carried back to the same preview state. Two workflow figures remain open; interview preparation, full context and implementation details remain available in disclosures. Contribution, attribution and the complete gallery are retained. [Phone decision](comparison-390-decision.jpg), [desktop decision](comparison-1440-decision.jpg), [stale review blocked](candidate/normal/390-844-stale.jpg), [accepted](candidate/normal/1440-900-engineering.jpg).
5. **Return — continuity preserved.** Explicit return and native Back restore the selected screen, source scroll and Open case study focus. Collection return restores its object trigger. Navigation remains usable during loading and decorative interruption. [Phone return](candidate/normal/390-844-return.jpg), [desktop return](candidate/normal/1440-900-return.jpg).

The preview feels more deliberate and the earlier interaction explains the project sooner. Desktop has a distinct identity/product balance; mobile has a readable sequence rather than a reduced desktop grid. The reader is intentionally long enough to preserve complete screenshots and meaningful content. Small screenshot text still requires the existing zoom control. The fixed footer stays available with bottom clearance; the candidate reader scrolls as a normal document and does not pin phone scrolling. This is a stronger proposal for this journey, not evidence that every portfolio page needs the same layout.

## Motion and reliability

- Existing GSAP Collection timeline alone owns object recession, rig progress and product-surface opacity: candidate recession 220ms; image reveal starts at 540ms of the existing 820ms articulation, with a 240ms handoff. If decode is late, the existing visible photograph/status remains until a usable image exists. The candidate image reserve stays transparent during opening so its cream matte cannot conceal articulation. Loading placeholders in cold-start recordings are identified as loading, not successful decoded screenshots.
- Existing `useJobPilotHandoff` alone owns the real reader number/title/image transforms: 380ms; labels/captions use its 180ms opacity transition. No cloned title, screenshot overlay, new motion engine or smooth-scroll dependency.
- Existing route restoration remains the scroll/focus owner. Review aliases use that same owner. Cancellation, readiness deadlines, late-decode retirement and the native history cache remain intact.
- Existing ProfileBoundary owns only its plate/state transition. The photographic sculpture is a visual metaphor; it is not a literal diagram of JobPilot's source architecture. Its reducer and motion timings are unchanged.
- Reduced motion uses immediate/final states without spatial handoff. Photographic fallback shares the candidate hierarchy and actions. Source aspect ratios reserve loading/failure space.

## Evidence and methods

[Comparison HTML](index.html) includes all matching states at 320×844, 390×844, 430×844, 768×1024, 1280×720 and 1440×900, plus reduced-motion and forced-fallback samples at 390/1440px. [Visual methods](visual-inspection.json) links opening/journey frame sheets. Direct comparison pairs preserve original captures without cropping; only labels and spacing were added.

Native browser recordings:

- [Candidate desktop](candidate/normal/1440-journey.webm) / [baseline desktop](baseline/normal/1440-journey.webm)
- [Candidate phone](candidate/normal/390-journey.webm) / [baseline phone](baseline/normal/390-journey.webm)

These record actual browser frames through arrival, opening, screen selection, reader, stale-review refusal, acceptance, Reset and return. Small record-only observation holds keep the states readable; application timings are not changed. They are not animations assembled from screenshots. Each recording was decoded and played to its end in desktop Chrome; sampled transition frames were inspected as well as settled captures. Decoder drops during review are recorded, not presented as a hardware performance benchmark.

Baseline captures came from a compiled immutable PR #50 build prepared before the candidate edits. Final matching-state captures were made from that same immutable output. Both use the same frozen fresh read-only public GET snapshot and original images, rather than synthetic fixture screenshots. Capture routing rejects non-GET API calls; all six findings files report zero page errors and zero attempted backend writes.

Normal runs at all six widths identify **Intel UHD / ANGLE Direct3D11** WebGL in `baseline/normal/findings.json` and `candidate/normal/findings.json`. This is actual local GPU-backed Chrome rendering. Phone/tablet dimensions are browser emulation on Windows, **not physical Android or iPhone tests**. Reduced-motion runs emulate the OS preference. Fallback runs deliberately deny WebGL context creation and are not labelled WebGL verification. The existing engineering photograph remains photographic in every mode.

[Normal production comparison](normal-production-comparison.json) records twelve text/pixel comparisons from the immutable PR #50 normal build against the current normal build. All main text matches; the normal JobPilot preview and reader match byte-for-byte at 390/1440px. Other route raster hashes can differ slightly between independent Chrome renders; these are not a claim of pixel-identical rendering on every route. Normal-build guards independently confirm review routes/styles/comparison are excluded. No accepted Profile, Cedar or Lobby design was changed.

## Validation and remaining gaps

- Typecheck, lint and normal/review builds passed locally. Scratch capture/report directories were excluded from the local lint invocation; CI runs the unchanged full lint command on a fresh checkout.
- Review opt-in/fail-closed Production policy passed. Both normal-build guards passed: JobPilot review exclusion and existing Profile production inclusion/review exclusion.
- All 62 integrity/API and 20 geometry/motion/boundary cases passed.
- All 42 new compiled review cases passed across desktop/tablet/phone configurations, retries disabled. They cover six widths, single identity, natural ratios, no settled object ghosts, stale-review protection, state carry, native/explicit return, interruption, loading/failure reserve, footer focus clearance, assistant context, disclosures, full gallery/zoom, reduced/fallback behavior and actual compiled comparison files.
- Existing affected handoff/readiness/preview regressions and terminal final-head CI are recorded in the draft PR delivery block. No existing assertion, timeout or readiness deadline was relaxed. A pending/cancelled run is not a pass.

[Initial local regression failures](local-initial-regression-failures.md) preserve the first dev-server run's 106 passes/five failures: one cold-start total-test timeout, one destroyed navigation context, and three Cedar focus failures with Vite ResizeObserver error-overlay output observed. Capture/decoder work overlapped part of that run. This does not establish a regression cause; clean-port targeted rerun and final-head CI results are reported separately, without hiding the initial failures or altering unrelated code.

The twelve-case fresh-port rerun passed all JobPilot and missing-ready cases; one tablet Cedar normal-motion focus case failed (11 passed, one failed). The screenshot shows focus on Open case study instead of the screen selector. No Cedar change was made to hide that result. Final-head CI remains the independent full-scope gate, and any retry/flaky result is disclosed in the delivery comment.

CI #126 exposed a race in the new hash-return test (40 passed/two failed): it captured zero scroll after focus but before the existing route owner completed `document.fonts.ready` plus its animation-frame hash scroll. The test now waits for the heading to be in view and positive scroll before capturing the same exact return-position assertion. All three focused configurations passed locally after this correction. No application behavior, assertion threshold or deadline changed. The superseded run is not a final-head pass.

No physical touch-device or assistive-technology session was available. Keyboard/focus checks and viewport emulation do not establish full accessibility conformance. Protected hosted Preview may require Vercel sign-in; if so, hosted interaction is explicitly unverified and the downloadable comparison remains available. No Contact submission, live CMS/database change, merge, manual deployment or production promotion was performed. Stop for JobPilot design review.
