/**
 * 모든 슬라이드를 한 이미지에 그리드로 합쳐서 빠르게 리뷰.
 *
 * Usage:
 *   node render-preview.js <workspace-dir> [slide-count] [cols]
 *
 * Examples:
 *   node render-preview.js docs/workspace 20
 *   node render-preview.js docs/workspace 15 5
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const WS = path.resolve(process.argv[2] || __dirname);
const SLIDE_COUNT = parseInt(process.argv[3] || '20', 10);
const COLS = parseInt(process.argv[4] || '4', 10);

async function renderPreviewGrid() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });

    const slides = [];
    for (let i = 1; i <= SLIDE_COUNT; i++) {
        const num = String(i).padStart(2, '0');
        const htmlPath = path.join(WS, `slide${num}.html`);
        if (!fs.existsSync(htmlPath)) continue;
        await page.goto('file://' + htmlPath);
        await page.waitForTimeout(300);
        slides.push(await page.screenshot({ type: 'png' }));
    }
    await browser.close();

    if (slides.length === 0) { console.log('No slides found.'); return; }

    // 그리드 레이아웃 계산
    const rows = Math.ceil(slides.length / COLS);
    const tw = 480, th = 270, gap = 4, labelH = 20;
    const gridW = COLS * tw + (COLS - 1) * gap;
    const gridH = rows * (th + labelH) + (rows - 1) * gap;

    const resized = await Promise.all(
        slides.map(buf => sharp(buf).resize(tw, th, { fit: 'fill' }).png().toBuffer())
    );

    const composite = [];
    for (let idx = 0; idx < resized.length; idx++) {
        const col = idx % COLS;
        const r = Math.floor(idx / COLS);
        const x = col * (tw + gap);
        const y = r * (th + labelH + gap) + labelH;
        composite.push({ input: resized[idx], left: x, top: y });
        composite.push({
            input: Buffer.from(
                `<svg width="${tw}" height="${labelH}">
                  <rect width="${tw}" height="${labelH}" fill="#1a1a1a"/>
                  <text x="4" y="15" font-family="Arial" font-size="13" fill="#fff">Slide ${idx + 1}</text>
                </svg>`
            ),
            left: x, top: y - labelH,
        });
    }

    const outPath = path.join(WS, 'preview-grid.png');
    await sharp({
        create: { width: gridW, height: gridH, channels: 4, background: { r: 26, g: 26, b: 26, alpha: 1 } }
    })
        .composite(composite)
        .png()
        .toFile(outPath);

    console.log(`Preview grid saved: ${outPath} (${slides.length} slides, ${COLS} cols)`);
}

renderPreviewGrid().catch(e => { console.error(e); process.exit(1); });
