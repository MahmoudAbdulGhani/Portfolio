# Cedar and Lobby — Phase 2 review

Base: PR #53 / c4f18c73a0184e8304327afcf80c22279b0f1bca. Review branch: prototype/featured-design-phase2, stacked above adopt/jobpilot-phase1. The only initial untracked file was Codex_Engineered_Landscape_Handoff.md; it is preserved. No newer remote branch work was found at inspection.

## Review routes and build boundary

- `/review/featured/cedar/candidate` and `/reader`
- `/review/featured/cedar/baseline` and `/reader`
- `/review/featured/lobby/candidate` and `/reader`
- `/review/featured/lobby/baseline` and `/reader`
- `/review/featured-comparison/index.html`

Routes/artifacts require explicit `featured-design-review` mode or automatic Vercel Preview of this exact review branch. Vercel Production fails closed even with that mode. Normal builds exclude the review entry, addresses and comparison directory. Normal Cedar/Lobby routes retain their accepted presentation; JobPilot remains adopted. Review entries have noindex metadata and existing `/review/*` response headers; they are not added to navigation or sitemap. Noindex is not access protection. Existing Vercel protection is unchanged. Exact automatic Preview origin/SHA, anonymous access results and terminal final-head CI are recorded in the stacked draft PR delivery, linked from the final response.

## Shared implementation and preserved content

The existing preview composition, reader narrative, selected-screen handoff and journey cache are reused. Explicit per-project configuration supplies identity/number/original object/caption; shared CSS opts in with review classes. Cedar/Lobby-specific styling is a review-only chunk. There are no duplicate production components or new demonstrations. JobPilot's existing values, typography, timing and defaults remain.

Cedar and Lobby now use the existing journey mechanism for selected image, reducer state, scroll and focus. Reducers themselves are untouched. The first compiled run exposed loss of the selected screen when reloading the reader cleared the in-memory cache before native Back. Review-only image/position metadata is retained on the existing history entry and read by the existing restoration owner. It adds no entry, timer or separate scroll controller. Fictional demo state remains in memory and is not persisted across reload. JobPilot's history path is unchanged.

The same camera fit samples 61 poses of **each actual sculpture's own existing timeline**, including intermediate joint/depth states. No borrowed fixed camera values, altered joints/models/materials/easing or new decorative clock. Opening/return/readiness deadlines, cancellation and photographic recovery remain. The photograph is placed within the reserved product area while opacity/rig progress keep their existing owners. Navigation remains independent of completion.

The reader carries number, selected original image and restrained original object detail. Its existing interaction becomes the first narrative section after the selected image. Each demo has one heading, concise fictional/local label, progress and existing controls; full calculation/permission explanations and source links remain in existing disclosures. Secondary workflow sections/context use the same disclosures. Roles, team attribution, scope, image captions and source references remain.

## Visual assessment and tradeoffs

**Cedar:** the title balances without small type or header overlap, with the 03 identity clear of the header. On 320px it wraps to Cedar / Construction; at 390px it fits on one line. Desktop keeps identity/actions beside the complete image. Original tall secondary screens remain natural and inspectable through the existing viewer; selecting a tall screen intentionally lengthens the reader before the demo. We do not crop or compress it to fit a viewport. Calculated USD facts remain distinct from the prewritten sample interpretation. Changing progress marks the old interpretation outdated; explicit refresh and Reset remain.

**Lobby:** original ribbon identity and genuine application captures are retained. The caption connects invitation, membership and call access without suggesting a live backend. The selected phone image and associated choices precede actions; reader explanation is shorter while the full contribution/context remains available. Existing blocked-entry rejection, explicit membership/call checks, teaching assumptions and Reset remain. On phones, facts/controls precede the smaller explanatory object, requiring ordinary scrolling.

Both contained openings deliberately use smaller decorative sculptures instead of allowing articulation behind readable UI. At 320px, actions may require a short scroll; readable type, complete imagery and 44px controls take priority over fitting everything into one screen. Fixed footer clearance is checked for focused controls. The initial image may be lower than the former product-first baseline because the requested back/identity now precedes it. Baseline readers reset selection; candidate readers preserve it, so corresponding reader-opening comparisons honestly show that behavior difference.

## Evidence and methods

The normal compiled baseline was frozen at PR #53 before application edits; its capture run started before editing and continued against that immutable output. Candidate captures use the final compiled application, with the same fresh read-only public GET snapshot and genuine source images. Remote Cedar source bytes are cached only within the capture process, preserving URLs and pixels; initial uncached capture attempts stalled on image readiness. There is no synthetic screenshot substitution. Capture routing rejects non-GET/HEAD backend operations. All completed findings have zero page errors and zero attempted backend writes.

Each complete journey was executed at 320×844, 390×844, 430×844, 768×1024, 1280×720 and 1440×900. Matched images include selected preview, reader opening and reader/preview demonstrations. Rejection/outdated/result/return captures are retained. Native phone and desktop browser recordings cover the entire opening, screen change, reader, rejection/outdated state, explicit recovery, Reset and return: eight recordings across before/candidate and both projects. Separate reduced-motion and deliberately denied-WebGL examples cover 390/1440px.

All twelve candidate normal runs identify actual Intel UHD / ANGLE Direct3D11 WebGL. Each reports zero sampled readable-control intersections and zero projected-subject canvas cuts. Conservative projected mesh-box samples supplement visual inspection; they do not prove every future pose or GPU smoothness. Original geometries and reducers are unchanged.

Opening sheets decode 40 samples per recording at 25fps with lead-in/out around an approximate DOM timing anchor, plus full-resolution keyframes. Recordings are native browser video, without screenshot animation, speed changes or audio muxing. The inspector briefly plays and decodes them, then samples the opening; it does not claim full real-time hardware replay or smooth frame delivery. One short inspection reported dropped frames. Native captures were produced under local automation load.

Twenty normal-route preservation pairs at 390/1440px compare Collection, Projects, selected JobPilot, Cedar/Lobby previews/readers, Profile, Contact and AI Job Match. All main text and measured heading/image/action/header/footer layouts match. Thirteen PNG byte hashes match; seven differ. Mean RGB error among differing samples is at most 0.151/255, with selected JobPilot about 0.0054/255 at 390px. No universal pixel identity claim. Profile/media/AI/Contact/CV implementation is untouched.

Phone/tablet dimensions are **Windows Chrome viewport emulation**, not physical Android/iPhone. Forced photographic fallback and emulated reduced-motion preference are explicitly separate. No physical-device, touch-hardware or assistive-technology session was available. Fixture regressions use synthetic CMS data/test images; public-snapshot visual captures are separate. No live Cedar/Lobby service, financial record, invitation, membership, call, provider request or Contact submission was executed.

## Validation and initial failures

- Typecheck, lint, normal/review builds, all three production guards and both review policy checks passed locally.
- All 20 existing geometry/motion/reducer tests and 62 integrity/API tests passed.
- All 48 applicable normal compiled JobPilot cases passed (nine historical-build checks are intentionally inapplicable; retained in review mode).
- First Phase 2 compiled run: 23 passed, two failed. Both exposed selected-image loss after reader reload/native Back. The focused correction passed both original assertions; the complete 25-case suite then passed.
- Expanded Phase 2 suite: all 27 passed, retries disabled. Six-size DOM/visual ordering, natural ratios, keyboard gallery/return, selected screen/demo-state continuity, source scroll, footer clearance, outdated/rejection recovery, Reset, direct entry/refresh/history, baseline/normal isolation, own-model framing, slow/failed images, late-image interruption, reduced motion and unavailable WebGL.
- One edit-script encoding error was caught in visual inspection and corrected before final captures. No corrupted text remains in the final candidate.
- CI adds a separate compiled Phase 2 gate and aggregate dependency. Existing deadlines/assertions/retry policies remain; no deadline increase or assertion weakening to obtain green results.

Terminal final-head CI, exact commit/Preview SHA and hosted access are recorded in the stacked draft PR delivery so the checked head remains immutable. Pending/superseded runs are not passes. Build output retains the existing chunk-size advisory; no new animation library or processing dependency enters the frontend.

Recommendation: review both candidates at the linked sizes, including the tall Cedar selection and 320px scrolling tradeoff, before adoption. Stop here. No normal Cedar/Lobby adoption, Projects-index redesign, remaining-reader redesign, Profile/AI/Contact/CV changes, merge, manual deployment, production promotion or live CMS/database changes.
