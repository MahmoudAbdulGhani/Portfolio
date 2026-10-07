# Cinematic work gallery — first production integration

Historical review of commit `47f9648`. The latest user-requested screenshot clarity changes are documented in [CLARITY_REVISION_QA.md](CLARITY_REVISION_QA.md).

Reviewed 5 October 2026. Target: the Home landing page on `feat/minimal-scroll-portfolio`, based on production commit `738973bf9c5554665f65553d3d8fa7a5662b7f4a`.

## Review of the deployed experience

The current-run screenshots in this folder capture the actual production page before the change.

| Step | Observed health | Finding and response |
| --- | --- | --- |
| Landing entry | Good | The midnight palette, gold accents, Inter / Instrument Serif typography, header and existing section rhythm establish a cohesive identity. Reused these styles for the gallery. Evidence: `production-01-hero.png`. |
| Projects entry | Needs improvement | The large project opening and long laptop choreography delay useful product content. Replaced this with a clear Selected work heading, compact actions and a layered JobPilot opening. Evidence: `production-02-projects.png`. |
| Product inspection | Needs improvement | Repeated closed laptop scenes obscure the interfaces and make the work feel repetitive. Real screenshots now lead five distinct compositions, with a full screenshot viewer and direct case-study links. Evidence: `production-03-laptop.png`. |

## Implementation

`Home` renders `CinematicLanding`; its `WorkSequence` now renders `CinematicProjects`. This changes the Projects section inside the production landing page.

- Preserves `useProjects`, CMS visibility, featured/published filters, ordering, loading/error/retry states and section CTA overrides. The browser review used a fresh read-only snapshot of production public API data through the repository's existing motion-preview tooling. Production continues to use the existing live API hooks.
- Uses existing real screenshot arrays and covers, not generated project interfaces. JobPilot has a layered opening, Lobby and GameZone have staggered adjacent scenes, Cedar has a panorama, and UniHub closes with a reversed composition. Unknown featured projects receive a fallback layout. Missing/failed images have explicit fallback text.
- Reuses the existing navy atmosphere asset, Inter, Instrument Serif, production gold and landing gutters. No dependency, lockfile or server changes.
- Replaces the Home laptop renderer import path with a lightweight 2D GSAP sequence. Hero panels settle with scroll; subsequent scenes reveal once. Fine-pointer drift is bounded, mobile motion is shorter, and hover zoom is subtle.
- Pause persists locally and removes transforms, tweens and pointer listeners. The OS reduced-motion media query disables gallery animation and animated scrolling.
- Screenshot viewer uses native modal dialog behavior, body scroll locking, thumbnails, wrapping arrow-key navigation, Escape and focus restoration. Screenshots use contain sizing in the viewer for full inspection.
- Chapter navigation tracks the active scene and progress, focuses the chosen article and sits 16 px below the production fixed header. It is hidden on narrower screens where it would crowd the page.
- Fixes direct hash navigation: `/#projects` waits for the CMS section to mount and fonts to settle before scrolling; observers and animation frames are cleaned up on route changes.

## Design QA

Reference: the approved cinematic gallery preview, retained as `approved-gallery.png`. `approved-vs-production.jpg` compares both content regions after removing their different headers and normalizing their presentation size. Matching composition and screenshot selection were retained; the production typefaces, 88% container, header and blue atmosphere are deliberate adaptations to the actual landing page.

| Surface | Rendered evidence | Result |
| --- | --- | --- |
| Selected work / JobPilot opening | `integrated-final-opener.png` | Clear heading gap, readable title/actions, three real screenshot layers. Fixed the rear panel's motion path and left position so it no longer intersects the JobPilot title. |
| Lobby / GameZone | `integrated-middle.png` | Distinct scene scale, clear captions and actions, active chapter dock below the header. |
| Cedar panorama | `integrated-cedar.png` | Large interface readable beside the caption; neighboring projects remain visually separated. |
| UniHub and collection ending | `integrated-end.png` | Reversed scene, clear final project and section footer. |
| Screenshot viewer | `integrated-mobile-gallery.png` | Centered modal on a 320 px review viewport. Fixed Tailwind's dialog margin reset with an explicit auto margin. Full image, thumbnails, close and navigation controls fit. |
| Phone overview | `integrated-phone.png` | Stacked composition, clear heading gap and 44 px action targets. |
| Tablet overview | `integrated-tablet.png` | Rear panel clears the title; production type and gutters remain consistent. |

Resolved implementation defects: heading/screenshot overlap, rear-panel/title collision during entry, mobile modal alignment, chapter/header collision, and asynchronous section-link navigation. No known blocking or major gallery defects remain in the reviewed surfaces.

### Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed.
- Full production landing reviewed in cloud Chrome at desktop width, 1024 px tablet and 320 / 390 px phone frames. The document widths matched their client widths at each narrow size; no horizontal overflow.
- All ten presentation images loaded successfully. Viewer screenshots and thumbnails were inspected with the actual project data.
- JobPilot viewer: arrow navigation advanced, Escape closed, focus returned to the invoking “4 screens” button and body scrolling was restored.
- Phone viewer: thumbnail four selected; Right wrapped four to one; Escape closed.
- Chapter links: GameZone and UniHub became active and received article focus. Header bottom was 76 px; chapter dock top was 92 px.
- Pause cleared transforms on all ten presentation panels; resume worked. Reduced-motion behavior was verified in the source, not through OS preference emulation.
- Direct `/#projects` reload reached the mounted gallery. UniHub Explore project opened `/projects/unihub` and rendered the real case study.

This is browser and build verification, not a physical-device performance benchmark or an exhaustive accessibility audit. The change is limited to the landing gallery and shared hash navigation; backend, CMS writes, project-detail layout and CV geometry are unchanged.
