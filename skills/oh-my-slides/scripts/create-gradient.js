/**
 * Sharp로 그라데이션 PNG 생성 (헤더 오버레이, 배경 등).
 *
 * Usage:
 *   node create-gradient.js <output.png> [width] [height] [color1] [color2] [direction]
 *
 * Examples:
 *   node create-gradient.js header-gradient.png 1440 88 "#1e3a5f" "#0ea5e9"
 *   node create-gradient.js bg-gradient.png 1440 810 "#1a1a2e" "#0066ff" diagonal
 *
 * Directions: horizontal (default), vertical, diagonal
 */
const sharp = require('sharp');
const path = require('path');

const OUT = path.resolve(process.argv[2] || 'gradient.png');
const W = parseInt(process.argv[3] || '1440', 10);
const H = parseInt(process.argv[4] || '88', 10);
const C1 = process.argv[5] || '#1e3a5f';
const C2 = process.argv[6] || '#0ea5e9';
const DIR = process.argv[7] || 'horizontal';

const gradientCoords = {
    horizontal: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
    vertical:   { x1: '0%', y1: '0%', x2: '0%',   y2: '100%' },
    diagonal:   { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
};

async function main() {
    const { x1, y1, x2, y2 } = gradientCoords[DIR] || gradientCoords.horizontal;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
          <stop offset="0%" style="stop-color:${C1}"/>
          <stop offset="100%" style="stop-color:${C2}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(OUT);
    console.log(`Gradient saved: ${OUT} (${W}x${H}, ${C1} → ${C2}, ${DIR})`);
}

main().catch(e => { console.error(e); process.exit(1); });
