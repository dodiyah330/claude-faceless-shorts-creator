# TSX Shorts — Idea Bank

Fully-synthetic vertical shorts (1080×1920, ~40s) rendered 100% from Remotion TSX.
No footage, no stock, no screen recordings — every pixel is code, so every video is
repeatable, editable, and brandable after the fact.

## The filter: when does TSX win?

A niche works when **the content's native representation is a diagram, board, UI, or
chart** — the value must *live in the drawing*, not in a face or real-world footage.
Test for any idea: *"If I drew this on a whiteboard, would the drawing alone carry the
video?"* If yes, TSX renders a cleaner whiteboard than any human can draw, animated.

TSX loses when the point is photographic proof, human emotion, or real-world texture.
Don't fight that — those stay long-form/talking-head territory.

## Universal beat grammar (every short, every niche)

```
HOOK (0–3s)    frame 0 fully composed, payoff/trap already VISIBLE, first words on screen
SETUP (3–12s)  show the situation fast — build the tension the hook promised
QUIZ (opt.)    "pause — can you solve it?" card (~2.5s). Drives comments + rewatches
REVEAL (12–30s) the payoff in 2–4 steps, each step synced to VO words
TWIST (30–38s)  reframe / bonus insight — the "share this" moment
LOOP (38–42s)   last frame visually rhymes with frame 0 → seamless replay
```

Retention devices that transfer across niches:
- **Pause-quiz card** — pose a solvable challenge (chess move, math answer, spot-the-bug)
- **Live counter** — numbers ticking up while narrating (money, probability, iterations)
- **Before/after morph** — same canvas, wrong→right transition
- **Progress bar** — thin top bar; signals "this is short, stay"
- **Word-pop captions** — always on, big, inside safe areas
- **The rewind** — visibly undo the board/canvas to a decision point ("but right HERE…")

## Niches (ranked by fit × demand × repeatability × build cost)

| # | Niche | Why TSX wins | Lib needed | Series examples |
|---|-------|--------------|-----------|-----------------|
| 1 | **Chess traps & tactics** | board = pure SVG; pause-quiz native to the niche; infinite puzzle supply | `lib/chess.tsx` ✅ | 4-move mate punish · Fried Liver · Stafford Gambit traps · endgame rules (opposition) · "why grandmasters resign here" |
| 2 | **Math tricks & visual proofs** | the aha IS the animation; micro-3Blue1Brown | `lib/math.tsx` (number line, grid, equation morph) | ×11 in your head · 20% loss ≠ 20% gain · 0.999…=1 · Pythagoras rearrangement · why you can't divide by zero |
| 3 | **Probability & paradoxes** | simulations impossible to film, trivial to render | `lib/prob.tsx` ✅ | Monty Hall doors · birthday paradox counter · gambler's fallacy coin run · false-positive medical test |
| 4 | **Algorithms visualized** | sorting races / pathfinding are hypnotic + educational | `lib/algo.tsx` (bar array, grid walker) | bubble vs quick sort race · how A* finds the path · binary search "20 questions" · hash collisions |
| 5 | **Dev / AI tips** | VS Code, terminal, browser clones ALREADY BUILT | `lib/vscode.tsx` ✅ `lib/browser.tsx` ✅ | git reflog saves you · the regex that parses anything · 5 VS Code shortcuts · prompt patterns that 10x Claude |
| 6 | **Excel / Sheets tricks** | a spreadsheet is a table — pixel-perfect clone, huge audience | `lib/sheet.tsx` | Flash Fill (Ctrl+E) · XLOOKUP kills VLOOKUP · $ absolute refs · pivot in 10 seconds |
| 7 | **Money math** | compound curves, fee erosion — charts ARE the story | `lib/chart.tsx` ✅ | 1% fee eats 24% of retirement ✅ (short-10) · rule of 72 · minimum-payment trap · latte math done honestly |
| 8 | **Regex / SQL visually** | live match-highlighting over text is pure TSX | code panel + highlighter | email regex decoded char by char · JOIN types as venn-tables · the query that finds duplicates |
| 9 | **Keyboard shortcut mastery** | animated keycaps + instant result split | `lib/keyboard.tsx` | Windows/Mac power moves · VS Code multi-cursor · Excel navigation |
| 10 | **UX dark patterns exposed** | render the manipulative UI itself, annotate it | browser lib ✅ | fake countdown timers · confirm-shaming · roach-motel subscriptions |
| 11 | **Physics intuitions** | frame-based animation = physics sim for free | `lib/orbit.tsx` ✅ | why astronauts float (falling!) ✅ (short-12) · escape velocity · why the Moon doesn't fall · why rockets go sideways · time dilation twin clocks |
| 12 | **Geography / maps** | real projections over real outlines — the distortion is computed, not drawn | `lib/map.tsx` ✅ | the Mercator lie ✅ (short-11) · only country inside a country · straightest border story · time-zone weirdness |
| 13 | **Music theory** | piano roll / fretboard as UI | `lib/piano.tsx` ✅ | the 4 chords in every hit ✅ (short-9) · why the tritone sounds evil · circle of fifths in 40s · why sad songs are minor |
| 14 | **Logic riddles** | minimal shapes + pause card | shorts kit only | wolf-goat-cabbage · 2 doors 2 guards · coin weighing |
| 15 | **"Numbers that don't feel real"** | scale zooms (million vs billion) | counters + zoom | million vs billion seconds · stadium of rice doubling · your heartbeats vs the sun's |
| 16 | **Cybersecurity awareness** | fake phishing UI in the browser clone — annotated | browser lib ✅ | the URL that isn't paypal.com ✅ (short-8) · `rn`→`m` lookalikes · why "123456" falls in 0.02s (live counter) · QR code scams |
| 17 | **Language / grammar** | typography morphs (affect→effect) | shorts kit only | commonly confused words · etymology trees · silent-letter history |
| 18 | **Poker / game odds** | cards are just rounded rects; odds bars | `lib/cards.tsx` | why you fold pocket jacks · pot odds in 30s · the math of bluffing |

## The queue (agreed 2026-07-10)

Goal: multiple niches, one per short, proving the FLOW (script → beats → linked shots
→ full video). Style/brand per-niche comes later. **The flow is now the `/make-short` skill.**

1. **short-1 · Chess** — "The 4-Move Checkmate — Punished" ✅ (voice + SFX audition)
2. **short-2 · Math** — "The ×11 Trick" ✅ (voice + SFX + 4 music-bed auditions)
3. **short-3 · Algorithms** — "Bubble vs Quick: The Race" ✅ (`lib/algo.tsx`, real instrumented sorts)
4. **short-4 · Dev tip** — "Undo Any Git Mistake" (git reflog) ✅ (`Short4Reflog`; persistent `lib/terminal.tsx` canvas — no new niche lib; git-accurate reset→reflog→restore session; voice + SFX audition). Added an additive per-line `hl` highlight to `lib/terminal.tsx`.
5. **short-5 · Probability** — "Monty Hall, Finally Intuitive" ✅ (`lib/prob.tsx`: `Door`/`Brace`/`ProbChip`/`TallyGrid`/`BigPct` + a REAL seeded `montyTrials`; the persistent 3-door canvas rewinds→annotates→collapses the 2/3 onto one door, then a live 100-game sim converges to SWITCH 66 / STAY 34; voice + SFX audition at −15.5 LUFS). Seeds the probability series: **birthday paradox · gambler's-fallacy coin run · false-positive medical test** all reuse `lib/prob.tsx`.
6. **short-6 · Excel** — "Excel Reads Your Mind" (Flash Fill / Ctrl+E) ✅ (`lib/sheet.tsx` built themeable; voice + SFX audition). Seeds an Excel series (XLOOKUP · $ absolute refs · pivot-in-10s) — all reuse `lib/sheet.tsx`, none built yet.
7. **short-7 · Kids story** — "Little Pip" ✅ — a NEW SUB-TYPE, not a TSX niche: 9 AI-generated 9:16 stills ken-burned in Remotion, over an emotion-tagged **ElevenLabs v3** VO (warm → playful → scared → crying → whisper → joyful). Built to stress-test the v3 delivery tags across a full emotional arc. Voice + SFX + final render. (This took the slot the Excel series had penciled in, so Excel's follow-ups slide to a later number.)
8. **short-8 · Cybersecurity** — "The URL That Isn't PayPal" ✅ (`Short8Phish`; reuses `lib/browser.tsx` — no new niche lib). One persistent browser canvas: the reveal is a **camera lift into the browser's own URL bar**, not a cut, with the login page dimmed but still behind it. Annotations live *inside* the URL string as self-positioned children of each segment, so nothing needs measured coordinates and the zoom magnifies them with the text. Voice + SFX audition at −16.1 LUFS.
   - **Fact-check that changed the script:** the planned capital-`I`/lowercase-`l` homoglyph (`paypaI.com`) **does not work in a URL bar** — the WHATWG URL spec's domain parser ASCII-lowercases the host, so it renders as `paypai.com` and the dot on the `i` gives it away. That trick is real only in link text / display names / sender fields. Replaced with the **subdomain trick** (`paypal.com.secure-login.net/login` → the real site is `secure-login.net`), which is the most common structure in actual phishing, is all-ASCII, and survives every browser defense because nothing about it is malformed. Rule taught: ignore everything after the first `/`, read right-to-left, the real site is the last two parts.
   - Added two **additive** props to `lib/browser.tsx` (`url` now accepts a ReactNode, rendered unclipped so annotations can escape the pill; `uiScale` sizes the chrome for vertical) plus a z-index so chrome paints above the page, as a real browser does. Existing 16:9 shots pass strings and default `uiScale: 1` — unchanged.
   - Seeds the **cybersecurity series**: `rn` → `m` (`arnazon.com` — the lookalike that *does* survive lowercasing) · "123456" falls in 0.02s (live cracking counter) · QR-code scams (the URL you can't read at all).
9. **short-9 · Music theory** — "The 4 Chords In Every Hit" ✅ (`Short9Chords`; new niche lib `lib/piano.tsx`). One persistent keyboard: the chords light and decay on it, six hit songs stack up over the loop, and the **twist rotates the SAME four chips in place** to vi–IV–I–V — the visual argument being that nothing new arrived, they just re-ordered.
   - **First short whose audio is MUSIC, not sound design.** New engine tool `tools/gen_chords.py` synthesizes the chords **deterministically** — equal temperament, A4 = 440, additive harmonics with a soft attack and long decay (Rhodes-ish, calmer under a voice than a grand). `gen_music.py` prompts a generative Music API for ambient beds and *cannot* deliver "A minor, exactly, at concert pitch" — and in a music-theory video an out-of-tune chord is a factual error. Exact pitch, exact frame, zero API cost, identical every run. The four one-shots (`piano-c-maj/g-maj/a-min/f-maj`) live in the SFX library, so `mix_sfx.py` places them like any other cue and the whole music series reuses them.
   - **One source of truth for timing:** `beats.json.piano.schedule` lists every chord press in global seconds; the TSX lights keys from it AND `sfx-plan.json` places the audio from it. Sound cannot drift from picture.
   - Facts verified: I–V–vi–IV = **C–G–Am–F** in C major; the twist is the *documented* rotation **vi–IV–I–V** (Am–F–C–G, the "sensitive female chord progression") which powers a genuinely different song set (Africa · Apologize · One of Us). We name song titles (not copyrightable) and play only the **chords** (progressions aren't copyrightable) — **no melody is ever reproduced**.
   - Seeds the **music series** (all reuse `lib/piano.tsx` + `gen_chords.py`): why the tritone sounds evil · the circle of fifths in 40s · why sad songs are minor (major 3rd → minor 3rd).

10. **short-10 · Money math** — "The 1% Fee That Eats 24% Of Your Retirement" ✅ (`Short10Fees`; new niche lib `lib/chart.tsx`). One persistent chart: two compound curves, the shaded gap between them, a live counter, and a share-bar. Opens the money-math niche (#7).
   - **Math verified before scripting, and re-verified BY the render.** $500/mo · 40y · monthly compounding: 7% net → **$1,312,407**, 6% net → **$995,745**, gap **$316,661 = 24.13%** of the bigger pot. `lib/chart.tsx`'s `contribSeries()` regenerates the curves at render time from the same formula the beats file states, so the drawn line, the head labels and the counter **cannot** disagree with each other. The title claims what the screen shows: "eats 24%".
   - **THE RETIME LESSON (new, and it generalizes).** The estimates grew the curves across the whole reveal — but the real ElevenLabs times have him naming *both pot values at 21.3s*, while the curves would still have been mid-growth showing ~$1.0M / ~$780K. **One animated quantity per spoken number, each landing on its own word:** curves land at 21.6 (under "one point three one million"), the counter runs separately 26.0→28.9 (under "three hundred sixteen thousand dollars"). Retiming isn't nudging cues by 0.2s — sometimes it means *splitting one animation into two*.
   - **The rewind earns the loop for free.** Frame 0 is the finished chart; the SETUP rewinds it to year 0; the REVEAL re-draws it. So the end of the reveal IS frame 0 again — the loop closes with no extra choreography, and the "undo the canvas" retention device does the setup's work.
   - Two smaller wins worth reusing: a **deposits line** ($240K, dashed) draws in during the setup so the chart is never an empty box for 9 seconds; and any label that lands on a filled area needs a **plate** (red-on-red-gap was illegible).
   - Seeds the **money series** (all reuse `lib/chart.tsx`): rule of 72 · the minimum-payment trap (balance curves + interest-as-share-of-payments `ShareBar`) · latte math done honestly · "your fee gap is bigger than everything you deposited" (the $240K line is already on screen).

11. **short-11 · Geography** — "The Map Lied To You" (Mercator) ✅ (`Short11Map`; new niche lib `lib/map.tsx` + `lib/geo/world.ts`). One persistent world map: Greenland **tears off the north and slides to the equator, shrinking as it goes**, and lands dwarfed inside Africa. Opens the geography niche (#12).
   - **The map's lie is COMPUTED, not drawn.** `lib/map.tsx` implements the actual Mercator formula over real Natural Earth 110m outlines (public domain, baked into `lib/geo/world.ts`), so the distortion on screen is one *our own code produces*, exactly as a wall map produces it. The on-screen counter (×16.2 → ×1.0) is **measured by shoelace off the projected polygon every frame**. Same ethos as `montyTrials` and `gen_chords.py`: never assert a number the code could compute.
   - **Facts, each cross-checked two ways.** True: Africa is **14×** Greenland (30.37M vs 2.17M km²; our rendered polygons independently give 13.6× — the 3% gap is 110m generalization). As *drawn on Mercator*: Africa's on-screen area is only **0.92×** Greenland's — i.e. **Greenland genuinely looks BIGGER than Africa**, which is a far stronger hook than "they look similar", and we only found it by measuring the polygons we were already rendering.
   - **THE BUG, and the rule it buys (new, and it generalizes to every map short).** Moving a country by *adding a lat/lon offset to every vertex* is wrong, and wrong in a way that renders plausibly: Mercator's **x depends only on longitude**, so a country dragged south keeps its full longitude span while its height compresses — Greenland arrived at the equator **squashed and far too wide**, still covering half of Africa, while the counter next to it read ×1.0. The fix is the **convergence of the meridians**: a vertex's east-west offset must rescale by **cos(φ)/cos(φ′)** as it travels, so the shape keeps its true ground size and *arrives* true-size. **On a map, translation is not a translation — the projection must be re-derived, not offset.**
   - **A camera is part of the payoff.** At world scale the true-size Greenland lands ~50px wide: technically on screen, completely unreadable. The map **pushes in 1.0→1.6× anchored on Africa**, tied to the same `slide` value, so the comparison happens close up — and the setup pulls back out for the one beat that needs the whole world ("Mercator stretches the world").
   - The rewind-earns-the-loop trick (from short-10) transferred perfectly: frame 0 is the *end* of the reveal, the setup rewinds it, the reveal re-plays it, and the loop closes for free.
   - Seeds the **geography series** (all reuse `lib/map.tsx`): the Peters/equal-area projections · the only country inside a country · the straightest border on Earth · time-zone weirdness · "your country is not where you think it is".

12. **short-12 · Physics** — "Astronauts Aren't Weightless. They're Falling." ✅ (`Short12Orbit`; new niche lib `lib/orbit.tsx`). Newton's cannonball, actually simulated. Opens the physics niche (#11).
   - **The arcs are INTEGRATED, not drawn.** `lib/orbit.tsx` is velocity Verlet under Newton's law of gravitation in SI units. Fire the same cannon at 3 / 5 / 7 km/s and it lands at 960 / 1,950 / 5,180 km downrange *because the math lands it*; fire it at 7.673 and the arc closes. Verlet is symplectic, so the check is brutal and it passes: **the orbital radius stays within 6771.000–6771.017 km across a full revolution — 17 m of drift over 40,000 km.** The ring closes because the physics closes it. (Naive Euler would have spiralled in and quietly faked a decaying orbit.)
   - **The globe is real too** — the same Natural Earth 110m outlines `lib/map.tsx` uses, re-projected *orthographically* onto the disc: keep the near hemisphere (z > 0), and close each visible run back along the limb so landmasses still fill against the silhouette. `lib/geo/world.ts` has now paid for itself twice.
   - **THE FACT-CHECK THAT CHANGED THE SCRIPT (and it was the whole video).** The brief said: it falls 4.35 m in one second, moves 7.7 km sideways, and *the Earth's surface curves away 4.35 m over that distance* — identical. The equality is real, but that sentence is **not**: the ground (r = 6371 km) is more sharply curved and drops **4.62 m** over a 7.67 km chord, a 6% error in the one number the entire video rests on. What *is* exactly 4.347 m is the sagitta of the **shell the station orbits on** (r = R + h = 6771 km) — and that shell is precisely what "the Earth curving away *beneath it*" means for something at altitude, because it's the surface of constant height above the ground. So `sagitta()` takes the radius as an argument, the shot passes `R + h`, and the VO says "the Earth curves away by **exactly the same amount**" — never naming a second, different number. **The claim on the track equals the number on the screen.** Rule: when a video's payoff is an equality, check *which two things* are equal, not just that they're equal.
   - **Gravity up there is 88.5% of ground level, not 89%.** Recomputed rather than trusted; the screen prints `8.69 m/s² — 88.5% of ground` and the VO says "nearly ninety percent". Same discipline caught the 3 km/s shot: an early beats.json said 970 km (from a rounded 8.7°); the integrator says 8.67° = **960 km**, and the code won.
   - **The orbit HUGS the globe, and that is half the argument.** 400 km is 6.3% of Earth's radius, so the ring sits ~23 px off a 330 px globe. Every cartoon parks the ISS far out in space; ours is skimming the surface — which is what makes "it's falling" even sayable.
   - The rewind-earns-the-loop trick (short-10/11) and the camera-is-the-payoff lesson (short-11) both transferred, and the camera one got sharper: the setup pushes in 2.8× on the tower so a 3 km/s hop isn't a 57-px scratch on the limb, and then **the 7 km/s shot literally outruns the frame and the camera pulls back to keep up**, arriving at 1.0 exactly when the orbit needs the whole globe. The pull-back *is* the reveal.
   - One new SFX recipe: `launch-thump` (a muffled mortar/rocket push, deliberately NOT a war-film cannon crack — brand §10's calm register). Audition at −15.6 LUFS.
   - Seeds the **physics series** (all reuse `lib/orbit.tsx`, which already exports `vEsc`/`period`/`gAt`): escape velocity · why the Moon doesn't fall · why rockets go sideways, not up · geostationary orbit · tides.

Each short adds at most ONE new niche lib; the shorts kit (captions, hook, pause card,
progress bar) is shared by all.

## The next slate — 8 videos, 8 NEW engines (agreed 2026-07-14)

**The axis is the visual engine, not the topic.** A new topic on an existing lib proves nothing;
a new *engine* expands what the channel can physically render. After 12 shorts, every single one
is a **diagram, a UI, or a plot** — that's the honest risk, and this slate is the answer to it.

**Engines already claimed:** board of discrete pieces (chess) · equation/number-line morph (math) ·
discrete objects + Monte Carlo (prob) · instrumented array (algo) · UI clone (terminal/vscode/
browser/sheet) · keyboard (piano) · plotted curve (chart) · projection cartography (map) ·
sphere + integrated trajectory (orbit) · AI stills + Ken Burns (story) · layered collage (vox).

**Never rendered by this channel:** many independent agents · a lattice coming alive · a settling
network · a perceptual proof · refracting light · text as the subject · a mechanism in cutaway.

| # | Video | Niche | New engine | The motion language nothing in the repo can do |
|---|-------|-------|-----------|-----------------------------------------------|
| 13 | **The Traffic Jam With No Cause** | emergence | `lib/agents.tsx` — car-following model (IDM) | **Mass motion.** 22+ independently simulated cars; a jam crystallises from one brake tap and travels *backward* through them. Cannot be keyframed — only simulated. Extends the spine: Monte Carlo → Mercator → Verlet → **agent-based model**. (Real experiment: Sugiyama 2008.) |
| 14 | **These Two Squares Are The Same Colour** | perception | `lib/illusion.tsx` — shading, masks, proof-bridges | **Perceptual proof.** A camera can only *assert* it; our code *proves* it by filling both squares from ONE hex constant, live, on screen. The single best argument for TSX that exists. |
| 15 | **One Sentence. Seven Meanings.** | language | `lib/kinetic.tsx` — typographic choreography | **Text as the subject.** No diagram at all — "I never said she stole my money," stressed on each of 7 words, meaning flipping each time. |
| 16 | **The Pool Is Deeper Than It Looks** | optics | `lib/optics.tsx` — real Snell's law ray tracer | **Light as geometry.** Rays bending at the surface, the eye back-projecting them to a false bottom. The illusion is *computed* from n = 1.33, not drawn. |
| 17 | **Why Ice Floats** | chemistry | `lib/lattice.tsx` — molecular packing | **Matter organising itself.** Molecules jostling in liquid, then snapping into a hexagonal lattice that takes up *more* room. |
| 18 | **R = 2. Ten Rounds. The Whole Room.** | networks | `lib/graph.tsx` — force-directed + contagion | **A network settling and igniting.** Nodes finding their own positions, colour sweeping the graph like fire — then R = 0.9 and the same sim dies in four rounds. |
| 19 | **How A Watch Keeps Time** | mechanism | `lib/mech.tsx` — cutaway mechanism | **Machinery in cross-section.** The escapement: gear, pallet, balance wheel — the tick you hear is a tooth escaping, once, and you *watch* it. (SFX becomes the content.) **Most expensive build here — cut this first if velocity matters.** |
| 20 | **Same Voters. Three Maps. Three Winners.** | civics / math | `lib/district.tsx` — partitioning grid | **A grid re-cut.** 50 voters, unchanged; redraw the boundaries three ways and the winner flips — and the code *counts* each district, so nothing is asserted. **The only politically-loaded one: keep it factual and party-neutral, by choice not by accident.** |

**Order: 13 → 14 → 15 first.** That trio is deliberately maximally spread — a swarm, a static
perceptual trick, and pure text. If those land, the channel has proven it isn't secretly a
"diagram channel".

Every number in that table is still **unverified** and must go through the usual pass before
scripting (the percolation threshold, n = 1.33, the seven-meanings example, ice densities). See
`[[shorts-verify-the-equality]]`: when the payoff is an equality, check *which two things* are
equal, not just that they are.

## The other track: `ai-video/` (generative, NOT TSX)

Agreed 2026-07-14. Real AI-generated video (fal.ai via `tools/gen_clip.py`) — the blue-man
recurring character, motivational, kids story in motion, realistic story, gym-aesthetic workout.
**Kept in its own workspace so the two pipelines never contaminate each other's skills.** Plan and
the character-consistency method live in `ai-video/IDEAS.md`.

**Outros — no engagement-CTAs (locked 2026-07-12).** Ending on a comment-bait question
("what should I race next?", "comment your pick") is banned — it reads dated. End on
the PAYOFF and let the visual LOOP dissolve back into the intro (last frame == frame 0); the
loop-into-intro IS the ending. If a clean loop isn't possible, just end — no filler, no dead
tail. (short-1/2/3 shipped with the old comment-bait outros; leave those as historical record,
but never author a new one.) The /channel-short track locked the same rule 2026-07-10.

## Per-short artifact contract (what /make-short will formalize)

```
shorts/short-N-<niche>/
  script.md      — hook, VO lines with start/end seconds, beat sheet, visual notes
  beats.json     — machine contract: format, vo[], beats[], niche-specific timeline
remotion/src/shots/short-N/
  ShortN<Name>.tsx — ONE composition (1080×1920), beats as <Sequence>s over a
                     persistent canvas, captions + progress bar as global layers
```

Voice comes later by design: VO timings are ESTIMATED (~2.8–3.3 words/sec) now; when
Record or TTS-generate the track, transcribe (AssemblyAI / vidtsx_transcribe)
and swap the word-timing map — shots retime, nothing rebuilds.
