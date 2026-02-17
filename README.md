# KodNest Premium Build System

Design system for a serious B2C product. Calm, intentional, coherent, confident.

## What’s included

- **`css/tokens.css`** — Colors, typography, spacing, radii, motion (CSS custom properties).
- **`css/base.css`** — Reset, body, headings, body copy.
- **`css/layout.css`** — Top Bar, Context Header, Workspace + Panel, Proof Footer.
- **`css/components.css`** — Buttons, badges, cards, inputs, prompt box, proof checklist.
- **`css/states.css`** — Error and empty states.
- **`css/index.css`** — Single entry; import this file.

## Usage

Link the design system in your app:

```html
<link rel="stylesheet" href="css/index.css" />
```

Use the layout classes and component classes as shown in `index.html`. No product features are implemented; this is the design foundation only.

## Design rules

- **Colors:** Background `#F7F6F3`, text `#111111`, accent `#8B0000`, success (muted green), warning (muted amber). Max four color families.
- **Spacing:** 8px, 16px, 24px, 40px, 64px only.
- **Motion:** 150–200ms ease-in-out; no bounce or parallax.
- **No gradients, glassmorphism, neon, or decorative animation.**
