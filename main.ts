// Entry point for the gta6-cover-art-01 submission (Node 22, standard library only, no build step).
// It hands the entry in: the static web app in app/ plus the screenshots in screenshots/ are copied
// next to this file's output directory, and dossier.json (the summary the scorer reads) is written
// there with buildDossier from the vendored make.fun library in vendor/makefun-app.ts.
//
// The output directory is /output in the grader's container; locally, point MAKEFUN_OUTPUT_DIR at
// a folder instead:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Two runs over the same inputs write identical bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate: at most 4 screenshots of at most 256 KiB each, at most 993
// entries and 48 MiB under app/, paths under app/ at most 1000 bytes, dossier text 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
