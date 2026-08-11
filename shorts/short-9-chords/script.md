# The 4 Chords In Every Hit — short-9 (music theory)

Fully-synthetic vertical short (1080×1920 @30, 42s). Adds ONE new niche lib: `lib/piano.tsx`.
First short in the series where the audio pass is **music**, not sound effects.

## The facts (verified before scripting)

- The **I–V–vi–IV** progression — "in the key of C major, this progression would be **C–G–Am–F**"
  ([Wikipedia](https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression)).
- Popularised by **The Axis of Awesome**'s 2008 "Four Chords" medley, which stitched dozens of
  hits together over only these four chords.
- **The twist is a documented rotation, not a stretch.** The same four chords starting on the
  sixth give **vi–IV–I–V** (Am–F–C–G) — dubbed the *"sensitive female chord progression"* — and
  that rotation powers a *different* set of songs: **Africa** (Toto), **Apologize** (OneRepublic),
  **One of Us** (Joan Osborne). Same four keys, different feeling. That is the share-moment.
- Songs used in the reveal, all cited as I–V–vi–IV: **Let It Be** (Beatles), **With or Without
  You** (U2), **No Woman No Cry** (Bob Marley), **Don't Stop Believin'** (Journey), **Someone
  Like You** (Adele), **All Too Well** (Taylor Swift).

**Copyright:** we name song titles (titles aren't copyrightable) and play only the four *chords*
(chord progressions aren't copyrightable). **No melody of any song is ever reproduced.**

## The audio (why it's synthesized)

`gen_music.py` prompts a generative Music API for ambient beds — it cannot deliver "A minor,
exactly, at concert pitch, decaying over 2.4s". In a music-theory video an out-of-tune chord is
a factual error, so `tools/gen_chords.py` synthesizes the chords deterministically:
equal temperament, A4 = 440 Hz, additive harmonics with a soft attack and long decay (a
Rhodes/electric-piano colour — calmer under a voice than a percussive grand, per brand §10).
Exact pitch, exact frame, zero API cost, identical on every run. The four one-shots live in the
SFX library (`piano-c-maj`, `piano-g-maj`, `piano-a-min`, `piano-f-maj`) and are placed on the
timeline by `mix_sfx.py` like any other cue — so the whole music series reuses them.

## Beat sheet

| # | Beat | t (s) | On screen | VO |
|---|------|-------|-----------|-----|
| 1 | HOOK | 0.0–4.0 | Frame 0 composed: keyboard with the 4 chords' keys already lit, chips C · G · Am · F above. Title "THE 4 CHORDS IN EVERY HIT" | Almost every song you love uses the same four chords. |
| 2 | SETUP | 4.0–12.4 | Keys reset; each chord plays in turn — key group lights, chip stamps, roman numeral appears under it (I · V · vi · IV) | C. G. A minor. F. / In theory: one, five, six, four. |
| 3 | QUIZ | 12.4–16.2 | PauseCard over the keyboard — the 4 chips stay lit | Pause. Where have you heard this? |
| 4 | REVEAL | 16.2–28.8 | The progression cycles on loop; a song title + artist stamps in on each chord, stacking up a list of 6 | Let It Be. With or Without You. No Woman No Cry. / Don't Stop Believin'. Someone Like You. All Too Well. / Same four chords. Every single time. |
| 5 | TWIST | 28.8–39.0 | The song list clears. The SAME four keys stay lit, but the loop **rotates** to start on Am — vi–IV–I–V. The roman numerals re-order in place. Two new songs stamp | Now just start on the sixth instead. / Same four keys. Completely different song. / Africa. Apologize. |
| 6 | LOOP | 39.0–42.0 | Rotation unwinds, chips return to C · G · Am · F, title fades back. Last frame == frame 0 | — (the chords keep ringing) |

**No engagement-CTA outro** (locked rule). It ends on "four chords — that's the whole trick" and
the loop dissolves back into the intro.

## VO (~70 words — music needs air; the chords carry the space)

Timings are ESTIMATES; `gen_voice.py` overwrites them with real per-word times.

| # | Beat | Start | End | Line |
|---|------|-------|-----|------|
| 1 | hook | 0.4 | 3.8 | Almost every song you love uses the same four chords. |
| 2 | setup | 4.6 | 9.2 | C. G. A minor. F. |
| 3 | setup | 9.8 | 12.2 | In theory: one, five, six, four. |
| 4 | quiz | 12.8 | 15.2 | Pause. Where have you heard this? |
| 5 | reveal | 16.6 | 20.8 | Let It Be. With or Without You. No Woman No Cry. |
| 6 | reveal | 21.4 | 25.2 | Don't Stop Believin'. Someone Like You. All Too Well. |
| 7 | reveal | 25.8 | 28.2 | Same four chords. Every single time. |
| 8 | twist | 29.2 | 31.8 | Now just start on the sixth instead. |
| 9 | twist | 32.4 | 34.8 | Same four keys. Completely different song. |
| 10 | twist | 35.4 | 36.8 | Africa. Apologize. |
| 11 | payoff | 37.4 | 39.4 | Four chords. That's the whole trick. |

## Production notes

- **One persistent keyboard.** It mounts at frame 0 and never unmounts; chords light and release
  on it, the rotation happens on the same keys. The keyboard IS the continuity.
- **The chord schedule is shared.** `beats.json.piano.schedule` lists every chord press in global
  seconds. The TSX lights keys from it AND `sfx-plan.json` places the audio one-shots from it, so
  the sound cannot drift from the picture — one source of truth.
- Only the **triad** lights on screen (e.g. C major → C4 E4 G4); the synth also plays a bass root
  an octave or two below, which is audio-only. Lighting the bass would clutter the keyboard.
- Keyboard spans **C3–C5** (15 white keys) — every triad note falls inside it.

## Seeds the music series (all reuse `lib/piano.tsx` + `gen_chords.py`)

- **Why the tritone sounds evil** — the "devil's interval", two keys, one sound.
- **The circle of fifths in 40 seconds.**
- **Why sad songs are minor** — the one note that changes everything (major 3rd → minor 3rd).
