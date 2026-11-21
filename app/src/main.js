import { loadImage, drawCover } from "./cover.js";
import { SHOTS, applyShot } from "./shots.js";

const canvas = document.getElementById("cover");
const ctx = canvas.getContext("2d");
const selects = [
  document.getElementById("panel1"),
  document.getElementById("panel2"),
  document.getElementById("panel3"),
];
const titleInput = document.getElementById("title");
const downloadBtn = document.getElementById("download");

const images = { boulevard: null, pier: null };

function currentImages() {
  return selects.map((s) => images[s.value] || images.boulevard);
}

function redraw() {
  drawCover(ctx, currentImages(), titleInput.value);
}

async function init() {
  // Preload both sample scenes before the first draw.
  images.boulevard = await loadImage("samples/boulevard.jpg");
  images.pier = await loadImage("samples/pier.jpg");
  applyShot(SHOTS[0], selects, titleInput);
  redraw();
  for (const s of selects) s.addEventListener("change", redraw);
  titleInput.addEventListener("input", redraw);
  document.querySelectorAll("[data-shot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = Number(btn.getAttribute("data-shot"));
      const shot = SHOTS.find((s) => s.shot === n);
      applyShot(shot, selects, titleInput);
      redraw();
    });
  });
  downloadBtn.addEventListener("click", () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sunset-panels-cover.jpg";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.9);
  });
}

init();
