// Chess board renderer for TSX shorts — pure frame-driven, no chess engine needed:
// moves are scripted (from/to/at) and replayed deterministically at any frame, so
// scrubbing, rewinds and captures all work. Piece art: cburnett set (Wikimedia
// Commons, GPL/BSD/GFDL tri-license — the set Lichess uses) in public/chess/.
import React from 'react';
import { Easing, Img, staticFile, useCurrentFrame } from 'remotion';
import { FONT_MONO } from '../fonts';

export type Sq = string; // 'e4'
export type Piece = 'wK' | 'wQ' | 'wR' | 'wB' | 'wN' | 'wP' | 'bK' | 'bQ' | 'bR' | 'bB' | 'bN' | 'bP';
export type BoardMap = Record<string, Piece>;

const FILES = 'abcdefgh';
const SLIDE = Easing.bezier(0.4, 0, 0.2, 1);
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);

const prog = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / Math.max(0.0001, b - a)));

// col/row in render space (0,0 = top-left square)
export const sqRC = (sq: Sq, flip = false) => {
  const f = FILES.indexOf(sq[0]);
  const r = Number(sq[1]) - 1;
  return { col: flip ? 7 - f : f, row: flip ? r : 7 - r };
};

// Pixel center of a square within the inner board (size = 8 squares).
export const sqCenter = (sq: Sq, size: number, flip = false) => {
  const s = size / 8;
  const { col, row } = sqRC(sq, flip);
  return { x: col * s + s / 2, y: row * s + s / 2 };
};

// Parse the placement field of a FEN ("rnbq.../...") into a BoardMap.
export const fenBoard = (placement: string): BoardMap => {
  const map: BoardMap = {};
  placement.split('/').forEach((row, i) => {
    const rank = 8 - i;
    let file = 0;
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') file += Number(ch);
      else {
        map[FILES[file] + rank] = ((ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase()) as Piece;
        file++;
      }
    }
  });
  return map;
};

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

export type BoardMove = {
  from: Sq;
  to: Sq;
  at: number; // local frame the slide starts
  dur?: number; // slide length in frames (default 14)
  restore?: { sq: Sq; code: Piece }; // fade a piece back in (for rewinds / un-captures)
};

export type Highlight = { sq: Sq; color: string; at?: number; until?: number };
export type Arrow = { from: Sq; to: Sq; color: string; at?: number; until?: number; dashed?: boolean };

type Sprite = { code: Piece; col: number; row: number; opacity: number; lift: number; key: string };

// Replay the move list up to `frame` and return renderable sprites.
export const boardAtFrame = (start: BoardMap, moves: BoardMove[], frame: number, flip = false): Sprite[] => {
  const state = new Map<Sq, { code: Piece; key: string }>();
  Object.entries(start).forEach(([sq, code]) => state.set(sq, { code, key: `${code}@${sq}` }));
  const flights: Sprite[] = [];
  const extras: Sprite[] = [];

  const sorted = [...moves].sort((a, b) => a.at - b.at);
  for (const m of sorted) {
    if (frame < m.at) continue;
    const dur = m.dur ?? 14;
    const t = Math.min(1, (frame - m.at) / dur);
    const mover = state.get(m.from);
    if (!mover) continue;
    const victim = state.get(m.to);
    if (t >= 1) {
      state.delete(m.from);
      state.set(m.to, mover); // victim (if any) is overwritten = captured
      if (m.restore) state.set(m.restore.sq, { code: m.restore.code, key: `r@${m.restore.sq}:${m.at}` });
    } else {
      const e = SLIDE(t);
      state.delete(m.from);
      const a = sqRC(m.from, flip);
      const b = sqRC(m.to, flip);
      flights.push({
        code: mover.code,
        col: a.col + (b.col - a.col) * e,
        row: a.row + (b.row - a.row) * e,
        opacity: 1,
        lift: Math.sin(Math.PI * t),
        key: mover.key,
      });
      if (victim) {
        state.delete(m.to);
        extras.push({ ...sqRC(m.to, flip), code: victim.code, opacity: Math.max(0, 1 - Math.max(0, (t - 0.45) / 0.4)), lift: 0, key: victim.key });
      }
      if (m.restore) {
        extras.push({ ...sqRC(m.restore.sq, flip), code: m.restore.code, opacity: t, lift: 0, key: `r@${m.restore.sq}:${m.at}` });
      }
    }
  }

  const statics: Sprite[] = [];
  state.forEach(({ code, key }, sq) => statics.push({ ...sqRC(sq, flip), code, opacity: 1, lift: 0, key }));
  return [...statics, ...extras, ...flights];
};

export type BoardTheme = { light: string; dark: string; frame: string; label: string };
export const CLASSIC: BoardTheme = { light: '#F0D9B5', dark: '#B58863', frame: '#241d16', label: '#00000055' };

// =============================================================================
// CHESS BOARD — mount inside a <Sequence>; all `at` frames are local to it.
// =============================================================================
export const ChessBoard: React.FC<{
  size: number; // inner board size in px (8 squares)
  board: BoardMap;
  moves?: BoardMove[];
  highlights?: Highlight[];
  arrows?: Arrow[];
  flip?: boolean;
  theme?: BoardTheme;
  x?: number;
  y?: number;
}> = ({ size, board, moves = [], highlights = [], arrows = [], flip = false, theme = CLASSIC, x = 0, y = 0 }) => {
  const frame = useCurrentFrame();
  const s = size / 8;
  const pad = Math.round(s * 0.16);
  const sprites = boardAtFrame(board, moves, frame, flip);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size + pad * 2,
        height: size + pad * 2,
        background: theme.frame,
        borderRadius: Math.round(s * 0.22),
        boxShadow: '0 24px 90px rgba(0,0,0,0.55)',
        padding: pad,
      }}
    >
      <div style={{ position: 'relative', width: size, height: size, borderRadius: Math.round(s * 0.08), overflow: 'hidden' }}>
        {/* squares + coordinate labels */}
        {Array.from({ length: 64 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const dark = (col + row) % 2 === 1;
          const fileLabel = row === 7 ? (flip ? FILES[7 - col] : FILES[col]) : null;
          const rankLabel = col === 0 ? (flip ? String(row + 1) : String(8 - row)) : null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: col * s,
                top: row * s,
                width: s,
                height: s,
                background: dark ? theme.dark : theme.light,
              }}
            >
              {fileLabel ? (
                <span style={{ position: 'absolute', right: s * 0.06, bottom: s * 0.02, fontFamily: FONT_MONO, fontSize: s * 0.18, fontWeight: 700, color: theme.label }}>
                  {fileLabel}
                </span>
              ) : null}
              {rankLabel ? (
                <span style={{ position: 'absolute', left: s * 0.06, top: s * 0.04, fontFamily: FONT_MONO, fontSize: s * 0.18, fontWeight: 700, color: theme.label }}>
                  {rankLabel}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* highlights */}
        {highlights.map((h, i) => {
          const at = h.at ?? 0;
          const p = EASE_OUT(prog(frame, at, at + 8));
          const out = h.until === undefined ? 1 : 1 - prog(frame, h.until - 10, h.until);
          const o = p * out;
          if (o <= 0.01) return null;
          const { col, row } = sqRC(h.sq, flip);
          return (
            <div
              key={`h${i}`}
              style={{
                position: 'absolute',
                left: col * s + s * 0.03,
                top: row * s + s * 0.03,
                width: s * 0.94,
                height: s * 0.94,
                borderRadius: s * 0.12,
                background: `${h.color}55`,
                border: `${Math.max(3, s * 0.045)}px solid ${h.color}`,
                opacity: o,
                transform: `scale(${0.85 + 0.15 * p})`,
              }}
            />
          );
        })}

        {/* pieces */}
        {sprites.map((sp) => (
          <Img
            key={sp.key}
            src={staticFile(`library/chess/${sp.code}.svg`)}
            style={{
              position: 'absolute',
              left: sp.col * s + s * 0.04,
              top: sp.row * s + s * 0.04,
              width: s * 0.92,
              height: s * 0.92,
              opacity: sp.opacity,
              transform: `scale(${1 + 0.09 * sp.lift})`,
              filter: sp.lift > 0.01 ? `drop-shadow(0 ${s * 0.09 * sp.lift}px ${s * 0.12 * sp.lift}px rgba(0,0,0,0.45))` : undefined,
            }}
          />
        ))}

        {/* arrows */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
          {arrows.map((a, i) => {
            const at = a.at ?? 0;
            const p = EASE_OUT(prog(frame, at, at + 9));
            const out = a.until === undefined ? 1 : 1 - prog(frame, a.until - 10, a.until);
            const o = Math.min(1, p * 2) * out * 0.9;
            if (o <= 0.01) return null;
            const c1 = sqCenter(a.from, size, flip);
            const c2 = sqCenter(a.to, size, flip);
            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const len = Math.max(1, Math.hypot(dx, dy));
            const ux = dx / len;
            const uy = dy / len;
            const sx = c1.x + ux * s * 0.3;
            const sy = c1.y + uy * s * 0.3;
            const ex = c2.x - ux * s * 0.34;
            const ey = c2.y - uy * s * 0.34;
            const tx = sx + (ex - sx) * p;
            const ty = sy + (ey - sy) * p;
            const headLen = s * 0.34;
            const headW = s * 0.4;
            const bx = tx - ux * headLen;
            const by = ty - uy * headLen;
            const px = -uy;
            const py = ux;
            return (
              <g key={`a${i}`} opacity={o}>
                <line
                  x1={sx}
                  y1={sy}
                  x2={bx}
                  y2={by}
                  stroke={a.color}
                  strokeWidth={s * 0.16}
                  strokeLinecap="round"
                  strokeDasharray={a.dashed ? `${s * 0.22} ${s * 0.18}` : undefined}
                />
                <polygon
                  points={`${tx},${ty} ${bx + px * (headW / 2)},${by + py * (headW / 2)} ${bx - px * (headW / 2)},${by - py * (headW / 2)}`}
                  fill={a.color}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
