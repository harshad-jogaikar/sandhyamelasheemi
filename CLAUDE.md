# CLAUDE.md — sandhya-melasheemi-site

Static Astro 5 site, no framework islands, no CMS. Content is JSON in `src/data/`; pure logic in `src/lib/` (tested with vitest); pages in `src/pages/`.

Planning docs live in the Obsidian vault: `Badminton/Sandhya Website/` (`_Index Sandhya Website.md`). Read the index first for intent, decisions and open questions. Never add planning docs to this repo.

## Conventions
- Design direction is "Ink & Gold" (Direction A, decided 2026-10-08). Tokens in `src/styles/global.css`; do not introduce new colours or fonts without a vault decision.
- Facts about Sandhya must come from a cited source (see `honours.json` `source` fields) or be marked `confirmed: false` / wrapped in `[brackets]` in copy.
- Images go through `src/components/Photo.astro`; keep placeholder notes until a real file exists.
- Forms go through `src/components/EnquiryForm.astro`; the endpoint is configured in `site.json`, never hard-coded.
- Keep `src/lib` coverage at 80%+ (`npm run test:coverage`). Run `npm run check` and `npm run build` before committing.
- Commit format: `<type>: <description>` (feat, fix, refactor, docs, test, chore).

## Commands
```
npm run dev | build | preview | check | test | test:coverage
```
