# short-2 · Math — "The ×11 Trick"

Format: 1080×1920 @ 30fps, 42s. 100% TSX. Voice: ElevenLabs (Liam), per-line via
tools/gen_voice.py. Pacing lesson from short-1 applied: VO windows estimated at ~2.7
words/sec so lines don't need atempo compression.

## The math

Two-digit number × 11: write the two digits apart, put their SUM in the middle.
72×11 → 7 (7+2) 2 → 792. If the sum passes 9, drop its unit digit in the middle and
CARRY the 1 onto the left digit: 85×11 → 8+5=13 → 3 in the middle, 8+1=9 → 935.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frame 0 composed: "72 × 11 = ?" giant, "2 SECONDS · NO CALCULATOR" chip, title "THE ×11 TRICK". | "Seventy-two times eleven. Two seconds. No calculator." |
| TEACH | 3.4–15.4s | TimesElevenDemo(7,2): digits split apart → mini sum "7+2 = 9" pops above → the 9 DROPS into the gap → tiles flash green, "= 792". | "Here's the trick school never taught you." / "Split the seven and the two." / "Add them — nine. Drop it in the middle." / "Seven ninety-two. Done." |
| QUIZ | 15.4–19.6s | "45 × 11 = ?" + PauseCard with countdown. | "Your turn. Forty-five times eleven. Pause." |
| ANSWER | 19.6–24.2s | Fast TimesElevenDemo(4,5) → 495 green. | "Four plus five is nine — four ninety-five. You just did it." |
| LEVEL 2 | 24.2–36.6s | Kicker "LEVEL 2 — THE CARRY". TimesElevenDemo(8,5): sum "8+5 = 13" → the 3 drops mid, the 1 FLIES onto the 8 which rolls to 9 → 935. | "But what if the digits pass nine?" / "Eighty-five times eleven. Eight plus five — thirteen. Drop the three… carry the one." / "Nine thirty-five. Effortless." |
| LOOP | 36.6–42s | "63 × 11 = ?" giant + "GO." — visually rhymes with frame 0, leaves the viewer holding a challenge as it loops. | "You're faster than a calculator now. Prove it — sixty-three times eleven. Go." |

## Production notes

- Reusable choreography lives in `remotion/src/lib/math.tsx` (`TimesElevenDemo`,
  `EqRow`, `DigitTile`) — same component drives 72, 45 and 85 with different cue frames.
- Every stage cue (split/sum/drop/carry/result) is synced to its VO word.
- SFX: existing library only (whoosh-soft splits, ui-click-soft sum, pop-reveal drops,
  chime-reward first result, impact-soft on "GO"), no new generation needed.
