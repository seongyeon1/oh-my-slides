# 빌드 유틸리티 — 재사용 가능한 JS 패턴

PPTX 생성 시 반복 사용되는 헬퍼 함수, 스타일 상수, 워크플로우 스크립트.

---

## 1. 테이블 스타일링 상수 (다크 테마)

```javascript
// ─── Table styling constants ────────────────────────────────────
const TH = { fill: { color: '1e3a5f' }, color: 'f0f0f0', bold: true, fontSize: 10, align: 'center', valign: 'middle' };
const TD = { fill: { color: '1a2332' }, color: 'f0f0f0', fontSize: 10, valign: 'middle' };
const TD_ALT = { fill: { color: '162033' }, color: 'f0f0f0', fontSize: 10, valign: 'middle' };
const TD_GOOD = { fill: { color: '1a2332' }, color: '22c55e', bold: true, fontSize: 10, valign: 'middle' };
const TD_GOOD_ALT = { fill: { color: '162033' }, color: '22c55e', bold: true, fontSize: 10, valign: 'middle' };
const TD_WARN = { fill: { color: '1a2332' }, color: 'f59e0b', bold: true, fontSize: 10, valign: 'middle' };
const TD_WARN_ALT = { fill: { color: '162033' }, color: 'f59e0b', bold: true, fontSize: 10, valign: 'middle' };
const TD_BAD = { fill: { color: '1a2332' }, color: 'ef4444', fontSize: 10, valign: 'middle' };
const TD_BAD_ALT = { fill: { color: '162033' }, color: 'ef4444', fontSize: 10, valign: 'middle' };
const TABLE_BORDER = { pt: 0.5, color: '334155' };
```

### 색상 의미
- **TH**: 헤더 행 (진한 네이비)
- **TD / TD_ALT**: 기본 행 (짝수/홀수 줄무늬)
- **TD_GOOD**: 긍정적 값 (녹색) — 최고 성능, 장점
- **TD_WARN**: 주의 값 (노란색) — 중간 수준
- **TD_BAD**: 부정적 값 (빨간색) — 문제점, 느린 성능

### 라이트 테마 변형

```javascript
const TH_LIGHT = { fill: { color: '047857' }, color: 'ffffff', bold: true, fontSize: 10, align: 'center', valign: 'middle' };
const TD_LIGHT = { fill: { color: 'ffffff' }, color: '1a1a1a', fontSize: 10, valign: 'middle' };
const TD_LIGHT_ALT = { fill: { color: 'f9fafb' }, color: '1a1a1a', fontSize: 10, valign: 'middle' };
const TD_LIGHT_GOOD = { fill: { color: 'ffffff' }, color: '047857', bold: true, fontSize: 10, valign: 'middle' };
const TD_LIGHT_WARN = { fill: { color: 'ffffff' }, color: 'd97706', bold: true, fontSize: 10, valign: 'middle' };
const TD_LIGHT_BAD = { fill: { color: 'ffffff' }, color: 'dc2626', bold: true, fontSize: 10, valign: 'middle' };
```

---

## 2. 헬퍼 함수

### addNativeTable — placeholder에 네이티브 테이블 삽입

```javascript
function addNativeTable(slide, placeholder, headerRow, dataRows, opts = {}) {
    const rows = [
        headerRow.map(h => ({ text: h, options: TH })),
        ...dataRows
    ];
    slide.addTable(rows, {
        x: placeholder.x,
        y: placeholder.y,
        w: placeholder.w,
        h: placeholder.h,
        border: TABLE_BORDER,
        colW: opts.colW,
        rowH: opts.rowH,
        autoPage: false,
    });
}
```

### row — 줄무늬 + 스타일 힌트 지원 행 생성

```javascript
function row(cells, isEven) {
    return cells.map(c => {
        if (typeof c === 'string') {
            return { text: c, options: isEven ? TD_ALT : TD };
        }
        // Object with style hint: { text, style: 'good'|'warn'|'bad' }
        const styleMap = {
            good: isEven ? TD_GOOD_ALT : TD_GOOD,
            warn: isEven ? TD_WARN_ALT : TD_WARN,
            bad: isEven ? TD_BAD_ALT : TD_BAD,
        };
        return { text: c.text, options: styleMap[c.style] || (isEven ? TD_ALT : TD) };
    });
}
```

### 사용 예시

```javascript
const p = result.placeholders.find(p => p.id === 'table-results');
if (p) {
    addNativeTable(slide, p,
        ['Method', 'Latency (μs)', 'Speedup'],
        [
            row(['BM25', '51,522', '1x'], false),
            row(['HNSW', '1,878', '27x'], true),
            row(['SEISMIC', { text: '303', style: 'good' }, { text: '170x', style: 'good' }], false),
        ],
        { colW: [3.0, 3.5, 3.5] }
    );
}
```

---

## 3. 그라데이션 헤더 오버레이

CSS 그라데이션은 html2pptx에서 지원하지 않으므로, Sharp로 PNG를 미리 생성 후 슬라이드에 오버레이.

### PNG 생성 (빌드 전 1회)

```javascript
const sharp = require('sharp');

async function createGradientHeader(filename, colors = ['#1e3a5f', '#0ea5e9']) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="88">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${colors[0]}"/>
          <stop offset="100%" style="stop-color:${colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(filename);
    return filename;
}
```

### 슬라이드에 적용

```javascript
const HEADER_GRADIENT = path.join(WS, 'header-gradient.png');

function addGradientHeader(slide) {
    // 44pt 헤더 높이 = ~0.61 inches
    slide.addImage({ path: HEADER_GRADIENT, x: 0, y: 0, w: 10, h: 0.61 });
}

// HTML에서는 단색 배경으로 처리하고, build.js에서 그라데이션 PNG를 위에 덮어씌움
// HTML: <div style="background: #1e3a5f; height: 44pt; ...">
```

---

## 4. 이미지 placeholder에 비율 유지하여 삽입

```javascript
function addImageToPlaceholder(slide, placeholder, imgPath, imgWidth, imgHeight) {
    const aspect = imgWidth / imgHeight;
    let w, h, x, y;

    if (placeholder.w / placeholder.h > aspect) {
        // placeholder가 더 넓음 → 높이 맞춤
        h = placeholder.h;
        w = h * aspect;
        x = placeholder.x + (placeholder.w - w) / 2;
        y = placeholder.y;
    } else {
        // placeholder가 더 높음 → 너비 맞춤
        w = placeholder.w;
        h = w / aspect;
        x = placeholder.x;
        y = placeholder.y + (placeholder.h - h) / 2;
    }
    slide.addImage({ path: imgPath, x, y, w, h });
}

// 사용 예시:
// addImageToPlaceholder(slide, placeholder, 'diagram.png', 2459, 643);
```

---

## 5. 캡처 & 빌드 워크플로우 (이미지 기반 PPTX)

Slide Template (1280x720) HTML들을 Playwright로 캡처하여 이미지 기반 PPTX 생성.
텍스트 편집은 불가하지만, 디자인 자유도가 높고 빌드가 단순함.

```javascript
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const WS = __dirname;
const SLIDE_COUNT = 20; // 슬라이드 수에 맞게 조정

async function main() {
    // Step 1: Playwright로 HTML 슬라이드 캡처
    console.log('=== Capturing slides ===');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    const imgDir = path.join(WS, 'slide-images');
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);

    for (let i = 1; i <= SLIDE_COUNT; i++) {
        const num = String(i).padStart(2, '0');
        const htmlPath = path.join(WS, `slide${num}.html`);
        const imgPath = path.join(imgDir, `slide-${num}.png`);
        await page.goto('file://' + htmlPath, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500); // 폰트 로딩 대기
        await page.screenshot({ path: imgPath });
        console.log(`  Captured: slide${num}.html`);
    }
    await browser.close();

    // Step 2: 이미지를 PPTX에 삽입
    console.log('=== Building PPTX ===');
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = '프레젠테이션 제목';
    pptx.author = '발표자';

    for (let i = 1; i <= SLIDE_COUNT; i++) {
        const num = String(i).padStart(2, '0');
        const imgPath = path.join(imgDir, `slide-${num}.png`);
        const slide = pptx.addSlide();
        slide.addImage({ path: imgPath, x: 0, y: 0, w: 10, h: 5.625 }); // 16:9 전체
    }

    const outPath = path.join(WS, '..', 'output.pptx');
    await pptx.writeFile({ fileName: outPath });
    console.log(`Saved: ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

---

## 6. 프리뷰 그리드 생성 (Sharp)

모든 슬라이드를 한 이미지에 그리드로 합쳐서 빠르게 리뷰.

```javascript
const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const WS = __dirname;

async function renderPreviewGrid(slideCount, cols = 4) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });

    const slides = [];
    for (let i = 1; i <= slideCount; i++) {
        const num = String(i).padStart(2, '0');
        const htmlPath = path.join(WS, `slide${num}.html`);
        if (!fs.existsSync(htmlPath)) continue;
        await page.goto('file://' + htmlPath);
        await page.waitForTimeout(300);
        slides.push(await page.screenshot({ type: 'png' }));
    }
    await browser.close();

    // 그리드 레이아웃 계산
    const rows = Math.ceil(slides.length / cols);
    const tw = 480, th = 270, gap = 4, labelH = 20;
    const gridW = cols * tw + (cols - 1) * gap;
    const gridH = rows * (th + labelH) + (rows - 1) * gap;

    // 리사이즈
    const resized = await Promise.all(
        slides.map(buf => sharp(buf).resize(tw, th, { fit: 'fill' }).png().toBuffer())
    );

    // 합성
    const composite = [];
    for (let idx = 0; idx < resized.length; idx++) {
        const col = idx % cols;
        const r = Math.floor(idx / cols);
        const x = col * (tw + gap);
        const y = r * (th + labelH + gap) + labelH;
        composite.push({ input: resized[idx], left: x, top: y });
        // 슬라이드 번호 라벨
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

    await sharp({
        create: { width: gridW, height: gridH, channels: 4, background: { r: 26, g: 26, b: 26, alpha: 1 } }
    })
        .composite(composite)
        .png()
        .toFile(path.join(WS, 'preview-grid.png'));

    console.log(`Preview grid: ${slides.length} slides`);
}

renderPreviewGrid(20, 4).catch(e => { console.error(e); process.exit(1); });
```

---

## 7. build.js 구조 템플릿 (html2pptx 방식)

편집 가능한 PPTX를 만들 때의 build.js 기본 구조.

```javascript
const pptxgen = require('pptxgenjs');
const html2pptx = require('./scripts/html2pptx');
const path = require('path');

const WS = path.join(__dirname);

// 위의 테이블 스타일 상수 & 헬퍼 함수 포함
// (TH, TD, TD_ALT, TD_GOOD, ... addNativeTable, row)

async function build() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = '제목';
    pptx.author = '발표자';

    // ─── 각 슬라이드 ──────────────────────────────────────
    // 타이틀 슬라이드 (그라데이션 헤더 없음)
    await html2pptx(path.join(WS, 'slide01.html'), pptx);

    // 일반 슬라이드 (그라데이션 헤더 + 테이블)
    const s = await html2pptx(path.join(WS, 'slide02.html'), pptx);
    addGradientHeader(s.slide);
    const p = s.placeholders.find(p => p.id === 'table-xxx');
    if (p) {
        addNativeTable(s.slide, p,
            ['Header1', 'Header2', 'Header3'],
            [
                row(['A', 'B', { text: 'Best', style: 'good' }], false),
                row(['C', 'D', 'E'], true),
            ],
            { colW: [3.0, 3.5, 3.5] }
        );
    }

    // 이미지가 있는 슬라이드
    const si = await html2pptx(path.join(WS, 'slide03.html'), pptx);
    const pi = si.placeholders.find(p => p.id === 'diagram');
    if (pi) addImageToPlaceholder(si.slide, pi, 'diagram.png', 1466, 2223);
    addGradientHeader(si.slide);

    // ─── 저장 ──────────────────────────────────────────────
    const outPath = path.join(WS, '..', 'output.pptx');
    await pptx.writeFile({ fileName: outPath });
    console.log(`Saved: ${outPath}`);
}

build().catch(e => { console.error(e); process.exit(1); });
```

---

## 요약: 두 가지 PPTX 워크플로우

| 방식 | 장점 | 단점 | 사용 시기 |
|------|------|------|----------|
| **html2pptx (build.js)** | 텍스트 편집 가능, 네이티브 테이블/차트 | 복잡한 빌드 스크립트 | 편집이 필요한 공식 발표 자료 |
| **캡처 & 빌드** | 빌드 단순, 디자인 자유도 높음 | 텍스트 편집 불가 | 디자인 중심, 빠른 제작 |
