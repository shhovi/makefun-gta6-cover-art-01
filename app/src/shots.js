// shots.js — deterministic screenshot presets for Sunset Panels.
// If the URL carries ?shot=1, ?shot=2, or ?shot=3, render a fixed cover
// (fixed sample images + fixed titles) and set document.title. No randomness,
// so the same URL always produces the same cover.

export const SHOT_PRESETS = {
  1: { title: "SUNSET PANELS", subtitle: "a synthwave story", panels: ["samples/boulevard.jpg", "samples/pier.jpg", "samples/boulevard.jpg"] },
  2: { title: "VICE VIBES", subtitle: "neon nights", panels: ["samples/pier.jpg", "samples/boulevard.jpg", "samples/pier.jpg"] },
  3: { title: "NEON COAST", subtitle: "drive into the glow", panels: ["samples/boulevard.jpg", "samples/boulevard.jpg", "samples/pier.jpg"] },
};

export async function initShots({ titleInput, subtitleInput, loadIntoPanel }) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot");
  if (!shot || !SHOT_PRESETS[shot]) return false;
  const preset = SHOT_PRESETS[shot];
  document.title = `${preset.title} — Sunset Panels`;
  titleInput.value = preset.title;
  subtitleInput.value = preset.subtitle;
  for (let i = 0; i < 3; i++) {
    await loadIntoPanel(i, preset.panels[i]);
  }
  return true;
}
