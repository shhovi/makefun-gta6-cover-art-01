// Editor wiring: photo pickers (read locally, never uploaded), caption field, grade and panel
// controls, zoom slider, drag-to-pan on the preview, export-size selector and PNG export.
// A `?shot=` query switches to a fixed screenshot scene instead (see shots.js).
import { GRADES, EXPORT_SIZES, defaultPanels, drawCover, panelAt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const captionInput = document.getElementById('caption');
const zoomSlider = document.getElementById('zoom');
const sizeSelect = document.getElementById('size');
const status = document.getElementById('status');
const gradeRow = document.getElementById('grades');
const panelRow = document.getElementById('panels');

const state = {
  photo: null,
  photo2: null,
  caption: captionInput.value,
  gradeId: GRADES[0].id,
  panels: defaultPanels(),
  selected: 0,
  size: EXPORT_SIZES[0],
};

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw(showSelection = true) {
  canvas.width = state.size.width;
  canvas.height = state.size.height;
  drawCover(ctx, canvas.width, canvas.height, state, { showSelection });
  zoomSlider.value = String(state.panels[state.selected].zoom);
  for (const btn of panelRow.children) {
    btn.classList.toggle('active', Number(btn.dataset.panel) === state.selected);
  }
  for (const btn of gradeRow.children) {
    btn.classList.toggle('active', btn.dataset.grade === state.gradeId);
  }
}

async function pickPhoto(input, slot) {
  const file = input.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    state[slot] = await loadImage(url);
    status.textContent = slot === 'photo' ? 'Main photo loaded.' : 'Second photo loaded for the small panels.';
    redraw();
  } catch {
    status.textContent = 'That file could not be read as an image.';
  }
}

document.getElementById('photo').addEventListener('change', (e) => pickPhoto(e.target, 'photo'));
document.getElementById('photo2').addEventListener('change', (e) => pickPhoto(e.target, 'photo2'));

for (const sampleBtn of document.querySelectorAll('[data-sample]')) {
  sampleBtn.addEventListener('click', async () => {
    state.photo = await loadImage(`samples/${sampleBtn.dataset.sample}.jpg`);
    status.textContent = 'Sample photo loaded. Pick your own any time.';
    redraw();
  });
}

captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});

for (const grade of GRADES) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = grade.name;
  btn.dataset.grade = grade.id;
  btn.addEventListener('click', () => {
    state.gradeId = grade.id;
    redraw();
  });
  gradeRow.appendChild(btn);
}

['Hero', 'Top small', 'Bottom small'].forEach((label, index) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.dataset.panel = String(index);
  btn.addEventListener('click', () => {
    state.selected = index;
    redraw();
  });
  panelRow.appendChild(btn);
});

zoomSlider.addEventListener('input', () => {
  state.panels[state.selected].zoom = Number(zoomSlider.value);
  redraw();
});

for (const size of EXPORT_SIZES) {
  const opt = document.createElement('option');
  opt.value = size.id;
  opt.textContent = size.label;
  sizeSelect.appendChild(opt);
}
sizeSelect.addEventListener('change', () => {
  state.size = EXPORT_SIZES.find((s) => s.id === sizeSelect.value) ?? EXPORT_SIZES[0];
  redraw();
});

// Drag to pan the selected panel; a press also selects the panel under the pointer.
let drag = null;
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const hit = panelAt(canvas.width, canvas.height, point.x, point.y);
  if (hit >= 0) state.selected = hit;
  drag = { startX: point.x, startY: point.y, panX: state.panels[state.selected].panX, panY: state.panels[state.selected].panY };
  canvas.setPointerCapture(event.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const point = canvasPoint(event);
  const framing = state.panels[state.selected];
  framing.panX = Math.max(-1, Math.min(1, drag.panX + ((point.x - drag.startX) / canvas.width) * 1.6));
  framing.panY = Math.max(-1, Math.min(1, drag.panY + ((point.y - drag.startY) / canvas.height) * 1.6));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

document.getElementById('export').addEventListener('click', () => {
  const out = document.createElement('canvas');
  out.width = state.size.width;
  out.height = state.size.height;
  drawCover(out.getContext('2d'), out.width, out.height, state, { showSelection: false });
  out.toBlob((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cover-${out.width}x${out.height}.png`;
    link.click();
    status.textContent = `Saved cover-${out.width}x${out.height}.png`;
  }, 'image/png');
});

const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query, async (sampleName, captionText) => {
    state.photo = await loadImage(`samples/${sampleName}.jpg`);
    state.caption = captionText;
    captionInput.value = captionText;
    redraw(query.get('shot') !== 'cover');
  });
} else {
  loadImage('samples/pier.jpg')
    .then((img) => { state.photo = img; redraw(); })
    .catch(() => redraw());
}
