# JobPilot motion direction — review candidate

Base: PR #58, `44dfcb291853b1a89f48784776c007cbecf664ee`.

## Review addresses

- Approved composition: `/review/jobpilot/candidate?project=jobpilot-ai`
- Motion candidate: `/review/jobpilot/motion?project=jobpilot-ai`
- Open the case study using its normal button, then return with Collection.

These addresses are development/explicit Preview only. A Production build excludes them. Promoting this branch will NOT adopt the motion candidate on ordinary routes.

## Choreography

Keep the original sculpture articulation and wall-clock readiness owner. At 340ms the number, category and title rise 14px with 55ms offsets. At 360ms the actual image reveals downwards over 460ms, coinciding with the sculpture handoff. Actions settle 6px over 240ms at 580ms. No navigation waits for these effects. Cleanup restores unclipped, untransformed elements.

Preview to reader carries the selected real image over 480ms with a stronger acceleration/deceleration curve. Identity remains inside the reader header; a restrained 12% reveal resolves over the same interval. Existing selected-image, native history, scroll and focus restoration remain the owners.

In the engineering demo, proposal/review emphasizes the proposed record. Acceptance or a saved-record revision emphasizes the saved record. This follows the actual reducer state; it does not imply a save before acceptance. Reset remains unchanged.

Reduced motion bypasses the added choreography. No new package, scroll hijacking, cursor, fake loading screen or decorative navigation lock.

## Preservation

No portrait asset, speaking video, audio, controls, playback component, CV logic, CMS record or supporting-page composition is changed. PR #58 remains the base.

## Validation (2026-11-26)

Passed locally: typecheck, lint, normal production build, production review-route exclusion guard; 20 motion/geometry/state tests and one review-build isolation test.

Browser checks could not launch in this workspace: Playwright's Chrome executable is absent, its download returns HTTP 403, and the system Chromium launcher points to a missing executable. The separate interactive browser cannot reach this workspace's localhost. These are infrastructure failures before page execution, not successful visual checks. No screenshots, physical GPU/device or visual polish claims are made.

CI now runs the existing complete compiled JobPilot journey suite against `/review/jobpilot/motion` in addition to the approved candidate and ordinary routes, with the existing assertions and zero retries in that suite. CI status must be checked separately.

## Acceptance gate

Review at 320/390/430/768/1280/1440px, normal and reduced motion, failed/late image, interrupted opening, keyboard journey and Back. Check image reveal for a visible improvement over the approved candidate. This is a first motion study, not a finished award-level redesign. Do not adopt or promote the candidate until browser checks and visual review pass.
