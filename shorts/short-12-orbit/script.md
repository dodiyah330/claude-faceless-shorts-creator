# short-12 · Physics — "Astronauts Aren't Weightless. They're Falling."

Opens the **physics** niche (IDEAS #11). New niche lib: `lib/orbit.tsx` — a real globe and
**real numerically-integrated trajectories** (velocity Verlet under Newtonian gravity).

**The idea (Newton's cannonball).** Fire a cannon horizontally off a tower, faster and faster.
Slow → it lands. Faster → it lands further. Fast enough → the arc bends away as fast as the
Earth curves, and it never lands. *That* is orbit. Astronauts aren't outside gravity — they
are falling, and missing.

---

## The physics, recomputed (not trusted)

From `GM = 3.986004418e14`, `R = 6371 km`, `h = 400 km` — and **every one of these is derived
by the composition at render time**, from those three constants, using the same functions that
draw the arcs. The screen cannot disagree with the script.

| quantity | value | how |
|---|---|---|
| gravity at the surface | **9.820 m/s²** | `GM/R²` |
| gravity at 400 km | **8.694 m/s²** | `GM/(R+h)²` |
| …as a share of ground gravity | **88.5%** | ratio |
| circular orbital speed | **7.673 km/s** | `√(GM/r)` |
| period | **92.4 min** | `2π√(r³/GM)` — real ISS ≈ 92.7 min, so the sim is honest |
| it falls, in 1 second | **4.347 m** | `½gt²` |
| it travels, in 1 second | **7.67 km** | `v·t` |
| the Earth curves away, over that 7.67 km | **4.347 m** | sagitta of `r = R+h` |

The last two lines being **identical** is the video.

### One brief correction to the brief

The brief said the **Earth's surface** curves away 4.35 m over 7.67 km. It doesn't — the ground
(`r = 6371 km`) is more sharply curved than that, and drops **4.62 m** over the same chord.

The number that *is* exactly 4.347 m is the sagitta of the **shell the station is on**
(`r = R + h = 6771 km`) — and that shell is precisely what "the Earth curving away beneath it"
means for something at altitude: it's the surface of constant height above the ground, so
keeping pace with it is exactly what holds the station's altitude steady. The equality isn't a
lucky coincidence someone measured; it *is* the definition of a circular orbit, which is why it
comes out exact rather than merely close.

So `sagitta()` in `lib/orbit.tsx` takes the radius as an argument, the shot passes `R + h`, and
the VO says *"the Earth curves away by exactly the same amount"* — it never names a second,
different number. **The claim on the track equals the number on the screen.**

### The speed ladder — simulated, not asserted

| fired at | what the integrator does | downrange |
|---|---|---|
| 3 km/s | **lands** | 8.67° — 960 km |
| 5 km/s | **lands** | 17.54° — 1,950 km |
| 7 km/s | **lands** — a quarter of the way to the far side, and it *still* comes down | 46.55° — 5,180 km |
| **7.673 km/s** | **never lands — the arc closes** | ∞ |

These are the numbers the composition **prints on the ladder**, because it integrates these arcs
itself and measures them. They are not transcribed here from a scratch calculation — an early
draft of this file said 970 km for the 3 km/s shot (from a rounded 8.7°); the code, integrating
properly, said 8.67° = 960 km. The code won.

At dt = 2 s the orbital radius stays within **6771.000–6771.017 km** across a full revolution —
17 metres of drift over 40,000 km. **The ring closes because the physics closes it.**

---

## Beat sheet (~42s)

| time | on screen | VO |
|---|---|---|
| **0.0–4.9 · HOOK** | Frame 0 fully composed: the **closed orbit already drawn** around a real globe, the station riding it, a huge red arrow from it pointing **DOWN** at Earth's centre, payoff stat in the subtitle. | "Astronauts aren't weightless. They're falling." · "They just keep missing the Earth." |
| **4.9–13.6 · SETUP** | **THE REWIND** — the orbit un-draws back to the launch point, the camera pushes in (1.0 → 2.8) on the tower, Newton's cannon appears. Fire at **3 km/s** → arcs over the limb and lands. Fire at **5 km/s** → lands further. Both arcs stay on the canvas. | "Newton figured this out with a cannon." · "Fire it slow, and the ball lands." · "Fire it faster, it lands further away." |
| **13.6–17.4 · QUIZ** | PauseCard. | "Pause. What if you fire it fast enough?" |
| **17.4–29.6 · REVEAL** | The ladder lights rung by rung on the named speed. On **"Seven"** the 7 km/s shot fires and the **camera pulls back** (2.8 → 1.0) to keep up — it clears 5,180 km and *still lands*. Then **7.673**: the arc wraps the globe and **closes**. The station appears on it. ORBIT stamp. | "Three kilometres a second. Five. Seven." · "At seven point seven, it never lands." · "It just falls around the planet. That's orbit." |
| **29.6–40.7 · TWIST** | Cannon, arcs and ladder clear away. The gravity chip lands: **8.69 m/s² — 88.5% of ground**. Then the equality panel: **falls 4.35 m** · **=** · **Earth curves away 4.35 m**. | "Up there, gravity is still nearly ninety percent as strong." · "Every second, the station falls four point three metres." · "And the Earth curves away by exactly the same amount." |
| **40.7–42.0 · LOOP** | Panel and chip fade; the title fades back over the still-orbiting station and its DOWN arrow → **last frame == frame 0**. | — (no CTA) |

**VO budget:** 90 words. Longest line is 10 words in 3.4–3.6 s ≈ **2.8 wps** — inside the
2.7 wps + slack rule, so no line should need an audible atempo squeeze.

---

## Production notes

- **The rewind earns the loop** (short-10/11's trick, third outing). Frame 0 *is* the end of the
  reveal. The setup rewinds it; the reveal replays it; the loop closes for free.
- **The camera is part of the payoff** (short-11's lesson). At world scale a 3 km/s hop is a
  57-px scratch on the limb — unreadable. The setup pushes in 2.8×, anchored on the launch point;
  the 7 km/s shot then *outruns the frame* and the camera pulls back to keep it, landing at 1.0
  exactly when the orbit needs the whole globe. The pull-back is the reveal.
- **One animated quantity per spoken number** (short-10's retiming lesson). Each rung of the
  ladder lights on its own word; the arcs fly on their own words; the "=" punches on *"exactly"*.
- **The globe is real** — the same Natural Earth 110m outlines `lib/map.tsx` uses, re-projected
  orthographically onto the disc (near hemisphere only, each visible run closed back along the
  limb so landmasses still fill against the silhouette).
- **The orbit hugs the globe, and that's the point.** 400 km is 6.3% of Earth's radius, so the
  ring sits ~24 px off a 370 px globe. Every cartoon puts the ISS way out in space; ours is
  true-scale, and the fact that it's *skimming the surface* is half the argument.
- **The orbit plane is the screen plane** — geometrically a polar orbit. The real ISS is inclined
  51.6°, which is the same circle rotated: same speed, same period, same fall per second. We
  never claim an inclination.
