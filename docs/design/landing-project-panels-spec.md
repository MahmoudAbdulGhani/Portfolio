# Landing selected-work panels

Status: implemented and visually checked on 2026-10-05. See root design-qa.md.

The approved direction adapts Cris Ace's image-led portfolio into a curated vertical sequence, using the existing navy/ivory/amber portfolio. Source: https://dribbble.com/shots/23657216-UX-UI-Design-Portfolio-Graphic-Design. Preserve all CMS names, taglines, featured order, visibility and routes. The full eight-project archive remains separate.

Each chapter contains a studio image, complete laptop with real product screenshot, contained secondary screenshot on desktop, then an amber number, actual project title/tagline and Explore project action. Phone keeps one complete laptop and a 44px action. The footer of the section links to the existing project archive. Main-screen aperture measurements remain unchanged.

Motion: 700ms panel reveal from 28px below; 600ms caption reveal delayed 650ms on cinematic desktop / 200ms elsewhere; 650ms secondary reveal delayed 1150ms on cinematic desktop / 500ms elsewhere; easing [0.22, 1, 0.36, 1]. Desktop scroll adds ±12px main depth, ±20px secondary depth, and a restrained 0.985–1 scale. Mouse tilt is limited to ±1 degree with spring stiffness 65/damping 24. Hover gives the image border an amber tint and moves the arrow 2px. No automatic cycling or scroll capture.

Images are bounded by both stage width and height with positive edge headroom. The whole device and secondary screenshot must fit through the full motion range. Reduce motion disables animated entry/depth; touch, tablet and short windows keep a shorter lid opening without cinematic camera/depth. Keyboard focus makes an unseen panel visible. Every image/title/action navigates to its real case study.

The development harness offers phone/tablet, 1366×640, 1920×640 and explicit reduced-motion review modes without modifying production, browser preferences or the OS. Validation is scoped to the read-only public snapshot.

## Laptop entrance — implemented 2026-10-05

Selected direction: assemble → open → reveal → settle. Reference: the user’s https://share.google/HrCmwsxuPWuk0p7F7 separated-screen photograph, plus https://gsapvault.com/demos/laptop-screen-scroll/index.html as motion inspiration. This is an adaptation to the existing portfolio artwork, not a reproduction of a paid demo.

`LaptopOpening.tsx` renders the existing 1499×744 transparent device twice as independently masked lid/base layers. The measured hinge is at y=700px (94.086%); the lid mask removes the bottom 5.914%, and the base mask retains that strip. The existing CMS product screenshot sits inside the lid and shares its transform. This is a lightweight 2.5D asset animation, not a complete WebGL laptop model. No new generated assets, model download, paid source or dependency is required.

On entering view once, cinematic desktop uses 1.85 seconds: the lid fades in separated by 22px, seats at 25%, opens from 74° through a restrained -1.5° overshoot, and finishes at the original full front view. A -7° camera adjustment settles to zero. Screen content fades in from 38–72%. Other layouts use 1.05 seconds, 48° opening and an 8px assembly gap. The camera has its own perspective and flat compositing so the masked base remains in front throughout the hinge movement.

A 44px accessible Replay button restarts only that laptop. It sits outside the case-study link. Reduced motion makes the device and screen immediately open/static and removes Replay. Phone device bottom offset is 17%, leaving clear space below the replay control. Every image, title and Explore action retains the actual CMS case-study route.

Dev-only `review_laptop=assembly` / `opening` query fixtures pause the real CSS keyframes at 12% / 32% for visual QA. They are injected solely by `vite.motion-preview.config.js`; production has no paused-state fixture. The normal preview remains animated.
