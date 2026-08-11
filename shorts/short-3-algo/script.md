# short-3 · Algorithms — "Bubble vs Quick: The Race"

Format: 1080×1920 @ 30fps, 42s. 100% TSX. Voice: ElevenLabs Liam via tools/gen_voice.py
(word-exact captions). New niche lib: `remotion/src/lib/algo.tsx`.

## The truth on screen

Both panels run REAL instrumented sorts on the SAME deterministically-shuffled 18-element
list, replayed at the same fixed operations-per-second — the race outcome is genuine, not
staged. Counters show actual operation counts (compares + swaps). Big-O claim verified:
sorting 10⁶ items at ~10⁹ simple ops/sec → bubble n² ≈ 10¹² ops ≈ 17–20 minutes; quick
n·log₂n ≈ 2×10⁷ ops ≈ a blink.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frozen mid-race: quick panel DONE-green, bubble mid-crawl; title "1 LIST / 2 ALGORITHMS". | "Two algorithms. One list. Watch the slaughter." |
| SETUP | 3.4–14s | Panels reset to the shuffled list; labels pop: BUBBLE SORT (top) / QUICK SORT (bottom); ops counters at 0. | "On top: bubble sort. It compares neighbors, swaps them, and repeats. Forever." / "On the bottom: quick sort. Pick a pivot, split the list, conquer." |
| RACE | 14–28.5s | "Ready? Go." → both run at the same ops/sec. Quick finishes ~19s (green + DONE badge + time); bubble crawls on… and on… finally done ~28s. | "Ready? Go." / "Quick sort is… already done." / "Bubble sort is still… bubbling." |
| WHY | 28.5–36.6s | Stat chips over the finished panels: "BUBBLE — n² · <real> ops" vs "QUICK — n·log n · <real> ops". | "The difference? N-squared versus n-log-n." / "Sort a million items, and bubble needs twenty minutes. Quick needs a blink." |
| LOOP | 36.6–42s | Back to the hook composition (grow zoom). Comment bait ending. | "That's why nobody ships bubble sort." / "What should I race next?" |

## Production notes

- `lib/algo.tsx`: `seededShuffle`, instrumented `bubbleSteps`/`quickSteps` (each op = state
  snapshot + highlighted pair), `BarPanel` (bars + label + live counter + DONE badge).
  Race replay = `opsDone = floor((frame − raceStart)/fps × opsPerSec)` — scrub-safe.
- DONE times and op counts are COMPUTED from the real step arrays at module level; the shot
  never hardcodes them (they feed badges, chips, and the sfx-plan cue times).
- Ending is a comment-bait CTA ("what should I race next?") — the series engine.
