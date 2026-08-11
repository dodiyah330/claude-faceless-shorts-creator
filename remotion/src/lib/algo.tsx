// Algorithm-race kit — instrumented sorts replayed frame-deterministically.
// Every op on screen is a REAL comparison/swap the algorithm performed on the same
// seeded shuffle; a race is honest by construction. Replay: opsDone = elapsed × opsPerSec.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import { EASE_OUT, prog } from './shorts';

// deterministic shuffle (LCG + Fisher-Yates) — Math.random is banned in renders
export const seededShuffle = (n: number, seed: number): number[] => {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  let s = (seed >>> 0) || 1;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export type SortOp = { a: number[]; hi: [number, number]; swap: boolean };

// classic bubble sort, one op per neighbor comparison (swap folded into the op)
export const bubbleSteps = (initial: number[]): SortOp[] => {
  const a = [...initial];
  const ops: SortOp[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      const doSwap = a[j] > a[j + 1];
      if (doSwap) [a[j], a[j + 1]] = [a[j + 1], a[j]];
      ops.push({ a: [...a], hi: [j, j + 1], swap: doSwap });
    }
  }
  return ops;
};

// quicksort (Lomuto), one op per pivot comparison + one per pivot placement
export const quickSteps = (initial: number[]): SortOp[] => {
  const a = [...initial];
  const ops: SortOp[] = [];
  const qs = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      const doSwap = a[j] < pivot;
      if (doSwap) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
      }
      ops.push({ a: [...a], hi: [j, hi], swap: doSwap });
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    ops.push({ a: [...a], hi: [i + 1, hi], swap: true });
    qs(lo, i);
    qs(i + 2, hi);
  };
  qs(0, a.length - 1);
  return ops;
};

// state after opsDone operations (scrub-safe: pure function of the step list)
export const raceState = (initial: number[], steps: SortOp[], opsDone: number) => {
  const k = Math.max(0, Math.min(steps.length, Math.floor(opsDone)));
  if (k === 0) return { values: initial, hi: null as [number, number] | null, ops: 0, done: false };
  const op = steps[k - 1];
  return { values: op.a, hi: k >= steps.length ? null : op.hi, ops: k, done: k >= steps.length };
};

// =============================================================================
// BAR PANEL — one racer: bars + label chip + live op counter + DONE badge.
// =============================================================================
export const BarPanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  values: number[];
  max: number;
  hi: [number, number] | null;
  ops: number;
  labelAt?: number; // local frame the label/counter pop in (negative = warm)
  doneAtFrame?: number; // local frame the DONE badge pops (omit = never)
  doneText?: string;
  good?: string;
}> = ({ x, y, w, h, label, color, values, max, hi, ops, labelAt = 0, doneAtFrame, doneText = 'DONE', good = '#4db8a8' }) => {
  const frame = useCurrentFrame();
  const labelIn = EASE_OUT(prog(frame, labelAt, labelAt + 10));
  const isDone = doneAtFrame !== undefined && frame >= doneAtFrame;
  const badgeIn = doneAtFrame === undefined ? 0 : EASE_OUT(prog(frame, doneAtFrame, doneAtFrame + 10));
  const pad = 22;
  const headH = 56;
  const n = values.length;
  const gap = 5;
  const bw = (w - pad * 2 - (n - 1) * gap) / n;
  const barArea = h - headH - pad * 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: 'rgba(255,255,255,0.035)',
        border: `2px solid ${isDone ? good + '88' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 24,
      }}
    >
      {/* label + counter */}
      <div style={{ position: 'absolute', top: 16, left: pad, right: pad, display: 'flex', justifyContent: 'space-between', opacity: labelIn }}>
        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, letterSpacing: 4, color, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: 'rgba(255,255,255,0.75)' }}>{ops} ops</span>
      </div>
      {/* bars */}
      {values.map((v, i) => {
        const active = !isDone && hi !== null && (i === hi[0] || i === hi[1]);
        const bh = Math.max(6, (v / max) * barArea);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pad + i * (bw + gap),
              bottom: pad,
              width: bw,
              height: bh,
              borderRadius: 5,
              background: isDone ? good : active ? color : 'rgba(255,255,255,0.72)',
            }}
          />
        );
      })}
      {/* DONE badge */}
      {badgeIn > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(-5deg) scale(${1.5 - 0.5 * badgeIn})`,
            opacity: badgeIn,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 58,
            letterSpacing: 4,
            color: good,
            border: `5px solid ${good}`,
            borderRadius: 14,
            padding: '6px 24px',
            background: 'rgba(10,12,14,0.8)',
            whiteSpace: 'nowrap',
          }}
        >
          {doneText}
        </div>
      ) : null}
    </div>
  );
};
