/**
 * Viewport HTML (단일 파일, 스크롤 기반) 프레젠테이션을 Playwright로 캡처하여 PPTX 생성.
 *
 * - .slide 셀렉터로 슬라이드 자동 감지
 * - reveal 애니메이션 활성화 (.visible 클래스 주입)
 * - nav dots, progress bar 자동 숨김
 * - 뷰포트 크기 조절로 콘텐츠 비율 최적화
 *
 * Usage:
 *   node capture-viewport.js <html-file> [output.pptx] [--width=1200] [--height=675]
 *
 * Examples:
 *   node capture-viewport.js docs/presentation.html
 *   node capture-viewport.js docs/presentation.html docs/output.pptx
 *   node capture-viewport.js docs/presentation.html output.pptx --width=1280 --height=720
 *
 * Options:
 *   --width=N     뷰포트 너비 (기본: 1200, 콘텐츠 max-width에 맞춰 조절)
 *   --height=N    뷰포트 높이 (기본: 675, 16:9 비율 유지)
 *   --selector=S  슬라이드 CSS 셀렉터 (기본: .slide)
 */
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

// --- Parse arguments ---
const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (const a of args) {
    if (a.startsWith('--')) {
        const [k, v] = a.slice(2).split('=');
        flags[k] = v;
    } else {
        positional.push(a);
    }
}

const HTML_FILE = path.resolve(positional[0] || '');
const OUT_PPTX = positional[1]
    ? path.resolve(positional[1])
    : HTML_FILE.replace(/\.html?$/i, '.pptx');
const VP_WIDTH = parseInt(flags.width || '1200', 10);
const VP_HEIGHT = parseInt(flags.height || '675', 10);
const SLIDE_SELECTOR = flags.selector || '.slide';

if (!positional[0] || !fs.existsSync(HTML_FILE)) {
    console.error('Usage: node capture-viewport.js <html-file> [output.pptx] [--width=N] [--height=N]');
    process.exit(1);
}

const OUT_DIR = path.join(path.dirname(HTML_FILE), '.viewport-captures');

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log(`=== Viewport Capture ===`);
    console.log(`  Input:    ${HTML_FILE}`);
    console.log(`  Viewport: ${VP_WIDTH}×${VP_HEIGHT}`);

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: VP_WIDTH, height: VP_HEIGHT });
    await page.goto('file://' + HTML_FILE, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for fonts & initial render
    await page.waitForTimeout(1000);

    // Activate all reveal animations
    await page.evaluate((sel) => {
        document.querySelectorAll(sel).forEach(s => s.classList.add('visible'));
    }, SLIDE_SELECTOR);
    await page.waitForTimeout(500);

    // Hide UI elements (nav dots, progress bar, etc.)
    await page.evaluate(() => {
        const selectors = ['#nav', '#progress', '.nav-dots', '.progress'];
        selectors.forEach(s => {
            const el = document.querySelector(s);
            if (el) el.style.display = 'none';
        });
    });

    // Detect slides
    const slideCount = await page.evaluate(
        (sel) => document.querySelectorAll(sel).length, SLIDE_SELECTOR
    );
    console.log(`  Slides:   ${slideCount}`);

    if (slideCount === 0) {
        console.error(`No slides found with selector "${SLIDE_SELECTOR}"`);
        await browser.close();
        process.exit(1);
    }

    // Capture each slide element
    const captured = [];
    for (let i = 0; i < slideCount; i++) {
        const num = String(i + 1).padStart(2, '0');
        const imgPath = path.join(OUT_DIR, `slide-${num}.png`);

        // Try id-based selector first, fall back to nth-child
        let slideEl = await page.$(`#slide-${i + 1}`);
        if (!slideEl) {
            slideEl = await page.$(`${SLIDE_SELECTOR}:nth-child(${i + 1})`);
        }

        if (slideEl) {
            await slideEl.screenshot({ path: imgPath, type: 'png' });
            captured.push(imgPath);
            console.log(`  Captured: slide ${i + 1}/${slideCount}`);
        } else {
            console.log(`  Skip: slide ${i + 1} (element not found)`);
        }
    }

    await browser.close();

    // Build PPTX
    console.log(`\n=== Building PPTX (${captured.length} slides) ===`);
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    for (const imgPath of captured) {
        const slide = pptx.addSlide();
        slide.addImage({ path: imgPath, x: 0, y: 0, w: 10, h: 5.625 });
    }

    await pptx.writeFile({ fileName: OUT_PPTX });
    console.log(`  Saved: ${OUT_PPTX}`);
}

main().catch(e => { console.error(e); process.exit(1); });
