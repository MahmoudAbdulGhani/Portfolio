# Projects archive option 2 — visual QA

final result: passed

## Evidence

Selected Studio Grid: docs/design/projects-gallery/selected-reference.jpg, normalized proportionally from 1487×1058 to 1353px wide. Actual projects-final.jpg: 1353×929 content pixels at 1363×936 CSS viewport. Source canvas is taller; this is not treated as overflow. Both show the first project row, active navigation and all-projects state.

Combined full-view comparison-final.jpg and focused header-comparison.jpg / caption-comparison.jpg were opened and inspected. Review captures are local artifacts in docs/design/projects-gallery. Phone: projects-phone.jpg, projects-phone-long.jpg, projects-narrow.jpg at 390×844 and 320×844 CSS iframe sizes. Tablet: projects-tablet.jpg at 1024×844. Scrollbars reduce content widths to 380, 310 and 1014 respectively. Intermediate captures are not required runtime assets.

## Visual comparison

- Inter title/caption hierarchy and amber Instrument Serif italic line reproduce the selected direction. Full CMS names wrap naturally; the long construction title is complete on phone with visible focus.
- Wide borderless two-column studio gallery on desktop/tablet; one column on phones. Slightly deeper intro accommodates actual CMS text. Real device aperture proportions differ from generated perspective to preserve screen pixels. Second row begins within the desktop viewport.
- Existing navy, off-white, amber and blue illumination match the landing.
- Actual CMS order, categories, summaries, stack and destinations. Dynamic count replaces decorative collection label. Lobby technologies use real CMS values. Generated GameZone/Cedar marketing interfaces are replaced with actual interfaces. Medicare uses its verified logo because no product screenshot exists.
- Restrained filter transitions and fine-pointer hover; no pinning/autoplay. Component/CSS paths remove decorative transforms and duration for reduced motion.

No actionable P0/P1/P2 findings remain. No visual edits after final comparison. P3: actual screen densities vary from generated reference; future verified screenshot refreshes can refine this while retaining the layout.

## Browser checks and limits

- All / Digital Hub / Personal: 8 / 6 / 2 projects. Personal shows Medicare Hub and Home Services. CMS filter labels retained.
- All eight screen/logo images loaded; forced image/network failure was not exercised. Fallback/unavailable state code-reviewed.
- Keyboard Enter opens JobPilot case study at correct route; Back restores archive. Gallery destinations retain actual slugs.
- Phone menu and existing AI panel open/close correctly; no AI request sent.
- 1363px desktop, 390/320px phone and 1024px tablet have no horizontal document overflow. Long phone caption remains readable.
- Console review: extension metadata errors only, no application-origin errors.
- Typecheck, lint, production build and whitespace checks pass. No backend, schema, CMS or dependency mutation.

OS-level reduced-motion preference was not changed; static paths reviewed. Read-only preview does not prove live API writes, provider output, inbox delivery or deployment. Error/retry rendering code-reviewed rather than forced in browser.

Landing QA preserved in docs/motion/scroll-chapters/landing-design-qa.md. Remaining pages are planned in docs/design/remaining-pages-plan.md and HTML overview, not implemented. GitHub stays draft; merge/deploy is separate.
