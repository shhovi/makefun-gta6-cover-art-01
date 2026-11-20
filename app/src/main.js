// main.js — wires the Sunset Panels UI (file inputs, title fields, download)
// to the cover renderer in cover.js.
import { loadImage, renderCover, downloadPng } from "./cover.js";
import { initShots } from "./shots.js";

const canvas = document.getElementById("cover-canvas");
const rendered = document.getElementById("rendered");
const titleInput = document.getElementById("title-input");
const subtitleInput = document.getElementById("subtitle-input");
const downloadBtn = document.getElementById("download-btn");

const images = [null, null, null];

function refresh() {
  renderCover(canvas, images, titleInput.value.trim(), subtitleInput.value.trim());
  rendered.src = canvas.toDataURL("image/png");
}

function setPreview(index, img) {
  const box = document.getElementById(`preview-${index}`);
  box.innerHTML = "";
  if (img) {
    const el = document.createElement("img");
    el.src = img.src;
    el.alt = `Panel ${index + 1} preview`;
    box.appendChild(el);
  } else {
    const span = document.createElement("span");
    span.textContent = "No image yet";
    box.appendChild(span);
  }
}

async function loadIntoPanel(index, source) {
  try {
    const img = await loadImage(source);
    images[index] = img;
    setPreview(index, img);
    refresh();
  } catch {
    images[index] = null;
    setPreview(index, null);
    refresh();
  }
}

for (let i = 0; i < 3; i++) {
  const input = document.getElementById(`file-${i}`);
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (file) loadIntoPanel(i, file);
  });
}

titleInput.addEventListener("input", refresh);
subtitleInput.addEventListener("input", refresh);
downloadBtn.addEventListener("click", () => downloadPng(canvas, "cover.png"));

// Preload the two bundled samples into panels 1 and 2.
loadIntoPanel(0, "samples/boulevard.jpg");
loadIntoPanel(1, "samples/pier.jpg");
refresh();

// Deterministic screenshot presets (?shot=1|2|3) — handled in shots.js.
initShots({ canvas, rendered, titleInput, subtitleInput, loadIntoPanel, refresh });
