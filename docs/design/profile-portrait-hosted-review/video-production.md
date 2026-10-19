# Speaking and gesturing portrait — production brief

Status: **not produced**. The delivered prototype is a static original-photo cutout with one entrance. No playable video, speech, lip sync or body gestures have been generated. No video-generation service is connected to this implementation. The supplied reel is a visual integration reference, not a performance of Mahmoud and not a motion source to copy.

## Preferred option: record Mahmoud performing the introduction

Record the actual person speaking the approved script, with natural small gestures. Use a locked camera, soft consistent lighting, a plain contrasting background, full-body framing with both shoes and space around moving hands. Capture the face sharply at 1080p or higher; record clean microphone audio and retain a high-quality original. Keep the camera, feet and clothing stable and avoid motion blur. A short still lead-in/out makes it easier to switch between the poster and video.

Separate the background from every frame, refine hair, hands, watch, clothing and shoes, and check the matte on cream, white and dark while the subject moves. [Adobe After Effects Roto Brush and Refine Matte](https://helpx.adobe.com/after-effects/desktop/roto-brush-and-refine-matte/roto-brush/roto-brush-refine-matte.html) is one available post-production option. This preserves an actual filmed performance and requires a recording session plus matte/encoding work.

## Alternative: consented performance transfer

[Runway Performance Capture with Act-Two](https://help.runwayml.com/hc/en-us/articles/42311337895827-Performance-Capture-with-Act-Two) accepts a driving-performance video and a character image/video. Gesture control is available with character-image input. It can transfer speech, expression and movement, but generates new pixels: exact original likeness, fingers, watch, clothing and shoes cannot be assumed. It still needs an authorized performance/audio recording, an account with access, generation/iteration, separate background removal and approval of the result. No generation, upload, subscription purchase or synthetic-voice use is authorized by this static implementation.

The 326×1027 WhatsApp crop is insufficient for recovering fine face detail. Enlarging or generative upscaling it does not restore authentic lost information. Prefer a new high-resolution photograph or filming session before any performance-transfer trial. Keep the faithful photograph as the fallback until the moving likeness is explicitly accepted.

## Script and delivery requirements

“Hi, I’m Mahmoud. I build full-stack applications with clear interfaces and dependable backend workflows. Explore my work, or download my CV.”

- Supply the original recording, isolated video master with alpha, clean audio, transcript/captions and an approved still poster. Target roughly 12–18 seconds of natural delivery; timing follows the actual performance, not a CSS loop.
- Produce web encodes with a tested transparency strategy for Chromium, Firefox and Safari, plus a conventional composited fallback if alpha playback is unsupported. Select codecs only after testing target browsers; a single transparent-video file must not be assumed universally supported.
- Review the entire moving matte frame by frame at hair, ears, lips, hands, watch and shoes. Check likeness, speech alignment, gesture anatomy, complete feet, natural proportions and floor contact. Review phone face readability separately from desktop scale.
- Future player behavior: explicit user-initiated playback and audio, keyboard controls, accessible captions/transcript, pause/replay and a reliable poster/loading/error fallback. Reduced motion keeps a static poster until the user explicitly asks to play. Reserve layout space, defer video loading and measure mobile decode/memory behavior before acceptance.
- Only add a playback control when a real, tested video asset is present. Production Profile replacement remains a later acceptance decision. This stage does not complete the moving, speaking portrait goal.

Sources were checked on 2026-10-19. Provider availability and output capabilities can change; the options above are production paths, not completed deliverables or fidelity guarantees.
