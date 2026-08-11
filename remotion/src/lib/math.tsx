// Math-shorts kit — big-digit choreography for mental-math videos.
// TimesElevenDemo animates the ×11 trick (split digits → sum pops above → the sum
// drops into the gap → optional carry flies onto the left digit → result flash);
// the same component drives every worked example with different cue frames.
import React from 'react';
import { Easing, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../fonts';
import { EASE_OUT, prog } from './shorts';

const OVERSHOOT = Easing.bezier(0.34, 1.4, 0.64, 1);

// =============================================================================
// DIGIT TILE — one big digit in a card; supports a rolling digit swap (carry).
// =============================================================================
export const DigitTile: React.FC<{
  x: number; // center
  y: number; // center
  size: number;
  digit: string;
  rollTo?: { digit: string; p: number }; // 0..1 rolls digit -> rollTo.digit
  color?: string;
  border?: string;
  opacity?: number;
  scale?: number;
  flash?: number; // 0..1 extra glow (carry landing / result)
  flashColor?: string;
}> = ({ x, y, size, digit, rollTo, color = '#ffffff', border = 'rgba(255,255,255,0.18)', opacity = 1, scale = 1, flash = 0, flashColor = '#f5d76e' }) => {
  if (opacity <= 0.01) return null;
  const fs = size * 0.6;
  const rollP = rollTo ? rollTo.p : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        background: 'rgba(255,255,255,0.05)',
        border: `3px solid ${flash > 0.02 ? flashColor : border}`,
        borderRadius: size * 0.13,
        boxShadow: flash > 0.02 ? `0 0 ${40 * flash}px ${flashColor}66, 0 14px 50px rgba(0,0,0,0.5)` : '0 14px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-rollP * size}px)` }}>
        {[digit, rollTo?.digit ?? ''].map((d, i) => (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: fs,
              color,
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// EQ ROW — a big staggered-pop equation line ("72 × 11 = ?").
// =============================================================================
export const EqRow: React.FC<{
  tokens: { t: string; color?: string; pulse?: boolean }[];
  y: number; // top of the row
  size?: number;
  gap?: number;
  warm?: boolean; // fully composed at frame 0 (hook rule)
}> = ({ tokens, y, size = 160, gap = 30, warm = false }) => {
  const rawFrame = useCurrentFrame();
  const frame = rawFrame + (warm ? 30 : 0);
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap,
      }}
    >
      {tokens.map((tok, i) => {
        const p = EASE_OUT(prog(frame, i * 4, i * 4 + 12));
        const pulse = tok.pulse ? 1 + 0.045 * Math.sin(rawFrame / 5) : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: size,
              color: tok.color ?? '#ffffff',
              opacity: p,
              transform: `translateY(${(1 - p) * 22}px) scale(${pulse})`,
              display: 'inline-block',
              textShadow: '0 6px 40px rgba(0,0,0,0.55)',
            }}
          >
            {tok.t}
          </span>
        );
      })}
    </div>
  );
};

// =============================================================================
// TIMES-ELEVEN DEMO — the whole worked example, cue frames are LOCAL.
// =============================================================================
export const TimesElevenDemo: React.FC<{
  a: number;
  b: number;
  t: { split: number; sum: number; drop: number; carry?: number; result: number };
  y?: number; // center of the tile row
  size?: number;
  accent?: string;
  good?: string;
}> = ({ a, b, t, y = 880, size = 210, accent = '#f5d76e', good = '#4db8a8' }) => {
  const frame = useCurrentFrame();
  const cx = 540;
  const sum = a + b;
  const hasCarry = sum > 9;
  const midDigit = String(hasCarry ? sum % 10 : sum);
  const leftEnd = hasCarry ? a + 1 : a;

  const sp = EASE_OUT(prog(frame, t.split, t.split + 16));
  const off = 115 + 120 * sp;
  const sumIn = EASE_OUT(prog(frame, t.sum, t.sum + 12));
  const dp = prog(frame, t.drop, t.drop + 18);
  const dropE = OVERSHOOT(dp);
  const cp = t.carry === undefined ? 0 : prog(frame, t.carry, t.carry + 20);
  const rollP = t.carry === undefined ? 0 : EASE_OUT(prog(frame, t.carry + 16, t.carry + 30));
  const carryFlash = t.carry === undefined ? 0 : Math.sin(Math.PI * prog(frame, t.carry + 14, t.carry + 36));
  const rp = prog(frame, t.result, t.result + 12);
  const resultPulse = 1 + 0.05 * Math.sin(Math.PI * rp);
  const done = rp > 0;

  const sumY = y - 300;
  const tileColor = done ? good : '#ffffff';
  const tileBorder = done ? good : 'rgba(255,255,255,0.18)';

  // sum-row digits, individually dimmable (the drop/carry digits "leave" the row)
  const sumDigits = String(sum).split('');
  const dimUnit = dp > 0 ? 0.22 : 1;
  const dimTens = cp > 0 ? 0.22 : 1;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* header */}
      <div
        style={{
          position: 'absolute',
          top: y - 460,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 66,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: 3,
        }}
      >
        {a}{b} × 11
      </div>

      {/* mini sum row */}
      {sumIn > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            top: sumY - 46,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            opacity: sumIn,
            transform: `translateY(${(1 - sumIn) * 16}px)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 80,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{a} + {b} =</span>
          {sumDigits.map((d, i) => {
            const isUnit = i === sumDigits.length - 1;
            const dim = isUnit ? dimUnit : dimTens;
            return (
              <span key={i} style={{ color: accent, opacity: dim, marginLeft: i === 0 ? 6 : 0 }}>
                {d}
              </span>
            );
          })}
        </div>
      ) : null}

      {/* outer digit tiles */}
      <DigitTile x={cx - off} y={y} size={size} digit={String(a)}
        rollTo={hasCarry ? { digit: String(a + 1), p: rollP } : undefined}
        color={tileColor} border={tileBorder} scale={resultPulse} flash={Math.max(carryFlash, 0)} flashColor={accent} />
      <DigitTile x={cx + off} y={y} size={size} digit={String(b)} color={tileColor} border={tileBorder} scale={resultPulse} />

      {/* the dropping middle digit */}
      {dp > 0 ? (
        <DigitTile
          x={cx + 100 * (1 - dropE)}
          y={sumY + (y - sumY) * dropE}
          size={size}
          digit={midDigit}
          color={done ? good : accent}
          border={done ? good : `${accent}aa`}
          scale={0.45 + 0.55 * dropE}
        />
      ) : null}

      {/* the flying carry "1" */}
      {cp > 0.01 && cp < 0.98 ? (
        <DigitTile
          x={cx + 62 + (cx - off - (cx + 62)) * cp}
          y={sumY + (y - size * 0.72 - sumY) * cp - 80 * Math.sin(Math.PI * cp)}
          size={92}
          digit="1"
          color={accent}
          border={`${accent}aa`}
        />
      ) : null}

      {/* result line */}
      {rp > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            top: y + size * 0.62 + 34,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 100,
            color: good,
            opacity: EASE_OUT(rp),
            transform: `translateY(${(1 - EASE_OUT(rp)) * 20}px)`,
            textShadow: '0 6px 40px rgba(0,0,0,0.5)',
          }}
        >
          = {leftEnd}{midDigit}{b}
        </div>
      ) : null}
    </div>
  );
};
