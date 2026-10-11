# JobPilot presentation refinement

Baseline: `4a501ad8ebb95bfa01e6d665ad89652cb6bbbff6`, draft PR #22. The source basis and runtime limitations remain in [the original record](../source-basis.md).

The approved reducer is unchanged: Git blob `7a575f84e8f9781741e88d2a5cc2f9bc747f9aa3`. This refinement derives presentation only from its existing phase, saved value, revision, reviewed snapshot and blocked flag. No proposal/approval/reset or stale-review branch was changed. Fictional values remain in React memory; no real JobPilot mutation is called.

The Collection's secondary engineering link replaces the current selected URL fragment, then uses the existing route restoration and focusable heading. This preserves the original selection history depth, browser Back and Collection closing. It is an actual anchor with a usable URL, supports direct/new-tab fragment navigation and has an explicit keyboard tab stop. Navigation is immediate in both motion preferences.

The artwork remains the original photographic asset and complementary masked foreground plate, with the original 3.5° turn around `(570,1035)` over 380ms. Desktop width grows to 260px. A small leader identifies the ivory plate and the proposed comparison column sits nearest it. Dashed pending cues and plain labels coordinate their meaning. Approval aligns the same plate; no added artwork or 3D reconstruction is implied.

The paper surface and local foreground layer remove background-object interference. The shared reader is the visual benchmark. Font sizes and the current-step/stale labels meet the same requirements in both contexts. The ordered three-step list is display only; current-step meaning uses text/underline/weight and `aria-current="step"` as well as color. Changing saved information marks the new value and the old reviewed comparison immediately. Actual blocking still occurs on explicit approval, exactly as in the approved logic.

The updated [review HTML](../review.html) preserves the initial [prototype comparison](../prototype.html) and adds this refinement's before/after states, viewport pairs, benchmark reader captures, reduced-motion/fallback evidence and short recordings. Reader screenshots use separate natural-scroll heading and controls views rather than shrinking the component to fit a phone.

Local checks pass. The baseline's expanded browser suite exceeded its 15-minute CI job limit; checks and browser groups are now distributed across independent runners with the same one-worker settings, test configurations, retries and deadlines. The original `verify` check requires every group to succeed. Final CI closeout is in the new stacked draft PR.

Actual Intel Windows GPU verification applies to the original WebGL opening. Phone/tablet sizes and reduced motion are browser emulation; fallback is forced unavailable WebGL. Physical-device/screen-reader speech and real backend save/concurrency/replay verification remain unavailable. No production write, merge or manual deployment occurred.
