/**
 * oh-my-images — Stability AI 이미지 생성 프로바이더.
 * Stable Image Core / SD3.5 지원.
 * Node.js 내장 https 모듈 + 자체 multipart/form-data 구현 (외부 의존성 없음).
 */
const https = require('https');
const crypto = require('crypto');

const ENV_KEY = 'STABILITY_API_KEY';
const MODELS = ['core', 'sd3.5-large', 'sd3.5-medium'];
const DEFAULT_MODEL = 'core';

// 모델별 API 엔드포인트
const MODEL_ENDPOINTS = {
  'core':          '/v2beta/stable-image/generate/core',
  'sd3.5-large':   '/v2beta/stable-image/generate/sd3',
  'sd3.5-medium':  '/v2beta/stable-image/generate/sd3',
};

/**
 * 너비/높이를 Stability API aspect_ratio 문자열로 변환.
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function toAspectRatio(width, height) {
  const ratio = width / height;
  if (ratio > 1.6) return '16:9';
  if (ratio > 1.3) return '3:2';
  if (ratio < 0.63) return '9:16';
  if (ratio < 0.77) return '2:3';
  return '1:1';
}

/**
 * multipart/form-data 바디 빌드 (외부 라이브러리 없이).
 * @param {object} fields - { key: value } 형태
 * @returns {{ body: Buffer, contentType: string }}
 */
function buildMultipart(fields) {
  const boundary = `----OhMyImagesFormBoundary${crypto.randomBytes(8).toString('hex')}`;
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
      `${value}\r\n`
    ));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/**
 * HTTPS POST 요청 (multipart/form-data).
 * @param {string} pathname - API 경로
 * @param {Buffer} body
 * @param {object} headers
 * @returns {Promise<Buffer>} 응답 바디 (이미지 바이너리)
 */
function post(pathname, body, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.stability.ai',
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Length': body.length,
        'Accept': 'image/*',
        ...headers,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        if (res.statusCode >= 400) {
          let errMsg;
          try {
            const json = JSON.parse(raw.toString('utf8'));
            errMsg = json.message || json.name || raw.toString('utf8').slice(0, 200);
          } catch {
            errMsg = raw.toString('utf8').slice(0, 200);
          }
          reject(new Error(`[stability_${res.statusCode}] ${errMsg}`));
        } else {
          resolve(raw);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Stability AI API로 이미지 생성.
 * @param {object} opts
 * @param {string} opts.prompt - 이미지 생성 프롬프트
 * @param {number} [opts.width=1792] - 이미지 너비
 * @param {number} [opts.height=1024] - 이미지 높이
 * @param {string} [opts.model] - 모델 (core | sd3.5-large | sd3.5-medium)
 * @param {string} [opts.quality='high'] - 품질
 * @returns {Promise<Buffer>} PNG 이미지 데이터
 */
async function generate({ prompt, width = 1792, height = 1024, model, quality = 'high' }) {
  const apiKey = process.env[ENV_KEY];
  const useModel = model || DEFAULT_MODEL;
  const endpoint = MODEL_ENDPOINTS[useModel] || MODEL_ENDPOINTS['core'];

  const fields = {
    prompt,
    output_format: 'png',
    aspect_ratio: toAspectRatio(width, height),
  };

  // SD3.5 모델은 model 파라미터 필요
  if (useModel.startsWith('sd3.5')) {
    fields.model = useModel === 'sd3.5-large' ? 'sd3.5-large' : 'sd3.5-medium';
  }

  const { body, contentType } = buildMultipart(fields);

  const imageBuffer = await post(endpoint, body, {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': contentType,
  });

  return imageBuffer;
}

module.exports = {
  name: 'stability',
  envKey: ENV_KEY,
  models: MODELS,
  defaultModel: DEFAULT_MODEL,
  generate,
};
