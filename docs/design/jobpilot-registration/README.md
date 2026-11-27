# JobPilot: Which city is saved?

The third variant turns the existing ivory plate into a visual guide to the actual profile-revision check. In the local demonstration, Tripoli can be proposed and reviewed while Beirut is still saved. A separate edit saves Byblos; the outdated review cannot save Tripoli. Only a current, accepted review joins the two marks. Reset restores Beirut at revision 1.

- Compare all three: `/review/jobpilot-registration/index.html` on this branch’s Vercel Preview.
- Jump to the interaction: `/review/jobpilot/registration?project=jobpilot-ai#jobpilot-engineering`.
- Reader: `/review/jobpilot/registration/reader#engineering`.
- Previous versions: `/review/jobpilot/candidate` (approved composition) and `/review/jobpilot/motion` (PR #59).
- [Phone capture](phone-comparison.jpg) and [desktop capture](desktop-comparison.jpg) show the same moment in each version. To judge timing, use the actual routes or the recordings from the registration CI job.

The CSS rule changes by state and connects to the existing plate’s fixed support; it does not measure the DOM, add WebGL work or control navigation. Normal motion interpolates the marker for 230 ms. Reduced motion and Reset are immediate. Words, numbers, and a native live region explain the result without the mark or color. The print metaphor is illustrative, not a claim about the system architecture.

Local verification: typecheck, lint, normal and explicit review builds, normal-bundle exclusion, motion/state and build-policy tests. The registration browser suite exercised six widths (320/390/430/768/1280/1440), real reducer actions, blocked approval, Reset, keyboard navigation, round-trip focus/selected workflow, enlarged type and reduced motion. The matched screenshots and video use the real sculpture and UI with local test records. A separate desktop Chrome inspection ran against a read-only copy of published CMS content. Browser emulation is not physical-device validation. The photographed artwork, portrait, and voice were not edited.
