import * as fs from "node:fs";
// Sunset Panels entrypoint: renders procedural artwork and packages the app.
import * as path from "node:path";
import { fileURLToPath } from "node:url";

type RGB = [number, number, number];
type Shot = { shot: number; title: string; panels: string[] };

const rootDir: string = path.dirname(fileURLToPath(import.meta.url));

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function mix(c1: RGB, c2: RGB, t: number): RGB {
  return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
}

class Img {
  w: number;
  h: number;
  data: Uint8Array;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 3);
  }
  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i: number = (y * this.w + x) * 3;
    this.data[i] = clamp(Math.round(c[0]), 0, 255);
    this.data[i + 1] = clamp(Math.round(c[1]), 0, 255);
    this.data[i + 2] = clamp(Math.round(c[2]), 0, 255);
  }
  get(x: number, y: number): RGB {
    const i: number = (y * this.w + x) * 3;
    return [this.data[i] ?? 0, this.data[i + 1] ?? 0, this.data[i + 2] ?? 0];
  }
  fillRect(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) this.set(x, y, c);
  }
  fillCircle(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        const dx: number = x - cx;
        const dy: number = y - cy;
        if (dx * dx + dy * dy <= r * r) this.set(x, y, c);
      }
    }
  }
}

function vGradient(img: Img, y0: number, y1: number, stops: Array<[number, RGB]>): void {
  for (let y = y0; y < y1; y++) {
    const t: number = (y - y0) / Math.max(1, y1 - y0 - 1);
    let c: RGB = stops[stops.length - 1]?.[1] ?? [0, 0, 0];
    for (let s = 0; s < stops.length - 1; s++) {
      const a = stops[s];
      const b = stops[s + 1];
      if (!a || !b) continue;
      if (t >= a[0] && t <= b[0]) {
        const lt: number = (t - a[0]) / Math.max(0.0001, b[0] - a[0]);
        c = mix(a[1], b[1], lt);
        break;
      }
    }
    for (let x = 0; x < img.w; x++) img.set(x, y, c);
  }
}

function drawPalm(img: Img, x: number, baseY: number, h: number, c: RGB): void {
  for (let i = 0; i < h; i++) {
    const t: number = i / h;
    const px: number = Math.round(x + Math.sin(t * 1.2) * 18 * t);
    const py: number = baseY - i;
    img.fillRect(px - 3, py, px + 4, py + 2, c);
  }
  const topX: number = Math.round(x + Math.sin(1.2) * 18);
  const topY: number = baseY - h;
  const fronds: number[][] = [[-70, -18], [-50, -32], [-20, -40], [15, -42], [45, -34], [68, -16], [58, 6], [-60, 8]];
  for (const f of fronds) {
    const ex: number = topX + (f[0] ?? 0);
    const ey: number = topY + (f[1] ?? 0);
    const steps: number = 24;
    for (let s = 0; s <= steps; s++) {
      const t: number = s / steps;
      const px: number = Math.round(lerp(topX, ex, t));
      const py: number = Math.round(lerp(topY, ey, t) + Math.sin(t * Math.PI) * 10);
      img.fillRect(px - 2, py - 1, px + 3, py + 2, c);
    }
  }
}

function renderBoulevard(): Img {
  const img = new Img(800, 600);
  vGradient(img, 0, 600, [[0, [38, 16, 72]], [0.45, [140, 40, 90]], [0.72, [240, 120, 40]], [0.88, [255, 210, 110]], [1, [70, 35, 40]]]);
  img.fillCircle(400, 430, 110, [255, 190, 80]);
  img.fillCircle(400, 430, 88, [255, 225, 150]);
  const dark: RGB = [18, 12, 30];
  const buildings: number[][] = [[0, 300, 90, 470], [80, 260, 70, 470], [150, 330, 60, 470], [210, 280, 80, 470], [510, 290, 75, 470], [585, 250, 85, 470], [670, 320, 65, 470], [735, 270, 65, 470]];
  for (const b of buildings) img.fillRect(b[0] ?? 0, b[1] ?? 0, (b[0] ?? 0) + (b[2] ?? 0), b[3] ?? 470, dark);
  img.fillRect(0, 470, 800, 600, [32, 22, 34]);
  img.fillRect(0, 505, 800, 600, [55, 32, 38]);
  for (let x = 0; x < 800; x += 90) img.fillRect(x, 548, x + 48, 556, [255, 200, 90]);
  drawPalm(img, 120, 520, 170, [10, 8, 18]);
  drawPalm(img, 680, 530, 190, [10, 8, 18]);
  drawPalm(img, 300, 500, 120, [12, 10, 20]);
  return img;
}

function renderPier(): Img {
  const img = new Img(800, 600);
  vGradient(img, 0, 380, [[0, [20, 120, 140]], [0.45, [220, 110, 150]], [0.8, [250, 150, 70]], [1, [255, 210, 120]]]);
  img.fillCircle(560, 330, 80, [255, 200, 100]);
  img.fillCircle(560, 330, 62, [255, 230, 160]);
  vGradient(img, 380, 600, [[0, [30, 90, 110]], [0.5, [22, 70, 95]], [1, [14, 45, 70]]]);
  for (let i = 0; i < 90; i++) {
    const y: number = 392 + ((i * 37) % 190);
    const x: number = (i * 113) % 760;
    const len: number = 18 + ((i * 29) % 50);
    img.fillRect(x, y, x + len, y + 2, [255, 210, 150]);
  }
  const dark: RGB = [16, 20, 28];
  img.fillRect(0, 400, 800, 420, dark);
  for (let x = 20; x < 800; x += 80) img.fillRect(x, 420, x + 14, 540, dark);
  for (let x = 0; x < 800; x += 40) img.fillRect(x, 392, x + 6, 402, dark);
  img.fillRect(0, 388, 800, 394, dark);
  return img;
}

const FONT: Record<string, string[]> = {
  A: ["01110","10001","10001","11111","10001","10001","10001"],
  B: ["11110","10001","10001","11110","10001","10001","11110"],
  C: ["01110","10001","10000","10000","10000","10001","01110"],
  D: ["11100","10010","10001","10001","10001","10010","11100"],
  E: ["11111","10000","10000","11110","10000","10000","11111"],
  F: ["11111","10000","10000","11110","10000","10000","10000"],
  G: ["01110","10001","10000","10111","10001","10001","01111"],
  H: ["10001","10001","10001","11111","10001","10001","10001"],
  I: ["01110","00100","00100","00100","00100","00100","01110"],
  J: ["00111","00010","00010","00010","00010","10010","01100"],
  K: ["10001","10010","10100","11000","10100","10010","10001"],
  L: ["10000","10000","10000","10000","10000","10000","11111"],
  M: ["10001","11011","10101","10101","10001","10001","10001"],
  N: ["10001","11001","10101","10011","10001","10001","10001"],
  O: ["01110","10001","10001","10001","10001","10001","01110"],
  P: ["11110","10001","10001","11110","10000","10000","10000"],
  Q: ["01110","10001","10001","10001","10101","10010","01101"],
  R: ["11110","10001","10001","11110","10100","10010","10001"],
  S: ["01111","10000","10000","01110","00001","00001","11110"],
  T: ["11111","00100","00100","00100","00100","00100","00100"],
  U: ["10001","10001","10001","10001","10001","10001","01110"],
  V: ["10001","10001","10001","10001","10001","01010","00100"],
  W: ["10001","10001","10001","10101","10101","10101","01010"],
  X: ["10001","01010","00100","00100","00100","01010","10001"],
  Y: ["10001","01010","00100","00100","00100","00100","00100"],
  Z: ["11111","00001","00010","00100","01000","10000","11111"],
  "0": ["01110","10001","10011","10101","11001","10001","01110"],
  "1": ["00100","01100","00100","00100","00100","00100","01110"],
  "2": ["01110","10001","00001","00110","01000","10000","11111"],
  "3": ["11111","00010","00100","00010","00001","10001","01110"],
  "4": ["00010","00110","01010","10010","11111","00010","00010"],
  "5": ["11111","10000","11110","00001","00001","10001","01110"],
  "6": ["00110","01000","10000","11110","10001","10001","01110"],
  "7": ["11111","00001","00010","00100","01000","01000","01000"],
  "8": ["01110","10001","10001","01110","10001","10001","01110"],
  "9": ["01110","10001","10001","01111","00001","00010","01100"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
  "-": ["00000","00000","00000","01110","00000","00000","00000"],
};

function drawTitle(img: Img, title: string, bandY: number, bandH: number): void {
  const text: string = title.toUpperCase();
  const scale: number = 5;
  const glyphW: number = 5 * scale;
  const gap: number = 2 * scale;
  const totalW: number = text.length * (glyphW + gap) - gap;
  let x: number = Math.round((img.w - totalW) / 2);
  const y0: number = Math.round(bandY + (bandH - 7 * scale) / 2);
  const col: RGB = [255, 220, 160];
  for (const ch of text) {
    const glyph: string[] = FONT[ch] ?? FONT[" "] ?? [];
    for (let gy = 0; gy < 7; gy++) {
      const row: string = glyph[gy] ?? "00000";
      for (let gx = 0; gx < 5; gx++) {
        if (row[gx] === "1") img.fillRect(x + gx * scale, y0 + gy * scale, x + gx * scale + scale, y0 + gy * scale + scale, col);
      }
    }
    x += glyphW + gap;
  }
}

function composeCover(samples: Record<string, Img>, shot: Shot): Img {
  const W: number = 1200;
  const H: number = 800;
  const bandH: number = 90;
  const panelH: number = H - bandH;
  const panelW: number = 400;
  const out = new Img(W, H);
  for (let p = 0; p < 3; p++) {
    const key: string = shot.panels[p] ?? "samples/boulevard.jpg";
    const src: Img = samples[key] ?? samples["samples/boulevard.jpg"] as Img;
    const scale: number = Math.max(panelW / src.w, panelH / src.h);
    const sw: number = panelW / scale;
    const sh: number = panelH / scale;
    const sx0: number = (src.w - sw) / 2;
    const sy0: number = (src.h - sh) / 2;
    for (let y = 0; y < panelH; y++) {
      for (let x = 0; x < panelW; x++) {
        const sx: number = clamp(Math.floor(sx0 + x / scale), 0, src.w - 1);
        const sy: number = clamp(Math.floor(sy0 + y / scale), 0, src.h - 1);
        out.set(p * panelW + x, y, src.get(sx, sy));
      }
    }
    out.fillRect(p * panelW, 0, p * panelW + 3, panelH, [20, 14, 28]);
  }
  out.fillRect(0, panelH, W, H, [16, 10, 24]);
  drawTitle(out, shot.title, panelH, bandH);
  return out;
}

// --- JPEG encoder (baseline, 4:4:4, quality 85) ---
const ZIGZAG: number[] = [0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63];
const QLUM: number[] = [16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];
const QCHR: number[] = [17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99];
function scaleQuant(base: number[], quality: number): number[] {
  const q: number = clamp(quality, 1, 100);
  const s: number = q < 50 ? 5000 / q : 200 - q * 2;
  return base.map((v: number) => clamp(Math.floor((v * s + 50) / 100), 1, 255));
}
const DC_L_BITS: number[] = [0,0,1,5,1,1,1,1,1,0,0,0,0,0,0,0,0];
const DC_L_VALS: number[] = [0,1,2,3,4,5,6,7,8,9,10,11];
const DC_C_BITS: number[] = [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
const DC_C_VALS: number[] = [0,1,2,3,4,5,6,7,8,9,10,11];
const AC_L_BITS: number[] = [0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
const AC_L_VALS: number[] = [0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];
const AC_C_BITS: number[] = [0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
const AC_C_VALS: number[] = [0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];

type Huff = { codes: number[]; lens: number[] };
function buildHuff(bits: number[], vals: number[]): Huff {
  const codes: number[] = new Array(256).fill(0);
  const lens: number[] = new Array(256).fill(0);
  let code: number = 0;
  let idx: number = 0;
  for (let len = 1; len <= 16; len++) {
    const count: number = bits[len] ?? 0;
    for (let i = 0; i < count; i++) {
      const v: number = vals[idx++] ?? 0;
      codes[v] = code;
      lens[v] = len;
      code++;
    }
    code <<= 1;
  }
  return { codes, lens };
}
const H_DC_L: Huff = buildHuff(DC_L_BITS, DC_L_VALS);
const H_DC_C: Huff = buildHuff(DC_C_BITS, DC_C_VALS);
const H_AC_L: Huff = buildHuff(AC_L_BITS, AC_L_VALS);
const H_AC_C: Huff = buildHuff(AC_C_BITS, AC_C_VALS);

class BitWriter {
  bytes: number[] = [];
  acc: number = 0;
  nbits: number = 0;
  put(code: number, len: number): void {
    this.acc = (this.acc << len) | code;
    this.nbits += len;
    while (this.nbits >= 8) {
      const b: number = (this.acc >> (this.nbits - 8)) & 0xff;
      this.bytes.push(b);
      if (b === 0xff) this.bytes.push(0x00);
      this.nbits -= 8;
    }
    this.acc &= (1 << this.nbits) - 1;
  }
  flush(): void {
    if (this.nbits > 0) {
      const b: number = ((this.acc << (8 - this.nbits)) | ((1 << (8 - this.nbits)) - 1)) & 0xff;
      this.bytes.push(b);
      if (b === 0xff) this.bytes.push(0x00);
      this.nbits = 0;
      this.acc = 0;
    }
  }
}

function catSize(v: number): number {
  let a: number = Math.abs(v);
  let n: number = 0;
  while (a > 0) { n++; a >>= 1; }
  return n;
}
function encodeBlock(bw: BitWriter, block: number[], dcPred: number, dcH: Huff, acH: Huff): number {
  const diff: number = (block[0] ?? 0) - dcPred;
  const cat: number = catSize(diff);
  bw.put(dcH.codes[cat] ?? 0, dcH.lens[cat] ?? 0);
  if (cat > 0) {
    let v: number = diff;
    if (v < 0) v = v - 1;
    bw.put(v & ((1 << cat) - 1), cat);
  }
  let run: number = 0;
  for (let i = 1; i < 64; i++) {
    const val: number = block[i] ?? 0;
    if (val === 0) { run++; continue; }
    while (run > 15) {
      bw.put(acH.codes[0xf0] ?? 0, acH.lens[0xf0] ?? 0);
      run -= 16;
    }
    const size: number = catSize(val);
    const sym: number = (run << 4) | size;
    bw.put(acH.codes[sym] ?? 0, acH.lens[sym] ?? 0);
    let v: number = val;
    if (v < 0) v = v - 1;
    bw.put(v & ((1 << size) - 1), size);
    run = 0;
  }
  if (run > 0) bw.put(acH.codes[0x00] ?? 0, acH.lens[0x00] ?? 0);
  return block[0] ?? 0;
}

function fdctQuant(block: number[], quant: number[]): number[] {
  const out: number[] = new Array(64).fill(0);
  for (let v = 0; v < 8; v++) {
    for (let u = 0; u < 8; u++) {
      let sum: number = 0;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          sum += (block[y * 8 + x] ?? 0) * Math.cos(((2 * x + 1) * u * Math.PI) / 16) * Math.cos(((2 * y + 1) * v * Math.PI) / 16);
        }
      }
      const cu: number = u === 0 ? Math.SQRT1_2 : 1;
      const cv: number = v === 0 ? Math.SQRT1_2 : 1;
      const coef: number = 0.25 * cu * cv * sum;
      out[v * 8 + u] = Math.round(coef / (quant[v * 8 + u] ?? 1));
    }
  }
  const zz: number[] = new Array(64).fill(0);
  for (let i = 0; i < 64; i++) zz[i] = out[ZIGZAG[i] ?? 0] ?? 0;
  return zz;
}

function encodeJPEG(img: Img, quality: number): Buffer {
  const qL: number[] = scaleQuant(QLUM, quality);
  const qC: number[] = scaleQuant(QCHR, quality);
  const out: number[] = [];
  const push16 = (v: number): void => { out.push((v >> 8) & 0xff, v & 0xff); };
  out.push(0xff, 0xd8);
  out.push(0xff, 0xe0); push16(16);
  out.push(0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00);
  out.push(0xff, 0xdb); push16(2 + 65 * 2);
  out.push(0x00); for (let i = 0; i < 64; i++) out.push(qL[ZIGZAG[i] ?? 0] ?? 1);
  out.push(0x01); for (let i = 0; i < 64; i++) out.push(qC[ZIGZAG[i] ?? 0] ?? 1);
  out.push(0xff, 0xc0); push16(8 + 3 * 3);
  out.push(8); push16(img.h); push16(img.w); out.push(3);
  out.push(1, 0x11, 0); out.push(2, 0x11, 1); out.push(3, 0x11, 1);
  const dht = (cls: number, id: number, bits: number[], vals: number[]): void => {
    out.push(0xff, 0xc4); push16(2 + 1 + 16 + vals.length);
    out.push((cls << 4) | id);
    for (let i = 1; i <= 16; i++) out.push(bits[i] ?? 0);
    for (const v of vals) out.push(v);
  };
  dht(0, 0, DC_L_BITS, DC_L_VALS);
  dht(1, 0, AC_L_BITS, AC_L_VALS);
  dht(0, 1, DC_C_BITS, DC_C_VALS);
  dht(1, 1, AC_C_BITS, AC_C_VALS);
  out.push(0xff, 0xda); push16(6 + 2 * 3);
  out.push(3); out.push(1, 0x00); out.push(2, 0x11); out.push(3, 0x11);
  out.push(0, 63, 0);
  const bw = new BitWriter();
  let predY: number = 0;
  let predCb: number = 0;
  let predCr: number = 0;
  const bxCount: number = Math.ceil(img.w / 8);
  const byCount: number = Math.ceil(img.h / 8);
  for (let by = 0; by < byCount; by++) {
    for (let bx = 0; bx < bxCount; bx++) {
      const yB: number[] = new Array(64).fill(0);
      const cbB: number[] = new Array(64).fill(0);
      const crB: number[] = new Array(64).fill(0);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const px: number = clamp(bx * 8 + x, 0, img.w - 1);
          const py: number = clamp(by * 8 + y, 0, img.h - 1);
          const c: RGB = img.get(px, py);
          const r: number = c[0];
          const g: number = c[1];
          const b: number = c[2];
          const Y: number = 0.299 * r + 0.587 * g + 0.114 * b;
          const Cb: number = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          const Cr: number = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
          yB[y * 8 + x] = Y - 128;
          cbB[y * 8 + x] = Cb - 128;
          crB[y * 8 + x] = Cr - 128;
        }
      }
      predY = encodeBlock(bw, fdctQuant(yB, qL), predY, H_DC_L, H_AC_L);
      predCb = encodeBlock(bw, fdctQuant(cbB, qC), predCb, H_DC_C, H_AC_C);
      predCr = encodeBlock(bw, fdctQuant(crB, qC), predCr, H_DC_C, H_AC_C);
    }
  }
  bw.flush();
  for (const b of bw.bytes) out.push(b);
  out.push(0xff, 0xd9);
  return Buffer.from(out);
}

function writeJPEG(file: string, img: Img): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const buf: Buffer = encodeJPEG(img, 85);
  if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9)) {
    throw new Error("JPEG magic check failed for " + file);
  }
  fs.writeFileSync(file, buf);
}

function listFiles(dir: string, base: string): string[] {
  const result: string[] = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full: string = path.join(dir, entry.name);
    const rel: string = path.join(base, entry.name);
    if (entry.isDirectory()) result.push(...listFiles(full, rel));
    else result.push(rel.split(path.sep).join("/"));
  }
  return result.sort();
}

function main(): void {
  const outDir: string = process.env["MAKEFUN_OUTPUT_DIR"] ?? "out";
  const outAbs: string = path.isAbsolute(outDir) ? outDir : path.join(rootDir, outDir);
  const shotsPath: string = path.join(rootDir, "shots.json");
  const shots: Shot[] = JSON.parse(fs.readFileSync(shotsPath, "utf8")) as Shot[];

  if (process.argv.includes("--shots")) {
    const boulevard: Img = renderBoulevard();
    const pier: Img = renderPier();
    writeJPEG(path.join(rootDir, "app", "samples", "boulevard.jpg"), boulevard);
    writeJPEG(path.join(rootDir, "app", "samples", "pier.jpg"), pier);
    const samples: Record<string, Img> = { "samples/boulevard.jpg": boulevard, "samples/pier.jpg": pier };
    const names: string[] = ["1-cover.jpg", "2-editor.jpg", "3-cover.jpg"];
    for (let i = 0; i < shots.length; i++) {
      const shot: Shot = shots[i] as Shot;
      const cover: Img = composeCover(samples, shot);
      writeJPEG(path.join(rootDir, "screenshots", names[i] ?? `${i + 1}-cover.jpg`), cover);
    }
    console.log(`Rendered ${shots.length} shots + 2 samples.`);
  }

  fs.mkdirSync(outAbs, { recursive: true });
  const appSrc: string = path.join(rootDir, "app");
  const appDst: string = path.join(outAbs, "app");
  if (fs.existsSync(appSrc)) fs.cpSync(appSrc, appDst, { recursive: true });
  const files: string[] = listFiles(appDst, "app");
  const dossier = {
    name: "Sunset Panels",
    competition: "gta6-cover-art-01",
    shots,
    generatedAt: new Date().toISOString(),
    files,
  };
  fs.writeFileSync(path.join(outAbs, "dossier.json"), JSON.stringify(dossier, null, 2) + "\n");
  console.log(`Sunset Panels: copied ${files.length} files to ${outDir}, dossier written.`);
}

main();
