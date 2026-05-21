# Content Workflow

Use this guide for routine academic website updates. The goal is accurate,
maintainable public content, not volume.

## Before Editing

1. Identify the target page from `ARCHITECTURE.md`.
2. Read the current page and preserve its tone and section structure unless the
   user asked for a broader rewrite.
3. Confirm any factual inputs needed for the update: title, author order, venue,
   year, DOI, repository URL, dataset URL, talk title, event, date, or CV file
   path.

If a fact is missing, ask for it or leave an explicit placeholder only when the
user requested placeholder content.

## Publications

- Add newest publications first.
- Preserve author order exactly as provided by the source.
- Include DOI and stable publisher/preprint/data links when available.
- Keep summaries short and factual: question, method, key result or
  contribution, and why it matters.
- Do not convert working papers into publications without confirmation.

Suggested publication block:

```markdown
### Paper title

Author One, Zack Murphy, and Author Three. *Venue*, volume/pages, year.  
[DOI](https://doi.org/...){target="_blank"} | [Data](https://...){target="_blank"}

One short paragraph summarizing the contribution.
```

## Research And Software

- Prefer durable project descriptions over time-sensitive status language.
- Distinguish personal software projects from collaborations.
- Link to repositories, docs, releases, and datasets only after verifying the
  destination.
- For FPVS Studio or FPVS Toolbox updates, keep claims aligned with the current
  public repository state.

## Media And CV

- For YouTube embeds, use only the video ID inside
  `https://www.youtube.com/embed/VIDEO_ID`.
- Add dates and event names for talks when known.
- Put CV PDFs under `assets/` and link them from `cv.qmd`.
- If replacing a CV file, verify the filename used in `cv.qmd` matches the
  actual asset path.

## Verification Checklist

Run:

```powershell
git diff --check
quarto render
```

Then inspect the changed page locally when the update affects layout, embeds,
assets, or navigation.
