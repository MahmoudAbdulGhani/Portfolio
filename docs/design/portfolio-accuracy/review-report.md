# Portfolio accuracy and public-copy follow-up

23 October 2026. Stacked above PR #46 (`dc0c9ebac314a29a1b2fc95b50b086104dd025eb`). No live CMS/database writes or production deployment. The handoff and PR #45 historical findings are preserved.

## Findings and changes

The Job Match result's recruiter summary previously travelled in the signed download token into the PDF's Professional Summary. This was a data-contract problem, not a list of undesirable phrases. The download now signs a bounded source-key candidate plan and project slugs, never the assessment. Export validates that plan again against current records; invalid, stale, oversized or legacy freeform inputs receive the approved factual summary. Recruiter evaluations remain in the comparison report. Candidate summaries do not claim certification, and AWS training remains in training.

Shared model instructions preserve recorded employment types and date precision. Experience references resolve to source records rather than accepting model-authored employment labels. Only an explicitly recorded internship label supplies that type; month ranges never establish an exact duration. Assistant and both Job Match transports receive these rules. This reduces unsupported inferences; generative assessment prose is not guaranteed factual merely because instructions were supplied.

Project selection is bounded to configured, published CV projects and ranked by recorded stack overlap and documented team relevance. It neither pads the PDF nor silently overrides CV settings. The genuine sample selected JobPilot, Lobby and GameZone; co-developed work and personal contributions remain distinguished. Private production CV settings were not read.

The application CV used fixed section anchors even when projects were omitted. Tailored exports now flow from actual section bottoms with page reservation, hanging skill-line wrapping and continuation pages. The standard application CV's measured geometry and master CV remain unchanged. Controlled one-project gap: **87.4pt before → 9.8pt after**. Zero, one and three compact projects fit one Letter page; an explicitly synthetic long fixture flows to two pages without missing text. The genuine provider-result PDF uses two pages because the frozen public source contains an expanded skill catalog. An initial candidate overflow was rejected and preserved as labelled evidence; the corrected export stays within margins.

| Public content | Before | After |
| --- | --- | --- |
| Digital Hub | Developing / implementing; location repeated in prose and metadata | Completed / Developed / implemented; Jun–Sep 2026 retained, metadata retained, duplicate display suppressed |
| FALA | “procedural engineering logic” | Mentored developers in programming logic and component-based workflows; guided project structure and deployment practices, grounded in existing CV bullets |
| Medicare opening | Personal ownership remains undocumented | Appointment selection, confirmation and history product description |
| Home Services scope | Internal personal-attribution review note | Known navigation/backend limitations and no invented conversion/customer/performance claims |

These are shared read-time corrections, verified after reload with deliberately stale fixture prose. Supplied-design credit, team attribution, clinical/security limitations and internal authorship/evidence metadata remain available. No portrait assets, controller, animations, sculptures or layout styles changed.

## Methods and evidence

- [Before](before/browser-findings.json) is the actual public frontend, with a frozen read-only public GET snapshot; [after](after/browser-findings.json) is the ordinary compiled candidate build. No deployment-SHA identity claim for the before captures. Both cover Profile/Digital Hub, Medicare and Home Services at 320, 390, 430, 768 and 1440px, plus FALA at phone/desktop. No sampled horizontal overflow or page errors. These are Chrome viewport emulation, not physical devices.
- Representative Profile: [phone before](before/390-profile-hub.jpg), [after](after/390-profile-hub.jpg); [desktop before](before/1440-profile-hub.jpg), [after](after/1440-profile-hub.jpg). FALA: [before](before/390-profile-fala.jpg), [after](after/390-profile-fala.jpg). Case studies: [Medicare before](before/1440-medicare-opening.jpg), [after](after/1440-medicare-opening.jpg); [Home Services before](before/320-home-scope.jpg), [after](after/320-home-scope.jpg).
- Controlled PDF reproductions use the old PR #46 renderer and corrected renderer with the same static records: [methods](pdf-methods.json), [measured bounds/text/hashes](pdf-review.json), [one-project before PDF](before/one-project-layout.pdf), [after PDF](after/one-project-layout.pdf), [before render](before/one-project-layout-page-1.png), [after render](after/one-project-layout-page-1.png). The assessment-leak fixture is synthetic, not the user's original production PDF. Long content is explicitly synthetic.
- Genuine configured Gemini was called through a local Express server using frozen public records and fail-closed in-memory Prisma/rate-limit/CV-setting substitutes. No live DB access or writes. [Before provider observation](before/real-provider.json) returned upstream 503; [after Job Match](after/real-provider.json) succeeded via SSE in 14.507s and produced an actual signed HTTP PDF download. [Final PDF](after/real-provider-tailored.pdf), [page 1](after/real-provider-tailored-page-1.png), [page 2](after/real-provider-tailored-page-2.png); SHA-256 `75ae7018e70d039c4d85e6806b736a34d15fa458b82d11413e38f2bef499f200`. The same genuine result was re-exported after skill wrapping, without another model generation. Initial rejected PDF remains explicitly named `*-initial.*`.
- Actual assistant JSON and one explicit SSE attempt returned upstream 503 ([SSE observation](after/real-assistant-stream.json)). Genuine assistant-answer grounding remains unverified; shared prompt/transport grounding has focused mocked route coverage. Local 503s are consistent with a transient provider issue, not proof of the historical production error's cause. Production request logs were unavailable.

Error handling now keeps the existing 40-second provider deadline active through response-body reading. Safe request IDs and phase/kind/timing diagnostics omit prompts and credentials. SSE cancellation follows response closure rather than completed incoming-request closure. The client preserves the actionable server error and allows explicit retry; no automatic model retry was added.

## CI #117 and validation

[Run 39832454249](https://github.com/MahmoudAbdulGhani/Portfolio/actions/runs/39832454249) was cancelled. Recorded Ubuntu mirror downloads took 14m14s for 18.4MB on phone and 9m19s for 24.9MB on tablet; accessibility was cancelled during dependency installation. Tablet then ran 59 tests before its existing job deadline. No preceding assertion failure was recorded in those cancelled jobs. Checks, CV, portrait build, boundary, desktop smoke and case-media engines had passed.

The browser installer changes only the Azure Ubuntu mirror URL to the official Ubuntu HTTPS archive, retaining repositories/signatures/packages. Smoke suites use two independent file shards per viewport; one worker, retries, tests and 15-minute deadlines are preserved. [Actual listing coverage](shard-coverage.json): all 237 cases per viewport, 122 + 115, no missing/duplicate cases. This is listing proof, not test execution. [Playwright sharding documentation](https://playwright.dev/docs/test-sharding) describes the mechanism.

Local checks: typecheck, lint, ordinary build, normal production guard, 39 integrity cases, 13 landscape/provider cases, CV generation, unchanged reference fixture and four overflow/layout cases passed. Compiled affected browser checks passed: 38 desktop cases and 12 tablet/phone cases, retries disabled. Final-head hosted CI is recorded in the PR delivery comment after reaching terminal status; this document does not equate pending jobs with success. Final CI must retain checks, all six smoke shards, boundary, portrait build, CV, accessibility and all case-media engines.

## Remaining limits and recommendation

Physical Android/iPhone, hardware audio and production provider logs were unavailable. No changes to portrait playback or media are proposed. Hosted Preview access and exact final-head CI are reported on the draft PR; Vercel SSO, if required, is an access limitation, not a deployment failure. Do not weaken protection. Review the static PDF/screenshots independently if hosted access is restricted. Verify genuine assistant output later when the upstream provider is available. Keep assessment prose separate from candidate facts even when the model gives a favorable rating. No merge, manual deploy, promotion, Contact submission or live-data changes.

### Final-head CI and hosted access tracking

Automatic Preview at https://mahmoud-portfolio-git-fix-a6c27a-mahmoud-abdul-ghani-s-projects.vercel.app/profile returns HTTP 302 to Vercel SSO. Hosted UI/provider verification is blocked by sign-in; deployment protection remains unchanged. The exact final SHA and terminal CI status are recorded on [draft PR #47](https://github.com/MahmoudAbdulGhani/Portfolio/pull/47).

The first candidate run (#118) exposed runner-specific mirror+file indirection: changing direct apt sources did not replace the active /etc/apt/apt-mirrors.txt Azure URL. Its successful tablet shard log verified that diagnosis; several other jobs remained in installation. The follow-up updates both known Ubuntu mirror-list files as well as direct sources and prints only the public Ubuntu archive lines for verification. The superseded run may be cancelled once the corrected head starts; it is not counted as a final-head pass. No assertion or deadline changes.
