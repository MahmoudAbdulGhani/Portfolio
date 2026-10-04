# Interactive portfolio refinement — 2026-10-04

final result: passed

## Source and comparison

Source visual truth: `docs/motion/interactive-refinement/before-hero.jpg` and `before-projects.jpg`, captured from the previously selected running implementation before these edits. The latest user explicitly changes the composition: Full-Stack left of the original photo, Software Engineer right, smaller bordered colored stack items, a project carousel, and removal of the pause button. The source governs fonts, assets, palette and CMS content; those requested composition and interaction changes are intentional.

Implementation: `hero-desktop.jpg`, `projects-desktop.jpg`, and `stack-desktop.jpg` in the same evidence directory. Desktop captures are 1353 × 929 pixels at 1363 × 936 CSS viewport, ordinary motion, dark theme, route `/`, opening hero or first featured project. The browser capture omits the scrollbar and scales uniformly by approximately 0.994. No additional density normalization was applied. Both hero opening captures have scrollY 0. Project captures show the same JobPilot AI item below the fixed navbar; section header spacing intentionally changes with the carousel layout.

Combined full-view evidence: `comparison-hero.jpg` and `comparison-projects.jpg`, 2706 × 969 pixels including 40px labels. Both were opened and compared. Focused evidence: `comparison-detail.jpg`, identical 1230 × 345 crops of the actual source and revised hero, with 36px labels. It was opened to inspect headline families, photograph separation, metadata and CTA grouping. These are refinements of the selected design, not a clone of the old layout. Stack size is checked against the explicit new size brief; the old large rail is documented in the historical `docs/motion/refined/skills.jpg`.

Responsive evidence: `hero-mobile.jpg`, `hero-tablet.jpg`, `stack-mobile.jpg`, and `projects-mobile.jpg`. Mobile is a 390 × 844 CSS iframe with 380px content width; tablet is 1024 × 844 with 1014px content width. Screenshots include the review stage, which is not part of the portfolio. Zero document horizontal overflow measured at all three tested widths.

## Findings and comparison history

- [P1, resolved] First split-hero implementation left the absolutely positioned photograph constrained by its grid area. It shifted right and overlapped Software Engineer. Fix: reset the absolute portrait's grid area to auto. Revised desktop bounds: left copy x81–421, portrait x474–879, right role x932–1272. Final hero, tablet and combined comparisons show separate bounds.
- [P1, resolved] Dragging a linked project image opened its case study on release. Fix: track pointer movement and suppress the click after a drag; keyboard clicks remain available. Desktop and 390px iframe drag now select Lobby while staying on the landing route. A short 15px drag settles back to the same card at x121.77. Normal link clicks opened the JobPilot AI case study.
- [P2, resolved] Carousel arrows initially shared the floating AI launcher's lower-right area. Fix: group arrows beside selectors at the left; phone selectors wrap above the arrows, all controls 44px or larger. Final desktop/phone captures show clear controls, including the longest project title.
- Requested changes, accepted: smaller title size to fit the three-column hero; compact colored chips; spring carousel with visible neighboring cards; no visible motion toggle. The final full-view and focused comparisons were inspected after corrections. No actionable P0/P1/P2 issue remains in the tested states.

## Required fidelity surfaces

Fonts/typography: retained self-hosted Inter and amber italic Instrument Serif. The saved full role is one semantic H1; split display fragments are aria-hidden. Headings do not collide with the portrait. The longest project name wraps into readable lines on phone without covering navigation. Stack labels measure 18.4px at desktop and 12px on phone, versus the previous large display rails.

Spacing/layout: three separate hero columns and six-percent desktop gutters. Mobile stacks the title, location/status, actions, then original photograph. Actions remain visible in its opening viewport. Carousel cards use 9% horizontal gutters (7% on phone), a consistent gap, and smaller dimmed neighboring cards. Phone controls wrap into two tidy rows. Image assets use contain rather than destructive cropping.

Colors/tokens: navy #05090f, off-white, blue #62b1ff and amber #ffb20b remain the core palette. Skill outlines and subtle fills use blue, pale blue, teal, amber and pale amber accents; this intentionally answers the user's request for individually colored stacks. Selected carousel buttons use amber; focus remains blue; disabled arrows are subdued.

Image quality/assets: unchanged real CMS photograph, MA mark, navy atmosphere and all five real project covers. No synthetic face or cutout. Portrait expansion enlarges the original photo, so it is naturally softer at full width. Project screenshots remain uncropped and legible at their native aspect ratio; square JobPilot art has intentional side space on desktop.

Copy/content: saved name, role, location, availability, project names/covers/links and skills remain CMS driven. Availability appears once. No new marketing sentences, AI claims or invented metrics were added. New UI labels describe navigation only. Feather icons preserve the existing visual family.

## Interaction and checks

- Hero View Projects reached `/#projects` on desktop and phone.
- Hero type entrances move from opposite sides; the portrait opens from its center and expands after copy clears. Actual browser recording inspected.
- Both compact rail rows continue moving in opposite directions. Border and 12px phone typography verified; all categories remain in accessible details. No motion-toggle element remains.
- Carousel Next/Previous, numbered selectors, Home/End, drag and short-drag settling tested. Native arrow clicks kept document scrollY 2565. At End, fifth item active and Next disabled. At Home, first active and Previous disabled. All five covers loaded after settling.
- Only the active slide is interactive; keyboard arrow controls and polite slide status remain available. Normal case-study navigation tested. Browser review uses a mouse in a phone-sized iframe; physical touch hardware was not tested.
- Fresh tablet-tab console has no application warnings/errors. Earlier development HMR import errors occurred while files were being written and are absent after the completed build; extension metadata errors have chrome-extension URLs and are excluded.
- Typecheck, lint, production build, and whitespace checks passed after the application changes.
- OS reduced-motion support remains: no pinned choreography or continuous animation, instant carousel controls. Preference emulation is unavailable; this branch is code reviewed, not a claimed browser preference test.

## Scope and handoff

This update changes hero, stack presentation, motion toggle and projects. Experience, Education, Training, Contact, server, admin, CMS, CV and AI integrations retain their existing implementations. The section-specific follow-up choreography is proposed in `docs/motion/interactive-refinement/motion-plan.md`; it is not claimed as built.

`motion-preview.mp4` is a 10-second H.264 preview made from 60 actual browser captures, paced at six captured frames per second and encoded at 30 fps by repeating frames. The final recording contact sheet was opened. It demonstrates motion direction and interaction, not live frame-rate performance. The read-only preview uses the public CMS snapshot; live AI responses and message submission were not exercised. Short/ultrawide physical devices and text zoom remain coverage gaps. Prior hero QA is archived in `docs/motion/hero-refinement/design-qa-2026-10-04.md`.

Implementation checklist: source captured; combined and focused comparisons inspected; observed P1/P2 issues corrected and recaptured; responsive and carousel interactions checked; production build passed; ready for draft visual review.
