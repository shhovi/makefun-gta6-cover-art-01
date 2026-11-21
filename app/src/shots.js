// Preset shots mirrored from shots.json for the browser UI.
export const SHOTS = [
  { shot: 1, title: "SUNSET PANELS", panels: ["samples/boulevard.jpg", "samples/pier.jpg", "samples/boulevard.jpg"] },
  { shot: 2, title: "VICE VIBES", panels: ["samples/pier.jpg", "samples/boulevard.jpg", "samples/pier.jpg"] },
  { shot: 3, title: "NEON COAST", panels: ["samples/boulevard.jpg", "samples/boulevard.jpg", "samples/pier.jpg"] },
];

export function applyShot(shot, selects, titleInput) {
  if (!shot) return;
  for (let i = 0; i < 3; i++) {
    const sel = selects[i];
    if (!sel) continue;
    const panel = shot.panels[i] || "";
    sel.value = panel.includes("pier") ? "pier" : "boulevard";
  }
  if (titleInput) titleInput.value = shot.title;
}
