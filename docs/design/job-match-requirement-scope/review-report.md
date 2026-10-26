# Job Match: practical requirements and formal qualifications

26 October 2026. Continues PR #49 (`448ca6fd6e06202213840bee6ba183072ce12b8e`) on `fix/job-match-requirement-scope`, stacked above `refine/public-portfolio-wording`. The untracked handoff is preserved.

## Root cause and correction

The reported production sentence was: “Dedicated web accessibility certifications or formal audits are not listed.” The job requested accessible React interfaces and preferred an AWS certification; it did not request an accessibility credential or formal audit.

Source inspection confirmed that the matcher’s gaps, related experience, strengths and project comparison prose accepted free-form provider strings. PR49 separated source-owned summaries and included an AWS-specific comparison rule, but did not validate the topic/type of other formal comparisons against the job. That allowed practical implementation uncertainty to become a new qualification requirement. Production logs are unavailable; this identifies the permissive generation/formatting path, rather than claiming access to the model’s internal reasoning.

`job-requirements.js` now interprets explicit formal requirements by type and subject. The provider receives that interpretation and instructions separating practical work, credentials, audits and named standards. The formatter uses the same interpretation across provider-authored report fields. An AWS preference cannot authorize an accessibility credential or audit. Explicitly waived qualifications do not become requirements. Named standards retain version/level scope. Degrees and licenses are distinct from certification, and a “Qualifications” heading does not imply credentials.

When a practical accessibility/security request has acquired an unrelated formal comparison, the relevant discussion becomes implementation and testing. The formatter preserves useful separate sentences, such as a project’s team validation work, and does not add an unsupported positive claim of certified/audited implementation. Explicit certification, audit and standard requests retain their separate scopes. Existing internal grounding, direct qualification answers, teams and supplied-design credit remain covered.

| Scenario | Expected result, covered by regressions |
| --- | --- |
| Accessible React interfaces; no credential/audit requested | Discuss practical implementation/testing; no new accessibility credential, formal audit or WCAG requirement |
| Accessibility certification explicitly requested | Retain the qualification discussion; do not add a formal audit |
| Practical security/authentication skills; no certification | Discuss application security/testing; no added certification or external audit |
| AWS certification explicitly preferred | Keep the source-based AWS re/Start training comparison under Requirements to discuss |
| AWS certification explicitly not required | Remove the credential comparison; do not create an AWS requirement |
| Formal accessibility audit and WCAG 2.2 AA / Section 508 explicitly requested | Preserve those requirements; do not substitute certification or a different WCAG version |

## Before/after evidence

- [Offline comparison HTML](comparison.html), [downloadable comparison ZIP](comparison.zip).
- [Phone before](before-390.jpg) / [after](after-390.jpg), [desktop before](before-1440.jpg) / [after](after-1440.jpg).
- [Controlled source-formatting comparison](controlled-comparison.json). It inserts the user-observed sentence into the same current report and passes it through PR49/current formatters. It is a fixture, not an archived production report or model A/B.
- In that controlled comparison, the observed sentence becomes: **“Discuss the approach to implementing and testing accessible interfaces.”** Other work descriptions and the AWS preference remain intact.
- [Genuine current request and report](real-provider.json), [phone render](genuine-390.jpg), [desktop render](genuine-1440.jpg). The screenshots replay the archived genuine result into the compiled page; they are not a second provider request.
- [Actual signed tailored-CV download](genuine-tailored.pdf), [page one](genuine-tailored-1.png), [page two](genuine-tailored-2.png), [PDF inspection](pdf-review.json).
- [Changed-file manifest](changed-files.txt).

## Actual validation

- Typecheck, lint and the normal production build passed. JavaScript-only API startup and the portrait production-inclusion/review-exclusion guard passed.
- 62 integrity/API cases passed. The exact reproduction now runs through mocked-provider JSON and actual SSE HTTP transport tests, checking strengths, related experience, requirements, project prose and signed CV separation. Existing failure/retry/rate/concurrency, qualification, team and supplied-design regressions remain intact. No assertions or deadlines were weakened.
- All 36 existing compiled Job Match recovery/streaming cases passed with retries disabled across desktop/tablet/phone Chrome configurations. These include 320, 390, 430, 768 and 1440px, keyboard CV access, preserved input, cancellation, stale responses, interrupted/malformed streaming, explicit retry and frontend deadlines.
- Fifteen additional compiled browser inspection samples (controlled before, controlled after and archived genuine report at each requested width) produced no page exceptions or horizontal overflow. Six 390/1440px captures were visually inspected for wrapping. Keyboard Enter downloaded the exact genuine PDF bytes through the replayed UI. [Browser methods/results](browser-review.json).
- One genuine configured Gemini request used the exact reproduction through the current local Express SSE route, with a freshly fetched read-only public content snapshot. Upstream returned HTTP 200, a report completed in about 5.3 seconds and its signed tailored-CV endpoint returned HTTP 200, 32,636 bytes. No provider mocks/retries/replay were used for that request. It contained no added accessibility credential, formal-audit or compliance requirement, and kept the preferred AWS comparison. An additional final-formatter recheck left the archived genuine report unchanged.
- The actual tailored PDF was rendered with PyMuPDF and both pages were visually inspected. Its source-owned candidate summary is separate from the recruiter assessment; recorded roles/month ranges, AWS training and co-developed project wording remain factual. No new verification disclaimers, invented employment type/exact tenure, text clipping or overlap was observed. The two-page export has education/languages on a short second page; this existing pagination/default-catalog selection was preserved, not redesigned. Application CV reference checks pass with unchanged fixture/tolerances.

## Scope and remaining gaps

No frontend component, CSS, public label, portrait/video/controller, sculpture, screenshot, stream decoder, retry lifecycle, rate limit, provider configuration, CV generator/geometry or saved configuration changed. No live CMS/database changes, production comparison POST, Contact submission, merge, manual deployment or promotion.

The genuine request used fail-closed in-memory Prisma/rate/config state and uncustomized local `initialModes` configuration over the public snapshot; it is not a report from the protected Preview or its saved CV configuration. Browser inspection is Windows Chrome viewport emulation, not physical Android/iPhone testing. No production logs are available. The explicit English topic/type guard covers these tested scenarios and common named standards; it is not a complete natural-language parser or a guarantee about every future free-form model statement. Existing source grounding still governs factual claims.

Final-head CI and automatic Preview SHA/access are recorded in the stacked draft PR delivery comment once terminal. A pending workflow is not reported as passed; Vercel deployment protection is preserved.
