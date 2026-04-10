---
name: oh-my-slides
description: >
  HTML 기반 애니메이션 프레젠테이션 생성.
  TRIGGER: 'PPT 만들어줘', 'HTML 프레젠테이션', '발표자료 만들어줘', '슬라이드 만들어줘',
  '애니메이션 PPT', 'html presentation', 'animated slides', '인터랙티브 발표자료',
  'ppt로 만들어', '프레젠테이션 만들어줘'.
  20가지 디자인 프리셋 + PPTX 커스텀 템플릿 임포트,
  Excalidraw 다이어그램, Viewport/Slide Template 모드 지원.
user-invocable: true
argument-hint: "oh-my-slides <주제 또는 내용>"
---

# PPT Generator

애니메이션이 풍부한 HTML 프레젠테이션 + 편집 가능한 PPTX를 생성하는 스킬.

## 핵심 원칙

1. **Show, Don't Tell** - 추상적 디자인 질문 대신 3가지 스타일 프리뷰를 생성하여 사용자가 시각적으로 선택
2. **Viewport Fitting** - 모든 슬라이드는 정확히 100vh에 맞춰야 함. 슬라이드 내부 스크롤 절대 불가
3. **Signature Element 반복** - 각 스타일의 시그니처 요소를 모든 슬라이드에 일관되게 반복. 다른 스타일의 시그니처를 혼합하지 않는다
4. **Distinctive Design** - 일반적인 AI 패턴 회피. 개성 있는 20가지 큐레이션된 스타일 + PPTX 커스텀 임포트. 정확한 HEX 값 사용 (비슷한 색 금지)
5. **텍스트만의 슬라이드 금지** - 모든 슬라이드에 최소 하나의 시각 요소 (도형, 색상 블록, 아이콘, 패턴) 포함
6. **듀얼 출력** - HTML 프레젠테이션(발표용) + PPTX(편집용) 동시 생성
7. **Zero-dependency HTML** - 단일 HTML 파일로 브라우저에서 바로 발표 가능
8. **다이어그램 자동 생성** - Excalidraw로 흐름도/아키텍처 생성

## 워크플로우 (5단계)

### Phase 0: 디자인 소스 & 출력 형식 선택 (AskUserQuestion 필수)

**반드시 AskUserQuestion으로 아래 두 가지를 사용자에게 물어본다.** Phase 1 질문과 함께 묶어서 한 번에 질문한다.

#### 질문 1: 디자인 소스 선택

> **어떤 디자인으로 만들까요?**
>
> **A. 기본 프리셋 (20종)** — 큐레이션된 디자인 스타일
>    - 무드/목적에 맞는 3가지 프리뷰를 보여드립니다
>    - 예: Bold Signal, Neon Cyber, Glassmorphism 등
>
> **B. 커스텀 템플릿** — 보유한 .pptx 파일에서 테마 추출
>    - B-1. **다크 테마** 기반으로 추출
>    - B-2. **라이트 테마** 기반으로 추출
>    - .pptx 파일 경로를 알려주세요

#### 질문 2: 출력 형식 선택

> **출력 형식을 선택해주세요:**
> 1. **Viewport HTML** (권장) — 단일 HTML 파일, 브라우저에서 스크롤/키보드 발표, 애니메이션
> 2. **Slide Template** — 1280×720 개별 HTML, PPTX 이미지 삽입용

**선택 기준:**
- 브라우저 발표 + 애니메이션 → Viewport HTML
- 슬라이드별 정교한 레이아웃/테이블/파이프라인 → Slide Template
- PPTX 편집 필요 → Slide Template

**템플릿 파일:**
- Viewport 모드: `templates/viewport-base.html`을 Read하여 기본 구조 참조
- Slide Template 모드: `templates/slide-base.html`을 Read하여 기본 구조 참조
- 레이아웃 패턴: `templates/layouts/` 디렉토리에서 필요한 패턴을 Read

상세 가이드: [slide-template.md](references/slide-template.md) (레이아웃 패턴 설명, 시각화 컴포넌트, 테마 팔레트)

#### 디자인 소스별 후속 처리

##### A. 기본 프리셋 선택 시
Phase 2 스타일 프리뷰로 진행. 무드/목적 기반으로 3가지 프리뷰를 생성하여 사용자가 선택.

##### B. 커스텀 템플릿 선택 시
사용자가 .pptx 파일 경로를 제공하면:
1. 테마 추출 스크립트 실행 (**반드시 `--workspace` 옵션 사용**):
   ```bash
   node .claude/skills/oh-my-slides/scripts/import-pptx-theme.js <file.pptx> <name> --workspace=docs/workspace [--dark|--light]
   ```
2. 추출된 디자인 시스템(색상, 폰트, 에셋)을 사용자에게 보여주고 확인
3. 확인 후 `templates/presets/custom-<name>.css`를 사용하여 진행
4. 필요 시 CSS 변수를 수동 조정 (사용자 피드백 반영)
5. HTML에서 에셋 참조 시 **`workspace/assets/custom-<name>/파일명`** 경로 사용 (docs/ 기준 상대경로)

### Phase 1: 콘텐츠 수집
AskUserQuestion으로 **Phase 0과 함께** 한 번에 수집:
- **목적**: 컨퍼런스 발표 / 팀 공유 / 교육 / 피치덱
- **슬라이드 수**: 5-10장 / 10-20장 / 20장+
- **핵심 메시지**: 전달하고자 하는 내용
- **이미지**: 포함할 이미지가 있는지, 어디에 있는지
- **편집 기능**: 인라인 편집 기능 필요 여부 (기본: 미포함)

이미지가 있으면 평가 후 텍스트+비주얼을 함께 고려한 슬라이드 구성을 설계.
**콘텐츠 밀도 제한**: 타이틀 슬라이드 1 제목+부제, 콘텐츠 슬라이드 최대 4-6 불릿. 초과 시 자동 분할.

### Phase 2: 스타일 프리뷰 (Show, Don't Tell)

**디자인을 텍스트로 묻지 않는다.** 대신 3가지 스타일 프리뷰 HTML을 생성하여 사용자에게 보여준다.

#### 프리뷰 생성 방법
`docs/workspace/` 에 3개의 프리뷰 HTML 파일을 생성:
- `preview-A.html` - 예: Bold Signal
- `preview-B.html` - 예: Notebook Tabs
- `preview-C.html` - 예: Neon Cyber

각 프리뷰는 타이틀 슬라이드 + 콘텐츠 슬라이드 1장을 포함한 미니 프레젠테이션 (50-100줄).
Playwright로 스크린샷을 찍어 사용자에게 보여준다.

사용자는 하나를 선택하거나, 요소를 조합할 수 있다.

#### 무드 → 스타일 추천

| 느낌 | 추천 프리셋 |
|------|-----------|
| 자신감/임팩트 | Bold Signal, Electric Studio, Duotone Split |
| 우아/프리미엄 | Dark Botanical, Dark Academia, Paper & Ink |
| 친근/접근성 | Pastel Geometry, Split Pastel, Notebook Tabs, Bento Grid |
| 미래/기술 | Neon Cyber, Cyberpunk Outline, Terminal Green |
| 학술/기술 발표 | Swiss Modern, Dark Academia, Paper & Ink |
| 빈티지/개성 | Vintage Editorial, Risograph Print, Creative Voltage |
| 대담/펑크 | Neo-Brutalism, Duotone Split, Creative Voltage |
| 아티스틱/크리에이티브 | Gradient Mesh, Risograph Print, Glassmorphism |
| 모던/트렌디 | Glassmorphism, Bento Grid, Gradient Mesh |

#### 발표 목적 → 스타일 추천 매트릭스

| 발표 목적 | 1순위 | 2순위 | 3순위 |
|----------|-------|-------|-------|
| 기술 컨퍼런스 | Swiss Modern | Terminal Green | Cyberpunk Outline |
| 스타트업 피치 | Bold Signal | Gradient Mesh | Electric Studio |
| 학술/논문 발표 | Dark Academia | Paper & Ink | Swiss Modern |
| 팀 세미나 | Bento Grid | Notebook Tabs | Swiss Modern |
| 디자인/크리에이티브 | Risograph Print | Gradient Mesh | Neo-Brutalism |
| 데이터/분석 리포트 | Electric Studio | Swiss Modern | Bento Grid |
| 교육/튜토리얼 | Pastel Geometry | Notebook Tabs | Split Pastel |
| 제품 런칭 | Glassmorphism | Bold Signal | Neon Cyber |
| 코드 리뷰/기술 공유 | Terminal Green | Cyberpunk Outline | Dark Botanical |
| 투자자/경영진 보고 | Dark Botanical | Electric Studio | Paper & Ink |
**프리셋 CSS 변수**: `templates/presets/` 디렉토리에서 선택한 프리셋의 CSS 파일을 Read하여 적용.
상세 스타일 정의: [design-guide.md](references/design-guide.md) (20가지 큐레이션된 프리셋 + 커스텀 PPTX 임포트)

### Phase 3: 다이어그램 생성 (필요 시)

Excalidraw 스킬을 활용하여 다이어그램 생성.

```bash
# Mermaid → Excalidraw → PNG
node .claude/skills/excalidraw/scripts/mermaid-to-excalidraw.js \
  --text "flowchart LR ..." docs/workspace/diagram.excalidraw

node .claude/skills/excalidraw/scripts/export-png.js \
  docs/workspace/diagram.excalidraw docs/workspace/diagram.png 3
```

커스텀 다이어그램은 Excalidraw JSON 직접 생성. `.claude/skills/excalidraw/` 참조.

### Phase 4: HTML 프레젠테이션 생성

#### 단일 HTML 파일 아키텍처

**하나의 self-contained HTML 파일**에 모든 슬라이드, CSS, JS를 포함한다.

기본 템플릿: `templates/viewport-base.html`을 Read하여 구조를 참조한 후, 선택한 프리셋의 CSS 변수(`templates/presets/*.css`)를 적용하여 생성.

**컴포넌트 참조** (필요 시 Read):
- 애니메이션 패턴: `templates/components/animations.css`
- 배경 효과: `templates/components/backgrounds.css`
- 레이아웃 컴포넌트: `templates/components/layout-components.css`

#### 필수 규칙

1. **Viewport Fitting** - `.slide`에 `height: 100vh; height: 100dvh; overflow: hidden;` 필수
2. **반응형 clamp()** - 모든 폰트/간격에 `clamp(min, preferred, max)` 사용. 고정 px/rem 단독 사용 금지
3. **높이 기반 미디어 쿼리** - `max-height: 700px/600px/500px`로 단계별 축소
4. **콘텐츠 밀도** - 타이틀 1줄+부제, 본문 최대 4-6 불릿. 초과 시 슬라이드 분할
5. **Google Fonts** - `<link>` 태그로 테마별 폰트 로드. 한국어 포함 시 Pretendard 또는 Noto Sans KR
6. **CSS 커스텀 프로퍼티** - `:root`에 모든 색상/폰트/간격 정의
7. **프로그레스 바 + 네비게이션 도트** 필수 포함
8. **키보드 + 터치 + 스와이프** 네비게이션 필수
9. **`prefers-reduced-motion`** 지원 필수
10. **이미지 경로** - HTML 파일 위치(docs/) 기준 상대 경로 사용. base64는 최후 수단
    - 다이어그램: `src="workspace/diagram.png"` (docs/workspace/ 내 파일)
    - 커스텀 에셋: `src="workspace/assets/custom-<name>/파일명"` (import 시 `--workspace=docs/workspace` 필수)
    - **절대 `skills/oh-my-slides/templates/...` 경로를 직접 사용하지 않는다** (docs/ 기준 상대 경로가 깨짐)

#### Anti-Patterns (절대 피할 것)

- **폰트**: Inter, Roboto, Arial을 display 폰트로 사용
- **색상**: 보라 그라데이션(`#6366f1`), 흰 배경에 보라/핑크 기본 조합
- **레이아웃**: 모든 요소 가운데 정렬, 동일한 카드 그리드 반복
- **장식**: 리얼리스틱 일러스트, 불필요한 글래스모피즘, 동기 없는 그림자
- **`min-height` 사용**: `height`를 사용해야 함. `min-height`는 슬라이드 넘침 허용

#### 느낌 → 애니메이션 매핑

| 느낌 | 애니메이션 스타일 | 속도 |
|------|-----------------|------|
| 드라마틱/시네마틱 | 느린 페이드, 대형 스케일(0.9→1), 패럴랙스 | 1-1.5s |
| 기술/미래 | 네온 글로우, 글리치, 그리드 리빌 | 0.4-0.8s |
| 플레이풀/친근 | 스프링 물리, 플로팅, 둥근 모서리 | 0.3-0.6s |
| 프로페셔널/기업 | 미세하고 빠른 페이드, 클린 슬라이드 | 0.2-0.3s |
| 차분/미니멀 | 매우 느린 페이드, 넓은 여백 | 0.8-1.2s |
| 에디토리얼/매거진 | 스태거드 텍스트 리빌, 강한 타이포 위계 | 0.4-0.7s |

### Phase 4-B: PPTX 생성 (선택)

사용자가 PPTX를 요청하면, 두 가지 방식 중 선택:

#### 방식 A: html2pptx (편집 가능 PPTX)
html2pptx 변환 가이드를 참조하여 진행.

PPTX 변환 시 제약사항:
- 웹 안전 폰트만 (Arial, Verdana, Georgia, Courier New)
- CSS 그래디언트 금지
- 애니메이션 불가
- body 크기: `width: 720pt; height: 405pt`
- 모든 텍스트는 `<p>/<h>/<ul>/<ol>` 태그 안에

**별도의 PPTX용 HTML 슬라이드를 작성한다** (HTML 프레젠테이션과 별개).

테이블이 있는 슬라이드는 placeholder로 처리하고, build.js에서 PptxGenJS 네이티브 테이블(addTable)로 추가한다.
그라데이션 헤더가 필요하면 Sharp로 PNG를 미리 렌더링하고 addImage로 오버레이한다.

**빌드 유틸리티**: [build-utilities.md](references/build-utilities.md)의 테이블 스타일 상수(`TH`, `TD`, `TD_GOOD` 등)와 헬퍼 함수(`addNativeTable`, `row`, `addGradientHeader`, `addImageToPlaceholder`)를 활용.

```javascript
const pptxgen = require('pptxgenjs');
const html2pptx = require('./scripts/html2pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

for (const slideHtml of slideFiles) {
    const { slide, placeholders } = await html2pptx(slideHtml, pptx);
    // 그라데이션 헤더 오버레이
    addGradientHeader(slide);
    // 네이티브 테이블 추가 (편집 가능)
    const tbl = placeholders.find(p => p.id === 'table-xxx');
    if (tbl) {
        addNativeTable(slide, tbl,
            ['Header1', 'Header2'],
            [
                row(['Value', { text: 'Best', style: 'good' }], false),
            ],
            { colW: [5.0, 5.0] }
        );
    }
}
await pptx.writeFile({ fileName: 'docs/output.pptx' });
```

#### 방식 B: 캡처 & 빌드 (Slide Template → 이미지 기반 PPTX)
Slide Template (1280x720) 개별 HTML 파일을 Playwright로 캡처하여 이미지 기반 PPTX 생성.
디자인 자유도가 높고 빌드가 단순하지만, 텍스트 편집은 불가.

스킬의 `scripts/capture-and-build.js`를 바로 실행:
```bash
node .claude/skills/oh-my-slides/scripts/capture-and-build.js docs/workspace 20 docs/output.pptx
```

#### 방식 C: Viewport 캡처 (단일 HTML → 이미지 기반 PPTX)
Viewport HTML (단일 파일, 스크롤 기반) 프레젠테이션을 슬라이드별로 캡처하여 PPTX 생성.
기존에 만들어진 Viewport HTML을 PPTX로 변환할 때 사용. reveal 애니메이션 자동 활성화, UI 요소 자동 숨김.

스킬의 `scripts/capture-viewport.js`를 바로 실행:
```bash
# 기본 (출력: 같은 이름의 .pptx)
node .claude/skills/oh-my-slides/scripts/capture-viewport.js docs/presentation.html

# 출력 경로 지정
node .claude/skills/oh-my-slides/scripts/capture-viewport.js docs/presentation.html docs/output.pptx

# 뷰포트 크기 조절 (콘텐츠 max-width에 맞춰 조절, 너무 크면 글자가 작아짐)
node .claude/skills/oh-my-slides/scripts/capture-viewport.js docs/presentation.html output.pptx --width=1200 --height=675
```

**주요 옵션:**
- `--width=N` — 뷰포트 너비 (기본: 1200). 콘텐츠의 max-width보다 약간 크게 설정하면 최적
- `--height=N` — 뷰포트 높이 (기본: 675, 16:9 비율)
- `--selector=S` — 슬라이드 CSS 셀렉터 (기본: `.slide`)

**방식 B vs C 선택 기준:**
- 개별 HTML 파일 (slide01.html, slide02.html...) → 방식 B (`capture-and-build.js`)
- 단일 HTML 파일 (스크롤 프레젠테이션) → 방식 C (`capture-viewport.js`)

그라데이션 PNG 생성이 필요하면:
```bash
node .claude/skills/oh-my-slides/scripts/create-gradient.js docs/workspace/header-gradient.png 1440 88 "#1e3a5f" "#0ea5e9"
```

### Phase 5: 검증 및 전달

#### HTML 프레젠테이션 검증

스킬의 `scripts/` 디렉토리에 재사용 가능한 검증 스크립트가 있다:

```bash
# 개별 슬라이드 PNG 렌더링
node .claude/skills/oh-my-slides/scripts/render-all.js docs/workspace 20

# 프리뷰 그리드 (한눈에 전체 확인)
node .claude/skills/oh-my-slides/scripts/render-preview.js docs/workspace 20 4
```
생성된 스크린샷 또는 `preview-grid.png`를 Read로 확인.

#### 전달
```
생성 완료:
- HTML: docs/{파일명}-presentation.html (브라우저에서 바로 발표)
- PPTX: docs/{파일명}-presentation.pptx (편집 가능)
- 다이어그램: docs/workspace/*.excalidraw (Excalidraw에서 편집)

HTML: 브라우저에서 열고 F키로 전체화면 → 방향키/스와이프로 이동
PPTX: PowerPoint/Keynote/Google Slides에서 편집 가능
```

## 체크리스트

- [ ] Phase 1: AskUserQuestion으로 콘텐츠 수집
- [ ] Phase 2: 3가지 스타일 프리뷰 생성 → 사용자 선택
- [ ] Phase 3: 다이어그램 필요 슬라이드 식별 → Excalidraw 생성
- [ ] Phase 4: HTML 프레젠테이션 생성 (viewport fitting, 애니메이션, 반응형)
- [ ] Phase 4-B: PPTX 생성 (요청 시, 네이티브 테이블 사용)
- [ ] Phase 5: 스크린샷 검증 → 전달

## 참조

- **[design-guide.md](references/design-guide.md)** - 20가지 스타일 프리셋, 레이아웃, 애니메이션 (Viewport 방식)
- **[slide-template.md](references/slide-template.md)** - 1280×720 고정 슬라이드 템플릿 (Tailwind + Font Awesome)
- **[build-utilities.md](references/build-utilities.md)** - 재사용 빌드 유틸리티 (테이블 스타일, 헬퍼 함수, 코드 패턴)
- **templates/** - 코드 템플릿 (필요 시 Read):
  - `viewport-base.html` — Viewport 모드 기본 HTML 구조
  - `slide-base.html` — Slide Template 모드 기본 HTML 구조
  - `presets/*.css` — 20가지 디자인 프리셋 CSS 변수 (각 프리셋별 색상, 폰트, 시그니처 변수)
  - `layouts/*.html` — Slide Template 레이아웃 패턴 (5종 + 헤더 3종)
  - `components/` — 애니메이션(프리셋별 특화 포함), 배경효과(글래스/도트그리드/프레임 등), 레이아웃, 시각화
- **scripts/** - 실행 가능한 재사용 스크립트:
  - `capture-and-build.js` — Slide Template HTML 캡처 → 이미지 기반 PPTX 생성
  - `capture-viewport.js` — Viewport HTML (단일 파일) 캡처 → 이미지 기반 PPTX 생성
  - `render-preview.js` — 전체 슬라이드 프리뷰 그리드 생성
  - `render-all.js` — 개별 슬라이드 PNG 렌더링
  - `create-gradient.js` — Sharp로 그라데이션 PNG 생성
  - `import-pptx-theme.js` — PPTX 파일에서 테마(색상, 폰트, 미디어) 추출 → 커스텀 프리셋 CSS 생성
  - `html2pptx.js` — HTML 슬라이드 → PptxGenJS 슬라이드 변환 (편집 가능 PPTX 생성용)
- **Excalidraw 스킬** (선택) - 다이어그램 생성 시 필요
