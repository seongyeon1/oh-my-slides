# oh-my-images — AI 이미지 생성 가이드

oh-my-slides 내장 AI 이미지 생성 모듈. 슬라이드에 필요한 이미지를 자동으로 제안하고, 사용자 승인 후 생성하여 프레젠테이션에 삽입한다.

## 프로바이더 설정

### 환경변수

| 변수 | 프로바이더 | 설명 |
|------|-----------|------|
| `GOOGLE_API_KEY` | Nanobanana (Google Gemini/Imagen) | gemini-2.5-flash-image, imagen-4.0 등 |
| `OPENAI_API_KEY` | OpenAI | gpt-image-1, DALL-E 3 |
| `STABILITY_API_KEY` | Stability AI | Stable Image Core, SD3.5 |
| `OH_MY_IMAGES_PROVIDER` | - | 기본 프로바이더 (기본값: nanobanana) |

### 프로바이더 선택 기준

| 기준 | Nanobanana (Gemini/Imagen) | OpenAI (gpt-image-1) | Stability AI |
|------|---------------------------|----------------------|--------------|
| 품질 | ★★★★★ | ★★★★★ | ★★★★ |
| 속도 | 빠름 (5-10초) | 보통 (10-20초) | 빠름 (5-10초) |
| 비용 | 보통 | 높음 | 보통 |
| 프롬프트 이해도 | 매우 높음 | 매우 높음 | 높음 |
| 추천 용도 | 자연스러운 이미지, 포토리얼리즘 | 고품질 히어로, 복잡한 장면 | 빠른 반복, 대량 생성 |
| 무료 사용 | Gemini 모델 (쿼터 한도 내) | 불가 | 불가 |

**Nanobanana 모델 선택:**
- `gemini-2.5-flash-image` (기본) — Gemini 기반, generateContent API
- `gemini-3-pro-image-preview` — 고품질, generateContent API
- `gemini-3.1-flash-image-preview` — 빠른 생성, generateContent API
- `imagen-4.0-generate-001` — Imagen 4, predict API (유료 플랜 필요)
- `imagen-4.0-ultra-generate-001` — 최고 품질 (유료 플랜 필요)
- `imagen-4.0-fast-generate-001` — 빠른 생성 (유료 플랜 필요)

## CLI 사용법

### 단일 이미지 생성

```bash
node .claude/skills/oh-my-slides/scripts/generate-image.js <output-path> \
  --prompt="이미지 설명" \
  [--provider=nanobanana] \
  [--model=gemini-2.5-flash-image] \
  [--width=1792] \
  [--height=1024] \
  [--quality=high] \
  [--style=dark-botanical]
```

### 배치 모드 (여러 이미지)

```bash
node .claude/skills/oh-my-slides/scripts/generate-image.js <output-dir> \
  --batch=<manifest.json> \
  [--provider=nanobanana] \
  [--quality=high] \
  [--delay=1000]
```

### 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `--prompt` | (필수, 단일) | 이미지 생성 프롬프트 |
| `--provider` | nanobanana | 프로바이더 (nanobanana, openai, stability) |
| `--model` | 프로바이더별 | 모델 선택 |
| `--width` | 1792 | 이미지 너비 (px) |
| `--height` | 1024 | 이미지 높이 (px) |
| `--quality` | high | 품질 (low, medium, high) |
| `--style` | - | 프리셋 이름 (스타일 힌트 자동 추가) |
| `--batch` | - | 배치 매니페스트 JSON 경로 |
| `--delay` | 1000 | 배치 모드 요청 간격 (ms) |

## 배치 매니페스트 JSON 스키마

```json
[
  {
    "filename": "hero-bg.png",
    "prompt": "A futuristic cityscape with glowing neon lights at twilight",
    "style": "neon-cyber",
    "width": 1792,
    "height": 1024,
    "quality": "high",
    "model": "imagen-3.0-generate-002"
  },
  {
    "filename": "concept-cloud.png",
    "prompt": "Abstract cloud computing architecture visualization"
  }
]
```

각 항목에서 `filename`과 `prompt`만 필수. 나머지는 CLI 옵션 또는 기본값 사용.

## 프롬프트 엔지니어링 가이드

### 슬라이드 타입별 프롬프트 템플릿

#### 타이틀/히어로 슬라이드
```
A dramatic wide-angle [주제 상징 장면], cinematic lighting, 16:9 composition,
shallow depth of field, [프리셋 스타일 키워드]. No text or letters.
```

#### 개념 설명 슬라이드
```
Abstract visualization of [개념], clean minimal composition, [프리셋 컬러 톤],
professional infographic style, 16:9 aspect ratio. No text or letters.
```

#### 비교/대조 슬라이드
```
Split composition showing contrast between [A] and [B],
[프리셋 스타일 키워드], 16:9 layout with clear visual separation. No text or letters.
```

#### 결론/미래 비전 슬라이드
```
Inspiring forward-looking scene of [미래 비전], hopeful lighting,
expansive perspective, [프리셋 스타일 키워드]. No text or letters.
```

### 프롬프트 작성 핵심 원칙

1. **"No text or letters"** 반드시 포함 — AI 이미지의 텍스트 렌더링은 부자연스러움
2. **16:9 비율** 명시 — 슬라이드에 맞는 가로형 구도
3. **프리셋 스타일** 키워드 — `--style` 플래그 또는 프롬프트에 직접 포함
4. **단순하고 명확한** 장면 — 복잡한 장면보다 하나의 명확한 주제
5. **배경 용도 시** "with space for text overlay" 추가

### 피해야 할 프롬프트

- 유명인/실존 인물 이름
- 특정 브랜드 로고
- 폭력적이거나 불쾌한 내용
- 너무 많은 디테일 (AI가 혼란)

## 프리셋 → 이미지 스타일 매핑

| 프리셋 | 이미지 스타일 키워드 |
|--------|---------------------|
| bold-signal | confident corporate, dark gradient, bold color blocks |
| electric-studio | professional studio, deep blue, clean edges |
| creative-voltage | vibrant pop art, halftone, energetic neon |
| dark-botanical | moody botanical, deep green, organic textures, gold accents |
| notebook-tabs | warm cream, soft shadows, cozy stationery |
| pastel-geometry | soft pastel, geometric shapes, light airy |
| split-pastel | playful pastel, peach and lavender, whimsical |
| vintage-editorial | retro geometric, thick borders, classic feel |
| neon-cyber | cyberpunk neon, dark background, electric blue/magenta |
| terminal-green | green phosphor, scanlines, hacker aesthetic |
| swiss-modern | Bauhaus grid, clean minimal, red accents |
| paper-and-ink | literary, ink on paper, elegant monochrome |
| neo-brutalism | punk, bold geometric, thick outlines, raw |
| bento-grid | Apple-style, sleek rounded, premium tech |
| dark-academia | vintage library, gold, classical architecture |
| glassmorphism | frosted glass, translucent, soft gradients |
| gradient-mesh | fluid gradients, colorful organic, vibrant |
| duotone-split | high contrast duotone, bold two-color |
| risograph-print | risograph, offset colors, retro grain |
| cyberpunk-outline | blueprint wireframe, neon outline, schematic |

## 트러블슈팅

### API 키 미설정
```
❌ GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.
   export GOOGLE_API_KEY="your-api-key"
```
→ 해당 프로바이더의 API 키를 환경변수로 설정

### 콘텐츠 정책 거부
```
⚠️ 이미지 생성 실패 (content_policy_violation): hero-bg.png
```
→ 프롬프트를 수정하여 재시도. 폭력적/불쾌한 내용 제거

### 레이트 리밋
```
⚠️ 이미지 생성 실패 (rate_limit_exceeded): slide05.png
```
→ `--delay=3000` 등 더 긴 간격으로 재시도

### 배치 모드에서 일부 실패
배치 모드는 개별 이미지 실패 시에도 나머지 이미지를 계속 생성한다. 실패한 이미지만 단일 모드로 재생성.
