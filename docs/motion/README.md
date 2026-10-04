# Portrait-led portfolio

The landing page uses the original portrait and published CMS content in the selected navy, off-white, blue and amber palette. Availability appears once; Discovery / Build / Ship is removed.

The desktop hero places Full-Stack left of the photograph and Software Engineer right. Opposing text reveals and a center-out photo opening lead into a scroll expansion after the copy clears. Mobile uses a vertical reading order with actions before the photo. Compact colored stack chips travel in opposite directions.

Projects start with five real medium thumbnails, then reveal a spring carousel that advances every 5.5 seconds and wraps infinitely. Drag, numbered controls, arrows and keyboard navigation remain available. Equal image frames contain the original artwork; landscape CMS screenshots replace portrait promotional covers where available. Technical architecture is a category explorer with six families, retaining all original category labels and skill names. Education reveals the credential horizontally while dates remain fixed. Training draws dividers and opens measured-height disclosures. Contact reveals its heading once while links and AI tools remain fixed. Desktop navigation includes AI Job Match. The visible pause button remains removed; device reduced-motion preferences remain supported.

All professional content uses existing CMS hooks. Case studies, CV download, admin, contact validation and AI features remain in the application. No new animation dependencies were needed for this refinement.

## Run

Use existing environment configuration, then `npm ci` and `npm run dev`. The full-stack workflow remains available through `npm run dev:full`.

For read-only visual review without a database, run `npm run preview:content`, then `npm run dev:motion -- --host 0.0.0.0 --port 4173 --strictPort`. This fetches public CMS content into an ignored snapshot and blocks writes. `/__motion-review` shows a 390px frame; `/__motion-review?tablet` shows a 1024px frame.

## Validation

`npm run typecheck`, `npm run lint`, `npm run build`, and scoped browser checks passed. The current report is project-root `design-qa.md`. Latest source, responsive captures, comparisons and a 26-second browser-frame video are in `docs/motion/cinematic-sections`. Section choreography is recorded in `docs/motion/interactive-refinement/motion-plan.md`. Earlier evidence is historical and does not imply that every former interaction was retested. The latest changes affect frontend components and documentation only; no backend, CMS content, palette or dependency changes were made.

The update remains in the existing draft pull request for review.
