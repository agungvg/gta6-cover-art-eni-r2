// Vice Heat — main.ts
// The program that hands the entry in (Node 22, standard library only).
// It copies app/ and screenshots/ beside this file into the output
// directory and writes dossier.json with the vendored make.fun library, so
// the judge reads exactly the app the screenshots show.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The scorer's own caps, from the kit's gate: the text cap shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
} as const;

function countTree(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      const sub = countTree(p);
      files += sub.files;
      bytes += sub.bytes;
    } else if (st.isFile()) {
      files += 1;
      bytes += st.size;
    }
  }
  return { files, bytes };
}

// The scorer refuses an entry whose screenshots break the gate (more than
// 4, or any one over 256 KiB). Check them here, at hand-in, so a bad
// export fails loudly now instead of silently at grade time.
function checkScreenshots(dir: string): { files: number; bytes: number } {
  if (!existsSync(dir)) throw new Error(`screenshots/ missing beside main.ts (${dir})`);
  const names = readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith('.png') || n.toLowerCase().endsWith('.jpg'))
    .sort();
  if (names.length === 0) throw new Error('screenshots/ holds no PNG or JPEG');
  if (names.length > CAPS.screenshots.max) {
    throw new Error(`screenshots/ holds ${names.length} images, over the ${CAPS.screenshots.max} cap`);
  }
  let bytes = 0;
  for (const name of names) {
    const size = statSync(join(dir, name)).size;
    if (size > CAPS.screenshots.max_bytes) {
      throw new Error(`screenshots/${name} is ${size} bytes, over the ${CAPS.screenshots.max_bytes} cap — re-export it smaller`);
    }
    bytes += size;
  }
  return { files: names.length, bytes };
}

function handIn(): void {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  const appDir = join(here, 'app');
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(appDir)) throw new Error(`app/ missing beside main.ts (${appDir})`);
  if (!existsSync(join(appDir, 'index.html'))) throw new Error('app/index.html missing');
  const shots = checkScreenshots(shotsDir);

  const before = countTree(appDir);
  if (before.files > CAPS.app_max_files) {
    throw new Error(`app/ holds ${before.files} files, over the ${CAPS.app_max_files} cap`);
  }
  if (before.bytes > CAPS.app_max_bytes) {
    throw new Error(`app/ is ${before.bytes} bytes, over the ${CAPS.app_max_bytes} cap`);
  }

  mkdirSync(out, { recursive: true });
  cpSync(appDir, join(out, 'app'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });
  }

  const dossier = buildDossier(out, CAPS);
  writeFileSync(join(out, 'dossier.json'), dossier);
  console.log(
    `vice-heat: handed in ${before.files} app files (${before.bytes} bytes), ` +
      `${shots.files} screenshots (${shots.bytes} bytes, all within the 256 KiB cap), ` +
      `dossier ${Buffer.byteLength(dossier)} bytes -> ${out}`,
  );
}

handIn();
