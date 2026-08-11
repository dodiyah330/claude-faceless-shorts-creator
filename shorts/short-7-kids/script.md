# Little Pip — kids story short (ages 4–6)

**Sub-type:** faceless AI-image story. 9 AI-generated stills (9:16), animated in Remotion
(ken-burns / gentle parallax), word-synced captions, ElevenLabs **v3 emotion-tagged** VO.
**Purpose of this first pass:** stress-test the emotion-tagged voice-over across a full
emotional arc (warm → playful → worried → scared → crying → whisper → hopeful → joyful → tender).

- Format: 1080×1920 @30, ~55s. Gentle bedtime-storyteller pace (~2.2–2.5 wps + real pauses).
- Emotional engine: **lost-and-found** (separation → reunion) — the strongest arc for 4–6.
- One iconic character (a tiny fox cub) → easiest to keep consistent across AI images.
- **No engagement-CTA outro** (locked rule): end on the warm payoff; optional soft loop back to beat 1.

## Beat sheet

| # | Beat | On screen (AI image) | VO (clean) | v3 delivery tags |
|---|------|----------------------|------------|------------------|
| 1 | hook-warm | Fox cub in golden dusk light | This is Pip… the littlest fox in the whole big forest. | `[warmly]` |
| 2 | play | Cub chasing a glowing butterfly | Today, Pip is chasing a butterfly. Wheee! | `[cheerfully] [giggles]` |
| 3 | wander | Cub tiny under huge dark trees | He follows it far… and farther… deep into the trees. | — |
| 4 | worry | Cub looks up, sky gone dark | But when Pip looks up… the sun is gone. Mama? | `[nervously] [worried]` |
| 5 | scared | Cub alone in shadowy clearing | Mama, where are you? …But nobody answers. | `[scared] [sad]` |
| 6 | cry-low | Cub curled up, one tear | So Pip sits all alone in the dark… and starts to cry. | `[sad] [crying]` |
| 7 | firefly-hope | Firefly glowing by cub's nose | Then — a tiny light. A little firefly. Don't be scared. I'll help you find her. | `[gently] [whispers]` |
| 8 | journey | Fireflies + moon light the path | They follow the moon… past the old oak… over the little stream… | `[hopefully]` |
| 9 | reunion-payoff | Mama fox scoops cub up, cozy glow | And there — Pip sees her! Mama! She wraps him up, warm and safe. I've got you, my little Pip. | `[excited] [emotional] [warmly]` |

## Voice test plan

- Model: `eleven_v3` (required for audio/emotion tags).
- Candidate voices (both warm storytellers): **George** `JBFqnCBsd6RMkjVDRZzb` (British male,
  narrative_story) and **Sarah** `EXAVITQu4vr4xnSDxMaL` (warm female). Generate the full arc in
  both → Hasan's ear picks.
- `text` = clean caption; `tts` = tagged delivery (tags filtered from the word map, never captioned).
- Windows are generous so v3's slower emotional delivery isn't atempo-squeezed.

## Production notes (for the build, after voice is locked)

- **Character consistency:** generate a Pip reference/turnaround first, then pass it as a
  reference image to every one of the 9 beats so the cub stays identical.
- Animation: still-image ken-burns (slow push/pan) + subtle parallax; captions + progress bar at root.
- Kids stories breathe — keep pauses; do not tighten to punchy-short pacing.
