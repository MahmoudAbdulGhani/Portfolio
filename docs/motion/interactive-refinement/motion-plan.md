# Section motion direction

Use the same original assets, palette and saved content. Each section gets one distinct primary motion. Avoid repeating fade-up on every heading, row and card.

| Section | Choreography | Status |
| --- | --- | --- |
| Hero | Opposing horizontal text masks; center-out photo reveal; copy clears before portrait expansion | Built |
| Stack | Two compact outlined chip belts traveling in opposite directions | Built |
| Projects | Five real medium thumbnails fan into view for 1.8s, then a center-out carousel reveal. Advance every 5.5s with an infinite spring wrap; drag, arrows, dots and keys remain available | Built |
| Technical architecture | Six selectable families group the original CMS categories. Panels exit left and enter right; compact two-column category navigation on phone | Built |
| About | Existing scroll word emphasis; remove secondary movement in a later pass | Existing |
| Experience | Existing growing timeline with progress-led rows; dates remain anchored | Existing |
| Education | Reveal the credential horizontally behind a mask; date and institution remain fixed; remove vertical drift | Built |
| Training | Rows draw their dividers in sequence; disclosure content opens with measured height; arrow rotates only on opening | Built |
| Contact | One horizontal heading reveal on entry; contact links stay fixed; no looping motion on email or AI tools | Built |

Hero timing: opposing type reveal 0.95s; portrait reveal 1.1s. Carousel uses a damped spring. Layout frames stay equal, with contain-fit artwork and existing landscape screenshots preferred over portrait covers. Autoplay yields during hover, focus and dragging, and while the section or tab is hidden; leaving the interaction starts a fresh cycle. No visible pause/resume button is added. Education and Contact masks reveal once per mount in 1.05s; Training dividers draw in 0.9s and disclosures open in 0.4s. Architecture panel transitions take 0.24s per phase.

On phone, retain compact chips and swipeable cards; omit the pinned portrait expansion. Device reduced-motion preferences bypass intros, autoplay and decorative movement, while manual controls remain usable. Desktop navigation links directly to the saved AI Job Match route. Colors, professional content and backend remain unchanged. Latest visual evidence and a 26-second browser-frame walkthrough are in `../cinematic-sections/`.
