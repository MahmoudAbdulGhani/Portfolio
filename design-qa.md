# Hero refinement QA — 2026-10-04

final result: passed

## Source, brief, and evidence

Source visual truth: `docs/motion/hero-refinement/01-live-before.jpg`, captured from the user-requested live portfolio this session. The user rejected this hero and requested a professional redesign with the same colors. This is an audit-led refinement of the previously selected portrait-led direction, not a pixel clone of the rejected layout. The source governs palette, real photograph, logo, type families, and existing CMS content; composition and motion timing intentionally change.

Implementation screenshot: `docs/motion/hero-refinement/02-desktop.jpg`. Source and implementation are both 1353 × 929 pixels, captured at the same 1363 × 936 CSS viewport, route `/`, opening state, dark theme, and ordinary motion preference. The capture omits the scrollbar and uniformly scales by about 0.994. No density scaling was added.

Full-view comparison: `docs/motion/hero-refinement/06-comparison.jpg` (2706 × 971 including 42-pixel labels). Both actual captures are placed together at their original size. Focused comparison: `07-detail-comparison.jpg`, equal crops covering typography, photograph boundary, metadata, and actions. Both combined views were opened and inspected after the final fixes.

Responsive browser evidence: `03-mobile.jpg`, a 390 × 844 CSS iframe (380 content width); `04-tablet.jpg`, a 1024 × 844 CSS iframe (1014 content width). These contain the surrounding review stage. Motion evidence: `05-expanded.jpg`, plus an MP4 made from 56 actual browser frames at six captured frames per second, encoded at 30 fps with repeated frames. This demonstrates pacing, not a frame-rate benchmark.

## Findings and iteration history

- [P1, resolved] The live full-width heading crosses the portrait and competes with the face. Replaced absolute title fragments with a normal-flow reading column and a separate portrait column. Post-fix evidence: final desktop and full-view comparison. The title and photo have separate bounds.
- [P2, resolved] The live location/status and CTAs occupy disconnected lower corners. Grouped real identity, role, location, availability, and actions into one copy block. Mobile puts actions before the photo. Post-fix evidence: desktop, mobile, tablet.
- [P1, resolved] First implementation cleared actions too early during automatic focus scrolling. Delayed the copy fade to progress 0.24–0.38; photo expansion begins at 0.40. Retested View Projects: URL became `/#projects`, and the project heading reached the viewport below the navbar. Keyboard CV activation returned to Download CV without an error alert.
- [P2, resolved] `overflow: hidden` let focus scrolling move the sticky hero's internal scroll position by 37px, shifting the composition. Replaced it with `overflow: clip`. Post-fix keyboard activation measured sticky scrollTop 0; opening capture again aligns the photo at y=157 and copy at y=244. Recaptured desktop, combined comparison, and the entire motion video after this correction.
- Potential short-window clipping addressed by limiting desktop title scale with svh as well as vw. Short and ultrawide physical devices were not exercised in the browser; this is a remaining coverage gap rather than a claimed test result.

No actionable P0/P1/P2 issue remains in the observed opening and scroll states at the tested widths. The new two-column composition is an intentional response to the latest brief.

## Required fidelity surfaces

Fonts/typography: preserved self-hosted Inter 400 and Instrument Serif italic, with one semantic H1 containing the saved role. Display words use balanced, readable mixed case rather than the source's oversized uppercase overlap. Serif amber emphasis is retained. No truncation or title/photo collision in the tested layouts.

Spacing/layout: consistent six-percent desktop gutters, a clear column gap, and grouped metadata/actions. Mobile uses 6.5-percent gutters and 32px between copy and photo, with no pinned scene. Actions are visible in the first mobile viewport. Measured zero horizontal overflow at desktop, mobile, and tablet widths.

Colors/tokens: unchanged navy #05090f, off-white #f5f6f6, amber #ffb20b, and blue #62b1ff. Same raster navy atmosphere and subdued control borders. Name uses the existing blue accent; the amber serif word remains the main color emphasis.

Image quality/assets: unchanged real CMS photograph, original outdoor background, unchanged MA mark and atmosphere asset. The initial frame shows the original photograph without an AI face, cutout, synthetic props, or distortion. The portrait reveal and expansion use clipping and geometry; pointer drift is reduced to at most three pixels per axis. Full-width expansion naturally enlarges the original 960px image and is less sharp than the opening frame.

Copy/content: name, role, location, availability, and project CTA use existing profile/site-section data. Availability appears once. Added identity is the saved shortName, not invented promotional text. Existing CV label and backend behavior are retained. No new biography or marketing paragraph.

Icons/accessibility: existing Feather icons are retained and aligned with text. Name, role and original portrait alt text remain meaningful; controls have focus indicators and keyboard activation. Hidden copy becomes inert after the fade. Existing pause/resume and reduced-motion branches remain in place.

## Interaction and validation

- Portrait expands after the text clears; the face stays visible. Final expanded screenshot was inspected.
- Pause held portrait width at 1353px while scrolling; resume synchronized the width to current progress. Scene height stayed stable.
- View Projects navigated to the real featured-project section after the timing/overflow fixes.
- Enter on Download CV completed its loading cycle without an alert. A saved-file download assertion was not captured.
- Mobile actions appear above the photo; zero pinned scenes, no horizontal overflow. Tablet retains separate columns with no overlap or overflow.
- Application console warnings/errors: none in inspected tab logs; Chrome extension metadata errors were identified by their extension URL and excluded.
- Typecheck, lint, production build, and whitespace diff checks passed after the final implementation.

## Scope and limits

Only hero JSX/CSS changed in the application. Other landing sections, public CMS data, AI integrations, contact submission, admin, server, and security logic are unchanged. The previous whole-page QA is archived at `docs/motion/refined/design-qa-2026-10-03.md`; its checks are historical, not newly repeated here. The preview uses a read-only public CMS snapshot. Browser preference emulation is unavailable, so the reduced-motion path was inspected in code rather than asserted with an OS preference switch. No production merge or manual deployment is part of this update.

Implementation checklist: source captured; desktop and focused comparisons inspected; all observed P1/P2 issues corrected and recaptured; responsive and primary control checks complete; final scoped changes ready for draft review.
