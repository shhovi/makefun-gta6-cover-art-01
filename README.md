[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/shhovi/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/shhovi/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Sunset Panels

Sunset Panels is an offline 3-panel cover maker: pick a photo (or one of the
built-in sunset samples), drop it into three side-by-side panels, add a bold
caption, choose a Sunset or Neon grade, and export a PNG cover. Everything
runs locally in the browser — no uploads, no account, no network needed after
the page loads.

## How to run

- Editor: `node serve.ts` then open http://localhost:8080
- Dossier build: `node main.ts` copies `app/` and `screenshots/` into the
  output directory (`MAKEFUN_OUTPUT_DIR`, default `/output`) and writes
  `dossier.json` there.
- Regenerate samples + screenshots: `node main.ts --shots` procedurally
  renders the sample scenes and cover screenshots with a built-in pure-JS
  JPEG encoder.

Built for the cover-art bounty on [make.fun](https://make.fun). MIT licensed — see `LICENSE`.
