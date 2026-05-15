#!/usr/bin/env node
/**
 * build-editable-pptx — PPTX-ready HTML 디렉토리 → 편집 가능한 .pptx
 *
 * 디렉토리 안의 슬라이드 HTML 파일들을 정렬 후 html2pptx로 한 장씩 변환하여
 * 단일 PPTX로 묶는다. 이미지 캡처 방식과 달리 PowerPoint/Keynote에서
 * 텍스트·도형·표를 그대로 편집할 수 있다.
 *
 * Usage:
 *   node build-editable-pptx.js <input-dir> [output.pptx] [--pattern=slide*.html] [--layout=LAYOUT_16x9]
 *
 * Examples:
 *   node build-editable-pptx.js docs/workspace
 *   node build-editable-pptx.js docs/workspace docs/output.pptx
 *   node build-editable-pptx.js docs/workspace --pattern="slide-*.html"
 *
 * 입력 HTML 요구사항 (html2pptx 제약):
 *   - body 크기가 layout과 일치 (LAYOUT_16x9 → 720pt × 405pt = 960px × 540px)
 *   - 웹 안전 폰트만 사용 (Arial, Verdana, Georgia, Courier New)
 *   - CSS gradient / animation 사용 금지
 *   - 모든 텍스트는 <p>/<h1-6>/<ul>/<ol> 안에
 *   - 콘텐츠가 body 밖으로 넘치면 변환 실패
 *
 * 자세한 가이드: skills/oh-my-slides/SKILL.md 의 "Phase 4-B 방식 A"
 */

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (const a of args) {
    if (a.startsWith('--')) {
        const [k, v] = a.slice(2).split('=');
        flags[k] = v === undefined ? true : v;
    } else {
        positional.push(a);
    }
}

const wantHelp = flags.help || flags.h;
if (wantHelp || positional.length === 0) {
    console.log(`Usage: node build-editable-pptx.js <input-dir> [output.pptx] [options]

Options:
  --pattern=GLOB    슬라이드 HTML 매칭 패턴 (기본: slide*.html)
  --layout=NAME     PPTX 레이아웃 (기본: LAYOUT_16x9; 다른 값: LAYOUT_4x3, LAYOUT_WIDE)
  --help, -h        이 도움말

PPTX-ready HTML 요구사항:
  - body 크기를 layout에 맞춤 (16x9 → 960px × 540px)
  - 웹 안전 폰트만 (Arial/Verdana/Georgia/Courier New)
  - CSS gradient / animation 금지
  - 모든 텍스트는 <p>/<h1-6>/<ul>/<ol> 안에
`);
    process.exit(wantHelp ? 0 : 1);
}

const INPUT_DIR = path.resolve(positional[0]);
const OUT_PPTX = positional[1]
    ? path.resolve(positional[1])
    : path.join(path.dirname(INPUT_DIR), path.basename(INPUT_DIR) + '.pptx');
const PATTERN = flags.pattern || 'slide*.html';
const LAYOUT = flags.layout || 'LAYOUT_16x9';

if (!fs.existsSync(INPUT_DIR) || !fs.statSync(INPUT_DIR).isDirectory()) {
    console.error(`Error: input directory not found: ${INPUT_DIR}`);
    process.exit(1);
}

function globToRegex(glob) {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp('^' + pattern + '$', 'i');
}

const matcher = globToRegex(PATTERN);
const slideFiles = fs.readdirSync(INPUT_DIR)
    .filter(f => matcher.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(f => path.join(INPUT_DIR, f));

if (slideFiles.length === 0) {
    console.error(`Error: no HTML files matching "${PATTERN}" in ${INPUT_DIR}`);
    process.exit(1);
}

async function main() {
    console.log(`=== Build Editable PPTX ===`);
    console.log(`  Input dir: ${INPUT_DIR}`);
    console.log(`  Pattern:   ${PATTERN}`);
    console.log(`  Slides:    ${slideFiles.length}`);
    console.log(`  Layout:    ${LAYOUT}`);
    console.log(`  Output:    ${OUT_PPTX}\n`);

    const pres = new pptxgen();
    pres.layout = LAYOUT;

    let failed = 0;
    for (let i = 0; i < slideFiles.length; i++) {
        const file = slideFiles[i];
        const label = `[${i + 1}/${slideFiles.length}] ${path.basename(file)}`;
        try {
            await html2pptx(file, pres);
            console.log(`  ✓ ${label}`);
        } catch (e) {
            failed++;
            console.error(`  ✗ ${label}`);
            console.error(`    ${e.message.split('\n').join('\n    ')}`);
        }
    }

    if (failed > 0) {
        console.error(`\n${failed} slide(s) failed. PPTX not written.`);
        process.exit(1);
    }

    fs.mkdirSync(path.dirname(OUT_PPTX), { recursive: true });
    await pres.writeFile({ fileName: OUT_PPTX });

    const sizeKB = (fs.statSync(OUT_PPTX).size / 1024).toFixed(1);
    console.log(`\n  Saved: ${OUT_PPTX}`);
    console.log(`  Total: ${slideFiles.length} slide(s) · ${sizeKB} KB`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
