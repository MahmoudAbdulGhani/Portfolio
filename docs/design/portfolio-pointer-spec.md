# Public portfolio pointer

Implemented 2026-10-05. The pointer follows the existing navy/ivory/amber visual system across public routes. `PortfolioPointer` is mounted in `PublicLayout`, with a route-specific namespaced key; admin/login and standalone CV routes retain their existing cursor.

Native arrow: `public/cursors/portfolio-arrow.svg`, an exact Feather `FiMousePointer` icon exported from the already-installed react-icons package. 32px canvas, hotspot 4/4, amber #ffb20b fill and navy #05090f 1.5px stroke. The CSS URL retains standard auto/pointer fallbacks. No hand-drawn icon geometry, generated imagery, external cursor provider or new dependency.

Halo: a 22px border using the public `--accent` token, opacity .55. Interactive controls expand it to 1.6× with opacity .85 and a 7% accent background; press contracts it to .9×. Dark and light themes therefore use their established amber tones. It follows exact mouse coordinates via one coalesced animation frame, without position lag or trails. The decoration is aria-hidden, has zero layout dimensions and pointer-events none.

Only fine, hovering mouse input enables the enhancement. Text inputs, textareas, selects and contenteditable controls keep native cursors and suppress the halo. Disabled/aria-disabled controls use not-allowed; busy controls use progress. Keyboard input, viewport exit, document hide and window blur hide the halo. Reduced motion hides its animated decoration while retaining the static native arrow; forced colors revert to the browser cursor. Cleanup cancels pending frames and removes listeners. No body-wide cursor:none rule.

QA: runtime checks cover tracking, expanded link/button state, keyboard hiding, Contact input exclusion, AI Job Match disabled action, Projects filter cursor, route cleanup, dark/light colors and the explicit dev reduced-motion fixture. Press/viewport exit/coarse input/forced-color branches were code-reviewed; physical touch and OS forced colors were not emulated. Cloud screenshots display the browser observer’s black pointer marker, so the native amber SVG was also rasterized and visually inspected independently.
