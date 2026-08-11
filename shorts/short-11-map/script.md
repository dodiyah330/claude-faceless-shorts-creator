# short-11 · Geography — "The Map Lied To You"

**Composition:** `Short11Map` (1080×1920 @30, 42s)
**Niche:** Geography / maps (#12 in IDEAS.md) — first of the series. New lib: `lib/map.tsx`.
**Hook promise:** on the map on your wall, Greenland looks *bigger* than Africa. Africa is 14× bigger.

---

## The facts (verified — and the map's lie is computed, not drawn)

Geometry: Natural Earth **110m**, public domain, baked into `src/lib/geo/world.ts`. `lib/map.tsx`
implements the actual Mercator formula (`y = ln(tan(π/4 + φ/2))`) and projects those real lat/lon
outlines itself — so the distortion on screen is one **our own code produces**, exactly as a wall map
produces it. Nothing about the shrink is hand-animated.

| claim | value | how it was checked |
|---|---|---|
| Greenland, true area | **2,166,086 km²** | authoritative figure; our polygons give 2,190,043 (+1.1%) |
| Africa, true area | **30,370,000 km²** | authoritative; our 49 mapped states give 29,887,668 (−1.6%) |
| **Africa ÷ Greenland (truth)** | **14×** | authoritative 14.02×; **our rendered polygons independently give 13.6×** — the 3% gap is 110m generalization + unmapped small states. Both round to "about fourteen", which is what the VO says. |
| **Africa ÷ Greenland (as drawn on Mercator)** | **0.92×** | shoelace over the *projected* polygons. Africa's on-screen area is only 0.92× Greenland's — i.e. **Greenland genuinely looks BIGGER than Africa on this map.** That is the hook, and it is stronger than "they look similar." |
| Greenland's inflation | **16.2×** | measured by the composition itself at render time: projected area at its real latitude ÷ projected area of the same polygon transported to the equator. This is what the on-screen counter counts down from. (A first scratch pass said 14.8× because it normalised against *Africa's own* inflation — Africa spans 35°N–35°S, so it is not an unbiased 1.0 baseline. 16.2× is the equator-referenced truth, and code and screen agree on it.) |
| Canada / Russia inflation | **≈4.0× / ≈4.5×** | 1/cos²(lat) at their centroids — not shown as numbers, only *seen* deflating |

Areas shown on screen use the **authoritative** figures (2.2M / 30.4M km²); the polygons are the
*picture*, the figures are the *truth*, and the two agree to within 3%.

## Beat sheet

| time | beat | on screen | VO |
|---|---|---|---|
| 0.0–4.2 | **HOOK** | Frame 0 FULLY composed — the payoff already on screen: a **ghost outline** of map-sized Greenland still up north, and the **true-size Greenland** already shrunken down onto Africa, dwarfed, with the **14×** stamp. Title over the top. | "The map on your wall is lying to you." |
| 4.2–13.2 | **SETUP** | **THE REWIND:** true-size Greenland flies back north and *re-inflates* into the ghost — the map heals to the one everyone knows. Greenland + Africa highlighted; chips show their **on-screen** areas: Greenland reads *bigger*. The graticule's parallels visibly spread apart as they climb north — the distortion, drawn. | "On this map, Greenland looks bigger than Africa." / "Mercator stretches the world more and more the further you get from the equator." |
| 13.2–17.2 | **QUIZ** | PauseCard — "how many Greenlands fit inside Africa?" | "Pause. How many Greenlands actually fit inside Africa?" |
| 17.2–33.6 | **REVEAL** | Greenland **detaches** and slides down to the equator. As it travels, it **shrinks** — because we re-project its real coordinates at every frame, not because anyone keyframed a scale. A live counter tracks its size on the map: **×15 → ×1**. It lands on Africa: tiny. Areas resolve to 2.2M vs 30.4M km²; the **14×** stamp lands. | "Watch what happens when we slide Greenland back down to the equator." / "It shrinks. And shrinks. Down to its real size." / "Two million square kilometres, against Africa's thirty million." / "Africa is fourteen times bigger." |
| 33.6–39.0 | **TWIST** | It isn't just Greenland: **Canada and Russia** tear off the north and slide to the equator too, shrinking to 4.7× / 4.4× smaller. The entire top of the map deflates. | "And it's not just Greenland. Canada and Russia are blown up too." |
| 39.0–42.0 | **LOOP** | Canada + Russia fly back north and re-inflate; Greenland **stays** shrunken on Africa; title fades back — **last frame == frame 0**. No CTA. | "The further from the equator, the bigger the lie." |

## The bug this short paid for (and the rule it buys)

The first render moved Greenland by simply **adding a lat/lon offset to every vertex** — the obvious
implementation, and it is *wrong in a way that looks plausible*. Mercator's **x depends only on
longitude**, so a country dragged south keeps every degree of its 61° longitude span while its
height compresses. Greenland arrived at the equator **squashed and far too wide**, still covering
half of Africa — and the counter cheerfully read ×1.0 next to it. The picture contradicted the
number, and the number was right.

The real fix is the **convergence of the meridians**: one degree of longitude is 111 km · cos(lat) of
ground, so as a vertex travels from φ to φ′ its east-west offset from the country's centre must
rescale by **cos(φ)/cos(φ′)**. With that, the country keeps its true ground dimensions the whole way
down and *arrives* at its true size. The shrink is still emergent — it falls out of real spherical
geometry — never a scale I tuned until it looked right.

**Rule for the niche:** on a map, *translation is not a translation*. Any time a shape moves across
latitudes, the projection has to be re-derived, not offset.

## Production notes

- **Frame-0 rule.** Frame 0 is the END of the reveal (Greenland already tiny, on Africa, 14× stamped).
  The SETUP *rewinds* that — Greenland flies home and re-inflates — and the REVEAL re-plays it. So the
  loop closes for free: the end of the reveal simply *is* frame 0 again. (Proven on short-10.)
- **What the twist animates, the loop must restore.** Canada + Russia are the only things the twist
  moves, and they go back north during the LOOP. Greenland does not — it belongs to frame 0.
- **The shrink is emergent.** `shiftTo()` gives the (dLat, dLon) that carries a country's centroid to a
  target; the shot interpolates **the shift**, and every intermediate frame is a true Mercator
  projection of a true position. The counter reads `inflation()`, measured off the projected polygon.
- **No engagement-CTA outro** (locked 2026-07-12). Ends on the payoff; the loop is the ending.
- Colors: gold `#f5d76e` = Greenland (the liar), teal `#5ec8c0` = Africa (the truth), violet = the twist.
