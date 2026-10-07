# Responsive project screen sources

Captured 2026-10-06. These assets replace zoomed desktop crops in the landing-page phone/tablet devices. They are real project pages rendered with the applications' responsive styles, not AI-generated UI.

| Project | Phone asset | Tablet asset | Page represented |
| --- | --- | --- | --- |
| JobPilot | 375×1200 | 753×1200 | Public welcome and application dossier workflow |
| Lobby | 380×1210 | 758×1100 | Public welcome and workspace preview |
| GameZone | 380×1200 | 758×1200 | Public room browser |
| Cedar | 375×1100 | 753×1200 | Public project operations overview |
| UniHub | 390×844 | 768×1024 | Student registration / sign-in |

Phone iframe viewport width: 390 CSS px; tablet: 768 CSS px. The captured content widths exclude native/custom scrollbars where present. Captures are limited to the useful opening portions of long pages. WebP preserves original proportions; the renderer fits width and pans only actual vertical overflow.

Sources from the portfolio's public CMS demo fields:
- https://jobpilot-ai-omega.vercel.app/
- https://lobby-hub.vercel.app/
- https://gaming-arena-reservation-system.vercel.app/rooms
- https://construction-project-management-sa22.onrender.com/
- https://university-management-system-three-fawn.vercel.app/register/student
- https://university-management-system-three-fawn.vercel.app/login

Lobby, GameZone and UniHub were rendered directly in viewport-sized frames. JobPilot and Cedar prohibit embedding: their already visible public DOM was exported to temporary local, read-only capture fixtures, scripts removed, and an original-site base URL retained for their real CSS/font assets. Responsive layout was produced by those original styles. Temporary fixtures are excluded from the deliverable. No login, production mutation, fake product data, or dashboard reconstruction was performed.

For private dashboard replacements, capture the desired page at 390px and 768px widths after signing in, preferably full-page with no dialogs or open navigation overlays. Replace each project's optional `responsive.phone` / `responsive.tablet` source and label in `project-cover-directions.ts`. Keep laptop originals in CMS. The enlarged-image gallery uses the same source ordering as the device composition.
