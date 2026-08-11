import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../brand';
import { FONT_MONO } from '../fonts';

// =============================================================================
// terminal.tsx — a reusable DARK terminal window for the pipeline (npm / shell
// command beats). GitHub-ink dark scale from brand.ts. Lines reveal at their
// `at` frame; a `cmd` line can TYPE its command char-by-char (type: true), with
// a block cursor while typing. Colour-coded output: dim/warn/err/ok/path.
// Built for the electron-boilerplate lesson; keep it generic + brand-consistent.
// =============================================================================

const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export type TermKind = 'cmd' | 'out' | 'dim' | 'warn' | 'err' | 'ok' | 'path';
export type TermLine = {
  text: string;
  kind?: TermKind;
  at?: number; // reveal frame (default 0)
  type?: boolean; // for cmd: type the command out char-by-char from `at`
  cps?: number; // type speed, chars per frame (default ~0.9)
  gap?: number; // extra top margin px (visual grouping)
  hl?: string; // optional highlight-bar color behind this line (e.g. a "found it" row)
  hlAt?: number; // frame the highlight bar fades in (default: this line's `at`)
};

const KIND_COLOR: Record<TermKind, string> = {
  cmd: '#e6edf3',
  out: COLORS.d300,
  dim: COLORS.d400,
  warn: COLORS.warn,
  err: COLORS.danger,
  ok: COLORS.signal,
  path: COLORS.accent,
};

const Dot: React.FC<{ c: string }> = ({ c }) => (
  <div style={{ width: 13, height: 13, borderRadius: 999, background: c }} />
);

export const TerminalWindow: React.FC<{
  box: { x: number; y: number; w: number; h: number };
  lines: TermLine[];
  title?: string;
  promptPath?: string; // shown before each `cmd` line, e.g. "my-app"
  fontSize?: number;
  lineH?: number;
  appearAt?: number;
  pad?: number;
}> = ({ box, lines, title = 'my-app — zsh', promptPath = 'my-app', fontSize = 23, lineH = 35, appearAt = 0, pad = 30 }) => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, f = 0, t = 1, e = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [f, t], { ...CLAMP, easing: e });

  const winOp = r(appearAt, appearAt + 10);
  const winY = r(appearAt, appearAt + 12, 26, 0);
  const blink = Math.floor(frame / 15) % 2 === 0; // ~2Hz cursor

  return (
    <div
      style={{
        position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h,
        opacity: winOp, transform: `translateY(${winY}px)`,
        background: COLORS.d900, borderRadius: RADIUS.window,
        border: `1px solid ${COLORS.d600}`, boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
        overflow: 'hidden', fontFamily: FONT_MONO,
      }}
    >
      {/* title bar */}
      <div style={{ height: 44, background: COLORS.d800, borderBottom: `1px solid ${COLORS.d600}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 9 }}>
        <Dot c="#ff5f57" /><Dot c="#febc2e" /><Dot c="#28c840" />
        <div style={{ marginLeft: 16, color: COLORS.d400, fontSize: 16, letterSpacing: 0.3 }}>{title}</div>
      </div>

      {/* body */}
      <div style={{ padding: pad, fontSize, lineHeight: `${lineH}px` }}>
        {lines.map((ln, i) => {
          const at = ln.at ?? 0;
          if (frame < at) return null;
          const kind = ln.kind ?? 'out';
          const op = r(at, at + 7);
          const y = r(at, at + 9, 8, 0);

          // typing effect for a command line
          let shown = ln.text;
          let typing = false;
          if (kind === 'cmd' && ln.type) {
            const cps = ln.cps ?? 0.9;
            const n = Math.floor((frame - at) * cps);
            typing = n < ln.text.length;
            shown = ln.text.slice(0, Math.max(0, n));
          }

          // optional highlight bar behind the line (fades in at hlAt, or at reveal)
          const hlIn = ln.hl ? r(ln.hlAt ?? at, (ln.hlAt ?? at) + 10) : 0;

          return (
            <div key={i} style={{ position: 'relative', opacity: op, transform: `translateY(${y}px)`, marginTop: ln.gap ?? 0, whiteSpace: 'pre-wrap', display: 'flex' }}>
              {ln.hl && hlIn > 0 && (
                <div
                  style={{
                    position: 'absolute', left: -pad * 0.5, right: -pad * 0.5, top: -2, bottom: -2,
                    background: `${ln.hl}22`, border: `1px solid ${ln.hl}88`, borderRadius: 7,
                    opacity: hlIn,
                  }}
                />
              )}
              {kind === 'cmd' && (
                <span style={{ color: COLORS.signal, marginRight: 12, flexShrink: 0, position: 'relative' }}>
                  ➜ <span style={{ color: '#5ec8e6' }}>{promptPath}</span>
                </span>
              )}
              <span style={{ color: KIND_COLOR[kind], position: 'relative' }}>
                {shown}
                {kind === 'cmd' && typing && blink && <span style={{ background: '#e6edf3', color: '#e6edf3', marginLeft: 1 }}>█</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
