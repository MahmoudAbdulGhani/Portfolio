# Project artwork refinement — 2026-10-04

final result: passed

## Target and evidence

Source visual truth: `docs/motion/project-artwork/before-desktop.jpg`, the existing JobPilot carousel captured before this refinement. The intended differences are the user's explicit requests: larger imagery, no image borders, original project covers, and Projects | project name captions. This is a scoped revision of the existing approved palette and layout, not a literal clone of the defective source.

Rendered implementation: local read-only content preview `/#projects` in the cloud browser. `docs/motion/project-artwork/jobpilot-desktop.jpg` and `lobby-desktop.jpg` show portrait and landscape covers. Phone evidence: `projects-mobile.jpg` and `long-title-mobile.jpg`.

Desktop CSS viewport 1363 × 936, content client width 1353, devicePixelRatio 1. Source and final screenshot pixels are both 1353 × 929, with identical browser screenshot content cropping. No rescaling was used in the saved comparison. Projects starts at approximately 96px in both captures; the new section's smaller internal spacing is intentional. Phone CSS viewport 390 × 844; captures are cropped at 1:1 from the unscaled iframe screen. Tablet CSS viewport 1024 × 844, client width 1014 because of its scrollbar.

State: selected JobPilot AI, intro complete, selector focused to keep the slide stable, same published content snapshot and dark palette. No CMS mutations.

Full-view comparison: `docs/motion/project-artwork/comparison-desktop.jpg` combines source and implementation in one image. Focused caption comparison: `comparison-caption.jpg` uses actual caption crops from both states at equal scale; the caption moves down because the artwork stage is taller.

## Findings and comparison history

- Resolved P1: the original slide substituted an interior resume interface for the saved JobPilot promotional cover. Source screenshot and full-view comparison show the substitution. Removed automatic portrait-to-gallery replacement; the cover now remains visible, with the saved screenshot reserved for a failed image load.
- Resolved P1: small imagery in a padded bordered canvas weakened the project presentation. The final desktop stage is 1204 × 562 instead of approximately 1109 × 420. Mobile stage is 350 × 321 instead of approximately 327 × 204. Computed image wrapper border and padding are both 0px, background transparent. Existing contain fitting preserves the artwork's proportions.
- Resolved P2: first enlargement to 68svh pushed the caption below the desktop viewport. Reduced the stage to 60svh and tightened section and caption spacing. Final caption and controls are visible together; controls bottom is 921px within the 936px viewport.
- Resolved P2: adjacent-slide fragments looked like stray borders and cut-off captions. Moved the carousel inset from padding to margins, preserving the track width while clipping neighbors outside the visible window. Final full-view screenshot has no side fragments.
- Resolved P2: source caption omitted the requested collection context. Final focused comparison shows Projects | JobPilot AI, with a quiet collection label and larger project title. Mobile longest-title evidence confirms wrapping without overlap with the case-study arrow.

Final combined comparisons were opened and reviewed after these fixes. No actionable P0/P1/P2 findings remain in the scoped change.

## Required fidelity surfaces

- Fonts/typography: existing Inter retained. Desktop project title is 34px / 37px at this viewport, weight 400; collection label 11px with existing muted foreground. Mobile title 22px / 26px, collection 9px. Long Construction title wraps into three lines and clears the separate link. No truncation. Reduced title size balances the added collection context and keeps controls visible.
- Spacing/layout: 5.5% desktop and 4% phone outer margins. Equal-height contain-fit stages preserve images; 18px caption offset and reduced minimum caption height preserve the hierarchy. All selectors and arrows remain visible in the captured mobile and desktop states. Tablet stage 902 × 506. Mobile and tablet document overflow both 0px.
- Colors/tokens: navy #05090f, off-white #f5f6f6, amber #ffb20b and blue #62b1ff remain in the existing design. Muted caption color uses the existing #9eafc5 value. Image canvas is transparent; no new palette tokens, color changes or CMS asset recoloring.
- Image quality/assets: original saved covers used for all projects. JobPilot's original 1254px square promo remains complete and sharp at a 562px display size. Lobby's landscape cover fills most of the 1204px stage without distortion. No generated assets, substitute drawings, fabricated interfaces or new image text. Small detail text within the supplied promotional artwork is part of that asset; it is not the page's sole source of project information.
- Copy/content: project names remain from saved data, including JobPilot AI capitalization. Only the requested Projects collection label is added. No fabricated marketing copy, professional claims or backend content edits.

## Interaction and build verification

- All covers render; desktop and phone show the original JobPilot cover.
- Selector click updates artwork, caption and pressed state.
- Keyboard End selects UniHub; ArrowRight wraps from last to first.
- After focus leaves the carousel and pointer moves outside it, automatic advance from JobPilot to Lobby is observed.
- Phone native horizontal drag advances Construction to UniHub, preserving the route and suppressing accidental case-study navigation.
- Case-study image and caption-arrow hrefs remain tied to each original project slug. Existing intro, spring transitions and reduced-motion behavior remain in place; no new motion dependency or pause button.
- Application console errors checked on desktop and phone: none from terminal.local. Browser-extension metadata errors are outside the application.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` pass after the final CSS fix.

## Implementation checklist

- [x] Restore original cover precedence and retain failed-load fallback.
- [x] Enlarge desktop and phone image stages; remove borders, padding, backgrounds and thumbnail boxes.
- [x] Restore Projects | project name captions and check the longest title.
- [x] Remove neighboring slide fragments and recapture final comparison.
- [x] Check autoplay, keyboard wrap, swipe, responsive overflow and console.

## Follow-up polish

P3: dedicated landscape covers designed consistently around each project's real interface could give the set a stronger shared identity. This scoped fix uses the user's existing covers and does not create new artwork or imply that each supplied screenshot is a designed promotional cover.

Residual test gaps: this iteration does not repeat backend, contact submission, AI inference, admin, or unrelated section tests. Prior section QA is archived at `docs/motion/cinematic-sections/design-qa-2026-10-04.md`.
