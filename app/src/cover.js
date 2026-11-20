// cover.js — rendering helpers for Sunset Panels.
// Draws three images into equal vertical panels on a 1200x675 canvas,
// applies a synthwave sunset finish (gradient wash, scanlines, vignette),
// and exports a PNG.

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 675;

export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (source instanceof File || source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = String(source);
    }
  });
}

function drawCoverFit(ctx, img, dx, dy, dw, dh) {
  const scale = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function applySunsetFinish(ctx, width, height) {
  // Sunset gradient wash.
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "rgba(255, 90, 180, 0.18)");
  grad.addColorStop(0.55, "rgba(255, 140, 60, 0.14)");
  grad.addColorStop(1, "rgba(30, 10, 70, 0.38)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  // Scanlines.
  ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
  for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);
  // Vignette.
  const vig = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.72);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(10, 0, 30, 0.45)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}

function drawTitle(ctx, title, subtitle, width, height) {
  if (!title && !subtitle) return;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const grad = ctx.createLinearGradient(0, height * 0.62, 0, height * 0.86);
  grad.addColorStop(0, "#ffd23d");
  grad.addColorStop(0.5, "#ff7a3d");
  grad.addColorStop(1, "#ff3d8a");
  ctx.font = `900 ${Math.round(width * 0.085)}px "Arial Narrow", Impact, sans-serif`;
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(20, 5, 45, 0.85)";
  const ty = height * 0.74;
  if (title) {
    ctx.strokeText(title.toUpperCase(), width / 2, ty);
    ctx.fillStyle = grad;
    ctx.fillText(title.toUpperCase(), width / 2, ty);
  }
  if (subtitle) {
    ctx.font = `600 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(20, 5, 45, 0.8)";
    const sy = ty + width * 0.055;
    ctx.strokeText(subtitle, width / 2, sy);
    ctx.fillStyle = "#ffe9f4";
    ctx.fillText(subtitle, width / 2, sy);
  }
}

export function renderCover(canvas, images, title, subtitle) {
  const ctx = canvas.getContext("2d");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const panelW = COVER_WIDTH / 3;
  // Background fallback so empty panels still look intentional.
  const bg = ctx.createLinearGradient(0, 0, 0, COVER_HEIGHT);
  bg.addColorStop(0, "#3a1666");
  bg.addColorStop(1, "#160828");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
  for (let i = 0; i < 3; i++) {
    const img = images[i];
    if (img) drawCoverFit(ctx, img, i * panelW, 0, panelW, COVER_HEIGHT);
  }
  // Panel separators.
  ctx.fillStyle = "rgba(10, 0, 30, 0.6)";
  ctx.fillRect(panelW - 3, 0, 6, COVER_HEIGHT);
  ctx.fillRect(panelW * 2 - 3, 0, 6, COVER_HEIGHT);
  applySunsetFinish(ctx, COVER_WIDTH, COVER_HEIGHT);
  drawTitle(ctx, title, subtitle, COVER_WIDTH, COVER_HEIGHT);
  return canvas;
}

export function canvasToPngBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export async function downloadPng(canvas, filename = "cover.png") {
  const blob = await canvasToPngBlob(canvas);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
