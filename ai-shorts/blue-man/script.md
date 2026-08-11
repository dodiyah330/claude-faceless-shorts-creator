# blue-man #1 — "The Door" (~36s, 9:16, Seedance 1.5 Pro)

**Format:** the recurring blue-man philosophical short — the faceless blue clay character
walking through surreal scenes under a calm second-person VO. Character: `character.json`
(LOCKED — every start frame is `gen_image.py --ref character.png`; never re-derived from text).

**Thesis / payoff:** *arrival is a myth — the walking was the life.* The mandatory
frame-0 == last-frame loop is not a gimmick here, it IS the argument: he ends the video
walking toward the same door he started at, and the video replaying is the point.

**Model:** `fal-ai/bytedance/seedance/v1.5/pro/image-to-video` (picked by eye, 2026-07-14
bake-off) — 1080p, `generate_audio:false`, and the final shot's `end_image_url` is PINNED to
shot 1's start frame so the loop is a constraint, not luck.

## Beat sheet

| # | window (est) | on screen | VO |
|---|---|---|---|
| 1 | 0.0–5.0 | THE PAID BAKE-OFF CLIP (desert, glowing arch, walking away from cam) — frame 0 fully composed | L1: "Somewhere out there is a door that fixes everything." |
| 2 | 5.0–10.5 | new land, same walk: snowfield at dusk, another glowing doorway far off | L2: "A job. A person. A city. You've been walking toward it for years." |
| 3 | 10.5–15.0 | AT the door, one hand raised into the warm light, stepping through | L3: "And one day, you actually reach it. And you step through." |
| 4 | 15.0–21.5 | the other side: soft green meadow… with another tiny door on the horizon; he keeps walking | L4: "And the other side… is another road. With another door. A little further on." |
| 5 | 21.5–29.5 | wide dusk shot: a path threading MANY doorframes receding to the horizon; calm steady walk | L5: "That's not a flaw in the journey. That's what arrival is — the name we give the next departure." |
| 6 | 29.5–36.5 | the SAME desert as shot 1; he walks toward the same arch; last frame == frame 0 | L6: "You were never walking to the door. The walking was the life." |

**Outro rule:** none. L6 is the last words; the loop back into shot 1 is the ending.
No engagement CTA of any kind (locked repo-wide 2026-07-10/12).

## Per-shot generation notes

- Every start frame: `gen_image.py --model pro --aspect 9:16 --ref ai-shorts/blue-man/character.png`
  plus scene prompt that names "the exact same faceless blue clay character with his chunky
  mustard-yellow knit scarf". Same minimalist surreal 3D render style, golden/dusk palette.
- Shot 1 is `bakeoff/seedance.mp4` — already generated, already paid ($0.29), already approved
  by eye. Its start frame is `bakeoff/shot-door.png`.
- Shot 6: start frame = new image (same desert, arch slightly closer); `end_image_url =
  bakeoff/shot-door.png` → the clip lands exactly on frame 0 of shot 1.
- Motion prompts: slow contemplative walk cycle, camera tracking behind at fixed distance,
  "body, scarf and proportions stay exactly consistent, no morphing".
- Voice FIRST: real word times decide final shot durations (Seedance takes integer 4–12s);
  the table above is the 2.5–2.7 wps estimate.

## Cost plan (state before spending — derived, Seedance 1080p audio-off $0.0583/s)

5 new clips ≈ 5+5+7+8+7 = 32s ≈ **$1.87 fal** (+ shot 1 already paid) + 5 Gemini start frames.
Final durations set after the real VO times; restate the exact number then.
