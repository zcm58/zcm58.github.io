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
|-- learn-fpvs/          # Multi-page educational guide to FPVS
|-- assets/js/           # Small page-specific browser interactions
|-- media.qmd            # Videos, talks, public-facing communication
|-- cv.qmd               # CV download link and contact/profile links
|-- styles.css           # Quarto SCSS variables and site-specific CSS
|-- publish-website.ts   # Cross-platform render, commit, push, and publish helper
|-- publish-website.ps1  # Backward-compatible Windows wrapper
|-- PRODUCT.md           # Audience, brand, anti-references, accessibility
|-- DESIGN.md            # Visual system, tokens, components, and guardrails
|-- .impeccable/         # Machine-readable design-system metadata
|-- AGENTS.md            # Agent entry point and repo operating rules
|-- .vscode/tasks.json   # Cross-platform VS Code publish task
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
- `DESIGN.md` defines the visual contract and `.impeccable/design.json` mirrors
  its machine-readable extensions. Update both when the visual system changes.
- Assets should live under `assets/` when added. Use descriptive names such as
  `assets/cv.pdf`, `assets/headshot.jpg`, or `assets/talk-title-2026.jpg`.
- Keep page-specific browser behavior in a small vanilla JavaScript file under
  `assets/js/`; do not introduce a client framework for a single interaction.

## Page Responsibilities

- `index.qmd`: identity, research positioning, current focus, selected work,
  and recent updates.
- `research.qmd`: durable descriptions of research directions and methods.
- `publications.qmd`: verified publication metadata, links, and short summaries.
- `software.qmd`: tools, repositories, documentation links, releases, and design
  principles.
- `fpvs-toolbox.qmd`: placeholder page for future FPVS Toolbox content.
- `fpvs-studio.qmd`: placeholder page for future FPVS Studio content.
- `learn-fpvs/`: educational explanations of FPVS foundations, experiment-design
  topics, data analysis, terminology, and supporting references. Its
  `what-is-fpvs.qmd` page is the section entry point, `paradigm-design.qmd` is
  the experiment-design overview, `analysis-workflow.qmd` is the data-analysis
  overview, the remaining analysis pages correspond to its twelve workflow
  steps, and `_metadata.yml` controls guide-wide page options.
- `media.qmd`: talks, videos, tutorials, and public communication.
- `cv.qmd`: CV download and stable contact/profile links.

If content does not clearly belong to one of these pages, stop and propose the
placement before creating a new page.

The FPVS guide is the one exception to the root-page pattern. Its pages live
under `learn-fpvs/` and use a section-specific sidebar configured in
`_quarto.yml`. Keep research-program descriptions in `research.qmd` and
software instructions on the matching software page or external documentation;
link between them rather than duplicating their content in the guide.

## Styling Boundary

The current design is a dark academic profile with a restrained space-flight
feel: deep navy surfaces, readable light typography, blue and signal-red
accents, solar-gold focus indicators, and simple containers. Preserve that
identity unless the user asks for a redesign.

Use page-local markdown structure for content hierarchy. Use `styles.css` only
for repeated layout or presentation rules. Avoid one-off classes unless the
pattern is likely to recur.

## Build And Deploy

The intended build command is:

```powershell
quarto render
```

For one-click local publishing from VS Code, run the `Publish website` task or
run:

```shell
quarto run publish-website.ts
```

The TypeScript helper runs through Quarto's bundled cross-platform runtime on
Windows or Linux. It trims trailing whitespace from changed text files, clears
generated site output, performs one cache-refresh render, adds a deploy version
to rendered pages and local assets, commits source changes to `main`, and
publishes that exact output to `gh-pages` with
`quarto publish gh-pages --no-render`. It then verifies that both `gh-pages`
and the cache-busted live site expose the same version before reporting
success. The page marker reloads a stale cached page once with the current
deploy version, so visitors do not need to clear their browser cache.

## Change Policy

- Content edits should be factual and source-backed.
- Structure edits should update `_quarto.yml`, affected `.qmd` files, and this
  architecture map together.
- Visual edits should be checked in a browser at desktop and mobile widths.
- Dependency or framework changes require an explicit user request because the
  current stack is intentionally minimal.
