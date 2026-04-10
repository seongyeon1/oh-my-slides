# 슬라이드 템플릿 가이드 (Fixed 1280×720)

Tailwind CSS + Font Awesome 기반의 고정 크기 슬라이드 템플릿.
각 슬라이드가 독립 HTML 파일이며, Playwright로 PNG 캡처 후 PPTX 이미지로 삽입하거나
단독 HTML로 사용할 수 있다.

## 언제 사용하나?

- 슬라이드별 정교한 레이아웃/시각화가 필요할 때
- Tailwind로 빠르게 스타일링하고 싶을 때
- 아이콘, 뱃지, 커스텀 다이어그램이 포함된 학술/기술 발표
- 스크롤 프레젠테이션(viewport 방식) 대신 **슬라이드 단위** 작업이 필요할 때

## 기본 구조

기본 HTML 템플릿: `templates/slide-base.html`을 Read하여 구조 참조.

구조 요약:
- `<head>`: Tailwind CSS, Google Fonts (Noto Sans KR, Noto Serif KR, JetBrains Mono), Font Awesome
- `.slide-container`: 1280×720 고정, flex column, overflow hidden
- **Header**: 카테고리 + 제목 + 부제 (좌우 배치)
- **Main Content**: `flex flex-1` 콘텐츠 영역
- **Footer**: 발표 제목 + 페이지 번호

## 헤더 변형

3가지 헤더 패턴. 필요 시 `templates/layouts/` 에서 Read:

1. **기본 헤더** (`header-basic.html`) — 카테고리 + 제목 + 부제, 흰 배경
2. **컬러 헤더** (`header-color.html`) — Primary 색상 배경, 흰 텍스트
3. **타이틀 전체화면** (`title-fullscreen.html`) — 전체 슬라이드를 타이틀로 사용

## 콘텐츠 레이아웃 패턴

5가지 레이아웃 패턴. 필요 시 `templates/layouts/` 에서 Read:

| 패턴 | 파일 | 용도 |
|------|------|------|
| 2컬럼 (텍스트+시각화) | `two-column.html` | 카드 설명 + 다이어그램 |
| 3컬럼 카드 그리드 | `three-column-grid.html` | 개념/기능 비교 |
| 테이블 + 메트릭 | `table-metric.html` | 벤치마크/실험 결과 |
| 파이프라인/플로우 | `pipeline-flow.html` | 프로세스 시각화 |
| Q&A / 마무리 | `qa-ending.html` | 마무리 슬라이드 |

## 시각화 컴포넌트

재사용 가능한 시각화 HTML/CSS 스니펫. 필요 시 `templates/components/visualizations.html`을 Read.

포함 컴포넌트:
- **희소 벡터 바 차트** — active/expansion 상태 구분
- **값 뱃지** — 키-값 표시 (정상/경고 색상)
- **아이콘 원형 뱃지** — Font Awesome 아이콘 + 원형 배경
- **수식/코드 인라인** — 모노스페이스 인라인 표시
- **알림 뱃지** — 성공(녹색)/경고(빨간색) 알림

## 테마 컬러 팔레트

| 주제 | Primary | 사용 |
|------|---------|------|
| 기술/알고리즘 | `#047857` (emerald) | 검색, IR, ML |
| 데이터/분석 | `#1d4ed8` (blue) | 데이터 파이프라인, 분석 |
| 보안/시스템 | `#7c3aed` (violet) | 인프라, 보안 |
| AI/딥러닝 | `#dc2626` (red) | 모델, 학습 |
| 비즈니스 | `#0891b2` (cyan) | 비즈니스, 전략 |
| 오픈소스 | `#ea580c` (orange) | 커뮤니티, 오픈소스 |

## Playwright 캡처 & PPTX 변환

캡처와 PPTX 변환은 스킬의 `scripts/` 디렉토리에 있는 스크립트를 사용:

```bash
# 이미지 기반 PPTX (캡처 → 빌드 일체형)
node .claude/skills/ppt-html/scripts/capture-and-build.js docs/workspace 20 docs/output.pptx

# 개별 슬라이드 PNG 렌더링
node .claude/skills/ppt-html/scripts/render-all.js docs/workspace 20

# 프리뷰 그리드
node .claude/skills/ppt-html/scripts/render-preview.js docs/workspace 20 4
```

> 주의: 이미지 기반 PPTX는 텍스트 편집이 불가하다. 편집 가능한 PPTX가 필요하면 html2pptx 방식 사용.
