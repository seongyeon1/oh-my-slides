/**
 * oh-my-images — Nanobanana (Google Gemini/Imagen) 이미지 생성 프로바이더.
 * Gemini generateContent API 기반 이미지 생성.
 * 지원 모델: gemini-2.5-flash-image, gemini-3-pro-image-preview 등.
 * Imagen predict API도 지원 (imagen-4.0-* 모델).
 * Node.js 내장 https 모듈만 사용 (외부 의존성 없음).
 */
const https = require('https');

const API_HOST = 'generativelanguage.googleapis.com';
const ENV_KEY = 'GOOGLE_API_KEY';

// Gemini 이미지 생성 모델 (generateContent API)
// Imagen 모델 (predict API)
const MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'imagen-4.0-generate-001',
  'imagen-4.0-ultra-generate-001',
  'imagen-4.0-fast-generate-001',
];
const DEFAULT_MODEL = 'gemini-2.5-flash-image';

/**
 * 모델이 Imagen predict API를 사용하는지 판별.
 * @param {string} model
 * @returns {boolean}
 */
function isImagenModel(model) {
  return model.startsWith('imagen-');
}

/**
 * 너비/높이를 aspect ratio 문자열로 변환.
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function toAspectRatio(width, height) {
  const ratio = width / height;
  if (ratio > 1.6) return '16:9';
  if (ratio > 1.2) return '4:3';
  if (ratio < 0.63) return '9:16';
  if (ratio < 0.83) return '3:4';
  return '1:1';
}

/**
 * HTTPS POST 요청.
 * @param {string} pathname - API 경로 (쿼리 파라미터 포함)
 * @param {object} body
 * @returns {Promise<object>} parsed JSON response
 */
function post(pathname, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);

    const req = https.request({
      hostname: API_HOST,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          const json = JSON.parse(raw);
          if (res.statusCode >= 400) {
            const errMsg = json.error?.message || raw.slice(0, 300);
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
 * Gemini generateContent API로 이미지 생성.
 * @param {string} apiKey
 * @param {string} useModel
 * @param {string} prompt
 * @returns {Promise<Buffer>}
 */
async function generateViaGemini(apiKey, useModel, prompt) {
  const pathname = `/v1beta/models/${useModel}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  const json = await post(pathname, body);

  // 응답 파트에서 이미지 데이터 찾기
  const parts = json.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  // 이미지가 없는 경우
  const textPart = parts.find(p => p.text);
  const hint = textPart ? ` (모델 응답: ${textPart.text.slice(0, 100)})` : '';
  const blocked = json.candidates?.[0]?.finishReason === 'SAFETY';
  const reason = blocked ? '안전 정책에 의해 차단됨' : `응답에 이미지 데이터 없음${hint}`;
  throw new Error(`Nanobanana (Gemini): ${reason}`);
}

/**
 * Imagen predict API로 이미지 생성.
 * @param {string} apiKey
 * @param {string} useModel
 * @param {string} prompt
 * @param {string} aspectRatio
 * @returns {Promise<Buffer>}
 */
async function generateViaImagen(apiKey, useModel, prompt, aspectRatio) {
  const pathname = `/v1beta/models/${useModel}:predict?key=${apiKey}`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      outputOptions: { mimeType: 'image/png' },
    },
  };

  const json = await post(pathname, body);

  const prediction = json.predictions?.[0];
  const b64 = prediction?.bytesBase64Encoded;
  if (!b64) {
    const reason = prediction?.safetyAttributes?.blocked
      ? '안전 정책에 의해 차단됨'
      : '응답에 이미지 데이터 없음';
    throw new Error(`Nanobanana (Imagen): ${reason}`);
  }

  return Buffer.from(b64, 'base64');
}

/**
 * Google API로 이미지 생성 (Gemini 또는 Imagen 자동 선택).
 * @param {object} opts
 * @param {string} opts.prompt - 이미지 생성 프롬프트
 * @param {number} [opts.width=1792] - 이미지 너비 (aspect ratio 결정용)
 * @param {number} [opts.height=1024] - 이미지 높이 (aspect ratio 결정용)
 * @param {string} [opts.model] - 모델
 * @param {string} [opts.quality='high'] - 품질
 * @returns {Promise<Buffer>} 이미지 데이터
 */
async function generate({ prompt, width = 1792, height = 1024, model, quality = 'high' }) {
  const apiKey = process.env[ENV_KEY];
  const useModel = model || DEFAULT_MODEL;

  if (isImagenModel(useModel)) {
    const aspectRatio = toAspectRatio(width, height);
    return generateViaImagen(apiKey, useModel, prompt, aspectRatio);
  } else {
    return generateViaGemini(apiKey, useModel, prompt);
  }
}

module.exports = {
  name: 'nanobanana',
  envKey: ENV_KEY,
  models: MODELS,
  defaultModel: DEFAULT_MODEL,
  generate,
};
