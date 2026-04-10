/**
 * Slide Template (1280x720) HTML을 Playwright로 캡처하여 이미지 기반 PPTX 생성.
 *
 * Usage:
 *   node capture-and-build.js <workspace-dir> [slide-count] [output.pptx]
 *
 * Examples:
 *   node capture-and-build.js docs/workspace 20
 *   node capture-and-build.js docs/workspace 15 docs/my-presentation.pptx
 */
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const WS = path.resolve(process.argv[2] || __dirname);
const SLIDE_COUNT = parseInt(process.argv[3] || '20', 10);
const OUT_PATH = process.argv[4]
    ? path.resolve(process.argv[4])
    : path.join(WS, '..', 'presentation.pptx');

async function main() {
    // Step 1: Playwright로 HTML 슬라이드 캡처
    console.log(`=== Capturing ${SLIDE_COUNT} slides from ${WS} ===`);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    const imgDir = path.join(WS, 'slide-images');
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    const captured = [];
    for (let i = 1; i <= SLIDE_COUNT; i++) {
        const num = String(i).padStart(2, '0');
        const htmlPath = path.join(WS, `slide${num}.html`);
        if (!fs.existsSync(htmlPath)) { console.log(`  Skip: slide${num}.html (not found)`); continue; }
        const imgPath = path.join(imgDir, `slide-${num}.png`);
        await page.goto('file://' + htmlPath, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: imgPath });
        captured.push(imgPath);
        console.log(`  Captured: slide${num}.html`);
    }
    await browser.close();

    // Step 2: 이미지를 PPTX에 삽입
    console.log(`\n=== Building PPTX (${captured.length} slides) ===`);
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    for (const imgPath of captured) {
        const slide = pptx.addSlide();
        slide.addImage({ path: imgPath, x: 0, y: 0, w: 10, h: 5.625 });
    }

    await pptx.writeFile({ fileName: OUT_PATH });
    console.log(`Saved: ${OUT_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
