# Architecture

This is a small Quarto website for a personal academic profile. The architecture
should stay boring and legible: Quarto handles page rendering, root `.qmd` files
own content, `_quarto.yml` owns site configuration, and `styles.css` owns visual
presentation.

## Repository Map

```text
.
|-- _quarto.yml          # Quarto website configuration and navigation
|-- index.qmd            # Home page and current focus
|-- research.qmd         # Research program, projects, methods, collaborations
|-- publications.qmd     # Publications, preprints, working papers
|-- software.qmd         # Research software and project links
|-- fpvs-toolbox.qmd     # Placeholder page for FPVS Toolbox
|-- fpvs-studio.qmd      # Placeholder page for FPVS Studio
|-- media.qmd            # Videos, talks, public-facing communication
|-- cv.qmd               # CV download link and contact/profile links
|-- styles.css           # Quarto SCSS variables and site-specific CSS
|-- AGENTS.md            # Agent entry point and repo operating rules
`-- docs/agent/          # Deeper agent guidance for recurring workflows
```

Generated directories such as `_site/` and `.quarto/` are build output and are
not source-of-truth files.

## Site Model

- `_quarto.yml` defines the website type, navbar, footer, HTML theme stack, and
  global rendering options.
- Each root `.qmd` file is a top-level site page and should be directly linked
  from the navbar only when it is meant to be public navigation.
- `styles.css` combines Quarto SCSS defaults and custom CSS rules. Keep shared
  visual primitives here instead of inline styles in page files.
- Assets should live under `assets/` when added. Use descriptive names such as
  `assets/cv.pdf`, `assets/headshot.jpg`, or `assets/talk-title-2026.jpg`.

## Page Responsibilities

- `index.qmd`: identity, research positioning, current focus, selected work,
  and recent updates.
- `research.qmd`: durable descriptions of research directions and methods.
- `publications.qmd`: verified publication metadata, links, and short summaries.
- `software.qmd`: tools, repositories, documentation links, releases, and design
  principles.
- `fpvs-toolbox.qmd`: placeholder page for future FPVS Toolbox content.
- `fpvs-studio.qmd`: placeholder page for future FPVS Studio content.
- `media.qmd`: talks, videos, tutorials, and public communication.
- `cv.qmd`: CV download and stable contact/profile links.

If content does not clearly belong to one of these pages, stop and propose the
placement before creating a new page.

## Styling Boundary

The current design is an academic profile with a restrained editorial feel:
warm paper background, serif headings, teal/rust/green accents, and simple
cards. Preserve that identity unless the user asks for a redesign.

Use page-local markdown structure for content hierarchy. Use `styles.css` only
for repeated layout or presentation rules. Avoid one-off classes unless the
pattern is likely to recur.

## Build And Deploy

The intended build command is:

```powershell
quarto render
```

The site is expected to publish through GitHub Pages from the rendered Quarto
site output configured outside this repo or by the hosting workflow. Do not
change deployment behavior without first inspecting the current GitHub Pages
settings or workflow files.

## Change Policy

- Content edits should be factual and source-backed.
- Structure edits should update `_quarto.yml`, affected `.qmd` files, and this
  architecture map together.
- Visual edits should be checked in a browser at desktop and mobile widths.
- Dependency or framework changes require an explicit user request because the
  current stack is intentionally minimal.
