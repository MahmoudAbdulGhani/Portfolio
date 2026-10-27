# Demonstration introductions — focused refinement

Base: PR #54 / `99b9a99628cc60d0a819da1811773089d258bc1d`. Branch: `refine/featured-demo-introductions`, stacked above `prototype/featured-design-phase2`. Inspection found no newer remote work and only the existing untracked handoff file. That file and historical evidence remain untouched.

## Changes and scope

Review candidates now use **Calculation and interpretation** and **Invitation to call access**. The original longer statements remain in the existing implementation disclosures, and normal/baseline presentations keep their original headings. Section IDs, anchor/focus behavior, region names and announcements are unchanged.

Labels are **Sample USD figures · local demo** and **Sample participants · local demo**, at 12.5px/1.55 in the existing dark green. No body/control font is reduced. Phone headings use the existing font at 26–28px, with natural wrapping and no forced line breaks or fixed intro height. Reader-specific cascade precedence is corrected: PR #54's shared narrative styles had raised reader headings to 30px and labels to 16px despite the smaller preview rules.

Progress uses three equal columns when its actual container has sufficient room. Below that text-relative threshold, the whole ordered sequence becomes vertical. Normal text uses columns at 390/430px and vertical steps at 320px; enlarged text can switch earlier. Decorative arrows stay within their cells and disappear in the vertical sequence. Ordered-list semantics, labels, numbered steps and current-step indication remain. Number boxes grow with their text. No horizontal scroller or tiny labels.

Header gaps and phone top/body spacing are restrained; existing body spacing and desktop content/art columns remain. A scoped wrapping rule also protects existing large values, artwork labels and long implementation identifiers when demo text is enlarged. It changes no values, body typography or state. Initial enlargement tests exposed this overflow; assertions were retained and the wrapping fixed it.

No preview composition, image, sculpture geometry/material, camera, motion clock, reducer, sample value, state transition, keyboard handler, CV/Profile/AI/Contact behavior or normal-route design was changed. The only application edits are the two existing boundary components and their review stylesheet. Review build policy extends to this branch, and the same artifact infrastructure serves the new comparison. Normal builds exclude both Phase 2 comparison directories and review entry/routes. Vercel Production fails closed even when given review mode. Authentication/protection remains unchanged; noindex is not access protection.

## Measured and visual findings

Six viewports: 320×844, 390×844, 430×844, 768×1024, 1280×720 and 1440×900. Both preview and reader demos are captured, with 24 matched initial layouts and 16 matched 200%-text layouts. Representative active, rejected/denied, outdated and refreshed/allowed states add 28 captures per version. There are 68 before and 68 final after captures, plus combined comparison images.

At 390px, the reader's first control is about **99px earlier for Cedar** and **131px earlier for Lobby**, using the same demo-header alignment. At 320px it is about 112px/178px earlier in the readers. This does not force the full demonstration into one screen; enlarged text still needs normal vertical scrolling. Complete first values/controls remain reachable and focused controls clear the fixed footer.

All 68 final capture records have a deliberate row/column progress orientation, no clipped progress items and no horizontal page overflow. Automated enlarged-text regressions additionally check whole-demo overflow and focus clearance. All matched body/control font sizes remain identical at the same text scale. Tablet/desktop control widths and horizontal positions match. The shorter copy and spacing intentionally move their starting positions upward; no desktop art/content column rearrangement.

Visual inspection covers matched Cedar 390px and Lobby 320px introductions, enlarged-text examples, desktop comparisons and actual outdated/rejected results. Result-state captures align the interpretation/result itself so error and recovery information is visible; initial captures align the heading, label, progress and first meaningful control. No hidden state is presented as visible evidence.

The separate isolation check compares eighteen ordinary-route views and four accepted selection frames at 390/1440px. All text and measured geometry match PR #54. Fifteen independent raster byte hashes match and seven differ; no universal pixel-identity claim. Accepted previews preserve complete original images and ordering. Unchanged motion/model/reducer source and existing regressions provide preservation evidence; this typography task does not claim new hardware-motion certification.

## Methods and limitations

The PR #54 compiled review build was frozen before application editing. Before captures started from that immutable output; final result-focused and enlargement captures were regenerated against the same output. Both sides use the **same archived read-only public GET snapshot used for PR #54** and genuine original image bytes. This is not a fresh live CMS audit. Remote Cedar source images are cached only inside the capture process. No backend writes/provider requests or Contact submissions are allowed.

Screenshots use Windows Chrome viewport emulation with reduced motion to compare settled type/layout. Synthetic CMS/image fixtures are used separately for browser regressions. Physical Android/iPhone, system text settings and assistive technology were unavailable.

The 200% check explicitly doubles computed text sizes and line heights **inside each demonstration**, taking a snapshot before applying styles so inheritance cannot multiply scaling. Padding/layout are not scaled; site header/footer remain at normal size. This tests demo text reflow, not native browser zoom or whole-site/system text enlargement. An earlier broad font-injection capture was replaced with this focused method to match the regression scope. No claim of full-site 200% text behavior or physical-device success.

An initial optional isolation run failed an unchanged Cedar source-image readiness check. The unchanged follow-up passed all 22 pairs; no deadline increase or application image-handling change was made, and no cause beyond the observed readiness failure is asserted.

## Validation

- Local typecheck, lint, normal/review builds and all three production guards passed.
- Review branch opt-in and Vercel Production exclusion policy checks passed.
- All 20 existing geometry/motion/reducer cases passed.
- Initial full browser run: 44 passed, seven failed enlarged-text overflow checks. A heading-only wrapping follow-up still failed those seven cases; diagnostic inspection found enlarged currency/art-label/implementation-word overflow too. No assertion/deadline was weakened.
- After scoped demo reflow protection, all 24 new introduction regressions passed. The complete affected compiled suite then passed **51 cases**, retries disabled: all prior 27 journey/state/recovery tests plus 24 six-size preview/reader introduction checks.
- New checks cover required heading/labels, mobile heading and label scale, comfortable line height, deliberate row/column geometry and equal column widths, one current step, no clipped labels/overflow, 200% demo-text reflow and focused-control header/footer clearance. Baseline/normal heading assertions and real compiled comparison checks are retained/extended.

Exact final commit/automatic Preview SHA, access results and terminal final-head CI are recorded in the stacked draft PR delivery linked from the final response. Pending or superseded runs are not passes. Existing CI gates, assertions, deadlines and retry policies are unchanged. The existing build chunk-size advisory remains.

Recommendation: review the supplied phone and desktop comparisons, including 320px vertical progress and enlarged text. Stop after this focused candidate refinement. No normal Cedar/Lobby adoption, other design work, merge, manual deployment, production promotion, Contact submission or live CMS/database change.
