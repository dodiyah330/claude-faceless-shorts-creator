import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, StatChip, Stamp, prog } from '../../lib/shorts';
import {
  Atmosphere,
  Cannon,
  EqualityPanel,
  Globe,
  GravityArrow,
  Impact,
  ISS_ALT,
  R_EARTH,
  Sat,
  SpeedLadder,
  Trajectory,
  gAt,
  integrate,
  makeView,
  period,
  sagitta,
  satPos,
  vCirc,
} from '../../lib/orbit';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short12Orbit',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e'; // the orbit — the speed that never lands
const RED = '#ff6b6b'; // gravity, and the shots that hit the ground
const ORANGE = '#ff8f6b'; // the failed arcs
const SPACE = '#070b12';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE PHYSICS — every number below falls out of GM, R and h (lib/orbit.tsx). The chips, the
// ladder and the equality panel all read from the SAME functions that integrate the arcs, so
// the screen cannot contradict itself.
// =============================================================================
const R_ISS = R_EARTH + ISS_ALT;
const G_SURF = gAt(R_EARTH); // 9.8203 m/s²
const G_ISS = gAt(R_ISS); // 8.6943 m/s²
const PCT = (G_ISS / G_SURF) * 100; // 88.5% — NOT weightless
const V_ORB = vCirc(R_ISS); // 7672.6 m/s
const T_ORB = period(R_ISS); // 5544.9 s = 92.4 min (real ISS ≈ 92.7 — the sim is honest)

// THE PAYOFF, and the reason this video exists. In one second it falls ½gt²; in that same second
// it travels v·t sideways, and the shell it is orbiting on curves away beneath it by exactly the
// sagitta of that chord. These two come out EQUAL — necessarily, because that equality is what a
// circular orbit *is*. We compute both and let the "=" be earned.
//
// (Careful: the sagitta must be taken on r = R + h, the shell the station is on — not on the
// GROUND, which is more sharply curved and drops 4.62 m over the same chord. "The Earth curving
// away beneath it" means the surface of constant altitude, and that is r = R + h.)
const FALL_1S = 0.5 * G_ISS * 1 * 1; // 4.347 m
const CURVE_1S = sagitta(R_ISS, V_ORB * 1); // 4.347 m
const SIDE_1S = V_ORB / 1000; // 7.67 km

// THE INTEGRATOR. Same cannon, same tower, four initial speeds. Nothing here is keyframed: the
// first three land because Newton's law lands them, and the fourth doesn't because it can't.
const T3 = integrate(R_ISS, 3000, 1200, 2);
const T5 = integrate(R_ISS, 5000, 1200, 2);
const T7 = integrate(R_ISS, 7000, 1400, 2);
const TORB = integrate(R_ISS, V_ORB, T_ORB * 1.004, 4); // 0.4% past one period, so the ring closes onto its own tail

const km = (v: number) => {
  const n = Math.round(v / 10) * 10;
  return n >= 1000 ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, '0')}` : String(n);
};

// =============================================================================
// THE VIEW
// The orbit HUGS the globe, and that is not a compromise — it is half the argument. 400 km is
// 6.3% of Earth's radius, so the ring sits ~23 px off a 370 px globe. Every cartoon parks the
// station far out in space; ours is skimming the surface, which is why "it's falling" is even
// sayable.
// =============================================================================
const V = makeView(540, 790, 330);
const LAUNCH: [number, number] = [V.cx, V.cy - (R_EARTH + ISS_ALT) * V.m2px]; // top of the tower

// THE CAMERA (short-11's lesson: a camera is part of the payoff). At world scale a 3 km/s hop is
// a 57-px scratch on the limb — technically on screen, unreadable. So the setup pushes IN on the
// tower; then the 7 km/s shot literally outruns the frame and the camera pulls back to keep up,
// arriving at 1.0 exactly when the orbit needs the whole globe. Frame 0 is at 1.0, so the loop
// closes for free.
const zpt = (x: number, y: number, z: number): [number, number] => [
  LAUNCH[0] + (x - LAUNCH[0]) * z,
  LAUNCH[1] + (y - LAUNCH[1]) * z,
];

// =============================================================================
// CUES — RETIMED to the REAL ElevenLabs word times (vo.gen.ts). Every cue below now fires on the
// word that describes it, and nothing fires before the word it illustrates. The estimates were
// wrong in the usual way: he says "Five." 0.2 s early, "Seven." 0.35 s LATE, and "exactly" a
// FULL SECOND before I had the "=" punching in — the payoff of the entire video would have
// landed on the wrong word.
// =============================================================================
const HOOK_OUT = F(4.6);
const REWIND_IN = F(5.2); // "Newton" @ 5.20 — the orbit un-draws itself back to the cannon
const REWIND_OUT = F(7.6);
const FIRE3 = F(8.1); // "Fire" @ 8.10
const LAND3 = F(10.0); // ...lands inside "lands." (9.77–10.52)
const FIRE5 = F(10.9); // "Fire" @ 10.90
const LAND5 = F(12.8); // ...lands under "further away" (12.34–13.65) — it went FURTHER
const PAUSE_FROM = F(13.6); // "Pause." @ 13.70
const PAUSE_DUR = F(3.8); // ...through "...fast enough?" @ 17.18
const RUNG1 = F(17.6); // "Three" @ 17.60
const RUNG2 = F(19.7); // "Five." @ 19.70
const FIRE7 = F(20.95); // "Seven." @ 20.94 — the shot leaves the barrel ON the word, and the
const LAND7 = F(22.35); //   camera starts running backwards to keep it in frame
const ORB_IN = F(22.5); // "seven point seven," @ 22.46 — the arc that will not come down
const ORB_CLOSE = F(24.3); // ...closes under "never lands." (23.63–24.80)
const SAT_IN = F(25.8); // "It just falls around the planet" @ 25.80
const STAMP_IN = F(27.4); // "That's orbit." @ 27.34
const TWIST_IN = F(29.8); // "Up there, gravity..." @ 29.80 — cannon and failed arcs clear away
const PCT_IN = F(31.95); // "ninety" @ 31.94 — the chip flashes on the number it states
const FALL_IN = F(35.4); // "four point three metres" @ 35.50 — the card lands ON the number,
//                            not at the top of the sentence (short-10's rule: one animated
//                            quantity per spoken number, each on its own word)
const CURVE_IN = F(37.85); // "curves away" @ 37.82
const EQ_IN = F(38.6); // "exactly" @ 38.58 — the "=" lands on the word that claims it
const LOOP = F(40.8); // after "the same amount." @ 40.08 — the payoff gets its own frames first
const END = F(42.0);

const Short12Orbit: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // THE CAMERA: 1.0 → 2.8 (push in on the tower) → 1.0 (pulled back out by the 7 km/s shot).
  const zin = EASE_INOUT(prog(f, REWIND_IN, REWIND_OUT));
  const zout = EASE_INOUT(prog(f, FIRE7, LAND7));
  const z = 1 + 1.8 * Math.max(0, zin - zout);

  // THE REWIND (short-10/11's trick, third outing): frame 0 IS the end of the reveal. The setup
  // un-draws the orbit back to the cannon; the reveal walks it back out; the loop closes for free.
  const rewound = EASE_INOUT(prog(f, REWIND_IN, REWIND_OUT));
  const orbT = Math.max(1 - rewound, EASE_INOUT(prog(f, ORB_IN, ORB_CLOSE)));

  // flight of each shot — LINEAR in video time, because it is linear in simulated time
  const t3 = prog(f, FIRE3, LAND3);
  const t5 = prog(f, FIRE5, LAND5);
  const t7 = prog(f, FIRE7, LAND7);

  // the failed arcs and the machinery all clear away for the twist, and are therefore absent at
  // frame 0 — which is what lets the last frame equal the first one
  const clear = 1 - prog(f, TWIST_IN, TWIST_IN + 12);
  const a3 = prog(f, FIRE3, FIRE3 + 4) * clear;
  const a5 = prog(f, FIRE5, FIRE5 + 4) * clear;
  const a7 = prog(f, FIRE7, FIRE7 + 4) * clear;
  const i3 = prog(f, LAND3, LAND3 + 5) * clear;
  const i5 = prog(f, LAND5, LAND5 + 5) * clear;
  const i7 = prog(f, LAND7, LAND7 + 5) * clear;
  const cannonOp = prog(f, F(6.4), F(7.4)) * (1 - prog(f, LAND7, LAND7 + 30));
  const ladderOp = prog(f, LAND3, LAND3 + 6) * clear;

  // The station and its arrow belong to FRAME 0: on at f0, gone through the rewind and the whole
  // cannon experiment, back when the orbit closes. (at={SAT_IN} alone would have left frame 0
  // without its payoff — the short-8/9 bug, and the reason short-11 pre-rolls its stamp.)
  const issOp = Math.max(1 - prog(f, REWIND_IN, REWIND_IN + 30), prog(f, SAT_IN, SAT_IN + 18));

  // one lap across the whole composition → the station is back where it started on the last frame
  const issDeg = 55 + 360 * (f / END);
  const [sx, sy] = satPos(V, ISS_ALT, issDeg);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 30) + prog(f, F(41.0), END));
  const stampOp = prog(f, STAMP_IN, STAMP_IN + 12) * (1 - prog(f, TWIST_IN, TWIST_IN + 12));
  const gravOp = prog(f, TWIST_IN, TWIST_IN + 18) * (1 - prog(f, LOOP, LOOP + 22));
  const panelOp = prog(f, FALL_IN, FALL_IN + 14) * (1 - prog(f, LOOP, LOOP + 22));

  const rungs = [
    { v: '3 km/s', note: `LANDS · ${km(T3.downrangeKm)} km`, on: Math.max(0.45 * prog(f, LAND3, LAND3 + 6), prog(f, RUNG1, RUNG1 + 10)) },
    { v: '5 km/s', note: `LANDS · ${km(T5.downrangeKm)} km`, on: Math.max(0.45 * prog(f, LAND5, LAND5 + 6), prog(f, RUNG2, RUNG2 + 10)) },
    { v: '7 km/s', note: t7 > 0.98 ? `LANDS · ${km(T7.downrangeKm)} km` : 'LANDS…', on: prog(f, FIRE7 + 3, FIRE7 + 13) },
    { v: `${(V_ORB / 1000).toFixed(2)} km/s`, note: 'ORBIT', on: prog(f, ORB_CLOSE, ORB_CLOSE + 12) },
  ];

  return (
    <AbsoluteFill style={{ background: SPACE }}>
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse 80% 45% at 50% 44%, #13233a 0%, transparent 72%)' }}
      />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform={`translate(${LAUNCH[0]} ${LAUNCH[1]}) scale(${z}) translate(${-LAUNCH[0]} ${-LAUNCH[1]})`}>
            <Globe view={V} lon0={12} lat0={18} />
            <Atmosphere view={V} km={100} />

            {/* the three shots that lose. Same integrator, same tower — only v0 differs. */}
            <Trajectory view={V} traj={T3} t={t3} color={ORANGE} opacity={a3} width={5 / z} ballR={10 / z} ball={t3 < 0.999} />
            <Trajectory view={V} traj={T5} t={t5} color={ORANGE} opacity={a5} width={5 / z} ballR={10 / z} ball={t5 < 0.999} />
            <Trajectory view={V} traj={T7} t={t7} color={ORANGE} opacity={a7} width={5 / z} ballR={10 / z} ball={t7 < 0.999} />
            <Impact view={V} traj={T3} color={RED} opacity={i3} scale={1 / z} />
            <Impact view={V} traj={T5} color={RED} opacity={i5} scale={1 / z} />
            <Impact view={V} traj={T7} color={RED} opacity={i7} scale={1 / z} />

            {/* and the one that doesn't. It is drawn by the same integrator as the three above — the
                ONLY thing that changed is that v0 is now 7,672.6 m/s. */}
            <Trajectory
              view={V}
              traj={TORB}
              t={orbT}
              color={GOLD}
              width={5 / z}
              ballR={11 / z}
              ball={orbT > 0.005 && orbT < 0.995}
              glow
            />

            <Cannon view={V} altM={ISS_ALT} color={GOLD} opacity={cannonOp} scale={1.15 / z} />

            <g opacity={issOp}>
              <Sat view={V} altM={ISS_ALT} deg={issDeg} color={GOLD} />
              {/* the whole thesis, drawn: the arrow points DOWN. Down is toward the centre. */}
              <GravityArrow view={V} from={[sx, sy]} lenPx={210} color={RED} label="GRAVITY" />
            </g>
          </g>
        </svg>

        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'NOT WEIGHTLESS.', color: '#ffffff' },
              { text: "THEY'RE FALLING.", color: GOLD },
            ]}
            subtitle={`Gravity up there is still ${PCT.toFixed(1)}% of ground level`}
            y={140}
            size={88}
            warm
          />
        </div>

        <Kicker text="NEWTON'S CANNONBALL" color={GOLD} y={205} at={F(5.6)} until={F(13.5)} />
        <Kicker text="CRANK THE SPEED" color={GOLD} y={205} at={F(17.6)} until={F(29.4)} />
        <Kicker text="IT'S NOT WEIGHTLESSNESS" color={RED} y={205} at={TWIST_IN} until={F(40.6)} />

        <SpeedLadder rungs={rungs} x={40} y={300} color={GOLD} hit={RED} opacity={ladderOp} />

        <div style={{ opacity: gravOp }}>
          <StatChip
            label="Gravity at 400 km"
            value={`${G_ISS.toFixed(2)} m/s² — ${PCT.toFixed(1)}% of ground`}
            color={RED}
            x={240}
            y={292}
            w={600}
            at={TWIST_IN}
          />
        </div>
        {/* the percentage is the sentence's punch, so it gets its own beat: the chip flashes on
            "nearly ninety percent" rather than sitting there inertly from the top of the line */}
        <div
          style={{
            position: 'absolute',
            left: 240,
            top: 292,
            width: 600,
            height: 118,
            borderRadius: 18,
            border: `3px solid ${RED}`,
            opacity: prog(f, PCT_IN, PCT_IN + 8) * (1 - prog(f, PCT_IN + 22, PCT_IN + 44)) * gravOp,
            transform: `scale(${1 + 0.07 * (1 - prog(f, PCT_IN, PCT_IN + 10))})`,
            pointerEvents: 'none',
          }}
        />

        {/* The stamp and the equality panel SHARE the slot under the globe, in sequence. */}
        <div style={{ opacity: stampOp }}>
          <Stamp text="THAT'S ORBIT" at={STAMP_IN} color={GOLD} x={540} y={1250} size={68} rotate={-5} />
        </div>

        {/* THE PAYOFF. Both numbers are computed above from GM/R/h — the "=" is earned, not asserted. */}
        <EqualityPanel
          left={{ label: 'in 1 second it falls', value: `${FALL_1S.toFixed(2)} m` }}
          right={{ label: 'the Earth curves away', value: `${CURVE_1S.toFixed(2)} m` }}
          x={540}
          y={1250}
          w={1000}
          color={GOLD}
          opacity={panelOp}
          rightOp={prog(f, CURVE_IN, CURVE_IN + 12)}
          eq={prog(f, EQ_IN, EQ_IN + 10)}
          foot={`…while moving ${SIDE_1S.toFixed(2)} km sideways. It falls, and it misses.`}
          footOp={prog(f, EQ_IN, EQ_IN + 12)}
        />
      </AbsoluteFill>

      {/* y=700, NOT the usual 410: at 410 the card sat straight on top of the speed ladder and hid
          the two shots the quiz is asking you to extrapolate from. Down here it lands on the empty
          green face of the zoomed-in globe, with the cannon and both arcs still visible above it. */}
      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what if you fire it fast enough?" durSec={3.8} accent={GOLD} y={700} />
      </Sequence>

      {/* plate: for half this video the camera is pushed into a brightly-lit green planet, and
          unplated white captions on lit landmass are mush at phone size. */}
      <Captions lines={VO} y={1400} accent={GOLD} plate />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short12Orbit;
