## Supporting projects — mobile density refinement, 2026-10-30

**final result: passed** — scoped local visual QA. Visual acceptance, protected hosted interaction and physical-device testing remain separate.

Inspected local/origin and the open draft stack before editing. Both were PR #57 / `2259443875cb498a6115302eaf701bb947cef535`; only `Codex_Engineered_Landscape_Handoff.md` was untracked. Preserved it and newer accepted work; continued on `refine/supporting-mobile-density`, stacked above `prototype/supporting-design-phase2`. No reset or adoption.

[Comparison HTML](index.html) · [measurements](comparison.json) · [390px UniHub](comparison-390-unihub.jpg) · [320px User Management](comparison-320-full-stack-user-management-system.jpg) · [390px index](comparison-390-index.jpg) · [390px card](comparison-390-card.jpg) · [changed files](changed-files.json) · [offline ZIP](evidence.zip).

### Scope and implementation

Only the supporting review candidate changes on phones (`max-width: 719px`). The shared reader/index/components remain the implementation; no production copy, sculpture, demonstration, new media or animation library. Normal `/projects`, ordinary readers and all other routes retain their current presentation.

- Compact the return/category area and title margins. Role, team size and program now share one metadata block with 4–6px related gaps. Preserve their actual text and 13/14px metadata sizes; no attribution is hidden or invented. A project with no attribution gets no empty block.
- Keep opening body text at **16px / 1.65**, with 18px summary/action spacing and 20px before the media controls. Source/demo actions retain their targets and touch/focus treatment. This is a natural stack, not a fixed-height introduction.
- Select a concise phone summary from explicit review configuration. The original full summary/type remain in the existing Project context disclosure. User Management's long functional name moves there on phones; its visible H1 remains User Management. Home Services keeps its single supplied-design link in the opening, with backend/scope detail retained in context; the same credit is not repeated in a second paragraph there.
- Use short factual phone card categories and one sentence per summary. Keep stack metadata, titles, case-study actions, all eight 16:10 cover assets/framing/order and original registry assignments. Supporting projects remain unnumbered. No fixed card heights, clamping, hidden description or crop change.
- Connect the index heading/copy, search, Gallery/Index controls, project count and cover row with smaller phone gaps. Keep 44px controls. Desktop/tablet index copy and spacing are unchanged.

The breakpoint snapshot uses the existing React `useSyncExternalStore` pattern on first client render and resize. There is one visible copy of each opening; normal routes and historical variants do not subscribe to this media query. Resizing keeps the selected screenshot and an open disclosure. No new scroll owner or navigation delay. Existing URL filter/mode/source state, return-context/focus owner and image/viewer mechanisms are unchanged.

`/review/supporting/candidate` is refined; `/review/supporting/before` preserves PR #57's candidate; `/review/supporting/baseline` remains the earlier normal presentation. Reader children retain `/projects/<actual-slug>`. The explicit review build also serves `/review/supporting-density/index.html`; the historical PR57 comparison/assets remain untouched. Automatic Vercel Preview is enabled for this exact new branch; Production disables review mode even when explicitly requested. Both comparison directories and review routing/styles remain excluded from normal builds. Existing noindex headers, canonicals, sitemap exclusion and Vercel protection remain; noindex is not access protection.

### Measured opening changes

Values are the selected screenshot reserve's initial viewport top, in CSS pixels, before scrolling. Same archived public GET snapshot, genuine assets, compiled builds, settled fonts and density 1. These are observations, not a fixed pass threshold; taller sources still scroll naturally.

| Reader | 320px before → after | 390px before → after | 430px before → after |
| --- | --- | --- | --- |
| GameZone | 878.8 → 687.0 | 734.3 → 594.5 | 738.9 → 599.2 |
| UniHub | 839.8 → 620.0 | 794.0 → 620.9 | 770.7 → 599.2 |
| User Management | 946.6 → 713.4 | 847.5 → 666.4 | 828.8 → 649.3 |
| Medicare Hub | 723.4 → 556.8 | 649.7 → 531.3 | 654.3 → 536.0 |
| Home Services | 838.5 → 635.1 | 770.3 → 595.9 | 746.9 → 600.6 |

Imagery starts **118.3–233.2px earlier** across the fifteen phone samples. The first index cover moves from 608.4 to 509.0px at 320/390, and 581.2 to 483.4px at 430. The first JobPilot card's box at 390 decreases from 527.3 to 454.7px; its cover width/ratio is unchanged. Summed card box heights decrease by 344.5px, 348.1px and 303.9px at 320/390/430 respectively (these sums exclude inter-card margins/gaps).

All fifteen reader image-top/column samples at **768×1024, 1280×720 and 1440×900** match PR57 exactly. The first index cover position also matches at those sizes. No desktop spacing/copy change is proposed; the accepted identity/actions column beside the complete image is retained.

### Visual QA and comparison history

Source visual truth: immutable PR57 compiled build `.motion-preview/supporting-density-before-dist`, captured before application edits. Its screenshots/measurements are in `before/`. Rendered implementation: `.motion-preview/supporting-density-after-dist`, captured in `after/`. Combined `comparison-<width>-<surface>.jpg` files put **PR57 left / refined right** in the same input. All six CSS viewports and raster sizes are **320×844, 390×844, 430×844, 768×1024, 1280×720, 1440×900**, at deviceScaleFactor 1. Combined rasters are twice the viewport width at unchanged height. Direct initial-entry state, selected lead image ready, reduced motion for settled comparison; genuine media, no fixture rasters.

Initial source findings [P2]: tall narrow reader openings delayed the first product image; expanded uppercase categories/long card paragraphs slowed scanning; index introduction/control gaps separated related information. Fixes above address those findings. The first post-change comparison showed all fifteen phone images earlier, shorter cards and the connected index hierarchy without crowding. No further application visual correction was required. Desktop/tablet full views and focused card/metadata/credit comparisons show preserved composition. No actionable P0/P1/P2 remains in the scoped local review.

Required fidelity surfaces:

- **Typography:** same Space Grotesk display, Manrope body and IBM Plex Mono metadata. Strong title sizes/weights remain. Body/card paragraphs are 16px; metadata is 11px category, 13px program and 14px role. Long titles wrap naturally. No tiny text, line clamp or forced line break. At 200% CSS enlargement an overlong word may split to preserve reflow; nothing is clipped or shrunk.
- **Spacing/layout:** related attribution is grouped, summary/actions remain separate and readable, media controls keep their own area. Both index controls and card actions remain comfortable. Image reserves retain source dimensions, without a height cap. Focused controls, including enlarged text, scroll clear of the fixed header/footer.
- **Colors/tokens/icons:** cream, ink, green actions, muted metadata, rules and existing Feather icons are unchanged. Focus outlines and contrasts remain. No new surface treatment, shadow or decorative outline.
- **Images:** original equal-width 16:10 covers, complete registration capture, every reader source and Home Services footer are retained. No source image/export/provenance files changed. Existing full-image source/ratio guards, chooser/gallery/zoom tests and exclusion of the removed registration excerpt remain.
- **Copy/content:** concise phone phrasing changes density without claiming new roles, results or capabilities. Full detail, team attribution, programs, source/demo links, supplied-design credit and existing narrative order remain accessible. Desktop/full introductions remain unchanged.

Focused inputs include `comparison-390-card.jpg`, `comparison-320-card-users.jpg`, all five mobile opening pairs, wide opening pairs and twelve `after/*text-200.jpg` examples. They supplement full-view comparisons where metadata and wrapping need closer inspection. No fabricated UI or image substitute.

### Validation and limitations

Local typecheck, lint (ignored generated reports/scratch excluded), normal/review builds, all three production guards and 14 policy/catalog/source-media/cover checks pass. The 49-case compiled suite passes after adding an explicit decoded-cover readiness wait to the new wide text comparison; its initial failures compared temporary Loading preview labels against already-decoded cards. Existing assertions and deadlines were not changed. One additional enlarged-text/focused-control case passes: **50 compiled cases in total**, comprising all 41 retained regressions plus nine focused additions. Final-head CI repeats the whole set and existing gates; its terminal exact-SHA result and automatic Preview address are recorded in the stacked draft PR delivery to keep the tested head immutable. Pending/cancelled checks are not passes.

Coverage includes all six sizes; all image selections; gallery/Escape/focus and existing viewer modes through retained media regressions; source refresh/native history; index search/mode/scroll/focus; resizing without losing image/disclosure state; one H1 and unchanged role/program content; original summary/full name in context; one Home Services credit; no overflow or clipped enlarged text; footer clearance; reduced motion; delayed/failed-image reserves/retry; historical and normal-route preservation; compiled comparison/measurement/ZIP availability. Normal build guards exclude both comparison directories while keeping JobPilot/Cedar/Lobby adopted.

Visual review uses **installed Windows Chrome and viewport emulation**, archived public GET responses and genuine existing assets. Regression fixtures separately use synthetic CMS roles/programs and controlled image/network conditions; they are not public-copy evidence. The 200% examples enlarge content font sizes with CSS, not OS/native zoom. No physical Android/iPhone or spoken screen-reader session was available. This spacing task does not claim a new hardware-WebGL audit; accepted featured geometry/motion and unrelated pages/media/AI/Contact/CV code are unchanged, with existing final-head CI gates retained.

Offline check: all 161 evidence-manifest hashes match and all 48 embedded comparison images decode in native Chrome from a file URL, without a server/sign-in. The evidence ZIP passes a complete CRC check.

Hosted UI verification depends on unchanged Vercel authentication. If requests redirect to sign-in, that confirms protection, not hosted interactions or an application 404. Public images and the CRC-checked offline HTML/ZIP support review without sign-in. No merge, manual deployment/promotion, production adoption, Contact submission, live write or Phase 3 work.
