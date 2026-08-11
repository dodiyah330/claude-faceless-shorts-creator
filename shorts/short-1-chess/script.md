# short-1 · Chess — "The 4-Move Checkmate — Punished"

Format: 1080×1920 @ 30fps, 42s (1260 frames). 100% TSX. Voice: none yet — VO timings
below are estimates (~3 words/sec); when recorded/TTS'd, transcribe and swap the map.

## The chess (verified line)

Trap: 1.e4 e5 2.Bc4 Nc6 3.Qh5 **Nf6??** 4.Qxf7# (Scholar's Mate — queen protected by Bc4).
Refutation from the position after 3.Qh5: **3…g6!** hits the queen, 4.Qf3 (re-threatening
f7 down the f-file) **4…Nf6!** blocks the file and develops. f7 is then only attacked by
Bc4 and defended by the king — Bxf7+?? Kxf7 just loses a bishop for a pawn. Black ends up
ahead in development with the white queen a target.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.2s | Frame 0 fully composed: title "THE 4-MOVE / CHECKMATE TRAP", board in final mate position, red f7+e8, CHECKMATE stamp. Slow punch-in. | "This trap wins millions of games — in just four moves." |
| TRAP | 3.2–14.4s | Fresh board, moves play synced to VO: e4, …e5, Bc4 (arrow →f7, red f7), …Nc6, Qh5 (arrow →f7), …Nf6?? ("Nf6??" tag), Qxf7# → CHECKMATE stamp | "Pawn to e4." / "Bishop c4 — aiming at f7, the weakest square in Black's camp." / "Queen h5." / "If Black plays the natural move —" / "checkmate. Four moves. Game over." |
| REWIND + QUIZ | 14.4–19.8s | Board visibly rewinds (Q back to h5, N back to g8, f7 pawn restored). PauseCard with countdown ring. | "But right here, Black has one move that stops everything." / "Pause. Find it." |
| PUNISH | 19.8–30s | …g6! ("g6!" tag, green, arrow g6→h5), Qf3 retreat, arrow f3→f7 (orange re-threat), …Nf6! blocks (green f6, threat arrow dies), f7 turns green | "Pawn g6. It hits the queen — and kills the mate." / "The queen runs to f3, eyeing f7 again —" / "but knight f6 slams the door." / "f7 is safe. Forever." |
| DAMAGE | 30–37s | Dashed gray trace of queen's wasted path (d1→h5→f3); green highlights on c6/f6/g6; two stat chips: "WHITE — 2 queen moves, 0 threats left" vs "BLACK — 3 developing moves, all with tempo" | "Now count the moves." / "White's queen danced around for nothing." / "Black built an army — every move with tempo." |
| LOOP | 37.4–42s | Crossfade back to the HOOK composition (same title, same mate board) — final frame ≈ frame 0 for seamless replay. | "Strong players never fear the four-move mate…" / "they feed on it." |

## Layout (vertical safe areas)

- Top zone 150–430: title / beat kicker. Board: 940px, x=70, y=470–1410.
- Captions: center y≈1520, ≤2 rows — clears the board and the bottom ~340px UI zone.
- Right ~160px kept free of critical info (like/share rail).
- Progress bar: 6px, top edge.

## Production notes

- Persistent board across TRAP→DAMAGE (one component, one move timeline) — the rewind
  is real, not a cut. This is the "shots link into one video" proof.
- Piece art: cburnett set (Wikimedia Commons, GPL/BSD/GFDL tri-license — the Lichess set)
  in `remotion/public/chess/`.
- Machine contract in `beats.json`; TSX mirrors it in `remotion/src/shots/short-1/Short1Chess.tsx`.
- SFX pass later via /suggest-sfx (piece thock per move, stamp hit, whoosh on rewind).
