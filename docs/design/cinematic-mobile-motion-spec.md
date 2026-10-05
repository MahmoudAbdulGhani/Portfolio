# Cinematic laptop and responsive motion

The five selected projects use one original unbranded graphite laptop authored in `src/lib/laptop-model.ts`. It has a connected hinge, slim display bezel, camera aperture, trackpad, ports, speaker perforations and varied keyboard rows with legends. The model contains 28,784 triangles. Three.js renders satin materials, room lighting and a contact shadow when WebGL2 is available. All product screenshots and project metadata come from the existing CMS mapping.

The first project uses the full ScrollTrigger sequence below. Its fixed landscape screen is 3.73 × 2.21 model units. The camera uses a fixed 1.6-aspect plate that fits the available stage body. It never stretches the physical screen into a portrait device. A separate untransformed, contained screenshot becomes visible at the end; it is a portfolio image preview, not an embedded external product.

| Scroll progress | Behavior |
| --- | --- |
| 0–12% | Closed device; title and case-study action remain visible outside the device. |
| 12–42% | Smooth hinge opening and restrained rotation settling. |
| 42–58% | Steady open hold. |
| 58–78% | Bounded camera approach; full device stays in the plate. |
| 78–88% | Crossfade from hardware to the contained project screenshot. |
| 88–100% | Readable screenshot hold before normal flow resumes. |

Desktop scroll travel is 140 viewport heights; touch/narrow layouts use 70. Scrub is 0.3 seconds desktop and 0.14 touch. Reverse scrolling restores the same poses. Skip animation links to the normal-flow caption anchor. Supporting projects use shorter, unpinned openings, ending at the same open hold. Their desktop stage is capped at 620px; the flagship is capped at 800px. Phone stages are 360–520px, with wrapping titles and 44px case-study actions. Small pointer responses are limited to settled supporting devices on fine-pointer desktops.

The renderer is dynamically imported within 700px of a project. A shared GPU renderer, model and environment serve the visible scene. GPU pixel ratio is capped at 1.75 desktop and 1.25 touch. Rendering is requested on progress, size, visibility and pointer changes; there is no idle animation loop. Cleanup kills ScrollTrigger and pending frames, disconnects observers/listeners, restores the screen source and disposes shared geometry, materials, textures, lighting and GPU resources after the final user releases them. Three.js 0.180.0 and matching types remain pinned.

When WebGL2 is unavailable, a CPU-rendered sequence of the same mesh and camera is used. Forty-six authored poses are packed into six transparent WebP atlases. The runtime caches at most two atlases (approximately 20MB of decoded atlas pixels); the CSS3D screenshot uses the current displayed frame pose so it stays aligned while frames load. This fallback has discrete poses; the GPU path is continuous. Matching open-device posters serve reduced motion, viewports at or below 600px high and renderer failure. These paths have no long pinning and retain the real case-study links. Unmapped future CMS projects fall back to their actual screenshot if a matching poster is unavailable.

Existing mobile headings, menu, gallery, Contact and AI Job Match motion remain in their public workflows. Shared navigation continues to expose Home, About, Projects, AI Job Match and Contact. This revision changes the landing project presentation and its renderer; backend, CV, security and AI stream behavior remain as previously implemented.

Verification: TypeScript, ESLint, production build and native Node geometry/hold/reversal tests pass. Run the geometry checks with `node --experimental-strip-types --test tests/laptop-motion.test.ts`. The lazy scene chunk is approximately 623KB minified / 174KB gzip. Browser QA exercises the rendered fallback, opening/hold/handoff/reversal, contained mobile images, static reduced motion, wrapping long titles and actual case-study navigation. The cloud browser disables WebGL; GPU appearance, device frame rate, context-loss recovery and physical iOS/Android gestures remain device-validation tasks before release. The PR remains draft; no merge or deployment.
