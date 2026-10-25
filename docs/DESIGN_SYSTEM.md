# Noctra Design System

## Philosophy
"Quiet instrument panel at night" — not a SaaS template, not a Google Maps clone. Feels like a calm cockpit: dark, precise, readable, warm amber as the single "lamp" accent.

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0F1419` | Page background |
| `--color-surface` | `#171E26` | Card backgrounds |
| `--color-raised` | `#1D2630` | Elevated surfaces |
| `--color-border` | `#26303B` | All borders |
| `--color-text` | `#E8EDF2` | Primary text |
| `--color-muted` | `#9AA7B4` | Secondary text |
| `--color-accent` | `#F2B54A` | Amber accent — CTAs, highlights |

### Evidence Label Colors
| Label | Color | Icon | Visual |
|-------|-------|------|--------|
| KNOWN | `#4FD1B5` (teal) | Solid check | Solid fill |
| PROBABLE | `#7CB7FF` (sky) | Half-filled circle | Semi-transparent |
| OUTDATED | `#F2B54A` (amber) | Clock | Strikethrough value |
| UNKNOWN | `#B0A8C9` (violet-grey) | "?" | Dashed outline |

### Route Status Colors
| Status | Color |
|--------|-------|
| ROBUST | `#4FD1B5` (teal) |
| AT_RISK | `#F2B54A` (amber) |
| INFEASIBLE | `#EF6B6B` (red) |

## Typography

- **UI text:** Atkinson Hyperlegible (self-hosted via @fontsource)
- **Times & numbers:** JetBrains Mono, tabular-nums
- **Minimum body size:** 16px
- **Line height:** 1.6 for body, 1.2 for headings

## Spacing

8px base spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.

## Components

- **Card radius:** 12px
- **Shadow:** One subtle shadow (`0 4px 12px rgba(0,0,0,0.3)`)
- **Borders:** 1px solid `--color-border`, preferred over shadows
- **Touch targets:** Minimum 48px
- **Focus rings:** 2px solid accent, 2px offset

## Motion

Used sparingly, only for:
1. Smooth night-ribbon/deadline updates
2. Route draw-in on selection
3. Toast/drawer transitions

Always respect `prefers-reduced-motion`.

## Accessibility

- WCAG AA contrast verified
- Focus rings visible on all interactive elements
- `prefers-reduced-motion` respected
- Semantic HTML throughout
- ARIA labels on icon-only buttons
