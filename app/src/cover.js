// Cover-drawing helpers for Sunset Panels.
// drawCover renders the 3-panel cover; applyGrade tints a single panel.

export function applyGrade(ctx, grade, x, y, w, h) {
  ctx.save();
  if (grade === 'neon') {
    ctx.fillStyle = 'rgba(120, 40, 200, 0.14)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 60, 140, 0.10)';
    ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
  } else {
    ctx.fillStyle = 'rgba(255, 130, 60, 0.14)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 180, 90, 0.10)';
    ctx.fillRect(x, y, w, h * 0.4);
  }
  ctx.restore();
}

function drawPanelCover(ctx, img, x, y, w, h) {
  if (!img) {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#3a1c6e');
    grad.addColorStop(0.55, '#e85478');
    grad.addColorStop(1, '#ffaa50');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    return;
  }
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

export function drawCover(ctx, images, title, grade, w, h) {
  ctx.fillStyle = '#0c0a18';
  ctx.fillRect(0, 0, w, h);
  const gutter = Math.round(w * 0.008);
  const pw = Math.floor((w - gutter * 4) / 3);
  const ph = h - gutter * 2;
  for (let i = 0; i < 3; i++) {
    const x = gutter + i * (pw + gutter);
    const y = gutter;
    drawPanelCover(ctx, images[i] || null, x, y, pw, ph);
    applyGrade(ctx, grade, x, y, pw, ph);
  }
  // Bottom band for legibility.
  const bandH = Math.round(h * 0.18);
  const grad = ctx.createLinearGradient(0, h - bandH, 0, h);
  grad.addColorStop(0, 'rgba(8, 6, 20, 0)');
  grad.addColorStop(1, 'rgba(8, 6, 20, 0.62)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - bandH, w, bandH);
  const text = (title || 'SUNSET PANELS').toUpperCase();
  let size = Math.round(h * 0.085);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const setFont = () => { ctx.font = `900 ${size}px system-ui, sans-serif`; };
  setFont();
  while (ctx.measureText(text).width > w * 0.92 && size > 18) { size -= 4; setFont(); }
  const ty = h - bandH / 2 - 4;
  ctx.lineWidth = Math.max(4, size * 0.16);
  ctx.strokeStyle = '#0a0818';
  ctx.lineJoin = 'round';
  ctx.strokeText(text, w / 2, ty);
  ctx.fillStyle = '#fff5e6';
  ctx.fillText(text, w / 2, ty);
}
