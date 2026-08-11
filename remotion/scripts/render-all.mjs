// Bulk renderer: bundles once, renders every shot in the manifest.
//   node scripts/render-all.mjs                 -> render all
//   node scripts/render-all.mjs LevelsOverview  -> render only these ids
//   node scripts/render-all.mjs --still         -> render a poster PNG per shot instead of video
// Opaque shots -> out/<id>.mp4 (h264). transparent:true shots -> out/<id>.mov (ProRes 4444 + alpha).
// Rendered at scale 2 (author 1080p -> 4K output) to composite crisply over the 4K master.
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia, renderStill } from '@remotion/renderer';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const stillMode = args.includes('--still');
const scaleArg = args.find((a) => a.startsWith('--scale='));
const SCALE = scaleArg ? Number(scaleArg.split('=')[1]) : 2;
const onlyIds = args.filter((a) => !a.startsWith('--'));

const manifest = JSON.parse(readFileSync(path.join(root, 'src', 'shots.manifest.json'), 'utf8'));
const outDir = path.join(root, 'out');
mkdirSync(outDir, { recursive: true });

console.log('bundling...');
// publicDir must be passed explicitly: remotion.config.ts only applies to the CLI,
// not the programmatic bundle() API. ../media is the public root.
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, '..', 'media') });

let n = 0;
for (const shot of manifest) {
  if (onlyIds.length && !onlyIds.includes(shot.id)) continue;
  const composition = await selectComposition({ serveUrl, id: shot.id });

  if (stillMode) {
    const out = path.join(outDir, `${shot.id}.png`);
    await renderStill({
      serveUrl, composition, output: out, scale: SCALE, overwrite: true,
      frame: Math.floor(composition.durationInFrames * 0.6),
      imageFormat: shot.transparent ? 'png' : 'jpeg',
    });
    console.log('  still ->', path.relative(root, out));
  } else {
    const transparent = !!shot.transparent;
    const out = path.join(outDir, `${shot.id}.${transparent ? 'mov' : 'mp4'}`);
    await renderMedia({
      serveUrl, composition, outputLocation: out, scale: SCALE, overwrite: true,
      codec: transparent ? 'prores' : 'h264',
      proResProfile: transparent ? '4444' : undefined,
      pixelFormat: transparent ? 'yuva444p10le' : 'yuv420p',
      imageFormat: transparent ? 'png' : 'jpeg',
      crf: transparent ? undefined : 18,
      onProgress: ({ progress }) => process.stdout.write(`\r  ${shot.id}: ${Math.round(progress * 100)}%   `),
    });
    process.stdout.write('\n');
    console.log('  ->', path.relative(root, out));
  }
  n++;
}
console.log(`done: ${n} shot(s) rendered to out/`);
