# Public portfolio pages — creative, UX and motion specification

Date: 4 October 2026. Status: implemented in the draft frontend branch; validation and deviations are recorded in root design-qa.md. The following is the original design specification. This expands the earlier remaining-pages outline. The selected Projects studio grid remains the visual foundation.

Three independent visual concepts were shown in this planning pass: Studio Case Study (JobPilot as the template example), Conversation Desk (Contact) and Evidence Workbench (AI Job Match). They share the proposed global header. Generated display copy and interface renderings are illustrative; implementation must retain verified source screenshots and put approved new editorial text in the existing CMS. The written specification governs phone layouts, errors, reports and deeper content not visible in the concept frames.

## 1. Creative direction

One portfolio, different evidence stories. Use the existing navy #05090f, off-white #f5f6f6, supporting text #b4c0ce, blue #62b1ff and amber #ffb20b. Keep Inter for interface/body and Instrument Serif italic for short display accents. Product brand colors stay inside actual screenshots; avoid turning Cedar's entire page green or GameZone's entire page purple.

Desktop content: max 1400px outer canvas, 1200px for forms/reports, narrative measure 60–68ch, 48–72px horizontal gutters. Phone: 20px text gutters and full-width contain-fitted artwork. Heading 56–72px desktop / 36–44px phone, body 16px/1.65, metadata 12–13px. Use a 4/8px spacing rhythm and 80–112px between major desktop chapters; 48–64px on phones. Display accent is optional when the full project title is already long.

Use open space, editorial alignment and fine separators. Reuse the real studio device/backdrop sparingly for the hero. Detailed product evidence is displayed flat and readable, rather than placed inside another tiny tilted device. No invented scores, performance numbers, customer counts or product interfaces. Proposed visual concepts are art direction, not verified functional screens.

Observed current issues: case-study promotional cover occupies nearly the whole first viewport before the title; Contact and AI use the old cream shell; the header has separate branches and inconsistent labels, routes, utility controls and mobile ordering. Contact also has conflicting response-time copy.

## 2. One shared navigation

Full behavior specification: [shared-navigation-spec.md](shared-navigation-spec.md).

| Position | Label/action | Destination | Present on |
|---|---|---|---|
| Brand | Original MA + CMS short name | `/` | Every public page |
| Primary 1 | Home | `/` | Every public page |
| Primary 2 | About | `/#about` | Every public page |
| Primary 3 | Projects | `/projects` | Every public page |
| Primary 4 | AI Job Match | `/job-match` | Every public page when CMS-visible |
| Primary 5 | Contact | `/contact` | Every public page |
| Utility | Search / quick commands | Existing palette | Every public page |
| Utility | Theme control | Existing preference; both themes fully mapped | Same position on every public page |
| Utility CTA | Download CV | Existing public CV endpoint | Every public page |

Use the same order, labels, identity and utilities on desktop and phone. Keep Contact as the single global destination, rather than changing its meaning to a landing anchor. Landing section jumps can remain local within the landing. Projects stays active on every `/projects/:slug` page. Page-specific breadcrumb and table of contents live below the header, not among global links. Portfolio AI stays in its existing contextual launcher.

## 3. Shared case-study structure

First viewport: breadcrumb → project title → actual purpose/tagline → compact current CMS role/team/date/category where present → Live demo / Source actions → first product visual. Keep the title and at least one useful action visible before scrolling at 1440×1024 and 390×844. The product visual may continue below the fold.

Reading sequence: Overview → Problem and Solution → product workflow/features → technical stack → contribution and team → engineering evidence where supplied → full-size screenshot gallery → next project / archive / contact. For technically richer projects, engineering evidence can follow ownership before the gallery. Do not manufacture empty Architecture or Benchmarks sections for projects lacking that content.

Use one responsive template and project-specific chapter emphasis. Preserve the CMS full title, section content, order/visibility rules and real destinations; layout does not grant permission to rewrite claims. Feature group labels below are proposed editorial organization, not new product capabilities. Any new captions/headlines should be approved and stored in the CMS content source, not duplicated as hardcoded biography text.

Desktop: narrow reading column with a quiet chapter rail after the intro; screenshots use the wider canvas. Chapter rail can stick below the header, never overlap it. Phone: simple optional chapter jump control in normal flow, one column, no fixed reading rail. Keep all paragraphs available and open architecture tabs keyboard accessible. Full-size image dialog retains Escape, arrows, focus trapping and return focus.

## 4. Each project page

### JobPilot AI — reviewed career workflow

Lead with the actual resume/workspace screen already used in the archive, rather than the illustrative promotional poster. Introduce the genuine CMS tagline and role before the image. Follow with the connected candidate journey: reviewed resume/profile → discovered/saved job → fit evidence → approved application documents → interview preparation. Use verified gallery screens to illustrate only stages they actually show. Keep remaining ten CMS features visible under clear small groups.

The strongest engineering chapter is user control and reliability: preserve all eight CMS architecture layers and five existing implementation improvements. Render improvements as readable Before / After pairs with separators, not animated code pretending to be actual patches. Keep ownership and AI-assisted development wording accurate. Present aggregate views as views only; benchmark array is empty, so add no test count or speed claim from old conversation memory.

Object direction: one large physical studio device, with a secondary real document only when publicly available and relevant. At most two visual planes, modest depth. On phones flatten the supporting plane into normal flow. Motion: device 14px upward reveal, supporting plane 8px, optional scroll displacement capped at 12px; no continuous floating over prose. Existing product interface itself remains static pixels.

### Lobby — two communication modes

Hero uses the actual room screenshot. The narrative compares persistent communities and temporary guest rooms, preserving CMS claims and the actual Angular 22, NestJS 11, Supabase and LiveKit stack. Below it, place community chat and guest access screenshots in a balanced pair; friends, audio room and share-room evidence form the remaining gallery. Use static descriptive labels, not a fake live chat demo.

Contribution section names the team-project role accurately. No invented socket protocol, usage metric, team size or architecture paragraph. Object direction: two real screen planes suggest the two modes. Motion: one-shot 12px reveal staggered 80ms; a small decorative audio stroke may animate only during the initial reveal and must not imply a live connection. No perpetual waveform.

### GameZone Arena — booking and administration

Hero uses the actual arena landing/dashboard. Structure the core journey with existing evidence: choose room → date/time → device → confirm/pay. Present steps as an accessible screenshot sequence with Previous/Next, clear step name and full-size control; no autoplay. The next chapter separates the actual admin overview, rooms and users screens from the customer flow.

Emphasize conflict detection, OTP/JWT and Stripe/cash handling using current CMS text. Retain three-person team and actual personal contribution. The screenshots are case-study evidence, not clickable booking/payment widgets. Object direction: one screen at a time with a quiet amber step marker. Motion: 180ms opacity between selected screens, small directional slide only if reduced motion is off; selection never changes the page's reading position unexpectedly.

### Construction Project Management & Accounting System — Cedar operations

Preserve the full CMS title; use Cedar only as the verified brand context, not a replacement title. Use the actual overview screenshot as hero and the saved project detail as supporting evidence. Group the existing feature list into operations, procurement/inventory, financial control, reporting/access. Keep every original feature discoverable; grouping must not remove capabilities.

Lead the engineering chapter with the existing ten CMS architecture layers, then the five production improvements. Use the current four-person team and contribution. Explain the connection of projects, purchasing and accounting without asserting new transaction guarantees. Dashboard money values are screenshot/demo content, never portfolio business results. Object direction: broad dashboard and narrower project detail aligned to the same baseline. Motion: divider draws once over 500ms; evidence pair reveals 80ms apart; preserve native scrolling, no staged six-step pinning.

### UniHub — roles with a specific contribution

Lead with the actual student courses screen because the recorded role is Student Portal Contributor. Present the project-wide roles using real user/admin images and CMS descriptions; distinguish the user's contribution from the whole team platform. Preserve enrollment, assignments, attendance, grades and announcements claims from the CMS.

Use an editorial role comparison or tabs only where a real corresponding screen exists. No fabricated professor screenshot. The transcript remains secondary evidence and needs a privacy check before large presentation if real student details are visible. Object direction: clean flat portal screens with compact role labels. Motion: 200ms role-panel crossfade; no moving grade counters, course tiles or fake classroom activity.

### Full-Stack User Management System — secure API and admin UI

Lead with the verified admin dashboard. Explain authentication, permission boundary, user CRUD/search/pagination, soft deletion and public statistics using existing CMS copy. The same dashboard is the only saved screenshot: show it once prominently with full-size inspection, rather than generating a gallery of invented screens.

Preserve seven actual architecture layers, JWT/Argon2/Pydantic/SQLAlchemy/Alembic and existing testing descriptions. Use conceptual architecture labels drawn from the CMS; do not invent endpoints, token lifetimes or test totals. Object direction: one readable dashboard and a restrained code-native architecture component. Motion: architecture selection changes detail over 160ms and keeps focus; connector emphasis is decorative and does not simulate a real request.

### Medicare Hub — clinic workflows without invented patient UI

There are no CMS screenshots. Use the verified original logo as a modest brand visual beside the title, leaving readable narrative space. Structure appointments, records/schedules, staff roles and emailed recovery using current CMS features. Retain PHP/MySQL/Bootstrap/PHPMailer context.

Do not create sample patients, doctor dashboards, privacy assurances, appointment outcomes or unsupported medical claims. The gallery section is omitted until verified screenshots are added. Role/team metadata remains absent where unset. Object direction: small identity artwork on a calm surface; no laptop with a fabricated clinic screen. Motion: simple 300ms opacity reveal, no clinical pulse or activity visualization.

### Home Services — visual implementation craft

Lead with the actual captured HomePro landing. Explain Figma-to-React implementation, reusable components and responsive/mobile-sidebar behavior. Use a desktop/phone comparison only after capturing both real views. A Figma-to-code comparison requires the actual original Figma reference; mark it as an asset dependency, do not reconstruct one from memory.

This is a concise frontend case study, so omit absent backend architecture and benchmarks. Object direction: wide desktop capture plus a narrow verified phone capture, unframed or with the existing physical device style. Motion: short staggered reveals; a comparison slider is optional only when both verified sources are available, with a keyboard-operable range input.

## 5. Contact — direct and welcoming

Use the existing heading “Start a real conversation” as the primary title, with its current CMS invitation. Desktop layout is approximately 42/58: direct contact and availability left, the form right. Email and phone remain primary; socials become compact rows separated by hairlines. One form surface, no individual card around every contact route. Keep AI Job Match secondary after the main contact path.

Form: Name / Email on one desktop row; Subject optional; Message; amber Send message action; existing email alternative. Phone uses single-column fields, 16px inputs, 44px controls and persistent labels. Preserve existing payload, validation, honeypot, loading disable state and success/failure handling. Keep typed values after failure. Prevent layout jumps by reserving error/status space near the submit action.

Proposed UX refinement for implementation: focus first invalid field after submit, associate each error with its field, announce pending/success/error, make success confirmation easy to find. The current success reset after eight seconds needs review: avoid making the user's confirmation disappear before it can be read. This is a proposed behavior change, not already delivered.

Use only the CMS-backed contact details. The current profile says “Usually within 24h” while form copy says “a couple of days.” Resolve once in the existing CMS before rollout. Do not silently choose a new response promise.

Object graphics: no large unrelated photo or decorative 3D object competing with the form. A faint blue studio light can relate to the portfolio, kept away from field boundaries. Motion: title 450ms, link rows 40ms stagger capped at 120ms, form 300ms opacity. Controls and error text remain stationary. Reduced motion is instant.

## 6. AI Job Match — evidence workbench

Purpose: help a recruiter compare a job description with this portfolio. This page is not the JobPilot product and must not use its product dashboard or offer to apply to jobs.

Desktop: left-aligned title and concise current purpose text, then a 5/7 input/report split. Idle report area is open explanatory text with strengths, project evidence and gaps; no sample result, empty fake score or decorative gauge. Give the input about 320px height, explicit label/help, current character counter and restrained Clear action. Primary button remains “Check My Fit” unless its CMS copy is explicitly revised.

Result: returned match level and overall explanation first; supported strengths, relevant experience, linked real projects, partial matches, gaps and recruiter summary in separated reading groups. Copy/export are clear utilities. Tailored-CV control appears only with the actual returned token. Keep realistic qualitative levels; no new percentage score. Separate unsupported requirements visibly without alarmist red for every gap.

Phone: input → button/status → report → export actions. Existing 80–8000-character validation, duplicate-submit guard, status stream, 70-second timeout, API contracts and PDF behavior remain. Ensure mobile submit/error state is reachable without a sticky overlay obscuring the textarea or on-screen keyboard. Preserve user text on error/retry.

States: empty, typing, validation error, analyzing, completed, provider/network error, timeout and CV generation/error. Loading shows actual status messages, no fabricated phase percentage. Report should announce once and offer a focusable heading without shifting focus during streaming. The floating assistant must not compete with Check My Fit or become a second primary action.

Object graphics: quiet evidence markers/icons, no fake robot or rotating brain. Motion: 180–220ms state opacity, short 40ms report-group stagger capped at 160ms, optional small blue loading indicator. Keep incoming answer prose stationary. Reduced motion uses a static status icon and instant final placement.

## 7. Motion and accessibility contract

| Element | Trigger | Duration / movement | Reduced motion |
|---|---|---|---|
| Shared header | Scroll beyond 8px | 180ms surface change; no position shift | Immediate surface |
| Main intro | First render | 450ms, 14px reveal; max 80ms stagger | Final position immediately |
| Hero screen | First view | 600–650ms, modest inset/depth; no UI warping | Flat final state |
| Reading chapter | 15% visible | 350–400ms, max 12px once | Fully visible |
| Image hover | Fine pointer only | 250ms, max 3px lift | No lift |
| Tabs / image selection | Explicit activation | 160–200ms crossfade | Instant swap |
| Dialog / mobile menu | Explicit activation | 180ms opacity, max 8px translation | Opacity or immediate |
| Report / form status | Actual response | 180–220ms; stable layout | Immediate |

No scroll hijacking, pinned reading, auto-advancing screenshots, perpetual decorative loops or animation of real values. Animate transform/opacity, avoid layout-heavy filters. Reserve image dimensions to avoid loading jumps. Use semantic headings, visible focus, 44px controls, readable contrast, lazy images below the hero, and meaningful alt text describing the actual displayed asset. Hidden or empty CMS sections do not create blank nav/chapter entries.

## 8. Build handoff and definition of done

Implement shared public header/token foundation first; then JobPilot and Cedar as long-content cases; then the six lighter projects; Contact; AI Job Match. Reuse project structure and metadata, with layout emphasis keyed to actual content rather than eight copied page components. Keep route slugs unchanged. Admin shell and approved CV PDF geometry are outside this redesign.

Verify desktop 1440×1024, tablet 1024, phone 390 and narrow 320. Test all global destinations, nested Projects active state, mobile menu close/Escape/focus, long titles, absent screenshots/optional fields, image failures, gallery dialog, keyboard architecture and next-project visibility. Validate Contact and AI states with fixtures, without sending live inbox/provider requests for visual QA. Review OS reduced-motion rendering, both theme paths, page metadata and performance; run typecheck/lint/build and relevant functional tests after implementation.

Asset dependencies: verified Medicare product screens, Home Services phone screenshot and original Figma reference, privacy-reviewed UniHub transcript if used prominently. Absence of these does not block the narrative-first pages. Proposed edits to headlines/group labels/response-time copy require updating the existing content source; no backend/schema/dependency change is implied by this plan.
