# claude-faceless-shorts-creator

**A faceless YouTube-Shorts factory you drive with [Claude Code](https://claude.com/claude-code).**
Three production tracks in one repo — you just describe the video, and the right pipeline runs:

| You say… | Track | The pixels |
|---|---|---|
| *"make a short about the ×11 trick"* | **TSX** (`/make-short`) | 100% code — a [Remotion](https://remotion.dev) composition, no footage, no stock |
| *"make an AI video short with blue-man"* | **Generative** (`/make-ai-short`) | a fal video model animating a **locked recurring character** |
| *"make a vox-style short about coffee"* | **Collage** (`/make-vox`) | Vox-documentary paper collage — AI-image layers, die-cuts, a traveling camera |

Every track shares the same backbone: ElevenLabs voice with **word-exact synced captions**,
frame-by-frame QA at phone scale, a reusable self-growing SFX/music library, seamless
frame-0==last-frame loops, and no dated engagement-CTA outros.

## The example videos (more coming)

**TSX shorts** (`shorts/`) — 12 complete productions; each folder has the script, beats
contract, and SFX cue sheet, and the committed composition renders the exact video:

| # | Niche | Title / hook |
|---|---|---|
| 1 | Chess | The 4-Move Checkmate — Punished |
| 2 | Math | The ×11 Trick |
| 3 | Algorithms | Bubble vs Quick: The Race |
| 4 | Dev tips | `git reflog` undoes any mistake |
| 5 | Probability | Monty Hall, Finally Intuitive |
| 6 | Excel | Excel Reads Your Mind (Flash Fill / Ctrl+E) |
| 7 | Kids story | Little Pip (AI-image storybook, ages 4–6) |
| 8 | Cybersecurity | The URL That Isn't PayPal |
| 9 | Music theory | The 4 Chords In Every Hit |
| 10 | Money math | The 1% Fee That Eats 24% Of Your Retirement |
| 11 | Geography | The Map Lied To You |
| 12 | Physics | Astronauts Aren't Weightless. They're Falling. |

**Generative** (`ai-shorts/blue-man/`) — *The Door*: a clay-render character walking through
doors across worlds, thesis "arrival is a myth". Includes the **locked character sheet**
(`character.json` + reference PNG), the model bake-off records (Seedance vs Kling vs Veo, with
derived per-second costs), and the six generated clips — committed, because video-model pixels
are not reproducible.

**Collage** (`vox-shorts/vox-1-coffee/`) — a Vox-style documentary short on coffee's journey:
generated map/archival/cutout layers (committed), a camera choreographed across scenes, and
`DESIGN.md` — the full visual-language spec of the collage engine.

Rendered videos aren't committed (they're reproducible from the repo); links to published
versions will be added here as they go live.

## How a short gets made

```
topic ──▶ script.md + beats.json      the beat grammar: HOOK (frame 0 = the thumbnail)
                │                      → SETUP → QUIZ → REVEAL → TWIST → seamless LOOP
                ▼
        the visuals                    TSX composition / video-model clips / collage layers
                │                      (per track — but always ONE Remotion timeline)
                ▼
        frame-by-frame QA              Claude renders PNGs at phone scale and READS them
                │
                ▼
        gen_voice.py                   ElevenLabs TTS per line → REAL per-word timestamps
                │                      → captions highlight on the exact spoken word
                ▼
        sfx-plan.json + mix_sfx.py     library-first sound design, audition mix, your ear
                │                      is the final gate (optional music bed: mix_music.py)
                ▼
        <track>/<project>/output/*-sfx.mp4
```

Five Claude Code **skills** encode the craft:

- **`/make-short`** — the TSX pipeline: hook grammar, no-CTA outros, caption safe areas,
  Sequence-local frame math, loop-into-intro endings.
- **`/make-ai-short`** — the generative pipeline and its three iron rules: never regenerate a
  locked character from text, state the cost before spending it, loop by end-frame constraint.
- **`/make-vox`** — scene dissection into layers, cheapest-source layer production
  (gen_image + rembg cutouts, HTML→PNG, SVG-in-TSX), CollageBoard camera choreography.
- **`/vidtsx-2d-generator`** — the TSX authoring rules that keep Remotion renders from crashing.
- **`/suggest-sfx`** — taste-encoded sound design: function-first cues, layered hero moments,
  measured audibility (RMS-diff, not hope), a library that compounds across videos.

`brand.md` is the style contract (palette, type, motion, SFX taste) — swap it for your own
brand and every future short follows it.

## Quickstart

Requirements: [Claude Code](https://claude.com/claude-code) · Node 18+ · Python 3.10+ ·
`ffmpeg` on PATH · an [ElevenLabs](https://elevenlabs.io) key (voice/SFX/music). For the
generative track add a [fal.ai](https://fal.ai) key; for collage layer production:
`pip install pillow rembg playwright && playwright install chromium` (the only pip installs
in the repo — everything else is stdlib).

```bash
git clone https://github.com/hassancs91/claude-faceless-shorts-creator
cd claude-faceless-shorts-creator
cp .env.example .env          # add your keys
cd remotion && npm install && npm run gen && cd ..

claude                        # open the repo in Claude Code, then:
```

> **make a short about &lt;your topic&gt;** · **make an AI video short about &lt;idea&gt;** ·
> **make a vox-style short about &lt;story&gt;**

…or rebuild an example: *"re-render short-5 and regenerate its voice"*.

To just explore the compositions visually: `cd remotion && npm run studio`.

## Repo layout

```
.claude/skills/   the five skills (this is where the "editor" lives)
tools/            Python: gen_voice, gen_sfx, gen_music, mix_sfx, mix_music, gen_image,
                  gen_clip, bakeoff_clip, cutout, capture_web, gen_chords
remotion/         the Remotion project — shared kits in src/lib/ (incl. collage.tsx),
                  one folder per video in src/shots/
media/library/    reusable assets: SFX clips + music beds (catalogued, loudness-normalized)
media/projects/   media for one specific video — incl. committed AI clips & collage layers
shorts/           the 12 TSX example productions
ai-shorts/        the generative track: blue-man/ (locked character) + IDEAS.md (cost tables)
vox-shorts/       the collage track: vox-1-coffee/ + DESIGN.md (the visual language)
brand.md          the style contract — make it yours
IDEAS.md          the TSX-shorts niche/idea bank
```

## License

MIT — see [LICENSE](LICENSE). Bundled SFX/music clips and example AI media were generated by
the repo author (ElevenLabs / fal / Gemini) and are redistributed here; per-clip provenance is
recorded in `media/library/*/catalog.json` and the per-shot `.json` sidecars.
