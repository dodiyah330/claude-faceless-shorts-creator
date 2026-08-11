// Money-math shorts kit — compound curves, the shaded gap BETWEEN two curves, a live
// ticking counter, and a share-of-the-whole bar. Seeds short-10 (the 1% fee) and is built
// generic enough for the rest of the niche: rule of 72 (two curves, different rates),
// the minimum-payment trap (balance curves + interest-as-share-of-payments bar),
// "latte math done honestly" (one curve + a counter).
//
// Every piece is frame-driven and fully prop-controlled — the SHOT owns the choreography,
// the lib owns the drawing. Same contract as lib/prob.tsx and lib/math.tsx.
import React from 'react';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';

export type Pt = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

// =============================================================================
// SERIES — the math. Deterministic, recomputed at render: the number on screen IS the
// number the formula gives, never a hardcoded guess.
// =============================================================================

// Future value of a monthly contribution, sampled every month. Ordinary annuity: the
// deposit lands at the END of each month, so month 0 is 0 and the last deposit earns nothing.
// Returns points in (years, dollars).
export const contribSeries = (monthly: number, annualRate: number, years: number): Pt[] => {
  const r = annualRate / 12;
  const n = Math.round(years * 12);
  const out: Pt[] = [];
  let bal = 0;
  out.push({ x: 0, y: 0 });
  for (let m = 1; m <= n; m++) {
    bal = bal * (1 + r) + monthly;
    out.push({ x: m / 12, y: bal });
  }
  return out;
};

// The value of a series at a fractional index — used to slice a curve to its growth progress.
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Points up to progress p (0..1), interpolating the final partial segment so the curve's
// head moves smoothly instead of snapping point to point.
export const slicePts = (pts: Pt[], p: number): Pt[] => {
  const c = Math.max(0, Math.min(1, p));
  if (c <= 0) return [pts[0]];
  if (c >= 1) return pts;
  const fi = c * (pts.length - 1);
  const i = Math.floor(fi);
  const t = fi - i;
  const head = pts.slice(0, i + 1);
  const a = pts[i];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  head.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
  return head;
};

export const lastPt = (pts: Pt[]): Pt => pts[pts.length - 1];

// =============================================================================
// SCALE — data coords -> pixels. Passed explicitly to every component (no context), so a
// shot can draw two charts side by side with different scales if it ever needs to.
// =============================================================================
export type Scale = {
  sx: (x: number) => number;
  sy: (y: number) => number;
  box: Box;
};

export const makeScale = (xDomain: [number, number], yDomain: [number, number], box: Box): Scale => ({
  sx: (x) => box.x + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * box.w,
  sy: (y) => box.y + box.h - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * box.h,
  box,
});

const toPath = (s: Scale, pts: Pt[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${s.sx(p.x).toFixed(2)} ${s.sy(p.y).toFixed(2)}`).join(' ');

// =============================================================================
// FORMATTERS
// =============================================================================
export const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
export const moneyShort = (v: number) =>
  v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${Math.round(v)}`;

// =============================================================================
// CHART FRAME — axes, horizontal gridlines with money labels, x ticks with year labels.
// Mounted once and left up: it is the persistent canvas the whole short lives on.
// =============================================================================
export const ChartFrame: React.FC<{
  scale: Scale;
  yTicks: number[];
  xTicks: number[];
  yFormat?: (v: number) => string;
  xFormat?: (v: number) => string;
  grid?: string;
  axis?: string;
  label?: string;
  opacity?: number;
}> = ({
  scale,
  yTicks,
  xTicks,
  yFormat = moneyShort,
  xFormat = (v) => `${v}y`,
  grid = 'rgba(255,255,255,0.10)',
  axis = 'rgba(255,255,255,0.30)',
  label = 'rgba(255,255,255,0.55)',
  opacity = 1,
}) => {
  const { box } = scale;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }}
    >
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line x1={box.x} x2={box.x + box.w} y1={scale.sy(v)} y2={scale.sy(v)} stroke={grid} strokeWidth={2} />
          <text
            x={box.x - 18}
            y={scale.sy(v) + 10}
            textAnchor="end"
            fill={label}
            style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28 }}
          >
            {yFormat(v)}
          </text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text
          key={`x${v}`}
          x={scale.sx(v)}
          y={box.y + box.h + 44}
          textAnchor="middle"
          fill={label}
          style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28 }}
        >
          {xFormat(v)}
        </text>
      ))}
      <line x1={box.x} x2={box.x} y1={box.y} y2={box.y + box.h} stroke={axis} strokeWidth={3} />
      <line
        x1={box.x}
        x2={box.x + box.w}
        y1={box.y + box.h}
        y2={box.y + box.h}
        stroke={axis}
        strokeWidth={3}
      />
    </svg>
  );
};

// =============================================================================
// CURVE — a series drawn to progress p, with a soft glow underneath the stroke.
// =============================================================================
export const Curve: React.FC<{
  scale: Scale;
  pts: Pt[];
  color: string;
  p?: number; // 0 = nothing drawn, 1 = the whole series
  width?: number;
  glow?: number;
  dashed?: boolean;
  opacity?: number;
}> = ({ scale, pts, color, p = 1, width = 8, glow = 0.5, dashed = false, opacity = 1 }) => {
  const drawn = slicePts(pts, p);
  if (drawn.length < 2) return null;
  const d = toPath(scale, drawn);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }}>
      {glow > 0 ? (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width * 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.14 * glow}
          style={{ filter: 'blur(10px)' }}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? '16 14' : undefined}
      />
    </svg>
  );
};

// =============================================================================
// GAP AREA — the shaded region BETWEEN two series. This is the whole argument of a
// fee/rate video: the gap is not a line, it is an AREA, and it grows.
// `p` slices both edges together so the shading always ends exactly under the curve heads.
// =============================================================================
export const GapArea: React.FC<{
  scale: Scale;
  upper: Pt[];
  lower: Pt[];
  color: string;
  p?: number;
  opacity?: number;
  hatch?: boolean;
}> = ({ scale, upper, lower, color, p = 1, opacity = 0.28, hatch = false }) => {
  const u = slicePts(upper, p);
  const l = slicePts(lower, p);
  if (u.length < 2 || l.length < 2) return null;
  const d = `${toPath(scale, u)} L ${scale.sx(lastPt(l).x).toFixed(2)} ${scale
    .sy(lastPt(l).y)
    .toFixed(2)} ${[...l]
    .reverse()
    .slice(1)
    .map((q) => `L ${scale.sx(q.x).toFixed(2)} ${scale.sy(q.y).toFixed(2)}`)
    .join(' ')} Z`;
  const id = `hatch-${color.replace('#', '')}`;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {hatch ? (
        <defs>
          <pattern id={id} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={14} height={14} fill={color} opacity={0.18} />
            <line x1={0} y1={0} x2={0} y2={14} stroke={color} strokeWidth={4} opacity={0.5} />
          </pattern>
        </defs>
      ) : null}
      <path d={d} fill={hatch ? `url(#${id})` : color} opacity={opacity} />
    </svg>
  );
};

// =============================================================================
// END DOT — the head of a curve: a pulsing dot + a value label that rides along with it.
// =============================================================================
export const EndDot: React.FC<{
  scale: Scale;
  pts: Pt[];
  p?: number;
  color: string;
  label?: string;
  value?: number;
  format?: (v: number) => string;
  dy?: number; // nudge the label off the curve head
  dx?: number;
  // 'end' right-aligns the label to the head instead of centering on it — the curve head sits
  // at the plot's right edge, and a centered label there spills into the Shorts UI button
  // column (SAFE.right = 160px). Right-anchoring keeps it inside the plot.
  anchor?: 'middle' | 'end';
  // A head label that lands on the shaded gap (or on the other curve) is unreadable in the
  // curve's own colour — the plate makes it a chip that reads over anything.
  plate?: boolean;
  pulse?: number; // 0..1 — swell the chip when the narrator says THIS number
  opacity?: number;
}> = ({
  scale,
  pts,
  p = 1,
  color,
  label,
  value,
  format = moneyShort,
  dy = -46,
  dx = 0,
  anchor = 'middle',
  plate = false,
  pulse = 0,
  opacity = 1,
}) => {
  const head = lastPt(slicePts(pts, p));
  const cx = scale.sx(head.x);
  const cy = scale.sy(head.y);
  const shown = value !== undefined ? value : head.y;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity }}>
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          width: 26,
          height: 26,
          marginLeft: -13,
          marginTop: -13,
          borderRadius: 999,
          background: color,
          transform: `scale(${1 + 0.5 * pulse})`,
          boxShadow: `0 0 ${30 + 30 * pulse}px ${color}`,
        }}
      />
      {label !== undefined || value !== undefined ? (
        <div
          style={{
            position: 'absolute',
            left: cx + dx,
            top: cy + dy,
            transform: `translate(${anchor === 'end' ? '-100%' : '-50%'}, -50%) scale(${1 + 0.12 * pulse})`,
            transformOrigin: anchor === 'end' ? 'right center' : 'center',
            whiteSpace: 'nowrap',
            textAlign: anchor === 'end' ? 'right' : 'center',
            ...(plate
              ? {
                  background: 'rgba(13,17,23,0.86)',
                  border: `2px solid ${color}${pulse > 0.5 ? 'cc' : '44'}`,
                  borderRadius: 14,
                  padding: '8px 16px',
                }
              : {}),
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color }}>{format(shown)}</div>
          {label ? (
            <div
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.72)',
                marginTop: 2,
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// =============================================================================
// TICKER — a big money counter the shot drives from 0 to `value` with `p`. The retention
// device of the whole niche: numbers moving while the narrator talks.
// =============================================================================
export const Ticker: React.FC<{
  value: number;
  p?: number; // 0..1 of the way to `value`
  label?: string;
  color: string;
  x?: number;
  y?: number;
  size?: number;
  format?: (v: number) => string;
  opacity?: number;
}> = ({ value, p = 1, label, color, x = 540, y = 1240, size = 96, format = money, opacity = 1 }) => {
  const shown = value * Math.max(0, Math.min(1, p));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      {label ? (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 6,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: 1,
          color,
          // tabular figures: without this the digits change width as they tick and the
          // whole number jitters left-right while counting.
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 6px 40px ${color}55`,
        }}
      >
        {format(shown)}
      </div>
    </div>
  );
};

// =============================================================================
// SHARE BAR — the TWIST device: take a total and show what share of it is gone. Reframes
// "a big scary number" as "a fraction of everything you had". Reusable wherever a number
// is better understood as a proportion (interest share of payments, tax drag, inflation).
// =============================================================================
export const ShareBar: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  share: number; // 0..1 of the bar that is "lost"
  p?: number; // 0..1 fill-in progress of the lost segment
  keepColor?: string;
  lostColor?: string;
  keepLabel?: string;
  lostLabel?: string;
  opacity?: number;
}> = ({
  x,
  y,
  w,
  h = 74,
  share,
  p = 1,
  keepColor = '#f5d76e',
  lostColor = '#ef5f6b',
  keepLabel,
  lostLabel,
  opacity = 1,
}) => {
  const lostW = w * share * Math.max(0, Math.min(1, p));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity }}>
      <div
        style={{
          position: 'relative',
          width: w,
          height: h,
          borderRadius: 14,
          background: keepColor,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
        }}
      >
        {/* the lost slice eats in from the LEFT edge of what you thought you had */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: lostW, background: lostColor }} />
      </div>
      <div style={{ position: 'relative', height: 44, marginTop: 12 }}>
        {lostLabel ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              // nowrap: mid-fill the slice is narrower than its own label, and without this the
              // label breaks onto two lines and then re-joins as the slice catches up.
              whiteSpace: 'nowrap',
              width: Math.max(lostW, 180),
              textAlign: 'center',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 34,
              color: lostColor,
              opacity: p,
            }}
          >
            {lostLabel}
          </div>
        ) : null}
        {keepLabel ? (
          <div
            style={{
              position: 'absolute',
              right: 0,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 34,
              color: keepColor,
            }}
          >
            {keepLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// =============================================================================
// LEGEND ROW — which curve is which. Small, top-left of the plot, out of the curves' way.
// =============================================================================
export const Legend: React.FC<{
  items: { color: string; text: string }[];
  x: number;
  y: number;
  size?: number;
  opacity?: number;
}> = ({ items, x, y, size = 30, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', gap: 12, opacity }}>
    {items.map((it, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 8, borderRadius: 4, background: it.color }} />
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: size,
            color: 'rgba(255,255,255,0.85)',
            whiteSpace: 'nowrap',
          }}
        >
          {it.text}
        </div>
      </div>
    ))}
  </div>
);
