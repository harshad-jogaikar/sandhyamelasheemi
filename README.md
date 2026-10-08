# Sandhya Melasheemi — website

Portfolio and promotional site for Sandhya Melasheemi, Goa-born badminton champion (BWF World Senior Championships bronze medallist, Indian Masters national champion). Built with [Astro](https://astro.build) as a fully static site. No CMS, no database: all content lives in JSON files under `src/data/`.

Planning docs (spec, decisions, open questions) live in the Obsidian vault under `Badminton/Sandhya Website/`, not in this repo.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve dist/
npm test           # unit + DOM tests (vitest)
npm run check      # astro type check
```

## Where things are

| Path | What |
|---|---|
| `src/data/site.json` | Name, tagline, contact email, social handles, form endpoint, headline stats |
| `src/data/honours.json` | Every result. Drives the Honours table, home highlights and media kit |
| `src/data/news.json` | Press links |
| `src/data/timeline.json` | Milestones on the About page |
| `src/data/programmes.json` | Coaching programmes (also feed the coaching form's dropdown) |
| `src/data/packages.json` | Sponsorship tiers (also feed the sponsorship form's dropdown) |
| `src/data/gallery.json` | Photo and video entries |
| `src/pages/*.astro` | One file per page: `/`, `/about`, `/honours`, `/coaching`, `/partner`, `/gallery`, `/news`, `/contact`, `/media-kit`, `/404` |
| `src/components/` | Nav, Footer, Photo (image or placeholder), StatStrip, HighlightCard, NewsList, EnquiryForm |
| `src/lib/` | Pure helpers with tests: honours sorting/filtering, data validation, formatting, enquiry form logic |
| `src/styles/global.css` | Design tokens ("Ink & Gold": navy, off-white, gold accent; Archivo + Public Sans) |

## Updating content

**Add a result.** Append an object to `src/data/honours.json`. Required keys: `id` (unique), `year` (number or `null`), `level` (`world` | `national` | `state`), `event`, `category`, `result`, `medal` (`gold` | `silver` | `bronze` | `null`), `detail`, `partner`, `venue` (strings or `null`), `source` (`{label, url}` or `null`), `confirmed`, `highlight` (booleans). The build fails with a clear message if an entry is malformed. Set `highlight: true` on exactly three entries to control the home page cards.

**Add photos.** Drop files in `public/images/` and set `src: "/images/<file>"` wherever a `<Photo>` component or `gallery.json` entry currently has no `src`. Until a `src` is set, a labelled placeholder is rendered so the layout stays complete. Also replace `public/images/og-default.jpg` (1200×630) for social sharing previews.

**Bracketed text** such as `[Year]` or `[N]` marks facts still to be confirmed with Sandhya. Search the repo for `[` in `src/` to find them all.

## Forms

The three enquiry forms (sponsorship, coaching, contact) are progressive:

- With `forms.endpoint` set in `site.json` to a form service URL (Formspree, Web3Forms, Basin, etc.) that accepts JSON POSTs, they submit in-page and show a success message.
- With it empty (the default), submitting opens the visitor's mail client with the fields pre-filled, addressed to `contact.email`.

A hidden honeypot field (`_gotcha`) drops obvious bots.

## Deploy

Static output. Any host works; Vercel is the expected target (`npm run build`, output `dist/`). Set the `SITE_URL` environment variable to the production domain so canonical URLs and Open Graph tags are correct.
