# Scroll Chapters — project covers and motion plan

Status: planning and visual refinement complete; frontend implementation and final asset production pending.
Date: 2026-10-04.

## Chosen direction

The user selected the Scroll Chapters direction through the recommendation of option 1, then asked for substantial motion and consistent covers for every project. Two visual references are displayed in the conversation: the eight-project cover direction board and the refined Scroll Chapters desktop mock. The board is an asset-family preview, not a proposed landing-page grid. Generated screen details are concept imagery, not authoritative product screenshots.

Use the existing dark navy (#05090f), off-white (#f5f6f6), amber (#ffb20b), blue (#62b1ff) and Inter. Retain the rest of the landing page, original project names, case-study routes, existing CMS hooks and backend. Add no invented claims, project metrics, slogans, professional titles or feature descriptions.

## Content and asset grounding

Eight published projects exist in the reviewed public CMS snapshot; five are featured. The landing page continues to use the five featured records. The remaining three receive matching covers for the existing project index/case studies; do not add them to the landing page merely to advertise the new assets.

Project descriptions and screenshots were reviewed in the portfolio source. GitHub README files were fetched through the connected GitHub app. Home Services was captured from its live demo. Medicare Hub's demo returned Site Unavailable in this browser; the real repository logo is available. Its root README describes vendored PHPMailer rather than the clinic, so it is not a source for clinic product claims. The UniHub README contains older backend-status information; use the actual saved portal images for the visual and avoid new production-readiness claims.

| Project | Cover subject and composition | Source and status |
| --- | --- | --- |
| JobPilot AI | Large cream/green career-workspace capture; one supporting real document/profile detail. Preserve JobPilot's product identity. No imaginary job-search landing page. | Portfolio resume screenshot and promotional asset; https://github.com/MahmoudAbdulGhani/jobpilot-ai |
| Lobby | Large actual communication-room view, with its existing audio controls as a supporting layer. | `public/projects/lobby/cover.webp` and saved room captures; https://github.com/Ahmad-khalaf517/lobby |
| GameZone Arena | Actual room/booking interface, with date/time or confirmation as a second real capture. Existing blue-violet remains inside product imagery. | `public/projects/gamezone-arena/Booking_date_and_time.webp` and saved gallery; https://github.com/MahmoudAbdulGhani/Gaming-Arena-Reservation-System |
| Construction Project Management & Accounting System | Cedar's real mint/teal operations dashboard; supporting budget or project panel. Retain full saved name in the page caption; Cedar Construction may appear as the product brand inside artwork. | Portfolio dashboard screenshot; https://github.com/MahmoudAbdulGhani/Construction-Project-Management-Accounting-System |
| UniHub | Actual course portal as primary; one separate student/professor view only if it is a real captured screen. | `public/projects/unihub/usercourses.webp`, `user.webp`, `Admin.webp`; https://github.com/MahmoudAbdulGhani/university-management-system |
| Full-Stack User Management System | Existing UserManager statistics page, or an actual admin screen when captured. Do not invent an admin panel for artwork. | `public/projects/user-management/dashboard.webp`; https://github.com/MahmoudAbdulGhani/fastapi-user-management |
| Medicare Hub | Verified medical-cross logo as an interim brand cover. Replace with real clinic interface composition once an accessible source capture is available. No fictional patients, medical records or clinic dashboard. | Actual `logo.jpeg` from https://github.com/MahmoudAbdulGhani/Clinic-management-system ; live demo unavailable during review |
| Home Services | Real blue HomePro landing page in desktop and genuine responsive views. Its original Figma-derived branding remains in the capture. | Live https://home-services-coral.vercel.app/ capture; https://github.com/MahmoudAbdulGhani/home-services |

## Final cover system

- Landscape 16:9 composition, master target 1920 × 1080. Build wide and phone variants from the same actual source material. Keep the original UI as immutable raster layers rather than relying on image generation to reproduce interface text.
- Quiet navy studio art direction with consistent lighting, subject scale and spacing. Product screens fill roughly 70–85% of their stages. Existing app colors belong inside the product imagery; the page palette stays unchanged.
- One primary product screen and at most one supporting detail. Vary the arrangement by project instead of repeating the same laptop-and-phone scene eight times.
- No outer image border, padded frame, promotional slogan, QR code, testimonial, fabricated metric, stock-object filler or badge collection. Existing device material and artwork depth are subtle.
- Produce separate background/device artwork and original screenshot/detail layers for motion. A flattened cover alone cannot animate its internal objects independently. Generate only missing decorative material; use original screens and logos for exact product identity.
- Keep Projects | project name as real page text below the artwork. Do not bake the caption or clickable action into the image. Preserve the case-study link and full accessible project name.
- Export optimized AVIF/WebP with responsive sources, a static fallback and stable intrinsic dimensions. Load the first visible scene promptly, defer later scenes, and animate only scenes close to view. Set final compression budgets after checking small interface detail at desktop and phone sizes.

## Scene layout

Use five vertical, borderless featured scenes. Natural page scrolling drives progress. No horizontal carousel, automatic slide switching, numbered carousel controls or fake loading intro. A small 01 / 05 indicator can reflect the visible project; it does not replace content or become another navigation widget.

Desktop: near-full-width imagery with approximately 5.5% side margins, then a quiet caption row with Projects | name and View project. Preserve a clear glimpse of the next scene without cut-off captions. Avoid excessive scroll dwell or scroll hijacking. Project links remain usable throughout animation.

Phone: a normal vertical list, simplified composition showing one dominant screen. Use a less-wide cover variant when necessary so meaningful UI does not become a tiny desktop page. Keep the collection label small, full project name readable and arrow separate. No pinned scenes, perspective tilt, hover dependence or sideways page movement.

## Motion score

These values are starting specifications, to be tuned from an actual browser recording.

| Phase | Proposed choreography | Starting parameters |
| --- | --- | --- |
| Section entry | Small existing label enters behind a short horizontal mask; first cover opens center-out. | Mask 0.8–1.0s, ease [0.22, 1, 0.36, 1]; run once per mount after meaningful visibility. |
| Scene arrives | Artwork moves into its final position while its clipping region opens. The final scene has no permanent crop. | Translate Y 32px → 0, scale 1.025 → 1. Caption follows by about 120ms. |
| Scene crosses viewport | Small difference in background and screenshot-plane travel creates depth. | Total main-screen travel limited to about 20px; secondary plane about 32px. Keep caption fixed and clickable. |
| JobPilot | Real workspace and supporting document layer separate slightly as the scene settles. | Supporting layer X 28px → 0; small differential scroll movement; no document text rewriting. |
| Lobby | Actual audio-control detail slides into place beneath the communication screen. | Detail Y 22px → 0. Avoid perpetual pulsating controls that imply a real active call. |
| GameZone | Real booking detail reveals horizontally against a steady main interface. | Short right-to-left mask plus X 24px → 0. No fake interactive booking behavior in the cover. |
| Cedar | Dashboard opens with a clean rectangular mask; existing budget detail settles on its baseline. | Primary mask 0.85s; secondary Y 18px → 0 after 100ms. No animated finance counts or invented totals. |
| UniHub | Real portal planes appear with controlled staggering. | Separate layers about 80ms apart, X movement no more than 24px. |
| Pointer interaction | Optional slight artwork response adds depth on precise desktop pointers. | Max ±1.5° rotation, settle quickly on leave. Do not move caption/link hit areas. |
| Scene exits | Gentle artwork recession while the next natural-flow scene enters. | Scale 1 → 0.985; do not hide a project before its link can be reached. |
| Case-study action | Small directional arrow movement on hover/focus. | 3–4px translation; no button size jump. |

Use the existing Framer Motion dependency for transforms, masks and scroll progress. Do not add Framer/Canva accounts, plugins or a new animation library for this work. Animate transform/opacity where possible. Honor device reduced-motion preferences by displaying complete static artwork, with every project and link still available.

## Production sequence and acceptance

1. Approve/refine the single selected visual direction shown in chat; no new choice between three unrelated layouts is needed.
2. Produce five featured cover compositions from original screenshot layers and corresponding phone variants; prepare the other three covers for existing project surfaces. Medicare remains brand-led until actual UI is available.
3. Replace the landing carousel with the scoped vertical showcase, preserving CMS ownership of copy and featured selection. No backend/schema changes.
4. Add the distinct motion score to real artwork layers, then tune from a browser recording. Show the complete projects sequence and the transition into the next landing section.
5. Check keyboard links, focus visibility, phone overflow, long titles, real screenshot readability, static fallback, reduced motion, loading layout stability, asset sizes and console errors. Run typecheck/lint/build for implementation, then save combined visual QA comparisons. No code checks or motion/video verification are claimed by this planning document.

Deliverables completed in this planning pass: source review, eight-project cover art-direction board, revised selected desktop concept and this concrete cover/motion specification. Final individual assets, animated prototype and deployment are pending the implementation pass.
