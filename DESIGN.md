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
    fontSize: "clamp(2.6rem, 5vw, 5.4rem)"
    fontWeight: 650
    lineHeight: 0.96
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
  feature-card:
    backgroundColor: "{colors.flight-deck}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.surface}"
    padding: "{spacing.surface}"
  hero-panel:
    backgroundColor: "{colors.flight-deck}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.surface}"
    padding: "{spacing.panel}"
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
- Static composition and responsive reflow rather than decorative motion.

## Colors

The palette takes its character from deep space, instrument panels, orbit paths, and mission signals while reserving its brightest colors for interaction and orientation.

### Primary

- **Orbital Blue:** The default link, inline-code, primary-action, and active-state color. It is bright enough to remain readable on both dark surfaces.

### Secondary

- **Signal Red:** A rare mission-status accent for emphasis, never the default body text or a substitute for a text label.
- **Solar Gold:** The universal keyboard-focus and hover signal. Its warmth makes orientation unmistakable against the cool navy system.

### Neutral

- **Deep Space:** The page canvas and navigation background.
- **Flight Deck:** The raised surface for the profile panel, selected-work containers, and dropdowns.
- **Starlight:** Primary headings and body text.
- **Lunar Gray:** Secondary prose and supporting metadata.
- **Orbit Line:** Borders, dividers, and control outlines that must remain perceivable in the dark theme.

### Named Rules

**The Signal Discipline Rule.** Orbital Blue communicates interaction, Signal Red communicates rare emphasis, and Solar Gold communicates focus; never exchange those roles for decoration.

**The Contrast Before Color Rule.** Every functional color pair must meet WCAG 2.2 AA before it enters the stylesheet.

## Typography

**Display Font:** Georgia (with Times New Roman fallback)

**Body Font:** Segoe UI (with Arial fallback)

**Character:** Georgia gives research headings a scholarly voice without ornamental editorial styling. Segoe UI gives long-form academic copy an open, neutral rhythm suited to dark surfaces and high-information pages. Both use local system fonts so content appears immediately without external font requests.

### Hierarchy

- **Display** (650, fluid hero scale, 0.96 line height): The home-page research statement only.
- **Headline** (650, responsive section scale, 1.15 line height): Page and section headings.
- **Title** (650, inherited responsive scale, 1.2 line height): Card and subsection headings.
- **Body** (400, 1.03rem, 1.68 line height): Academic prose, lists, publication information, and updates.
- **Label** (600, 0.96rem, normal case): Navigation, buttons, and compact panel labels.

### Named Rules

**The Reading First Rule.** Body copy always receives more breathing room on a dark surface; never compress line height to create artificial density.

**The One Display Moment Rule.** The oversized serif display belongs to the home-page research statement, not to every section.

## Elevation

Depth is restrained and ambient. Tonal layering does most of the work: Flight Deck surfaces separate from Deep Space with a clear border, while shadows appear only on the profile panel, dropdown, and headshot where physical separation improves hierarchy.

### Shadow Vocabulary

- **Panel orbit** (`0 20px 48px rgba(0, 0, 0, 0.34)`): The profile panel only.
- **Menu orbit** (`0 16px 36px rgba(0, 0, 0, 0.32)`): Temporary navigation menus.
- **Portrait orbit** (`0 12px 28px rgba(0, 0, 0, 0.42)`): The circular headshot only.

### Named Rules

**The Ambient Depth Rule.** Shadows must be broad, dark, and quiet; never use a sharp shadow to simulate a clickable card.

## Components

Components are precise, calm, and immediately legible. Shape is gently squared, color roles remain stable, and focus is never hidden inside a subtle state change.

### Buttons

- **Shape:** Gently curved controls (6px radius) with a minimum 44px height.
- **Primary:** Orbital Blue surface with Deep Space text and compact horizontal padding.
- **Hover / Focus:** Solar Gold replaces the blue signal; a 3px Solar Gold external outline makes keyboard focus explicit.
- **Secondary:** Transparent Deep Space surface with an Orbital Blue border and text; hover changes both to Solar Gold.

### Cards / Containers

- **Corner Style:** Restrained 8px radius.
- **Background:** Flight Deck above Deep Space.
- **Shadow Strategy:** Flat by default; only the profile panel receives Panel Orbit elevation.
- **Border:** One 1px Orbit Line around the complete surface; colored side stripes are prohibited.
- **Internal Padding:** 20px for selected-work containers and 22px for the profile panel.
- **Selected Work Interaction:** The complete card is one link target. A right arrow signals navigation, while Solar Gold identifies hover and keyboard focus across the full boundary.

### Navigation

- **Style:** Pinned Deep Space bar with a single Orbit Line divider and a serif site title.
- **Targets:** Navigation links and controls are at least 44px high.
- **States:** Starlight at rest, Solar Gold for hover, active, and visible focus.
- **Mobile Treatment:** The collapsed menu remains a single dark surface with no horizontal overflow.

### Links

- **Style:** Orbital Blue with a persistent underline and 3px underline offset.
- **States:** Solar Gold on hover and a 3px Solar Gold focus outline for keyboard navigation.

### Inline Code

- **Style:** Orbital Blue text on a Flight Deck background with compact 2px by 4px padding.
- **Purpose:** File extensions and literal technical identifiers only; never use monospace as decorative shorthand for technical content.

## Do's and Don'ts

### Do

- **Do** keep the Creative North Star, "Easy to read academic portfolio," ahead of decorative ambition.
- **Do** use Starlight for primary text and Lunar Gray only for secondary text on Deep Space or Flight Deck.
- **Do** reserve Solar Gold for focus and hover orientation so keyboard position is unmistakable.
- **Do** keep every required text contrast at 4.5:1 or higher and essential non-text contrast at 3:1 or higher.
- **Do** preserve semantic headings, descriptive alternative text, responsive reflow, and reduced-motion behavior.

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
