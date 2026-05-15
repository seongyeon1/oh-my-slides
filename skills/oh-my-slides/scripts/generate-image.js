/**
 * oh-my-images — AI 이미지 생성 CLI (oh-my-slides 내장 모듈).
 *
 * Usage:
 *   node generate-image.js <output-path> --prompt="..." [options]
 *   node generate-image.js <output-dir> --batch=<manifest.json> [options]
 *
 * Options:
 *   --prompt="..."           이미지 생성 프롬프트
 *   --provider=nanobanana    프로바이더 (nanobanana|openai|stability, 기본: nanobanana)
 *   --model=...              모델 (프로바이더별 기본값)
 *   --width=1792             이미지 너비 (기본: 1792)
 *   --height=1024            이미지 높이 (기본: 1024)
 *   --quality=high           품질 (low|medium|high, 기본: high)
 *   --style="..."            프리셋 스타일 힌트
 *   --batch=<file.json>      배치 매니페스트 JSON 경로
 *   --delay=1000             배치 모드 요청 간격 ms (기본: 1000)
 *
 * Environment:
 *   GOOGLE_API_KEY        Google API 키 (Nanobanana / Imagen)
 *   OPENAI_API_KEY        OpenAI API 키
 *   STABILITY_API_KEY     Stability AI API 키
 *   OH_MY_IMAGES_PROVIDER 기본 프로바이더 오버라이드
 */
const fs = require('fs');
const path = require('path');
const { DEFAULT_WIDTH, DEFAULT_HEIGHT, validateProvider, saveImage, buildPrompt } = require('./providers/_base');

// ── CLI 인자 파싱 ──
const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (const arg of args) {
  if (arg.startsWith('--')) {
    const eq = arg.indexOf('=');
    if (eq > -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      flags[arg.slice(2)] = true;
    }
  } else {
    positional.push(arg);
  }
}

// ── 도움말 ──
if (flags.help || positional.length === 0) {
  console.log(`
🖼️  oh-my-images — AI 이미지 생성

사용법:
  node generate-image.js <output> --prompt="..." [--provider=nanobanana] [options]
  node generate-image.js <output-dir> --batch=manifest.json [--provider=nanobanana] [options]

옵션:
  --prompt="..."          이미지 프롬프트 (단일 모드 필수)
  --provider=nanobanana   프로바이더 (nanobanana|openai|stability)
  --model=...          모델 선택
  --width=1792         이미지 너비
  --height=1024        이미지 높이
  --quality=high       품질 (low|medium|high)
  --style="..."        oh-my-slides 프리셋 이름
  --batch=file.json    배치 매니페스트 JSON
  --delay=1000         배치 요청 간격 (ms)
  --help               이 도움말 표시

환경변수:
  GOOGLE_API_KEY          Google API 키 (Nanobanana / Imagen)
  OPENAI_API_KEY          OpenAI API 키
  STABILITY_API_KEY       Stability AI API 키
  OH_MY_IMAGES_PROVIDER   기본 프로바이더
`);
  process.exit(0);
}

// ── 설정 ──
const OUTPUT = path.resolve(positional[0]);
const PROVIDER_NAME = flags.provider || process.env.OH_MY_IMAGES_PROVIDER || 'nanobanana';
const MODEL = flags.model || null;
const WIDTH = parseInt(flags.width || String(DEFAULT_WIDTH), 10);
const HEIGHT = parseInt(flags.height || String(DEFAULT_HEIGHT), 10);
const QUALITY = flags.quality || 'high';
const STYLE = flags.style || '';
const PROMPT = flags.prompt || null;
const BATCH_FILE = flags.batch ? path.resolve(flags.batch) : null;
const DELAY = parseInt(flags.delay || '1000', 10);

/**
 * 프로바이더 로드 및 검증.
 * @returns {object} provider 모듈
 */
function loadProvider() {
  let provider;
  try {
    provider = require(`./providers/${PROVIDER_NAME}`);
  } catch (e) {
    console.error(`\n  ❌ 프로바이더를 찾을 수 없습니다: ${PROVIDER_NAME}`);
    console.error(`  사용 가능: nanobanana, openai, stability\n`);
    process.exit(1);
  }
  validateProvider(provider);

  // API 키 확인
  if (!process.env[provider.envKey]) {
    console.error(`\n  ❌ ${provider.envKey} 환경변수가 설정되지 않았습니다.`);
    console.error(`  export ${provider.envKey}="your-api-key"\n`);
    process.exit(1);
  }

  return provider;
}

/**
 * 단일 이미지 생성.
 * @param {object} provider
 */
async function runSingle(provider) {
  if (!PROMPT) {
    console.error('\n  ❌ --prompt 옵션이 필요합니다.\n');
    process.exit(1);
  }

  console.log(`\n🖼️  oh-my-images — 이미지 생성`);
  console.log(`   프로바이더: ${provider.name} (${MODEL || provider.defaultModel})`);
  console.log(`   사이즈: ${WIDTH}x${HEIGHT}`);
  console.log(`   품질: ${QUALITY}`);
  if (STYLE) console.log(`   스타일: ${STYLE}`);
  console.log(`   프롬프트: ${PROMPT.slice(0, 80)}${PROMPT.length > 80 ? '...' : ''}`);
  console.log('');

  const buffer = await provider.generate({
    prompt: PROMPT,
    width: WIDTH,
    height: HEIGHT,
    model: MODEL,
    quality: QUALITY,
  });

  saveImage(buffer, OUTPUT);
  console.log(`\n✅ 이미지 생성 완료!\n`);
}

/**
 * 배치 모드: 매니페스트 JSON으로 여러 이미지 생성.
 * @param {object} provider
 */
async function runBatch(provider) {
  if (!fs.existsSync(BATCH_FILE)) {
    console.error(`\n  ❌ 매니페스트 파일을 찾을 수 없습니다: ${BATCH_FILE}\n`);
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'));
  } catch (e) {
    console.error(`\n  ❌ 매니페스트 파싱 실패: ${e.message}\n`);
    process.exit(1);
  }

  if (!Array.isArray(manifest) || manifest.length === 0) {
    console.error('\n  ❌ 매니페스트는 비어있지 않은 배열이어야 합니다.\n');
    process.exit(1);
  }

  // OUTPUT이 디렉토리인지 확인/생성
  const outputDir = OUTPUT;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🖼️  oh-my-images — 배치 이미지 생성`);
  console.log(`   프로바이더: ${provider.name} (${MODEL || provider.defaultModel})`);
  console.log(`   이미지 수: ${manifest.length}`);
  console.log(`   출력 디렉토리: ${outputDir}`);
  console.log(`   요청 간격: ${DELAY}ms`);
  console.log('');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const filename = item.filename;
    const prompt = item.prompt;

    if (!filename || !prompt) {
      console.log(`   ⚠️ [${i + 1}/${manifest.length}] 건너뜀 — filename 또는 prompt 누락`);
      failed++;
      continue;
    }

    const outputPath = path.resolve(outputDir, filename);
    const itemWidth = parseInt(item.width || String(WIDTH), 10);
    const itemHeight = parseInt(item.height || String(HEIGHT), 10);
    const itemModel = item.model || MODEL;
    const itemQuality = item.quality || QUALITY;

    console.log(`   🖼️  [${i + 1}/${manifest.length}] ${filename}`);
    console.log(`      프롬프트: ${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}`);

    try {
      const buffer = await provider.generate({
        prompt,
        width: itemWidth,
        height: itemHeight,
        model: itemModel,
        quality: itemQuality,
      });

      saveImage(buffer, outputPath);
      success++;
    } catch (e) {
      console.log(`      ⚠️ 실패: ${e.message}`);
      failed++;
    }

    // 마지막 요청이 아닌 경우 딜레이
    if (i < manifest.length - 1 && DELAY > 0) {
      await new Promise(r => setTimeout(r, DELAY));
    }
  }

  console.log(`\n✅ 배치 완료: ${success}개 성공, ${failed}개 실패 (총 ${manifest.length}개)\n`);

  if (failed > 0) {
    process.exit(2); // 부분 실패
  }
}

// ── 메인 ──
async function main() {
  const provider = loadProvider();

  if (BATCH_FILE) {
    await runBatch(provider);
  } else {
    await runSingle(provider);
  }
}

main().catch(e => {
  console.error(`\n  ❌ ${e.message}\n`);
  process.exit(1);
});
