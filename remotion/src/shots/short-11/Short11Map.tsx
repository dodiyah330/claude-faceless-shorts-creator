import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, Stamp, prog } from '../../lib/shorts';
import { Ticker } from '../../lib/chart';
import {
  Country,
  CountryShape,
  Graticule,
  MapLabel,
  WorldLayer,
  movedCentroid,
  countryPath,
  makeMapScale,
  projectedArea,
  Move,
} from '../../lib/map';
import { AFRICA, byName } from '../../lib/geo/world';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short11Map',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e'; // Greenland — the country the map lies about
const TEAL = '#5ec8c0'; // Africa — the truth it's measured against
const VIOLET = '#9b7cc4'; // the twist: everyone else up north
const OCEAN = '#0d1520';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE MAP — a real Mercator projection (lib/map.tsx) over real Natural Earth outlines. The
// distortion below is produced by our own projection, not drawn by hand.
// =============================================================================
const SCALE = makeMapScale([-180, 180], [-58, 84], { x: 30, y: 530, w: 1020 });

// THE CAMERA. At world scale, true-size Greenland lands on Africa about 50px wide — the payoff
// is technically on screen and completely unreadable. So the map pushes IN as Greenland travels
// (1.0 -> 1.6, anchored on Africa), and the whole comparison happens close up. The push is tied
// to `slide`, so frame 0 is already at 1.6 and the setup pulls back out to the familiar world
// view for "Mercator stretches the world" — the one beat that needs the whole map.
// Origin is chosen so the ghost outline up north stays in frame: at 1.6x it is still visible.
const [AFX, AFY] = SCALE.px(20, 2);
const zoomAt = (slide: number) => 1 + 0.6 * slide;
const zpt = (x: number, y: number, z: number): [number, number] => [
  AFX + (x - AFX) * z,
  AFY + (y - AFY) * z,
];

const GREENLAND = byName('Greenland');
const CANADA = byName('Canada');

// Russia straddles the antimeridian: its eastern tip (Chukotka) is stored at lon ≈ −180, so
// averaging all its points drags the centroid west, and shifting the whole country sends that
// stray polygon flying across the map. Keep only the rings that live in the eastern hemisphere —
// it is the same Russia everyone recognises, minus a tip that Mercator can't move honestly anyway.
const RUSSIA: Country = (() => {
  const r = byName('Russia');
  return { ...r, rings: r.rings.filter((ring) => ring.reduce((s, p) => s + p[0], 0) / ring.length > 0) };
})();

// Where each country is carried to. lib/map's transport keeps their REAL ground size the whole
// way down (rescaling each vertex's longitude offset by cos(lat)/cos(lat') as the meridians
// converge), so what arrives at the equator is genuinely true-size — not a country I scaled by
// hand until it looked right.
const G_MOVE: Move = { toLon: 20, toLat: 3 }; // onto Africa
const C_MOVE: Move = { toLon: -32, toLat: 2 }; // into the Atlantic, west of Africa
const R_MOVE: Move = { toLon: 78, toLat: -2 }; // into the Indian Ocean, east of Africa

// How big the map DRAWS Greenland right now, relative to how big it draws it at the equator.
// Measured off the projected polygon every frame — this is the number the counter shows, and it
// starts at ~15 because that is what our own projection does to Greenland.
const G_TRUE_PX = projectedArea(SCALE, GREENLAND, G_MOVE, 1);
const inflationAt = (slide: number) => projectedArea(SCALE, GREENLAND, G_MOVE, slide) / G_TRUE_PX;

// =============================================================================
// CUES
// =============================================================================
// RETIMED to the REAL ElevenLabs word times (vo.gen.ts) — every move lands on the word that
// describes it, and nothing fires before the word it illustrates.
const HOOK_OUT = F(4.1);
const REWIND_IN = F(4.4); // "On this map..." (4.40) — Greenland flies home; the rewind IS the setup
const REWIND_OUT = F(7.0);
const PAUSE_FROM = F(13.1); // "Pause." @ 13.20
const PAUSE_DUR = F(4.3); // ...through "...inside Africa?" @ 17.16
const SLIDE_IN = F(18.6); // "slide" @ 18.79 — the journey starts ON the word, not before it
const SLIDE_OUT = F(25.2); // lands under "its real size." @ 25.00
const AREAS_IN = F(26.0); // "Two million square kilometres..." @ 26.00
const COUNTER_OUT = F(30.3); // the counter's job is done; clear the slot for the stamp
const STAMP_IN = F(31.2); // "fourteen" @ 31.27 — the stamp lands on the number it states
const TWIST_IN = F(34.5); // "Canada" @ 34.76, "Russia" @ 35.41 — they leave as he names them
const TWIST_OUT = F(37.6); // arrived by "too." @ 36.38, then they sit there and get looked at
const LOOP = F(39.6); // after "the bigger the lie." @ 39.55 — the payoff gets its own frame first
const END = F(42.0);

const Short11Map: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // slide = 1 -> Greenland sits on Africa at its true size. Frame 0 is ALREADY there (the payoff
  // is the thumbnail); the setup rewinds it north, the reveal walks it back down.
  const rewound = EASE_INOUT(prog(f, REWIND_IN, REWIND_OUT));
  const slide = Math.max(1 - rewound, EASE_INOUT(prog(f, SLIDE_IN, SLIDE_OUT)));

  // the twist countries: out on the twist, and HOME again by the last frame (frame 0 has them north)
  const twist = EASE_INOUT(prog(f, TWIST_IN, TWIST_OUT)) * (1 - EASE_INOUT(prog(f, LOOP, LOOP + 66)));

  const ghostOp = prog(slide, 0.06, 0.35); // the outline Greenland left behind up north
  const areasOp = Math.max(1 - rewound, prog(f, AREAS_IN, AREAS_IN + 12));
  const stampOp = Math.max(1 - rewound, prog(f, STAMP_IN, STAMP_IN + 10));
  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 20) + prog(f, LOOP + 8, LOOP + 30));
  // the counter only exists while the number is MOVING — it is absent at frame 0 and at the end
  const counterOp = prog(f, SLIDE_IN - 8, SLIDE_IN) * (1 - prog(f, COUNTER_OUT, COUNTER_OUT + 12));

  const inflate = inflationAt(slide);
  const z = zoomAt(slide);

  // Label anchors follow their country THROUGH the camera push (the labels are HTML, outside the
  // SVG that gets the zoom transform, so they have to be projected by hand).
  const [gx, gy] = zpt(...SCALE.px(...movedCentroid(GREENLAND, G_MOVE, slide)), z);
  // Africa's label lives in the SOUTH of the continent: Greenland lands dead-centre on Africa
  // (lat 3), and a label at Africa's centroid would sit right on top of Greenland's.
  const [ax, ay] = zpt(...SCALE.px(24, -26), z);

  return (
    <AbsoluteFill style={{ background: OCEAN }}>
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse 90% 50% at 50% 48%, #16283a 0%, transparent 70%)' }}
      />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform={`translate(${AFX} ${AFY}) scale(${z}) translate(${-AFX} ${-AFY})`}>
          <WorldLayer scale={SCALE} except={['Greenland', 'Canada', 'Russia', ...AFRICA.map((c) => c.name)]} />

          {/* equally-spaced parallels drift apart toward the pole: the distortion, drawn */}
          <Graticule scale={SCALE} />

          {/* Africa — the yardstick */}
          {AFRICA.map((c) => (
            <CountryShape key={c.name} scale={SCALE} country={c} fill={TEAL} stroke="#7fdad3" opacity={0.9} />
          ))}

          {/* the outline Greenland leaves behind: what the map CLAIMED it was */}
          <path
            d={countryPath(SCALE, GREENLAND)}
            fill="none"
            stroke={GOLD}
            strokeWidth={2.5}
            strokeDasharray="10 9"
            opacity={0.5 * ghostOp}
          />

          {/* the holes they leave in the north — same device as Greenland's ghost, and it is what
              sells the twist: the top of the map empties out */}
          {(['C', 'R'] as const).map((k) => (
            <path
              key={k}
              d={countryPath(SCALE, k === 'C' ? CANADA : RUSSIA)}
              fill="none"
              stroke={VIOLET}
              strokeWidth={2.5}
              strokeDasharray="10 9"
              opacity={0.5 * prog(twist, 0.06, 0.35)}
            />
          ))}

          <CountryShape scale={SCALE} country={CANADA} move={C_MOVE} t={twist}
            fill={twist > 0.02 ? VIOLET : '#2c3c52'} stroke={twist > 0.02 ? '#c3a8e6' : '#3d5170'} />
          <CountryShape scale={SCALE} country={RUSSIA} move={R_MOVE} t={twist}
            fill={twist > 0.02 ? VIOLET : '#2c3c52'} stroke={twist > 0.02 ? '#c3a8e6' : '#3d5170'} />

          {/* Greenland — every frame of its journey keeps its real ground size; the shrink you see
              is the map giving up its lie, not an animation */}
          <CountryShape
            scale={SCALE}
            country={GREENLAND}
            move={G_MOVE}
            t={slide}
            fill={GOLD}
            stroke="#fff0b8"
            glow
          />
          </g>
        </svg>

        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'THE MAP', color: '#ffffff' },
              { text: 'LIED TO YOU', color: GOLD },
            ]}
            subtitle="Africa is 14× bigger than Greenland"
            y={150}
            size={88}
            warm
          />
        </div>

        <Kicker text="MERCATOR PROJECTION" color={TEAL} y={205} at={REWIND_IN} until={F(13.2)} />
        <Kicker text="BACK TO THE EQUATOR" color={GOLD} y={205} at={SLIDE_IN} until={F(33.4)} />
        <Kicker text="THE WHOLE NORTH IS A LIE" color={VIOLET} y={205} at={TWIST_IN} until={F(38.9)} />


        {/* Greenland's chip rides its country all the way down — it sits well ABOVE the shape so it
            never covers the payoff (an earlier pass parked it exactly on the shrunken Greenland and
            hid the one thing the whole video is about). */}
        <MapLabel
          x={gx}
          y={gy - 74 - 70 * (1 - slide)}
          title="Greenland"
          stat={areasOp > 0.5 ? '2.2M km²' : undefined}
          color={GOLD}
        />
        <MapLabel
          x={ax}
          y={ay}
          title="Africa"
          stat={areasOp > 0.5 ? '30.4M km²' : undefined}
          color={TEAL}
          opacity={0.95}
        />

        {/* The counter and the stamp SHARE the slot under the map, in sequence: the counter runs the
            lie down from ×15 to ×1, fades, and the stamp lands in its place with the verdict. */}
        <Ticker
          value={inflate}
          p={1}
          label="Greenland's size on this map"
          color={GOLD}
          x={540}
          y={1300}
          size={82}
          format={(v) => `×${v.toFixed(1)}`}
          opacity={counterOp}
        />

        {/* The stamp belongs to frame 0, so it is PRE-ROLLED (at=-14, already fully punched in at f0)
            and its visibility is driven by the wrapper: on at f0, gone through the rewind and the
            slide, back when he says "fourteen times bigger". at={STAMP_IN} alone would have left
            frame 0 without its payoff — the short-8/9 bug. */}
        <div style={{ opacity: stampOp }}>
          <Stamp text="14× BIGGER" at={-14} color={TEAL} x={540} y={1300} size={70} rotate={-6} />
        </div>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="how many fit inside Africa?" durSec={3.8} accent={GOLD} y={410} />
      </Sequence>

      <Captions lines={VO} y={1400} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short11Map;
