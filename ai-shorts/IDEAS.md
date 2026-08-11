# AI-Video — Idea Bank & Plan

The **generative** track, sibling to `faceless-shorts/` (which is 100% TSX, no footage).
Here the pixels come from a video model, not from code. Different pipeline, different skill,
deliberately isolated workspace — the two must not contaminate each other's skills
(`MIGRATION.md`'s whole design).

Locked 2026-07-14.

## What already exists (we are not starting from zero)

- **`tools/gen_clip.py`** — model-agnostic fal.ai video generation. The fal model id is just
  a string (`--model`), so swapping models is a flag, never a code change. Extra model inputs pass
  through with `--set k=v`, which is how **image-to-video / reference-to-video** is driven
  (`--set image_url=...`). Saves the mp4 **plus a sidecar `.json`** (model, payload, request id)
  so every clip is reproducible.
- **`tools/gen_image.py`** — stills. This is what builds the character sheet.
- `gen_voice.py` (ElevenLabs, incl. v3 emotion tags — proven on short-7), `gen_sfx.py`,
  `mix_sfx.py`, `gen_music.py`, `mix_music.py`, `yt_upload.py` — all reusable as-is.
- `FAL_KEY` and `GEMINI_API_KEY` are in `core/.env`.

**What's missing is the skill, not the engine.**

## THE central problem: character consistency

Every video here except the motivational one lives or dies on this. Naive text-to-video gives you
a **different person every shot** — different face, different outfit, different room. You cannot
prompt your way out of it.

**The rule: never generate a character from text twice.**

1. Generate ONE **character sheet** with `gen_image.py` — the locked reference (face/form, outfit,
   palette, proportions). This is an *asset*, committed and reused.
2. Every shot is then **image-to-video / reference-to-video** (`gen_clip.py --set image_url=...`),
   handing the model a frame that *already contains* the character.

The model's job drops from "invent a character" to "animate this one". **Veo 3.1's
reference-to-video mode is built precisely for multi-image character + scene consistency**, and
Kling 3.0 Pro's custom-element support is the equivalent. That is the technique the whole track
rests on.

## Models & cost — RECOMPUTED 2026-07-14 (an earlier draft of this file was WRONG)

**Always generate with `generate_audio: false`.** The voice is ElevenLabs and the sound is our SFX
pipeline, so paying the model for audio is pure waste — and on Seedance it literally **halves** the
token rate ($2.4 → $1.2 per 1M tokens).

**Seedance is TOKEN-priced, not per-second:** `tokens = (h × w × fps × dur) / 1024`. This is the
trap. At 24 fps the formula reproduces fal's own published example ($0.26 for a 5s 720p clip *with*
audio) to the cent, which validates both the formula and the framerate — so the numbers below are
derived, not quoted.

40s vertical short, audio off, one full pass:

| model | $/sec | 40s pass | |
|---|---|---|---|
| Seedance 1.5 Pro (720p) | $0.026 | $1.04 | cheapest usable — for tests/b-roll |
| Wan 2.5 | $0.050 | $2.00 | |
| **Seedance 1.5 Pro (1080p)** | **$0.058** | **$2.33** | ← **THE DEFAULT** |
| Kling 2.5 Turbo Pro | $0.070 | $2.80 | |
| Veo 3.1 Fast (1080p) | $0.100 | $4.00 | |
| Seedance 1.0 Pro | $0.124 | $4.96 | |
| Seedance 2.0 Fast (720p) | $0.242 | $9.68 | flagship, and only 720p |
| Veo 3 | $0.400 | $16.00 | |

### Why Seedance 1.5 Pro is the default — it is cheaper AND it is the right shape

`fal-ai/bytedance/seedance/v1.5/pro/image-to-video` — **1.7× cheaper than Veo 3.1 Fast at the same
1080p**, and it happens to have exactly the two mechanisms this house style needs:

- **start-frame conditioning** — fal's page: *"The subject from your start frame stays stable
  throughout — face, clothing, and expression."* That IS the character-sheet method.
- **optional END frame** — which means our **frame 0 == last frame** loop rule (baked into every
  short in this repo) stops being luck and becomes a constraint we *hand the model*.

1080p max · 4–12s · 9:16 supported.

**Seedance 2.0's price is disputed and deliberately excluded**: fal's model page says $0.2419/s,
a blog says ~$0.022/s — a 10× gap. Do not plan around either. If its 9-reference-image mode is ever
wanted, settle it with one cheap test call, not a citation.

### THE LESSON (this cost us a wrong recommendation once already)
The first draft of this file recommended Veo 3.1 Fast and quoted "~$10–15 per video". Both were
wrong, because (a) it never looked at Seedance **1.5** — only 1.0 and 2.0 — and (b) it compared
Seedance's *with-audio* price against Veo's *audio-off* price. the price maps were re-derived from fal's pricing API.
**Do not trust a docs page or a blog for pricing: derive it from the token formula and validate it
against the vendor's own worked example.** Same rule the shorts live by — compute, don't assert.

### Still unsettled — resolve with a BAKE-OFF, not with more reading
`gen_clip.py` makes any model a one-flag call, but there is no way to run the SAME prompt across N
models and compare. **Build `tools/bakeoff_clip.py`**: one prompt + one reference image → fire
at 3–5 fal models in parallel → stitch a labeled side-by-side grid with the model id and the ACTUAL
billed cost burned into each panel (the same "audition for the user's ear/eye" pattern as
`mix_music.py`). Contenders: **Seedance 1.5 Pro · Wan 2.5 · Kling 2.5 Turbo Pro · Veo 3.1 Fast**.
At these prices a full bake-off is well under $1. **Run this BEFORE committing to any model.**

### Bake-off RAN 2026-07-14 (`ai-shorts/blue-man/bakeoff/grid.mp4`) — two price corrections
Built `tools/bakeoff_clip.py` and re-derived every price against fal's pricing API + model
pages that day. Two rows of the table above are stale:
- **Wan 2.5 is resolution-TIERED**: $0.05/s is its **480p** rate; 720p is $0.10/s and 1080p is
  **$0.15/s** — at our resolution it is the second-most-expensive contender, not the cheap one.
- **Veo 3.1 Lite exists** (added to fal 2026-03-31, this file never looked): i2v, audio-off
  **$0.03/s @720p, $0.05/s @1080p** — cheaper than Seedance 1080p, same start-frame conditioning,
  no end-frame input though.
Consequence: the four named contenders cannot fit one 1080p panel each under $1 ($1.79), so the
audition ran one panel per model FAMILY — Seedance 5s $0.29 + Kling 5s $0.35 + Veo Lite 4s $0.20
= **$0.84 derived**; Wan (+$0.75) and Veo Fast (+$0.40) stay one `--models` flag away. Billed-cost
verification via `api.fal.ai/v1/models/usage` needs an ADMIN-scoped FAL key (ours 403s → panels
say "est"). **Model pick (by eye, 2026-07-14, from the 4-panel grid incl. Veo Fast):
Seedance 1.5 Pro** — the default earned it. end_image_url loop-pinning is therefore live.

## The slate — ordered by RISK, not by excitement

### 1. **The Blue Man** — recurring stylized character  ← BUILT 2026-07-14 ✅
**#1 "The Door" is built end-to-end** ($4.51 fal): character locked (`blue-man/character.json`),
`/make-ai-short` skill written from the build, SFX audition awaiting the user's ear. The character
and the skill are the reusable assets — next blue-man videos start at the SCRIPT step.
The featureless blue/yellow humanoid you see all over Shorts, walking through surreal or relatable
scenes under a philosophical VO.

**It goes first because it is the EASIEST, and that is not a coincidence — it is *why those
channels chose that character*.** A faceless, stylized humanoid gives the model almost nothing to
get wrong: no face to drift, no hands to mangle, no wardrobe continuity to break. It proves the
character-consistency method under forgiving conditions, and it leaves behind **a reusable
recurring character** — the one asset here that compounds into every future video.

### 2. **Motivational**
Second because it needs **no character continuity at all**: cinematic b-roll (waves, a lone runner,
a city at 5am) + VO + kinetic text. Nothing has to match shot to shot. Fastest path to a shipped
video, but note it does *not* de-risk the story videos — which is exactly why it isn't first.

### 3. **Kids story — short-7, in motion**
short-7 ("Little Pip") already proved the narrative half: 9 AI stills, ken-burned, over an
**ElevenLabs v3 emotion-tagged** VO (warm → playful → scared → crying → whisper → joyful). This
swaps the stills for real motion. Same script, same voice track, same emotional arc — so it is a
clean A/B of stills vs. generated video, on a video we have already shipped.

### 4. **Realistic story (adult / older audience)**
Same build as #3, hardest difficulty: realistic human faces are where drift actually hurts. Do not
attempt before the character-sheet method is proven on #1 and #3.

### 5. **Workout — gym-aesthetic ONLY (decided 2026-07-14)**
**We do NOT generate exercise form with an AI video model.** Current models are bad at repetitive
human biomechanics — reps break down, limbs melt mid-motion, joints bend the wrong way. A video
that *teaches form* would confidently teach **wrong** form, and that is a real-world harm, not just
an ugly frame.

So this one is **motivational gym atmosphere**: chalk, a bar loading up, sweat, a 5am gym, no
instructional claim ever made. If a genuinely instructional workout video is wanted later, that is
a case for **real footage** or a **TSX/rigged figure whose joint angles we control ourselves** —
the same "computed, not asserted" rule the physics shorts live by.

## Artifact contract (what `/make-ai-short` will formalize)

```
ai-shorts/<name>/
  script.md         — hook, beat sheet, VO, per-shot prompts
  beats.json        — machine contract: format, vo[] (+ real word times), beats[], shots[]
  character.json    — THE LOCKED REFERENCE: character sheet image + the prompt that made it,
                      palette, proportions. Every shot references this. Never re-derived.
  shots/
    01-<slug>.mp4   — generated clip
    01-<slug>.json  — sidecar: model, full payload, request id  (gen_clip writes this)
    01-<slug>.png   — the reference still the clip was driven from
  voice/ · sfx-plan.json · output/
```

Same discipline as `/make-short`: facts verified before scripting, frame-by-frame QA before
committing to a full pass, real ElevenLabs word times driving the captions, SFX audition gated on
The user's ear. **Plus one new gate: state the generation cost before spending it.**

## Outros — same rule as every other track
No engagement-CTAs. End on the payoff. (Locked 2026-07-10 / 2026-07-12 across `/channel-short`
and `/make-short`; it applies here too.)
