# Phase 1 CI closeout — 9 October 2026

The clean GitHub runner exposed a setup gap that the already-generated development clients did not: after `npm ci --prefix server`, that server dependency tree's `@prisma/client` was not generated. [CI #61](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37935070974) failed at the JavaScript-only API startup test with `@prisma/client did not initialize yet`, and subsequent integrity/browser steps were skipped.

Commit `6909ea3` adds **Generate server Prisma client** immediately after the server dependency install in `.github/workflows/ci.yml`, using exactly `npm run db:generate --prefix server`. It generates client code from the existing schema; no migration, database update, schema change or application behavior change is involved.

[Complete GitHub CI #62](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37936287529) passed on `6909ea3cac0ab6875483d7c4c698b95759c3bd2b`, with a clean Ubuntu runner and Node 22.23.3. Both dependency installs, explicit server Prisma generation (6.19.3), typecheck, lint, build, JavaScript-only API startup, all **9** integrity tests, browser dependency installation and the full **159-test** desktop/tablet/mobile Playwright suite passed. No tests were skipped, failed or reported flaky. The workflow completed at `2026-10-09T13:25:26Z`; browser execution took 2.7 minutes. [Machine-readable run and step evidence](docs/design/phase1-followup/ci-run.json) records the tested SHA and GitHub run/job IDs. Local generation, typecheck, lint, build, API startup, integrity tests and diff check also passed before pushing. The existing large motion-chunk and Prisma package-configuration deprecation warnings remain.

The documentation commit's full run [CI #63](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/37936997616) subsequently passed generation and backend checks but exposed an intermittent tablet motion assertion: the delayed-image test remained in `opening` beyond its five-second settled-state deadline (158 browser tests passed, one failed including its two configured retries). Three repeated local tablet runs passed unchanged. Concurrent renderer contention on the hosted runner is a plausible cause, not a demonstrated application defect. CI now runs Playwright with **one worker**, removing concurrent renderer load without changing any test, real renderer coverage, application timing or assertion timeout. The focused test also passed on all three local viewport projects with one worker. A fresh complete workflow verifies this configuration; its final result is recorded in [PR #12's CI closeout entry](https://github.com/MahmoudAbdulGhani/Portfolio/pull/12). The prior green #62 result remains recorded with its exact SHA and does not certify later commits.

Case-study storytelling and engineering evidence are the next Phase 2 scope; no Phase 2 implementation is included here. PR #12 remains draft, and the existing no-merge/no-manual-deployment boundary is retained. The user's untracked handoff file is untouched.

---

# Phase 1 follow-up: learning evidence and Capabilities — 9 October 2026

Branch `refine/phase-1-evidence-capabilities` starts from `1d5a04e`, the latest Phase 1 runtime repair. Checked the branch, tree, ancestry and refreshed remote refs first: there were no newer tracked changes or commits. The user's untracked `Codex_Engineered_Landscape_Handoff.md` remains untouched. This draft follows PR #11 as its base; no merge or manual deployment is part of this follow-up.

[Recorded checks](docs/design/phase1-followup/checks.json) · [Browser findings](docs/design/phase1-followup/browser-findings.json) · [Real provider answers](docs/design/phase1-followup/provider-answers.json).

## Cause and context trace

The supplied production answer asserted that the snapshot documented AWS bootcamp completion. Phase 1 removed the stale expected-2026 clause and retained July–October 2025, but returned no explicit completion evidence status. The generic assistant instruction prohibited inventions without explaining that past training dates cannot establish completion. Digital Hub's legacy contradictory Completed/Completing prose was already neutralized, but likewise lacked an explicit evidence limit. Removing misleading prose alone left the model room to infer a completed bootcamp from past dates and the AWS issuer.

The path is `src/components/landscape/Assistant.tsx` → POST `/api/assistant` → `getPortfolioContextWithRetry` / `getPortfolioContext` → Prisma selections → shared normalization → Gemini system instruction and serialized snapshot. Both JSON and SSE paths now use the same evidence policy. The record schema lists dates/prose and optional credential metadata; it contains no independent completion or certification verification evidence. Read-time `learningEvidence` therefore explicitly marks those statuses **unverified**, separates listed participation/dates from self-reported completion prose and credential metadata, and states that past dates do not establish completion or graduation. Degree names, issuer names, IDs and course URLs cannot promote an unverified record to proof. Other education/training records receive the same contract; normal employment records are not relabelled as training. No special-case visitor question or canned answer was added.

Caching was inspected rather than assumed: context is read fresh on every assistant/Job Match request, and `gemini.js` makes a direct provider request without a response or context cache. The browser keeps displayed conversations in React state; each new question sends a fresh request and does not include that history in the provider prompt. The public API cache and React Query data cache do not supply the assistant snapshot. Duplicate-question throttling rejects repetitions; it does not replay an answer. JSON responses already use `no-store`; assistant SSE now also explicitly uses `private, no-store, no-transform`. The public PDF's existing five-minute cache is unrelated to assistant generation and is unchanged. Route tests mutate a record between requests and confirm the next prompt receives the changed dates.

Profile and CV resolution share the learning evidence contract. Profile explicitly displays unverified program completion and training/certification status. Standard CV already uses neutral Digital Hub participation and AWS dates, so its rendered copy/layout needed no change; resolved education data now also carries evidence metadata while retaining explicit CV date overrides. Job Match uses the same snapshot and policy for both transports, including the recruiter summary that feeds the signed tailored-CV export. Team fields, named collaborators, team size and documented personal contributions remain in the context; the policy distinguishes team features from personal work.

## Capabilities and visual evidence

The earlier check compared whole normalized names and only removed exact overlaps from Skills. Composite labels and specific variants therefore survived across category summaries and Skills. `capabilityGroups` now assigns canonical competency atoms one location across the complete rendered content, with specific details under that competency. HTML/HTML5 and CSS/CSS3 stay under Languages; MySQL and MariaDB remain two distinct Databases entries; Git and GitHub remain two distinct Operations entries. Argon2 includes password hashing once, and AI API Integration includes its OpenAI detail once. JWT authentication also groups with JWT. Django/DRF and SQL/SQLAlchemy remain distinct. Project evidence follows the competency into its selected location and still requires documented personal role/ownership/contribution plus matching stack evidence; OpenAI API stack evidence supports the OpenAI integration detail. CMS records and selection IDs are untouched.

Read-only Chrome review at **1363×936**, **390×844**, and **320×844** uses captured public GET records, loaded Manrope, reduced motion, and blocked API writes. Each viewport renders **71 unique competency keys**, with no duplicates, horizontal overflow (including the actual scroll container), or page exceptions. Visually inspected category wrapping, distinct database/operations items, project links, Skills spacing and training uncertainty. [Desktop Capabilities](docs/design/phase1-followup/capabilities-1363.jpg), [phone Capabilities](docs/design/phase1-followup/capabilities-390.jpg), [desktop databases](docs/design/phase1-followup/capabilities-databases-1363.jpg), [phone operations](docs/design/phase1-followup/capabilities-operations-390.jpg), [phone Skills](docs/design/phase1-followup/capabilities-skills-390.jpg) and [training status](docs/design/phase1-followup/training-1363.jpg) show the result. Earlier accepted Phase 1 captures remain in `docs/design/phase1/after/`; they were not overwritten or relabelled as new captures. Portrait, gallery assets, palette, navigation and motion implementation are preserved.

## Validation and limits

- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`: passed. Existing 502.76KB motion chunk warning remains.
- `npm run test:integrity`: **9/9** passed. Covers absent proof, past/future dates, self-reported completion, credential metadata, other training, ordinary employment, cross-section grouping, useful evidence links, and actual assistant/Job Match JSON/SSE outgoing prompts with in-memory Prisma/provider fixtures. These fixture responses do **not** evaluate model reasoning. CI now runs this suite.
- `npm run test:landscape`: **10/10** existing stream/link tests passed. `npm run test:api-runtime`: JavaScript-only function package and health/projects/profile routes passed without TypeScript runtime dependencies.
- Static `CV_STATIC_ONLY=1 npm run test:cv --prefix server` and `npm run test:cv-reference --prefix server`: passed. Added resolved-data evidence assertions; standard/tailored exports remain one Letter/Carlito page and master retains A4/Source Sans. Reference geometry, text fixture and tolerances are unchanged. One initial nested-PowerShell static command lost its environment assignment and was stopped; the successful rerun assigned the variable in the calling shell. Only the successful static runs are counted here.
- Profile/content/portrait Playwright suite: **36/36**, no skipped, unexpected, flaky results or retries, across desktop/tablet/mobile. Includes 320px cross-section alias/evidence checks and accepted portrait geometry/delivery checks. Browser review independently confirms the real public snapshot renders without duplicate keys or overflow.
- **Real provider evaluation:** three independently phrased questions ran through the corrected local Express assistant route using the configured **Gemini 3.5 Flash** provider. All returned HTTP 200. AWS: listed July–October 2025 participation, completion unverified, certification unverified. Digital Hub: June–September 2026 participation, graduation/completion unverified. Lobby/UniHub: collaborative delivery, specific documented personal work and named collaborators retained. Exact questions/answers are in `provider-answers.json`. Data reads and rate-limit writes used a fail-closed in-memory Prisma replacement; no production assistant POST was used. This is real provider output using locally corrected code and captured public records, **not deployed production output**.

Completion/certification evidence is still absent; code cannot establish those facts. Future verified evidence needs an explicit source/record contract, not inferred dates or a credential URL. Production behavior after deployment, authenticated production CV overrides, live database-backed CV tests, physical phones and Safari remain unverified. The three provider samples are observations, not a guarantee against every future model response. No CMS reconciliation patch, merge, manual deployment, production Contact submission or Phase 2 work was performed.

Changed implementation files: `shared/content-integrity-runtime.js` / `.d.ts`, `src/lib/hooks.ts`, `src/components/landscape/ProfilePage.tsx`, `src/landscape-integration.css`, `server/src/lib/portfolio-context.js`, `server/src/lib/cv-config.js`, `server/src/lib/evidence-instructions.js`, `server/src/routes/assistant.js`, and `server/src/routes/job-match.js`. Tests/QA: `tests/content-integrity.test.mjs`, `tests/e2e/content-integrity.spec.ts`, `server/test/learning-context-routes.test.mjs`, `server/test/helpers/snapshot-api.mjs`, `server/scripts/test-cv.mjs`, both new `scripts/review-phase1-*.mjs` follow-up/provider scripts, `package.json`, `.github/workflows/ci.yml`, this report and `docs/design/phase1-followup/` evidence.

---

# Vercel API startup repair — 9 October 2026

The user deployed Phase 1 and supplied production runtime logs showing `ERR_MODULE_NOT_FOUND` for `/var/task/shared/content-integrity.ts`, imported by `server/src/lib/cv-config.js`. This is a regression introduced by Phase 1: the new JavaScript backend imports referenced a TypeScript source path that was absent from the deployed function package. Because `api/index.js` loads all routers, the missing dependency stopped the entire backend before requests reached Prisma; Collection, Projects, Profile and other API consumers therefore failed together. A direct read of the live `/api/health` confirmed HTTP 500 with `X-Vercel-Error: FUNCTION_INVOCATION_FAILED` before this repair was deployed.

Repair branch: `fix/vercel-content-integrity-runtime`, based on `a08200d`. Content rules now have one canonical JavaScript implementation in `shared/content-integrity-runtime.js`; its matching declaration file preserves TypeScript signatures. The existing `shared/content-integrity.ts` remains a typed frontend re-export. Backend CV/context modules import the actual `.js` runtime, and `vercel.json` explicitly includes that file in `api/index.js`'s package. There are no content, layout, PDF geometry, database, environment-value or security-rule changes.

Added `npm run test:api-runtime` and a CI step that copies the real API/backend plus JavaScript shared files into an isolated temporary package, leaves out all TypeScript source files, disables Node's TypeScript loader, imports the actual `api/index.js`, and checks health/projects/profile HTTP 200 responses with explicitly mocked data reads. This reproduced the **exact missing-module error before the fix** and passes afterward. It uses no database, external provider, environment-file content or production write. The temporary package path is checked before cleanup.

Validation: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:api-runtime`, six content/context tests, ten existing stream/link tests, static CV generation/reference tests and all **33** desktop/tablet/mobile content/Profile/portrait checks passed. The final browser run has zero skipped, unexpected or flaky results. The application reference geometry and tolerances are unchanged. The frontend's emitted main bundle hash remains `index-CrFsOXR3.js`, matching the preceding Phase 1 build; only the shared backend runtime packaging is repaired. The existing 502.76KB motion chunk warning remains.

The first direct network attempts failed due to temporary DNS/connectivity failures; later origin fetch, GitHub reads and the live health check succeeded. Vercel's published configuration schema confirms `includeFiles` accepts the explicit string used here. No Vercel settings, live database or Contact messages were changed. The new commit must be deployed before production recovery can be verified; local/mock success is not a claim that the currently deployed API is repaired. Full Vercel function artifact generation and post-deployment real-data responses remain unverified in this session.

---

# Phase 1: content integrity and presentation consistency

9 October 2026. Branch: `refine/phase-1-content-integrity`, based on approved `refine/engineered-landscape-portrait-finish` at `f84c580` (draft PR #9). Refreshed origin before choosing this base. The original checkout's untracked `Codex_Engineered_Landscape_Handoff.md` is preserved and excluded from this change. The review PDF was read as observations to verify, with work limited to the user's Phase 1 request.

[Matched before/after browser comparison](docs/design/phase1/comparison.html) · [Browser findings](docs/design/phase1/after/browser-findings.json) · [Checks](docs/design/phase1/checks.json) · [Exact proposed CMS patch](docs/design/phase1/proposed-cms-patch.json) · [PDF inspection](docs/design/phase1/cv/inspection.json).

## Findings fixed and source boundaries

- The reader always mounted a personal-contribution heading, paragraph and list. It now trims optional values, removes empty paragraphs/lists/metadata, and collapses the unused column when no personal record exists. Team-only records retain named collaborators in a separate team section. No responsibilities, collaborators, results or metrics were invented.
- A shared display-name mapping supplies **Cedar Construction** and **User Management** to reader H1s, gallery/index captions, collection selection/reveals, next-project navigation, assistant context and Job Match evidence/export labels. Full functional names remain secondary reader descriptions and search terms. Slugs, IDs, routes and CMS names are unchanged. Independent work reads **Independent project.**; team phrases and their separators stay together.
- Profile, resolved CV data and the AI snapshot share month/year formatting and experience sorting. Profile now orders Digital Hub, Oigetit, Ishtari and FALA by most recent end date. The targeted standard CV retains its existing two selected roles; sorting does not add omitted roles. Role titles are preserved.
- Digital Hub's public `description` said “Completing,” while `details` and `cvBullets` said “Completed.” Neither a completion certificate nor a separate authoritative status record was established. All those fields use neutral participation wording. The existing internship title is retained; its program description is explicitly training, not an earned credential.
- AWS's current year field and the repository's explicit date correction (`afbde5a`) support **Jul 2025 – Oct 2025**. Removed the conflicting expected-2026 description/date from returned training records without claiming completion. Training/course records have an explicit label and use “Program information” for links; credential labels require a documented credential ID. The application CV heading reads **Education & training**.
- Public skills, technologies, CV selection and AI context collapse case duplicates and the known SOLID/JavaScript aliases. Distinct Django/DRF, SQL/SQLAlchemy, hashing and provider-specific capabilities remain. Profile avoids repeating the same skill in its technology groups and skills list. Unsupported public “verified” badges are removed. A demonstrated-in link requires an exact normalized project-stack match and documented personal role/ownership/contribution; a broad category no longer points to the same two projects.
- Labels were assigned only after viewing local originals and retrieving/inspecting the actual public CMS images. Corrected Lobby friends/audio/invitation views, GameZone administration/room/user views, Home Services landing page, the UniHub professor course catalog and student transcript, User Management public statistics, JobPilot resume/interview/artwork views, and Cedar's risk/forecast capture. Labels, captions, gallery selectors and alt text use the same screen record. Known image identities replace positional guesses; unfamiliar future assets use a neutral “Project image” label. No image, gallery frame, portrait, color, sculpture or motion was replaced.

| Case study | Personal-contribution finding |
| --- | --- |
| JobPilot AI | Existing role, ownership and seven public contribution statements retained; independent metadata corrected. |
| Lobby | Existing two contribution statements and six named team members retained. CV now says co-developed, followed by the documented access/invitation/validation/service contribution. |
| GameZone Arena | Existing two statements and three-person team retained. CV now says co-developed, followed by the documented frontend/backend integration contribution. |
| Cedar Construction | Existing role, ownership, four-person metadata and contribution statements retained; display title unified. |
| UniHub | Existing student-portal contribution and collaborative attribution retained. The inspected professor screenshot is accurately labelled; it is not relabelled as student evidence. |
| User Management | Existing role, ownership and fourteen statements retained; display title and independent metadata corrected. |
| Medicare Hub | Personal role/ownership/contribution fields are absent. Entire empty section and unused column omitted. Existing CV bullets are not promoted into a new personal ownership claim. |
| Home Services | Personal role/ownership/contribution fields are absent. Entire empty section omitted; supplied-Figma-kit attribution retained. |

Home Services' [repository README](https://github.com/MahmoudAbdulGhani/home-services/blob/main/README.md) confirms responsive implementation from a supplied Figma design and identifies the original kit link. No kit creator was inferred. Medicare's current [README](https://github.com/MahmoudAbdulGhani/Clinic-management-system/blob/main/README.md) contains PHPMailer library documentation; that is not evidence of personal clinic-workflow ownership. Both records remain eligible for later documented CMS contributions.

Already correct: equal-width borderless covers and responsive delivery, accepted portrait geometry, explicit team attribution on collaborative cases, Home Services' design-source distinction, structured experience dates, the corrected AWS 2025 year field, stream whitespace preservation, JSON streaming headers, and valid CV-link fallback. These were retained.

## Visual and CV evidence

Chrome captures use the same read-only public CMS snapshot at **1363×936** and **390×844**, with additional **320×844** route/tab geometry checks. The before frontend is the actual archived approved commit, with its original assets and successfully loaded Manrope; the after frontend uses this change. Files with `-notes-` or `-records-` capture actual scrolling inside the existing reader. No crop, stretched comparison, document expansion or browser preference override was used. Reduced motion was requested through the browser's test context. All eight routes and three Profile tabs have zero reported horizontal overflow or page exceptions; case paragraphs/lists have no empty blocks. Both missing contribution sections are absent; six documented sections remain.

Inspected the desktop and phone reader headings, metadata wrapping, Medicare/Home Services section removal, Profile ordering/training and the skill/evidence-link spacing. [Medicare before](docs/design/phase1/before/medicare-hub-notes-1363.jpg) / [after](docs/design/phase1/after/medicare-hub-notes-1363.jpg), [Home Services phone after](docs/design/phase1/after/home-services-notes-390.jpg), [Cedar phone after](docs/design/phase1/after/construction-project-management-accounting-system-390.jpg), and [training after](docs/design/phase1/after/profile-education-records-1363.jpg) provide direct evidence.

The application generator explicitly selected Caladea for JobPilot. That source branch is removed; all application body copy uses Carlito at the existing 10pt size. Standard and reordered tailored exports are each **one Letter page**, with selectable text and **10 link annotations** including email, phone, LinkedIn, GitHub and portfolio. The existing A4/Source Sans master remains four pages in the static catalog. [Standard PDF](docs/design/phase1/cv/application.pdf), [tailored QA PDF](docs/design/phase1/cv/tailored.pdf), [master PDF](docs/design/phase1/cv/master.pdf), [before render](docs/design/phase1/cv/before.png), [standard render](docs/design/phase1/cv/application.png), [tailored render](docs/design/phase1/cv/tailored.png) and extracted `.txt` files are retained. The tailored sample is a declared generator fixture, not a live AI recommendation.

Reordering Lobby before JobPilot exposed an existing paragraph collision. Subsequent project positions and later sections now accommodate actual text height while retaining the standard reference anchors. PDF inspection checks embedded fonts, page size/count, extracted wording, contact annotations, text bounds and paragraph separation. Profile's Download CV action saved the regenerated PDF byte-for-byte through an intercepted local response. External link destinations were not all visited.

The reference fixture was **not regenerated**. Fourteen intended text expectations and the obsolete Cambria font expectation were hand-edited for these requested content/font corrections. All recorded line coordinates, rules, page geometry and 2pt/1pt/1pt tolerances are unchanged; the conformance test passes. JobPilot's Carlito wrapping is now explicitly locked by the intended text fixture. Broad résumé rewriting and new outcome claims remain deferred.

## Commands and actual results

Shell commands use `rtk proxy` because this machine's filtered RTK commands require an unavailable Claude config directory. The final checks are recorded in `checks.json`.

- `npm.cmd ci`: completed; no manifest/lock change. npm reported 38 dependency advisories. Dependency remediation was outside this content pass.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`: passed. Existing lazy motion-rig warning remains at approximately 502.76KB minified.
- `node --test tests/content-integrity.test.mjs`: **6/6** passed, including a fully mocked Prisma AI-context read with no database/provider access.
- `npm run test:landscape`: **10/10** existing stream/link tests passed.
- `npm run test:gallery`, `npm run test:portrait`: **2/2 each** passed; original gallery and portrait assets are unchanged.
- `CV_STATIC_ONLY=1 npm.cmd run test:cv --prefix server` and `npm.cmd run test:cv-reference --prefix server`: passed. The former also checks A4/Source Sans master generation; both avoid database access.
- `node scripts/review-phase1-cv.mjs` and `python scripts/verify-phase1-cv.py`: passed for regenerated standard, master and reordered tailored artifacts.
- Playwright public/API/reader/gallery/portrait/Contact suites, two workers against the explicit local preview: **144/144**, zero skipped/unexpected/flaky and no retries. After the final skill spacing and team-only preservation changes, Profile/content/portrait followup: **33/33** across desktop/tablet/mobile, zero skipped/unexpected/flaky. These cover navigation, real request contracts, assistant whitespace/focus/retry/cancel, Job Match report/export/token request and intercepted Contact states. They do not establish live provider reliability.
- `node scripts/review-phase1.mjs before http://127.0.0.1:5181` / `after`: **36 checks each**, matched captures and findings saved. A local CV-download smoke check passed byte-for-byte against the regenerated export.

Intermediate failures were resolved: the first CV tests correctly rejected the old font/content expectations before the narrow fixture update; an early concurrent browser run had a hover failure and its owned development-server shutdown stalled, then a reused server caused connection-refused failures when that earlier process was stopped. The explicit independent preview run passed all 144. A capture was interrupted by development HMR and rerun. The first archived-base captures could not load fonts from the parent dependency directory; they were replaced after narrowly allowing that local dependency directory and asserting font readiness. The temporary archive caused ESLint to discover a second config root; it was moved out of the checkout after capture and the final unmodified lint command passed. No application deadlines, retries, tolerance or security settings were loosened to obtain these results.

## Unresolved facts and CMS dependencies

The eight exact proposed patches cover three experience records, Angular/AWS date/status text, university dates, and the two collaborative CV summaries (only fields that actually differ are included). Each patch includes current-value preconditions and a record ID. **Nothing was applied.** Public presentation, PDF resolution and AI context already correct these records at read time; the patch would reconcile stored raw CMS copy for other consumers. There is no destructive skill deletion or configuration-selection rewrite.

Digital Hub/AWS completion and an earned vendor credential remain unestablished; neutral wording is intentional. Medicare/Home Services detailed personal attribution remains a CMS factual dependency; omission is the implemented fallback. Their media is unchanged, including Medicare's identity image and the scrollbar embedded in the Home Services capture. New workflow media, media replacement, flagship rewriting and motion refinement belong to later phases.

Physical iOS/Android devices, Safari, real keyboards and a new GPU/performance audit were not performed. No live AI-provider completion, authenticated production CV override/configuration read, database-backed CV test, every external URL, production Contact delivery, merge or manual deployment was verified or performed. AI and Contact UI checks used clearly identified local fixtures. No production content/database write was made, and no Contact enquiry was submitted. Stop after Phase 1.

---

# Profile portrait: final lighting and image delivery

8 October 2026. Implemented locally on `refine/engineered-landscape-portrait-finish`, based on the accepted borderless-gallery commit `3a8d208`. The accepted portrait crop, frame, size, placement, ivory background and surrounding Profile design are preserved. No unrelated work was changed.

[Actual Profile before/after comparison](docs/design/engineered-landscape-portrait/finish/comparison.html) · [Preservation and delivery measurements](docs/design/engineered-landscape-portrait/finish/preservation-and-delivery.json) · [Checks](docs/design/engineered-landscape-portrait/finish/checks.json). Working local page: http://127.0.0.1:5175/profile.

## Photographic finishing

Verified the original attachment at `C:/Users/Admin/Downloads/WhatsApp Image 2026-10-08 at 15.02.08.jpeg`: 1200 × 1600; SHA-256 remains `1065223bac21b80db1758710b469b55e0277e18fad5c352eeb7dbfbc174481ce`. Used the existing full-resolution registered cutout, retaining the exact alpha and crop rectangle (376, 341, 768, 1259). The original JPEG, previous PNG master and previous WebP assets remain unchanged.

Applied deterministic per-pixel linear-light correction to the existing head pixels: a restrained red gain (up to 2.5%), blue reduction (7.5–13% in linear light depending on shade), smoothly feathered to preserve surrounding clothing, and up to 0.10 stop additional face shadow lift. Corrected observed blue spill on fractional perimeter pixels using adjacent existing subject colors; bright-halo correction is limited to hair. Alpha and coordinates are unchanged. Hands/watch are excluded; near-opaque clothing below the head remains pixel-identical. No generation, face replacement, skin smoothing or sharpening.

The separate [finished master](docs/design/engineered-landscape-portrait/finish/portrait-finished-master.png) is transparent 1200 × 1600. Tests compare all 1,920,000 alpha values to the prior master, verify unchanged clothing interior and hands, and verify exact visible RGB/alpha round trips for every lossless WebP variant.

## Image delivery

The live page was checked in Chrome at 1363px and DPR 1/2 with all writes blocked. Its reported 436px natural width was density-adjusted: actual fetched WebP files were 480px at 1× and 768px at 2×. It already met 2× detail for the approximately 344px rendered desktop image. The old sizes attribute advertised 32vw instead of the actual inset image slot.

The corrected sizes calculations mirror the accepted column widths and padding. Native-source variants are 320, 384, 480, 640 and 768px wide, generated from the registered PNG rather than a small WebP. All use lossless WebP and preserve transparency; explicit 768 × 1259 dimensions remain. The main file is `public/landscape/portrait-striped-finished.webp`; responsive siblings are `portrait-striped-finished-{width}w.webp`. [Exact paths, dimensions and bytes](docs/design/engineered-landscape-portrait/finish/delivery.json).

At DPR 2: 1363px desktop receives 768px (2.23×); 1280px receives 768px (2.40×); 390px phone receives 384px (2.23×); 360px receives 320px (2.03×). Phone downloads drop about 31% and 49% respectively. The native 768px file is 603,372 bytes, about 0.7% larger after the pixel-preserving color finish. An intermediate 704px export was larger than the native file and removed from srcset and delivery. Lossless AVIF was also larger; lower-quality AVIF changed alpha, so it was not adopted.

## Layout and checks

Before/after Profile viewports, complete layouts and portrait-panel captures cover 1363 × 936, 1280 × 720, 390 × 844, 360 × 800 and 1920 × 1080 at DPR 2. Chrome before/after comparisons and WebKit after renders were inspected against the actual ivory page background. Panel geometry, image width/position and heading alignment have zero measured change. Mobile image-height rounding from responsive integer dimensions is less than 0.2 CSS pixels; the fixed crop frame is unchanged. No portrait or surrounding CSS was modified, and reduced-motion behavior remains static. Future custom CMS photos retain their own source without a person-specific cutout treatment.

Lint, typecheck, production build and **2/2 image regression tests** pass. Full Chrome desktop/tablet/phone suite: **144/144**; WebKit portrait/public suite: **28/28**. After removing the redundant source candidate, regenerated assets and reran lint/typecheck/build/image checks plus the affected portrait suites: **21/21 Chrome** and **14/14 WebKit**. All final results have zero unexpected, skipped or flaky tests. Browser tests verify decoded file dimensions at 2×, native-width caps, accepted frames, explicit sizing, delayed-load stability and future CMS-photo precedence. Existing motion-rig chunk-size warning remains, approximately 503KB minified.

## Limitations and changed files

The native trimmed source is only 768px wide. At the unchanged 1920px desktop layout, the image renders around 501px, so true 2× would need around 1002 native pixels; current delivery is capped at 1.53×. A higher-resolution original would be needed for that width. Physical phones, on-screen keyboards and calibrated display/color-reference testing remain unavailable; Windows WebKit is engine coverage, not physical Safari verification.

Changed: `src/components/landscape/ProfilePortrait.tsx`, `src/generated/profile-portrait.ts`, `scripts/optimize-profile-portrait.mjs`, `package.json`, `tests/profile-portrait.test.mjs`, `tests/e2e/profile-portrait.spec.ts`, six new WebP assets under `public/landscape/`, this QA section and `docs/design/engineered-landscape-portrait/finish/`. Original/current assets and the accepted CSS remain unchanged. On 9 October 2026, the user authorized committing and pushing this finished pass on its dedicated branch for draft review. No merge, manual deployment, production Contact submission or live database modification is authorized or performed.

---

# Approved borderless gallery refinement

8 October 2026. The user accepted the borderless comparison and authorized implementation, testing, commit and branch push. Work continues on `refine/engineered-landscape-gallery-covers` from `6c0451e`, updating draft PR #8. This section supersedes the matte presentation described below.

[Before/after comparison](docs/design/engineered-landscape-covers/gallery-comparison.html) · [Current checks](docs/design/engineered-landscape-covers/refinement-3/checks.json) · [Sources and treatments](docs/design/engineered-landscape-covers/cover-treatments.json) · [High-density phone measurements](docs/design/engineered-landscape-covers/refinement-3/device-layout-review.json).

## Change and preservation

The wide 80px/50px gray surround is removed from all eight covers. Rebuilt 1600 × 1000 lossless masters directly from the same hash-verified high-resolution captures; full screenshots now fill their frames. All source captures already match 16:10, so there is no screenshot cropping, stretch or upscaling. This increases visible product width by about 11% within the accepted frame geometry. Exported WebP/AVIF assets were regenerated with the existing quality settings.

Authored covers have zero CSS padding and a transparent frame background. Square edges, image containment, loading/error space, and the existing oxide keyboard outline remain intact. Renamed the preview flag from `embeddedMargins` to `authoredCover` to reflect the new treatment. Original source photographs and product captures, case-study media, selected views, sculptures/WebGL motion, full CMS names and routes, descriptions, search, Gallery/Index modes, Contact and AI functionality remain unchanged. Future CMS screenshots still use their contained inset presentation.

## Visual verification

Fresh before/after full galleries and original viewports were captured at 1363 × 936, 1280 × 720, 390 × 844 and 360 × 800. Desktop and mobile complete galleries were visually inspected against the accepted borderless comparison: all eight retain complete images, consistent frame bounds, aligned caption spacing, flat edges and readable product content. Captures are in [refinement-3](docs/design/engineered-landscape-covers/refinement-3/). Complete-gallery expansion is capture-only.

Chrome and Windows WebKit phone/touch review used DPR 3 at 320 × 568, 360 × 800, 390 × 844, 430 × 932 and 844 × 390. All ten layouts loaded eight images, filled the frames without transforms or borders, and had no horizontal overflow or page errors. Physical phones, on-screen keyboards and browser-chrome behavior remain unverified.

## Checks

- Lint, typecheck and production build passed. Existing motion-rig chunk warning remains, approximately 503KB minified.
- Image regression: **2/2** passed. Tests check actual painted pixel bounds at all four master edges, complete-source crop metadata, and every responsive format/fallback. **56** delivery files decode; total asset bytes: **2,302,864**.
- Complete Chrome desktop/tablet/mobile suite: **123/123**, no skipped or unexpected results, no automatic retries. Covers, selection/reversal, assistant, Contact, search/routes and original case-study media remain functional.
- Relevant WebKit gallery/public interaction suite: **28/28**, no skipped or unexpected results, no automatic retries. Includes all eight previews, Gallery/Index modes, loading/failure states, full CMS search names and routes, case-gallery keyboard/focus, and public navigation.
- The initial WebKit run missed Ctrl+K before requesting the lazy Command Palette module. The test now waits for rendered navigation before sending the shortcut; its 5s dialog assertion is unchanged. Final WebKit results and a **3/3** targeted Chrome desktop/tablet/phone followup pass. No palette application code or global timeout changed.

## Remaining limits and delivery

No physical iOS/Android device, actual phone keyboard or browser-chrome testing was possible. Windows WebKit automation is not physical Safari verification. Medicare still uses its verified public homepage because no approved populated clinical screenshot was available. Protected project captures retain the previously disclosed published/repository fixtures; this styling refinement makes no claim of live backend/authentication testing.

Commit and push are authorized for this branch and draft PR #8. No merge, manual deployment, production Contact submission, live CMS/database write, dependency change or unrelated source-repository edit.

Changed files: `src/components/ProjectPreview.tsx`, `src/components/project-preview.css`, `src/pages/Projects.tsx`, `tests/gallery-covers.test.mjs`, `tests/e2e/project-preview.spec.ts`, `tests/e2e/public.spec.ts`, gallery masters/delivery assets and QA metadata/screenshots.

---

# Gallery refinement 2: fresh matching captures

8 October 2026. Local branch: `refine/engineered-landscape-gallery-covers`, based on `f1fdade`. This review supersedes the first-pass cover selections and its timeout result below. All eight covers are now integrated with exactly matching painted bounds; protected workflow and physical-device qualifications remain explicit.

[Complete before/after comparison](docs/design/engineered-landscape-covers/gallery-comparison.html) · [Sources, resolutions, hashes and treatments](docs/design/engineered-landscape-covers/cover-treatments.json) · [Checks](docs/design/engineered-landscape-covers/refinement-2/checks.json) · [Device measurements](docs/design/engineered-landscape-covers/refinement-2/device-layout-review.json). Local preview: http://127.0.0.1:5175/projects.

## Findings and implementation

1. The rejected pass had equal outer frames but unequal painted screenshot bounds. Fresh captures now fill identical 1440 × 900 product areas inside 1600 × 1000 masters, at 80px horizontal and 50px vertical offsets. Original capture ratios are 16:10; no cropping, stretching, generated UI, decorative frames or extra CSS padding. Source product colors and original case-study images remain intact.
2. Real product code supplied stronger populated views. JobPilot uses existing Resume Library unit fixtures. Lobby reuses exactly the six messages, reply and reaction already published in its community-chat screenshot; no private conversation was accessed or invented. GameZone reuses the two known published bookings and real room assets; its footer is excluded. Cedar uses its repository's saved project overview and actual styles. UniHub reuses its published dashboard figures and course bars. User Management uses the current administrative table with six original repository demo records, discarding password fields before capture. Home Services was recaptured to retain both worker photographs and the complete hero.
3. Medicare's real public homepage was recaptured at 1280 × 800, DPR 2; the other seven captures use 1536 × 960, DPR 2. Its admin and appointment templates were inspected, but no approved populated clinical screenshot was available. The existing admin backdrop was a weaker presentation and rejected. No patient records were invented, and the unapproved identity proposal remains unintegrated.
4. Desktop captions, responsive frames, concise labels, full CMS search names, accessible link names, routes, Gallery/Index switching and image loading/failure behavior passed regression checks. The portfolio's accepted design, sculptures, WebGL motion, portrait, CMS content, selected views and other pages are preserved.
5. WebKit exposed focus restoration after mouse opening the case-study gallery. The opener is now recorded explicitly rather than inferred from document.activeElement, because WebKit does not focus mouse-clicked buttons. Contact now rechecks visibility after a keyboard-time document scroll, correcting WebKit's delayed textarea focus scroll without restricting ordinary page scrolling. Gutter assertions measure the page's padding without counting a native scrollbar.
6. The previous selected-image test timeout combined lazy WebGL/resource startup with animation. The test now waits separately for opening (15s resource allowance), then retains the original 5s settled-animation assertion. No global timeout, retries, animation speed or application motion was relaxed.

## Screenshots and visual review

Before and after complete galleries plus original viewports are linked in the comparison at 1363 × 936, 1280 × 720, 390 × 844 and 360 × 800. Desktop complete-gallery and mobile renders were visually inspected. High-density Chrome and Windows WebKit screenshots are in [refinement-2](docs/design/engineered-landscape-covers/refinement-2/), at 320 × 568, 360 × 800, 390 × 844, 430 × 932 and 844 × 390. All ten layouts loaded eight bounded images, retained 16:10 frames, and had no horizontal overflow or page errors. Complete-gallery capture expansion is capture-only; viewport screenshots show actual layout.

## Checks and limitations

- Lint, typecheck and production build passed. Existing motion-rig chunk warning remains (approximately 503KB minified).
- Image regression: **2/2** passed, checking actual non-matte pixel bounds for all eight masters and decoding all 56 responsive delivery files. Total delivery assets: **2,011,747 bytes**.
- Existing assistant/stream checks: **10/10** passed.
- Complete Chrome desktop/tablet/mobile suite: **123/123**, zero skipped, unexpected or flaky results.
- WebKit desktop/phone API, Contact, Gallery/Index and public interactions: **46/46**, zero skipped, unexpected or flaky results. Contact initial, focus, validation, pending, failure and success states use intercepted submissions.
- Phone layout review uses DPR 3 and touch contexts. **No physical iOS/Android phone, actual on-screen keyboard or browser-chrome behavior was tested.** Windows WebKit automation is not a claim of physical Safari verification.
- Protected project captures use isolated actual frontends and disclosed existing published/repository fixtures; backend/authentication/live-data functionality was not exercised. Medicare's authenticated clinical workflow remains unavailable as a populated approved screenshot.
- Local source repositories and existing unrelated edits were preserved. Capture-only servers were stopped; the read-only portfolio preview remains available. No new dependencies, live database/CMS changes, production Contact submissions, merge or manual deployment. On 8 October 2026, the user authorized committing and pushing this verified refinement branch. Branch delivery is separate from the local QA results and does not change production.

## Changed implementation files

Gallery assets and provenance: `docs/design/engineered-landscape-covers/`, `public/projects/gallery-covers/`, `src/generated/gallery-covers.ts`, `scripts/optimize-gallery-covers.mjs`, `scripts/optimize-project-images.mjs`. Presentation: `src/pages/Projects.tsx`, `src/lib/gallery-presentation.ts`, `src/components/ProjectPreview.tsx`, `src/components/ResponsiveProjectImage.tsx`, `src/components/project-preview.css`, `src/landscape.css`. Cross-browser corrections: `src/components/CaseGallery.tsx`, `src/components/landscape/ProjectReader.tsx`, `src/lib/use-contact-viewport.ts`. Coverage: `tests/gallery-covers.test.mjs`, `tests/e2e/project-preview.spec.ts`, `tests/e2e/engineered-landscape.spec.ts`, `tests/e2e/contact-responsive.spec.ts`, `package.json`.

---

# Engineered Landscape: eight dedicated gallery covers

Date: 8 October 2026. Status: **all eight available real-material covers integrated and locally verified; protected workflow capture limitations documented below**. The Medicare identity alternative is a proposal only.

## Scope and source inspection

Read the complete attached gallery-cover brief. It replaces the earlier two-project comparison task. Inspected repository instructions, working tree, branch and commits before creating `refine/engineered-landscape-gallery-covers` from the clean portrait branch at `f1fdade`. This preserves `f3fa087`, selected-project, mobile Contact, approved equal-width gallery and portrait improvements. The original Desktop/portfolio checkout and its untracked handoff remain untouched.

Read the eight published projects from the public CMS, retrieved original remote screenshots, inspected local originals and each product repository, and visited the actual product URLs. [Source inventory](docs/design/engineered-landscape-covers/source-inventory.json) records the original resolution/aspect ratio and product/repository URLs. [Cover treatments](docs/design/engineered-landscape-covers/cover-treatments.json) records the exact selected file, source hash, individual crop and final product rectangle. Downloaded originals and inspection helpers are outside the app; no live project or CMS records were edited.

| Gallery title | Selected original / aspect ratio | Selected content and treatment | Fresh capture availability and limitations |
| --- | --- | --- | --- |
| JobPilot AI | Repository QA PNG, 1488×1121 / 1.327 | Existing populated Resume Library, saved document, sidebar and upload action. Select top 1488×930; render 1440×900 at 80,50. | The repository's `evidence/refinement-final/after-resumes-1488.png` is an actual application capture with existing QA test data. Public live site available; private workflow requires authentication, with no shared demo account. No new documents/data were fabricated. |
| Lobby | Original `audio-room.webp`, 1919×863 / 2.224 | Select real room interface at 1430×863, excluding unused chat pane; keep brand, room navigation and Start audio call. Render at 85,69 without enlargement. | Public landing page accessible; no approved populated server/conversation capture or shared demo account found. No private conversations were accessed or republished. This room view remains less populated than an authenticated conversation. |
| GameZone Arena | Original `user_overview.webp`, 1366×1446 / 0.945 | Deliberate top 1366×954: navigation, all four metrics and both confirmed upcoming sessions. Footer excluded. Render 1289×900 at 156,50. | Authenticated dashboard not publicly accessible. Original source is smaller than the preferred capture width; it is downscaled rather than enlarged. |
| Cedar Construction | Public repository QA `local-project-detail.png`, 1440×1289 / 1.117 | Sidebar, four financial metrics, complete progress and project-health panels. Select top 1440×948; render 1367×900 at 117,50, comparable to GameZone. | Real repository capture with existing example-project data and Cedar Control branding. Public site warms up after a cold backend response; private workflow requires authentication. CMS case-study screenshots remain unchanged. |
| UniHub | Original `Admin.webp`, 1919×918 / 2.090 | Keep navigation, all summary cards, enrollment chart and account status. Remove only the captured right scrollbar; render 1440×692 at 80,154. | Repository-published demo login was tested after backend warm-up and returned 401. No further credential attempts. Highest available original retained; its compression and wide aspect limit sharper recapture and increase vertical matte. |
| User Management | Fresh public capture, 1440×900 / 1.600 | Loaded real statistics, navigation, all three cards and complete Platform Overview. Remove irrelevant lower blank area; render 1440×650 at 80,175. | Fresh public overview possible. An actual authenticated management workflow was unavailable; this cover is explicitly a public statistics view, not an admin screen. |
| Medicare Hub | Fresh public capture, 1440×900 / 1.600 | Verified public homepage, navigation, introduction and existing reception artwork. Select top 1440×750; render at 80,125. | Real public interface available. No dashboard/appointment screenshot found in CMS/repository; protected clinic/patient workflow unavailable. The separate identity proposal below is not integrated. |
| Home Services | Fresh public capture, 1920×1200 / 1.600 | Complete navigation, headline, both original worker photos and service facts. Downscale whole view to 1440×900 at 80,50. | Fresh capture possible. At 1440px the live responsive design hides the side photos; 1920px was deliberately used to retain both. Capture-only scrollbar suppression removes browser chrome; the intentional lower white shape belongs to the original design and is preserved. |

All selections were reviewed individually. No generated interfaces, fabricated messages, perspective, decorative device frames, gradients, new motion or interface recolouring were introduced. Existing illustration material remains unchanged. Restricted workflow sources remain a limitation; every project nevertheless has a dedicated, verified-material gallery cover in this local pass.

## Cover assets and integration

Eight lossless **1600×1000 PNG masters** live in [masters](docs/design/engineered-landscape-covers/masters). The common matte is the existing preview colour **#deded3**. The 1440×900 product view at 80/50px is the starting point; wider/narrower originals retain their proportions and complete selected panels, so their exact matte differs as documented. GameZone and Cedar now have similar product height and apparent scale. UniHub and User Management retain more vertical matte to preserve their content without distortion.

[Delivery assets](public/projects/gallery-covers) contain WebP and AVIF at **480, 960 and 1600px**, plus a primary WebP fallback: **56 files / 2,123,730 bytes** across all variants, not a single page download. Largest full-size WebP is 105,270 bytes. WebP quality 92 and AVIF quality 72 with 4:4:4 preserve interface colour/text. [Asset validation](docs/design/engineered-landscape-covers/asset-validation.json) confirms every asset decodes, every master is 1600×1000, matte pixels match, and resize ratio rounding remains below 0.00036. No source original was enlarged.

`npm run images:gallery` rebuilds optimized delivery sets and `src/generated/gallery-covers.ts` from the reviewed masters. The existing case-study optimizer excludes this directory so it cannot recompress the separately authored covers. No image-generation dependency was added.

`Projects` selects the dedicated cover by slug and supplies explicit **1600×1000** dimensions and responsive sources through the shared image component. Authored covers receive **zero additional CSS padding**, avoiding doubled margins. Unknown/future CMS projects retain the bounded original-image path and ordinary frame padding. Loading/decode/error states reserve the same 16:10 frame.

Gallery and Index use concise presentation titles, including **Cedar Construction** and **User Management**. Search matches both the short title and original CMS name/technology. Link accessible names, identifiers, routes and case-study headings retain full CMS names. Case-study and selected-collection media remain original screenshots; no cover map is applied there. Portrait source/assets/code are unchanged in this branch.

## Complete eight-project before/after evidence

Open [gallery-comparison.html](docs/design/engineered-landscape-covers/gallery-comparison.html) for side-by-side complete galleries, original viewport captures, treatment table, masters and the separate Medicare proposal. Local live gallery: `http://127.0.0.1:5175/projects`.

| Viewport | Before complete eight-project gallery | After complete eight-project gallery | Unmodified after viewport |
| --- | --- | --- | --- |
| 1363×936 | [before](docs/design/engineered-landscape-covers/before-1363x936-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-1363x936-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-1363x936-viewport.jpg) |
| 1280×720 | [before](docs/design/engineered-landscape-covers/before-1280x720-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-1280x720-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-1280x720-viewport.jpg) |
| 390×844 | [before](docs/design/engineered-landscape-covers/before-390x844-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-390x844-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-390x844-viewport.jpg) |
| 360×800 | [before](docs/design/engineered-landscape-covers/before-360x800-complete.jpg) | [after](docs/design/engineered-landscape-covers/after-360x800-complete.jpg) | [viewport](docs/design/engineered-landscape-covers/after-360x800-viewport.jpg) |

Complete-gallery captures temporarily expand the existing inner scroll container for capture only. Original viewport captures and measured geometry accompany them; the expansion is not application CSS. Installed Chrome, DPR 1, reduced motion, read-only public-content snapshot. [Before measurements](docs/design/engineered-landscape-covers/before-review.json) / [after measurements](docs/design/engineered-landscape-covers/after-review.json): all eight loaded, eight Index links, no Index images, no horizontal overflow or page errors at every viewport. Desktop row captions and short titles align; 360/390px titles remain readable on one line.

[Loading screenshot](docs/design/engineered-landscape-covers/loading-390x844.jpg) and [failure screenshot](docs/design/engineered-landscape-covers/failure-390x844.jpg) use intercepted image responses. The frame remains **343.22×214.5px** through loading/failure, with a readable fallback and usable case-study link.

[Compiled-build delivery/state verification](docs/design/engineered-landscape-covers/production-loading-and-delivery.json) checks all eight decoded covers at 1363px DPR 1 and **390/360px DPR 2.75**. Chrome selects native AVIF; removing AVIF sources in the capture DOM separately verifies decoded WebP selection. This is a fallback simulation, not a physical unsupported-codec browser test. No page errors. [Medicare identity alternative](docs/design/engineered-landscape-covers/proposals/medicare-identity-1600x1000.png) uses only the existing illustration, project name and verified stack; it is shown for review and not adopted.

## Checks, changed files and limitations

- `npm run images:gallery`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`: pass. Existing >500kB WebGL motion chunk warning remains.
- `npm run test:landscape`: **10/10 pass**.
- Full Playwright suite: **122/123 passed** across desktop/tablet/mobile Chrome. All **21/21 gallery-cover regressions passed**. One existing mobile selected-screenshot test exceeded its five-second `settled` assertion while the stage was still `opening`; its isolated repeat passed **2/2** without changing application code or loosening the deadline. This transient timing failure is retained here rather than reporting a wholly green full run. [Check summary](docs/design/engineered-landscape-covers/checks.json). Cover tests verify all-eight bounds, undoubled margins, dimensions, Gallery/Index switching, image failure without layout shift, keyboard navigation, short/full-title search, full case-study names/original media, and future tall CMS-source containment. Other existing Contact, AI, navigation and focus regressions passed.
- Changed code: `src/pages/Projects.tsx`, `src/lib/gallery-presentation.ts`, `src/generated/gallery-covers.ts`, `ProjectPreview.tsx`, `ResponsiveProjectImage.tsx`, `project-preview.css`, caption-height rule in `src/landscape.css`, `scripts/optimize-gallery-covers.mjs`, exclusion in `scripts/optimize-project-images.mjs`, `package.json` script, and `tests/e2e/project-preview.spec.ts`. Added dedicated cover assets and this QA evidence. No dependencies, server routes, CMS records, case-study sources, portrait, Contact or sculpture code changed.
- Source gaps: no approved populated Lobby conversation, no authenticated User Management workflow, no Medicare clinic dashboard/appointment capture, and unavailable UniHub demo authentication. The integrated covers use the verified sources documented above; these unavailable workflows are not represented as verified. Source compression limits GameZone/UniHub detail; no artificial sharpening or invented detail was used.
- Physical phones, Safari/WebKit and real device codec fallback were not available. Visual checks are Chrome desktop/mobile emulation; no hardware-device assurance is claimed.
- Local work remains uncommitted on `refine/engineered-landscape-gallery-covers`. No push, PR update, merge, deployment, production Contact submission or live database write occurred for this pass.

---

# Engineered Landscape Profile photograph integration

Date: 8 October 2026. Status: **refined photograph integrated and locally verified; follow-up commit/push authorized for online review**.

## Source, preservation and method

Verified and opened the actual attachment at `C:/Users/Admin/Downloads/WhatsApp Image 2026-10-08 at 15.02.08.jpeg`: **1200×1600**, light striped button-down shirt and blue-faced watch. No `/workspace/scratch/` path was used. Source SHA-256 remains `1065223bac21b80db1758710b469b55e0277e18fad5c352eeb7dbfbc174481ce`. The older `public/myphoto.jpeg` remains unchanged too.

Read repository instructions and inspected the clean `fix/engineered-landscape-media` branch at `b6246b5` before creating the local `refine/engineered-landscape-profile-portrait` branch. This includes the approved equal-width gallery, `f3fa087`, selected-project composition and mobile Contact fixes. No unrelated source or dependencies were changed.

The first built-in imagegen edit changed facial/watch details and was rejected. Its image is not used or copied into the portfolio. To satisfy the user's explicit requirement for accurate segmentation without regenerating the face, the final asset uses local IMG.LY medium/ISNet segmentation **only as an alpha source**, applied to the decoded original photograph's RGB pixels. This follows the [segmentation/mask implementation](https://github.com/imgly/background-removal-js/blob/main/packages/node/src/index.ts). The original pixel positions and subject geometry are retained; no generated face, fingers, watch, shirt, or invented body parts are used.

Refinement removes disconnected low-alpha background flecks and decontaminates semi-transparent perimeter pixels using adjacent outdoor colour estimates. Opaque interior pixels are not spatially filtered. A smoothly feathered face exposure lift peaks at approximately **0.20 stop**; restrained white-balance gains are red **1.015**, green **1.0**, blue **0.99** in linear light. No skin smoothing, sharpening, dramatic lighting, filters or synthetic shadows were applied. Processing dependencies and model weights are outside the repository; the app receives only static images.

## Assets and composition

- [Full registered edited master](docs/design/engineered-landscape-portrait/portrait-refined-master.png): transparent **1200×1600**, retaining the source's hands and watch. The original photo already ends partway through the hands; missing parts were not invented.
- [Main transparent WebP](public/landscape/portrait-striped-cutout.webp): **768×1259**, **598,898 bytes**. Only unused transparent canvas is trimmed, at source origin **376,341**.
- [Phone WebP](public/landscape/portrait-striped-cutout-480w.webp): **480×787**, **317,718 bytes**. Both variants use lossless WebP encoding; the main asset is approximately 62% smaller than its 1,596,112-byte full PNG master. Fully transparent PNG pixels have their unused RGB cleared.
- [Ivory/dark background review](docs/design/engineered-landscape-portrait/cutout-background-review.png): browser-composited check of hair, ears, shoulders, sleeves, hands and watch. The actual page-background captures below are the decisive presentation check.

[Pixel proof](docs/design/engineered-landscape-portrait/pixel-proof.json) verifies **627,000 opaque interior pixels** against the original photograph with only the documented photometric adjustment, with **zero mismatches**. Main WebP optimization preserves **646,533 visible pixels** and every alpha value, with **zero changed visible RGB or alpha pixels**.

`ProfilePortrait` owns the image and its responsive CSS. It replaces the old `/myphoto.jpeg` default with the new asset, while a future custom CMS photo still takes precedence and receives no person-specific mask. Image dimensions are explicit, with responsive source selection and eager/high-priority loading. The obsolete approximate SVG and all its mask/185%-zoom/negative-offset styles are removed.

The flat warm ivory panel uses a **4:5** desktop frame, **20px** internal headroom/gutter, and the original 32% portrait column. At 1363px it measures **380.6×475.7px** and aligns with the Profile record at **y=117px**. The lower presentation crop ends above the wrists; hands/watch remain intact in the asset. The shoulders remain inside the panel, the face is closer, and proportions are unchanged.

Phones retain the accepted two-column portrait/contact-detail grouping, with **220px** portrait height, **10px** internal padding, and top alignment. This reduces portrait height from approximately **280px at 390px / 257px at 360px**. Biography, heading, experience, education, capabilities, links, navigation, CV behaviour and CMS text remain intact. No border, shadow, gradient, floating/cursor motion or entrance animation was added; reduced motion has no portrait animation to disable.

## Complete before/after Profile layouts

| Viewport | Before complete layout | After complete layout | Unmodified after viewport |
| --- | --- | --- | --- |
| 1363×936 | [before](docs/design/engineered-landscape-portrait/before-1363x936-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-1363x936-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-1363x936-viewport.jpg) |
| 1280×720 | [before](docs/design/engineered-landscape-portrait/before-1280x720-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-1280x720-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-1280x720-viewport.jpg) |
| 390×844 | [before](docs/design/engineered-landscape-portrait/before-390x844-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-390x844-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-390x844-viewport.jpg) |
| 360×800 | [before](docs/design/engineered-landscape-portrait/before-360x800-complete.jpg) | [after](docs/design/engineered-landscape-portrait/after-360x800-complete.jpg) | [viewport](docs/design/engineered-landscape-portrait/after-360x800-viewport.jpg) |

Complete-layout captures temporarily expand the existing inner scroll container for screenshot purposes; unmodified viewport captures and measured panel geometry are supplied separately. This capture-only override is not application CSS. [Before measurements](docs/design/engineered-landscape-portrait/before-review.json) / [after measurements](docs/design/engineered-landscape-portrait/after-review.json). Installed Chrome 154, headed capture, DPR 1, reduced motion, read-only public content.

[Compiled-build verification](docs/design/engineered-landscape-portrait/production-profile.json) additionally checks desktop, 390px and 360px with **DPR 2.75**: explicit dimensions, source selection, preserved aspect ratio, visible headroom, no masks/transforms/horizontal overflow, pointer movement, record-tab switching and an intercepted custom CMS photo override. [Compiled phone capture](docs/design/engineered-landscape-portrait/production-390-viewport.jpg). No page errors were recorded.

## Checks, changed files and limits

- `npm run typecheck`, `npm run lint`, `npm run build`: pass. Existing >500kB motion chunk warning remains.
- `npm run test:landscape`: **10/10 pass**.
- Full existing Playwright suite: **117/117 pass** across desktop, tablet and mobile Chrome. Selected views, complete gallery images, AI headers, Contact state/keyboard fixtures, navigation and focus checks remain green.
- Changed code: `src/components/landscape/ProfilePage.tsx`, new `ProfilePortrait.tsx` and `profile-portrait.css`, and portrait-only cleanup in `src/landscape.css`. Replaced `public/landscape/portrait-silhouette.svg` with the two transparent WebP assets; added this QA evidence.
- Original JPEG compression limits recovery of the finest hair detail; the edit preserves available detail and does not invent strands. Extremely magnified edge colour can still reflect the original outdoor light; no obvious retained background or halo was observed at tested page sizes on ivory. Physical phones and Safari/WebKit were not available.
- Work is on `refine/engineered-landscape-profile-portrait`. After local verification, the user requested committing and pushing the portrait to view it online. This authorizes the connected Vercel branch deployment; no production promotion or merge is included. No production Contact submission or live database/CMS content write occurred. Existing PR #7 remains unchanged.

---

# Engineered Landscape media bounds and visual proposals

Date: 8 October 2026. Status: **image bounds and approved equal-width gallery implemented; Medicare cover not adopted; faithful portrait cutout unresolved**.

## Scope and source evidence

Read `Portfolio_Portrait_Project_Images_Plan_2026-10-08.html`, its implementation brief, and all three embedded screenshots. The attachment supplies review evidence; the user's direct request defines the work and preview-before-adoption boundary.

Inspected repository instructions, branch history and remote refs before creating `fix/engineered-landscape-media` from `866c836`. This preserves `f3fa087`, selected-project refinement `dd708c3`, and mobile Contact correction `866c836`. No later promoted code was found in the fetched refs.

Read-only public CMS inspection and repository asset inventory are recorded in [asset-audit.json](docs/design/engineered-landscape-media/asset-audit.json). All eight current published projects were inspected. Medicare's CMS cover/screenshots are empty; the repository contains its 1000×1000 identity illustration, with no genuine clinic interface capture found. Home Services' existing 1348×926 capture stays complete. GameZone's current 1366×1446 overview stays the preview source; a separate genuine 1600×741 landscape cover already exists, but this change does not substitute it.

## Implemented bounds and state handling

`ResponsiveProjectImage` now owns an opt-in `fit="frame"` mode: both `picture` and `img` fill the available frame, have zero minimum size, and stay bounded in both dimensions. Generated AVIF/WebP sources and remote/unoptimized images use the same containment path. Natural-height reader, inspector and selected-project consumers retain their previous behavior.

The Gallery uses this mode through `ProjectPreview`. Its loading placeholder reserves the same frame, the image appears after decoding, and failed previews show a readable status while retaining the enclosing case-study link and keyboard access. Alt text now describes the chosen screenshot rather than a potentially unrelated CMS promotional cover. Hover zoom was removed because it could crop image edges after successful containment.

After seeing the comparison, the user explicitly chose **"Adopt equal-width gallery only"**. Gallery now uses equal desktop columns, 16:10 frames, 12px desktop / 8px phone padding, aligned caption starts and reserved desktop title rows. Index styling stays separate. Medicare retains its existing illustration treatment, and Home Services retains its complete image. Palette, typography, CMS content, routes, portrait and motion engine are preserved.

## Before/after verification

Installed Chrome 154.0.8037.99, headed desktop capture, DPR 1 and reduced motion; current public CMS records intercepted locally. All public writes were blocked. Complete image boxes and intrinsic dimensions were measured, not just computed `object-fit`.

| Viewport | GameZone before | GameZone after | All eight / modes |
| --- | --- | --- | --- |
| 1363×936 | 605.9px image / 288.6px frame | 335.1px image / 359.1px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |
| 1280×720 | 568.9px image / 270.8px frame | 312.2px image / 336.2px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |
| 390×844 | 352.6px image / 162.5px frame | 192.2px image / 208.2px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |
| 320×568 | 287.0px image / 132.3px frame | 153.5px image / 169.5px frame | 8 loaded; no overflowing images; Index 8 links, 0 images; no horizontal overflow |

[Before measurements](docs/design/engineered-landscape-media/before-review.json), [after measurements](docs/design/engineered-landscape-media/after-review.json). Per-project card screenshots for all four sizes are in the same directory (`1` JobPilot, `2` Lobby, `3` GameZone, `4` Construction, `5` UniHub, `6` User Management, `7` Medicare, `8` Home Services).

| Evidence | Before | After |
| --- | --- | --- |
| GameZone desktop | [1363×936](docs/design/engineered-landscape-media/before-1363x936-3.jpg) | [1363×936](docs/design/engineered-landscape-media/after-1363x936-3.jpg) |
| GameZone short desktop | [1280×720](docs/design/engineered-landscape-media/before-1280x720-3.jpg) | [1280×720](docs/design/engineered-landscape-media/after-1280x720-3.jpg) |
| GameZone phone | [390×844](docs/design/engineered-landscape-media/before-390x844-3.jpg) | [390×844](docs/design/engineered-landscape-media/after-390x844-3.jpg) |
| GameZone narrow phone | [320×568](docs/design/engineered-landscape-media/before-320x568-3.jpg) | [320×568](docs/design/engineered-landscape-media/after-320x568-3.jpg) |
| Home Services proportions | [desktop](docs/design/engineered-landscape-media/before-1363x936-8.jpg) | [desktop](docs/design/engineered-landscape-media/after-1363x936-8.jpg) |
| Index mode | [320px](docs/design/engineered-landscape-media/before-320x568-index.jpg) | [320px](docs/design/engineered-landscape-media/after-320x568-index.jpg) |

Compiled production preview additionally verified [loading](docs/design/engineered-landscape-media/loading-320.jpg) and [intercepted failure](docs/design/engineered-landscape-media/error-320.jpg) at 320px. Both retain an identical 271.2×169.5px frame and a focusable case-study link; [production-review.json](docs/design/engineered-landscape-media/production-review.json) records no page errors.

The compiled build also used **actual WebGL** on Intel UHD / ANGLE Direct3D11 for Lobby selection, settled view, Escape reversal and focus restoration. [Screenshot](docs/design/engineered-landscape-media/production-webgl-lobby.jpg), [hardware/result](docs/design/engineered-landscape-media/production-motion.json). The full existing regression suite separately exercises reduced motion, photographic fallback, chapter switching, interrupted selection, selected layouts and Contact states with intercepted submissions.

## Reviewed visuals and adoption decision

Shown to the user before adoption, as requested:

- [Interactive comparison sheet](docs/design/engineered-landscape-media/gallery-comparison.html) / [image](docs/design/engineered-landscape-media/gallery-comparison.jpg): accepted composition with clipping fixed beside equal-width columns, matching **16:10** frames, **12px** desktop padding and aligned captions. Each card is an actual browser capture; the sheet arranges those captures for comparison.
- [Medicare landscape identity cover](docs/design/engineered-landscape-media/proposed-medicare-identity.jpg): original illustration contained beside its existing name/category/stack, explicitly labelled **Project identity**. No product interface is invented.
- [Mobile GameZone frame proposal](docs/design/engineered-landscape-media/proposed-mobile-card-3.jpg) and [complete Home Services proposal](docs/design/engineered-landscape-media/proposed-mobile-card-8.jpg): **8px** mobile padding, single column. Desktop proposal screenshots `proposed-card-1` through `8` and phone proposal screenshots `proposed-mobile-card-1` through `8` are included.

The user approved the **equal-width gallery only** after viewing these artifacts. The comparison's right-hand sheet includes a Medicare cover proposal that is **not adopted**; the actual implementation is shown in the `after-*` screenshots. Original comparison captures remain available for the review history. No portrait integration was approved or performed.

## Portrait limitation

Inspected the original `public/myphoto.jpeg` and approximate `portrait-silhouette.svg`. The available image editor produced a transparent candidate, shown as a proposal, but it retained colored edge fringes and changed clothing texture; its canvas also changed from 960×1280 to 1086×1448. It is unsuitable for the requested faithful photographic extraction and was rejected rather than integrated. The generated candidate stays outside the repository. No replacement person, new rough SVG, shadow or color correction was adopted.

The original photograph remains byte-for-byte unchanged, SHA-256 `e6af23208df8739c79c2b379c418a182a0d65e20c184bc6e1626b85ba99c2b05`. Its dark trousers and green reflections are present in the original. The old approximate mask remains an unresolved visual defect until an accurate matte can be made with a suitable photo extraction tool. [Original profile baseline](docs/design/engineered-landscape-media/before-profile-320x568.jpg) / [unchanged after](docs/design/engineered-landscape-media/after-profile-320x568.jpg).

## Checks and remaining limits

- `npm run typecheck`, `npm run lint`, `npm run build`: pass. The build retains the existing >500kB motion chunk warning.
- `npm run test:landscape`: **10/10 pass**.
- Final full browser run: **116/117 pass**, including all 15 new preview cases across desktop, tablet and mobile Chrome. One Chromium header case was interrupted by a Vite development reload while screenshot artifacts were written; its targeted rerun passes. All 117 current cases therefore have a passing result. The initial new tests also exposed an incomplete profile fixture, corrected before this final run. No application defect was hidden by retrying a failing assertion.
- New coverage checks all eight representative real aspect ratios at each requested viewport, optimized and unoptimized image paths, actual picture/image/painted bounds, hover containment, Gallery/Index transitions, routes, reserved slow/failure frames and keyboard access.
- Physical phones, Safari/WebKit and real device keyboards were not available. Chrome touch/DPR emulation is not physical-device verification. Remote image host availability can vary; local fixtures cover transport failure independently.
- The approved gallery is implemented; the Medicare identity cover is not adopted. A faithful portrait cutout remains unavailable. No clinic interface was found in the inspected CMS/repository assets; no authenticated clinic workflows were accessed.
- No merge, deployment, production Contact submission, or live database content change occurred. Generated build outputs, credentials, temporary helpers and rejected portrait candidate are excluded from the commit.

---

# Engineered Landscape mobile Contact correction

Date: 8 October 2026. Status: **implemented and locally verified; physical phone keyboards and Safari remain unverified**.

## Scope and cascade findings

Inspected repository instructions, the clean current branch and commits, and
fetched remote refs. Work continues on the dedicated
`refine/engineered-landscape-selected-views` branch, based on its existing
`dd708c3` selected-project refinement and `f3fa087` fixes. This Contact correction
is a follow-up in draft PR #6. The selected-project components, stylesheet,
sculpture assets, and motion engine were not edited.

Reviewed the live [Contact page](https://mahmoud-portfolio-omega.vercel.app/contact)
in installed Chrome at the requested widths, using read-only navigation and a
browser route guard that blocked every non-GET `/api` request. Captured the local
`dd708c3` baseline separately with the same read-only CMS snapshot used for the
after captures. No production Contact submission or live database write occurred.

The live and local CSS cascades reproduced these problems:

- The landscape page used 6% outer padding, while a legacy mobile
  `.public-container` rule still subtracted another 40px. At 320px, Contact's
  container measured approximately 242px wide with asymmetric remaining space.
- `.contact-form-column .contact-form` won against the landscape form styling,
  resetting mobile padding and borders to zero. Inputs were 40px high, and the
  Send button stayed at its content width.
- Desktop grid areas and explicit placements competed with responsive rules.
  The existing viewport-height shell made Contact scroll inside `main`, while
  its footer remained at the shell bottom rather than after the whole page.

## Scoped correction

Contact now owns a page stylesheet scoped to `.landscape-contact` and the
Contact-only `.portfolio.is-contact` modifier. It applies below 768px and to
phone landscape up to 960px wide / 500px high. Desktop Contact and other routes
retain their existing geometry.

Mobile Contact uses one **16px content gutter**, a **100%-width inner container**,
and `min-width: 0` throughout the form column. Grid areas and explicit child
placements reset to automatic single-column flow in DOM order: introduction,
form, contact details. The form has **18px internal padding** and one theme-token
border. Name/Email stack; controls fill the available width with **48px input
height and 16px text**. Enquiry choices wrap deliberately, and Send fills its row.
Email links, validation/error messages, and success content wrap without document
horizontal overflow. CMS copy, field semantics, validation, submitted payload,
honeypot, backend protections, and success/failure behavior remain intact.

The mobile Contact document grows naturally instead of retaining an internal
viewport-height scroll trap. The footer follows the content. A Contact-only hook
checks focused fields/buttons after focus, content resize, and VisualViewport
resize/scroll events, keeping them within the visible area. The footer/AI launcher
is hidden while an active Contact control has a substantially reduced visual
viewport and returns when editing ends. Other pages keep their existing footer.

State regressions exposed an existing focus race on `Send another message`:
its animation-frame callback could run before the reset form mounted. Focus now
runs after the success state resets and the new Name input exists. This restores
the intended focus behavior without changing validation or delivery contracts.

## Verification

Reviewed initial, focused, validation-error, pending, failure, and success states
at **320 x 568, 360 x 800, 390 x 844, 430 x 932, and 844 x 390** using installed
Chrome 154.0.8037.99 on Windows, DPR 1. All submissions were intercepted:
validation made zero requests, pending stayed disabled behind an explicit response
gate, failure retained entered values, and local 201 success focused the status
panel. Returning to the form restored Name focus and empty fields.

| Width | Content width after | Gutter | Form padding | Input height |
| --- | --- | --- | --- | --- |
| 320px | 288px | 16px | 18px | 48px |
| 360px | 328px | 16px | 18px | 48px |
| 390px | Approximately 358px | 16px | 18px | 48px |
| 430px | Approximately 398px | 16px | 18px | 48px |
| 844px phone landscape | 812px | 16px | 18px | 48px |

No horizontal overflow occurred. Before/after desktop geometry at 1363 x 936
matched exactly: the two-column grid/areas, paired Name/Email row, 28px form
padding, 40px desktop inputs, form/content dimensions, and footer bounds remain.

**Synthetic keyboard coverage is not physical keyboard coverage.** Simulated
VisualViewport events left 300px visible with a 24px offset in portrait and
180px visible in landscape. Name, Email, Subject, Message, and Send remained
inside those bounds with approximately 16px clearance, the footer/AI launcher
was hidden, and the launcher returned after blur/dismissal. This verifies the
layout response and event logic; it does not emulate an OS keyboard's rendering
or all Safari/Android viewport behavior.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 717 modules |
| `npm run test:landscape` | 10/10 pass |
| Full Playwright suite, local port 5175 | 102/102 pass without retries across desktop, tablet, and mobile Chromium |
| `git diff --check` | Pass |
| Compiled 320 x 568 production preview | 16px gutter, 18px padding, 48px inputs, intercepted success, correct payload/honeypot, restart focus pass |

Seven new Contact scenarios run in each browser project: five widths/state flows,
portrait/landscape visual-viewport handling, and desktop preservation. Existing
selected-project layout, fallback, reversal/focus, AI/header, CMS, gallery,
Contact, Job Match, admin, and navigation regressions also pass. No new GPU or
performance claim is made for this Contact-only change.

## Screenshots and reports

The [Contact evidence directory](docs/design/engineered-landscape-contact) includes
live before captures, local before/after captures, and intercepted state captures.
After images show the full naturally scrolling document; before images show the
old viewport shell and its clipped inner scroll area, without stretching images
to equal heights.

| Size | Before/after comparison | Focused | Validation | Pending | Failure | Success |
| --- | --- | --- | --- | --- | --- | --- |
| 320 x 568 | [Compare](docs/design/engineered-landscape-contact/comparison-320x568.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-320x568-success.jpg) |
| 360 x 800 | [Compare](docs/design/engineered-landscape-contact/comparison-360x800.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-360x800-success.jpg) |
| 390 x 844 | [Compare](docs/design/engineered-landscape-contact/comparison-390x844.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-390x844-success.jpg) |
| 430 x 932 | [Compare](docs/design/engineered-landscape-contact/comparison-430x932.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-430x932-success.jpg) |
| 844 x 390 | [Compare](docs/design/engineered-landscape-contact/comparison-844x390.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-focused.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-validation.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-pending.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-failure.jpg) | [View](docs/design/engineered-landscape-contact/after-844x390-success.jpg) |

Machine-readable reports: [live baseline](docs/design/engineered-landscape-contact/live-before-review.json),
[local baseline](docs/design/engineered-landscape-contact/before-review.json),
[after geometry](docs/design/engineered-landscape-contact/after-review.json),
[intercepted states](docs/design/engineered-landscape-contact/states-review.json),
[synthetic viewport checks](docs/design/engineered-landscape-contact/keyboard-review.json),
and [compiled preview](docs/design/engineered-landscape-contact/build-review.json).
The synthetic viewport captures are explicitly labelled and cropped to their
simulated visible area; they are not screenshots of a physical keyboard.

## Remaining limitations

- Physical iOS Safari and Android keyboards, address-bar transitions, autofill,
  pinch zoom, and device-specific viewport panning still need device review.
- The fix is not deployed; the production page remains subject to its current
  deployed CSS until a separately authorized deployment. No PR was merged.
- Production mail delivery was intentionally not tested. All pending/failure/
  success results use intercepted browser responses; no live database content
  changed.
- The existing lazy motion chunk advisory remains unchanged at 502.76kB
  (126.82kB gzip). No threshold, motion engine, or selected-project asset changed.

---

# Engineered Landscape selected-project refinement (dd708c3 baseline)

Date: 8 October 2026. Status: **implemented and verified locally on actual WebGL hardware, with separate fallback coverage; ready for draft PR review**.

## Scope and branch

Read the repository AGENTS.md and RTK.md, inspected the original checkout and
the existing integration worktree, fetched remote refs, and reviewed current
commits/open PRs. The latest available Engineered Landscape code is
`f3fa087f2d3fc9babe47a575d0f9756c1f6547b8`; remote promotion branches had not moved
beyond the previously recorded integration. The dedicated
`refine/engineered-landscape-selected-views` branch starts at `f3fa087` and targets
`fix/engineered-landscape-live-review` (draft PR #5), retaining all its fixes.

Reviewed the three supplied `selected-title-01-jobpilot.jpg`,
`selected-title-02-construction.jpg`, and `selected-title-03-lobby.jpg` images as
evidence of the existing defects. The user's requested composition and copy
define the implementation, rather than any inferred instructions in the images.
No merge, deployment, production Contact submission, or live database write was
performed. The original main checkout and untracked handoff remain untouched.

## Implemented composition

The selected screenshot and caption now share an 880px maximum, 88%-width
responsive frame. A reserved image slot uses `object-fit: contain`, with the
complete image aligned to its left/bottom edges. It adds no cropping, border,
or decorative browser frame. The caption starts 24px below the image slot, with
52px desktop / 32px mobile titles and readable tight line height. Title/category
and controls occupy separate rows, so title length cannot squeeze navigation.
Preview choices stay on one horizontally scrollable row when space is limited.
The CTA stays on one line, exceeds 180px wide and 44px high, and fills the mobile
frame. Only selected views use natural document height and vertical scrolling.

Collection and selected-view presentation labels now read:

| Title | Category |
| --- | --- |
| JobPilot AI | AI career workspace |
| Lobby | Real-time communication |
| Cedar Construction | Project operations & accounting |

Full CMS names remain available in accessible descriptions when the display name
differs, screenshot alt text, readers, URLs, and AI context. All original CMS
names/descriptions, real screenshot sources, case-study content, and other pages
remain intact. The visible Cedar label supersedes the earlier `Construction OS`
presentation label in the historical review below.

## Motion and image readiness

The caption uses a restrained upward mask reveal after the screenshot transition
and WebGL fade settle. Its layout space exists throughout loading and animation.
Reversal, Escape, keyboard selection, chapter switching, focus restoration,
reduced motion, articulation geometry, joints, materials, palette, portrait, and
existing motion durations are preserved.

Cold CMS PNGs were observed painting partially during the handoff. The opening
sequence now waits for the first preview's browser decode, with a restrained
loading status in the reserved slot. Chapter changes keep their reserved image
space and hide incomplete images until decoded. A failed image exposes a useful
status and retains the case-study and Collection controls; Escape works during
loading. Image readiness does not restart the selection on chapter switching.

The WebGL target is measured from the reserved, untransformed image frame.
A camera ray maps its center onto the assembly plane, and the existing movement
interpolates from the original sculpture position to that target. Measurements
update when the stage or shared frame resizes. The three models and articulation
paths themselves are unchanged.

## Verification results

Captured all three settled views before and after at **1363 x 936, 1280 x 720,
390 x 844, and 320 x 568**, DPR 1, using headed installed Chrome 154.0.8037.99 on
Windows. Every settled after-view used `data-renderer="webgl"` and an actual
WebGL 2 canvas with this device renderer:

`ANGLE (Intel, Intel(R) UHD Graphics (0x00009A60) Direct3D11 vs_5_0 ps_5_0, D3D11)`.

Visually reviewed the complete screenshots, titles, category spacing, and
control rows across the twelve layouts. Before desktop title/image left edges
differed by approximately 191px at 1363px width and 179px at 1280px. After the
refinement, the measured difference is **0px** in every layout, with **24px**
caption spacing. All three projects share the same caption position at each
tested size. Responsive image candidates can differ in resolution as the frame
width changes; their source captures and aspect ratios remain unchanged.

| Viewport | Title | CTA | Document behavior |
| --- | --- | --- | --- |
| 1363 x 936 | 52px | Approximately 186 x 53px, one line | Fits the viewport |
| 1280 x 720 | 52px | Approximately 186 x 53px, one line | Approximately 852px document; normal vertical scrolling |
| 390 x 844 | 32px | Full frame width, approximately 344 x 53px | Fits the viewport |
| 320 x 568 | 32px | Full frame width, approximately 282 x 53px | Approximately 668px document; normal vertical scrolling |

Actual GPU opening/handoff/reversal recordings and frame samples confirm that
each caption remains at one document position and appears only after the rig is
settled and the image has full opacity and its final transform. Keyboard chapter
switching changed the screenshot for all three projects without moving the
caption. Every reversal restored the originating button's focus and left zero
canvases. Resizing during opening to 320 x 568 retained WebGL and reachable
controls; Escape during opening succeeded. Navigating to Profile during opening
disposed the canvas. Deliberate context loss exposed fallback. No page exceptions
occurred. These are functional/timing observations, not a fresh performance
benchmark or a claim about another device's GPU.

Separately forced unavailable WebGL at 320 x 568 for all three projects. Each
photographic fallback retained the complete preview, caption, case link, reversal,
and focus restoration, with zero canvases. Reduced-motion and slow/failed-image
regressions passed across all three automated browser projects.

| Required check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 715 modules |
| `npm run test:landscape` | 10/10 pass |
| Full Playwright suite with local base URL on port 5175 | 81/81 pass, no retries; desktop, tablet, mobile Chromium |
| `git diff --check` | Pass |
| Compiled production preview at 320 x 568 | Aligned Cedar composition, full-width single-line CTA, reduced motion, and intercepted AI stream pass |

New regressions verify all three views at all four sizes, complete image loading,
contain behavior, caption spacing/alignment, exact presentation copy, full
accessible names, title sizes, CTA text line count/dimensions, scrolling reach,
chapter switching, focus restoration, fallback reveal order and reserved space,
and slow/failed-image recovery. Existing AI/header, CMS reader, gallery, Job Match,
Contact, admin, and navigation regressions also pass. The production-preview
assistant fixture verifies the original construction slug plus JSON Content-Type
and streaming Accept. This refinement made no new production AI-service requests.
Contact/admin writes remain intercepted fixtures only.

## Screenshot and recording evidence

All raw before/after captures are in
[`docs/design/engineered-landscape-selected`](docs/design/engineered-landscape-selected).
Short-screen captures include the full naturally scrolling document; they are
not represented as content fitting entirely within the shorter viewport.

| Project | Desktop before/after | Short mobile before/after |
| --- | --- | --- |
| JobPilot AI | [Comparison](docs/design/engineered-landscape-selected/comparison-jobpilot-1363x936.jpg) | [Comparison](docs/design/engineered-landscape-selected/comparison-jobpilot-320x568.jpg) |
| Lobby | [Comparison](docs/design/engineered-landscape-selected/comparison-lobby-1363x936.jpg) | [Comparison](docs/design/engineered-landscape-selected/comparison-lobby-320x568.jpg) |
| Cedar Construction | [Comparison](docs/design/engineered-landscape-selected/comparison-cedar-1363x936.jpg) | [Comparison](docs/design/engineered-landscape-selected/comparison-cedar-320x568.jpg) |

| Project | 1280 x 720 after | 390 x 844 after | Separate fallback |
| --- | --- | --- | --- |
| JobPilot AI | [Capture](docs/design/engineered-landscape-selected/after-jobpilot-1280x720.jpg) | [Capture](docs/design/engineered-landscape-selected/after-jobpilot-390x844.jpg) | [Capture](docs/design/engineered-landscape-selected/fallback-jobpilot-320x568.jpg) |
| Lobby | [Capture](docs/design/engineered-landscape-selected/after-lobby-1280x720.jpg) | [Capture](docs/design/engineered-landscape-selected/after-lobby-390x844.jpg) | [Capture](docs/design/engineered-landscape-selected/fallback-lobby-320x568.jpg) |
| Cedar Construction | [Capture](docs/design/engineered-landscape-selected/after-cedar-1280x720.jpg) | [Capture](docs/design/engineered-landscape-selected/after-cedar-390x844.jpg) | [Capture](docs/design/engineered-landscape-selected/fallback-cedar-320x568.jpg) |

Evidence reports: [before geometry](docs/design/engineered-landscape-selected/before-review.json),
[after geometry](docs/design/engineered-landscape-selected/after-review.json),
[actual GPU motion and separate fallback](docs/design/engineered-landscape-selected/motion-review.json),
[compiled preview](docs/design/engineered-landscape-selected/build-review.json), and
[opening, chapter switching, reversal, resize, and Escape recording](docs/design/engineered-landscape-selected/selection-motion.webm).
Opening/handoff/reversal stills are included beside the reports.
The [collection copy and loading-Escape review](docs/design/engineered-landscape-selected/collection-review.json)
also records all four collection sizes and focus restoration while an image
request is deliberately held, with zero remaining canvases.

## Remaining gaps

- Physical iOS/Android, Safari, browser-chrome viewport changes, and touch-device
  GPU qualification remain unverified. Mobile sizes here are Chromium viewport
  emulation on the Windows Intel GPU.
- No deployment or post-deployment frontend verification was performed. This is
  a draft PR stacked on the available `f3fa087` code, not a promotion or merge.
- Remote CMS image latency can delay the opening while the image decodes; the
  loading state and Escape remain available. Backend/CMS images were not edited.
- The existing 500kB Vite advisory remains for the lazy motion chunk, now
  502.76kB (126.82kB gzip) after image-position mapping. No threshold was raised.
- Production Contact delivery and live database writes were intentionally not
  tested. The read-only CMS snapshot/QA adapter stays outside application source;
  no secrets, signed tokens, PDFs, or dist artifacts are committed.

---

# Engineered Landscape live-review fixes (historical f3fa087 baseline)

Date: 8 October 2026. Status: **all four requested fixes implemented and verified locally; ready for draft PR review**.

## Review source and branch

Read the complete supplied `Engineered_Landscape_Live_Review_2026-10-08.html`
from Downloads and visually inspected all ten embedded screenshots. Its findings
were used as evidence for the user's requested fixes; the user's instructions
define the scope and prohibit merge, deployment, production Contact submissions,
and live database changes.

Inspected the branch, commits, remote refs, and open PRs before implementation.
The dedicated `fix/engineered-landscape-live-review` branch starts at integration
commit `31dc81bc3fbef6a36820ac8d808be8769065f4c0`, including the streaming whitespace
fix `3a09264`. It targets `feat/engineered-landscape`, the head of existing draft
PR #4. The original checkout and previous integration evidence remain intact.

## Fixes in requested order

1. **Assistant request headers.** `apiResponse` now builds a native `Headers`
   object and applies it after spreading the caller's options. Streaming POSTs
   preserve both `Content-Type: application/json` and `Accept: text/event-stream`.
   All three `HeadersInit` forms, case-insensitive explicit content types,
   caller credentials, FormData boundaries, and admin unauthorized events are
   covered. The JSON-header regression failed against the previous code.
2. **Screenshot gallery.** `CaseGallery` imports its own stylesheet. Removed its
   orphaned rules from the former project page and competing global overrides.
   A bounded dialog grid keeps the header, scrollable image region, 84 x 56px
   thumbnail buttons, and footer inside the viewport. Close/navigation targets
   remain at least 44px. Fit width, actual-size scrolling, thumbnail selection,
   arrow keys, Escape, and focus restoration remain functional.
3. **Construction collection label.** The sculpture uses the display title
   `Construction OS` at the accepted label size. Its accessible description,
   project reader, route, selection content, and CMS name still use the full
   `Construction Project Management & Accounting System` name. No CMS record
   was edited.
4. **Metadata and search spacing.** Team size is a nonbreaking phrase in a
   wrapping role row. The Projects input explicitly reserves 40px on the left
   for its positioned 16px icon, including narrow widths.

The accepted palette, sculptures, motion engine/timelines, portrait, CMS hooks,
backend validation/security, and existing features are preserved. No production
adapter or fixture content was added to application source.

## Checks and browser results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 714 modules |
| `npm run test:landscape` | 10/10 pass |
| Playwright full suite, local base URL on port 5175 | 63/63 pass across desktop, tablet, and mobile Chromium |
| `git diff --check` | Pass |
| Built production preview on port 5176 | Mobile gallery CSS loaded, controls visible, JSON + streaming headers preserved, fixture stream completed |

New browser regressions check actual outgoing browser headers, multipart uploads,
gallery image loading and geometry, compact/full construction names, team phrase
line bounds, search icon separation, and real filtering. The assistant fixture
now rejects missing request headers instead of masking the defect. A rerun
exposed an existing Contact fixture's 150ms timing race; its response is now
released explicitly after verifying the disabled pending button. The final full
suite passed without retries. All Contact/admin writes in tests are intercepted.

Headed installed Chrome 154.0.8037.99 on Windows captured the public CMS snapshot
at 1363 x 936 (desktop) and 390 x 844 (mobile), DPR 1. Automated tests also cover
1024 x 1366, Pixel 7 emulation, and a 320 x 568 gallery/metadata resize.

| Layout evidence | Desktop | Mobile |
| --- | --- | --- |
| Gallery frame | 1260 x 900; fully inside viewport | Approximately 370 x 824; fully inside viewport |
| Close and footer navigation | Visible inside dialog | Visible inside dialog |
| Thumbnails | Small, decoded images | Small, decoded visible images; horizontal scrolling |
| Escape focus restoration | Pass | Pass |
| Search text-to-icon gap | 12px | 12px |
| Projects document horizontal overflow | None | None |

Screenshots were captured after decoding the visible gallery images. Public
remote PNG thumbnails took about 12 seconds to finish in one cold local run;
their underlying CMS image URLs and assets remain unchanged.

## Real assistant verification and QA correction

The earlier integration QA adapter forced `Content-Type: application/json` when
forwarding requests, which masked the client header defect. That limitation
invalidates the earlier report's inference that the deployed client transport
was correct. For this review, the external, local-only adapter forwards the
browser's actual Content-Type and Accept values. It serves read-only public CMS
snapshots and blocks Contact and all other writes.

The fixed client received genuine HTTP 200 completed streams for both general
and JobPilot-specific questions, with JSON + streaming headers, correct project
context, and usable case-study links. A deliberately malformed text/plain
request received the genuine upstream HTTP 415 `Content-Type must be
application/json.` response, proving that forwarding no longer bypasses header
validation. On mobile, a locally intercepted first-response 503 exposed
`Try again`; the subsequent real upstream retry returned 200, preserved both
headers and `jobpilot-ai` context, and produced a completed answer with its case
link. No page exceptions occurred. These results verify the fixed local client
against the existing published backend; they do not claim a deployment.

Machine-readable evidence:
[layout and real assistant results](docs/design/engineered-landscape-live-review/browser-review.json),
[real retry](docs/design/engineered-landscape-live-review/assistant-retry.json),
[compiled build smoke](docs/design/engineered-landscape-live-review/build-smoke.json).

## Screenshots

| View | Desktop / comparison | Mobile |
| --- | --- | --- |
| Collection label | [Before/after](docs/design/engineered-landscape-live-review/collection-comparison.jpg) | [Collection](docs/design/engineered-landscape-live-review/mobile-collection.jpg) |
| Screenshot gallery | [Before/after](docs/design/engineered-landscape-live-review/gallery-comparison.jpg) | [Fit width](docs/design/engineered-landscape-live-review/mobile-gallery.jpg), [actual size](docs/design/engineered-landscape-live-review/mobile-gallery-actual.jpg) |
| Full Construction name | [Reader](docs/design/engineered-landscape-live-review/desktop-construction-reader.jpg), [gallery](docs/design/engineered-landscape-live-review/desktop-construction-gallery.jpg) | [Reader](docs/design/engineered-landscape-live-review/mobile-construction-reader.jpg), [gallery](docs/design/engineered-landscape-live-review/mobile-construction-gallery.jpg) |
| Case metadata | [Before/after](docs/design/engineered-landscape-live-review/case-metadata-comparison.jpg) | [Metadata](docs/design/engineered-landscape-live-review/mobile-case-metadata.jpg) |
| Projects search | [Before/after](docs/design/engineered-landscape-live-review/projects-search-comparison.jpg) | [Search](docs/design/engineered-landscape-live-review/mobile-projects-search.jpg) |
| Real assistant | [General](docs/design/engineered-landscape-live-review/live-assistant-general.jpg), [JobPilot](docs/design/engineered-landscape-live-review/live-assistant-jobpilot.jpg) | [Retry error fixture](docs/design/engineered-landscape-live-review/mobile-assistant-retry-error.jpg), [real retry success](docs/design/engineered-landscape-live-review/mobile-assistant-retry-success.jpg) |

## Remaining limitations

- Physical iOS Safari and Android device layouts, touch/keyboard behavior,
  browser UI viewport changes, and GPU/motion qualification remain unverified.
  Chromium emulation is not physical mobile-device evidence.
- No fresh motion performance benchmark was taken for this scoped fix; the
  unchanged engine retains the integration measurements below. Award/readiness
  claims still require the earlier outstanding device review.
- These fixes have not been deployed. Production frontend verification remains
  pending a separately authorized deployment. No PR was merged.
- Production Contact delivery and live database writes were intentionally not
  exercised. No secrets, signed tokens, PDFs, dist output, or QA adapters are
  included in this change.
- The existing lazy Three.js chunk is 501.11 kB (126.26 kB gzip), producing the
  existing Vite 500 kB advisory. The threshold and engine were not changed.

---

# Engineered Landscape integration QA (historical baseline)

Date: 8 October 2026. Status: **integrated and locally reviewed on actual WebGL hardware; real mobile-device qualification remains open**.

## Scope and source

The user supplied the correct articulated prototype at
`C:/Users/Admin/Downloads/Engineered_Landscape_Articulated_WebGL_2026-10-08/engineered-landscape`.
Read its AGENTS.md, README.md and design-qa.md, the repository instructions, RTK.md
and handoff before implementation. Earlier Complete Preview artifacts contained
only a 2.5D implementation; that mismatch is resolved by the corrected path.

The integration uses a separate worktree at
`C:/Users/Admin/Desktop/portfolio-engineered-landscape` on `feat/engineered-landscape`,
based on `origin/feat/minimal-scroll-portfolio` commit
`4ef93dc127e47e76aedab9f121f089e3f2655cbc`. PR #3 commit
`22039218821ea0e6966fcba5a457940fdda51fd5` was incorporated as `3a09264`.
The original main checkout and its untracked handoff remain untouched.
No existing PR was merged, no deployment or production settings change was made,
no live database content changed, and no production Contact message was submitted.

## Actual GPU review and fixes

Prototype npm ci, production build and all 11 prototype tests passed.
Used headed installed Chrome 154.0.8037.99 through Playwright without graphics
override flags or security changes, Windows x64, Intel Core i7-11850H,
1363 × 936 CSS pixels at DPR 1. Each actual mounted `.motion-rig` reported
`data-renderer="webgl"` and contained a WebGL 2 canvas. Its renderer was:

`ANGLE (Intel, Intel(R) UHD Graphics (0x00009A60) Direct3D11 vs_5_0 ps_5_0, D3D11)`.

Observed opening, settled screenshot reveal and reverse for JobPilot, Lobby and
Cedar in the GPU browser and recordings. This evidence is actual application
rendering, distinct from the packaged historical CPU/SVG geometry diagnostics.
Only the WebGL engine and photographic fallback were ported to the application.

Resolved defects:

1. JobPilot sheets intersected and detached while translating. Reduced angular
   sector widths, extended sheet roots to their hinges and rotated around fixed
   base pivots. Lobby band paths now occupy separate depths. Mesh thickness,
   pins, metal response and floor shadows were inspected in actual GPU frames.
2. Materials were too bright and mesh arrival jumped from photographic artwork.
   Corrected oxide/forest colors, light intensity and exposure; register the
   initial assembly against the artwork's DOM bounds before moving to center.
   Start the fade at 1.35 seconds and align reverse with the return transition.
3. Narrow framing and resized DPR needed correction. Camera distance adapts
   to aspect; DPR is recomputed and capped at 1.25 narrow / 1.5 desktop.
4. A settled timeline could resume when the document became visible. Settled
   rigs now remain idle. Context loss stops motion and exposes photographic
   fallback; disposal releases geometry, materials, shadows and environment.
5. Existing public styles collided with Contact and the project index. Scoped
   the accepted styles, supplied compatible theme tokens and preserved the
   existing functional form/report components inside the new visual shell.
6. Collection navigation from a case lost the originating sculpture's focus.
   Header/footer/identity navigation now carries the return slug; opening and
   closing timelines also withstand Escape during selection initialization.

## Integrated GPU measurements and stress

`docs/design/engineered-landscape/integrated-gpu.json` records six selection/return
cycles, two for each rig. Opening default-framebuffer clear timestamps were
measured without screenshots or video in that measurement run. Intervals at or
below 2 ms are setup/multiple-clear calls and excluded; larger intervals are
retained. Across the final six cycles, median render spacing was 16.6–16.7 ms and p95 was
17.2–17.3 ms. A concurrent build/browser-test stress run had p95 of 24.9–28.3 ms
in its first three cycles (`integrated-stress.json`), then 17.1–17.3 ms after that
load subsided. These are CPU-side render-call intervals, not GPU timer queries or
a promise of performance on another machine. Cold engine download/shader setup
is outside this animation interval statistic.

Each settled rig emitted **zero renders during a 700 ms idle window**. Every
return restored the originating button's focus and left zero canvases. Eight
contexts were created and eight received context-loss events after cleanup or
the one deliberate loss test. Resizing during opening retained actual WebGL;
navigation during opening left zero canvases. No page exceptions occurred.
The engine was absent from network resources in a separate cold Chrome page
without pointer interaction; all GPU evidence above came from the headed browser.
Hover/focus prewarms its dynamic import. Earlier headed probes inadvertently
hovered an artwork and correctly triggered that prewarm.

Forced no-WebGL at 390 × 844 produced zero canvases and a usable photographic
selection with a case link. Reduced-motion keyboard tests produced zero canvases.
An intentionally failed engine import also reached the labelled photographic
fallback with zero canvases and a working case link (`route-fallback-review.json`).
Prototype repeated selection, mid-opening resize and navigation during loading
also passed (`prototype-stress-report.json`). Prototype pacing with screen/video
capture overhead is recorded separately and is slower than the dedicated run.
A prototype favicon 404 was observed; no application GPU failure accompanied it.

## CMS and real services

Production components consume the existing hooks/API client. No prototype
content.js records or network bridge were copied into application source.
All eight published CMS records and slugs remain available in gallery/index,
search and complete case readers: JobPilot AI, Lobby, GameZone Arena,
Construction Project Management & Accounting System, UniHub, Full-Stack User
Management System, Medicare Hub and Home Services. Existing screenshot galleries,
engineering evidence, project links, `/cv`, admin/auth and backend schema remain.
Profile uses CMS identity, experience, education, certifications, technologies
and skills. Its supplied mask/crop uses the unchanged original photograph:
SHA-256 `e6af23208df8739c79c2b379c418a182a0d65e20c184bc6e1626b85ba99c2b05`.
Manrope, IBM Plex Mono and the accepted seven palette colors are retained.
Longer CMS titles/descriptions intentionally replace the shorter design fixture.

For browser-only local QA, an adapter outside this repository served a read-only
snapshot of the published public CMS, cached the genuine public CV, and forwarded
only assistant/job-match/tailored-CV requests to the existing published service.
It rejects Contact and all other writes and is not a production dependency.
The application itself uses the same-origin `/api` routes and normal API client.

Real general and JobPilot-specific assistant requests returned HTTP 200 and
completed answers. Verified project evidence links and the genuine `/api/cv.pdf`
PDF signature; CMS resumeUrl is currently null. Added placeholder/unsafe-link
guards and kept the real fallback endpoint. `live-assistant.json` and its two
captures record the results. The deployed upstream predates PR #3: its whitespace
behavior is not being claimed as deployed fixed. Backend and browser decoder
regressions prove whitespace preservation in this branch. The drawer retains
streaming, project/general history, native modal focus management, stop/route
cancellation, 55-second timeout, visible errors and retry. No offline AI replies.

The actual Job Match service returned HTTP 200 and a 2,089-character rendered
report with real Lobby, UniHub and GameZone evidence links. Its signed-token
tailored CV downloaded as a valid 30,825-byte `%PDF-` document. The signed token
and PDF were not committed or recorded. Copy/export and route continuity were
also tested with intercepted contracts. See `live-job-match.json` and capture.
Contact's existing name/email/subject/message/website payload, honeypot,
validation, loading, retained-error values and success focus passed with local
intercepted fixtures only. Existing security, validation and rate limits remain.

## Visual artifacts and validation

All review artifacts are under `docs/design/engineered-landscape/`:

- `collection-comparison.jpg`, `profile-comparison.jpg`: source and runtime
  together at equal 1363 × 936, DPR 1, with a 48px label strip. CMS content
  differences are intentional; portrait, composition, palette and hierarchy
  are compared at matching viewports. Source captures wait for settled artwork.
- `integrated-motion.webm`, `prototype-motion.webm`: actual headed-browser motion
  recordings. These are visual review evidence, not timing benchmark runs.
- Opening/spread/reverse frames, settled selection, all main public surfaces,
  assistant and live services; responsive collection/profile/contact/job-match/
  Lobby and forced photographic fallback at 390 × 844.

Passed: typecheck, lint, production build, all 51 Playwright tests across desktop,
tablet and phone viewports, and all 10 landscape/backend streaming/CV-link unit
tests. The static Application CV reference geometry/content check also passed;
its fixture and CV layout were unchanged. Browser coverage includes all eight deep links at 320px, gallery zoom,
admin structured updates, keyboard selection/return, interrupted selection,
assistant context/whitespace/retry/stop, intercepted Contact, Job Match export and
token-gated CV. No horizontal body overflow was observed in the captured narrow
surfaces. Build emits a size advisory for the lazy Three engine (501.11 kB
minified / 126.26 kB gzip); no warning threshold was raised.
Final collection and CV/terminal changes passed their relevant six-test browser
subsets again. The standalone `/cv` route retained its real PDF preview and
visible download control at desktop and narrow widths.

## Remaining qualification

No physical phone/tablet, mobile GPU, Safari/iOS/Android, touch latency, battery
or thermal measurements were available. Responsive desktop-browser viewports
are not real-device evidence. Cold-load startup and GPU execution time are not
benchmarked. Live upstream behavior can change independently of this branch.
No award-level polish or deployment acceptance is claimed. Review the recordings
and qualify actual target devices before release.

---

# Historical refinement QA (preserved from the base branch)

# Three-device projects and split hero — design QA

final result: passed (readability and motion refinement, 2026-10-06)

## Source and scope

Source visual truth: user attachment `jobpilot(1).png`, Library identity `libfile_33dc29c416d08191bfefbee283b48712`; local input `../attachments/219e89cc-6243-4a71-90b0-e2af665173fc/jobpilot.png` (1254 × 1254).
The approved target is the device arrangement only: central laptop, front-left phone, front-right tablet. The user explicitly removed promotional scenery, slogans, features, stack and role paragraphs; retain project title, Explore project, Selected work and View all projects. Real CMS screens replace the attachment's illustrative interfaces.

Implementation screenshots: `docs/design/three-device-showcase/projects-desktop.jpg`, `projects-mobile.jpg`, `split-hero.jpg`.
Desktop viewport 1353 × 929 CSS pixels, capture 1353 × 929; mobile review 390 × 844 CSS iframe (380px content with scrollbar) and narrow 320 × 844 (310px content). Browser captures are 1× density. Mobile proof includes review chrome; no density precision is claimed for the outer screenshot.
Comparison: `docs/design/three-device-showcase/reference-comparison.jpg` places the source device region and rendered desktop composition together, preserving both aspect ratios inside equally sized panels. It excludes the poster's intentionally removed marketing material. This is composition comparison, not a claim of pixel-identical app content or hardware.

## Findings and iteration history

- [P2, fixed] Initial side-device crops started too far into desktop captures and cut primary screen headings. Reduced scaling, aligned crops to the main content and limited crop offset on long screenshots. Later desktop capture shows Your resumes and Live voice interview as distinct visible products; long GameZone/Cedar screens retain more of the interface. These are authentic desktop-derived detail crops, not native responsive captures.
- [P2, fixed] Global paragraph line height created excessive space between Software and Engineer. Explicitly scoped hero display line height now keeps the two lines together.
- [P2, fixed] Narrow Cedar caption pushed Explore project outside the section's intended padding. At <=380px, title and link stack; all five link right edges are 131.45px inside the 310px content width.
- [P2, fixed] Floating assistant overlapped the lower-right device. Hide the closed launcher while a project preview is active; preserve an already open assistant and contact access.
- Hardware uses generated raster frame assets, not CSS-drawn devices. Measured screen masks cover the matte; raster frame grayscale removes colour fringes without touching project screenshots. Final comparison shows a large laptop and two unobstructed separate devices.

## Required fidelity surfaces

- Typography: portfolio Inter/Instrument Serif preserved. Split hero title has one accessible h1 and visible left/right fragments; right display line-height .98. Project headings remain clear at 28–44px; narrow titles get their own row. The illustrative poster typography is not substituted for real app text.
- Spacing/layout: desktop devices overlap as in the selected reference; phone/tablet remain in front of laptop. Mobile uses laptop first, then two separate side devices; no horizontal overflow at 380 or 310 content pixels. Selected work has clear separation before the first project. Long project titles retain visible links.
- Colours/tokens: preserve approved midnight/ivory/champagne portfolio palette and original project UI branding. Promotional environment images are removed from this section.
- Image quality: all 15 CMS screenshots loaded successfully; three raster frames reused across five projects, roughly 717 KiB total. Screens have independent image elements, masks and GSAP timelines. Original full screenshots remain available in the viewer. Focused screen headings and viewer enlargement were inspected separately from the composition board.
- Copy/content: only project titles and Explore project remain per project. Section heading, View all projects and discreet accessibility motion control retained. No promotional claims, invented product data, role paragraphs or fabricated mobile UI.

## Interactions and verification

- Independent scrolling observed with three different transform offsets; laptop/phone/tablet timings staggered 1.1/1.7/2.3s and scroll durations 5.2/5.8/6.4s, with bottom hold and smooth return.
- Only the most visible project's previews run; offscreen and hidden-document previews stop. ResizeObserver recalculates real overflow; cleanup kills timelines and observers.
- Pause control stopped all running device previews. Resume restarted active previews. Current screen positions are retained while paused.
- Reduced-motion fixture rendered all 15 devices with zero running previews. Portrait turns are omitted when landing motion is disabled.
- Mobile screen click opened full-size gallery; Escape closed it. Desktop keyboard Enter also opened a screenshot. Explore project reached `/projects/jobpilot-ai` and browser Back returned to landing.
- App console error filter returned no errors; unrelated browser extension metadata errors excluded.
- Typecheck, ESLint, production build and git diff whitespace check passed.

## Responsive-screen correction — 2026-10-06

The earlier desktop-derived side-device crop was rejected by the user and is superseded. All ten phone/tablet slots now have separately rendered responsive assets. Five laptop slots retain their CMS screenshots. Width fitting and x=0 replace forced scaling/offsets for every device. Short images remain still; real vertical overflow alone drives scrolling. Device clicks append responsive captures to the original CMS gallery and open the selected capture.

Sources and exact capture sizes are documented in `docs/design/responsive-devices/capture-notes.md`. Public pages were used where dashboard access was unavailable. JobPilot and Cedar used read-only public DOM snapshots with the deployed sites' original styles because those sites disallow framing; no UI was invented and no authenticated data was accessed. UniHub uses public student registration and sign-in, not a claimed dashboard capture.

Fresh desktop and mobile proof: `docs/design/responsive-devices/desktop.jpg` and `mobile.jpg`. Browser checks confirmed 15/15 preview images loaded, ten responsive source slots, zero images wider than their masks, and no document overflow at 310, 380 or 1014 CSS content pixels. Phone enlargement opened `/projects/responsive/jobpilot-phone.webp`; pause stopped all running devices and resume restored the control state. Independent motion was observed with the tablet at y=-52.97px while the phone was at its own start/hold position. Typecheck, ESLint, production build and whitespace checks passed.

Signed-in dashboard screenshots can replace the public-page captures through the optional phone/tablet source mapping without changing the layout or animation renderer.


## Readability and motion refinement — 2026-10-06

- The screenshot gallery defaults to the full available width instead of shrinking tall captures to the viewport height. Its bounded image region scrolls vertically and can receive keyboard focus. Actual size remains an optional inspection mode; Fit width returns to the readable default. Changing screenshots or display mode resets the inspection region to the top.
- At 390px review width (380px document content), the JobPilot phone image renders at 312px wide instead of approximately 144px, with 998px image height inside a 462px scroll region. No horizontal scrolling in the default mode. At 320px review width (310px content), it fits the available 242px image region without horizontal overflow.
- ArrowDown scrolls the focused image region (observed scrollTop 40px). Next changes the selected screen and resets scrollTop to zero. Actual size / Fit width switch modes; Escape dismisses the modal. Desktop enlargement fits a 1249px-wide image region without horizontal overflow in default mode.
- Explore project now uses 14px semibold text, a restrained champagne underline and arrow, and a 44px minimum hit area. All five captions remain within the 310px narrow document width, with links wrapping beneath titles where required.
- Independent screen timelines now hold their starting view for 3 / 3.6 / 4.2 seconds, scroll over 7 / 8 / 9 seconds, hold the bottom for 3 seconds, and return over 2.4 seconds. Repeats add a 2-second hold. Hover with a mouse or keyboard focus pauses only that screen's existing timeline; leaving it resumes the same timeline. Touch pointer entry does not establish a persistent hover pause. Global pause, reduced motion, hidden-document and offscreen behavior remain active.
- Browser verification observed the phone preview at y=-160.2px; keyboard focus held that position while the tablet retained its running state. Moving focus resumes the phone and pauses the newly focused screen. The reduced-motion review fixture has zero running device previews.
- Proof: docs/design/readability-refinement/mobile-viewer.jpg (390 × 844 mobile review viewport, 1× density).
- Typecheck, ESLint and production build passed. Whitespace check passed. Existing CMS and responsive screenshot assets, split hero, colours and three-device composition are preserved. Authenticated workflow captures remain a separate content improvement.

## Editorial case studies and laptop fitting — 2026-10-06

final result: passed

This is the approved redesign of `/projects/:slug`, not a pixel clone of the rejected laptop stage. The rejection reference is `../upload/{EB72CC79-2D46-48DA-A372-8FC9CEE83726}.png` (1920 × 787). The new light-theme proof is `docs/design/editorial-case-studies/light.jpg` (1353 × 929 browser capture); it replaces the black hardware stage with the original product screenshot beneath a compact two-column introduction. These captures demonstrate the structural correction at different viewport sizes; no pixel-identical comparison is claimed.

- All eight CMS project routes render the editorial template without hardware in the detail hero. Original narrative, links, features, workflow, engineering evidence and chapter navigation are preserved. Projects without additional screenshots retain their existing cover asset; no product UI is invented.
- Six projects with genuine phone captures select those captures initially below 760px. Existing featured-project phone/tablet captures are reused. User Management adds a capture of its actual public registration form at a 390px browser viewport, cropped to the form card and converted to WebP. No form was submitted, no account was accessed, and it is labelled Mobile registration rather than an authenticated dashboard. Its live public statistics page remained loading during capture, so that page was not used as a new asset. Existing desktop CMS statistics capture remains intact.
- Desktop product hero uses full-width original screenshots, thumbnail tabs, crossfades and one gentle scrolling preview cycle for real overflow: 3-second opening hold, 7–12-second downward travel, 3-second bottom hold, 2.4-second return. Hover/focus, manual inspection, offscreen visibility, document visibility and reduced-motion settings govern playback. Short captures remain static. Portrait screenshots cap at 480px on desktop to avoid excessive enlargement.
- Desktop gallery walkthrough remains sticky at 104px and switches to the most visible numbered step. Browser scrolling changed JobPilot's active screen to Screen 03 and its matching CMS image. Mobile displays individual screenshot sections instead of the desktop sticky arrangement.
- Screen tabs support arrow keys, Home and End with roving focus; selected thumbnails scroll horizontally into view without moving the page vertically. ArrowRight selected Discover jobs from Prepare your resume.
- Native dialog enlargement uses fit-width vertical inspection, accessible controls, Escape dismissal, focus restoration, thumbnails and next/previous navigation. JobPilot phone inspection measured 310px width with no horizontal overflow, 992px image height and 552px viewport height. ArrowDown advanced scrollTop to 40px. Next switched to its tablet capture. Actual size loads the original asset directly; JobPilot's original measured 1899px wide. Native dialog provides modal focus containment.
- All eight routes checked at 320px review width (310px content). Existing chapter-navigation intrinsic sizing initially overflowed JobPilot, Cedar and User Management; constrained grid sizing fixed it. Rechecks measured scrollWidth = clientWidth = 310px. Tablet Cedar checked at 1024px review width (1014px content), with no overflow. JobPilot inspected at 390px review width (380px content). Dark and light themes were visually inspected. Reduced-motion fixture reports no running preview and no pause control.
- Landing keeps the requested three-device arrangement. All five laptop originals loaded and filled their 808 × 494px masks. JobPilot/Cedar rendered 1070 × 494, Lobby 1090 × 494, UniHub 1042 × 494, GameZone 808 × 855. Proportional cover fitting removes empty bands and retains the left navigation, cropping the right edge of wider images. Full originals remain available on enlargement; no image is stretched.
- Proof: `desktop.jpg`, `light.jpg`, `mobile.jpg`, `mobile-gallery.jpg`, `walkthrough.jpg` in `docs/design/editorial-case-studies`. Mobile proofs include the local review wrapper around a 390 × 844px iframe. Browser capture density is 1×; no export-resolution fidelity is claimed.
- No application console errors were found; browser-extension metadata messages were excluded. Typecheck, ESLint, production build and whitespace checks passed.

Remaining content limitation: authenticated phone/tablet dashboard captures can replace the public-page captures later. The CMS currently supplies only a cover for Medicare Hub and Home Services; the template does not fabricate extra screenshots for them.


## Final portfolio refinement — 2026-10-06

final result: passed

Approved visual direction: first desktop concept (`../generated_images/exec-b0a62ec0-df0a-4573-b86f-564f1d455bd1.png`, 974×1618) and third mobile concept (`../generated_images/exec-13777dfd-8470-42e7-ac27-ce1e8e3d3250.png`). Reference and rendered captures were inspected together. Normalized comparison boards in `docs/design/final-refinement/desktop-comparison.jpg` and `mobile-comparison.jpg` preserve aspect ratios and label each side. Desktop comparison crops the reference to the hero/capabilities region; mobile comparison crops decorative side canvas and the review wrapper to the app region. Browser captures are 1353×929 and 1363×936 at 1× density, with the mobile app inside a 390×844 iframe (380px content).

This implements the selected hierarchy, colours, serif/sans pairing, original portrait, primary enquiry action and readable mobile focus. It is not a pixel clone of generated mockup content. Intentional adaptations: original portrait pixels, real CMS copy and links, 44px controls, search/theme utilities, a compact desktop hero, and a hiring disclosure retain existing functionality. Capabilities avoid unsupported performance promises. Three curated projects lead to the full eight-project index; selection and new presentation copy are editable in the CMS editor through optional defaults. No database records were changed.

### Findings resolved

- P1: Duplicate sibling route keys caused duplicate navigation after client-side route changes. Unique route keys fix it; home → index → detail navigation now has one header.
- P2: Mobile hero hierarchy and actions did not match the chosen direction. Larger serif subtitle and separate primary/secondary buttons now precede the portrait.
- P2: Tiny three-device previews were difficult to inspect on phones. Mobile now selects one readable capture with Desktop/Phone/Tablet tabs, companion thumbnails and separate enlargement controls. Desktop keeps the three genuine scrolling screens.
- P2: Grid illustrations did not match the detail pages. Cards now use genuine CMS screenshots, choosing the same primary screen as the landing showcase where available; actual cover assets remain the fallback.
- P2: Light-mode navigation conflicted with fixed dark landing sections. Shared light colours now carry through the landing and index typography, borders and capabilities.
- P2: Mobile contact details displaced the form below the first screen. DOM and visual order are now introduction → form → contact details. The Name field is visible in the first viewport.
- P2: Closed assistant launcher overlapped screenshot and enquiry inspection. It hides while product captures are visible or the form has focus; an open assistant remains available.
- P2: Empty contribution data emitted a literal zero on cover-only projects. Boolean conditional fixes it.
- P2: The old reduced-motion fixture did not cover Motion's shorthand media query. The local fixture now covers both query forms; production uses the actual browser preference. Final review shows zero running previews and no pause controls under the fixture.

### Validation

- TypeScript, ESLint, production build and whitespace check passed after the final implementation.
- All eight case-study routes at 320px viewport (310px content) have scrollWidth = clientWidth, one header, a loaded primary hero asset and zero running previews in the reduced-motion fixture. Recorded in `narrow-route-checks.json`.
- Landing inspected at 390px and 320px, desktop at 1353px, and Cedar case study at 768px (758px content). No horizontal page overflow observed.
- Independent desktop transforms observed: laptop at 0px, phone at -0.32px, tablet at -70.8685px. Mobile phone scroll was also observed at -611.979px before manual inspection. Active/offscreen, global pause and manual inspection govern playback.
- Mobile tabs: ArrowRight selected Tablet; Home selected Desktop; gallery Escape returned focus to the triggering Expand button. Global pause recorded zero running previews.
- Project filter selected Personal and changed the visible count from eight to one. Hiring disclosure closes with Escape and restores summary focus.
- Contact validation focuses Name and exposes required-field errors. Local fixtures verified disabled Sending state, successful focused confirmation, and failure recovery with entered content retained. No production enquiry was sent.
- Application duplicate-key error was corrected and rechecked. Browser-extension metadata errors are unrelated to the application. Expected reduced-motion warning is from the local fixture.

### Content limitations

Phone/tablet assets are authentic existing responsive captures of public project pages, not invented authenticated dashboards. Medicare Hub and Home Services still have only their CMS cover asset. Replacing these with additional actual screenshots remains a content update, not fabricated proof.
