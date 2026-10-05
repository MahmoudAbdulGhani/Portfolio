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


## Portfolio pointer — 2026-10-05

final result: passed

Source visual truth: existing approved navy/amber portfolio at `/workspace/scratch/e6887313a9d4/qa-laptop-opening/landing-opening-final.jpg`, plus the standard Feather FiMousePointer geometry from the installed react-icons library. User requested a professional pointer aligned to this existing design. The native arrow uses the real library icon rather than custom-drawn geometry.

Implementation: `/workspace/scratch/e6887313a9d4/qa-portfolio-pointer/pointer-projects-final.jpg`. Source and implementation are 1353×929 content pixels from the same 1363×936 CSS viewport and browser capture scale. State: first landing project settled, dark theme. `comparison-full.jpg` puts both views together at proportional 900px width. `comparison-pointer.jpg` compares equal 120×120 crops around each actual pointer location, enlarged to 300×300; the cursor locations differ intentionally, while the viewport and settled panel state match. Both combined comparisons were opened and inspected. Minor existing device tilt varies with mouse position and is intentional.

The cloud screenshot includes its own black pointer marker/blue tracking glow. It visibly verifies the new amber halo, not the operating system’s native cursor bitmap. `native-arrow-preview.png` rasterizes the exact served SVG and was opened to check its amber fill, navy outline, proportions and hotspot placement. Computed root, link, Replay and Projects-filter cursor values all reference that SVG with hotspot 4/4 and appropriate native fallbacks.

Comparison history / resolved findings:
- [P2] The AI Job Match disabled button initially inherited the enhanced pointer due to selector specificity. Made disabled and busy cursor semantics explicit priority overrides. The disabled action now computes not-allowed.
- [P2] The new pointer originally reused Navbar’s pathname React key, producing a duplicate-key console warning. Namespaced its key as pointer-{pathname}; repeated Contact → AI Job Match navigation produced no new application errors and remounted the pointer hidden.
- Cancel pending frames when hiding, so a queued movement cannot reveal a stale halo over text fields or after keyboard input.
- Final full/focused comparisons show no remaining actionable P0/P1/P2 findings. No product changes followed final comparison.

Required fidelity surfaces:
- Fonts/typography: existing Inter and Instrument Serif hierarchy, weights, wrapping and all page copy remain unchanged; the cursor adds no text label.
- Spacing/layout: decoration is fixed with zero layout dimensions; all existing panel, header and caption geometry remains. 22px default / 35.2px interactive halo stays restrained.
- Colors/tokens: native arrow matches amber #ffb20b and navy #05090f; halo reads the existing --accent token, verified as rgb(255,178,11) in dark and rgb(155,96,0) in light. `pointer-light-theme.jpg` was visually inspected.
- Image/asset quality: exact Feather icon as a 32px SVG; real project assets remain complete and unchanged. Native-arrow preview confirms sharp outlined geometry.
- Copy/content: all actual CMS project titles, taglines, actions and navigation stay intact. Decorative element is aria-hidden and has no focus target.

Executed browser checks: pointer tracks actual mouse coordinates; interactive state expands to matrix scale 1.6; keyboard Tab hides it; pointer-events is none. Contact’s Name field computes auto and hides the halo. Projects’ three filter controls and the landing Replay control compute the custom arrow URL. AI Job Match’s disabled button computes not-allowed. Dark/light theme checks pass and the preview was restored to dark. The explicit development reduced-motion fixture shows motion-paused, static open laptops, zero replay controls and a hidden halo after mouse interaction; OS preferences were not changed. Public route changes reset the pointer. Post-fix console checks found no new application errors; extension metadata messages are external. Typecheck, lint, production build and whitespace checks pass. No production form submission, AI provider call, merge or deployment.

Implementation checklist: complete. Residual limits: physical touch, forced colors, viewport exit and pressed-state animation were code-reviewed rather than separately captured. SVG native-cursor assignment was verified by computed styles and independent asset rendering because the observer overlays its own pointer marker. No remaining P3 polish required.


## Physical laptop and mobile motion — 2026-10-05

final result: passed for the software-rendered preview and public UI; GPU/device validation remains pending.

Source visual truth: user-selected GSAP Vault laptop-screen-scroll interaction and the previously approved navy studio composition, `/workspace/scratch/e6887313a9d4/qa-laptop-opening/landing-opening-final.jpg`. This is an original geometry/motion adaptation, not a pixel clone. The latest desktop opening is `/workspace/scratch/e6887313a9d4/qa-cinematic-mobile/desktop-open-final.jpg`. Both inputs are 1353×929 content pixels at the same browser capture scale, from a 1363×936 CSS viewport. `comparison-final.jpg` presents both complete screenshots proportionally at 900px width; it was opened and inspected. Scroll state intentionally differs: the old settled image panel becomes a full-height sticky physical scene.

Required fidelity surfaces: Inter/Instrument Serif hierarchy and navy/amber palette remain consistent; scene radii and width align with the existing project panels; original geometry replaces the first photographic device, while the existing studio and CMS screenshot remain. No invented product text, statistics, logos or external app interaction. Screen image uses contain; final projected screen corners match all viewport corners. Header/logo, case-study destination, five-project order and downstream content remain consistent. The live screen offers the actual case-study link; its temporary perspective framing changes during camera travel.

Resolved findings:
- [P1] Preview WebGL is disabled. Added official software projection of the same 3D scene, plus static content for reduced motion/load failure. The cloud preview now exercises the opening rather than failing initialization.
- [P1] Software triangle sorting initially exposed holes across the keyboard. Explicit hardware ordering, physical hinge clearance and hidden rear-facing bezel corrected the fresh reloaded scene.
- [P2] Mobile live HTML became fully readable only at the last scroll position. Earlier handoff now completes at 90% touch/94% desktop and leaves a readable hold.
- [P2] Mobile home logo omitted the name while other public routes showed it. Shared responsive rules restore consistent naming and narrow-width truncation.

Captured evidence: desktop-opening.jpg, desktop-open-final.jpg, desktop-handoff.jpg, mobile-handoff.jpg, mobile-menu.jpg, mobile-gallery.jpg, mobile-contact-success.jpg, mobile-ai-report.jpg and mobile-reduced-320.jpg in `/workspace/scratch/e6887313a9d4/qa-cinematic-mobile/`. Desktop opening at progress 0.477 and complete handoff at 1.000 were observed; phone reversal and completed handoff were observed using native wheel scrolling. The screen opened JobPilot AI's actual case study. Menu Escape returned focus to Open menu; gallery next-image and Escape returned focus to its opener. Existing native Contact validation blocked empty submission; local success transitioned to Message sent and focused its confirmation. AI empty input showed its length error; the local success stream produced the complete moderate-match fixture report. No production submission/provider request occurred.

Viewport checks: desktop 1363×936 and phone 390×844 (inner content width 380) show no root horizontal overflow. The explicit reduced-motion 320×844 fixture (inner width 310) also has no overflow, loads no rendering engine and keeps the case-study link available in a static 510px content panel. The fixture does not change OS preferences. Physical coarse-pointer behavior and GPU performance were not measured.

Tests: TypeScript, ESLint, production build and both native geometry/reversal tests pass. Geometry tests project all four final screen corners at six phone/tablet/desktop aspect ratios. The production build warns about the lazy Three.js scene chunk, approximately 628KB minified/175KB gzip. No new application errors were observed after the final reload; external browser metadata logs are outside the app.

No actionable P0/P1/P2 issues remain in the inspected software preview and public UI. Material limit: this browser disables WebGL, so final GPU lighting/shadows, device frame rate, context-loss recovery and physical iOS/Android gestures still require verification before release. The PR remains draft; no merge/deployment.


## Shared cinematic project laptops — 2026-10-05

final result: passed

Scope of this result: the inspected rendered-fallback preview, responsive public UI and static reduced-motion view. GPU appearance/performance still requires device validation before release; the PR remains draft.

Source visual truth: the user-approved `cinematic-revision-plan/professional-cinematic-projects-plan.html`, user-selected GSAP Vault laptop-screen-scroll interaction and approved navy/amber studio portfolio. This implements the approved adaptation rather than a pixel clone. Baseline captures are `qa-cinematic-revision/01-desktop-open.jpg` and `04-mobile-approach.jpg`. Latest implementation captures are `qa-professional-laptops/desktop-open-final.jpg` and `mobile-open-final.jpg` under `/workspace/scratch/e6887313a9d4/`. Both desktop captures are 1353×929 content pixels from the same 1363×936 CSS viewport; both phone captures use the same 390×844 harness (380px inner content). Baseline desktop is the prior opening; current desktop is progress 0.509, in the approved open hold. Baseline phone approach is 0.462; current phone is 0.588, at the end of the hold. These are comparable open-device states with intentionally revised geometry/layout; they do not claim identical choreography times.

Combined full screenshots `comparison-desktop-full.jpg` and `comparison-mobile-full.jpg` proportionally display each complete input at 700px wide. `comparison-device-details.jpg` compares equal 760×590 crops at original pixel scale. All three combined images were opened and inspected. The focused crop is only a detail comparison; the complete original captures remain available. No final product change followed these comparisons other than source formatting, documentation and asset ignores.

Required fidelity surfaces:
- Typography: existing Inter/Instrument Serif hierarchy remains. Actual CMS titles are now untransformed h3 links; the long construction title wraps outside the physical display. Desktop actions show their text; phone actions retain a named 44px target.
- Layout/spacing: shared header/body/footer panel; 800px flagship and 620px supporting desktop stage caps; 360–520px phone stages. The first runway pins below the shared navigation at 92px. Supporting panels remain normal flow. Screenshot and metadata no longer compete inside the device.
- Colors/tokens: approved navy studio, ivory text and amber focus/actions; a shared graphite/satin device replaces the prior flat blue software geometry and mixed photographic supporting devices.
- Images/assets: original 28,784-triangle model, variable keys/legends, perforations, ports, slim bezel, camera aperture and matching posters. CPU renders use the exact mesh/camera and depth buffering; 46 poses are packed into six WebP atlases. The real product screenshot is contained in a fixed landscape screen. The final handoff is a separate contained screenshot, with no fabricated product UI.
- Copy/content: all five real project names, taglines, ordering and actual case-study destinations remain. No invented claims or external application interaction.

Comparison history / resolved findings:
- [P1] The first revised runway used padding as scroll travel, so its sticky stage left the viewport. Replaced this with an explicit containing height. Fresh desktop hold bounds are top 92px / height 800px / bottom 892px.
- [P1] The previous camera approach enlarged the physical display into a mismatched viewport shape and clipped the phone device. Both render paths now use a fixed-aspect plate and bounded camera; geometry tests project every vertex inside the plate through the opening hold and camera approach. The untransformed handoff preserves the screenshot with contain sizing.
- [P2] Metadata previously transformed inside the screen, reducing phone readability. Real titles, case-study actions, stack labels and outcomes now stay outside the decorative plane.
- [P2] Supporting projects previously used a different laptop treatment. All five now share the same model/poster pipeline and shorter scroll entries; supporting stage caps were reduced from 800px to 620px on desktop.
- [P2] A delayed fallback atlas could misalign the projected screen with the shown hardware pose. CSS3D now follows the currently displayed frame while the next image loads. Posters remain visible until the renderer is ready.
- [P2] Future CMS slugs could request a missing matching poster. Failed poster loading falls back to the actual project screenshot.

Executed browser checks: desktop opening, open hold, completed handoff at progress 0.887, full-device Lobby and construction panels, GameZone and UniHub reaching open progress 1.000, and all five desktop image sets loaded. Phone opening at 0.588, completed contained handoff at 0.985, reverse scroll returning to 0.605, and Skip animation advancing to the first normal-flow caption were observed through native scrolling. Explore JobPilot AI opened the actual case study with h1 JobPilot AI. Desktop title wrapping and phone/320px metadata/actions were visually inspected. Desktop and 390px phone have no horizontal root overflow; the 320px reduced fixture has clientWidth/scrollWidth 310px and no rendering engine on all five cards. Lazy offscreen posters in this fixture are not claimed as separately exercised. The fixture does not change OS preferences. Wide 1920×640 harness has clientWidth/scrollWidth 1910px. Browser console checks contain only external extension metadata errors, with no new application-origin JavaScript errors in checked states.

Evidence folder: `/workspace/scratch/e6887313a9d4/qa-professional-laptops/`. Main screenshots: desktop-open-final.jpg, desktop-handoff.jpg, mobile-open-final.jpg, mobile-handoff-final.jpg, supporting-lobby-final.jpg, supporting-construction-final.jpg, supporting-unihub-final.jpg and reduced-320-final.jpg.

Checks: TypeScript, ESLint, production build and both native geometry/hold/reversal tests pass. The lazy Three.js scene chunk is 622.58KB minified / 173.54KB gzip and loads near projects. Rendering has no idle loop; GPU/model/environment are shared. No backend/CV/security changes, production form submissions, live AI calls, merge or deployment occurred.

Implementation checklist: complete. No remaining actionable P0/P1/P2 findings in the inspected fallback/UI. Residual limits: this browser disables WebGL; final GPU lighting, shadows, keyboard texture, hardware frame rate, context-loss recovery and physical Safari/iOS/Android gestures were not measured. Fallback animation uses discrete rendered poses rather than continuous GPU rendering. Original authored geometry is not a purchased photographic device asset. No remaining P3 polish required for this review scope.
