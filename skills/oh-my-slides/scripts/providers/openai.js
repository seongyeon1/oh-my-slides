/**
 * oh-my-images — OpenAI 이미지 생성 프로바이더.
 * gpt-image-1 / DALL-E 3 지원.
 * Node.js 내장 https 모듈만 사용 (외부 의존성 없음).
 */
const https = require('https');

const API_URL = 'https://api.openai.com/v1/images/generations';
const ENV_KEY = 'OPENAI_API_KEY';
const MODELS = ['gpt-image-1', 'dall-e-3'];
const DEFAULT_MODEL = 'gpt-image-1';

// DALL-E 3 고정 사이즈 옵션
const DALLE3_SIZES = ['1792x1024', '1024x1024', '1024x1792'];

/**
 * 너비/높이를 DALL-E 3 호환 사이즈 문자열로 변환.
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function toDalle3Size(width, height) {
  const ratio = width / height;
  if (ratio > 1.3) return '1792x1024';   // 가로형 (16:9 등)
  if (ratio < 0.77) return '1024x1792';  // 세로형
  return '1024x1024';                     // 정방형
}

/**
 * quality 파라미터를 OpenAI API 값으로 변환.
 * @param {string} quality - low|medium|high
 * @param {string} model
 * @returns {string}
 */
function toApiQuality(quality, model) {
  if (model === 'gpt-image-1') {
    if (quality === 'low') return 'low';
    if (quality === 'medium') return 'medium';
    return 'high';
  }
  // DALL-E 3: standard | hd
  return quality === 'low' ? 'standard' : 'hd';
}

/**
 * HTTPS POST 요청.
 * @param {string} url
 * @param {object} body
 * @param {object} headers
 * @returns {Promise<object>} parsed JSON response
 */
function post(url, body, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const data = JSON.stringify(body);

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          const json = JSON.parse(raw);
          if (res.statusCode >= 400) {
            const errMsg = json.error?.message || raw;
            const errCode = json.error?.code || `http_${res.statusCode}`;
            reject(new Error(`[${errCode}] ${errMsg}`));
          } else {
            resolve(json);
          }
        } catch {
          reject(new Error(`응답 파싱 실패 (status ${res.statusCode}): ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * OpenAI API로 이미지 생성.
 * @param {object} opts
 * @param {string} opts.prompt - 이미지 생성 프롬프트
 * @param {number} [opts.width=1792] - 이미지 너비
 * @param {number} [opts.height=1024] - 이미지 높이
 * @param {string} [opts.model] - 모델 (gpt-image-1 | dall-e-3)
 * @param {string} [opts.quality='high'] - 품질
 * @returns {Promise<Buffer>} PNG 이미지 데이터
 */
async function generate({ prompt, width = 1792, height = 1024, model, quality = 'high' }) {
  const apiKey = process.env[ENV_KEY];
  const useModel = model || DEFAULT_MODEL;

  const body = {
    model: useModel,
    prompt,
    n: 1,
    response_format: 'b64_json',
    quality: toApiQuality(quality, useModel),
  };

  // gpt-image-1: 자유 사이즈 지원
  if (useModel === 'gpt-image-1') {
    body.size = `${width}x${height}`;
  } else {
    // DALL-E 3: 고정 사이즈
    body.size = toDalle3Size(width, height);
  }

  const json = await post(API_URL, body, {
    'Authorization': `Bearer ${apiKey}`,
  });

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI 응답에 이미지 데이터 없음');
  }

  return Buffer.from(b64, 'base64');
}

module.exports = {
  name: 'openai',
  envKey: ENV_KEY,
  models: MODELS,
  defaultModel: DEFAULT_MODEL,
  generate,
};
