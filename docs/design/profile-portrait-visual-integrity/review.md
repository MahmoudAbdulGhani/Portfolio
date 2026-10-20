# Profile portrait visual-integrity correction

Base: PR #40, `f87f6e8f324ec16e27a8cbbaf9a626d2bd5bc626`.

## Scope

This is a frontend correction, not approval of the generated facial performance. The approved photograph, both WebM files, MP3, VTT, CV implementation and Profile records are unchanged. The automatic muted loop, once-only explicit speech, pause/resume, transparency checks and audio fallback remain.

## Findings and changes

1. The user recording contains a ghosted face near 3 seconds. The 180ms CSS crossfade displays two different facial poses simultaneously. The handoff now switches still/video opacity in the same paint; there is no dissolve between faces. The existing 140ms still bridge remains as a deliberate cut, not a claim of seamless source footage. The single 600ms entrance is unchanged.
2. The mobile shell inherited `min-height: 760px`, creating an outer page scrollbar and pushing the footer below shorter viewports. A Profile-only class removes that minimum; other routes keep their existing styles.
3. The caption block could sit below the clipped main scroll surface. The explicit Hear action now reveals its reserved space once without changing focus or scrolling on each cue. It brings the complete figure into view when figure and captions fit. If an unusually short viewport cannot contain both, captions remain visible and as much of the figure as possible is retained.
4. Phone captions reserve two 22px lines, and short phone viewports use a 4px row gap. The portrait itself remains 180/190/200px wide at 320/390/430px.

## Local verification

- Typecheck, ESLint and production build pass. The existing motion-rig chunk advisory remains.
- 14 Node checks pass: media bytes, shared content integrity and Profile evidence. An initial dependency-setup failure was resolved by running Prisma generation; no database connection or migration was used.
- Read-only public CMS/CV fixtures were fetched for the local preview. No Contact or AI submission was made.
- Browser review used the supported cloud Chrome interface, the real media and same-origin responsive iframes. No physical-device claim is made.
- At 320×640, the 180×318 figure occupied y112–430 and captions y530–574, inside the main surface y106–582. Both the head and complete hands remain in view after Hear.
- At 390×640, the 190×335.66 figure occupied y112–448 and captions y500–544, inside y106–582.
- At 430×844, the 200×353.33 figure and complete captions remained in view, without horizontal overflow.
- At 768×900 after Hear, the full figure occupied y96–520 and captions y756–828, inside y92–832. Tablet 768×900 and desktop 1280×720 were inspected. Desktop captions end at y646 above the y652 main/footer boundary. Short desktop windows still require scrolling because the accepted 520px figure and all identity/actions exceed the available height.
- Sampled DOM opacity states showed one face layer at a time. Cloud-rendered sampling is not a hardware-frame-rate certification. Four new Playwright regressions cover per-frame compositing and three short-phone caption/face geometries; their CI result is reported separately.

## Remaining media work

The current generated mouth/teeth poses and repeated speaking gestures are not repaired by CSS. Higher bitrate can preserve detail but cannot correct invented motion. A genuinely natural idle clip and an improved speaking take need a separate source-media review. Prefer a real camera recording with consistent framing and lighting; retain Mahmoud's own voice. Do not describe this patch as a finished idle/speaking redesign, perfect lip-sync, or award-level approval.

Physical Android/iOS/Safari, spoken screen-reader behavior, independent audio audition/lip-sync and protected hosted playback remain unverified. No merge, manual deployment, promotion, CMS write or production submission is part of this delivery.

## Browser proof

![390×640 browser-emulated Profile after Hear, with the figure and caption visible](phone-390.jpg)

This is a browser screenshot of the corrected local build, using the unchanged real speaking media. It demonstrates framing, not approval of the generated facial performance.
