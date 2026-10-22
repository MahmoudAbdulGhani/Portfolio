# Production portrait loop review — 22 October 2026

**Recommendation: retain the approved media and controller.** The expression cut is already in the deployed export's last/first decoded frames. No safe code correction was identified. This review changes documentation and evidence only; there is no altered-media candidate, before/after implementation or deployment to adopt.

Target: [public production `/profile`](https://mahmoud-portfolio-omega.vercel.app/profile), HTTP 200 without sign-in. Baseline: PR #44, `141bfddcbdf929d35fcb17ba96f352aefc2dfa8d`. The review branch starts directly above that commit; the existing untracked handoff is preserved. No runtime, asset, content, test, provider or deployment-protection change.

## 1. Actual deployed identity

Fresh downloads of both live WebMs match the approved repository bytes:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `mahmoud-introduction-480.webm` | 510,176 | `be05f8501d8f902e5f79c2d543437dbe5f76c618889550bf9b0357c5ee6f6be9` |
| `mahmoud-introduction-720.webm` | 818,600 | `bcc8c7da11828be2800d472c9cc04ce66d2d19ab08dd3e6bdf5144a320685f23` |

[Download/initial probe record](initial-production.json). All seven entry-linked production JS/CSS resources also match the ordinary local build from the baseline: [byte-identity record](deployed-entry-identity.json). This identifies the deployed payload, not independently obtained Vercel Git-commit metadata. No manual deployment was performed.

## 2. Fresh-visitor browser policy and controls

Actual Windows headless **Chrome 155**, separate fresh 390×844 and 1440×900 contexts, no saved choices and no autoplay-permission override. Before initial playback, raw CDP evaluation uses `userGesture:false`; Chrome compositor capture keeps presentation observable. Instrumentation records the native `play()` promise without replacing its result.

Both contexts naturally reject the audible attempt with **NotAllowedError** (`userActivation.isActive` and `hasBeenActive` both false), then immediately resolve muted playback. **Enable sound** appears; automatic muted repetition continues. This is a real native browser rejection, not a mocked policy outcome. Audible autoplay remains browser-controlled and is not guaranteed.

1. Arrival after verified frame presentation: [phone](03-390-fresh.jpg), [desktop](03-1440-fresh.jpg).
2. Keyboard **Enable sound**, from the beginning: [phone](04-390-sound.jpg), [desktop](04-1440-sound.jpg).
3. Final CV caption during a repeated unmuted cycle: [phone](05-390-cv-caption-recording.jpg), [desktop](05-1440-cv-caption-recording.jpg).
4. Paused with **Resume** available: [phone](06-390-paused.jpg), [desktop](06-1440-paused.jpg).

Mute leaves motion/time progressing. Pause persists through offscreen return and navigation back to Profile, with no new media element until Resume. Enabling sound while manually paused does not resume motion. Controls have visible keyboard focus and at least 44px targets. Keyboard CV downloads succeed (valid 31,205-byte PDFs; live-generated file hashes differ). Profile tabs and Capabilities remain usable. No public mutation or Contact submission was made.

**Automation caveat:** an earlier DOM-driven probe and a separate [activation calibration](activation-calibration.json) permitted audible playback after automation made `userActivation` active. They do not establish fresh-visitor sound permission. The no-gesture raw-CDP sequence above is the policy evidence. `01-production-desktop-arrival.jpg` belongs to that preliminary activated probe, not to the fresh-policy sequence.

## 3. Ten native repeats and the restart cause

| Actual production measurement | Phone 390×844 | Desktop 1440×900 |
| --- | ---: | ---: |
| Selected WebM | 480 | 720 |
| Consecutive muted native wraps | 10 | 10 |
| Presented frames observed | 3,001 | 2,998 |
| Layer/render samples | 7,263 | 7,264 |
| Sampled blank shirt / opaque corner tiles | 0 / 0 | 0 / 0 |
| Sampled still flashes / overlaps / layer gaps | 0 / 0 / 0 | 0 / 0 / 0 |
| Initial play attempts, total during ten wraps | 2 | 2 |
| Media listeners registered / active | 9 / 9 | 9 / 9 |
| Maximum pending application frame callbacks | 1 | 1 |
| Pending callbacks / active owned listeners after route exit | 0 / 0 | 0 / 0 |
| Native played coverage | 0–12.008s | 0–12.008s |

The two initial play calls are the audible rejection and muted success; there is **no per-loop application play, reload or controller recreation**. One video element is reused. Frame sampling checks alpha in a corner and body presence in a shirt tile; it is not an exhaustive full-mask or hardware-output certification. [Summary](findings-summary.json), [phone trace](production-390.json), [desktop trace](production-1440.json).

### Source frames versus browser frames

Freshly downloaded live files were decoded independently with FFmpeg 7.1: 300 frames at 25fps each. [Consecutive source faces](source-consecutive-boundary.jpg) show frames 294–299 (11.76–11.96s) holding a neutral/closed-mouth expression, then frames 0–5 (0–0.20s) starting with a different expression and blink. The discontinuity exists **before browser seeking or controller presentation**. Mean absolute composited face RGB change at frame 299→0 is 19.64/255 (480) and 19.79/255 (720), versus approximately 1.2–3.7 in neighboring inspected face pairs: [analysis](source-boundary-analysis.json). This is evidence of mismatched approved-export endpoints; it does not establish the unseen pre-encoding workflow or repair generated anatomy.

The same change is visible at actual rendered sizes: [phone boundary](rendered-boundary-390.jpg), [desktop boundary](rendered-boundary-1440.jpg). These sheets label **recording time**, not source media time. The native last-to-first frame-delivery interval was 83–117ms under this instrumented headless compositor capture (ordinary sampled median 33.4ms). Native seeking can contribute a small delivery interval, and instrumentation affects timing; no application pause, poster swap, disappearance or facial overlap was observed at the boundary. This is not hardware frame-pacing measurement or seamless-loop certification.

**No facial dissolve, frozen expression, reversed frames, new pause, trim, retiming or synthesized ending is proposed or adopted.** Code cannot remove this endpoint expression difference while preserving all the approved frames. A future matching-endpoint source take would need its own approval, full sentence and separate phone/desktop before/after review. Retaining the current cut is preferable to adding facial ghosting.

### Recordings and audio evidence

- [Phone native compositor recording — silent, 37.35s](production-loop-390-silent.mp4)
- [Desktop native compositor recording — silent, 37.67s](production-loop-1440-silent.mp4)
- [Unaltered full decoded approved audio — WAV](approved-full-audio.wav)

Recordings show a native muted repeat, explicit Enable sound, two complete unmuted-state cycles with the final CV caption, then Mute. Chrome compositor frames retain timestamped variable cadence and are encoded as 25fps review MP4s. **They are deliberately silent: no source audio was muxed onto browser frames.** They do not prove hardware playback synchronization. Listen to the separate complete source WAV for human review, not as a synchronized browser recording.

Both WebMs decode to the same complete PCM bytes, SHA-256 `8a6a84c426fb7ce285b966d9e9abd450df28ddf3416b1f545df082275ce5a62e`. Native `played` coverage includes the full 12.008 seconds; the final “Explore my projects, or download my CV.” cue appears in each of two unmuted cycles. No competing media element or accumulating play call was observed. **Direct auditory audition, actual speaker overlap and subjective lip-sync were not available to this agent.** PCM identity, captions and media state do not replace listening or hardware AV verification.

## 4. Silhouette, lifecycle and controlled fallback checks

[3.12s](live-source-edges-3.12.jpg) and [8.88s](live-source-edges-8.88.jpg) fresh-source composites show cream (`#ecebe3`), white and charcoal. Complete hands, cuffs, shoulders and neck/collar join remain visible. No detached white fragment was visible in these sheets or the inspected recording samples. Fine edges retain approved-source softness; this is not a perfect-matte, anatomy or lip-sync certification. Composition and dimensions are unchanged.

**Actual production scrolling:** moving the portrait beyond its scroller pauses and mutes at both sizes; returning resumes muted unless manually paused. **Actual background-tab evidence remains incomplete:** opening/foregrounding another tab in headless Chrome left `document.hidden === false`, so this did not exercise the real background handler. Source inspection and focused environment tests cover that handler, but are not real-tab/OS suspension evidence.

Separate controlled scenarios on the actual deployed page ([records](production-controlled-conditions.json)):

| Scenario and method | Result and limit |
| --- | --- |
| Chrome reduced-motion preference | Still initially, no video created; explicit MP3 reaches its final CV cue and completes once, paused, with transcript usable. |
| Client-aborted WebM requests | Usable still/error/explicit MP3 fallback; not an observed production outage or unsupported Safari decoder. |
| CDP media-only 400kbps / 150ms after UI/still load | Appropriate 480 WebM verified transparent; first playback 2.369s; recorded stage/control/details/intro/tab geometry unchanged. Emulation, not a physical network or bandwidth comparison. Interception disables HTTP cache. |

Captures: [reduced motion](07-production-reduced-motion.jpg), [induced failure](08-production-induced-video-failure.jpg), [induced slow media](09-production-induced-slow-media.jpg).

Cold whole-page exploratory probes took approximately 4.84–5.40s to report ready; an initial five-second observation was insufficient. A later observation window up to 30s measured completion; **no committed test deadline or assertion was changed**. An early single-frame startup probe produced an empty-portrait capture before reliable presentation and was rejected as normal-arrival evidence. Subsequent compositor-driven verified-frame captures were stable. [Capture notes](capture-notes.json) retain this method limitation; physical-device startup/paint remains unverified.

## 5. Validation and remaining device/audio checklist

Current-run passes on unchanged application code:

```text
npm run typecheck
npm run lint -- --ignore-pattern playwright-report --ignore-pattern test-results --ignore-pattern .motion-preview
npm run build
node scripts/assert-portrait-production-build.mjs
node --test tests/portrait-playback.test.mjs tests/profile-introduction-assets.test.mjs tests/profile-portrait.test.mjs tests/profile-portrait-review-build.test.mjs
```

All **24 focused Node cases** pass. Normal build passes with the existing chunk-size advisory; normal Profile inclusion/review-route exclusion guard passes. These Node media doubles/source checks are separate from the actual production native-playback observations above. No runtime fix, new assertion, weakened test or changed deadline is needed. Final PR check metadata is reported separately from this fixed evidence snapshot.

No physical Android Chrome or iPhone Safari was accessible in this Windows session; no device bridge/cloud was available. Phone captures are Chrome viewport emulation, not devices. No direct sound/listening tool or system-loopback recording was available. Actual mobile autoplay, Safari alpha/neck rendering, OS-background suspension, safe areas, hardware synchronization and subjective audio/lip-sync remain open.

Run this short checklist **on an actual Android phone and iPhone** before closing those gaps:

1. Record device model, OS/browser version, date, network and reduce-motion setting. Open a fresh/private Profile visit: note audible permission outcome, muted fallback, Enable sound and any explicit Play fallback. Do not infer Safari from desktop WebKit.
2. Inspect face/neck blend, cuffs, both hands and alpha over the page cream, especially at 3.12/8.88s. Observe ten repeats and the final→first expression cut. Listen to at least two full audible cycles, including “download my CV,” for gaps or overlap; judge lips against the actual device output.
3. Verify Mute preserves motion; Pause persists through scrolling, navigation and background/lock/return until Resume. Check actual sound/video suspension offscreen and in the background; saved sound choices remain subject to browser policy.
4. Verify reduced motion initially retains the still and explicit one-shot introduction; slow real loading/failure keeps a usable still/transcript with stable controls. Check captions, touch targets, keyboard/focus where available, footer clearance, CV download and tabs.
5. Use an actual device AV/speaker capture or direct observer listening and name that method. A silent screencast, source WAV, muxed audio or synthetic policy test cannot certify hardware lip-sync.

**Decision:** keep the approved source and native full-duration looping. Complete the real-device/direct-listening checklist; only commission a separately reviewed source-performance change if the remaining visible expression cut is unacceptable.
