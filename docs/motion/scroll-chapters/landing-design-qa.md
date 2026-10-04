# Scroll Chapters visual QA

final result: passed

## Evidence and normalization

Source visual truth: `/workspace/scratch/c039daad40c5/generated_images/exec-9f5b6984-2467-4019-a476-826d3cf1b230.png` (the selected refined Scroll Chapters mock,1487×1058). Repository evidence: `docs/motion/scroll-chapters/source-normalized.jpg` (1353×963).

Implementation screenshot: `docs/motion/scroll-chapters/desktop-final.jpg`,1353×929 pixels, from the cloud-browser preview; CSS viewport1363×936, density1. Browser content captures exclude the scrollbar strip. Source is proportionally normalized to the same1353px width; its longer963px canvas is not treated as a page overflow. State: landing /#projects, selected-work label, settled first scene and next scene visible, original navy theme. No browser chrome is included.

Full-view combined comparisons: `comparison-initial.jpg` and `comparison-final.jpg`, source on left, implementation on right. Both were opened and inspected together. Focused source/implementation caption comparison: `caption-comparison.jpg`, source above implementation. Additional actual browser evidence: `sequence-review.jpg`, `mobile-final-content.jpg`, `mobile-long-final-content.jpg`, `tablet-final-content.jpg`.

Phone:390×844 CSS iframe, screenshot1363×936 parent; content crop390×844 at observed origin487,39 includes the scrollbar gutter. Tablet:1024×844 CSS iframe, parent1363×936; content crop1024×844 at origin170,39. Phone and tablet screenshots were also inspected as full parent views to verify framing.

## Findings and comparison history

1. [P2, resolved] Initial physical device had a deep keyboard that consumed scene space compared with the shallow reference. Evidence: desktop-initial.jpg and comparison-initial.jpg. Regenerated the real raster device with a shallow base, measured the new transparent opening and changed the image URL so the browser did not retain its earlier cached raster. Post-fix: desktop-final.jpg, comparison-final.jpg, tablet-final-content.jpg. Original UI pixels remain contained in the aperture.
2. [P2, resolved] Initial JobPilot secondary plane repeated its workspace rather than showing the supporting document. Replaced it with page1 of the already public portfolio CV. Post-fix: desktop-final.jpg. The real document is denser than the generated mock; preserving real source text is intentional.
3. [P2, resolved] Initial oversized chapter spacing obscured the next scene and the generic h2 cascade could inflate captions after hot reload. Reduced chapter gaps and stage height, made chapter type selectors more specific, kept the long name intact and removed double anchor spacing. Post-fix: caption-comparison.jpg, sequence-review.jpg, mobile-long-final-content.jpg.
4. [P2, resolved] Wide mobile floating AI label could cover a long project caption near the viewport bottom. Landing now uses a44×44 icon launcher on phone, retaining its accessible name and open/close behavior. Post-fix: mobile-long-final-content.jpg.

No actionable P0/P1/P2 findings remain. The final comparison was repeated after these fixes; no further visual fixes were made after the final captured implementation.

## Required fidelity surfaces

- Typography: original Inter400,32.7px desktop project titles,21px phone, full names with natural wrapping, small uppercase collection label and amber separator. Clear title/action hierarchy; no ellipsis or clipped long title. Caption rhythm closely matches the focused reference.
- Spacing/layout: wide borderless scenes, measured device aperture, stable caption actions, native vertical flow and a visible next project. Physical device and real screens have modestly different proportions from the generated mock. This is intentional to avoid redrawing UI. Native scroll allows every scene and the Experience transition to be reached without pinning or horizontal movement.
- Color/tokens: existing #05090f,#f5f6f6,#ffb20b,#62b1ff retained. Generated studio illumination uses this direction; original product brand colors stay inside screenshots. No landing palette change.
- Image quality: real JobPilot,Cedar,Lobby,GameZone and UniHub screens, contain-fitted without distortion or permanent UI crop. Generated raster backdrop/device share navy studio direction and have no invented product UI. Transparent opening verified, no substitute CSS device art or placeholder imagery. All20 image elements loaded across the five scenes.
- Copy/content: CMS names, order, featured/published/portfolio visibility and destinations retained. Caption says Projects|name; necessary View project label only. No new marketing metrics or feature claims. Remaining three project-index covers are still a separate planned task.

## Browser validation

- Desktop1363px, phone390px and tablet1024px checked; no body horizontal overflow.
- Zero carousel roles/controls, five project articles in native vertical order.
- Projects navigation and mobile menu tested. Keyboard activation opens JobPilot case study; existing route content rendered. All five artwork/caption links retain their exact project slugs.
- Mobile AI launcher opens and closes the existing dialog; no assistant request sent.
- Actual scroll capture shows every scene, distinct masks, supporting planes, caption reveals and transition into Experience. projects-walkthrough.mp4 uses66 browser screenshots, played at6fps (roughly half the capture rate), encoded to30fps; individual frames were verified by SHA256 against browser-captured bytes. No generated video.
- App-origin console errors checked with the cloud browser: none.
- Typecheck, lint, production build and git diff --check pass. No backend or CMS mutation.
- Reduced-motion static fallback checked in existing provider and component/CSS paths; this browser's OS preference was not changed. Separate OS-level preference exercise is a residual test gap, not claimed as a rendered test.

## Follow-up polish

[P3] The generated reference has a stronger device perspective and a more art-directed document density. The implementation prioritizes actual screen/document content and a restrained physical frame. A future real product screenshot/crop update could refine Lobby's supporting audio detail further.

## Implementation checklist

- [x] Carousel replaced in landing render.
- [x] Five original project compositions and distinct layer motion.
- [x] Desktop/phone/tablet visual evidence and combined source comparisons.
- [x] Primary project navigation and AI launcher tested.
- [x] Code checks and app console review.
- [x] Browser walkthrough recorded.
- [ ] Optional OS-level reduced-motion exercise.
- [ ] Merge/deploy draft before the public site changes.
