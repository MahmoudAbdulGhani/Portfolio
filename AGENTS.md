# Project Guidelines

Full-stack Portfolio & CMS built with Node.js/Express backend and a modern React frontend.

## Rules for AI Agents

- Keep code clean, modern, and modular.
- Responses must be brief, direct, and code-focused.
- NEVER hardcode or expose `.env` variables, DB connection strings, or API secrets.
- Always validate inputs on public backend routes.
- Follow existing code conventions and patterns.
- Preserve existing security, rate-limiting, and validation protections.
- Do not commit secrets or generated/dist artifacts unless intended.
- Run typecheck, lint, and relevant tests before considering a change complete.

## Application CV layout

The application CV is a pixel-level match to a reference PDF. Its geometry lives
in the `APPLICATION` constant in `server/src/lib/cv.js` and was measured from
that document.

- `npm run test:cv-reference --prefix server` (no args) runs against the static
  fallback and needs no database or network access.
- Add `--db` to render from live data instead, e.g.
  `node --env-file=server/.env server/scripts/test-cv-reference.mjs --db`.
- The committed fixture `server/test/fixtures/application-cv-reference.json` is
  the source of truth for the test. It records the reference's geometry, and its
  line text is the *intended* output, which may deliberately differ from the
  reference document where content has been corrected since. The AWS re/Start
  date reads `July 2025 - Oct 2025` in the fixture but `Expected 2026` in the
  reference.
- Regenerate the fixture only when the reference document itself is intentionally
  replaced. Doing so reverts any such corrections:
  `python scripts/cv-diff.py <reference.pdf> <any.pdf> --emit-fixture server/test/fixtures/application-cv-reference.json`
- The test tolerates 2.0pt horizontally, 1.0pt vertically, and 1.0pt for rule
  positions to absorb font-substitution drift. It does not tolerate content,
  line breaks, or section order, so do not "fix" wrapping by loosening these.
- If you change layout, re-run `npm run test:cv --prefix server` too; the master
  CV must stay on A4 with Source Sans while the application CV stays on Letter
  with Carlito/Caladea.
