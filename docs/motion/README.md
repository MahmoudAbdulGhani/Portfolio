# Portrait-led portfolio

The landing page uses the original portrait and published CMS content in the selected navy, off-white, blue and amber palette. Availability appears once; Discovery / Build / Ship is removed.

The desktop hero places Full-Stack left of the photograph and Software Engineer right. Opposing text reveals and a center-out photo opening lead into a scroll expansion after the copy clears. Mobile uses a vertical reading order with actions before the photo. Compact colored stack chips travel in opposite directions. Featured projects use a spring carousel with drag, numbered controls and keyboard navigation. Career retains a progressive timeline; Education, Training, Contact and the existing AI entry points remain accessible. The visible pause button is removed; device reduced-motion preferences remain supported.

All professional content uses existing CMS hooks. Case studies, CV download, admin, contact validation and AI features remain in the application. No new animation dependencies were needed for this refinement.

## Run

Use existing environment configuration, then `npm ci` and `npm run dev`. The full-stack workflow remains available through `npm run dev:full`.

For read-only visual review without a database, run `npm run preview:content`, then `npm run dev:motion -- --host 0.0.0.0 --port 4173 --strictPort`. This fetches public CMS content into an ignored snapshot and blocks writes. `/__motion-review` shows a 390px frame; `/__motion-review?tablet` shows a 1024px frame.

## Validation

`npm run typecheck`, `npm run lint`, `npm run build`, and scoped browser checks passed. The current report is project-root `design-qa.md`. Latest source, responsive captures, comparisons, motion plan and 10-second browser-frame video are in `docs/motion/interactive-refinement`. Earlier evidence is historical and does not imply that every former interaction was retested.

The update remains in the existing draft pull request for review.
