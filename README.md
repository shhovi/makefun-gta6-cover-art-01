# Sunset Panels — make your own three-panel cover art
[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/shhovi/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/shhovi/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Sunset Panels is a small offline browser tool that turns three of your photos into a synthwave-style three-panel cover image with a big title and subtitle, ready to export as a PNG. Everything runs locally in the browser — no uploads, no tracking, no build step.

## Run it

Option A — tiny static server (no dependencies):

```
node serve.ts
```

Then open http://localhost:8000 in your browser.

Option B — just open the file directly:

Open `app/index.html` in any modern browser. Pick three images, type a title and subtitle, and hit **Download PNG**.

## Features

- Three equal vertical panels with cover-fit cropping, so photos of any shape fill their slot cleanly without distortion
- Synthwave sunset gradient overlay with scanline and vignette finishing for that retro-cover look
- Bold condensed title rendered with a gradient fill, plus an editable subtitle
- Live preview that re-renders as you type or swap photos
- One-click PNG export at 1200×675
- Deterministic screenshot presets via `?shot=1`, `?shot=2`, `?shot=3` for reproducible captures
- Works fully offline once loaded

## Built for make.fun

This project was built for the [make.fun](https://make.fun) bounty **gta6-cover-art-01**.

## License

MIT — see [LICENSE](LICENSE).
