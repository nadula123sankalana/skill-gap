# Design System — Internship Skill Gap Assessment

Calm, credible, academic-but-modern — closer to a university career-services dashboard than a marketing site. The red / yellow / green severity indicator is the one deliberately memorable visual element; everything else stays quiet so that signal can do its job.

## Named colors

| Token | Hex | Role |
|---|---|---|
| `primary` | `#0E5F6B` | Deep teal — buttons, links, brand accent. Academic without looking clinical. |
| `background` | `#F2F5F6` | Cool mist gray-blue page canvas. Soft, not cream, not near-black. |
| `surface` | `#FFFFFF` | Cards, panels, form surfaces. |
| `foreground` | `#1A2B30` | Primary text — charcoal with a cool teal undertone. |
| `muted` | `#5A6B70` | Secondary text, labels, helper copy. |
| `border` | `#D5DEE1` | Hairlines and input borders. |
| `severity-red` | `#C44536` | Critical gap (high priority). |
| `severity-yellow` | `#C49A1A` | Moderate gap. |
| `severity-green` | `#2A7A55` | On track / low gap. |

Severity colors are intentionally slightly desaturated so they feel institutional rather than alarmist, while still reading clearly as a traffic-light system.

## Typography

| Role | Family | Why |
|---|---|---|
| Display | **Sora** | Geometric, modern, confident for page titles — not a display serif (avoids the cream+terracotta academic cliché). |
| Body | **Source Sans 3** | Highly readable humanist sans for forms, tables, and long copy. |
| Data / mono | **IBM Plex Mono** | Clear tabular figures for scores, gap values, and charts. |

## What we deliberately avoided

- Cream background + terracotta + serif display
- Near-black canvas + neon accent
- Broadsheet newspaper columns
- Default shadcn zinc/slate purple-leaning vibes without customization

## Severity indicator usage

Use the shared `SeverityBadge` / `severity-*` tokens everywhere gaps appear (dashboard charts, lists, admin cohort views). Do not invent alternate reds/yellows/greens per page.
