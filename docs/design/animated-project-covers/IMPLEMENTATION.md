# Animated project covers

Implemented in the existing landing page, on `feat/minimal-scroll-portfolio`. The original CMS hooks, featured/published filtering, ordering, case-study routing, and native full-resolution screenshot gallery remain in place.

## Presentation

The approved JobPilot poster provides the photographic art direction: warm ivory, forest green, daylight, foliage and oak. Its illustrative devices and fabricated interfaces are intentionally replaced by one prominent live frame containing the project's real CMS screenshots. Each cover uses an independent photographic environment with editable HTML typography and screen controls. No Canva dependency or new npm packages.

| Project | Setting | Real screen sequence |
|---|---|---|
| JobPilot AI | Ivory / green office | Jobs → resume → interview |
| Lobby | Charcoal / lavender communication studio | Community chat → audio room → screen sharing |
| GameZone Arena | Midnight / violet gaming lounge | Overview → rooms → booking |
| Cedar Construction | Ivory / green architectural studio | Platform overview → project overview → financial reports |
| UniHub | Cream / violet academic library | Student dashboard → courses → administration |

## Motion and controls

- Three screens per known project, with a 4.6-second segment (roughly 13.8 seconds for one complete sequence). Crossfades last 650ms. Tall screens hold briefly, pan gently, then hold before the next screen. Pan is capped at 65% of viewport height and never exceeds the actual overflow.
- Only the project occupying the greatest visible cover area runs. A native screenshot dialog suspends all previews. Offscreen projects and a hidden document suspend motion.
- Global Pause motion, per-project pause/play, previous/next and numbered screen controls. Manual selection pauses that project. Reduced-motion preference disables autoplay while keeping manual selection and inspection available.
- A next screen is preloaded when its project becomes active. During loading, the outgoing real screenshot remains visible. Failure states keep navigation available.
- ResizeObserver recalculates pan distance when the screen frame changes size.
- Mobile uses one large frame, numbered controls and a separate transport row with 44px targets. Tapping the frame opens the original image; Zoom in reveals its native pixels in a scrollable region.

## Source

- `CinematicProjectCover.tsx`: preview state, motion lifecycle, loading, controls.
- `project-cover-directions.ts`: copy, palettes and CMS screenshot indices.
- `project-covers.css`: responsive live-cover layers.
- `CinematicProjects.tsx`: integration, chapter navigation and visible-preview arbitration.
- `public/projects/covers/`: five optimized environment images, 313,584 bytes combined.

## Validation and release

`npm run lint`, `npm run typecheck`, `npm run build` passed. Browser evidence and the visual review are in project-root `design-qa.md`. The source update is intended for the existing Vercel deployment branch. Public-domain promotion is a separate release operation and must be verified against the live page; a successful branch build alone is not proof of production publication.
