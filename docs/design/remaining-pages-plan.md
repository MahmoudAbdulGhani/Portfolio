# Portfolio: remaining public pages

Expanded specification: [public-pages-design-spec.md](public-pages-design-spec.md) covers all eight project pages, Contact, AI Job Match, object composition, motion, responsive states and acceptance. [shared-navigation-spec.md](shared-navigation-spec.md) defines the same header content and behavior across every public route.

Status: design and motion plan, not implemented. Landing Scroll Chapters and Projects archive option 2 are implemented separately. [Visual overview](remaining-pages-plan.html).

## Shared direction

Extend navy #05090f, off-white #f5f6f6, supporting text #b4c0ce, amber #ffb20b and blue #62b1ff. Inter is the reading face; Instrument Serif italic is reserved for a short display line. Use open editorial space and fine separators; cards belong to forms and reports. Adopt the archive's simple public navigation, active indication, mobile menu, visible focus and 44px controls. Keep the original identity and portrait.

CMS stays authoritative for names, descriptions, visibility, order, technologies, case-study content and destinations. Use actual screenshots, with verified identity artwork or an unavailable state when screenshots do not exist. Do not invent interfaces, testimonials, client logos or metrics.

## Case studies: evidence-led editorial layout

Sequence: archive breadcrumb → actual project name/tagline → year/category/team/role → source/demo actions → wide product screenshot → overview/problem/solution → features/stack → ownership/team → gallery → existing engineering evidence → contact invitation.

Desktop: 1200–1400px outer canvas, reading width max 68ch. Intro metadata and actions can sit beside the title; keep title outside the image. Use a borderless hero image and a two-column gallery. Preserve every existing section, including JobPilot architecture tabs, improvements and real telemetry. Keep image dialogs and destinations; no animated fabricated counters.

Phone: intro, metadata, actions, image, narrative in one column. Wrap the complete long Cedar title. Contain-fit screenshots with full-size controls. Architecture keeps its accessible tablist and keyboard behavior with compact scrollable tabs.

Motion: heading/actions reveal 14px over 450ms once; modest hero-image inset opens over 650ms; narrative reveals 12px over 400ms at about 15% visibility. Native reading scroll, no pinning. Fine-pointer hover only. Dialog opacity 180ms. Reduced motion renders final positions and immediate interactions.

Acceptance: shortest/longest names, absent optional links and metadata, all screenshot loads, dialog Escape/focus return, architecture keyboard navigation and archive return at 320, 390, 1024 and desktop widths.

## AI Job Match: focused input and grounded report

Sequence: current CMS title/purpose → job-description input/help → streamed status → actual report → copy/export/tailored-CV actions. Desktop uses a 5/7 input/report split. Before analysis, explain evidence categories without displaying a fake score. After analysis, show returned match level, overall explanation, strengths, experience, linked projects, partial matches, gaps and recruiter summary. Keep honest gaps prominent.

Phone: input, submit/status, report, export actions in one column. Preserve the entered description after failure. Existing 80–8000 character validation, duplicate-submit guard, streamed API statuses, 70-second timeout, payloads, copy/export and token-gated tailored PDF remain unchanged.

Motion: 200ms state transitions, small blue loading indicator, report groups in a 40ms stagger capped at 160ms. Show real streamed statuses without percentage progress. Keep incoming prose stationary. Reduced motion uses static status and immediate report placement; status/errors remain announced without stealing focus.

Acceptance with controlled fixtures: invalid input, single submission, completion, provider error, timeout, retry, copy/export, project navigation, token/no-token CV states. A read-only frontend preview cannot prove live provider output.

## Portfolio assistant

Keep the existing grounded, project-aware panel. Apply navy surfaces, restrained blue status and amber send action. Preserve actual prompts, streaming, retry/stop behavior, 600-character input handling, keyboard send, links and focus. Phone launcher remains 44px; panel must fit the visual viewport with keyboard open. Opening uses 180ms opacity and 8px translation; streamed answers remain stationary. Reduced motion removes translation. Check open/close focus return and long-answer/composer overflow.

## Contact: clear invitation and direct routes

Desktop: editorial invitation, then two columns. Left contains existing availability, reasons to reach out and email/phone/socials. Right contains existing Name, Email, Subject and Message form in one quiet surface. AI tools follow the main contact choices.

Phone: invitation → primary links → form → secondary links/tools. Persistent labels, 16px fields, 44px controls, naturally resizable message. Preserve validation, field errors, honeypot, submit guard, payload and real success/failure states. Do not send visual-QA test messages to the live inbox.

Motion: heading 450ms, links staggered 40ms, form opacity 300ms; keep fields stable during validation. Reduced motion is immediate. Show the actual confirmation after success.

CMS content issue before rollout: profile copy promises roughly 24 hours while the form refers to a couple of days. Choose an accurate expectation and update the existing content source; do not introduce another frontend promise.

Acceptance: keyboard completion, invalid fields/error association, loading disable state, controlled success/failure, link destinations, phone keyboard viewport and contrast.

## CV, terminal and implementation order

Match the CV page shell to the public style while preserving the approved PDF layout, fixed typography and export logic. Keep download prominent. Terminal retains commands, history/output and functional character; change only shared navigation, focus and spacing. No input-delaying typewriter effect.

1. Case studies: establish reusable public typography/navigation from the completed archive.
2. Contact: align the conversion path and response-time content.
3. AI Job Match/assistant: style existing flows after verifying state fixtures.
4. CV/terminal shell and a complete public navigation pass.

Each implementation requires real-content browser captures, phone/desktop checks, keyboard/focus, image verification, reduced-motion checks, typecheck, lint and build. API flows use controlled fixtures before authorized live submissions. Backend, schema, CMS data and dependencies are outside the visual plan. Keep the current PR as a draft; merging/deploying is separate.
