// Poster rendering for the cover maker: a three-panel collage (one tall hero panel beside two
// stacked panels, separated by bright gutters), a colour grade per panel, and heavy caption
// lettering along the foot. Everything is drawn with canvas gradients, overlays and filters, so
// the same code paints the live preview and the exported PNG at any size.

// Original grade presets. `filter` is applied to the photo itself; `wash` layers are painted
// over it with the given composite operation to push the panel toward a sunset or neon look.
export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    filter: 'saturate(1.45) contrast(1.12) brightness(1.04) hue-rotate(-8deg)',
    wash: [
      { from: 'rgba(255, 94, 58, 0.00)', to: 'rgba(255, 94, 58, 0.38)', mode: 'overlay', stops: [0.25, 1] },
      { from: 'rgba(255, 0, 128, 0.00)', to: 'rgba(255, 0, 128, 0.30)', mode: 'soft-light', stops: [0.55, 1] },
    ],
    captionTop: '#fff3c4',
    captionBottom: '#ffb03a',
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    filter: 'saturate(1.6) contrast(1.22) brightness(0.94) hue-rotate(12deg)',
    wash: [
      { from: 'rgba(0, 229, 255, 0.22)', to: 'rgba(0, 229, 255, 0.00)', mode: 'overlay', stops: [0, 0.55] },
      { from: 'rgba(255, 0, 170, 0.00)', to: 'rgba(255, 0, 170, 0.34)', mode: 'overlay', stops: [0.5, 1] },
    ],
    captionTop: '#d8fbff',
    captionBottom: '#37e6ff',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    filter: 'saturate(1.3) contrast(1.06) brightness(1.08) sepia(0.28)',
    wash: [
      { from: 'rgba(255, 190, 64, 0.30)', to: 'rgba(255, 120, 40, 0.10)', mode: 'soft-light', stops: [0, 1] },
      { from: 'rgba(120, 40, 90, 0.00)', to: 'rgba(120, 40, 90, 0.26)', mode: 'multiply', stops: [0.6, 1] },
    ],
    captionTop: '#fff8e1',
    captionBottom: '#ffd166',
  },
  {
    id: 'chrome-noir',
    name: 'Chrome Noir',
    filter: 'saturate(0.55) contrast(1.35) brightness(1.0)',
    wash: [
      { from: 'rgba(70, 90, 160, 0.20)', to: 'rgba(10, 10, 30, 0.34)', mode: 'overlay', stops: [0, 1] },
    ],
    captionTop: '#ffffff',
    captionBottom: '#c9d4ff',
  },
];

export const EXPORT_SIZES = [
  { id: 'square', label: '1080 x 1080 (square)', width: 1080, height: 1080 },
  { id: 'portrait', label: '1080 x 1350 (portrait)', width: 1080, height: 1350 },
  { id: 'wide', label: '1920 x 1080 (wide)', width: 1920, height: 1080 },
];

// Panel layout: hero panel on the left, two stacked panels on the right, bright gutters between.
export function panelRects(width, height) {
  const gutter = Math.max(8, Math.round(Math.min(width, height) * 0.014));
  const heroWidth = Math.round((width - gutter) * 0.62);
  const sideWidth = width - gutter - heroWidth;
  const sideHeight = Math.round((height - gutter) / 2);
  return [
    { x: 0, y: 0, w: heroWidth, h: height },
    { x: heroWidth + gutter, y: 0, w: sideWidth, h: sideHeight },
    { x: heroWidth + gutter, y: sideHeight + gutter, w: sideWidth, h: height - sideHeight - gutter },
  ];
}

// Default per-panel framing: the hero shows the subject wide, the small panels punch in tighter
// on different parts of the same photo so one photo can fill the whole poster.
export function defaultPanels() {
  return [
    { zoom: 1.0, panX: 0, panY: 0 },
    { zoom: 1.7, panX: -0.35, panY: -0.25 },
    { zoom: 1.45, panX: 0.3, panY: 0.35 },
  ];
}

function drawPhotoInPanel(ctx, photo, rect, framing, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (photo) {
    const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
    const scale = base * framing.zoom;
    const drawW = photo.naturalWidth * scale;
    const drawH = photo.naturalHeight * scale;
    const slackX = Math.max(0, drawW - rect.w);
    const slackY = Math.max(0, drawH - rect.h);
    const dx = rect.x - slackX / 2 - framing.panX * slackX;
    const dy = rect.y - slackY / 2 - framing.panY * slackY;
    ctx.filter = grade.filter;
    ctx.drawImage(photo, dx, dy, drawW, drawH);
    ctx.filter = 'none';
  } else {
    const empty = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    empty.addColorStop(0, '#3a1c5c');
    empty.addColorStop(1, '#12081f');
    ctx.fillStyle = empty;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  for (const layer of grade.wash) {
    const grad = ctx.createLinearGradient(0, rect.y + rect.h * layer.stops[0], 0, rect.y + rect.h * layer.stops[1]);
    grad.addColorStop(0, layer.from);
    grad.addColorStop(1, layer.to);
    ctx.globalCompositeOperation = layer.mode;
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.globalCompositeOperation = 'source-over';
  // Gentle vignette inside each panel for poster depth.
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(8, 0, 18, 0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawCaption(ctx, width, height, caption, grade) {
  const text = caption.trim().toUpperCase();
  if (!text) return;
  // Dark foot band so the lettering stays readable over any photo.
  const band = ctx.createLinearGradient(0, height * 0.68, 0, height);
  band.addColorStop(0, 'rgba(10, 2, 24, 0)');
  band.addColorStop(1, 'rgba(10, 2, 24, 0.82)');
  ctx.fillStyle = band;
  ctx.fillRect(0, height * 0.68, width, height * 0.32);

  const maxWidth = width * 0.92;
  let size = Math.round(height * 0.115);
  const fontFor = (px) => `900 ${px}px "Arial Black", "Arial Narrow Bold", system-ui, sans-serif`;
  ctx.font = fontFor(size);
  try { ctx.letterSpacing = `${Math.max(1, Math.round(size * 0.02))}px`; } catch { /* older canvas */ }
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size -= 2;
    ctx.font = fontFor(size);
  }
  const baseline = height - height * 0.055;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = Math.round(size * 0.22);
  ctx.shadowOffsetY = Math.round(size * 0.06);
  ctx.strokeStyle = 'rgba(16, 0, 32, 0.92)';
  ctx.lineWidth = Math.max(3, Math.round(size * 0.16));
  ctx.strokeText(text, width / 2, baseline);
  const fill = ctx.createLinearGradient(0, baseline - size, 0, baseline);
  fill.addColorStop(0, grade.captionTop);
  fill.addColorStop(1, grade.captionBottom);
  ctx.fillStyle = fill;
  ctx.fillText(text, width / 2, baseline);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
}

function drawSelection(ctx, rect, index) {
  ctx.save();
  ctx.strokeStyle = '#37e6ff';
  ctx.lineWidth = 5;
  ctx.setLineDash([16, 10]);
  ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
  ctx.setLineDash([]);
  const label = `PANEL ${index + 1}`;
  ctx.font = '700 26px system-ui, sans-serif';
  const labelW = ctx.measureText(label).width + 24;
  ctx.fillStyle = 'rgba(8, 4, 24, 0.85)';
  ctx.fillRect(rect.x + 10, rect.y + 10, labelW, 40);
  ctx.fillStyle = '#37e6ff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + 22, rect.y + 31);
  ctx.restore();
}

// Paints the whole cover. `state` carries the photos, caption, grade id, per-panel framing and
// the selected panel; `options.showSelection` adds the editor's dashed outline (never exported).
export function drawCover(ctx, width, height, state, options = {}) {
  const grade = GRADES.find((g) => g.id === state.gradeId) ?? GRADES[0];
  ctx.fillStyle = '#f5efe6';
  ctx.fillRect(0, 0, width, height);
  const rects = panelRects(width, height);
  rects.forEach((rect, index) => {
    const photo = index === 0 ? state.photo : (state.photo2 ?? state.photo);
    drawPhotoInPanel(ctx, photo, rect, state.panels[index], grade);
  });
  drawCaption(ctx, width, height, state.caption, grade);
  if (options.showSelection) drawSelection(ctx, rects[state.selected], state.selected);
}

// Which panel a canvas-space point falls in, or -1 when it lands on a gutter.
export function panelAt(width, height, x, y) {
  const rects = panelRects(width, height);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
  }
  return -1;
}
