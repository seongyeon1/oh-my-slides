/**
 * 모든 슬라이드 HTML을 개별 PNG로 렌더링 (디버깅/검토용).
 *
 * Usage:
 *   node render-all.js <workspace-dir> [slide-count]
 *
 * Examples:
 *   node render-all.js docs/workspace 20
 *   node render-all.js docs/workspace 15
 *
 * Output: workspace-dir/review-slide01.png, review-slide02.png, ...
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const WS = path.resolve(process.argv[2] || __dirname);
const SLIDE_COUNT = parseInt(process.argv[3] || '20', 10);

async function renderAll() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });

    let rendered = 0;
    for (let i = 1; i <= SLIDE_COUNT; i++) {
        const num = String(i).padStart(2, '0');
        const htmlPath = path.join(WS, `slide${num}.html`);
        if (!fs.existsSync(htmlPath)) continue;
        await page.goto('file://' + htmlPath);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(WS, `review-slide${num}.png`), type: 'png' });
        rendered++;
    }
    await browser.close();
    console.log(`Done: ${rendered} slides rendered`);
}

renderAll().catch(e => { console.error(e); process.exit(1); });
