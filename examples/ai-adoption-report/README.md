# Example: AI Adoption Report (editable PPTX)

A 6-slide reference report demonstrating the patterns the editable PPTX pipeline
handles well: title hero, KPI cards, bar chart from styled divs, two-column
comparison, multi-row data table from a div grid, and a numbered conclusion
with a CTA bar.

## Pre-built output

The committed [`ai-adoption-report.pptx`](ai-adoption-report.pptx) (≈179 KB) is the
PPTX produced by the steps below. Download and open in PowerPoint / Keynote /
Google Slides to click around the bars, table cells, and text runs — everything
is a native editable object, not flattened pixels.

## Build it yourself

```bash
node ../../skills/oh-my-slides/scripts/build-editable-pptx.js . ./ai-adoption-report.pptx
```

Expected: 6 slides convert without errors → `Total: 6 slide(s) · 179.0 KB`.

## What's exercised

| Slide | Patterns |
|---|---|
| `slide01-title.html` | Hero title, accent bar, footer rule, mixed Georgia/Arial typography |
| `slide02-kpi.html` | Four side-by-side cards with different background colors (white, dark, white, yellow) and color-coordinated text |
| `slide03-barchart.html` | Bar chart as positioned `<div>` shapes + numeric labels + side takeaway panel — fully editable bars |
| `slide04-comparison.html` | Two-column then/now comparison with bulleted lists and inline `<b>` color-keyword highlights |
| `slide05-quarterly.html` | Six-row × five-column data table built from positioned div grid (header row + alternating row colors + emphasized total row) |
| `slide06-conclusion.html` | Three numbered priority columns with badge shapes + bottom CTA bar |

All six follow the [PPTX-ready HTML constraints](../../README.md#editable-pptx-requirements):
960×540 body, web-safe fonts (Arial / Georgia), no gradients, no animations,
text inside semantic tags.

## Use as a starting point

Copy this directory, rename slides, swap content. The CSS in each file is
self-contained — no external stylesheet, no fragile inheritance. Edit numbers
and labels directly in the HTML, rebuild with the CLI, and PowerPoint will let
your end user edit further.

For the rendered output, see the PR #1 description on GitHub.
