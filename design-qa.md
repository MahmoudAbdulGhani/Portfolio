# Public portfolio implementation — design QA

final result: passed

The implementation covers all eight published project routes, Contact, AI Job Match and shared public navigation. It extends the selected Projects studio gallery and existing landing palette. No deployment or merge was performed.

## Visual evidence and density

The three generated concepts were inspected before implementation. Source canvases: 1487×1058. Actual desktop viewport: 1363×936 CSS pixels; screenshots: 1353×929 content pixels, density 1. Source images were resized proportionally to 1353px wide and cropped to the same visible height, without stretching. Cases and Contact show their hero/form; AI shows the empty-input state. The taller source canvas is not treated as application overflow.

Local review captures under the session's qa-public directory: case-v4.jpg, contact-v4.jpg, ai-v4.jpg. Combined comparisons case-comparison-final.jpg, contact-comparison-final.jpg, ai-comparison-final.jpg and focused case-focus-final.jpg, contact-focus-final.jpg, ai-focus-final.jpg were all opened and inspected. These are review intermediates, not required runtime assets. Earlier landing and archive reports are preserved in docs/motion/scroll-chapters/landing-design-qa.md and docs/design/projects-gallery-qa.md.

Phone and tablet checks used the actual frontend in 320×844, 390×844 and 1024×844 iframe viewports. Scrollbars reduce usable widths to 310, 380 and 1014. The long construction title was reviewed on phone/tablet. Contact's email wraps fully at 320px. All eight project routes reported scrollWidth equal to clientWidth at desktop and 320px.

## Findings resolved

- Replaced route-specific header branches with one five-link order: Home, About, Projects, AI Job Match, Contact. Footer uses the same order. About and AI visibility are CMS-gated consistently. Mobile includes Search, CV, theme and the same destinations; no body scrolling behind the modal.
- Case studies begin with the actual title, type, tagline, metadata and source/demo actions, followed by real product artwork. Removed the cover-first layout and floating next-project bar. Gallery, contribution, technology and engineering evidence remain available.
- Grouped JobPilot and construction features without changing the CMS feature text. Lobby shows actual community/guest screenshots. GameZone has keyboard-operated booking views; UniHub has student/user/admin views. User Management retains real security/architecture evidence. Medicare uses verified identity artwork, and Home Services uses the captured landing page.
- Contact now has an editorial invitation, primary links, compact socials and open form with persistent labels. Validation focuses the first invalid field. The existing honeypot and payload remain intact. Duplicate submission is guarded; success persists until the user explicitly starts another message.
- The profile responseTime is the single displayed expectation. An older conflicting “I usually reply” clause is removed from the confirmation presentation when that profile value exists; stored CMS data is untouched.
- AI input/report layout uses the requested 5/7 split, real streamed status and real returned report categories. Removed the decorative percentage-like loading bar. Oversized input now explains the 8000-character limit and disables submission. No fabricated score or report appears in the idle state.
- Refined Contact's open form and social density after full-view comparison. Reduced excessive atmosphere opacity and made boundaries clearer in both themes. The AI submit action fits in the desktop viewport. Contact's secondary AI link has space reserved for the existing launcher.

No actionable P0/P1/P2 visual findings remain within this reviewed scope. No visual edits after the final full-view and focused comparisons.

## Intentional fidelity differences and asset limits

CMS-owned project type/tagline and longer narrative text replace illustrative marketing copy in the concepts. JobPilot's actual type is longer, so its italic line is smaller and wraps differently. Case-study reading headings use Inter. The existing verified device composition differs from the generated perspective and keeps product screenshots undistorted. Atmosphere is quieter than the concept. Controls retain the application's restrained corners rather than the generated pill shapes.

AI input remains 5/7 per the written specification, although the concept's input appears wider. Its purpose comes from the actual CMS section; displaySubtitle optionally overrides the generic interface accent. Contact uses actual responseTime and invitation data.

No Medicare product screenshots or verified Home Services mobile/Figma source were available. These pages use the existing verified logo/desktop capture, with concise actual content; no fabricated clinic interface or mobile reconstruction was introduced. P3: future verified screenshots could refine these evidence stories.

## Executed checks

- TypeScript typecheck, ESLint (zero warnings/errors), production build and git whitespace check passed.
- Browser: eight actual titles, loaded hero screenshots/logo, identical desktop primary navigation and no horizontal document overflow at desktop/320px.
- Contact: empty-field errors and first-field focus; local sending state with disabled button; deterministic success with focused status; explicit reset control; deterministic failure preserves entered message. All tests intercepted in the development preview, never sent to a live inbox.
- AI: empty and 79-character validation; 8001-character error and disabled submit; streamed local loading status, complete returned fixture report, visible strengths/experience/project links/partial matches/gaps/summary; service failure preserves entered description; Clear restores idle state. The fixture is explicitly identified as a UI test, not AI output.
- Copy Executive Summary: successful copied state and exact fixture summary verified in clipboard on the top-level page. The iframe clipboard attempt was not successful; the top-level test passed.
- Report export and token-gated CV controls were exercised. The CV action returned to its normal enabled state without an application error. The browser download-event observer timed out, so downloaded file completion/content is not claimed. Existing export/PDF request implementations are retained.
- Gallery opens, ArrowRight navigates, Escape closes, body scrolling restores and focus returns to the hero trigger. Mobile menu Shift+Tab wraps to the last control; Escape restores trigger focus. GameZone ArrowRight selects Date and time. UniHub End selects Admin portal. JobPilot architecture End selects Deployment and displays its actual CMS description.
- Shared Search opens the existing command palette. Theme toggles render the new pages in light/dark and preserve preference. About returns to the landing About section. The archive still shows eight projects.

## Scope and verification limits

The development preview disables production proxies and serves a public CMS snapshot. Explicit success/failure fixture queries return in-memory responses only; they cannot store messages or invoke AI. No backend, schema, dependency, stored CMS content or CV geometry changed. New fixtures are imported solely by the development review config, never the production frontend.

The existing E2E spec was updated for the new menu ID, default-theme behavior and gallery semantics. Its CLI runner was not executed; the relevant frontend checks above ran in the provided browser. The existing 70-second timeout and provider parsing remain code-reviewed, not forced in the browser. OS-level reduced motion was not changed; Reveal and CSS static paths were reviewed. Live inbox delivery, provider quality, actual tailored document content, production deployment and forced image-network failures remain unverified. Extension metadata errors were observed; no application-origin JavaScript errors appeared during the reviewed states.


## Landing Selected Work — 2026-10-05

final result: passed

Source visual truth: Cris Ace's image-led portfolio, https://dribbble.com/shots/23657216-UX-UI-Design-Portfolio-Graphic-Design. Browser source capture: /workspace/scratch/e6887313a9d4/qa-landing-panels/source-reference.jpg (1363×936). The user approved adapting the reference into numbered, vertically arranged panels using the existing navy, ivory and amber portfolio identity. This is an adaptation, not a pixel clone of the two-column source. Pinterest's invitation overlay prevented inspecting its complete video; no unobserved animation is claimed to be reproduced.

Implementation screenshot: /workspace/scratch/e6887313a9d4/qa-landing-panels/landing-projects-final.jpg (1353×929 content pixels, 1363×936 CSS viewport, density 1). Both source and implementation were opened. comparison-full.jpg puts both views together at 900px proportional width; comparison-focus.jpg compares actual first-row source images/captions and the implementation's device/caption region. Both combined inputs were opened and reviewed. No image was stretched. The wider single-panel composition, original CMS content and shared navigation are intentional adaptations.

Five fidelity surfaces:
- Typography: Inter for headings, captions and links; existing Instrument Serif italic for the amber heading accent and project numbers. Hierarchy is clear; the full construction title wraps on phone without truncation.
- Rhythm: 88%/1320px content canvas, 70px desktop chapter gap, 16px image corners, 26px caption padding. Phone uses one column, 42px gaps, 10px corners and 44px action targets.
- Tokens: existing navy #05090f, ivory #f5f6f6 and amber #ffb20b; restrained border and hover treatment. No new visual system or palette.
- Images: actual product screenshots and the existing transparent laptop/studio assets. Complete bezels, undistorted main screens and contained secondary screenshots. No generated or fabricated product UI.
- Copy: actual CMS names, taglines, featured selection/order and destinations; section eyebrow/heading and archive CTA remain CMS-driven. Selection count is derived from the actual five projects.

Comparison history and resolved findings:
- [P1] Earlier landing laptops exceeded the scene height, especially in wide/short windows. Replaced width-only sizing and negative bottom offsets with bounds based on both scene dimensions and positive motion headroom. All five device bounding boxes now remain inside their scenes at every tested width.
- [P2] Lobby's secondary screenshot used a 4.2 aspect ratio and aggressive cover crop. Removed that crop; the entire screenshot is contained and visible.
- The initial new desktop composition was inspected, then the same settled panels were captured. Full-view and focused comparison found no remaining actionable P0/P1/P2 differences against the approved adaptation. No visual changes followed final comparison.

Executed browser checks: all five settled desktop panels loaded every image; all laptops fit their scene; root scrollWidth equals clientWidth at 320×844, 390×844, 1024×844, 1366×640 and 1920×640 iframe viewports, plus 1363×936 desktop. Phone construction title was opened and inspected. Wide harness presentation scales the real 1920×640 iframe to 0.66; compact harness uses 0.92. These are presentation scales, not changes to the tested inner viewport. Short windows retain normal vertical page scrolling.

Motion verification: off-screen opacity 0.25 transitions to 1 as projects enter; scroll transforms change across the page, with main-image translation bounded to ±12px and secondary translation to ±20px. Caption/secondary delays remain subtle. Keyboard Tab into the construction project reveals its full content. An explicit dev-only reduced-motion fixture makes all five panels immediately visible with device/detail/composition transforms equal to none; OS settings were not altered. The CSS reduced-motion media path also disables hover transitions. Pointer tilt and arrow hover were code-reviewed; their motion was not separately captured. Touch and short-window layouts disable cinematic depth using the existing motion context.

Primary actions: Explore Lobby opened /projects/lobby; View all projects opened the archive containing all eight published projects. Remaining image/title/CTA hrefs use the same actual CMS slug. Browser console checks found no application errors; extension metadata errors are external to the app. Typecheck, ESLint and production build passed. No browser CLI runner, live AI calls, inbox delivery, merge or deployment was performed.

Implementation checklist: complete. Remaining P3 polish: none required for this change.


## Laptop assemble/open/settle — 2026-10-05

final result: passed

Source visual truth: the approved settled landing composition at `/workspace/scratch/e6887313a9d4/qa-landing-panels/landing-projects-final.jpg`. Motion concept: user-selected separated-screen photograph, https://share.google/HrCmwsxuPWuk0p7F7, and the GSAP Vault opening demonstration. The implementation intentionally retains the existing navy studio scene and real project content rather than copying either source’s appearance or commercial code.

Latest browser-rendered implementation: `/workspace/scratch/e6887313a9d4/qa-laptop-opening/landing-opening-final.jpg`. Source and implementation are both 1353×929 content pixels from the same 1363×936 CSS viewport and browser capture scale; no density mismatch. State: first project settled/open. The small scroll alignment difference is about 6px and is normalized in the focused device crop. `comparison-full.jpg` displays both complete views together at proportional 900px width; `comparison-focus.jpg` displays the corresponding actual device regions at native scale. Both combined inputs were opened and reviewed.

Motion evidence: `assembly-phase-latest.jpg` and `opening-phase-final.jpg` capture the real keyframes paused by explicit dev-only review queries at 12% and 32%. `motion-storyboard.jpg` places assembly, opening and the normal settled screenshot together. These paused captures establish geometry and layering, not real-time timing. The unpaused production component was independently exercised through viewport entry, mouse replay and keyboard Enter replay. Computed CSS shows a 1.85s, single-iteration lid animation, a fixed unanimated base, and a separate screen fade. It later reaches identity transform and screen opacity 1.

Comparison history / resolved findings:
- [P2] The early phone replay control approached the top bezel at 320px. Moved the phone device bottom offset from 21% to 17%. Post-fix `phone-320-final-visible.jpg` shows the complete device with the replay control above its visible frame.
- [P2] Initial preserve-3D layer sorting could occlude the masked base in the middle of the opening. `opening-phase-visible.jpg` records the issue. A 1px depth offset was insufficient. Changed camera compositing to flat, with local perspective and a foreground base layer. `opening-phase-final.jpg` clearly shows the base throughout the mid-opening state; the assembly and final captures also show it.
- The final full-view/focused comparisons show no remaining actionable P0/P1/P2 drift. No product changes followed the final comparison.

Required fidelity surfaces:
- Typography: preserved Inter and Instrument Serif families, heading hierarchy, numbers, CMS titles and taglines; Replay is a quiet 11px label with an accessible project-specific name.
- Layout/rhythm: original panel dimensions, caption spacing, stage radii and vertical chapter rhythm remain. Whole device edges fit at desktop, phone, tablet and wide/short widths. Phone repositioning is intentional clearance for the new control.
- Colors/tokens: existing navy, ivory and amber; replay uses the established subdued border/background and amber focus state.
- Images/assets: actual source raster masks and unchanged real product screenshots; no synthetic product UI or CSS-drawn laptop. Both lid and base are visible in the checked opening states. Screen screenshots remain contained and move with the lid. This is 2.5D motion, not a true 3D model.
- Copy/content: all five real CMS names, taglines, order and links remain; no promotional claims were added.

Browser checks: all five desktop panels enter the open state with no broken images, fit their scenes and have correctly named replay controls. Keyboard focus reveals off-screen panels; mouse and Enter replay restart the lid. The 320×844 and 390×844 phone, 1024×844 tablet and 1920×640 wide/short iframe viewports have scrollWidth equal to clientWidth (310/380/1014/1910px after scrollbar), with all five device and lid bounds inside their scenes. The wide harness presents its real iframe at 0.66 scale. `phone-320-final-visible.jpg` was visually inspected. Explore JobPilot AI opened the actual `/projects/jobpilot-ai` case study.

An explicit dev-only reduced-motion fixture at 390×844 makes all five lid animations none, lid transforms none, screen and caption opacity 1, with zero Replay buttons. `reduced-motion-final.jpg` was opened. OS settings were not changed; the production CSS media rule was also reviewed. Browser logs contained extension metadata errors, with no application-origin JavaScript errors in the checked states. Typecheck, ESLint, production build and whitespace checks pass. No browser CLI runner, live AI/inbox call, merge or deployment was performed.

Implementation checklist: complete. Residual verification limits: reduced-motion behavior was exercised through the explicit development fixture rather than changing OS preferences; physical-device/Safari rendering was not tested. No remaining P3 polish required.
