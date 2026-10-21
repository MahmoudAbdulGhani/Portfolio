# Profile portrait finish — review candidate

Based on PR #41, `2b62f15f3f31d444f23a4750d9f124043be5ce92`. Branch: `refine/profile-portrait-finish`.

## Changes

- The muted repeat now runs from 0.20 to 11.60 seconds. It keeps the same decoded video layer through the seek instead of inserting the still portrait for 140ms. Exclusive still/video compositing from PR #41 remains; no dissolve or reversed gesture is introduced. A small source-pose cut remains, so this is not described as seamless.
- Explicit Hear always starts at zero and reaches the natural end. The last caption and “download my CV” remain complete. Mute retains the current pose. Offscreen/hidden, manual pause, reduced motion, stale callbacks, unsupported alpha and audio fallbacks retain their existing boundaries.
- More detail is retained in the revised 480/720 encodes. Offline processing only reduces excess cyan within two silhouette pixels. Face/clothing interiors and alpha are unchanged before lossy encoding. No face reshaping, skin smoothing, invented facial detail, new generation or speed changes. The existing original-photo still is untouched.
- New file sizes are 2,703,633 and 5,051,086 bytes, versus 1,523,283 and 2,654,346. This deliberately trades roughly 1.18/2.40 MB for visibly better detail. Only the selected resolution loads. Do not describe these as smaller or claim fresh production performance measurements.
- Opus audio is copied from the approved website file. All three decoded PCM hashes match `8a6a84c426fb7ce285b966d9e9abd450df28ddf3416b1f545df082275ce5a62e` (2,301,952 bytes). MP3 and both VTT copies are unchanged.
- Controls now read Hear intro / Mute and Pause / Resume with their full accessible names and 44px targets. Captions are directly beneath controls. Short desktop windows size the figure to keep its head, complete hands, CV and captions together. Tall desktop and tablet dimensions and 180/190/200px phone widths remain.

## Evidence and verification

- `processing.json`: source/output hashes, 300 frames at 25fps, 95,549 edge pixels adjusted across the take, zero interior changes and unchanged alpha before encoding.
- `ten-cycles.json`: ten real muted loops completed at the local app, no still/video overlap or still flash in 149 browser samples; every restart was near 0.20 seconds. Cloud sampling is sparse and is not a claim of hardware frame-perfect capture.
- Actual local Chrome interactions at 320×640, 390×640, 430×844, 768×900 and 1280×720 reviewed. Full figure/captions fit after Hear; short-desktop clipping was reproduced and corrected. Reduced motion created no video/audio on arrival; explicit Hear created one unmuted MP3 player with the accepted still. Complete speech, silent return, visual transparency and manual controls checked.
- `phone-320.jpg` and `desktop-1280.jpg` are actual browser screenshots, not generated mockups. `encode-comparison.jpg`, `review-frames.jpg` and `review-edges.jpg` are decoded-media inspection sheets.
- Local typecheck, lint and production build pass. Thirteen focused Node checks pass (including five new playback lifecycle checks). An initial legacy portrait test was blocked by sparse-checkout evidence, then passed after retrieving the unchanged files. No assertion was relaxed for that setup issue.
- Browser regressions now check whole portrait/caption fit at six width/height combinations, three actual silent cycles without a still bridge, full spoken completion, lifecycle/fallback/accessibility/CV behavior. CI is authoritative for automated browser execution; its terminal status is recorded in the PR.

## Review

Download `portrait-finish-review.zip`, extract it, open `index.html` in Chrome. It includes before/after media, muted comparison, complete optional speech, frame/edge sheets and actual Profile screenshots. It is an isolated media comparison, not the complete application. Use the automatic PR Preview `/profile` for actual application behavior. `comparison.html` in the checkout uses the local `before.webm` and the normal public after asset.

Review the face at normal display size first, then the close-ups; watch several cuts; hear the complete final sentence. The source facial performance is preserved, not certified perfect. Physical Android/iOS/Safari, hardware lip sync, direct audio audition, spoken screen readers, slow production networks/CDN and protected hosted playback remain unverified. No new recording is required to review this candidate.

No merge, manual deployment, production promotion, CMS/database changes or Contact submission.


Final delivery state: local implementation committed at 8aed1704814dfa4ed85275401489fc3c51a3492b. Remote Git push failed for missing credentials. Connector blob upload attempts did not complete. No new PR/CI/Preview is claimed. The included product patch was validated against the base using an isolated index.
