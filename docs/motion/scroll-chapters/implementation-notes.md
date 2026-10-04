# Landing projects implementation

ProjectChapters replaces ProjectCarousel only in the landing page. All five featured, published, portfolio-visible records still come from useProjects. Captions retain full CMS names; destinations remain /projects/:slug. The index and case studies retain existing artwork.

## Assets

The built-in image generator created studio.webp and laptop-studio.webp. The latter is RGBA 1499×744 with a real transparent screen opening, bounded at x108–1390 and y47–670. Original screenshot pixels are rendered behind the device raster, using contain, so no screen is redrawn or stretched. Slight aperture padding is intentional. JobPilot and Cedar screens are optimized copies of published screenshots. JobPilot’s secondary document is page 1 of the existing public portfolio CV. Other layers use existing repository screenshots.

The shared new assets total approximately650KB; frame and backdrop are reused across all scenes and lazy-loaded. Unknown/new CMS slugs still render their own cover/gallery with the same device. Image failures walk available alternatives rather than substituting invented UI.

## Motion

Native vertical flow, no carousel or scroll hijacking. JobPilot opens center-out; Lobby opens vertically; GameZone opens from the side; Cedar and UniHub use opposing vertical masks. Main and supporting planes have restrained differential scroll travel; only fine desktop pointers get tilt. Captions enter with a short delay, preserve keyboard links and never move with pointer tilt. Phone hides secondary layers and uses a44px AI launcher. Device reduced-motion preferences expose complete static scenes through the existing provider and CSS fallback.

## Recording

projects-walkthrough.mp4 is composed of actual cloud-browser screenshots of the implemented page. It is played at approximately half the capture rate to make the scroll sequence easier to inspect. No generated video or simulated frontend frames are used.

## Scope

No backend, schema, CMS data, dependencies, palette, index or case-study changes. Three non-featured cover designs remain planned. The GitHub draft must be merged and deployed before the public production site changes.
