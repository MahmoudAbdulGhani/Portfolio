# Cinematic laptop and responsive motion

The first selected project uses an original unbranded Three.js laptop with a connected hinge, keyboard and trackpad. ScrollTrigger scrubs the opening and camera approach, then the hardware fades into a portfolio-owned live HTML preview. The screen uses the real CMS title, tagline, screenshot and case-study route. This is an adaptation of the requested GSAP Vault interaction in the approved navy/amber portfolio, not copied commercial source or a third-party application embed.

Desktop scroll travel is 150 viewport heights; touch/narrow layouts use 80. The lid opens between 12% and 48%, the camera approaches between 48% and 86%, and the live-screen handoff finishes at 94% desktop or 90% touch. This leaves a readable hold before the section exits. Reverse scroll restores the same geometry. Skip animation links directly to the first project caption.

The scene is dynamically imported within 700px of the viewport. GPU pixel ratio is capped at 1.75 desktop and 1.25 touch; shadow textures are 1024/512 respectively. Rendering is requested on progress/size/visibility changes, not continuously. Resize recomputes the camera and CSS3D display. Route cleanup kills triggers and disposes geometry, materials, renderers and listeners. Three.js 0.180.0 and its matching types are pinned.

When WebGL2 is unavailable, the official Three.js SVGRenderer projects the same original geometry and camera with simplified lighting and geometry. Reduced motion skips renderer loading and long pinning, showing static project content. Load/context failures retain accessible HTML. Real product images use contain sizing; temporary framing during the camera approach is intentional and the final screen fills the stage exactly.

Mobile motion includes shorter heading/portrait entrances, small scroll travel, visible supporting project images, menu enter/exit with sequential links, gallery fade and image change, horizontal case-study chapter navigation, and restrained Contact/AI validation/loading/result transitions. Shared public navigation retains Home, About, Projects, AI Job Match and Contact. Focus traps, Escape, focus restoration, payloads and AI stream behavior remain in their existing workflows.

Verification: typecheck, lint, production build, and native Node geometry/reversal tests pass. Run the latter with `node --experimental-strip-types --test tests/laptop-motion.test.ts`. The build reports a 628KB/175KB gzip lazy scene chunk; it is intentionally loaded only near the first project and never for reduced motion.

Browser QA exercised the software renderer, desktop and phone framing, actual case-study navigation, menu/gallery focus return, and development-only Contact/AI success fixtures. The cloud browser disables WebGL, so GPU materials/shadows, hardware frame rate and physical iOS/Android gesture behavior require device verification before release. No production messages, provider calls, merge or deployment occurred.
