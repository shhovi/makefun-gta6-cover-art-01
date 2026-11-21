import { drawCover } from './cover.js';
import { PRESETS } from './shots.js';

// Sunset Panels editor wiring: slots, samples, presets, PNG export.

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const titleInput = document.getElementById('titleInput');
const gradeSelect = document.getElementById('gradeSelect');
const photoInput = document.getElementById('photoInput');
const slotButtons = [0, 1, 2].map(i => document.getElementById('slot' + i));

const panelImages = [null, null, null];
const panelUrls = [null, null, null];
let activeSlot = 0;

function render() {
  drawCover(ctx, panelImages, titleInput.value, gradeSelect.value, canvas.width, canvas.height);
}

function setActiveSlot(i) {
  activeSlot = i;
  slotButtons.forEach((btn, j) => btn.classList.toggle('active', j === i));
}

function loadIntoSlot(url, slot) {
  const img = new Image();
  img.onload = () => {
    panelImages[slot] = img;
    panelUrls[slot] = url;
    slotButtons[slot].style.backgroundImage = `url(${url})`;
    slotButtons[slot].textContent = '';
    render();
  };
  img.src = url;
}

slotButtons.forEach((btn, i) => btn.addEventListener('click', () => setActiveSlot(i)));

photoInput.addEventListener('change', () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadIntoSlot(url, activeSlot);
});

document.getElementById('sampleBoulevard').addEventListener('click', () => loadIntoSlot('samples/boulevard.jpg', activeSlot));
document.getElementById('samplePier').addEventListener('click', () => loadIntoSlot('samples/pier.jpg', activeSlot));

titleInput.addEventListener('input', render);
gradeSelect.addEventListener('change', render);

const presetRow = document.getElementById('presetRow');
PRESETS.forEach(preset => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = preset.title;
  btn.addEventListener('click', () => {
    titleInput.value = preset.title;
    preset.panels.forEach((panel, i) => loadIntoSlot(panel, i));
    render();
  });
  presetRow.appendChild(btn);
});

document.getElementById('exportBtn').addEventListener('click', () => {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sunset-panels-cover.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
});

// Default panels from presets so the preview is never empty.
PRESETS[0].panels.forEach((panel, i) => loadIntoSlot(panel, i));
render();
