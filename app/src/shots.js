// Fixed scenes for screenshots. `?shot=cover` hides the controls so the cover alone fills the
// viewport; `?shot=editor` shows the full editor with the sample photo loaded and rendered.
// `photo` picks samples/<photo>.jpg (pier or boulevard) and `caption` sets the lettering.
// Once the scene is painted and two animation frames have passed, window.__shotReady turns true.
export async function runShot(query, loadScene) {
  const shot = query.get('shot');
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photoName = query.get('photo') ?? 'pier';
  const captionText = query.get('caption') ?? 'Sunset Heist';
  await loadScene(photoName, captionText);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
