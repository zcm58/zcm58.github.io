# Agent Guide

This repository is the source for Zack Murphy's personal academic website at
`https://zcm58.github.io`. Keep this file short: it is the map agents should
read first, not the full manual.

## Start Here

- Read `ARCHITECTURE.md` before changing site structure, navigation, styling, or
  build behavior.
- Read `docs/agent/content-workflow.md` before updating publications, research
  descriptions, media, CV links, or public profile links.
- Inspect the relevant `.qmd` page before editing it. Do not infer current
  content from memory.

## Working Principles

- State assumptions when the request is ambiguous. Ask before inventing
  academic facts, publication metadata, affiliations, dates, or claims.
- Make the smallest change that satisfies the request. Do not redesign adjacent
  pages or reorganize content unless asked.
- Preserve the Quarto website model: content in `.qmd`, site navigation in
  `_quarto.yml`, visual styling in `styles.css`.
- Keep public-facing text accurate and conservative. Prefer plain academic
  language over marketing copy.
- Match existing style: concise sections, markdown links with
  `{target="_blank"}` for external links, and restrained visual changes.
- When adding external claims or publication details, verify them from the
  supplied source or a stable public source before editing.

## Common Tasks

- Page content: edit the matching root `.qmd` file.
- Navigation, title, site URL, footer, or theme: edit `_quarto.yml`.
- Layout, colors, fonts, buttons, cards, video embeds: edit `styles.css`.
- Site architecture or agent guidance: update `ARCHITECTURE.md` and this file
  together if the source-of-truth contract changes.

## Verification

Run the narrowest useful checks for the change:

```powershell
git diff --check
quarto render
```

If Quarto is not installed in the local environment, say so and still run
`git diff --check`. For visual or layout changes, open the rendered site and
inspect desktop and mobile widths before claiming the UI is done.

## Boundaries

- Do not commit generated `_site/`, `.quarto/`, or notebook intermediates.
- Do not add large assets without confirming where they should live and how they
  should be compressed.
- Do not replace verified publication metadata with summaries from memory.
- Do not add new frameworks, package managers, or build systems unless the user
  explicitly asks for them.
