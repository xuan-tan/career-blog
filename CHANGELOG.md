# Changelog

Notable changes to the career-blog site. Format follows [Keep a Changelog](https://keepachangelog.com/).

This is the first entry — earlier history lives in `git log`.

---

## [2026-09-20] — Editorial redesign

### Added

- **`.design-system.md`** — authoritative type & layout spec: typefaces, fluid scale, dark-first
  ink ramp, weight/italic discipline, measure, grid, and the verification rules. Read it before
  touching `assets/css/` or `layouts/`.
- **`assets/css/type-system.css`** — design tokens (`:root`), base typography, Tailwind Typography
  variable mapping, and the editorial list components.
- **`layouts/_default/editorial-list.html`** plus **`layouts/partials/editorial/{card,image}.html`**
  — feature-led asymmetric list layout, opt in per section with `layout: editorial-list`.
- **`layouts/partials/extend-head.html`** — font loading and the `type-system.css` resource link.
- **Blowfish placeholder thumbnail** for entries with no image of their own, so the grid never has
  a hole. `hideFeatureImage: true` opts a page out into a text-only note card.
- **Real tag links** on cards, resolving through Hugo's taxonomy permalinks.
- **`.sitemap-reference.md`**-style in-repo spec workflow extended to styling.

### Changed

- **Typefaces** — EB Garamond (display), Newsreader (text), Inter (meta/UI), replacing a single
  global EB Garamond with one heading weight. Fraunces was trialled and dropped: its capital J
  carries an intrinsic descending squiggle that no axis or stylistic alternate can remove.
- **Nav "Blog" → "Journal"**, and the section URL `/blog/` → `/journal/`. All 28 rendered pages
  carry an alias back to their old `/blog/...` path, so nothing 404s. `pageRef` targets updated.
- **Unified chrome voice** — desktop nav, page labels, card meta and footer all use the same
  12px tracked uppercase label treatment (Inter, weight 500).
- **Card structure** — image → title → date · reading time → summary → metadata bar, where the bar
  sandwiches the tags between two hairlines.
- **All 17 section indexes** moved to the editorial list layout (journal, career, BnB, all six
  travel countries, craft and its subsections, photosets).
- **`hero` shortcode** gained `title`/`subtitle` params that emit a real `<h1>`/`<p>`. The legacy
  `overlay="**Title** <br>Sub"` form still renders.
- Footer rescoped to quiet chrome (12px, regular weight, muted ink).

### Fixed

- **Horizontal overflow** — full-bleed breakouts using `100vw` overshot the viewport by the
  scrollbar width at every breakpoint. Clipped at the root with `overflow-x: clip` (not `hidden`,
  so sticky positioning survives).
- **Card images hijacked Back** — Blowfish binds `medium-zoom` to `img:not(.nozoom)`, and editorial
  card images sit inside a navigation link, so a click both navigated *and* opened the lightbox,
  pushing a history entry. Back then reopened the spotlight instead of the list. Card and feature
  images are now marked `nozoom`; article content images stay zoomable.
- **Article pages had no `<h1>`** — hero titles were inline `<strong>` markdown.
- **Serif leaking into UI chrome** — the base `p { font-family }` rule is element-scoped, so a
  `footer`/`nav` selector styled the box but not the `<p>` inside it. Seven surfaces were affected:
  site name, footer copyright, skip link, pagination, hero CTA, carousel labels, carousel titles.
- **Hierarchy inversion** — the feature card title (60px) was larger than its own page title (42px).
- **Feature meta collapsed** to a single 56px grid column and wrapped, after the meta element was
  renamed and the `grid-column: 1 / -1` selector silently stopped matching.
- **Card titles staggered ~21px** across a row when only some cards carried a kicker line.
- **Deck and body copy were the same size** in section intros, because an earlier rule forced
  `font-size: inherit` on everything nested in a standfirst.

### Removed

- `!important` font overrides in `custom.css`. Unnecessary: Blowfish is Tailwind v4, so unlayered
  CSS already outranks the `@layer` utilities — these were destroying the type hierarchy for free.
- Dead alias stubs for draft pages (Hugo emits an alias file with an *empty* redirect target for
  unpublished pages, which serves a blank page rather than a redirect).
- Trailing `---` in section intros that rendered as a stray `<hr>`.

### Content

- BnB section and its three posts unpublished (`draft: true`), so the section is no longer invisible
  while its posts stayed live.
- Travel section: real one-line descriptions, Switzerland flagged as the feature.

### Notes

- `/blog/...` URLs redirect rather than 404. `hugo serve` renders drafts, so unpublished content
  still appears locally; CI/production does not.
- Merging to `main` triggers GitHub Actions → GitHub Pages.
