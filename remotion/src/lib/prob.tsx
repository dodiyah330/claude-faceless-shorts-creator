// Probability-shorts kit — game-show doors, odds annotations, and live Monte-Carlo
// tallies for the probability/paradox niche (Monty Hall, birthday paradox, coin runs,
// false-positive tests). Seeds short-5. Every piece is frame-driven and fully controlled
// by props so the SHOT owns the choreography (like lib/math's atoms).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';

// =============================================================================
// SEEDED SIM — deterministic, honest (repo ethos: real instrumented data).
// mulberry32 must stay byte-identical to scratchpad/monty_seed.mjs (seed 15 -> 66).
// =============================================================================
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One boolean per game: true = the always-SWITCH player wins (i.e. the first pick was a
// goat). The complement is exactly what a STAY player would have won on the same games.
export function montyTrials(seed: number, n: number): boolean[] {
  const r = mulberry32(seed);
  const out: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const car = Math.floor(r() * 3);
    const pick = Math.floor(r() * 3);
    out.push(pick !== car);
  }
  return out;
}

// =============================================================================
// DOOR — a game-show door that swings open on rotateY to reveal a car or a goat.
// Fully prop-controlled: the shot drives openP / pickedP / removedP / glow by frame.
// =============================================================================
export const Door: React.FC<{
  x: number; // center
  y: number; // top
  w: number;
  h: number;
  n: string; // door number on the face
  content: 'car' | 'goat';
  openP?: number; // 0 closed -> 1 fully open
  pickedP?: number; // 0..1 "YOUR PICK" highlight + tag
  switchP?: number; // 0..1 "SWITCH" target tag (teal)
  removedP?: number; // 0..1 host-eliminated dim + ✕
  glow?: number; // 0..1 winner glow ring
  accent?: string;
  good?: string;
  bad?: string;
}> = ({
  x,
  y,
  w,
  h,
  n,
  content,
  openP = 0,
  pickedP = 0,
  switchP = 0,
  removedP = 0,
  glow = 0,
  accent = '#f5d76e',
  good = '#4db8a8',
  bad = '#e8879f',
}) => {
  const emoji = content === 'car' ? '🚗' : '🐐';
  const swing = -Math.max(0, Math.min(1, openP)) * 105; // degrees, hinge on the left edge
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: 'translateX(-50%)' }}>
      {/* doorway / room behind the door */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 18,
          overflow: 'hidden',
          background: 'linear-gradient(180deg,#1b2331,#0d1119)',
          border: '3px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: w * 0.52,
            opacity: openP > 0.02 ? 1 : 0,
            transform: `scale(${0.7 + 0.3 * Math.max(0, Math.min(1, openP))})`,
          }}
        >
          {emoji}
        </div>
      </div>

      {/* picked / winner glow rings (drawn behind the panel so an open door still shows them) */}
      {pickedP > 0.01 ? (
        <div style={{ position: 'absolute', inset: -6, borderRadius: 22, border: `5px solid ${accent}`, boxShadow: `0 0 ${28 * pickedP}px ${accent}88`, opacity: pickedP }} />
      ) : null}
      {glow > 0.01 ? (
        <div style={{ position: 'absolute', inset: -6, borderRadius: 22, border: `5px solid ${good}`, boxShadow: `0 0 ${46 * glow}px ${good}aa`, opacity: glow }} />
      ) : null}
      {switchP > 0.01 ? (
        <div style={{ position: 'absolute', inset: -6, borderRadius: 22, border: `5px solid ${good}`, opacity: switchP * 0.9 }} />
      ) : null}

      {/* the swinging panel (the door itself) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'left center',
          transform: `perspective(1500px) rotateY(${swing}deg)`,
          backfaceVisibility: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            background: 'linear-gradient(135deg,#2c3648,#1b2331)',
            border: '3px solid rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)',
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: w * 0.42, color: 'rgba(255,255,255,0.85)' }}>{n}</span>
          <div style={{ position: 'absolute', right: 16, top: '50%', width: 16, height: 48, borderRadius: 8, background: accent, transform: 'translateY(-50%)', boxShadow: `0 0 10px ${accent}66` }} />
        </div>
      </div>

      {/* host-eliminated dim + ✕ (over the open goat door) */}
      {removedP > 0.01 ? (
        <>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'rgba(6,8,12,0.6)', opacity: removedP }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: w * 0.66, fontWeight: 900, color: bad, opacity: removedP, textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>✕</div>
        </>
      ) : null}

      {/* tags */}
      {pickedP > 0.01 ? <DoorTag y={-54} text="YOUR PICK" fg="#0e131b" bg={accent} p={pickedP} /> : null}
      {switchP > 0.01 ? <DoorTag y={-54} text="SWITCH →" fg="#07110f" bg={good} p={switchP} /> : null}
    </div>
  );
};

const DoorTag: React.FC<{ y: number; text: string; fg: string; bg: string; p: number }> = ({ y, text, fg, bg, p }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: y,
      transform: `translateX(-50%) translateY(${(1 - p) * 12}px)`,
      opacity: p,
      fontFamily: FONT_BODY,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: 2,
      color: fg,
      background: bg,
      padding: '7px 18px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 26px rgba(0,0,0,0.4)',
    }}
  >
    {text}
  </div>
);

// =============================================================================
// PROB CHIP — an odds pill ("1/3", "2/3") pinned near a door.
// =============================================================================
export const ProbChip: React.FC<{ x: number; y: number; text: string; color?: string; p?: number; big?: boolean }> = ({
  x,
  y,
  text,
  color = '#f5d76e',
  p = 1,
  big = false,
}) => {
  if (p <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateX(-50%) translateY(${(1 - p) * 14}px) scale(${0.9 + 0.1 * p})`,
        opacity: p,
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: big ? 66 : 46,
        color,
        border: `3px solid ${color}`,
        borderRadius: 16,
        padding: big ? '10px 26px' : '6px 18px',
        background: 'rgba(10,13,20,0.82)',
        whiteSpace: 'nowrap',
        boxShadow: big ? `0 0 26px ${color}44` : 'none',
      }}
    >
      {text}
    </div>
  );
};

// =============================================================================
// BRACE — a bracket grouping a span of doors with a label. x1/x2 are animatable, so
// the shot can RETRACT it from {two doors} onto {one door} as the odds collapse.
// Sits below the doors and points up at them; the label hangs below the center.
// =============================================================================
export const Brace: React.FC<{ x1: number; x2: number; y: number; label: string; color?: string; p?: number }> = ({
  x1,
  x2,
  y,
  label,
  color = '#4db8a8',
  p = 1,
}) => {
  if (p <= 0.01) return null;
  const cx = (x1 + x2) / 2;
  const tick = 18;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, opacity: p }}>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
        <path
          d={`M ${x1} ${y - tick} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y - tick} M ${cx} ${y} L ${cx} ${y + tick}`}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: y + tick + 8,
          transform: 'translateX(-50%)',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 60,
          color,
          whiteSpace: 'nowrap',
          textShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// =============================================================================
// TALLY GRID — the live Monte-Carlo panel: one cell per game, filling left→right.
// teal = the switch player won that game; slate = the switch player lost (stay won).
// =============================================================================
export const TallyGrid: React.FC<{
  trials: boolean[];
  shown: number;
  x: number; // top-left
  y: number;
  cols?: number;
  cell?: number;
  gap?: number;
  winColor?: string;
  loseColor?: string;
}> = ({ trials, shown, x, y, cols = 10, cell = 52, gap = 8, winColor = '#4db8a8', loseColor = '#586274' }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}>
    {trials.map((win, i) => {
      const on = i < shown;
      const justOn = i === shown - 1;
      return (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            borderRadius: 11,
            background: on ? (win ? winColor : loseColor) : 'rgba(255,255,255,0.05)',
            border: on ? `2px solid ${win ? winColor : loseColor}` : '2px solid rgba(255,255,255,0.09)',
            boxShadow: on && win ? `0 0 10px ${winColor}55` : 'none',
            transform: justOn ? 'scale(1.16)' : 'scale(1)',
          }}
        />
      );
    })}
  </div>
);

// =============================================================================
// BIG PCT — a large live percentage counter for the sim result.
// =============================================================================
export const BigPct: React.FC<{ x: number; y: number; label: string; value: number; color?: string; w?: number }> = ({
  x,
  y,
  label,
  value,
  color = '#4db8a8',
  w = 400,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, letterSpacing: 4, color, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 116, color: '#fff', lineHeight: 1.02 }}>
      {Math.round(value)}
      <span style={{ fontSize: 62, color }}>%</span>
    </div>
  </div>
);

// A tiny pulse helper for warm/hook emphasis (kept here so shots don't re-derive it).
export const usePulse = (period = 5, amp = 0.03) => {
  const frame = useCurrentFrame();
  return 1 + amp * Math.sin(frame / period);
};
