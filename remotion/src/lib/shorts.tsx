// Vertical Shorts kit (1080x1920) — shared by every shorts/short-N video.
// Word-pop captions driven by a VO line map (estimated timings now; swap for real
// transcript timings later — components retime, nothing rebuilds).
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';

export const SHORT = { W: 1080, H: 1920, FPS: 30 } as const;
// Zones covered by Shorts/Reels/TikTok UI — keep critical info (esp. captions) OUT.
// bottom is LARGE on YouTube Shorts: the handle + title + description + right-side action
// buttons occupy the lower ~500px — captions must sit ABOVE ~y1420 or they collide (ch-3
// lesson from a real mobile screenshot).
export const SAFE = { top: 150, bottom: 500, right: 160, left: 60 } as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);

// 0..1 progress of t through [a,b], clamped — degenerate-range-proof.
export const prog = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / Math.max(0.0001, b - a)));

export type TimedWord = { w: string; start: number; end: number };
export type VoLine = { text: string; start: number; end: number; words?: TimedWord[] };

// Word timing for a line: use REAL alignment (from tools/gen_voice.py) when present;
// otherwise estimate by distributing the window weighted by word length.
export const timeWords = (line: VoLine): TimedWord[] => {
  if (line.words && line.words.length > 0) return line.words;
  const words = line.text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => Math.max(2, w.replace(/[^a-zA-Z0-9]/g, '').length) + 1.6);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = line.end - line.start;
  let t = line.start;
  return words.map((w, i) => {
    const d = (weights[i] / total) * span;
    const out = { w, start: t, end: t + d };
    t += d;
    return out;
  });
};

type Chunk = { words: TimedWord[]; start: number; end: number; hold: number };

// Split VO lines into caption chunks of <= maxWords; each chunk holds until the next
// chunk in the same line starts, or the line ends (+ a small tail between lines).
export const chunkLines = (lines: VoLine[], maxWords = 4): Chunk[] => {
  const chunks: Chunk[] = [];
  lines.forEach((line) => {
    const words = timeWords(line);
    for (let i = 0; i < words.length; i += maxWords) {
      const ws = words.slice(i, i + maxWords);
      chunks.push({ words: ws, start: ws[0].start, end: ws[ws.length - 1].end, hold: 0 });
    }
  });
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    c.hold = next ? Math.min(next.start, c.end + 0.6) : c.end + 0.8;
  });
  return chunks;
};

// =============================================================================
// CAPTIONS — one chunk at a time, active word pops in accent color.
// =============================================================================
export const Captions: React.FC<{
  lines: VoLine[];
  y?: number; // vertical center of the caption block
  size?: number;
  accent?: string;
  maxWords?: number;
  plate?: boolean; // dark pill behind the words — for compositions with light scenes
}> = ({ lines, y = 1280, size = 58, accent = '#f5d76e', maxWords = 4, plate = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunks = chunkLines(lines, maxWords);
  const active = chunks.find((c) => t >= c.start && t < c.hold);
  if (!active) return null;
  const enter = prog(t, active.start, active.start + 0.14);
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: y,
        transform: `translateY(${(1 - EASE_OUT(enter)) * 14 - 50}%)`,
        opacity: 0.25 + 0.75 * enter,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: size * 0.28,
          rowGap: size * 0.14,
          maxWidth: '100%',
          ...(plate
            ? {
                background: 'rgba(13,17,23,0.86)',
                borderRadius: 22,
                padding: `${size * 0.28}px ${size * 0.5}px`,
                boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
              }
            : {}),
        }}
      >
      {active.words.map((word, i) => {
        const started = prog(t, word.start, word.start + 0.12);
        const isActive = t >= word.start && t < word.end + 0.05;
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.15,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: isActive ? accent : '#ffffff',
              opacity: 0.3 + 0.7 * started,
              transform: `scale(${0.92 + 0.08 * EASE_OUT(started) + (isActive ? 0.05 : 0)})`,
              textShadow: '0 3px 26px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {word.w}
          </span>
        );
      })}
      </div>
    </div>
  );
};

// =============================================================================
// PROGRESS BAR — thin top bar over the whole composition.
// =============================================================================
export const ProgressBar: React.FC<{ color?: string }> = ({ color = '#f5d76e' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'rgba(255,255,255,0.12)' }}>
      <div style={{ width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`, height: '100%', background: color }} />
    </div>
  );
};

// =============================================================================
// KICKER — small beat-label pill, top center.
// =============================================================================
export const Kicker: React.FC<{ text: string; color?: string; y?: number; at?: number; until?: number }> = ({
  text,
  color = '#f5d76e',
  y = 180,
  at = 0,
  until,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 10);
  const out = until === undefined ? 1 : 1 - prog(frame, until - 8, until);
  const o = EASE_OUT(p) * out;
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
        transform: `translateY(${(1 - EASE_OUT(p)) * 12}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 6,
          textTransform: 'uppercase',
          color,
          border: `2px solid ${color}55`,
          borderRadius: 999,
          padding: '12px 30px',
          background: 'rgba(0,0,0,0.35)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// =============================================================================
// BIG TITLE — hook headline, up to two lines + optional subtitle.
// =============================================================================
export const BigTitle: React.FC<{
  lines: { text: string; color?: string }[];
  subtitle?: string;
  y?: number;
  size?: number;
  warm?: boolean; // true = fully composed at frame 0 (hook rule), animations pre-rolled
}> = ({ lines, subtitle, y = 190, size = 92, warm = false }) => {
  const frame = useCurrentFrame() + (warm ? 24 : 0);
  return (
    <div style={{ position: 'absolute', top: y, left: 40, right: 40, textAlign: 'center' }}>
      {lines.map((l, i) => {
        const p = EASE_OUT(prog(frame, i * 4, i * 4 + 12));
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.06,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: l.color ?? '#ffffff',
              opacity: 0.35 + 0.65 * p,
              transform: `translateY(${(1 - p) * 16}px)`,
              textShadow: '0 4px 30px rgba(0,0,0,0.6)',
            }}
          >
            {l.text}
          </div>
        );
      })}
      {subtitle ? (
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 40,
            color: 'rgba(255,255,255,0.82)',
            opacity: EASE_OUT(prog(frame, 10, 24)),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

// =============================================================================
// STAMP — rotated impact label (CHECKMATE / WRONG / SOLVED).
// =============================================================================
export const Stamp: React.FC<{
  text: string;
  at?: number;
  until?: number;
  color?: string;
  x?: number;
  y?: number;
  size?: number;
  rotate?: number;
}> = ({ text, at = 0, until, color = '#e8879f', x = 540, y = 940, size = 96, rotate = -8 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 9);
  const out = until === undefined ? 1 : 1 - prog(frame, until - 10, until);
  const o = p * out;
  if (o <= 0.01) return null;
  const scale = 1.7 - 0.7 * EASE_OUT(p);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        opacity: o,
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 6,
        textTransform: 'uppercase',
        color,
        border: `7px solid ${color}`,
        borderRadius: 18,
        padding: '10px 34px',
        background: 'rgba(10,10,14,0.72)',
        boxShadow: '0 10px 60px rgba(0,0,0,0.55)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

// =============================================================================
// PAUSE CARD — quiz gate with countdown ring. Mount inside its own <Sequence>.
// =============================================================================
export const PauseCard: React.FC<{ title?: string; subtitle?: string; durSec: number; accent?: string; y?: number }> = ({
  title = 'PAUSE',
  subtitle = 'can you find it?',
  durSec,
  accent = '#f5d76e',
  y = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = durSec * fps;
  const enter = EASE_OUT(prog(frame, 0, 10));
  const exit = 1 - prog(frame, total - 8, total);
  const ring = prog(frame, 6, total - 6);
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: y,
        transform: `translateY(-50%) scale(${0.94 + 0.06 * enter})`,
        opacity: enter * exit,
        background: 'rgba(12,14,20,0.92)',
        border: `2px solid ${accent}66`,
        borderRadius: 28,
        padding: '38px 44px',
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
      }}
    >
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={9} />
        <circle
          cx={55}
          cy={55}
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * ring}
          transform="rotate(-90 55 55)"
        />
        <polygon points="46,38 46,72 76,55" fill={accent} />
      </svg>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: 4, color: '#fff' }}>{title}</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 38, color: accent, marginTop: 6 }}>{subtitle}</div>
      </div>
    </div>
  );
};

// =============================================================================
// STAT CHIP — labeled stat pill for comparison beats.
// =============================================================================
export const StatChip: React.FC<{
  label: string;
  value: string;
  color?: string;
  x: number;
  y: number;
  w?: number;
  at?: number;
}> = ({ label, value, color = '#f5d76e', x, y, w = 440, at = 0 }) => {
  const frame = useCurrentFrame();
  const p = EASE_OUT(prog(frame, at, at + 12));
  if (p <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        background: 'rgba(12,14,20,0.9)',
        border: `2px solid ${color}66`,
        borderLeft: `10px solid ${color}`,
        borderRadius: 18,
        padding: '20px 26px',
      }}
    >
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 27, letterSpacing: 3, color, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: '#fff', marginTop: 8, lineHeight: 1.25 }}>
        {value}
      </div>
    </div>
  );
};

// =============================================================================
// BACKDROP — dark stage + vignette, shared look for shorts (per-niche theme later).
// =============================================================================
export const ShortsBackdrop: React.FC<{ base?: string; glow?: string }> = ({ base = '#0f1216', glow = '#1d2430' }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: base }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 55% at 50% 42%, ${glow} 0%, transparent 70%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse 120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
      }}
    />
  </AbsoluteFill>
);

// Dev-only safe-area guides — never mount in a final render.
export const SafeAreaGuides: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SAFE.top, background: 'rgba(255,0,0,0.12)' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: SAFE.bottom, background: 'rgba(255,0,0,0.12)' }} />
    <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: SAFE.right, background: 'rgba(255,165,0,0.12)' }} />
  </AbsoluteFill>
);
