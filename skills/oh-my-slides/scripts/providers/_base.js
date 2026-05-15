/**
 * oh-my-images Provider Base
 * 모든 이미지 생성 프로바이더의 공통 인터페이스 및 유틸리티.
 */
const fs = require('fs');
const path = require('path');

// ── 프레젠테이션용 기본 이미지 사이즈 (16:9) ──
const DEFAULT_WIDTH = 1792;
const DEFAULT_HEIGHT = 1024;

// ── 프리셋 → 이미지 스타일 키워드 매핑 ──
const PRESET_STYLE_MAP = {
  'bold-signal':       'confident corporate, dark gradient background, bold color blocks, strong contrast, modern design',
  'electric-studio':   'professional studio, vertical split panels, clean edge accents, deep blue tones, corporate elegance',
  'creative-voltage':  'creative halftone texture, vibrant neon badges, energetic pop art, bold graphic design',
  'dark-botanical':    'dark moody botanical, deep green tones, organic textures, blurred overlapping gradients, gold accents, film grain',
  'notebook-tabs':     'warm cream paper, editorial notebook, soft shadows, colored tab accents, cozy stationery aesthetic',
  'pastel-geometry':   'soft pastel colors, geometric shapes, friendly rounded elements, light airy composition',
  'split-pastel':      'playful pastel split layout, peach and lavender tones, whimsical badges, light-hearted',
  'vintage-editorial': 'witty vintage editorial, thick borders, retro geometric shapes, classic typography feel',
  'neon-cyber':        'cyberpunk neon glow, dark background, digital grid, electric blue and magenta, futuristic particles',
  'terminal-green':    'retro terminal screen, green phosphor scanlines, monospace code aesthetic, dark hacker vibes',
  'swiss-modern':      'Swiss international style, Bauhaus grid, clean sans-serif precision, minimal red accents',
  'paper-and-ink':     'literary editorial, serif typography, ink on paper, classic book design, elegant monochrome',
  'neo-brutalism':     'neo-brutalist punk design, bold geometric, anti-design, thick black outlines, raw typography',
  'bento-grid':        'Apple-style bento grid, sleek rounded cards, minimalist, soft shadows, premium tech aesthetic',
  'dark-academia':     'dark academia aesthetic, vintage library, gold accents, classical architecture, warm candlelight',
  'glassmorphism':     'premium glassmorphism, translucent frosted overlays, depth blur effects, soft gradients',
  'gradient-mesh':     'fluid gradient mesh, colorful organic shapes, artistic abstract, vibrant flowing colors',
  'duotone-split':     'high contrast duotone, graphic intensity, bold two-color scheme, strong visual impact',
  'risograph-print':   'risograph print aesthetic, handmade poster, vintage offset colors, retro grain texture',
  'cyberpunk-outline': 'blueprint wireframe, neon outline glow, dark technical schematic, cyberpunk grid lines',
};

/**
 * 프로바이더 모듈 인터페이스 검증.
 * @param {object} provider - 프로바이더 모듈
 * @throws {Error} 필수 필드 누락 시
 */
function validateProvider(provider) {
  const required = ['name', 'envKey', 'models', 'defaultModel', 'generate'];
  for (const field of required) {
    if (!provider[field]) {
      throw new Error(`프로바이더에 필수 필드 누락: ${field}`);
    }
  }
  if (typeof provider.generate !== 'function') {
    throw new Error(`프로바이더 generate는 함수여야 합니다`);
  }
  if (!Array.isArray(provider.models) || provider.models.length === 0) {
    throw new Error(`프로바이더 models는 비어있지 않은 배열이어야 합니다`);
  }
}

/**
 * 이미지 Buffer를 파일로 저장.
 * @param {Buffer} buffer - 이미지 데이터
 * @param {string} outputPath - 출력 파일 경로
 */
function saveImage(buffer, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, buffer);
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`   ✓ 저장: ${outputPath} (${sizeKB}KB)`);
}

/**
 * 슬라이드 컨텍스트 + 프리셋 스타일로 이미지 생성 프롬프트 빌드.
 * @param {object} slideContext - { title, bullets, slideNumber, totalSlides, presentationTopic, imageDescription }
 * @param {string} [style] - 프리셋 이름 (예: 'dark-botanical')
 * @param {string} [locale='ko'] - 프롬프트 언어 (ko|en)
 * @returns {string} 최종 프롬프트
 */
function buildPrompt(slideContext, style, locale) {
  const { title, bullets, presentationTopic, imageDescription } = slideContext;

  // 기본 프롬프트 구성
  const parts = [];

  // 사용자가 직접 이미지 설명을 제공한 경우 우선 사용
  if (imageDescription) {
    parts.push(imageDescription);
  } else {
    parts.push(`Presentation image for a slide titled "${title || 'Untitled'}"`);
    if (presentationTopic) {
      parts.push(`Topic: ${presentationTopic}`);
    }
    if (bullets && bullets.length > 0) {
      parts.push(`Key points: ${bullets.join(', ')}`);
    }
  }

  // 프리셋 스타일 힌트 추가
  const styleHint = PRESET_STYLE_MAP[style];
  if (styleHint) {
    parts.push(`Visual style: ${styleHint}`);
  }

  // 프레젠테이션 이미지 공통 지침
  parts.push('16:9 aspect ratio, high resolution, suitable for presentation slide background or illustration');
  parts.push('No text or letters in the image');

  return parts.join('. ') + '.';
}

module.exports = {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  PRESET_STYLE_MAP,
  validateProvider,
  saveImage,
  buildPrompt,
};
