# Refined portfolio design QA

Final result: passed

## Source and viewport

- Selected hero reference: docs/motion/refined/source-hero.jpg (1505 × 1045 pixels).
- Selected page direction: docs/motion/refined/source-full-page.jpg (802 × 1960 pixels). This is a compact layout reference, not a scroll storyboard.
- Implementation: docs/motion/refined/hero.jpg (1353 × 929 pixels), at 1363 × 936 CSS viewport. The cloud capture omits the scrollbar and scales the content uniformly by approximately 0.994; no anisotropic stretching is used.
- Side-by-side comparison: docs/motion/refined/hero-comparison.jpg (2706 × 969 pixels, including 40-pixel labels). Reference is proportionally fitted into the same 1353 × 929 comparison cell. Implementation stays at captured pixel size.
- Mobile: 390 × 844 CSS iframe viewport; tablet: 1024 × 844 CSS iframe viewport. Screenshots contain cropped review frames. No horizontal overflow was measured at any tested width.
- Browser evidence uses the published public CMS snapshot, original portrait, and original project covers. Contact submissions and AI requests are deliberately disabled in the local review server.

## Visual comparison

Fonts: self-hosted Inter at 300/400/500 weights and Instrument Serif italic. The final headline weight was increased after comparison; the amber italic word and compact Engineer line reproduce the selected hierarchy. Standard page and control copy uses Inter.

Spacing: the large portrait-led hero and sparse sections retain the selected direction. A 24-pixel mobile heading/photo gap replaced a touching edge. Career and learning sections intentionally have more room than the compact source image, reflecting the latest request for professional section-scale presentation.

Palette: near-black navy #05090f, off-white #f5f6f6, amber #ffb20b, and blue #62b1ff. A subtle raster blue atmosphere replaces literal recreation of generated background texture. Borders and secondary type are subdued; amber is reserved for emphasis and progress.

Assets: the unchanged original photograph replaces the generated reference face. No generated portrait or synthetic person cutout is used. Five actual CMS project covers remain uncropped with object-fit: contain. The generated MA mark is served as a crisp, optimized WebP at 40 CSS pixels, with a matching navy ground.

Copy: biography, title, availability, skills, projects, career entries, university, training, dates, and links come from saved CMS data. There are no invented performance metrics or AI slogans. Availability appears once in the hero. The Discovery / Build / Ship workflow is absent. All skill categories remain accessible in expandable details.

## Iterations and fixes

1. Implemented the selected navy/amber composition and reviewed all major desktop sections.
2. Fixed the initial full-body portrait crop, thin headline weight, italic edge spacing, anchor offsets, and mobile title/photo spacing; recaptured the hero and comparison.
3. Checked opposite skill movement and pause/resume. Kept pinned heights stable while paused, and synchronized progress on mount/resume.
4. Actual recording on a fresh load exposed a project scroll listener attached before asynchronous project data. Moved the scene into a component mounted only when published featured projects are ready. Reloaded and verified scroll selection changes and all five covers loading.
5. Added large project-panel entrance motion on compact layouts, retaining the desktop horizontal reel. Verified mobile Experience and Training layouts and expandable course details.
6. Recaptured the final hero and reviewed the normalized side-by-side comparison. No unresolved P0/P1/P2 design issues remain. Minor differences in photographic crop, serif glyph shape, and deliberately simplified controls are P3 adaptations to real assets and the latest user feedback.

## Interaction and motion checks

- Frontend skill rail: continuous left-to-right; backend rail: right-to-left. Computed directions reverse/normal and changing transforms confirmed movement.
- Pause: both marquee transforms stayed identical across observations. Resume restored running state.
- Hero: staged type entrance; rectangular original photo expands to a full-width frame on scroll; gentle pointer response. Controls leave the tab order once fully cleared.
- Projects: fresh-load scrolling advanced from JobPilot AI through Lobby, GameZone Arena, Construction, and UniHub. Selectors move to each scene; all five images loaded successfully. UniHub case-study arrow opened /projects/unihub.
- Career: scroll progress line, progressive row opacity/translation, and expandable role descriptions.
- Education: degree word reveal, subtle vertical drift, real university and dates.
- Training: staged rows and rotating disclosure arrows. Angular details exposed the saved issuer/date.
- Portfolio AI: global launcher and Contact entry opened the existing dialog; close control worked. Focus moved to the question input.
- AI Job Match: Contact entry navigated to /job-match and displayed its existing job-description form.
- CV: keyboard activation showed Preparing PDF, then returned to Download CV without an alert. The existing download component validates PDF MIME/signature before creating its download. This browser's download-event capture did not provide a file path; an end-to-end saved-file assertion is therefore not claimed.
- Mobile menu opened and closed; its Projects anchor reached the landing-page section. Five vertical project panels remained accessible; zero pinned scenes on the compact viewport.
- Reduced motion: existing OS preference branch disables pinned choreography, continuous CSS animation, and Motion effects. The browser does not expose preference emulation, so this branch was reviewed in code rather than asserted as a browser test.
- Console: no application warnings/errors in captured tab logs. Chrome extension metadata errors were excluded by their extension source URLs.

## Validation and recording

npm run typecheck, npm run lint, npm run build, and git diff --check passed after implementation.

The video is made from 209 actual browser frames captured while using the page and opening its AI dialog. It is paced at 7 captured frames/second and encoded as a 29.87-second H.264 MP4 at 1354 × 930 pixels; repeated frames provide a 30 fps container. It is a paced demonstration, not a performance benchmark or a static-image camera pan. Live AI answers and external message submissions were not tested through the read-only preview.
