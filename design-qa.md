# Cinematic portfolio sections — 2026-10-04

final result: passed

## Source and comparison

Source visual truth: `docs/motion/cinematic-sections/before-architecture.jpg`, `before-learning.jpg`, `before-contact.jpg`, and the prior selected carousel `docs/motion/interactive-refinement/projects-desktop.jpg`. All were opened. The user explicitly changes presentation and motion while preserving the landing palette, backend and saved content.

Implementation evidence in `docs/motion/cinematic-sections/`: `architecture-desktop.jpg`, `projects-desktop.jpg`, `project-intro.jpg`, `learning-desktop.jpg`, `training-expanded.jpg`, `contact-desktop.jpg`. Desktop CSS viewport: 1363 × 936; source and implementation pixels: 1353 × 929, same browser density (approximately 0.994). No extra normalization. Dark landing theme, loaded fonts, normal motion, real read-only CMS snapshot. Architecture and Projects begin near y96; Education near y95; Contact near y176 at the page end.

Four combined full-view comparisons were opened and inspected: `comparison-architecture.jpg`, `comparison-projects.jpg`, `comparison-learning.jpg`, `comparison-contact.jpg` (2706 × 965 each, including labels). Focused comparisons: `comparison-degree.jpg` (1100 × 248) for fonts, wrapping and masks, and `comparison-navigation.jpg` (980 × 108) for the desktop AI entry. Architecture's source shows all categories; its new default panel shows the Frontend family, with the others selectable. This density change is intentional.

Responsive captures: `architecture-mobile.jpg`, `projects-mobile.jpg`, `learning-mobile.jpg`, `training-mobile.jpg`, `contact-mobile.jpg` at 390 × 844 CSS/pixel dimensions; `architecture-tablet.jpg` at 1024 × 844. Captures clip the actual unscaled iframe and exclude the review canvas. Zero horizontal document overflow measured at all three tested widths.

## Findings and iteration history

- [P1, resolved] Initial Education credential stayed hidden: the translated child was observed after clipping, preventing entry. Evidence: `learning-initial.jpg` and combined `comparison-learning-initial.jpg` against the source. Fix: observe the stationary mask wrapper and animate its child. Recaptured desktop/phone Education, focused degree comparison and fresh-mount video show the credential fully revealed. Contact uses the corrected component and was checked on both devices.
- [P2, resolved] Global scroll padding plus another scroll margin placed Projects at y176 and pushed controls down. Initial browser capture showed the preceding section. Fix: use global scroll padding once for Projects and the explorer. Final captures place them near y96; phone selectors/arrows stay clear of the AI launcher.
- Accepted changes: six-family architecture explorer; landscape CMS interface in place of portrait JobPilot art; slightly smaller equal image frames and 105px captions; desktop AI navigation. No palette drift or invented professional content.
- Post-fix combined full-view and focused comparisons show no actionable P0/P1/P2 issue in the tested states.

## Required fidelity surfaces

**Fonts/typography:** Original Inter and italic Instrument Serif retained. Degree wraps into two desktop / three phone lines. Long project/course names remain readable. Compact category labels use 11px phone / 13px desktop text with minimum 55px / 60px targets. Semantic content retained.

**Spacing/layout:** Existing gutters, section rhythm and atmosphere retained. Explorer separates navigation and details; phone tabs use two columns. Equal carousel layout frames measure 327 × 204 on phone; neighboring cards intentionally scale to 0.94. Caption reserves 105px; selectors/arrows are at least 44px. Education dates/institution and Contact links remain anchored.

**Colors/tokens:** Navy #05090f, off-white #f5f6f6, blue #62b1ff, amber #ffb20b and existing chip accents unchanged. New states use existing colors. Focus remains visible.

**Image quality/assets:** Original portrait, MA mark, atmosphere, five covers and CMS screenshots retained. All seven carousel images including clones loaded, with landscape aspect ratios approximately 2.13–2.19. Contain-fit avoids stretching/crop. Thumbnail entrance uses real covers; existing Feather icon library retained.

**Copy/content:** Saved skill/category labels, names, dates, degree, issuer, descriptions and project links retained. Counts derive from data. No slogans, invented metrics or achievements.

## Interaction verification and limits

- `motion-preview.mp4`: 525 real browser frames, 26.25s, showing thumbnail entrance, center-out carousel opening, autoplay, architecture transition, Education mask, Training dividers/disclosure and Contact reveal. Encoded at 20fps for visual review; not a performance benchmark.
- Autoplay observed without clicking. Infinite first/last wrap, arrows, selectors, Home, End and ArrowRight verified. Hover/focus/drag yield temporarily to the user; timers clean up offscreen or when the document is hidden. No pause button.
- Phone swipe changed Construction to UniHub without leaving the landing route. Short 15px drag settled to the same card. Active case-study link opened JobPilot AI through Enter. Offscreen clones are inert.
- Architecture ArrowRight, Home and End selected expected panels. AI and Authentication panels showed saved content. Roving focus, associated panel and selected state retained.
- AWS disclosure opened/collapsed through keyboard. Issuer/date/description checked on desktop and phone. Closed content is inert and aria-hidden. Mobile menu and Contact navigation worked.
- Desktop AI Job Match link opened the existing job-description form. No AI request or message submission made in the read-only preview.
- Reduced-motion code path reviewed: bypass intro/autoplay and use immediate manual transitions and unanimated masks/dividers. Runtime preference emulation unavailable, so not claimed.
- Console reviewed: two historical development HMR errors at 09:04/09:05, no current application errors after fresh mounting. Extension metadata errors are outside the app.

## Checks and scope

Typecheck, lint, production build and whitespace check passed. Scoped live-browser checks cover these changes; older full E2E suite not rerun. Frontend and documentation only: no backend, schema, CMS data, dependency or landing palette edits. Prior QA archived in `docs/motion/interactive-refinement/design-qa-2026-10-04.md`.

Checklist complete: stationary mask observation; single anchor offset; automatic wrap and manual navigation; long-content phone checks; post-fix comparisons; palette/backend preservation; existing draft PR update.
