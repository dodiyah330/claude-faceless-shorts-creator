// Physics-shorts kit — a REAL globe and REAL numerically-integrated trajectories.
// Seeds short-12 ("astronauts aren't weightless, they're falling"), and is built generic
// enough for the rest of the niche: escape velocity, why the Moon doesn't fall, tides,
// why rockets go sideways, geostationary orbit.
//
// THE POINT OF THIS LIB: nothing on screen is a keyframed arc. `integrate()` is velocity
// Verlet under Newton's law of gravitation, in SI units, from a real initial state — the
// cannonball lands or doesn't land because the MATH says so. Fire it at 7.673 km/s and the
// path closes into a circle to within 9 metres over a full 92-minute orbit; fire it at
// 7.0 and it hits the ground 46 degrees downrange. We never assert an orbit: we compute one.
// (Same ethos as prob.tsx's seeded Monty Carlo, map.tsx's real Mercator, gen_chords' real
// equal temperament.)
//
// The globe underneath is equally real: the same Natural Earth 110m outlines lib/map.tsx
// uses, re-projected orthographically onto the disc.
import React from 'react';
import { WORLD } from './geo/world';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';

// =============================================================================
// CONSTANTS — SI. Everything else in this file is a consequence of these three numbers.
// =============================================================================
export const GM = 3.986004418e14; // Earth's standard gravitational parameter, m^3/s^2
export const R_EARTH = 6371e3; // mean radius, m
export const ISS_ALT = 400e3; // m

/** Gravitational acceleration at radius r (from Earth's CENTRE, not the ground). */
export const gAt = (r: number): number => GM / (r * r);
/** Speed of a circular orbit at radius r. */
export const vCirc = (r: number): number => Math.sqrt(GM / r);
/** Escape speed at radius r. */
export const vEsc = (r: number): number => Math.sqrt((2 * GM) / r);
/** Period of a circular orbit at radius r, seconds. */
export const period = (r: number): number => 2 * Math.PI * Math.sqrt((r * r * r) / GM);

/**
 * How far a sphere of radius r "curves away" from the straight line tangent to it, over an
 * arc of length d. This is the sagitta, r·(1 − cos(d/r)).
 *
 * NOTE, because it is the whole video and it is easy to get wrong: for something in orbit at
 * 400 km, "the Earth curving away beneath it" is the curvature of the SHELL IT IS ON
 * (r = R + h), not of the ground (r = R). The ground, being more sharply curved, drops 4.62 m
 * over a 7.67 km chord — but the distance from the station to the ground is what must stay
 * constant, and that is governed by r = R + h, which drops 4.35 m. That 4.35 equals the 4.35 m
 * the station falls in the same second — necessarily, because that equality IS what a circular
 * orbit is. We show the shell number, because the shell number is the one that is exactly true.
 */
export const sagitta = (r: number, d: number): number => r * (1 - Math.cos(d / r));

// =============================================================================
// THE INTEGRATOR — velocity Verlet. Symplectic, so a circular orbit stays circular instead
// of spiralling in over 5,000 steps the way naive Euler would.
// =============================================================================
export type Vec = [number, number];
export type Traj = {
  pts: Vec[]; // metres, Earth's centre at the origin
  impact: boolean; // did it hit the ground?
  tEnd: number; // seconds of flight (to impact, or to the end of the integration)
  downrangeDeg: number; // angle from launch to the final point, degrees around the centre
  downrangeKm: number; // ...as a distance along the surface
  apoKm: number; // highest / lowest radius reached, km from the centre
  periKm: number;
};

/**
 * Fire a ball from `r0` metres out (measured from Earth's centre), starting at the top of the
 * screen, horizontally to the right at `v0` m/s. Integrate until it hits the ground or `maxT`
 * seconds elapse.
 */
export const integrate = (r0: number, v0: number, maxT: number, dt = 2): Traj => {
  let x = 0;
  let y = r0;
  let vx = v0;
  let vy = 0;
  const acc = (px: number, py: number): Vec => {
    const r = Math.hypot(px, py);
    const a = -GM / (r * r * r);
    return [a * px, a * py];
  };
  let [ax, ay] = acc(x, y);
  const pts: Vec[] = [[x, y]];
  let t = 0;
  let impact = false;
  while (t < maxT) {
    x += vx * dt + 0.5 * ax * dt * dt;
    y += vy * dt + 0.5 * ay * dt * dt;
    const [nax, nay] = acc(x, y);
    vx += 0.5 * (ax + nax) * dt;
    vy += 0.5 * (ay + nay) * dt;
    ax = nax;
    ay = nay;
    t += dt;
    pts.push([x, y]);
    if (Math.hypot(x, y) <= R_EARTH) {
      impact = true;
      break;
    }
  }
  const [ex, ey] = pts[pts.length - 1];
  // angle swept from the launch point (straight up) round to the final point
  let deg = (Math.atan2(ex, ey) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const radii = pts.map((p) => Math.hypot(p[0], p[1]));
  return {
    pts,
    impact,
    tEnd: t,
    downrangeDeg: deg,
    downrangeKm: (deg * Math.PI * R_EARTH) / 180 / 1000,
    apoKm: Math.max(...radii) / 1000,
    periKm: Math.min(...radii) / 1000,
  };
};

// =============================================================================
// THE VIEW — metres to pixels. One scalar: the globe's radius on screen.
// =============================================================================
export type View = {
  cx: number;
  cy: number;
  rPx: number; // pixels per R_EARTH
  m2px: number; // pixels per metre
  px: (p: Vec) => Vec;
};

export const makeView = (cx: number, cy: number, rPx: number): View => {
  const m2px = rPx / R_EARTH;
  return { cx, cy, rPx, m2px, px: ([x, y]) => [cx + x * m2px, cy - y * m2px] };
};

/** Point on the trajectory at fraction `t` (0..1) of its flight, linearly between samples. */
export const trajPoint = (tr: Traj, t: number): Vec => {
  const f = Math.max(0, Math.min(1, t)) * (tr.pts.length - 1);
  const i = Math.min(tr.pts.length - 2, Math.floor(f));
  const k = f - i;
  const [x1, y1] = tr.pts[i];
  const [x2, y2] = tr.pts[i + 1];
  return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
};

/** SVG path for the first `t` (0..1) of the flight — the arc drawing itself as the ball flies. */
export const trajPath = (v: View, tr: Traj, t = 1): string => {
  const n = Math.max(1, Math.floor(Math.max(0, Math.min(1, t)) * (tr.pts.length - 1)));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const [x, y] = v.px(tr.pts[i]);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  const [hx, hy] = v.px(trajPoint(tr, t)); // exact head, so the tip tracks the ball smoothly
  return d + `L${hx.toFixed(1)} ${hy.toFixed(1)}`;
};

// =============================================================================
// THE GLOBE — real continents, orthographic. Same Natural Earth outlines as lib/map.tsx.
//
// A sphere seen from outside: rotate each vertex into view coordinates, keep the near
// hemisphere (z > 0), and close each visible run of a ring along the limb so it still fills.
// =============================================================================
const D2R = Math.PI / 180;

const orthoPt = (lon: number, lat: number, lon0: number, lat0: number): [number, number, number] => {
  const la = lat * D2R;
  const dl = (lon - lon0) * D2R;
  const l0 = lat0 * D2R;
  return [
    Math.cos(la) * Math.sin(dl),
    Math.cos(l0) * Math.sin(la) - Math.sin(l0) * Math.cos(la) * Math.cos(dl),
    Math.sin(l0) * Math.sin(la) + Math.cos(l0) * Math.cos(la) * Math.cos(dl), // >0 = facing us
  ];
};

// A ring, cut into the runs of it that face us, each closed back along the limb so it fills.
const orthoRingPath = (
  ring: [number, number][],
  v: View,
  lon0: number,
  lat0: number,
): string => {
  const P = ring.map(([lon, lat]) => orthoPt(lon, lat, lon0, lat0));
  if (P.every((p) => p[2] <= 0)) return '';
  const sx = (x: number) => v.cx + x * v.rPx;
  const sy = (y: number) => v.cy - y * v.rPx;
  // push a point that is behind the limb out ONTO the limb, so the run ends on the silhouette
  const onLimb = (p: [number, number, number]): [number, number] => {
    const m = Math.hypot(p[0], p[1]) || 1;
    return [p[0] / m, p[1] / m];
  };

  const runs: [number, number][][] = [];
  let cur: [number, number][] | null = null;
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    if (p[2] > 0) {
      if (!cur) {
        cur = [];
        const prev = P[(i - 1 + P.length) % P.length];
        if (prev[2] <= 0) cur.push(onLimb(prev)); // enter across the limb
      }
      cur.push([p[0], p[1]]);
    } else if (cur) {
      cur.push(onLimb(p)); // exit across the limb
      runs.push(cur);
      cur = null;
    }
  }
  if (cur) runs.push(cur);
  if (runs.length === 0) return '';

  return runs
    .map((run) => {
      let d = run.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join('');
      const a = run[0];
      const b = run[run.length - 1];
      const clipped = Math.abs(Math.hypot(a[0], a[1]) - 1) < 1e-6 && Math.abs(Math.hypot(b[0], b[1]) - 1) < 1e-6;
      if (clipped) {
        // walk home along the silhouette so the landmass still fills against the edge
        const cross = b[0] * a[1] - b[1] * a[0];
        d += `A${v.rPx} ${v.rPx} 0 0 ${cross > 0 ? 1 : 0} ${sx(a[0]).toFixed(1)} ${sy(a[1]).toFixed(1)}`;
      }
      return d + 'Z';
    })
    .join(' ');
};

export const Globe: React.FC<{
  view: View;
  lon0?: number; // which face of the Earth is toward camera
  lat0?: number;
  ocean?: string;
  land?: string;
  landStroke?: string;
  terminator?: boolean; // the shaded limb that makes it read as a sphere and not a disc
}> = ({
  view,
  lon0 = 12,
  lat0 = 18,
  ocean = '#16324a',
  land = '#2f6a52',
  landStroke = '#4d9273',
  terminator = true,
}) => {
  const { cx, cy, rPx } = view;
  const gid = `globe-${Math.round(rPx)}-${Math.round(lon0)}`;
  return (
    <g>
      <defs>
        <clipPath id={gid}>
          <circle cx={cx} cy={cy} r={rPx} />
        </clipPath>
        <radialGradient id={`${gid}-sh`} cx="38%" cy="32%" r="76%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rPx} fill={ocean} />
      <g clipPath={`url(#${gid})`}>
        {WORLD.filter((c) => c.cont !== 'Antarctica').map((c) => {
          const d = c.rings.map((r) => orthoRingPath(r, view, lon0, lat0)).filter(Boolean).join(' ');
          return d ? (
            <path key={c.name} d={d} fill={land} stroke={landStroke} strokeWidth={1} strokeLinejoin="round" />
          ) : null;
        })}
      </g>
      {terminator ? <circle cx={cx} cy={cy} r={rPx} fill={`url(#${gid}-sh)`} /> : null}
      <circle cx={cx} cy={cy} r={rPx} fill="none" stroke="#7fc4e8" strokeWidth={2} opacity={0.5} />
    </g>
  );
};

/** The thin skin of air. To scale — and the fact that it looks like nothing is the point. */
export const Atmosphere: React.FC<{ view: View; km?: number; color?: string; opacity?: number }> = ({
  view,
  km = 100,
  color = '#7fc4e8',
  opacity = 0.28,
}) => (
  <circle
    cx={view.cx}
    cy={view.cy}
    r={view.rPx + km * 1000 * view.m2px}
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeDasharray="6 8"
    opacity={opacity}
  />
);

// =============================================================================
// TRAJECTORY — the arc, the ball on it, and the crater where it lands.
// =============================================================================
export const Trajectory: React.FC<{
  view: View;
  traj: Traj;
  t?: number; // 0..1 of the flight, drawn so far
  color: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
  ball?: boolean;
  ballR?: number;
  glow?: boolean;
}> = ({ view, traj, t = 1, color, width = 4, opacity = 1, dashed = false, ball = true, ballR = 9, glow = false }) => {
  const [bx, by] = view.px(trajPoint(traj, t));
  return (
    <g opacity={opacity} style={glow ? { filter: `drop-shadow(0 0 12px ${color})` } : undefined}>
      <path
        d={trajPath(view, traj, t)}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '10 10' : undefined}
      />
      {ball && t > 0.001 ? (
        <circle cx={bx} cy={by} r={ballR} fill="#fff" stroke={color} strokeWidth={3} />
      ) : null}
    </g>
  );
};

/**
 * Where it came down. `scale` compensates for a camera zoom on the parent <g>: pass 1/z and the
 * marker stays the same size on screen while the planet under it grows.
 */
export const Impact: React.FC<{
  view: View;
  traj: Traj;
  color: string;
  opacity?: number;
  scale?: number;
}> = ({ view, traj, color, opacity = 1, scale = 1 }) => {
  if (!traj.impact) return null;
  const [x, y] = view.px(traj.pts[traj.pts.length - 1]);
  const s = scale;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={16 * s} fill={color} opacity={0.3} />
      <circle cx={x} cy={y} r={7 * s} fill={color} />
      <circle cx={x} cy={y} r={7 * s} fill="none" stroke="#fff" strokeWidth={2 * s} />
    </g>
  );
};

/** The tower Newton fires from — here, 400 km tall, i.e. exactly the station's altitude. */
export const Cannon: React.FC<{ view: View; altM: number; color?: string; opacity?: number; scale?: number }> = ({
  view,
  altM,
  color = '#f5d76e',
  opacity = 1,
  scale = 1,
}) => {
  const top = view.cy - (R_EARTH + altM) * view.m2px;
  const base = view.cy - view.rPx;
  const s = scale;
  return (
    <g opacity={opacity}>
      <line x1={view.cx} y1={base} x2={view.cx} y2={top} stroke={color} strokeWidth={3 * s} opacity={0.7} />
      <rect x={view.cx - 5 * s} y={top} width={10 * s} height={base - top} fill={color} opacity={0.15} />
      {/* the barrel, pointing horizontally — that is the whole experiment */}
      <rect
        x={view.cx - 4 * s}
        y={top - 13 * s}
        width={34 * s}
        height={13 * s}
        rx={3 * s}
        fill={color}
        stroke="#fff"
        strokeWidth={1.5 * s}
      />
      <circle cx={view.cx} cy={top - 6 * s} r={9 * s} fill={color} stroke="#fff" strokeWidth={1.5 * s} />
    </g>
  );
};

/** The station on its orbit, at angle `deg` measured clockwise from straight up. */
export const satPos = (view: View, altM: number, deg: number): Vec => {
  const r = (R_EARTH + altM) * view.m2px;
  const a = deg * D2R;
  return [view.cx + r * Math.sin(a), view.cy - r * Math.cos(a)];
};

export const Sat: React.FC<{ view: View; altM: number; deg: number; color?: string; scale?: number; opacity?: number }> = ({
  view,
  altM,
  deg,
  color = '#f5d76e',
  scale = 1,
  opacity = 1,
}) => {
  const [x, y] = satPos(view, altM, deg);
  const s = 14 * scale;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg})`} opacity={opacity}>
      <rect x={-s * 2.2} y={-s * 0.34} width={s * 4.4} height={s * 0.68} rx={2} fill="#93b7d8" />
      <rect x={-s * 0.62} y={-s * 0.62} width={s * 1.24} height={s * 1.24} rx={3} fill={color} stroke="#fff" strokeWidth={2} />
      <rect x={-s * 2.2} y={-s * 0.34} width={s * 0.9} height={s * 0.68} fill="#2b4a6b" />
      <rect x={s * 1.3} y={-s * 0.34} width={s * 0.9} height={s * 0.68} fill="#2b4a6b" />
    </g>
  );
};

/** The arrow that is the whole thesis: it points DOWN. Down is toward the centre. */
export const GravityArrow: React.FC<{
  view: View;
  from: Vec; // pixel position of the thing being pulled
  lenPx?: number;
  color?: string;
  label?: string;
  opacity?: number;
  width?: number;
}> = ({ view, from, lenPx = 190, color = '#ff6b6b', label, opacity = 1, width = 14 }) => {
  const [x, y] = from;
  const n = Math.hypot(view.cx - x, view.cy - y) || 1;
  const ux = (view.cx - x) / n;
  const uy = (view.cy - y) / n;
  const tx = x + ux * lenPx;
  const ty = y + uy * lenPx;
  const hx = x + ux * (lenPx - 34);
  const hy = y + uy * (lenPx - 34);
  const px = -uy;
  const py = ux;
  return (
    <g opacity={opacity} style={{ filter: `drop-shadow(0 0 10px ${color}aa)` }}>
      <line x1={x + ux * 24} y1={y + uy * 24} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon
        points={`${tx},${ty} ${hx + px * 20},${hy + py * 20} ${hx - px * 20},${hy - py * 20}`}
        fill={color}
      />
      {label ? (
        // clear of the shaft (an earlier pass offset it by 34px and the arrow ran straight through
        // the word), and stroked, because it can land on ocean, on land or on space
        <text
          x={x + ux * (lenPx * 0.42) + px * 74}
          y={y + uy * (lenPx * 0.42) + py * 74}
          fill={color}
          stroke="rgba(7,11,18,0.9)"
          strokeWidth={7}
          paintOrder="stroke"
          fontFamily={FONT_DISPLAY}
          fontWeight={700}
          fontSize={38}
          letterSpacing={3}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// READOUTS
// =============================================================================

/** The speed ladder: each rung lights as the narrator names it. */
export const SpeedLadder: React.FC<{
  rungs: { v: string; note: string; on: number }[]; // on: 0..1
  x?: number;
  y?: number;
  color?: string;
  hit?: string;
  opacity?: number;
}> = ({ rungs, x = 40, y = 1180, color = '#f5d76e', hit = '#ff6b6b', opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {rungs.map((r, i) => {
      if (r.on <= 0.01) return null; // a rung does not exist until its shot has been fired
      const live = r.on > 0.5;
      const c = r.note.startsWith('ORBIT') ? color : hit;
      return (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: live ? 'rgba(13,17,23,0.92)' : 'rgba(13,17,23,0.45)',
            border: `2px solid ${live ? c : '#ffffff22'}`,
            borderRadius: 12,
            padding: '8px 16px',
            opacity: 0.35 + 0.65 * r.on,
            transform: `scale(${0.94 + 0.06 * r.on})`,
            transformOrigin: 'left center',
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: live ? '#fff' : '#ffffff66' }}>
            {r.v}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: live ? c : '#ffffff44' }}>
            {r.note}
          </span>
        </div>
      );
    })}
  </div>
);

/**
 * THE PAYOFF PANEL — two quantities and an equals sign between them. Used for the moment the
 * video exists to deliver: it falls 4.35 m, the Earth curves away 4.35 m. Both numbers are
 * passed in already computed, so the "=" is earned by the physics, not asserted by a designer.
 */
export const EqualityPanel: React.FC<{
  left: { label: string; value: string };
  right: { label: string; value: string };
  x?: number;
  y?: number;
  w?: number;
  color?: string;
  opacity?: number;
  rightOp?: number; // the second quantity arrives on its OWN spoken line, not with the first
  eq?: number; // 0..1 — the "=" punching in
  foot?: string; // the condition both quantities are measured under
  footOp?: number;
}> = ({
  left,
  right,
  x = 540,
  y = 1290,
  w = 1000,
  color = '#f5d76e',
  opacity = 1,
  rightOp = 1,
  eq = 1,
  foot,
  footOp = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      transform: 'translate(-50%, -50%)',
      opacity,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
    {[left, right].map((s, i) => (
      <React.Fragment key={i}>
        {i === 1 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 64 + 26 * (1 - eq),
              color,
              opacity: eq,
              textShadow: `0 0 26px ${color}88`,
            }}
          >
            =
          </div>
        ) : null}
        <div
          style={{
            flex: 1,
            opacity: i === 1 ? rightOp : 1,
            transform: i === 1 ? `translateX(${(1 - rightOp) * 30}px)` : undefined,
            background: 'rgba(12,14,20,0.92)',
            border: `2px solid ${color}55`,
            borderRadius: 18,
            padding: '14px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#ffffffaa',
            }}
          >
            {s.label}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: '#fff', marginTop: 2 }}>
            {s.value}
          </div>
        </div>
      </React.Fragment>
    ))}
    </div>
    {foot ? (
      <div
        style={{
          marginTop: 10,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 27,
          letterSpacing: 2,
          color: '#ffffff88',
          opacity: footOp,
        }}
      >
        {foot}
      </div>
    ) : null}
  </div>
);
