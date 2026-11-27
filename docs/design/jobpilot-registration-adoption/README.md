# JobPilot: the proposed and saved city on the public routes

The approved demonstration from [PR #60](https://github.com/MahmoudAbdulGhani/Portfolio/pull/60) is now the default inside JobPilot’s Collection and case study. It uses the same component, sculpture, styles and revision checks as the approved review. The rest of the Collection opening and the transition into and back from the reader retain their normal behavior. The speaking Profile portrait is outside this change.

**Try it** in the normal build: open `/?project=jobpilot-ai#jobpilot-engineering` or `/projects/jobpilot-ai#engineering`. Propose Tripoli, review, then simulate another edit. Accepting the old review leaves Byblos saved at revision 2. After reviewing again, accepting saves Tripoli at revision 3. Reset returns to Beirut. This is fictional local data; no write or provider call is made.

[Phone: three successive states](phone.jpg) · [Desktop: both public routes](desktop.jpg)

**320px alignment follow-up.** When “Proposed location” wrapped, Tripoli sat 20.6px below Beirut. The labels now share one row, so the two city names line up on both routes at the original 23.2px type size. [Compare the same reader at 320px before and after](mobile-city-alignment.png). At 390px and 1440px all 12 matched captures of the comparison panel were pixel-identical across both routes and three states (review, blocked and accepted).

With the root text size doubled at 320px, the panel gives more width to the words and less to the figure. In a Firefox capture against the original release, the city names stayed at 46.4px and each went from two lines to one; the panel no longer overflows. [Compare enlarged text](mobile-large-text.png). Local Playwright Firefox and WebKit cover this alongside Chromium. Enlarged root text is a reflow check, not physical-device or native zoom testing.

## Visual comparison

Compared the compiled review binary from the unmodified #60 commit with a separate ordinary build, using the same snapshot of published site content and the original sculpture. Captured the engineering section on both routes at 390 × 844 and 1440 × 900, in review, blocked and accepted states. Reduced motion was used for stills. All 12 pairs had the same dimensions and content; 11 matched pixel for pixel. In the desktop reader’s review state, 16 pixels on one sculpture edge differed by at most 4/255 per color channel. The phone reader’s review and blocked sections measured 516 CSS pixels high (517-pixel capture including the fractional edge).

Normal-motion checks measure the line gap at approximately 10 CSS pixels during a valid review, 28 after a stale acceptance, and 0 after fresh approval. With reduced motion, the line moves instantly. Controls, keyboard focus, disclosure, alternative renderer, direct entry, and Back restoration were also exercised. Public builds exclude the historical review routes and bundle; the opt-in build keeps the former versions available for comparison.

Local capture and automated checks use Chromium, emulated viewports and software rendering. These are not physical iOS/Android or assistive-technology sessions.

## Repeat the focused checks

- `npx playwright test --config=playwright.jobpilot-production.config.ts --project=jobpilot-public-register --workers=1` — public two-route interaction, six widths, both motion modes, keyboard, history, and project isolation.
- `npx playwright test --config=playwright.jobpilot-registration.config.ts --workers=1` — archived study and its predecessor comparisons.
- `npx playwright test --config=playwright.cross-browser.config.ts --project=firefox-city-alignment --project=webkit-city-alignment --workers=1` — the actual text positions on both 320px routes in two more browser engines.
- `npx playwright test tests/e2e/profile-boundary.spec.ts tests/e2e/jobpilot-handoff.spec.ts --project=chromium --workers=1` — the ordinary opening, return, focus and stale approval.
