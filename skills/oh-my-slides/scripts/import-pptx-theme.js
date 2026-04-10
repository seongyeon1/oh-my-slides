/**
 * PPTX 파일에서 테마(색상, 폰트, 미디어)를 추출하여 커스텀 CSS 프리셋을 생성한다.
 *
 * Usage:
 *   node import-pptx-theme.js <input.pptx> <preset-name> [options]
 *
 * Options:
 *   --dark              다크 테마로 강제 지정 (자동 감지 대신)
 *   --light             라이트 테마로 강제 지정
 *   --workspace=<dir>   에셋을 workspace 디렉토리에도 복사 (HTML에서 참조용)
 *
 * Examples:
 *   node import-pptx-theme.js company-template.pptx my-brand
 *   node import-pptx-theme.js template.pptx dark-corp --dark
 *   node import-pptx-theme.js template.pptx my-brand --workspace=docs/workspace
 *
 * Output:
 *   templates/presets/custom-<name>.css           — CSS 커스텀 프로퍼티 프리셋
 *   templates/assets/custom-<name>/              — 추출된 미디어 파일 (원본)
 *   <workspace>/assets/custom-<name>/            — workspace 복사본 (--workspace 사용 시)
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ─── Office 폰트 → Google Fonts 매핑 ───
const FONT_MAP = {
  'Calibri':           { google: 'Inter',            weights: '400;500;700' },
  'Calibri Light':     { google: 'Inter',            weights: '300;400' },
  'Cambria':           { google: 'Merriweather',     weights: '400;700' },
  'Arial':             { google: 'Inter',            weights: '400;500;700' },
  'Times New Roman':   { google: 'Source Serif 4',   weights: '400;600;700' },
  'Segoe UI':          { google: 'Inter',            weights: '400;500;700' },
  'Verdana':           { google: 'Nunito',           weights: '400;600;700' },
  'Tahoma':            { google: 'Nunito',           weights: '400;700' },
  'Georgia':           { google: 'Merriweather',     weights: '400;700' },
  'Trebuchet MS':      { google: 'Outfit',           weights: '400;600;700' },
  'Garamond':          { google: 'Cormorant Garamond', weights: '400;600;700' },
  'Century Gothic':    { google: 'Poppins',          weights: '400;600;700' },
  'Aptos':             { google: 'Inter',            weights: '400;500;700' },
  'Aptos Display':     { google: 'Inter',            weights: '400;700;800' },
};

// ─── 헬퍼 함수 ───

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

/**
 * XML 문자열에서 특정 태그 내의 색상 값을 추출한다.
 * <a:srgbClr val="RRGGBB"/> 또는 <a:sysClr lastClr="RRGGBB"/> 를 처리.
 */
function extractColor(xml, tagName) {
  // 태그 블록 추출
  const blockRe = new RegExp(`<a:${tagName}>(.*?)</a:${tagName}>`, 's');
  const block = xml.match(blockRe);
  if (!block) return null;

  const content = block[1];

  // srgbClr 먼저 시도
  const srgb = content.match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
  if (srgb) return `#${srgb[1]}`;

  // sysClr의 lastClr fallback
  const sys = content.match(/<a:sysClr[^>]+lastClr="([0-9A-Fa-f]{6})"/);
  if (sys) return `#${sys[1]}`;

  return null;
}

/**
 * XML 문자열에서 폰트 스키마의 라틴 폰트를 추출한다.
 */
function extractFont(xml, fontType) {
  // majorFont 또는 minorFont 블록
  const blockRe = new RegExp(`<a:${fontType}>(.*?)</a:${fontType}>`, 's');
  const block = xml.match(blockRe);
  if (!block) return null;

  const latin = block[1].match(/<a:latin\s+typeface="([^"]+)"/);
  if (latin && latin[1] && latin[1] !== '') return latin[1];

  return null;
}

/**
 * 폰트 이름을 CSS font-family 값으로 변환한다.
 * Office 기본 폰트는 Google Fonts 대체를 제안한다.
 */
function mapFont(fontName) {
  if (!fontName) return { css: "'Pretendard', sans-serif", google: null, original: null };

  const mapped = FONT_MAP[fontName];
  if (mapped) {
    return {
      css: `'${mapped.google}', 'Pretendard', sans-serif`,
      google: mapped,
      original: fontName,
    };
  }

  // 매핑에 없는 폰트는 그대로 사용
  return {
    css: `'${fontName}', 'Pretendard', sans-serif`,
    google: null,
    original: fontName,
  };
}

// ─── 메인 ───

function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const positional = args.filter(a => !a.startsWith('--'));

  if (positional.length < 2) {
    console.error('Usage: node import-pptx-theme.js <input.pptx> <preset-name> [--dark|--light]');
    process.exit(1);
  }

  const inputPptx = path.resolve(positional[0]);
  const presetName = positional[1].replace(/[^a-zA-Z0-9_-]/g, '-');
  const forceDark = flags.includes('--dark');
  const forceLight = flags.includes('--light');
  const workspaceFlag = flags.find(f => f.startsWith('--workspace='));
  const workspaceDir = workspaceFlag ? path.resolve(workspaceFlag.split('=')[1]) : null;

  // 스킬 루트 디렉토리 (scripts/ 의 상위)
  const skillRoot = path.resolve(__dirname, '..');
  const presetsDir = path.join(skillRoot, 'templates', 'presets');
  const assetsDir = path.join(skillRoot, 'templates', 'assets', `custom-${presetName}`);
  const workspaceAssetsDir = workspaceDir ? path.join(workspaceDir, 'assets', `custom-${presetName}`) : null;

  // 출력 파일 경로
  const outputCss = path.join(presetsDir, `custom-${presetName}.css`);

  // 이미 존재하는지 확인
  if (fs.existsSync(outputCss)) {
    console.error(`\n  ⚠ 프리셋이 이미 존재합니다: custom-${presetName}.css`);
    console.error(`  다른 이름을 사용하거나 기존 파일을 삭제하세요.\n`);
    process.exit(1);
  }

  // 입력 파일 확인
  if (!fs.existsSync(inputPptx)) {
    console.error(`\n  ✗ 파일을 찾을 수 없습니다: ${inputPptx}\n`);
    process.exit(1);
  }

  // ── Phase 1: PPTX 압축 해제 ──
  const tmpDir = path.join(os.tmpdir(), `pptx-theme-${crypto.randomUUID()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    execSync(`unzip -o -q "${inputPptx}" -d "${tmpDir}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error('\n  ✗ PPTX 압축 해제 실패. 파일이 손상되었거나 암호로 보호되어 있을 수 있습니다.\n');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // ── Phase 2: 테마 XML 파싱 ──
  let themeXml = null;
  const themePaths = ['ppt/theme/theme1.xml', 'ppt/theme/theme2.xml'];
  for (const tp of themePaths) {
    const full = path.join(tmpDir, tp);
    if (fs.existsSync(full)) {
      themeXml = fs.readFileSync(full, 'utf8');
      break;
    }
  }

  if (!themeXml) {
    console.error('\n  ✗ 테마 파일을 찾을 수 없습니다 (ppt/theme/theme1.xml).');
    console.error('  이 PPTX에는 테마가 포함되어 있지 않습니다.');
    console.error('  수동으로 프리셋 CSS를 생성해주세요.\n');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // 색상 추출
  const colors = {
    dk1: extractColor(themeXml, 'dk1'),
    lt1: extractColor(themeXml, 'lt1'),
    dk2: extractColor(themeXml, 'dk2'),
    lt2: extractColor(themeXml, 'lt2'),
    accent1: extractColor(themeXml, 'accent1'),
    accent2: extractColor(themeXml, 'accent2'),
    accent3: extractColor(themeXml, 'accent3'),
    accent4: extractColor(themeXml, 'accent4'),
    accent5: extractColor(themeXml, 'accent5'),
    accent6: extractColor(themeXml, 'accent6'),
  };

  // 폰트 추출
  const majorFont = extractFont(themeXml, 'majorFont');
  const minorFont = extractFont(themeXml, 'minorFont');

  // ── Phase 3: 다크/라이트 감지 ──
  let isDark;
  if (forceDark) {
    isDark = true;
  } else if (forceLight) {
    isDark = false;
  } else {
    // lt1이 밝으면 라이트 테마 (lt1을 배경으로 사용)
    const lt1Lum = colors.lt1 ? luminance(colors.lt1) : 1;
    const dk1Lum = colors.dk1 ? luminance(colors.dk1) : 0;
    isDark = lt1Lum < 0.5 && dk1Lum < 0.5;
  }

  // ── Phase 4: CSS 변수 매핑 ──
  let bgPrimary, bgSecondary, bgCard, textPrimary, textSecondary, accent, border;

  if (isDark) {
    bgPrimary = colors.dk1 || '#1a1a1a';
    bgSecondary = colors.dk2 || lighten(bgPrimary, 0.1);
    bgCard = colors.dk2 || lighten(bgPrimary, 0.15);
    textPrimary = colors.lt1 || '#ffffff';
    textSecondary = withAlpha(textPrimary.replace('#', ''), 0.7);
    border = withAlpha(textPrimary.replace('#', ''), 0.08);
  } else {
    bgPrimary = colors.lt1 || '#ffffff';
    bgSecondary = colors.lt2 || darken(bgPrimary, 0.05);
    bgCard = colors.lt2 || '#ffffff';
    textPrimary = colors.dk1 || '#1a1a1a';
    textSecondary = withAlpha(textPrimary.replace('#', ''), 0.7);
    border = withAlpha(textPrimary.replace('#', ''), 0.08);
  }

  accent = colors.accent1 || '#4472C4';
  const accentSoft = withAlpha(accent.replace('#', ''), 0.15);

  // 폰트 매핑
  const displayFont = mapFont(majorFont);
  const bodyFont = mapFont(minorFont);
  const sameFont = majorFont && minorFont && majorFont === minorFont;

  // ── Phase 5: CSS 프리셋 파일 생성 ──
  const assetRelPath = `assets/custom-${presetName}`;
  let css = `/* Custom: ${presetName} — imported from ${path.basename(inputPptx)} */\n`;
  css += `/* @asset-dir: ${assetRelPath} */\n`;
  css += `:root {\n`;
  css += `  --bg-primary: ${bgPrimary};\n`;
  css += `  --bg-secondary: ${bgSecondary};\n`;
  css += `  --bg-card: ${bgCard};\n`;
  css += `  --text-primary: ${textPrimary};\n`;
  css += `  --text-secondary: ${textSecondary};\n`;
  css += `  --accent: ${accent};\n`;
  css += `  --accent-soft: ${accentSoft};\n`;
  css += `  --border: ${border};\n`;
  css += `  --font-display: ${displayFont.css};\n`;
  css += `  --font-body: ${bodyFont.css};\n`;
  if (sameFont) {
    css += `  --font-weight-display: 700;\n`;
    css += `  --font-weight-body: 400;\n`;
  }
  css += `}\n`;

  // 추가 accent 색상 주석
  const extraAccents = [];
  if (colors.accent2) extraAccents.push(`accent2: ${colors.accent2}`);
  if (colors.accent3) extraAccents.push(`accent3: ${colors.accent3}`);
  if (colors.accent4) extraAccents.push(`accent4: ${colors.accent4}`);
  if (colors.accent5) extraAccents.push(`accent5: ${colors.accent5}`);
  if (colors.accent6) extraAccents.push(`accent6: ${colors.accent6}`);

  if (extraAccents.length > 0) {
    css += `\n/* 추가 accent 색상 (필요 시 CSS 변수로 추가):\n`;
    css += extraAccents.map(a => `   ${a}`).join('\n');
    css += `\n*/\n`;
  }

  // CSS 파일 저장
  fs.mkdirSync(presetsDir, { recursive: true });
  fs.writeFileSync(outputCss, css, 'utf8');

  // ── Phase 6: 미디어 파일 복사 ──
  const mediaDir = path.join(tmpDir, 'ppt', 'media');
  let mediaCount = 0;
  const skippedFormats = [];

  if (fs.existsSync(mediaDir)) {
    const mediaFiles = fs.readdirSync(mediaDir);
    const webFormats = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const skipFormats = ['.emf', '.wmf', '.tiff', '.bmp'];

    const compatibleFiles = mediaFiles.filter(f => {
      const ext = path.extname(f).toLowerCase();
      if (skipFormats.includes(ext)) {
        skippedFormats.push(f);
        return false;
      }
      return webFormats.includes(ext);
    });

    if (compatibleFiles.length > 0) {
      fs.mkdirSync(assetsDir, { recursive: true });
      for (const f of compatibleFiles) {
        fs.copyFileSync(path.join(mediaDir, f), path.join(assetsDir, f));
        mediaCount++;
      }
    }
  }

  // ── Phase 6-B: Workspace에 에셋 복사 (--workspace 사용 시) ──
  if (workspaceAssetsDir && mediaCount > 0) {
    fs.mkdirSync(workspaceAssetsDir, { recursive: true });
    const srcFiles = fs.readdirSync(assetsDir);
    for (const f of srcFiles) {
      fs.copyFileSync(path.join(assetsDir, f), path.join(workspaceAssetsDir, f));
    }
  }

  // ── Phase 7: 결과 출력 ──
  console.log('\n  ╔══════════════════════════════════════════════╗');
  console.log(`  ║  PPTX Theme Import: ${presetName.padEnd(24)}║`);
  console.log('  ╚══════════════════════════════════════════════╝\n');

  console.log(`  테마 타입: ${isDark ? 'Dark' : 'Light'}\n`);

  console.log('  ── 추출된 색상 ──');
  console.log(`  dk1:     ${colors.dk1 || '(없음)'}     lt1:     ${colors.lt1 || '(없음)'}`);
  console.log(`  dk2:     ${colors.dk2 || '(없음)'}     lt2:     ${colors.lt2 || '(없음)'}`);
  console.log(`  accent1: ${colors.accent1 || '(없음)'}     accent2: ${colors.accent2 || '(없음)'}`);
  console.log(`  accent3: ${colors.accent3 || '(없음)'}     accent4: ${colors.accent4 || '(없음)'}`);
  console.log(`  accent5: ${colors.accent5 || '(없음)'}     accent6: ${colors.accent6 || '(없음)'}\n`);

  console.log('  ── CSS 변수 매핑 ──');
  console.log(`  --bg-primary:    ${bgPrimary}`);
  console.log(`  --bg-secondary:  ${bgSecondary}`);
  console.log(`  --text-primary:  ${textPrimary}`);
  console.log(`  --accent:        ${accent}\n`);

  console.log('  ── 폰트 ──');
  console.log(`  Display: ${majorFont || '(없음)'}${displayFont.original && displayFont.google ? ` → ${displayFont.google.google}` : ''}`);
  console.log(`  Body:    ${minorFont || '(없음)'}${bodyFont.original && bodyFont.google ? ` → ${bodyFont.google.google}` : ''}`);

  // Google Fonts 링크 생성
  const googleFonts = new Set();
  if (displayFont.google) googleFonts.add(`family=${displayFont.google.google.replace(/ /g, '+')}:wght@${displayFont.google.weights}`);
  if (bodyFont.google && (!displayFont.google || displayFont.google.google !== bodyFont.google.google)) {
    googleFonts.add(`family=${bodyFont.google.google.replace(/ /g, '+')}:wght@${bodyFont.google.weights}`);
  }

  if (googleFonts.size > 0) {
    const fontsParam = Array.from(googleFonts).join('&');
    console.log(`\n  Google Fonts:`);
    console.log(`  <link href="https://fonts.googleapis.com/css2?${fontsParam}&display=swap" rel="stylesheet">`);
  }

  if (displayFont.original && !displayFont.google) {
    console.log(`\n  ⚠ Display 폰트 "${displayFont.original}"는 Google Fonts 매핑에 없습니다.`);
    console.log(`    시스템 폰트이거나 별도 CDN이 필요할 수 있습니다.`);
  }
  if (bodyFont.original && !bodyFont.google && bodyFont.original !== displayFont.original) {
    console.log(`\n  ⚠ Body 폰트 "${bodyFont.original}"는 Google Fonts 매핑에 없습니다.`);
  }

  console.log(`\n  ── 출력 파일 ──`);
  console.log(`  CSS:    ${path.relative(process.cwd(), outputCss)}`);
  if (mediaCount > 0) {
    console.log(`  Assets: ${path.relative(process.cwd(), assetsDir)}/ (${mediaCount}개 파일)`);
  }
  if (workspaceAssetsDir && mediaCount > 0) {
    console.log(`  Workspace: ${path.relative(process.cwd(), workspaceAssetsDir)}/ (복사본)`);
  }
  if (skippedFormats.length > 0) {
    console.log(`  ⚠ 건너뜀: ${skippedFormats.length}개 파일 (EMF/WMF/TIFF/BMP — 웹 비호환)`);
  }

  // HTML에서의 에셋 참조 경로 안내
  console.log(`\n  ── HTML에서의 에셋 참조 ──`);
  if (workspaceAssetsDir) {
    const htmlAssetPath = `workspace/assets/custom-${presetName}`;
    console.log(`  HTML (docs/ 기준): src="${htmlAssetPath}/파일명"`);
  } else {
    console.log(`  ⚠ --workspace 미사용. HTML에서 에셋 참조 시 경로 주의!`);
    console.log(`  권장: --workspace=docs/workspace 옵션으로 재실행`);
  }

  console.log('\n  ✓ 커스텀 프리셋 생성 완료!\n');

  // ── Phase 8: 정리 ──
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main();
