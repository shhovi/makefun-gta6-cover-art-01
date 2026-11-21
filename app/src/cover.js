export function loadImage(src) {
  // Loads a local sample image; rejects if the file is missing.
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function drawTitleBand(ctx, title, w, y, h) {
  ctx.fillStyle = "#100a18";
  ctx.fillRect(0, y, w, h);
  const text = String(title || "").toUpperCase();
  ctx.fillStyle = "#ffdca0";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const spaced = text.split("").join("\u2009");
  ctx.fillText(spaced, w / 2, y + h / 2 + 2);
}

export function drawCover(ctx, images, title) {
  const W = 1200;
  const H = 800;
  const bandH = 90;
  const panelH = H - bandH;
  const panelW = 400;
  ctx.fillStyle = "#120a20";
  ctx.fillRect(0, 0, W, H);
  for (let p = 0; p < 3; p++) {
    const img = images[p];
    if (!img) continue;
    const scale = Math.max(panelW / img.naturalWidth, panelH / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = p * panelW + (panelW - dw) / 2;
    const dy = (panelH - dh) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(p * panelW, 0, panelW, panelH);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    ctx.fillStyle = "#140e1c";
    ctx.fillRect(p * panelW, 0, 3, panelH);
  }
  drawTitleBand(ctx, title, W, panelH, bandH);
}
