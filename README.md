# oh-my-slides

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin that generates animation-rich HTML presentations from natural language prompts. 20 curated design presets, PPTX export, and zero-dependency output.

**English** | [한국어](README.ko.md)

![20 Curated Design Presets](docs/preset-gallery.png)

> **[Live Demo](https://seongyeon1.github.io/oh-my-slides/)** | Open [`gallery.html`](gallery.html) locally for the same experience.

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/seongyeon1/oh-my-slides.git
cd oh-my-slides
bash install.sh
```

The installer will:
- Install npm dependencies (Playwright, PptxGenJS, Sharp)
- Register the plugin in Claude Code's plugin system
- Enable the plugin automatically

### 2. Restart Claude Code

Close and reopen Claude Code (or start a new session) for the plugin to load.

### 3. Use

```
> PPT 만들어줘: AI 기술 트렌드 2026
> Create a presentation about microservices architecture
> 발표자료 만들어줘 — 주제: LLM Fine-tuning 실전 가이드
```

The skill triggers on presentation-related keywords in both Korean and English.

### Uninstall

```bash
bash uninstall.sh
```

Removes plugin registration from Claude Code. Your source files remain untouched.

---

## How It Works

### 5-Phase Workflow

![5-Phase Workflow](docs/workflow.gif)

**Phase 0** asks you two questions: which design source (preset or custom .pptx import) and output format (Viewport HTML or Slide Template).

**Phase 2** is where oh-my-slides differs from typical tools. Instead of asking "what color do you want?", it generates three mini-preview HTML files, takes screenshots with Playwright, and shows them side-by-side. You pick visually.

**Phase 4** produces a single self-contained HTML file. Every slide is exactly `100vh` tall — no internal scrolling, no overflow. Typography scales via `clamp()` so presentations render correctly from 13" laptops to 4K monitors.

---

## Concepts

### Viewport Fitting

Every slide uses `height: 100dvh; overflow: hidden`. Fonts and spacing use `clamp()` with height-based media queries for progressive reduction on smaller screens:

```css
--title-size: clamp(2rem, 6vw, 5rem);
--slide-padding: clamp(1rem, 4vw, 4rem);

@media (max-height: 700px) { /* reduce padding */ }
@media (max-height: 500px) { /* shrink headings */ }
```

### Signature Elements

Each preset has unique visual signatures (e.g., halftone textures for Creative Voltage, double inset borders for Dark Academia). These signatures repeat consistently across all slides — mixing signatures from different presets is explicitly prohibited.

### Zero-dependency HTML

Output is a single `.html` file with inline CSS and JS. Fonts load from Google Fonts via `<link>`. No build step, no framework, no runtime dependency. Open in any browser and present.

### Dual Output

- **HTML** — for presenting (animations, keyboard/touch navigation, progress bar)
- **PPTX** — for editing (PowerPoint, Keynote, Google Slides)

---

## 20 Design Presets

| # | Preset | Mood | Font Pairing |
|---|--------|------|-------------|
| 1 | **Bold Signal** | Confident, Bold, High-impact | Archivo Black + Space Grotesk |
| 2 | **Electric Studio** | Clean, Professional, High-contrast | Manrope 800 / 400 |
| 3 | **Creative Voltage** | Energy, Creative, Retro-modern | Syne + Space Mono |
| 4 | **Dark Botanical** | Elegant, Refined, Premium | Cormorant + IBM Plex Sans |
| 5 | **Notebook Tabs** | Editorial, Organized, Tactile | Bodoni Moda + DM Sans |
| 6 | **Pastel Geometry** | Friendly, Soft, Modern | Plus Jakarta Sans |
| 7 | **Split Pastel** | Playful, Creative, Friendly | Outfit |
| 8 | **Vintage Editorial** | Witty, Editorial, Character | Fraunces + Work Sans |
| 9 | **Neon Cyber** | Futuristic, Tech, Confident | Clash Display + Satoshi |
| 10 | **Terminal Green** | Developer, Hacker aesthetic | JetBrains Mono |
| 11 | **Swiss Modern** | Clean, Precise, Bauhaus | Archivo + Nunito |
| 12 | **Paper & Ink** | Literary, Editorial, Thoughtful | Cormorant Garamond + Source Serif 4 |
| 13 | **Neo-Brutalism** | Punk, Anti-design, Bold | Arial Black + Courier New |
| 14 | **Bento Grid** | Apple-style, Sleek, Organized | SF Pro / Inter |
| 15 | **Dark Academia** | Academic, Vintage, Classic | Playfair Display + EB Garamond |
| 16 | **Glassmorphism** | Translucent, Depth, Premium | Inter |
| 17 | **Gradient Mesh** | Artistic, Colorful, Fluid | Bebas Neue + Outfit |
| 18 | **Duotone Split** | Contrast, Graphic, Intense | Bebas Neue + Space Mono |
| 19 | **Risograph Print** | Retro, Handmade, Art poster | Bebas Neue + Space Mono |
| 20 | **Cyberpunk Outline** | Wireframe, Hacker, Blueprint | Bebas Neue + Space Mono |

### Mood Recommendation Matrix

| Presentation purpose | 1st pick | 2nd pick | 3rd pick |
|---------------------|----------|----------|----------|
| Tech conference | Swiss Modern | Terminal Green | Cyberpunk Outline |
| Startup pitch | Bold Signal | Gradient Mesh | Electric Studio |
| Academic / paper | Dark Academia | Paper & Ink | Swiss Modern |
| Team seminar | Bento Grid | Notebook Tabs | Swiss Modern |
| Design / creative | Risograph Print | Gradient Mesh | Neo-Brutalism |
| Data / analytics | Electric Studio | Swiss Modern | Bento Grid |
| Education / tutorial | Pastel Geometry | Notebook Tabs | Split Pastel |
| Product launch | Glassmorphism | Bold Signal | Neon Cyber |
| Code review | Terminal Green | Cyberpunk Outline | Dark Botanical |
| Executive report | Dark Botanical | Electric Studio | Paper & Ink |

Presets are individual CSS files in `skills/oh-my-slides/templates/presets/`. You can add your own.

---

## Custom Theme Import

Extract a design system from any `.pptx` file to create a new preset:

```bash
node skills/oh-my-slides/scripts/import-pptx-theme.js company-template.pptx my-brand --dark
```

This reads the PPTX theme XML, extracts colors/fonts/media, maps Office fonts to Google Fonts equivalents, and generates:
- `skills/oh-my-slides/templates/presets/custom-my-brand.css`
- `skills/oh-my-slides/templates/assets/custom-my-brand/`

---

## PPTX Export

Three methods available, depending on your needs:

| Method | Script | Editable? | Fidelity |
|--------|--------|-----------|----------|
| **Viewport capture** | `capture-viewport.js` | No | Pixel-perfect |
| **Slide capture** | `capture-and-build.js` | No | Pixel-perfect |
| **Editable PPTX** | `build-editable-pptx.js` | **Yes** | Web-safe fonts only |

```bash
# Image-based (pixel-perfect, not editable) — single viewport HTML → PPTX
node skills/oh-my-slides/scripts/capture-viewport.js presentation.html output.pptx
node skills/oh-my-slides/scripts/capture-viewport.js presentation.html output.pptx --width=1200 --height=675

# Editable PPTX — PPTX-ready HTML directory → editable .pptx
# Iterates slide*.html files and runs html2pptx on each, producing real text/shape/table objects
node skills/oh-my-slides/scripts/build-editable-pptx.js docs/workspace
node skills/oh-my-slides/scripts/build-editable-pptx.js docs/workspace docs/output.pptx
node skills/oh-my-slides/scripts/build-editable-pptx.js docs/workspace --pattern="slide-*.html"
```

### Editable PPTX requirements

Editable mode preserves text/shapes/tables as native PowerPoint objects, so the input HTML
must follow PPTX constraints (the rich viewport HTML used for browser presentation won't
work as-is — author a separate PPTX-ready HTML set):

- **Body size matches layout**: 16:9 → `width: 960px; height: 540px` (= 720pt × 405pt)
- **Web-safe fonts only**: Arial, Verdana, Georgia, Courier New
- **No CSS gradients, no animations** (use solid colors; gradients → pre-rendered PNG overlay)
- **All text inside semantic tags**: `<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`
- Content must fit inside body (no overflow)

See [`skills/oh-my-slides/SKILL.md`](skills/oh-my-slides/SKILL.md) ("Phase 4-B 방식 A") and
[`references/build-utilities.md`](skills/oh-my-slides/references/build-utilities.md) for
templates, native table helpers, and gradient-header workarounds.

---

## Scripts Reference

All scripts are in `skills/oh-my-slides/scripts/`:

| Script | Description |
|--------|-------------|
| `capture-viewport.js` | Single viewport HTML → image-based PPTX. Auto-activates reveal animations, hides nav UI |
| `capture-and-build.js` | Multiple slide template HTMLs (1280x720) → image-based PPTX |
| `import-pptx-theme.js` | Extract .pptx theme → custom CSS preset + media assets |
| `render-preview.js` | All slides → single preview grid image (for quick review) |
| `render-all.js` | Each slide → individual PNG files |
| `create-gradient.js` | Generate gradient PNG via Sharp (for PPTX header overlays) |
| `html2pptx.js` | Library: convert a single HTML slide → editable pptxgenjs slide (text, shapes, images) |
| `build-editable-pptx.js` | CLI: PPTX-ready HTML directory → editable multi-slide `.pptx` (uses `html2pptx.js`) |

---

## Project Structure

```
oh-my-slides/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata for Claude Code
├── skills/
│   └── oh-my-slides/
│       ├── SKILL.md             # Skill definition (5-phase workflow)
│       ├── references/
│       │   ├── design-guide.md  # 20 preset specs + anti-patterns
│       │   ├── slide-template.md # 1280x720 slide template guide
│       │   └── build-utilities.md # PPTX build helpers
│       ├── templates/
│       │   ├── viewport-base.html # Viewport mode base HTML
│       │   ├── slide-base.html    # Slide Template mode base HTML
│       │   ├── presets/           # 20 CSS preset files
│       │   ├── layouts/           # 8 slide layout patterns
│       │   └── components/        # Reusable CSS modules
│       └── scripts/               # Node.js automation (8 scripts)
├── gallery.html                   # Interactive preset gallery
├── install.sh                     # One-command installer
├── uninstall.sh                   # Clean uninstaller
└── docs/
    └── preset-gallery.png         # Gallery screenshot for README
```

---

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI, Desktop, or IDE extension
- Node.js 18+
- npm dependencies (installed automatically by `install.sh`):
  - [Playwright](https://playwright.dev/) — screenshot capture, PPTX generation
  - [Sharp](https://sharp.pixelplumbing.com/) — image processing
  - [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) — PPTX file generation

---

## Manual Installation

If you prefer not to use the install script:

1. Clone the repo anywhere on your machine
2. Install dependencies:
   ```bash
   npm install playwright pptxgenjs sharp
   npx playwright install chromium
   ```
3. Create the marketplace directory:
   ```bash
   mkdir -p ~/.claude/plugins/marketplaces/oh-my-slides-local/.claude-plugin
   mkdir -p ~/.claude/plugins/marketplaces/oh-my-slides-local/plugins
   ```
4. Write `~/.claude/plugins/marketplaces/oh-my-slides-local/.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "oh-my-slides-local",
     "description": "Local marketplace for oh-my-slides",
     "plugins": [{
       "name": "oh-my-slides",
       "source": "./plugins/oh-my-slides",
       "category": "productivity"
     }]
   }
   ```
5. Symlink the plugin:
   ```bash
   ln -s /path/to/oh-my-slides ~/.claude/plugins/marketplaces/oh-my-slides-local/plugins/oh-my-slides
   ```
6. Add to `~/.claude/settings.json`:
   ```json
   {
     "enabledPlugins": {
       "oh-my-slides@oh-my-slides-local": true
     },
     "extraKnownMarketplaces": {
       "oh-my-slides-local": {
         "source": { "source": "directory", "path": "~/.claude/plugins/marketplaces/oh-my-slides-local" }
       }
     }
   }
   ```
7. Restart Claude Code

---

## License

MIT
