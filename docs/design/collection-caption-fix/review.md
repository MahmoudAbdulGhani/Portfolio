# Cedar Collection caption — 11 October 2026

Started from `8c3ba6f06100accaf14cdf90962241e7ebf5bfb3` after checking the branch/tree and fetching origin. No newer tracked work was present. Work is isolated on `fix/cedar-collection-caption`; the handoff file remains untouched and uncommitted.

The user's screenshot identifies Collection item 03, rather than a case-study screenshot. Fresh read-only production captures reproduce the number behind the navigation at 1280×720, 1440×650 and 1120×600. The caption's `bottom:48%` anchor places its 116px text block above the stage when desktop height is short. Cedar's description is now visible, but the original anchor did not accommodate the increased text height. A small horizontal overhang also occurs near the desktop breakpoint.

The scoped desktop caption rule keeps a 16px top boundary, intrinsic content height and overflow-safe lower alignment. It retains the original bottom alignment when the content fits and otherwise lets the text extend down. Its left position is bounded by the existing clickable area. At 1440×900 the number remains at y=125.98px; at 1920×1080 it remains at y=162.48px. Short desktop layouts place it at y=108px below the 92px header. No artwork, portrait, collection object positions, motion implementation, case-study image presentation, caption facts, AI or CV code is changed. Existing phone/tablet styles remain in effect.

[Live/local HTML comparison](comparison.html) · [production geometry](live-before/findings.json) · [local geometry](local-after/findings.json) · [Chrome regressions](caption-chromium-3.json) · [Firefox/WebKit regressions](caption-engines-2.json) · [live reader check](live-readers/findings.json).

Ten current production/local viewport pairs use actual artwork and fresh public GET records. No header clipping remains in the local captures. The regression checks the number, title and description against navigation, footer and viewport bounds at seven desktop sizes; it passes in all three Chromium configurations, Firefox and emulated phone WebKit. Firefox's initial intrinsic-height behavior required `safe flex-end`; the final assertions remain intact.

The additional production review checks every project's primary image and its three viewer modes at 390 and 1440px (16 reader states / 48 mode observations), including Escape and focus return. All load successfully. Home Services uses `/projects/complete/home-services-page.webp`, confirming that the complete page is deployed. This is a focused live check, not a repeat of every gallery selection at every width. Full original-image verification remains documented in the preceding review.

Typecheck, lint and build pass; the existing bundle-size warning remains. The full affected Collection/motion suite and final-head CI are run for closeout; their final results are recorded in the draft PR. An initial motion run used the compiled preview, where the existing lazy-import fixture's TypeScript URL cannot intercept the bundled import. It was stopped and rerun against the development server expected by that fixture, without changing assertions, imports or motion behavior.

All observations are browser emulation, not physical-device testing. The earlier tablet opening instability remains separate and is not claimed fixed. The local caption fix is not yet deployed. No merge, manual deployment, live CMS/database changes, Contact submission, booking/payment or authenticated project operation is performed. Live browsing allows GET/HEAD and blocks writes; any Contact success in automated tests uses mocked routes.

