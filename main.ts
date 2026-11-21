// Sunset Panels — dossier builder + procedural screenshot renderer.
// Node built-ins only; run with Node 22.18+ (erasable TypeScript).
import { readFileSync, writeFileSync, mkdirSync, cpSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));

// ---------- JPEG encoder (baseline, pure JS) ----------
const ZIGZAG = [0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63];
const QLUM = [16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];
const QCHR = [17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99];
const DC_LUM_BITS = [0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
const DC_LUM_VALS = [0,1,2,3,4,5,6,7,8,9,10,11];
const DC_CHR_BITS = [0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
const DC_CHR_VALS = [0,1,2,3,4,5,6,7,8,9,10,11];
const AC_LUM_BITS = [0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
const AC_LUM_VALS = [0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];
const AC_CHR_BITS = [0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
const AC_CHR_VALS = [0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];

function buildHuff(bits, vals) {
  const codes = new Map(); const lens = new Map();
  let code = 0, k = 0;
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < bits[i]; j++) { codes.set(vals[k], code); lens.set(vals[k], i + 1); k++; code++; }
    code <<= 1;
  }
  return { codes, lens };
}
const H_DC_L = buildHuff(DC_LUM_BITS, DC_LUM_VALS);
const H_DC_C = buildHuff(DC_CHR_BITS, DC_CHR_VALS);
const H_AC_L = buildHuff(AC_LUM_BITS, AC_LUM_VALS);
const H_AC_C = buildHuff(AC_CHR_BITS, AC_CHR_VALS);

function scaledQuant(base, quality) {
  let scale;
  if (quality <= 0) quality = 1; if (quality > 100) quality = 100;
  if (quality < 50) scale = 5000 / quality; else scale = 200 - quality * 2;
  return base.map(v => Math.max(1, Math.min(255, Math.floor((v * scale + 50) / 100))));
}
function fdctQuant(block, q) {
  const out = new Array(64).fill(0);
  for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) {
    let sum = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      sum += block[y * 8 + x] * Math.cos((2 * x + 1) * u * Math.PI / 16) * Math.cos((2 * y + 1) * v * Math.PI / 16);
    }
    const cu = u === 0 ? 1 / Math.SQRT2 : 1, cv = v === 0 ? 1 / Math.SQRT2 : 1;
    out[v * 8 + u] = Math.round((cu * cv / 4) * sum / q[v * 8 + u]);
  }
  return out;
}
function category(n) { let a = Math.abs(n), c = 0; while (a) { c++; a >>= 1; } return c; }

class BitWriter {
  constructor() { this.bytes = []; this.acc = 0; this.nbits = 0; }
  write(code, len) {
    this.acc = (this.acc << len) | code; this.nbits += len;
    while (this.nbits >= 8) { const b = (this.acc >> (this.nbits - 8)) & 0xff; this.bytes.push(b); if (b === 0xff) this.bytes.push(0); this.nbits -= 8; }
    this.acc &= (1 << this.nbits) - 1;
  }
  writeVal(v) { const c = category(v); if (c === 0) return 0; const val = v > 0 ? v : v - 1 + (1 << c); this.write(val & ((1 << c) - 1), c); return c; }
  flush() { if (this.nbits > 0) { const b = ((this.acc << (8 - this.nbits)) | ((1 << (8 - this.nbits)) - 1)) & 0xff; this.bytes.push(b); if (b === 0xff) this.bytes.push(0); } }
}
function encodeBlock(bw, coeffs, prevDC, hDC, hAC) {
  const zz = ZIGZAG.map(i => coeffs[i]);
  const diff = zz[0] - prevDC; const cat = category(diff);
  bw.write(hDC.codes.get(cat), hDC.lens.get(cat));
  if (cat) bw.writeVal(diff);
  let run = 0;
  for (let i = 1; i < 64; i++) {
    if (zz[i] === 0) { run++; continue; }
    while (run > 15) { bw.write(hAC.codes.get(0xf0), hAC.lens.get(0xf0)); run -= 16; }
    const cat2 = category(zz[i]); const sym = (run << 4) | cat2;
    bw.write(hAC.codes.get(sym), hAC.lens.get(sym)); bw.writeVal(zz[i]); run = 0;
  }
  if (run > 0) bw.write(hAC.codes.get(0x00), hAC.lens.get(0x00));
  return zz[0];
}
function encodeJPEG(w, h, rgb, quality) {
  const qL = scaledQuant(QLUM, quality), qC = scaledQuant(QCHR, quality);
  const out = [];
  const push16 = v => { out.push((v >> 8) & 255, v & 255); };
  const marker = m => { out.push(0xff, m); };
  marker(0xd8); marker(0xe0); push16(16); out.push(0x4a,0x46,0x49,0x46,0,1,1,0,0,1,0,1,0,0);
  marker(0xdb); push16(2 + 65 * 2);
  out.push(0); for (const i of ZIGZAG) out.push(qL[i]);
  out.push(1); for (const i of ZIGZAG) out.push(qC[i]);
  marker(0xc0); push16(8 + 3 * 3); out.push(8); push16(h); push16(w); out.push(3);
  out.push(1, 0x11, 0, 2, 0x11, 1, 3, 0x11, 1);
  const writeHuff = (cls, id, bits, vals) => { out.push((cls << 4) | id); for (const b of bits) out.push(b); for (const v of vals) out.push(v); };
  marker(0xc4); push16(2 + (17 + DC_LUM_VALS.length) + (17 + AC_LUM_VALS.length) + (17 + DC_CHR_VALS.length) + (17 + AC_CHR_VALS.length));
  writeHuff(0, 0, DC_LUM_BITS, DC_LUM_VALS); writeHuff(1, 0, AC_LUM_BITS, AC_LUM_VALS);
  writeHuff(0, 1, DC_CHR_BITS, DC_CHR_VALS); writeHuff(1, 1, AC_CHR_BITS, AC_CHR_VALS);
  marker(0xda); push16(6 + 2 * 3); out.push(3, 1, 0x00, 2, 0x11, 3, 0x11, 0, 63, 0);
  const bw = new BitWriter();
  let prevY = 0, prevCb = 0, prevCr = 0;
  for (let by = 0; by < h; by += 8) for (let bx = 0; bx < w; bx += 8) {
    const bY = [], bCb = [], bCr = [];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const sx = Math.min(w - 1, bx + x), sy = Math.min(h - 1, by + y);
      const idx = (sy * w + sx) * 3; const R = rgb[idx], G = rgb[idx + 1], B = rgb[idx + 2];
      const Y = 0.299 * R + 0.587 * G + 0.114 * B;
      const Cb = -0.16874 * R - 0.33126 * G + 0.5 * B + 128;
      const Cr = 0.5 * R - 0.41869 * G - 0.08131 * B + 128;
      bY.push(Y - 128); bCb.push(Cb - 128); bCr.push(Cr - 128);
    }
    prevY = encodeBlock(bw, fdctQuant(bY, qL), prevY, H_DC_L, H_AC_L);
    prevCb = encodeBlock(bw, fdctQuant(bCb, qC), prevCb, H_DC_C, H_AC_C);
    prevCr = encodeBlock(bw, fdctQuant(bCr, qC), prevCr, H_DC_C, H_AC_C);
  }
  bw.flush();
  const body = Buffer.from(out); const scan = Buffer.from(bw.bytes);
  return Buffer.concat([body, scan, Buffer.from([0xff, 0xd9])]);
}

// ---------- image helpers ----------
function makeBuf(w, h) { return { w, h, d: new Uint8Array(w * h * 3) }; }
function setPx(img, x, y, r, g, b) { if (x < 0 || y < 0 || x >= img.w || y >= img.h) return; const i = (y * img.w + x) * 3; img.d[i] = r; img.d[i + 1] = g; img.d[i + 2] = b; }
function fillRect(img, x0, y0, x1, y1, r, g, b) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) setPx(img, x, y, r, g, b); }
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
function lerpC(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }
function drawDisc(img, cx, cy, rad, r, g, b) { for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) { const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy <= rad * rad) setPx(img, x, y, r, g, b); } }
function drawLine(img, x0, y0, x1, y1, thick, r, g, b) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) { const x = Math.round(x0 + (x1 - x0) * i / steps), y = Math.round(y0 + (y1 - y0) * i / steps); for (let dy = -thick; dy <= thick; dy++) for (let dx = -thick; dx <= thick; dx++) setPx(img, x + dx, y + dy, r, g, b); }
}
function drawPalm(img, x, baseY, height, lean, r, g, b) {
  const topX = x + lean, topY = baseY - height;
  drawLine(img, x, baseY, topX, topY, 3, r, g, b);
  const fronds = [[-60,-20],[-40,-35],[0,-40],[40,-35],[60,-20],[-25,-45],[25,-45]];
  for (const [fx, fy] of fronds) {
    const mx = topX + fx * 0.5, my = topY + fy * 0.5 - 8;
    const ex = topX + fx, ey = topY + fy + 18;
    drawLine(img, topX, topY, mx, my, 2, r, g, b); drawLine(img, mx, my, ex, ey, 2, r, g, b);
  }
}

// 5x7 bitmap font (rows top->bottom, bits MSB left)
const FONT = {
  A:[0x0e,0x11,0x11,0x1f,0x11,0x11,0x11], B:[0x1e,0x11,0x11,0x1e,0x11,0x11,0x1e], C:[0x0e,0x11,0x10,0x10,0x10,0x11,0x0e],
  D:[0x1e,0x11,0x11,0x11,0x11,0x11,0x1e], E:[0x1f,0x10,0x10,0x1e,0x10,0x10,0x1f], F:[0x1f,0x10,0x10,0x1e,0x10,0x10,0x10],
  G:[0x0e,0x11,0x10,0x17,0x11,0x11,0x0f], H:[0x11,0x11,0x11,0x1f,0x11,0x11,0x11], I:[0x0e,0x04,0x04,0x04,0x04,0x04,0x0e],
  J:[0x07,0x02,0x02,0x02,0x02,0x12,0x0c], K:[0x11,0x12,0x14,0x18,0x14,0x12,0x11], L:[0x10,0x10,0x10,0x10,0x10,0x10,0x1f],
  M:[0x11,0x1b,0x15,0x15,0x11,0x11,0x11], N:[0x11,0x19,0x15,0x13,0x11,0x11,0x11], O:[0x0e,0x11,0x11,0x11,0x11,0x11,0x0e],
  P:[0x1e,0x11,0x11,0x1e,0x10,0x10,0x10], Q:[0x0e,0x11,0x11,0x11,0x15,0x12,0x0d], R:[0x1e,0x11,0x11,0x1e,0x14,0x12,0x11],
  S:[0x0f,0x10,0x10,0x0e,0x01,0x01,0x1e], T:[0x1f,0x04,0x04,0x04,0x04,0x04,0x04], U:[0x11,0x11,0x11,0x11,0x11,0x11,0x0e],
  V:[0x11,0x11,0x11,0x11,0x11,0x0a,0x04], W:[0x11,0x11,0x11,0x15,0x15,0x1b,0x11], X:[0x11,0x0a,0x04,0x04,0x04,0x0a,0x11],
  Y:[0x11,0x0a,0x04,0x04,0x04,0x04,0x04], Z:[0x1f,0x01,0x02,0x04,0x08,0x10,0x1f],
  '0':[0x0e,0x11,0x13,0x15,0x19,0x11,0x0e], '1':[0x04,0x0c,0x04,0x04,0x04,0x04,0x0e], '2':[0x0e,0x11,0x01,0x06,0x08,0x10,0x1f],
  '3':[0x1f,0x02,0x04,0x02,0x01,0x11,0x0e], '4':[0x02,0x06,0x0a,0x12,0x1f,0x02,0x02], '5':[0x1f,0x10,0x1e,0x01,0x01,0x11,0x0e],
  '6':[0x06,0x08,0x10,0x1e,0x11,0x11,0x0e], '7':[0x1f,0x01,0x02,0x04,0x08,0x08,0x08], '8':[0x0e,0x11,0x11,0x0e,0x11,0x11,0x0e],
  '9':[0x0e,0x11,0x11,0x0f,0x01,0x02,0x0c], ' ':[0,0,0,0,0,0,0]
};
function textWidth(text, scale) { return text.length * 6 * scale - scale; }
function drawText(img, text, cx, y, scale, r, g, b, outline) {
  const t = text.toUpperCase(); const tw = textWidth(t, scale); let x = Math.round(cx - tw / 2);
  const draw = (ox, oy, rr, gg, bb) => {
    let cx2 = x;
    for (const ch of t) {
      const glyph = FONT[ch] || FONT[' '];
      for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
        if ((glyph[row] >> (4 - col)) & 1) fillRect(img, cx2 + col * scale + ox, y + row * scale + oy, cx2 + col * scale + scale + ox, y + row * scale + scale + oy, rr, gg, bb);
      }
      cx2 += 6 * scale;
    }
  };
  if (outline) { for (const [ox, oy] of [[-2,0],[2,0],[0,-2],[0,2],[-2,-2],[2,2],[-2,2],[2,-2]]) draw(ox, oy, 10, 8, 24); }
  draw(0, 0, r, g, b);
}

function sceneBoulevard() {
  const img = makeBuf(640, 480); const horizon = 300;
  const top = [58, 28, 110], mid = [232, 84, 120], low = [255, 170, 80];
  for (let y = 0; y < horizon; y++) { const t = y / horizon; const c = t < 0.55 ? lerpC(top, mid, t / 0.55) : lerpC(mid, low, (t - 0.55) / 0.45); fillRect(img, 0, y, 640, y + 1, c[0], c[1], c[2]); }
  drawDisc(img, 320, horizon - 55, 52, 255, 220, 140);
  // ground
  for (let y = horizon; y < 480; y++) { const t = (y - horizon) / 180; const c = lerpC([90, 40, 70], [24, 16, 34], t); fillRect(img, 0, y, 640, y + 1, c[0], c[1], c[2]); }
  // road wedge
  for (let y = horizon; y < 480; y++) {
    const t = (y - horizon) / 180; const half = 18 + t * 230;
    fillRect(img, Math.round(320 - half), y, Math.round(320 + half), y + 1, 22, 18, 30);
    if (y % 26 < 13) { const cw = 3 + t * 7; fillRect(img, Math.round(320 - cw / 2), y, Math.round(320 + cw / 2), y + 1, 255, 190, 90); }
  }
  // building silhouettes
  fillRect(img, 30, 190, 95, horizon, 26, 18, 44); fillRect(img, 110, 215, 160, horizon, 26, 18, 44);
  fillRect(img, 480, 205, 535, horizon, 26, 18, 44); fillRect(img, 550, 180, 615, horizon, 26, 18, 44);
  for (let i = 0; i < 40; i++) { const bx = 36 + (i * 37) % 560; const by = 200 + (i * 53) % 85; if (bx > 250 && bx < 390) continue; fillRect(img, bx, by, bx + 5, by + 7, 255, 205, 110); }
  // palms
  drawPalm(img, 120, 470, 190, -26, 14, 10, 26); drawPalm(img, 205, 440, 140, -16, 14, 10, 26);
  drawPalm(img, 525, 470, 200, 26, 14, 10, 26); drawPalm(img, 445, 440, 140, 16, 14, 10, 26);
  drawPalm(img, 265, 380, 95, -10, 14, 10, 26); drawPalm(img, 380, 380, 95, 10, 14, 10, 26);
  return img;
}
function scenePier() {
  const img = makeBuf(640, 480); const horizon = 270;
  const top = [44, 34, 120], mid = [240, 100, 130], low = [255, 180, 95];
  for (let y = 0; y < horizon; y++) { const t = y / horizon; const c = t < 0.55 ? lerpC(top, mid, t / 0.55) : lerpC(mid, low, (t - 0.55) / 0.45); fillRect(img, 0, y, 640, y + 1, c[0], c[1], c[2]); }
  drawDisc(img, 320, horizon - 40, 46, 255, 224, 150);
  for (let y = horizon; y < 480; y++) { const t = (y - horizon) / 210; const c = lerpC([196, 90, 110], [28, 34, 86], t); fillRect(img, 0, y, 640, y + 1, c[0], c[1], c[2]); }
  // reflection streaks (deterministic)
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 220; i++) {
    const y = horizon + 4 + Math.floor(rnd() * 200); const spread = 20 + (y - horizon) * 0.9;
    const x = Math.round(320 + (rnd() * 2 - 1) * spread); const len = 6 + Math.floor(rnd() * 26);
    const bright = 200 + Math.floor(rnd() * 55);
    fillRect(img, x, y, x + len, y + 2, bright, Math.round(bright * 0.72), 110);
  }
  for (let i = 0; i < 60; i++) { const y = horizon + 10 + Math.floor(rnd() * 180); const x = Math.floor(rnd() * 600); fillRect(img, x, y, x + 14, y + 2, 120, 140, 200); }
  // pier silhouette
  const py = 330;
  fillRect(img, 60, py, 580, py + 10, 16, 12, 30);
  for (let x = 80; x <= 560; x += 48) fillRect(img, x, py + 10, x + 10, 480, 16, 12, 30);
  fillRect(img, 60, py - 26, 580, py - 22, 16, 12, 30);
  for (let x = 70; x <= 570; x += 36) fillRect(img, x, py - 26, x + 4, py, 16, 12, 30);
  // lamp posts
  for (const lx of [150, 320, 490]) { fillRect(img, lx, py - 70, lx + 5, py - 26, 16, 12, 30); drawDisc(img, lx + 2, py - 76, 8, 255, 214, 130); }
  // hut
  fillRect(img, 430, py - 58, 520, py - 26, 16, 12, 30); drawLine(img, 425, py - 58, 475, py - 84, 3, 16, 12, 30); drawLine(img, 475, py - 84, 525, py - 58, 3, 16, 12, 30);
  return img;
}

function blitCover(dst, src, dx0, dy0, dw, dh, grade) {
  const scale = Math.max(dw / src.w, dh / src.h);
  const sw = dw / scale, sh = dh / scale;
  const sx0 = (src.w - sw) / 2, sy0 = (src.h - sh) / 2;
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const sx = Math.min(src.w - 1, Math.floor(sx0 + x / scale)), sy = Math.min(src.h - 1, Math.floor(sy0 + y / scale));
    const i = (sy * src.w + sx) * 3; let r = src.d[i], g = src.d[i + 1], b = src.d[i + 2];
    if (grade === 'neon') { r = Math.min(255, Math.round(r * 1.12 + 8)); g = Math.round(g * 0.92); b = Math.min(255, Math.round(b * 1.18 + 14)); }
    else { r = Math.min(255, Math.round(r * 1.10 + 6)); g = Math.min(255, Math.round(g * 1.02)); b = Math.round(b * 0.9); }
    setPx(dst, dx0 + x, dy0 + y, r, g, b);
  }
}
function composeCover(scenes, panelNames, title, grade) {
  const img = makeBuf(1280, 960);
  fillRect(img, 0, 0, 1280, 960, 12, 10, 24);
  const gutter = 10; const pw = Math.floor((1280 - gutter * 4) / 3); const ph = 960 - gutter * 2;
  for (let p = 0; p < 3; p++) {
    const src = scenes[panelNames[p]];
    blitCover(img, src, gutter + p * (pw + gutter), gutter, pw, ph, grade);
  }
  // bottom gradient band for title legibility
  for (let y = 790; y < 960; y++) { const t = (y - 790) / 170; for (let x = 0; x < 1280; x++) { const i = (y * 1280 + x) * 3; const f = 1 - t * 0.55; img.d[i] = Math.round(img.d[i] * f); img.d[i + 1] = Math.round(img.d[i + 1] * f); img.d[i + 2] = Math.round(img.d[i + 2] * f); } }
  const scale = title.length > 12 ? 9 : 11;
  drawText(img, title, 640, 845, scale, 255, 245, 230, true);
  return img;
}
function composeEditor(scenes, panelNames, title) {
  const img = makeBuf(1280, 960);
  fillRect(img, 0, 0, 1280, 960, 22, 20, 36);
  fillRect(img, 0, 0, 1280, 84, 34, 30, 56); // toolbar
  drawText(img, 'SUNSET PANELS', 250, 24, 5, 255, 190, 110, false);
  fillRect(img, 1020, 18, 1248, 66, 255, 110, 80); drawText(img, 'EXPORT', 1134, 30, 4, 255, 255, 255, false);
  // thumbnails row
  const tw = 390, th = 300, gap = 24, x0 = 33, y0 = 130;
  for (let p = 0; p < 3; p++) {
    const x = x0 + p * (tw + gap);
    fillRect(img, x - 4, y0 - 4, x + tw + 4, y0 + th + 4, 255, 170, 90);
    blitCover(img, scenes[panelNames[p]], x, y0, tw, th, 'sunset');
  }
  // preview strip
  fillRect(img, 33, 470, 1247, 700, 16, 14, 30);
  for (let p = 0; p < 3; p++) blitCover(img, scenes[panelNames[p]], 41 + p * 404, 478, 396, 214, 'sunset');
  drawText(img, title, 640, 630, 5, 255, 245, 230, true);
  // title field
  drawText(img, 'TITLE', 120, 740, 4, 200, 200, 220, false);
  fillRect(img, 33, 790, 900, 862, 44, 40, 68); fillRect(img, 37, 794, 896, 858, 30, 27, 50);
  // left-aligned title text in field
  const scale = 5; const t = title.toUpperCase(); let cx = 60;
  for (const ch of t) { const glyph = FONT[ch] || FONT[' ']; for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) if ((glyph[row] >> (4 - col)) & 1) fillRect(img, cx + col * scale, 806 + row * scale, cx + col * scale + scale, 806 + row * scale + scale, 255, 240, 220); cx += 6 * scale; }
  // export button
  fillRect(img, 930, 790, 1247, 862, 255, 110, 80); drawText(img, 'EXPORT PNG', 1088, 812, 5, 255, 255, 255, false);
  return img;
}

function writeJPEG(path, img, quality, limit) {
  let q = quality; let buf = encodeJPEG(img.w, img.h, img.d, q);
  while (limit && buf.length > limit && q > 30) { q -= 10; buf = encodeJPEG(img.w, img.h, img.d, q); }
  mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, buf);
  console.log(path + ' ' + buf.length + ' bytes (q=' + q + ')');
  return buf.length;
}

function runShots() {
  const shots = JSON.parse(readFileSync(join(repoDir, 'shots.json'), 'utf8'));
  const scenes = { 'samples/boulevard.jpg': sceneBoulevard(), 'samples/pier.jpg': scenePier() };
  writeJPEG(join(repoDir, 'app/samples/boulevard.jpg'), scenes['samples/boulevard.jpg'], 82, 262144);
  writeJPEG(join(repoDir, 'app/samples/pier.jpg'), scenes['samples/pier.jpg'], 82, 262144);
  const names = { 1: 'screenshots/1-cover.jpg', 2: 'screenshots/2-editor.jpg', 3: 'screenshots/3-cover.jpg' };
  for (const s of shots) {
    let img;
    if (s.shot === 2) img = composeEditor(scenes, s.panels, s.title);
    else img = composeCover(scenes, s.panels, s.title, s.shot === 3 ? 'neon' : 'sunset');
    writeJPEG(join(repoDir, names[s.shot]), img, 80, 262144);
  }
}

function runDefault() {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };
  const dossier = buildDossier(outDir, caps);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log('wrote ' + join(outDir, 'dossier.json'));
}

if (process.argv.includes('--shots')) runShots(); else runDefault();
