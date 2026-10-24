# Public portfolio wording review — 24 October 2026

Continues PR #48 (`d91555b296d21dec053c8667062fdd295c58b2d6`) on `refine/public-portfolio-wording`. The original untracked handoff is preserved. No CMS content write, merge, manual deployment, promotion or Contact submission.

## Review material

- [Offline before/after comparison](comparison.html) — download this directory to open the HTML locally; images have descriptive alternatives and direct links.
- [Download the offline comparison bundle](comparison.zip) — HTML, screenshots and review methods together.
- [Changed-file manifest](changed-files.txt).
- [Phone Job Match before](before-390-job-idle.jpg) / [after](after-390-job-idle.jpg), [report before](before-390-job-report.jpg) / [after](after-390-job-report.jpg).
- [Desktop Job Match before](before-1440-job-idle.jpg) / [after](after-1440-job-idle.jpg).
- [Phone Profile capabilities before](before-390-capabilities.jpg) / [after](after-390-capabilities.jpg).
- [Home Services desktop before](before-1440-home-services.jpg) / [after](after-1440-home-services.jpg), [Medicare phone before](before-390-medicare-hub.jpg) / [after](after-390-medicare-hub.jpg).
- Desktop scope comparisons for all eight case studies are in the HTML. [Browser methods/results](browser-review.json).
- [AI observations and explicit source/replay labels](real-ai.json), [PDF text/line geometry](pdf-review.json), [public standard CV](production-standard.pdf), [genuine initial tailored download](genuine-tailored.pdf).

## Wording decisions

| Before | After |
| --- | --- |
| An evidence-based comparison | How your role matches my experience |
| Supported strengths | Relevant strengths |
| Gaps or unverified requirements | Requirements to discuss |
| Related or partial evidence | Related experience |
| Supporting project evidence | Relevant projects |
| Project evidence / Team-project evidence | View project / View team project |
| Engineering evidence | Skills in practice |
| Source reviewed … revision … | Explore the project’s stack and implementation below. |
| Current end-to-end behavior remains unverified. | AI suggestions remain drafts until accepted; application documents require approval before export. |
| Personal ownership remains undocumented. | Describe the application and its scope without assigning unknown personal authorship. No new attribution was invented. |
| Completion/certification verification in summaries | Source-based relevant work and recorded roles/dates; qualification comparisons belong in Requirements to discuss. |
| AWS qualification question generating a completion claim | The portfolio lists AWS re/Start training (Jul 2025 – Oct 2025). An earned AWS vendor certification is not listed. |
| Completed learning programs … (legacy CMS section) | Courses, technical training and self-directed study. |

Preserved confirmed LIU graduation and Digital Hub completion, Angular self-directed status, dates, roles, project scope, contributions and named teams. Home Services explicitly remains a frontend demonstration without an operational booking/payment backend and credits the supplied Figma UI kit. Cedar retains demonstration values and Coming soon inventory valuation. UniHub retains student versus team portal attribution. Genuine financial audit features, student records and JobPilot’s user-review workflow are meaningful product information, not portfolio audit disclaimers; they were not globally deleted.

## Implementation

`case-study-public-copy.js` projects deliberate public descriptions over the eight repository-matched case studies. Original review limitations, source revisions, attribution and learning/employment statuses remain internal grounding data in `case-study-runtime.js` and the AI snapshot. Public copy and internal review constraints are tested separately.

Shared read-time section normalization replaces exact old CMS descriptions/SEO text every time public data is read, without overwriting future custom editorial text or changing the CMS. Existing education/training normalization still protects confirmed versus unknown completion and CV copy.

Both assistant transports and Job Match retain their grounding instructions plus a public-writing policy. The first genuine model sample still volunteered AWS completion and negative certification claims, and called the Ishtari role an internship in its recruiter summary. Prompt instructions alone were insufficient. Final report summaries now use server-owned skill/role/date prose; candidate CV summaries remain separately constructed. An explicit AWS requirement with the listed re/Start training gets the concise training/credential comparison under Requirements to discuss, not repeated in summaries. Related requirements such as Kubernetes remain intact. Future additional AWS qualification records prevent the re/Start-only rule from assuming the credential is absent.

Direct questions about a uniquely identified listed qualification use short source-based answers, distinguishing unknown completion/certification from a negative claim that it was never earned. Specific design-origin questions retain the supplied kit link and say the creator is not listed, without internal-record boilerplate. Ambiguous questions continue through the grounded assistant. AI-generated strengths and other freeform details remain subject to the grounding policy; these tests are not a guarantee of every future model response.

## Actual validation

- Typecheck, lint, normal production build and portrait production inclusion/review exclusion guard passed. No CSS, image/media/controller, sculpture, stream decoder, retry lifecycle, CV generator/geometry or provider configuration changed.
- 58 integrity/API cases, 14 landscape/provider cases and 20 motion/boundary cases passed locally. Regressions include public projections, stale CMS reloads, confirmed/unknown qualifications, direct JSON/SSE answers, supplied-design credit, preserved teams, source summaries, employment/date granularity and the unchanged retry/cancellation/rate-limit protections.
- 52 compiled desktop-Chrome browser cases passed with retries disabled: public copy across Collection, Projects, all eight readers and all Profile tabs at 320/390/430/768/1440; Job Match labels, report export and CV failure/retry; keyboard controls, disclosures, existing assistant stream/deadline and prior retry regressions. No observed horizontal overflow. Existing media tests retain the same focus assertion with the new “Image description” accessible name.
- 36 before/after captures use compiled PR48 and current normal builds with the same freshly fetched public records. They are desktop Chrome viewport emulation, not physical-device tests. Report screenshots replay separate archived genuine model results; the after report uses the final source formatter on the initial genuine response. They are not a hosted provider run or controlled model A/B. Signed CV tokens are excluded from static comparison data.
- An initial local genuine Gemini match produced a real signed tailored PDF download. Subsequent final-path validation returned one formatting failure and two upstream 503s; no automatic/unlimited retries were added. A successful final-path genuine matcher result is **not** claimed. Ordinary recruiter-summary assistant samples are genuine provider responses; known qualification/design answers are separately labelled deterministic source responses, not model outputs. No production logs were available.
- The public production CV was fetched successfully (HTTP 200). Current public-snapshot standard application/master exports and the initial genuine tailored PDF were rendered to PNG and visually inspected. No targeted internal disclaimers in their text; candidate summary separate, canonical Ishtari dates/role and co-developed team descriptions retained.
- Standard generation with the identical public snapshot/default config was compared against a detached PR48 checkout: **identical line text and geometry in both CV modes**. The uncustomized application-default catalog selects too many skills: its skill rows overlap the education section and one row runs to x=609.32pt (outside its intended right margin). These existing issues also occur at PR48. They are absent from the actual public production PDF, whose configured selection fits (rightmost text x=571.70pt). This focused copy task does not change CV geometry/configuration or claim all default-catalog layouts are perfect. Master defaults span five A4 pages; the actual public application CV is one Letter page. The genuine initial tailored export is two Letter pages with full content/margins.
- Static CV generation, unchanged reference fixture/tolerances and zero/one/three/long-selection PDF overflow regressions passed.

One early browser run still expected the removed completion disclaimer; it was updated to assert confirmed Digital Hub completion and absence of the old disclaimer. Another local run overlapped a rebuild and encountered temporary HTTP navigation failures; a stable-build rerun passed all 52 without deadlines or assertion reductions. Concurrent tablet/phone tests then exposed that the new single test spanning every page could exhaust the unchanged 30-second budget. The same coverage/assertions now run as two four-case-study tests plus a Collection/Projects/Profile/Job Match test per width. The final split passed all 45 cases across desktop/tablet/phone configurations with retries disabled. No deadline or coverage reductions; final-head CI checks the same coverage.

The uncustomized master default also has overlapping long skill-label bullets; its line geometry likewise matches PR48. These default-configuration layout findings are documented rather than silently changed during this wording task. The actual public standard PDF and initial genuine tailored PDF do not have those overlaps.

Final-head CI and automatic Preview/access are recorded in the draft PR delivery comment after terminal results. No physical Android/iPhone testing or unrestricted hosted verification is claimed; Vercel protection remains unchanged.
