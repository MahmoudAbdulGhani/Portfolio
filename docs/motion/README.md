# Minimal scroll portfolio

The landing page gives each section one clear focal point: the original portrait, personal story, traveling skills, Discovery / Build / Ship workflow, selected projects, experience, education, and contact. Dark charcoal, warm paper, and restrained gold replace decorative cards and floating objects.

Desktop scrolling expands the real portrait, moves the skill rows in opposite directions, progressively reveals a real project interface, and moves between three featured projects. Work history reveals along a growing timeline. Mobile flows vertically. The motion control disables movement without changing desktop section heights. Reduced-motion preferences use the simpler layout.

All professional content comes from existing CMS hooks. Project pages, CV download, admin features, contact validation, and AI features remain in the application. No animation dependencies or generated assets were added.

## Run

Use existing environment configuration, then `npm ci` and `npm run dev`. The full-stack workflow remains available through `npm run dev:full`.

For read-only visual review without a database, run `npm run preview:content`, then `npm run dev:motion -- --host 0.0.0.0 --port 4173 --strictPort`. This fetches public CMS content into an ignored snapshot and blocks writes. It does not change production CMS behavior. `/__motion-review` shows a 390px frame; `/__motion-review/tablet` shows a 1024px frame.

## Validation

`npm run typecheck`, `npm run lint`, `npm run build`, and browser checks pass. See project-root `design-qa.md` for visual iterations, interaction checks, and remaining test limits. The accompanying MP4 is captured from the running frontend, with edited pacing of captured browser frames; it is not a device-performance benchmark.

Production deployment is not included in this draft review.
