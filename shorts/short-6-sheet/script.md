# short-6 · Excel — "Excel Reads Your Mind" (Flash Fill / Ctrl+E)

Format: 1080×1920 @ 30fps, ~42s. 100% TSX, faceless, fully generated. Voice: ElevenLabs
Liam via tools/gen_voice.py (word-exact captions). New niche lib: `remotion/src/lib/sheet.tsx`
(Excel-green theme; built series-generic so short-7/8/9 = XLOOKUP · $ refs · pivot reuse it).

## The trick (verified)

**Flash Fill** infers a pattern from your example(s) and fills the rest of the column with
**static text values — no formula**. Windows shortcut: **Ctrl+E** (also Data ▸ Flash Fill).
It usually locks a pattern from the **first** example row (sometimes needs a second); it can
split, combine, extract, reformat, and change case. Not the same as Sheets' *Smart Fill*
(Ctrl+Shift+Y) — this short is the Excel clone on purpose.

- Demo 1 — **extract first name**: col A full names → type `Jane` in B2 → Ctrl+E → col B fills.
- Demo 2 — **build from a pattern**: type `jane.doe@acme.com` in C2 → Ctrl+E → col C emails.
  Proves it reads *any* pattern, not just "grab the first word."

Truthfulness: col A is clean-cased so demo 1 is a pure first-token extraction (no over-claim
about auto-casing); demo 2 combines first.last + a fixed domain — both are real Flash Fill.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frame 0 fully composed: Excel grid, col A messy names, col B already first-names (green), glowing **Ctrl+E** keycap, title "EXCEL READS YOUR MIND". | "Stop filling spreadsheets by hand. Watch this." |
| SETUP | 3.4–12s | Grid resets: col A names, col B empty, cell B2 selected; the "slow way" implied. | "A hundred messy names — and you need just the first name from each. The slow way? Retype them all day." |
| REVEAL | 12–24s | Type `Jane` into B2 (char-by-char) → **Ctrl+E** keycap presses → rows cascade-fill top→bottom, each flashing green. | "So type the first one yourself — Jane. Now press Control E. Excel spots the pattern and fills every row. Zero formulas." |
| TWIST | 24–36s | New target col C; type `jane.doe@acme.com` → Ctrl+E → whole email column builds itself. | "And it's not just splitting names. Show it one email… and it writes the entire column. That's Excel reading your mind." |
| LOOP | 35–38s | The filled sheet dissolves back to the hook composition (grow-zoom to frame 0). NO outro/CTA. | *(silent — ends on the payoff line above)* |

VO ≈ 80–90 words @ ~2.7 words/sec with slack to each next line (short-1 lesson: tighter
forces audible atempo squeeze). Line windows below are ESTIMATES — real per-word times get
written by tools/gen_voice.py at Stage 4 and captions retime to the exact spoken word.

## Production notes

- `lib/sheet.tsx` (the one new lib, series-generic):
  - `SheetGrid` — Excel chrome: column letters (A,B,C…), row numbers, green header bar,
    formula bar; `theme: 'excel' | 'sheets'`.
  - `Cell` states: normal · selected (green box) · editing (typing cursor) · flashFilled
    (transient green flash) · header.
  - `FormulaBar`, char-by-char typing, and the **Flash-Fill cascade** (staggered per-row fill,
    driven by a start frame + per-row stagger so it's scrub-safe).
  - `Keycap` — glowing Ctrl+E chip; reusable by every Excel short.
- Beats are `<Sequence>` scenes over ONE persistent grid (the spreadsheet is the continuity —
  the reset, the type, the cascade, the second column all happen in one component's timeline).
- Frame-0 rule: hook uses `warm` props so the filled col B + title + keycap are already on at
  f0. LOOP reverses the hook punch-in (settle 1.06→1) so it loops seamlessly.
- Cascade + Ctrl+E cue frames are COMPUTED from the demo timeline (feed captions sync + the
  sfx-plan `at_s`). Recurring bug to watch: frames inside a `<Sequence>` are LOCAL —
  `local_f = global_s*fps − sequence_from`; check every cue twice.
- Captions block centered ~y1280, clear of the bottom-500 Shorts UI zone.

## SFX (Stage 5, library-first)

Catalog already covers most: `keys-typing-soft` (typing the example), `ui-click-soft` (cell
select), `impact-soft` (the Ctrl+E press), staggered `pop-reveal` for the cascade rows,
`chime-reward` on completion, `whoosh-soft` on the loop crossfade. Likely genuine MISS worth
generating: a single satisfying mechanical **key-thock** for the Ctrl+E press (we only have a
typing *run* today). Decorative cues stay `optional: true`; the cascade + completion are the
hero moments.

## Ending

Ends on the payoff line "That's Excel reading your mind." — then the loop silently dissolves the
filled sheet back into the intro composition (last frame == frame 0). NO comment-bait/question-CTA
(locked 2026-07-12; see IDEAS.md + /make-short). Total ~38s (trimmed the dead tail).

## Series

Queue: short-7 XLOOKUP · short-8 $ absolute refs · short-9 pivot-in-10s, all reuse `lib/sheet.tsx`.
