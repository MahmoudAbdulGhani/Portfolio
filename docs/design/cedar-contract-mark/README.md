# Cedar: a fixed contract and a moving estimate

The original sculpture now acts as a measuring instrument on the ordinary Collection and case-study routes. A line runs from the fastener at the end of its green cross-beam to the $100,000 contract. The scale stays fixed from $0 to $200,000. A solid triangle locates the current estimate; an open diamond locates the figure used by the last explanation. Text beside the drawing also gives both values. The photograph never moves.

**Try it:** In Collection select Cedar Construction → Explore the engineering, or open the Cedar case study’s Engineering section. Select **Interpret the figures** at 50%, then change **Average phase progress** to 25%. The estimate crosses the contract from $80,000 to $160,000; the diamond stays at $80,000. **Refresh sample interpretation** moves only the diamond. **Reset** restores the opening and removes it. At 0% the dashed square shows only the $40,000 already invoiced. At 100% the same amount is a calculated estimate, even if the existing explanation still describes 0%.

[Five-second recording](contract-mark.mp4) · [390px comparison](comparison-390.webp) · [1440px comparison](comparison-1440.webp)

## What the review material shows

The comparisons use the normal compiled case-study page and a read-only snapshot of public project data. The left side is the parent build (7526a5d); the right side is this change, with 25% selected and the 50% explanation still showing. Both sides of the phone comparison are aligned to the progress control. The desktop comparison is a crop from each 1440px viewport. The silent MP4 is a crop of an actual Chromium screencast, using its frame timestamps, with no reconstructed marker animation. These files live in the repository, outside the frontend build.

The estimate changes immediately in text. A 440ms CSS transform shows the distance from the contract; interrupted movement retargets normally. Reduced motion and Reset show the final state immediately. On phones, Refresh is between the drawing and the explained figures so visitors can see which mark moves.

## Checks and limits

- The existing calculator, reducer, team attribution, sculpture file and source links are unchanged. No submissions, AI calls or accounting writes. Historical review variants retain their former drawing.
- Covered Collection and reader, crossing in both states, a mid-transition geometry sample, Reset during movement, 0% versus 100% at the same dollar position, reduced motion, keyboard controls, accessibility-tree amount, scoped axe and 320px reflow. The marker checks run on Chromium, Firefox and WebKit. Visual evidence uses browser emulation and software rendering; no physical phone or spoken screen-reader review.
- Early checks caught a faint explanation diamond and a missed WebKit Refresh tap in a tall phone layout. The revised mark is full contrast, and the action now sits next to the figure. Timeout and retry settings were not relaxed.
