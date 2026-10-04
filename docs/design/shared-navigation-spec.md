# Shared public navigation — behavior and implementation plan

Status: specification only. Current Navbar.tsx is unchanged in this planning pass.

## Current evidence

Navbar.tsx has an early landing/archive branch and a separate generic branch. Landing uses About/Projects/Contact anchors; archive uses Home/Projects/AI Job Match/Contact routes; generic pages use Home/Projects/Job Match/Contact plus Search, Let’s Talk and Theme. Archive mobile order also differs from desktop. Generic navigation does not use the same jobMatch.visible gate. Browser captures confirm the generic cream header on case study, Contact and AI, versus the selected navy archive.

## Final composition

Original MA identity plus profile.shortName on the left. Shared links, in order: Home, About, Projects, AI Job Match, Contact. Utilities: Search, theme control, Download CV. Keep theme and search available consistently, with restrained icon buttons. Download uses the existing public CV endpoint and approved filename/export behavior. If CV is unavailable, present its existing unavailable behavior rather than offering a broken download.

Desktop header: 76px high, max 1400px canvas, navy surface with off-white labels. Amber underline plus aria-current identifies the active route; never color alone. At scroll >8px, surface gains opacity and a fine bottom border. Keep height/position constant. Utility controls have 44px hit areas. Below the width at which all labels actually fit (starting candidate 1080px), switch to the same mobile menu.

Phone: original MA left, Search and Menu right; the expanded menu contains all five links in the same order, followed by CV and theme controls. Large full-width targets, solid readable surface, no background body scrolling behind the menu. Keep focus inside while modal, Escape closes, focus returns to trigger; navigation closes it. Respect reduced motion. Fit the visual viewport in landscape and with large text.

## Exact routing and active state

| Label | Route | Active rule |
|---|---|---|
| Home | `/` | Landing hero/default state; not About hash |
| About | `/#about` | Landing About hash or active section when scroll tracking exists |
| Projects | `/projects` | `/projects` and `/projects/:slug` |
| AI Job Match | `/job-match` | Exact route; item omitted everywhere when CMS-visible is false |
| Contact | `/contact` | Exact route |

Use the exact same visible label “AI Job Match” everywhere; section headings can remain CMS-owned. Never rely on a changing page heading for a global menu label. Introduce one navigation label source using existing site-section JSON if editorial management is needed, with one consistent default, rather than changing schemas for this visual pass.

About navigates correctly from nested routes and then scrolls below the fixed header. Home does not accidentally become active on every route because of a prefix match. Let’s Talk is a content CTA linking to Contact, rather than a repeated extra nav item beside Contact. The landing's local section jumps remain available within its page, but global links keep the same destination on every page.

## Refactor boundaries

Replace route-specific link arrays/markup with one public navigation configuration and one desktop/mobile rendering path. Route state controls active highlighting, not which unrelated menu items appear. Logo keeps the current CMS identity. Existing command palette keyboard shortcuts and ThemeToggle behavior remain. Public page tokens need complete light/dark mapping before the shared theme utility ships; the selected dark palette is the default concept, while light mode gets equivalent readability and hierarchy.

Project breadcrumb (“All projects”), chapter links and next-project navigation are secondary nav in page content. They do not replace global links. Give each navigation landmark a distinct accessible label. Coordinate next-project bar and Portfolio AI launcher to avoid overlap; on phone keep the next-project action in normal flow if fixed controls compete.

## Acceptance matrix

Check `/`, `/projects`, all eight project slugs, `/contact`, `/job-match`, `/cv`, `/terminal` and public 404. All show identical link labels/order, identity and utilities, except intentional CMS visibility. Admin pages retain their separate admin shell. Test desktop/phone destinations, nested active states, direct page loads, About anchor offset, Escape/focus return, Ctrl/Cmd+K, theme persistence, CV success/unavailable and CMS hiding AI. Navigation loading should not shift link positions or flash two different headers. Header motion never pushes content.
