# Sunset Panels

[![Bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/shhovi/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/shhovi/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An entry for the cover-art bounty on [make.fun](https://make.fun). Every pixel of artwork is generated locally by the code in this repo.

## What this is

Sunset Panels is a small offline cover maker. It arranges three vertical
panels side by side — drawn from two built-in sunset scenes, a boulevard
and a pier — and stamps a title band along the bottom, producing a
1200×800 cover image you can download as a JPEG.

Everything runs locally. The web page uses plain HTML, CSS, and ES
modules with no external resources, no build step, and no network calls.
All artwork is procedural and original: the sample scenes are painted
pixel by pixel by `main.ts` (gradients, sun discs, silhouettes) and
encoded with a pure-JavaScript baseline JPEG encoder written for this
project. Nothing is traced, copied, or loaded from anywhere else.

## How to run

Render the sample scenes and the three preset covers, then package the
app into an output directory:

```sh
node main.ts --shots
```

Just package the app (copies `app/` and writes `dossier.json`):

```sh
node main.ts
```

The output directory defaults to `out/` and can be changed with the
`MAKEFUN_OUTPUT_DIR` environment variable.

Serve the interactive cover maker locally:

```sh
node serve.ts
```

Then open http://localhost:8137/ — pick a scene for each panel, type a
title, or tap a preset, and hit **Download JPEG**.

## How shots work

`shots.json` lists the preset covers. Each shot has a number, a title,
and three panel paths (each either `samples/boulevard.jpg` or
`samples/pier.jpg`). Running `node main.ts --shots` renders the two
sample scenes into `app/samples/` and composes one cover per shot into
`screenshots/` (`1-cover.jpg`, `2-editor.jpg`, `3-cover.jpg`), with the
title drawn in a tiny built-in 5×7 bitmap font. The same three shots
are mirrored in `app/src/shots.js` so the web page can apply them as
presets.

## Project layout

- `main.ts` — entrypoint: renders artwork with `--shots`, otherwise
  copies `app/` to the output directory and writes `dossier.json`.
- `serve.ts` — tiny static file server for `app/` (port 8137 or `PORT`).
- `app/` — the offline cover-maker page (`index.html`, `style.css`,
  `src/cover.js`, `src/shots.js`, `src/main.js`).
- `shots.json` — the three preset shots.
- `screenshots/` — covers rendered from the shots.

## Requirements

Node.js 24 or newer (TypeScript is run directly via type stripping).
No dependencies.

## License

MIT — see `LICENSE`.
