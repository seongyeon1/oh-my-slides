# 디자인 가이드 — 20 Curated Style Presets

추상적 도형만 사용 — 일러스트 없음. 모든 프레젠테이션은 viewport fitting 필수.

### 스타일 선택 원칙

1. **Signature Element 반복** — 각 스타일의 시그니처 요소를 모든 슬라이드에 일관되게 반복한다
2. **정확한 HEX 값** — 비슷한 색이 아니라 정의된 정확한 색상 코드를 사용한다
3. **Avoid 준수** — 각 스타일별 금지 사항을 반드시 지킨다. 다른 스타일의 시그니처를 섞지 않는다
4. **텍스트만의 슬라이드 금지** — 모든 슬라이드에 최소 하나의 시각 요소 (도형, 색상 블록, 아이콘) 포함
5. **폰트 페어링 엄수** — 타이포그래피가 스타일 인상의 50%를 결정한다

**CSS 변수 파일**: 각 프리셋의 `:root` CSS 변수는 `templates/presets/` 디렉토리에 개별 파일로 분리되어 있다. 프리뷰 생성이나 프레젠테이션 제작 시 해당 프리셋 파일을 Read하여 적용.

---

## Dark Themes (1-4)

### 1. Bold Signal
**느낌**: 자신감, 대담, 모던, 하이임팩트
- CSS 변수: `templates/presets/bold-signal.css`
- 레이아웃: 번호(좌상) + 내비(우상) + 제목(좌하), 그리드 정렬
- **시그니처**: 컬러 카드 on 다크 그래디언트, 섹션 넘버(01, 02), 브레드크럼 with opacity 상태
- **Avoid**: 둥근 모서리 과다 사용, 그라데이션 배경, 밝은 배경색

### 2. Electric Studio
**느낌**: 볼드, 클린, 프로페셔널, 하이 콘트라스트
- CSS 변수: `templates/presets/electric-studio.css`
- 레이아웃: 상하 2분할 (화이트 상단 / 블루 하단), 코너 브랜드
- **시그니처**: 수직 분할 패널, 엣지 악센트 바, 인용문 히어로
- **Avoid**: 그라데이션 텍스트, 둥근 카드, 과도한 애니메이션
- Manrope 단독 사용 (웨이트로 차별화)

### 3. Creative Voltage
**느낌**: 에너지, 크리에이티브, 레트로-모던
- CSS 변수: `templates/presets/creative-voltage.css`
- 레이아웃: 좌우 분할(일렉트릭 블루 + 다크), 스크립트 악센트
- **시그니처**: 하프톤 텍스처, 네온 뱃지/콜아웃, 스크립트 타이포
- **Avoid**: 직선적 레이아웃만 사용, 차분한 색상, 세리프 폰트
- Space Mono 본문으로 코딩/기술 분위기

### 4. Dark Botanical
**느낌**: 우아, 세련, 아티스틱, 프리미엄
- CSS 변수: `templates/presets/dark-botanical.css`
- 레이아웃: 중앙 정렬, 코너에 추상적 소프트 셰이프(CSS-only)
- **시그니처**: 블러된 오버래핑 그래디언트 원, 얇은 수직선, 이탤릭 시그니처
- **Avoid**: 직선적 기하학, 네온 색상, 모노스페이스 폰트, 두꺼운 테두리
- 웜 악센트: 골드 `#c9b896`, 핑크 `#e8b4b8`

---

## Light Themes (5-8)

### 5. Notebook Tabs
**느낌**: 에디토리얼, 정돈, 우아, 촉각적
- CSS 변수: `templates/presets/notebook-tabs.css`
- 레이아웃: 다크 배경 위 크림 페이퍼 카드 + 오른쪽 컬러풀 탭
- 시그니처: 세로 텍스트 탭, 바인더 구멍, 페이퍼 그림자
- 탭 텍스트: `clamp(0.5rem, 1vh, 0.7rem)`

### 6. Pastel Geometry
**느낌**: 친근, 정돈, 모던, 부드러움
- CSS 변수: `templates/presets/pastel-geometry.css`
- 레이아웃: 파스텔 배경 위 화이트 카드, 오른쪽 수직 필(pill)
- 시그니처: 높이 다른 필(짧→중→긴→중→짧), 라운드 카드, 소프트 섀도
- Plus Jakarta Sans 단독 (웨이트로 차별화)

### 7. Split Pastel
**느낌**: 플레이풀, 모던, 친근, 크리에이티브
- CSS 변수: `templates/presets/split-pastel.css`
- 레이아웃: 좌우 분할 (피치 + 라벤더)
- 시그니처: 뱃지 필 with 아이콘, 그리드 오버레이, 라운드 CTA
- Outfit 단독 사용

### 8. Vintage Editorial
**느낌**: 위트, 자신감, 에디토리얼, 개성
- CSS 변수: `templates/presets/vintage-editorial.css`
- 레이아웃: 크림 배경 중앙 정렬 + 기하학적 셰이프 악센트
- 시그니처: CSS 기하학(원 아웃라인 + 선 + 점), 두꺼운 테두리 CTA
- Fraunces 900으로 대담한 세리프 헤딩

---

## Specialty Themes (9-12)

### 9. Neon Cyber
**느낌**: 미래적, 테크, 자신감
- CSS 변수: `templates/presets/neon-cyber.css`
- Fontshare에서 폰트 로드 (Clash Display, Satoshi)
- 시그니처: 파티클 배경, 네온 글로우, 그리드 패턴
- 글로우: `box-shadow: 0 0 40px rgba(0,255,204,0.2); text-shadow: 0 0 20px rgba(0,255,204,0.5)`

### 10. Terminal Green
**느낌**: 개발자, 해커 미학
- CSS 변수: `templates/presets/terminal-green.css`
- JetBrains Mono 단독 사용 (모노스페이스 전용)
- 시그니처: 스캔 라인, 블링킹 커서, 코드 신택스 하이라이팅
- 스캔라인: `background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`

### 11. Swiss Modern
**느낌**: 클린, 정밀, 바우하우스
- CSS 변수: `templates/presets/swiss-modern.css`
- 순수 블랙/화이트 + 레드 악센트
- 시그니처: 비저블 그리드, 비대칭 레이아웃, 기하학적 셰이프
- 바우하우스 원칙: 형태는 기능을 따른다

### 12. Paper & Ink
**느낌**: 에디토리얼, 문학적, 사려깊음
- CSS 변수: `templates/presets/paper-and-ink.css`
- 전체 세리프 사용 (display + body 모두)
- 시그니처: 드롭캡, 풀 쿼트, 우아한 수평선
- 문학적 레이아웃: 넓은 여백, 좁은 본문 칼럼

---

## 레이아웃 컴포넌트

Viewport 모드에서 사용하는 공통 CSS 컴포넌트. 필요 시 `templates/components/layout-components.css`를 Read.

포함 컴포넌트: 타이틀 슬라이드, 섹션 헤더, 카드, 2컬럼 레이아웃, 데이터 테이블, 메트릭 그리드, 코드 블록, 인용/강조 박스

---

## 배경 효과

다크/라이트 테마에 따라 적용할 수 있는 배경 효과. 필요 시 `templates/components/backgrounds.css`를 Read.

포함 효과: 노이즈 텍스처, 그래디언트 메시(Atmospheric), 그리드 배경, 글로우 효과

---

## 애니메이션 패턴

### 느낌별 매핑

| 느낌 | CSS 패턴 | 이징 | 시간 |
|------|---------|------|------|
| 드라마틱 | 느린 fade + scale(0.9→1) | ease-out | 1-1.5s |
| 테크/미래 | 네온 글로우, 그리드 리빌 | ease-in-out | 0.4-0.8s |
| 플레이풀 | 스프링 바운스, 플로팅 | cubic-bezier(0.68,-0.55,0.27,1.55) | 0.3-0.6s |
| 프로페셔널 | 미세 페이드 | ease | 0.2-0.3s |
| 차분/미니멀 | 초느린 페이드, 넓은 여백 | ease-out | 0.8-1.2s |
| 에디토리얼 | 스태거드 텍스트 | ease-out | 0.4-0.7s |

구체적 CSS 구현: `templates/components/animations.css`를 Read.

### 성능 가이드라인
- `transform`과 `opacity`만 애니메이션 (layout 속성 사용 금지)
- `will-change`는 신중하게 사용 (요소 수 제한)
- 스크롤 핸들러 throttle 적용
- 모바일(<768px)에서 무거운 이펙트 비활성화

---

## 슬라이드 구조 템플릿

### 기술 발표 (10장)
1. **타이틀** - 논문/프로젝트명, 발표자
2. **목차** - 발표 흐름 (번호 리스트)
3. **배경** - 문제 정의, 동기
4. **핵심 개념** - 용어/개념 (카드 그리드)
5. **아키텍처** - 다이어그램 (풀 이미지)
6. **구현 상세** - 알고리즘/코드 (2컬럼)
7. **구현 상세 2** - 추가 설명
8. **실험 결과** - 데이터 테이블 + 메트릭
9. **결론** - 핵심 요약 (2컬럼 카드)
10. **Q&A** - 마무리

### 교육 자료 (15장)
1. **타이틀** - 과정명
2. **학습 목표** - 3-4개 카드
3. **개요** - 다이어그램
4-6. **이론** - 개념 설명
7-9. **실습** - 코드 예시
10-11. **심화** - 고급
12. **비교** - 테이블
13. **팁** - 카드 그리드
14. **요약** - 체크리스트
15. **참고 자료**

---

## Anti-Patterns (절대 피할 것)

### 폰트
- Inter, Roboto, Arial을 display 폰트로 사용
- system-ui만 단독 사용

### 색상
- 보라 그라데이션 (`#6366f1`), 흰 배경에 보라/핑크 기본 조합
- 의미 없는 레인보우 그라데이션

### 레이아웃
- 모든 요소 가운데 정렬 (변화 없는 일관된 중앙 정렬)
- 동일한 카드 그리드만 반복
- generic 히어로 섹션

### 장식
- 리얼리스틱 일러스트/사진 합성
- 불필요한 글래스모피즘
- 동기 없는 드롭 섀도

---

## CSS 구현 주의사항

### clamp() 부정 (네거티브 값)
- 잘못된: `right: -clamp(28px, 3.5vw, 44px);`
- 올바른: `right: calc(-1 * clamp(28px, 3.5vw, 44px));`

### 컨테이너 max-width
- 고정 px 대신 반응형 패턴: `max-width: min(90vw, 1000px);`

---

## New Themes (13-20)

### 13. Neo-Brutalism
**느낌**: 대담, 펑크, 거칠고 강렬한, 반디자인

```css
:root {
  --bg-primary: #F5F500;
  --bg-secondary: #CCFF00;
  --bg-card: #ffffff;
  --text-primary: #000000;
  --text-secondary: #333;
  --accent: #FF2D55;
  --accent-secondary: #4400FF;
  --border: #000000;
  --font-display: 'Arial Black', 'Impact', 'Pretendard', sans-serif;
  --font-body: 'Courier New', 'Space Mono', monospace;
}
```
- 레이아웃: 두꺼운 검정 테두리(4-6px), 하드 오프셋 그림자, 비대칭 배치
- **시그니처**: `box-shadow: 8px 8px 0 #000` (blur 없는 하드 드롭 섀도), 두꺼운 테두리, 형광색 배경
- **Avoid**: 부드러운 그라데이션, 둥근 모서리, 미세한 그림자, 투명도, 세리프 폰트
- 카드: `border: 4px solid #000; box-shadow: 8px 8px 0 #000;`

### 14. Bento Grid
**느낌**: 모던, 정돈, Apple 스타일, 매끈

```css
:root {
  --bg-primary: #F8F8F2;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666;
  --accent: #FFD60A;
  --accent-secondary: #FF6B6B;
  --border: rgba(0,0,0,0.06);
  --cell-navy: #1E293B;
  --cell-coral: #FF6B6B;
  --cell-teal: #14B8A6;
  --font-display: 'SF Pro Display', 'Inter', 'Pretendard', sans-serif;
  --font-body: 'SF Pro Text', 'Inter', 'Pretendard', sans-serif;
}
```
- 레이아웃: CSS Grid 비대칭 셀 (2x3, 3x2 혼합), 다크 앵커 셀 하나가 주인공
- **시그니처**: 비대칭 멀티사이즈 그리드, 라운드 16px 셀, 셀 안에 아이콘+숫자 조합
- **Avoid**: 동일 크기 셀만 반복, 테두리 강조, 하드 그림자, 네온 색상
- 그리드 예: `grid-template: "a a b" "a a c" "d e c" / 1fr 1fr 1fr`

### 15. Dark Academia
**느낌**: 학구적, 빈티지 다크, 고전적, 우아

```css
:root {
  --bg-primary: #1A1208;
  --bg-secondary: #2A1F10;
  --bg-card: rgba(201,168,76,0.08);
  --text-primary: #E8DCC8;
  --text-secondary: #9A8B6F;
  --accent: #C9A84C;
  --accent-soft: rgba(201,168,76,0.12);
  --border: rgba(201,168,76,0.25);
  --font-display: 'Playfair Display', 'Noto Serif KR', serif;
  --font-body: 'EB Garamond', 'Noto Serif KR', serif;
}
```
- 레이아웃: 이중 인셋 테두리 프레임, 중앙 정렬 타이틀, 넓은 여백
- **시그니처**: 이중 테두리 프레임 (`border: 1px solid; outline: 1px solid; outline-offset: 8px`), 이탤릭 골드 제목, 양피지 텍스처
- **Avoid**: 밝은 색, 산세리프 폰트, 네온/형광, 모던 그리드, 둥근 모서리
- 배경에 미세한 종이 노이즈 텍스처 추가

### 16. Glassmorphism
**느낌**: 반투명, 깊이감, 모던, 프리미엄

```css
:root {
  --bg-primary: #1A1A4E;
  --bg-secondary: #6B21A8;
  --bg-tertiary: #1E3A5F;
  --bg-card: rgba(255,255,255,0.12);
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.7);
  --accent: #00D4FF;
  --accent-secondary: #A855F7;
  --border: rgba(255,255,255,0.2);
  --font-display: 'Segoe UI', 'Pretendard', sans-serif;
  --font-body: 'Segoe UI', 'Pretendard', sans-serif;
}
```
- 레이아웃: 카드 기반, 블러된 배경 위 반투명 카드, 코너 글로우 블롭
- **시그니처**: `backdrop-filter: blur(20px); background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2)`, 배경에 2-3개 블러 글로우 원
- **Avoid**: 불투명 카드, 하드 테두리, 평평한 배경, 텍스트만의 슬라이드
- 글로우: `radial-gradient(circle at 20% 50%, rgba(0,212,255,0.3), transparent 50%)`

### 17. Gradient Mesh
**느낌**: 아티스틱, 컬러풀, 유동적, 임팩트

```css
:root {
  --bg-gradient: radial-gradient(at 20% 80%, #FF6EC7 0%, transparent 50%),
                 radial-gradient(at 80% 20%, #7B61FF 0%, transparent 50%),
                 radial-gradient(at 50% 50%, #00D4FF 0%, transparent 50%),
                 radial-gradient(at 80% 80%, #FFB347 0%, transparent 50%);
  --bg-primary: #1a1a2e;
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.8);
  --accent: #ffffff;
  --font-display: 'Bebas Neue', 'Pretendard', sans-serif;
  --font-body: 'Outfit', 'Pretendard', sans-serif;
}
```
- 레이아웃: 풀블리드 그라데이션 배경, 미니멀 화이트 텍스트, 넓은 여백
- **시그니처**: 멀티 radial-gradient 배경 (3-4개 겹침), 모든 텍스트 화이트, 얇은 산세리프 본문
- **Avoid**: 카드/박스 사용, 진한 테두리, 복잡한 레이아웃, 다크 텍스트
- Bebas Neue는 display만 사용, 본문에 절대 사용 금지

### 18. Duotone Split
**느낌**: 대비, 포커스, 그래픽, 강렬

```css
:root {
  --color-left: #FF4500;
  --color-right: #1A1A2E;
  --text-on-left: #ffffff;
  --text-on-right: #ffffff;
  --accent: #FF4500;
  --divider: rgba(255,255,255,0.3);
  --font-display: 'Bebas Neue', 'Pretendard', sans-serif;
  --font-body: 'Space Mono', 'Pretendard', monospace;
}
```
- 레이아웃: 정확한 50/50 수직 분할, 왼쪽 컬러 / 오른쪽 다크
- **시그니처**: 수직 50/50 분할, 중앙 화이트 구분선(2px), 크로스패널 컬러 에코 (오른쪽 텍스트에 왼쪽 색 사용)
- **Avoid**: 3분할 이상, 수평 분할, 그라데이션 분할, 같은 색 양쪽
- 타이틀은 분할선 걸쳐서 양쪽에 배치 가능

### 19. Risograph Print
**느낌**: 레트로 프린트, 핸드메이드, 아트 포스터

```css
:root {
  --bg-primary: #F7F2E8;
  --bg-secondary: #EDE8DC;
  --text-primary: #1a1a1a;
  --text-secondary: #555;
  --riso-red: #E8344A;
  --riso-blue: #0D5C9E;
  --riso-yellow: #F5D020;
  --border: rgba(0,0,0,0.1);
  --font-display: 'Bebas Neue', 'Pretendard', sans-serif;
  --font-body: 'Space Mono', 'Pretendard', monospace;
}
```
- 레이아웃: 오프셋 겹침, 약간의 회전(1-3deg), 거친 텍스처
- **시그니처**: 3색 원 오버랩 with `mix-blend-mode: multiply`, 오프셋 고스트 타이틀(살짝 어긋난 복제 텍스트), 거친 종이 배경
- **Avoid**: 깔끔한 정렬, 그라데이션, 글래스모피즘, 사진, 완벽한 대칭
- 고스트 텍스트: `position:absolute; opacity:0.08; transform:translate(4px,4px)`

### 20. Cyberpunk Outline
**느낌**: 해커, 와이어프레임, 기술 청사진

```css
:root {
  --bg-primary: #0D0D0D;
  --bg-secondary: #111;
  --bg-card: transparent;
  --text-primary: #00FFC8;
  --text-secondary: rgba(0,255,200,0.5);
  --accent: #00FFC8;
  --accent-secondary: #FF00AA;
  --border: rgba(0,255,200,0.3);
  --font-display: 'Bebas Neue', 'Pretendard', sans-serif;
  --font-body: 'Space Mono', 'Pretendard', monospace;
}
```
- 레이아웃: 도트 그리드 배경, 코너 브라켓, 아웃라인 텍스트
- **시그니처**: 스트로크 전용 텍스트 (`-webkit-text-stroke: 2px var(--accent); color: transparent`), 4코너 브라켓 (`[]`), 도트 그리드 배경
- **Avoid**: 채워진(filled) 배경 카드, 부드러운 그라데이션, 세리프 폰트, 둥근 모서리
- 코너 브라켓: 각 슬라이드 네 모서리에 L자형 선 배치

---

## Custom Presets (PPTX Import)

PPTX 파일에서 자동 추출한 커스텀 프리셋. 기본 20가지 프리셋 외에 조직/브랜드 고유 테마를 사용할 수 있다.

### 사용법
```bash
node .claude/skills/ppt-html/scripts/import-pptx-theme.js <file.pptx> <name> [--dark]
```

### 생성되는 파일
- `templates/presets/custom-<name>.css` — CSS 변수 프리셋
- `templates/assets/custom-<name>/` — 추출된 미디어 파일 (로고, 이미지 등)

### PPTX 테마 → CSS 변수 매핑

| PPTX 테마 요소 | CSS 변수 | 설명 |
|---------------|---------|------|
| dk1 | `--bg-primary` (다크) / `--text-primary` (라이트) | 어두운 기본색 |
| lt1 | `--text-primary` (다크) / `--bg-primary` (라이트) | 밝은 기본색 |
| dk2 / lt2 | `--bg-secondary`, `--bg-card` | 보조 배경색 |
| accent1 | `--accent` | 주 악센트 색상 |
| accent1 + alpha | `--accent-soft` | 투명 악센트 (배경용) |
| majorFont | `--font-display` | 제목 폰트 |
| minorFont | `--font-body` | 본문 폰트 |

### 커스텀 프리셋 조정
자동 생성된 CSS는 기본 매핑을 따르며, 필요 시 수동으로 조정:
- `--accent-soft`: 자동으로 accent 색에 0.15 투명도 적용. 더 강하게/약하게 조절 가능
- `--bg-card`: lt2 기반 자동 매핑. 카드 배경이 맞지 않으면 직접 지정
- `--border`: text-primary 기반 0.08 투명도. 테마에 따라 조절
- 추가 변수(`--sidebar-color`, `--card-radius`, `--shadow-soft` 등)는 수동 추가 가능
- Office 기본 폰트(Calibri, Arial 등)는 자동으로 Google Fonts 대체를 제안

---

## 폰트 페어링 레퍼런스

| 프리셋 | Display 폰트 | Body 폰트 | 소스 |
|--------|-------------|----------|------|
| Bold Signal | Archivo Black 900 | Space Grotesk 400/500 | Google Fonts |
| Electric Studio | Manrope 800 | Manrope 400/500 | Google Fonts |
| Creative Voltage | Syne 700/800 | Space Mono 400/700 | Google Fonts |
| Dark Botanical | Cormorant 400/600 | IBM Plex Sans 300/400 | Google Fonts |
| Notebook Tabs | Bodoni Moda 400/700 | DM Sans 400/500 | Google Fonts |
| Pastel Geometry | Plus Jakarta Sans 700/800 | Plus Jakarta Sans 400/500 | Google Fonts |
| Split Pastel | Outfit 700/800 | Outfit 400/500 | Google Fonts |
| Vintage Editorial | Fraunces 700/900 | Work Sans 400/500 | Google Fonts |
| Neon Cyber | Clash Display | Satoshi | Fontshare |
| Terminal Green | JetBrains Mono | JetBrains Mono | JetBrains |
| Swiss Modern | Archivo 800 | Nunito 400 | Google Fonts |
| Paper & Ink | Cormorant Garamond | Source Serif 4 | Google Fonts |

### 한국어 폰트
- **Pretendard** — 가장 범용적 산세리프 (CDN: `cdn.jsdelivr.net`)
- **Noto Sans KR** — Google Fonts 공식
- **Noto Serif KR** — 세리프 (Editorial, Paper & Ink, Dark Botanical 매칭)

---

## PPTX 전용 디자인 규칙

PPTX 출력 시에는 html2pptx 제약을 따른다:
- **웹 안전 폰트만**: Arial, Verdana, Georgia, Courier New
- **CSS 그래디언트 금지** — 단색 또는 Sharp로 PNG 미리 생성
- **애니메이션 없음**
- **body 크기**: `width: 720pt; height: 405pt`
- **모든 텍스트**: `<p>/<h>/<ul>/<ol>` 태그 안에
- **배경/테두리/그림자**: `<div>`에만 적용
- **차트 색상**: `#` 접두사 금지
- **테이블**: HTML 테이블 대신 placeholder + PptxGenJS `addTable()` 사용 권장
