# vox-shorts/ — layered-collage documentary engine ("Vox-style")

A new video **type workspace** (sibling of `faceless-shorts/`, `channel-longs/`…) plus a new
piece of the shared engine. The format: **Vox/Johnny-Harris-style layered collage animation** —
every scene is dissected into separate image layers (paper background, cutout subjects, maps,
archival photos, labels, arrows) and the TSX side *choreographs* the layers so they assemble
into a composed scene on screen. The polish comes from many simple, staggered layer moves +
a virtual camera, not from complex per-image animation.

## Why this is its own engine (not a make-short variant)

- **Format-agnostic**: shorts *or* longs, vertical *or* horizontal, AI voice,
  with or without a camera/face PiP. `make-short` is a vertical-hook grammar; this is a
  *visual language* that any duration/orientation can speak.
- **Niche-agnostic**: education, documentary, history, econ, tech explainers — and it can
  produce *segments* dropped into any other video (a 20s collage explainer inside a video-N
  long, via the normal timeline.json cutaway mechanism).
- Once the look is proven, this folder gets its own skills (`make-vox`, later `vox-segment`).

## The visual language (what makes it read "Vox")

1. **Paper world** — warm cream/kraft paper backdrop, film grain, soft vignette. Nothing is
   ever pitch black or pure white; everything sits on a *surface*.
2. **Cutouts** — subjects are die-cut photos/illustrations with a subtle white sticker edge
   and a soft drop shadow, so they feel physically placed on the paper.
3. **Choreography, not animation** — layers enter staggered (slide / pop with overshoot /
   rise / mask-wipe), then **never sit still**: slow idle drift ("breathing") on every layer.
4. **The camera is a narrator** — one oversized collage board; the camera pushes, pans and
   settles between anchor points. Layers carry a `depth`, so camera moves produce parallax.
5. **Annotation grammar** — white label chips (slightly rotated), marker-highlight sweeps
   over key words, hand-drawn arrows that draw on, dashed travel routes over maps.
   Headlines use `FONT_EDITORIAL` (Source Serif 4, weight 700 — Publico-ish; Spectral@600
   read too light). **Contrast rule (locked 2026-07-14):** over any busy layer (map, photo)
   statements MUST use `backing` — cream strips behind every word, highlight sweeps over the
   strip. Bare ink and the yellow sweep both die against sepia tones; chips with light
   accents (VOX.yellow) need `kickerColor` dark.
6. **Archival treatment** — old photos get duotone/sepia + white photo border + slight
   rotation; screenshots/documents get paper-scan treatment.

## Architecture (monorepo fit)

```
vox-shorts/                         ← the vox projects live here
  DESIGN.md                         ← this file
  .claude/skills/                   ← make-vox (added after the look is approved)
  vox-N-<topic>/                    ← one project per video/segment
    script.md · scenes.json         ← plan + machine contract (like beats.json, superset)
    voice/ · sfx-plan.json · output/
remotion/src/lib/collage.tsx   ← THE kit: CollageBoard camera, Cutout, PaperBG,
                                       ArchivalPhoto, LabelChip, MarkerHighlight, SketchArrow…
remotion/src/shots/vox-N/      ← compositions (registered by npm run gen, as always)
media/projects/vox-N-<topic>/  ← generated layers (staticFile('projects/vox-N-…/x.png'))
tools/cutout.py                ← NEW: bg-removal → transparent cutout (+ sticker border)
```

## Layer sources (pick per object, cheapest that works)

| Object | Source | Path |
|---|---|---|
| Photographic subjects, textures, maps, archival shots | AI (gen_image.py, Gemini) → cutout.py | PNG layer |
| Charts, UI bits, documents, styled text blocks | HTML/CSS/JS → Playwright PNG (capture_web.py; `omitBackground` for alpha) | PNG layer |
| Arrows, routes, geometric shapes, highlights | **SVG authored directly in TSX** (no rasterizing — animatable for free) | TSX |

**Reuse before generate** (library rule applies): paper textures and generic cutouts that
prove reusable graduate to `media/library/`.

## Pipeline (mirrors the proven short-N flow)

1. **Script + scene dissection** — script.md, then `scenes.json`: per scene → camera anchor
   (x, y, zoom) + layers[] (src, position, depth, entrance{type, at, dur}, treatment).
2. **Layer production** — gen_image.py / capture_web / SVG; cutout.py for transparency.
3. **TSX assembly** — one composition per video; scenes are `<Sequence>`s inside ONE
   `CollageBoard` so the camera can travel *across* scene boundaries. vidtsx hard rules apply.
4. **QA** — frames.mjs stills at every entrance cue; READ each PNG.
5. **Voice** — gen_voice.py;
   word-exact captions when the format wants them.
6. **SFX/music** — the existing suggest-sfx machinery. Collage taste: paper slides, whooshes,
   soft thuds on cutout landings, camera-move risers — sparse, editorial.

## Status / roadmap

- [x] **PoC**: `collage.tsx` kit + `vox-1-coffee` vertical demo scene — validate the look.
- [x] Eye on the render → typography pass (FONT_EDITORIAL, backing strips) approved 2026-07-14.
- [x] Formalize `make-vox` skill (`.claude/skills/make-vox/`).
- [ ] Horizontal/long variant + `vox-segment` flow (collage cutaways inside video-N longs).
- [ ] Own-voice flow (record → transcribe → word-align) and optional face PiP (face_pip.py).
