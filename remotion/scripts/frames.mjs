// QA frame dumper: bundles once, renders specific frames of ONE composition.
//   node scripts/frames.mjs Short1Chess 0,140,290,540,700 --scale=0.5
// Writes out/qa/<id>-f<frame>.png — phone-scale legibility checks for shorts.
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args[0];
const frames = (args[1] ?? '0').split(',').map((n) => Number(n.trim()));
const scaleArg = args.find((a) => a.startsWith('--scale='));
const SCALE = scaleArg ? Number(scaleArg.split('=')[1]) : 0.5;

if (!id) {
  console.error('usage: node scripts/frames.mjs <CompId> <f1,f2,...> [--scale=0.5]');
  process.exit(1);
}

const outDir = path.join(root, 'out', 'qa');
mkdirSync(outDir, { recursive: true });

console.log('bundling...');
// publicDir must be passed explicitly: remotion.config.ts only applies to the CLI,
// not the programmatic bundle() API. ../media is the public root.
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, '..', 'media') });
const composition = await selectComposition({ serveUrl, id });

for (const frame of frames) {
  const f = Math.max(0, Math.min(composition.durationInFrames - 1, frame));
  const out = path.join(outDir, `${id}-f${String(f).padStart(4, '0')}.png`);
  await renderStill({ serveUrl, composition, output: out, frame: f, scale: SCALE, overwrite: true, imageFormat: 'png' });
  console.log('  ->', path.relative(root, out));
}
console.log('done');
