# short-5 · Probability — "Monty Hall, Finally Intuitive"

Format: 1080×1920 @ 30fps, ~43s. 100% TSX. Voice: ElevenLabs (Liam), per-line via
tools/gen_voice.py. New niche lib: `remotion/src/lib/prob.tsx` (Door, Brace, ProbChip,
TallyGrid, BigPct, seeded `montyTrials`) — seeds the probability series (birthday paradox,
gambler's-fallacy coin run, false-positive test all reuse it). Reuses the shorts kit.

## The math (verified — textbook Monty Hall)

Three doors: one hides a car, two hide goats. You pick a door — **1/3** chance it's the car.
The host, who **knows** what's behind the doors, opens a *different* door that always reveals a
**goat**. Now: stay or switch?

- **Stay** wins **1/3** of the time (only when your first pick was already the car).
- **Switch** wins **2/3** of the time.

Intuition that makes it click: your first pick is right 1/3 of the time, so 2/3 of the time the
car is behind one of the *other two* doors. The host then removes the wrong one of those two —
so that entire 2/3 **collapses onto the single door you can switch to**. Switching literally
doubles your odds.

Walkthrough case (fixed so every scene is consistent): you pick **door 1**, the car is behind
**door 2**, the host can only open **door 3** (the sole remaining goat). Switching → door 2 → win.

## The proof beat is a REAL simulation (not a claim)

`montyTrials(seed=15, n=100)` in `lib/prob.tsx` runs 100 honest games (mulberry32 RNG; pick + car
uniform; always-switch wins iff pick ≠ car). Result: **switch 66 / stay 34** — a clean ~2/3,
converging 70→68→66→67→66%. The 100-dot grid fills live and the counters tick to the real numbers
(same ethos as short-3's real instrumented sorts).

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frame 0 composed: door 1 "YOUR PICK" (closed) + door 2 (closed), door 3 already open on a 🐐 (✕). Title "MONTY HALL / IT'S NOT 50 / 50", subtitle "switch or stay?". Punch-in settle. | "Two doors left. One hides the car. This isn't fifty-fifty." |
| SETUP | 3.4–13.2s | Rewind to 3 closed doors + legend "🚗 1 CAR · 🐐 2 GOATS". Door 1 → YOUR PICK + "1/3" chip. Door 3 swings open → 🐐. | "Rewind. Three doors — one car, two goats." / "You pick door one. One in three it's the car." / "The host opens a goat — on purpose." |
| QUIZ | 13.2–16.4s | PauseCard "STAY or SWITCH?" with countdown ring over the two-doors state. | "Stay, or switch to the last door? Pause." |
| REVEAL | 16.4–31.8s | "1/3" pins on door 1 → a brace labelled "2/3" spans doors 2+3 → door 3 gets ✕, the brace **retracts** onto door 2 → door 2 glows "2/3" + SWITCH → + ×2. Contrast "1/3 vs 2/3". | "Your first pick? Right one in three." / "So two-thirds of the time, it's elsewhere." / "The host clears away the wrong door." / "That two-thirds now sits on one door." / "Switch — you double your odds." |
| PROOF | 31.8–40s | Kicker "100 GAMES · ALWAYS SWITCH". A 10×10 dot grid fills live from the real sim — teal = switch won, slate = stay won. Big counters settle **SWITCH 66% / STAY 34%**; summary "SWITCHING WINS ≈ 2 IN 3". | "Still doubt it? A hundred games, always switch." / "Switch wins about two out of three." |
| LOOP | 40–43s | Back to the two-doors "NOT 50/50" state (mode grow, scale ends at 1.06) — last frame rhymes with frame 0 and dissolves into the intro. No CTA. | "Two doors. Never fifty-fifty. Now you know." |

## Production notes

- Persistent canvas = the **three doors**; scenes rewind/evolve them on one timeline (setup opens
  door 3, reveal annotates, loop returns to the hook state) — continuity, not cuts.
- Every reveal cue syncs to its VO word (the "1/3" on "one time in three", the brace on "two times
  in three", the ✕ on "wrong door", the door-2 glow on "two-thirds"). Cue frames retuned to the
  REAL word times after Stage 4.
- VO windows estimated ~2.7 words/sec (≈101 words / 41s) so no line needs atempo squeeze.
- Outro: no engagement-CTA (locked 2026-07-12). Ends on the payoff; the LOOP dissolves back to
  the intro.
- SFX plan (Stage 5): library-first — door swing (whoosh-soft), pick lock (ui-click-soft), the
  goat reveal (pop-reveal), the ✕/removal (impact-soft), the brace collapse (whoosh-soft), the
  final counters settling (chime-reward). The `ui-toggle-on` motif fits the literal "switch".
