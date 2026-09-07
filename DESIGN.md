---
name: Zack Murphy Academic Portfolio
description: An easy-to-read academic portfolio with a restrained space-flight visual language.
colors:
  deep-space: "#07111f"
  flight-deck: "#0e2034"
  starlight: "#f5f7fa"
  lunar-gray: "#bcc8d4"
  orbit-line: "#506c86"
  orbital-blue: "#6eb7ff"
  signal-red: "#fc3d21"
  solar-gold: "#ffd166"
typography:
  display:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "clamp(40px, 5.3cqw, 64px)"
    fontWeight: 400
    lineHeight: 1.09
  headline:
    fontFamily: "Georgia, Times New Roman, serif"
    fontWeight: 650
    lineHeight: 1.15
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "1.03rem"
    fontWeight: 400
    lineHeight: 1.68
  label:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "0.96rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  focus: "3px"
  control: "6px"
  surface: "8px"
  full: "999px"
spacing:
  compact: "10px"
  grid-gap: "18px"
  surface: "20px"
  panel: "22px"
  page-edge: "24px"
  section-gap: "32px"
components:
  button-primary:
    backgroundColor: "{colors.orbital-blue}"
    textColor: "{colors.deep-space}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.deep-space}"
    textColor: "{colors.orbital-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "44px"
  inline-code:
    backgroundColor: "{colors.flight-deck}"
    textColor: "{colors.orbital-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.focus}"
    padding: "2px 4px"
---

# Design System: Zack Murphy Academic Portfolio

## Overview

**Creative North Star: "Easy to read academic portfolio"**

This system frames an academic portfolio as a calm view from a flight deck: dark, focused, and information-first. Space-flight color provides identity, while generous line height, bright text, and a familiar serif-and-sans pairing keep research content effortless to read.

The visual language is modern, sleek, and intentional without copying NASA marks or implying NASA endorsement. It rejects generic SaaS aesthetics, institutional university templates, dashboard styling, ornamental editorial treatments, excessive cards and dividers, low-contrast minimalism, and decorative motion that competes with the academic content.

**Key Characteristics:**

- Deep navy surfaces with decisive light-on-dark contrast.
- Serif academic authority paired with a highly readable system sans.
- Vibrant accents used as signals, never decoration without purpose.
- Precise spacing, restrained ambient depth, and visible keyboard focus.
- Responsive reflow and calm reading surfaces, with a static neural
  constellation image on the homepage.

## Colors

The palette takes its character from deep space, instrument panels, orbit paths, and mission signals while reserving its brightest colors for interaction and orientation.

### Primary

- **Orbital Blue:** The default link, inline-code, primary-action, and active-state color. It is bright enough to remain readable on both dark surfaces.

### Secondary

- **Signal Red:** A rare mission-status accent for emphasis, never the default body text or a substitute for a text label.
- **Solar Gold:** The universal keyboard-focus and hover signal. Its warmth makes orientation unmistakable against the cool navy system.

### Neutral

- **Deep Space:** The page canvas and navigation background.
- **Flight Deck:** The shared raised surface for guide controls and dropdowns.
- **Starlight:** Primary headings and body text.
- **Lunar Gray:** Secondary prose and supporting metadata.
- **Orbit Line:** Borders, dividers, and control outlines that must remain perceivable in the dark theme.

### Named Rules

**The Signal Discipline Rule.** Orbital Blue communicates interaction, Signal Red communicates rare emphasis, and Solar Gold communicates focus; never exchange those roles for decoration.

**The Contrast Before Color Rule.** Every functional color pair must meet WCAG 2.2 AA before it enters the stylesheet.

**The Continuous Field Rule.** Ambient color glows must span the page with same-hue alpha fades and explicit no-repeat behavior. Only the star field may tile, preventing visible bands where Orbital Blue, Signal Red, and Deep Space meet.

**The Constellation Rule.** The star field uses irregular positions, varied brightness and scale, and occasional restrained four-point stars. No repeated row, column, or spacing interval should be visually dominant.

## Typography

**Display Font:** Georgia (with Times New Roman fallback)

**Body Font:** Segoe UI (with Arial fallback)

**Character:** Georgia gives research headings a scholarly voice without ornamental editorial styling. Segoe UI gives long-form academic copy an open, neutral rhythm suited to dark surfaces and high-information pages. Both use local system fonts so content appears immediately without external font requests.

### Hierarchy

- **Display** (400, `clamp(40px, 5.3cqw, 64px)`, 1.09 line height): The Neural Constellation home-page research statement only; see its scoped rules below.
- **Headline** (650, responsive section scale, 1.15 line height): Page and section headings.
- **Title** (650, inherited responsive scale, 1.2 line height): Card and subsection headings.
- **Body** (400, 1.03rem, 1.68 line height): Academic prose, lists, publication information, and updates.
- **Label** (600, 0.96rem, normal case): Navigation, buttons, and compact panel labels.

### Named Rules

**The Reading First Rule.** Body copy always receives more breathing room on a dark surface; never compress line height to create artificial density.

**The One Display Moment Rule.** The prominent serif display belongs to the home-page research statement, balanced with the neural constellation and introductory copy at every viewport width.

## Elevation

Depth is restrained and ambient. Tonal layering does most of the work: Flight Deck surfaces separate from Deep Space with a clear border, while navigation dropdowns use a quiet shadow. The homepage portrait and software rows remain flat.

### Shadow Vocabulary

- **Menu orbit** (`0 16px 36px rgba(0, 0, 0, 0.32)`): Temporary navigation menus.

### Named Rules

**The Ambient Depth Rule.** Shadows must be broad, dark, and quiet; never use a sharp shadow to simulate a clickable card.

## Components

Components are precise, calm, and immediately legible. Shape is gently squared, color roles remain stable, and focus is never hidden inside a subtle state change.

### Buttons

- **Shape:** Gently curved controls (6px radius) with a minimum 44px height.
- **Primary:** Orbital Blue surface with Deep Space text and compact horizontal padding.
- **Hover / Focus:** Solar Gold replaces the blue signal; a 3px Solar Gold external outline makes keyboard focus explicit.
- **Secondary:** Transparent Deep Space surface with an Orbital Blue border and text; hover changes both to Solar Gold.

### Homepage Software Rows

- **Shape:** Compact rows with a 6px radius, flat tonal background, and no enclosing panel border.
- **Interaction:** The complete row is one link target. An arrow signals navigation, while the gold focus outline identifies the full boundary.
- **Tokens:** Use the scoped homepage palette and spacing described below.

### Navigation

- **Style:** Pinned Deep Space bar with a single Orbit Line divider and a serif site title.
- **Targets:** Navigation links and controls are at least 44px high.
- **States:** Starlight at rest, Solar Gold for hover, active, and visible focus. Preserve the existing Google Scholar blue and ORCID green profile treatments.
- **Contents:** Research Interests, Publications, the Software dropdown, CV, and Learn About FPVS on the left; Google Scholar, ORCID, and GitHub on the right.
- **Mobile Treatment:** Preserve Quarto's normal collapsed menu and its toggle; the expanded menu remains a single dark surface.

### Links

- **Style:** Orbital Blue with a persistent underline and 3px underline offset.
- **States:** Solar Gold on hover and a 3px Solar Gold focus outline for keyboard navigation.

### Inline Code

- **Style:** Orbital Blue text on a Flight Deck background with compact 2px by 4px padding.
- **Purpose:** File extensions and literal technical identifiers only; never use monospace as decorative shorthand for technical content.

## Neural Constellation Homepage

The approved homepage composition uses an open two-column hero: the research
statement, introduction, actions, and compact portrait row sit beside a brain
drawn with starlight. Below it, two compact software rows balance one publication
summary, followed by the FPVS learning link. On narrow screens these sections
stack in reading order. Retain the native Quarto navigation and its accessible
mobile behavior.

The content composition is scoped to `#zm-constellation` and its palette to
`body.neural-home`. Keep the original shared navbar layout, software dropdown,
profile icons, and mobile collapse. Other pages retain their existing content
styles and palette.

| Homepage token | Value | Purpose |
| --- | --- | --- |
| `--zm-bg` | `oklch(17% .03 253)` | Calm page canvas |
| `--zm-fg` | `oklch(97% .007 250)` | Headings and primary text |
| `--zm-muted` | `oklch(79% .025 252)` | Introductory prose and metadata |
| `--zm-blue` | `oklch(79% .115 250)` | Links and primary action |
| `--zm-line` | `oklch(35% .04 252)` | Quiet section boundaries |
| `--zm-surface` | `oklch(21.5% .038 253)` | Selected software rows |
| `--zm-gold` | `oklch(87% .13 85)` | Hover and visible keyboard focus |

Homepage headings use Georgia at weight 400. The desktop hero headline uses
`clamp(40px, 5.3cqw, 64px)`, a 1.09 line height, and -0.035em letter spacing.
Body text uses Segoe UI at 16px with a 1.65 base line height; the introduction
uses 1.75. Software rows have a restrained 6px radius without surrounding
panel borders. The small portrait identifies the researcher without competing
with the main research statement.

### Motion

The homepage is static, as requested by the site owner. Use a recognizable
brain resembling the original constellation artwork, with a clearly visible
brain stem. The artwork has no caption or playback controls.

- Display `assets/brain-constellation.svg` directly as an image; do not use a
  canvas or brain JavaScript.
- Disable animations and transitions throughout the homepage, including
  smooth scrolling, header motion, and hover arrow movement.
- Preserve native navigation interactions, visible keyboard focus, and
  immediate hover/focus color changes.
- Keep content, links, and the brain image useful without JavaScript.

The artwork belongs in `assets/brain-constellation.svg`; content stays in
`index.qmd` and all homepage layout and state styling stays in `styles.css`.

## Do's and Don'ts

### Do

- **Do** keep the Creative North Star, "Easy to read academic portfolio," ahead of decorative ambition.
- **Do** use Starlight for primary text and Lunar Gray only for secondary text on Deep Space or Flight Deck.
- **Do** reserve Solar Gold for focus and hover orientation so keyboard position is unmistakable.
- **Do** keep every required text contrast at 4.5:1 or higher and essential non-text contrast at 3:1 or higher.
- **Do** preserve semantic headings, descriptive alternative text, and responsive reflow. Keep the homepage static, with immediate navigation and color/focus feedback.

### Don't

- **Don't** use generic SaaS aesthetics.
- **Don't** use institutional university templates.
- **Don't** use dashboard styling.
- **Don't** use ornamental editorial treatments.
- **Don't** use excessive cards and dividers.
- **Don't** use low-contrast minimalism.
- **Don't** use decorative motion that competes with the academic content.
- **Don't** use NASA insignia, logotype, identifiers, or any treatment that implies NASA endorsement.
- **Don't** use a colored side stripe wider than 1px as a substitute for hierarchy.
