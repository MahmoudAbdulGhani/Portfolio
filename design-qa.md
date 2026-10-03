# Minimal scroll portfolio QA

final result: passed

## Source and revised scope

Source visual truth: `/workspace/scratch/c039daad40c5/generated_images/exec-9d3ab460-b182-4b97-9e1b-004e25193b01.png` (760 × 2070; repository copy: `docs/motion/clean/source-direction.jpg`). This is the previously selected dark / paper / gold direction. The user subsequently rejected clutter and static mockup motion. The revised brief intentionally moves the real portrait to the hero, removes staged device scenes and decorative objects, and gives all landing sections space and real scroll behavior. This is a scoped redesign, not a pixel clone of the original board.

Implementation: cloud-browser rendering of the real React application at `/`, public CMS snapshot, standard motion enabled. Desktop CSS viewport 1363 × 936; native screenshot pixels 1353 × 929. Native capture excludes scrollbar/edge pixels. Evidence is normalized proportionally for combined comparisons; no pixel-diff precision is claimed. Mobile iframe CSS width 390 (380 content pixels); tablet iframe CSS width 1024 (1014 content pixels), height 844.

## Combined visual evidence

Full-view comparison: `docs/motion/clean/full-comparison.jpg`, showing the source and eight actual rendered sections together.
Focused comparisons: `docs/motion/clean/hero-comparison.jpg` and `docs/motion/clean/workflow-comparison.jpg`. Larger captures: `docs/motion/clean/hero.jpg`, `portrait-expanded.jpg`, `about.jpg`, `skills.jpg`, `workflow.jpg`, `projects.jpg`, `experience.jpg`, `education.jpg`, `contact.jpg`, `mobile.jpg`, `tablet.jpg`.

These files are local browser evidence from this review session. The final MP4 is the separate user-facing artifact. The source board and each current section were visibly inspected in the same comparison input. The focused views permit checking typography, portrait cropping, and the completed interface reveal; the collage provides the overall rhythm and content hierarchy.

## Findings and iteration history

- [P1, resolved] Opening hero copy remained over the expanded portrait. Earlier captures showed the title and a second identity statement simultaneously. Replaced the conflicting animated opacity/clip styles with phase-controlled CSS opacity, inert hidden content, and scroll translation. Post-fix evidence: `portrait-expanded.jpg` and recorded hero sequence. Only the closing identity statement appears over the expanded portrait.
- [P2, resolved] Fourteen skill categories created a dense block. Show three primary groups and put remaining real CMS skills in an accessible disclosure. Post-fix evidence: `skills.jpg`; every remaining skill name is still present in the disclosure.
- [P2, resolved] Project control scroll targets overshot the slide alignment. Removed the extra header offset from target calculations. Final Lobby selection aligns the image to the 7% page gutter at scrollY 6751.
- [P1, resolved] Workflow stage changes reset the accelerated image mask/filter. Moved those image styles to values computed from the same measured progress used by the stage selection. Recaptured the workflow sequence. Post-fix evidence: `workflow.jpg`, `workflow-comparison.jpg`; final image has zero inset, grayscale(0), scale(1).
- [P2, resolved] Career items had a wrapper between the ordered list and its list items. Replaced wrappers with animated list items; disclosure content remains functional.

No actionable P0/P1/P2 findings remain within the revised scope. Changes to imagery, sequence, and composition are intentional responses to the user's feedback.

## Required fidelity surfaces

- Typography: real Space Grotesk display headings, Plus Jakarta Sans body, and JetBrains Mono labels. The source has a condensed, heavier editorial display; the implementation intentionally uses the existing application fonts at lighter weights for a calmer composition. Hero wraps in three clear lines, with one H1. Mobile heading and form labels are readable without overflow.
- Spacing/layout: 86% content width, generous section gaps, flat surfaces, a single main image per chapter. Desktop pinned scenes remain inside their sections. Mobile has no pinned scenes, and project panels stack vertically. Desktop, mobile, and tablet have zero horizontal overflow.
- Colors/tokens: charcoal #151817, paper #eeeae2, gold #d6b57b. Light-section hover/focus uses darker #766241 to retain contrast. Dark controls and labels remain legible. Broad alternating backgrounds preserve the chosen direction with fewer competing accents.
- Image quality: the original CMS portrait is used without generated cutouts, AI restyling, halos, or props. Scroll cropping keeps the face visible. JobPilot AI, Lobby, and GameZone Arena use actual existing cover assets; all load when their gallery panels are viewed. Contain preserves interface content without fabricated UI.
- Copy/content: actual profile, experience, degree, certifications, skills, and project records from existing public hooks. No invented professional claims or replacement projects. Long descriptions use disclosures. Original contact handling remains intact.

## Browser checks

Verified portrait expansion and cleared opening text; opposing skill movement; Discovery/Build/Ship controls and final image reveal; Lobby selection; horizontal project movement; project case-study navigation and back; motion pause/resume with unchanged 12239px document height; career contribution disclosure; certification disclosure; contact required-field errors without sending a message; responsive flow and overflow; image loading. Console error inspection found no application errors; browser-extension metadata errors were unrelated.

Code checks: typecheck, lint, production build, and git diff whitespace check passed. No server, authentication, CV generation, database, or production content changes were needed.

## Limits and follow-up

The review preview intentionally blocks writes. Actual message delivery, authenticated admin behavior, and AI provider calls were not exercised. OS-level reduced-motion preference was inspected in code but not toggled in this browser. Mobile/tablet review used responsive frames, not physical devices. The video edits pacing of captured browser frames; it does not measure native frame rate. Verify real-device performance and normal production integrations before merging/deploying.

Implementation checklist: resolved issues above, responsive checks complete, motion evidence recorded, draft review ready.
