# Landing selected-work panels

Status: implemented and visually checked on 2026-10-05. See root design-qa.md.

The approved direction adapts Cris Ace's image-led portfolio into a curated vertical sequence, using the existing navy/ivory/amber portfolio. Source: https://dribbble.com/shots/23657216-UX-UI-Design-Portfolio-Graphic-Design. Preserve all CMS names, taglines, featured order, visibility and routes. The full eight-project archive remains separate.

Each chapter contains a studio image, complete laptop with real product screenshot, contained secondary screenshot on desktop, then an amber number, actual project title/tagline and Explore project action. Phone keeps one complete laptop and a 44px action. The footer of the section links to the existing project archive. Main-screen aperture measurements remain unchanged.

Motion: 700ms panel reveal from 28px below; 600ms caption reveal delayed 120ms; 750ms secondary reveal delayed 120ms; easing [0.22, 1, 0.36, 1]. Desktop scroll adds ±12px main depth, ±20px secondary depth, and a restrained 0.985–1 scale. Mouse tilt is limited to ±1 degree with spring stiffness 65/damping 24. Hover gives the image border an amber tint and moves the arrow 2px. No automatic cycling or scroll capture.

Images are bounded by both stage width and height with positive edge headroom. The whole device and secondary screenshot must fit through the full motion range. Reduce motion disables animated entry/depth; touch, tablet and short windows keep modest entry reveals without cinematic depth. Keyboard focus makes an unseen panel visible. Every image/title/action navigates to its real case study.

The development harness offers phone/tablet, 1366×640, 1920×640 and explicit reduced-motion review modes without modifying production, browser preferences or the OS. Validation is scoped to the read-only public snapshot.
