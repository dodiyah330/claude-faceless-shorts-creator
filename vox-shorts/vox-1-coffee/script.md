# vox-1-coffee — "How Coffee Conquered the World" (first REAL vox short)

40.5s vertical (1080×1920) · voice: ElevenLabs Liam · no burned captions (on-screen text carries
the words; revisit after the user's audit). Upgraded 2026-07-14 from the approved engine PoC.

## STATUS: production complete 2026-07-14 — AWAITING HASAN'S AUDIT

- `output/vox-1-sfx.mp4` — voiced + 22-cue SFX mix (no music), the reference audition
- `output/vox-1-sfx-<bed>.mp4` — 6 music-bed auditions (docu-pluck is the new
  documentary-pizzicato bed generated for this engine; also ambient-pad, cinematic-min,
  lofi-warm, tech-pulse, lullaby-tender)
- Pending user audit: pick/reject a bed, flag any pacing/level/VO-delivery notes, then final
  loudness + packaging + upload.

## Facts (verified 2026-07-14, web)

- Ethiopia origin = the Kaldi goatherd LEGEND — always framed "legend says".
- 1400s: coffee cultivated/brewed in Yemen; Sufi monks used it for night devotions; Mocha the port.
- Mecca ban 1511 (Kha'ir Beg); Cairo crackdowns followed; Murad IV (Ottoman sultan, 1633)
  made coffee drinking punishable by death.
- First Constantinople coffeehouses ~1554–55 (photo caption says 1555 ✓).
- ~2.25 billion cups drunk per day worldwide (standard figure).

## Beat sheet

| t (s) | beat | on screen | VO |
|---|---|---|---|
| 0–4.5 | HOOK | Title "How **coffee** conquered the world" + cup places on paper; chapter chip. Slow push. | Coffee didn't just conquer your mornings. It conquered the world. |
| 4.5–10.5 | ORIGIN | Map places; camera dives to the Horn of Africa; ETHIOPIA chip pins on "Ethiopian". Branch parallax. | Legend says an Ethiopian goatherd caught his goats dancing after eating strange red berries. |
| 10.5–19 | TRAVEL | Dashed route draws across the Red Sea on "crossed"; MOCHA, YEMEN chip on "Yemen". | By the fourteen hundreds… monks brewed them to pray through the night. |
| 19–26 | BAN | Camera widens; sultan engraving slides in right; red BANNED stamp slams on "banned"; chips: Mecca 1511 · Cairo · Constantinople 1633 death penalty. | Rulers panicked. Mecca banned it… punishable by death. |
| 26–33 | COFFEEHOUSE | Ban fades; taped archival print places; statement "Ideas. Gossip. **Revolutions.**" (backing strips). | It didn't matter. The coffeehouse was born… ideas, gossip, and revolutions. |
| 33–42 | TODAY/LOOP | Camera returns to page-1 wide; cup pops back; title fades back in; stat chip "2.25 billion cups. Every day." Last frame ≈ frame 0 → seamless replay. | Today, the world drinks two and a quarter billion cups. Every single day. |

## Layers (core/media/projects/vox-1-coffee/layers/)

paper.png · map.png · cup.png (rembg) · branch.png (rembg) · coffeehouse.png · **sultan.png**
(rembg, new for BAN). Kit addition for BAN: `RubberStamp` (generic — red slammed stamp).

## Production notes

- Cues estimated from beats.json windows first; after gen_voice.py writes REAL times, retime
  the CUES table in the shot to actual word starts (Ethiopia chip on "Ethiopian", route on
  "crossed", stamp on "banned", photo on "coffeehouse", cup return on "Today").
- Outro rule: no CTA — the loop IS the ending (title+cup+chip ≈ frame 0).
- SFX pass after voice: paper slides, place thuds, stamp slam (hero moment), route scribble,
  soft whoosh per camera move. Sparse; decorative cues optional:true.
