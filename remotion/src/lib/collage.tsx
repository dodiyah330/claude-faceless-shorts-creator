import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { FONT_BODY, FONT_EDITORIAL } from '../fonts';

// =============================================================================
// vox collage kit — layered-collage documentary language (see vox/DESIGN.md)
// Every scene is a stack of layers on a paper board; a virtual camera pans/zooms
// across the board and layers carry depth for parallax. All motion frame-based.
// =============================================================================

export const VOX = {
  paper: '#efe6d3',
  paperDeep: '#e0d2b8',
  ink: '#282217',
  inkSoft: '#544a3a',
  red: '#c0392b',
  yellow: '#e8b73a',
  teal: '#33695d',
  cream: '#faf5ea',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.42, 0, 0.24, 1);
export const EASE_PLACE = Easing.bezier(0.22, 1.2, 0.36, 1); // settles with a soft overshoot

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// -----------------------------------------------------------------------------
// Camera — CollageBoard wraps a whole composition (or one scene). `cam` keyframes
// are BOARD-local frames (global when mounted at root). Layers read the camera
// displacement through context to add parallax by depth.
// -----------------------------------------------------------------------------
export type CamKey = { f: number; x: number; y: number; z: number };

const CamCtx = createContext({ offX: 0, offY: 0, zoom: 1 });

export const CollageBoard: React.FC<{
  cam: CamKey[]; // strictly increasing f; camera CENTER in canvas px + zoom
  children: React.ReactNode;
}> = ({ cam, children }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const fs = cam.map((k) => k.f);
  const camX = cam.length > 1 ? interpolate(frame, fs, cam.map((k) => k.x), { easing: EASE_INOUT, ...clamp }) : cam[0].x;
  const camY = cam.length > 1 ? interpolate(frame, fs, cam.map((k) => k.y), { easing: EASE_INOUT, ...clamp }) : cam[0].y;
  const zoom = cam.length > 1 ? interpolate(frame, fs, cam.map((k) => k.z), { easing: EASE_INOUT, ...clamp }) : cam[0].z;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `scale(${zoom}) translate(${W / 2 / zoom - camX}px, ${H / 2 / zoom - camY}px)`,
        }}
      >
        <CamCtx.Provider value={{ offX: camX - W / 2, offY: camY - H / 2, zoom }}>{children}</CamCtx.Provider>
      </div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Layer — shared entrance/idle/parallax engine. Positions are canvas px of the
// layer's CENTER. `at` is in the frames of the surrounding Sequence (local).
// -----------------------------------------------------------------------------
export type Enter = 'pop' | 'place' | 'slide-l' | 'slide-r' | 'rise' | 'fade' | 'wipe' | 'none';

const seedOf = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) % 1000;

export const Layer: React.FC<{
  x: number;
  y: number;
  w: number;
  at?: number;
  dur?: number;
  enter?: Enter;
  rotate?: number;
  depth?: number; // parallax: 0 = glued to board, 0.05–0.15 foreground, negative = far
  drift?: number; // idle "breathing" amplitude multiplier; 0 = static
  z?: number;
  children: React.ReactNode;
}> = ({ x, y, w, at = 0, dur = 14, enter = 'place', rotate = 0, depth = 0, drift = 1, z, children }) => {
  const frame = useCurrentFrame();
  const { offX, offY } = useContext(CamCtx);
  const seed = seedOf(x, y);

  const raw = interpolate(frame, [at, at + dur], [0, 1], { easing: enter === 'place' ? EASE_PLACE : EASE_OUT, ...clamp });
  if (frame < at) return null;

  // idle drift — every layer breathes, nothing ever fully freezes
  const dx = Math.sin(frame * 0.021 + seed) * 2.2 * drift;
  const dy = Math.cos(frame * 0.017 + seed * 1.7) * 2.6 * drift;
  const dr = Math.sin(frame * 0.012 + seed * 0.6) * 0.45 * drift;

  let ex = 0, ey = 0, sc = 1, rot = 0, op = 1;
  let clip: string | undefined;
  switch (enter) {
    case 'pop':
      sc = interpolate(raw, [0, 1], [0.55, 1]);
      op = interpolate(raw, [0, 0.35], [0, 1], clamp);
      break;
    case 'place': // dropped onto the paper by hand: shrinks + settles its rotation
      sc = interpolate(raw, [0, 1], [1.28, 1]);
      rot = interpolate(raw, [0, 1], [rotate > 0 ? 7 : -7, 0]);
      op = interpolate(raw, [0, 0.25], [0, 1], clamp);
      break;
    case 'slide-l':
      ex = interpolate(raw, [0, 1], [-w * 0.55 - 120, 0]);
      op = interpolate(raw, [0, 0.4], [0, 1], clamp);
      rot = interpolate(raw, [0, 1], [-3, 0]);
      break;
    case 'slide-r':
      ex = interpolate(raw, [0, 1], [w * 0.55 + 120, 0]);
      op = interpolate(raw, [0, 0.4], [0, 1], clamp);
      rot = interpolate(raw, [0, 1], [3, 0]);
      break;
    case 'rise':
      ey = interpolate(raw, [0, 1], [90, 0]);
      op = interpolate(raw, [0, 0.5], [0, 1], clamp);
      break;
    case 'wipe':
      clip = `inset(0 ${interpolate(raw, [0, 1], [100, 0])}% 0 0)`;
      break;
    case 'fade':
      op = raw;
      sc = interpolate(raw, [0, 1], [1.04, 1]);
      break;
    case 'none':
      break;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        zIndex: z,
        opacity: op,
        clipPath: clip,
        transform: `translate(-50%, -50%) translate(${-offX * depth + ex + dx}px, ${-offY * depth + ey + dy}px) rotate(${rotate + rot + dr}deg) scale(${sc})`,
      }}
    >
      {children}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Cutout — transparent PNG placed on the paper: white sticker edge + soft shadow.
// -----------------------------------------------------------------------------
export const Cutout: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  at?: number;
  dur?: number;
  enter?: Enter;
  rotate?: number;
  depth?: number;
  drift?: number;
  sticker?: number; // white outline px (0 = none)
  shadow?: number; // 0..3 elevation
  z?: number;
}> = ({ src, x, y, w, at, dur, enter, rotate, depth, drift, sticker = 5, shadow = 2, z }) => {
  const s = sticker;
  const outline = s > 0
    ? `drop-shadow(${s}px 0 0 ${VOX.cream}) drop-shadow(-${s}px 0 0 ${VOX.cream}) drop-shadow(0 ${s}px 0 ${VOX.cream}) drop-shadow(0 -${s}px 0 ${VOX.cream}) `
    : '';
  const soft = shadow > 0 ? `drop-shadow(0 ${8 * shadow}px ${10 * shadow}px rgba(40,28,12,${0.14 + 0.07 * shadow}))` : '';
  return (
    <Layer x={x} y={y} w={w} at={at} dur={dur} enter={enter} rotate={rotate} depth={depth} drift={drift} z={z}>
      <Img src={src} style={{ width: '100%', display: 'block', filter: outline + soft }} />
    </Layer>
  );
};

// -----------------------------------------------------------------------------
// ArchivalPhoto — bordered photo print, duotone/sepia treatment, optional tape.
// -----------------------------------------------------------------------------
export const ArchivalPhoto: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  at?: number;
  dur?: number;
  enter?: Enter;
  rotate?: number;
  depth?: number;
  drift?: number;
  tape?: boolean;
  treatment?: 'sepia' | 'mono' | 'none';
  caption?: string;
  z?: number;
}> = ({ src, x, y, w, at, dur, enter = 'place', rotate = -2, depth, drift, tape = true, treatment = 'sepia', caption, z }) => {
  const filt =
    treatment === 'sepia' ? 'grayscale(1) sepia(0.42) contrast(1.06) brightness(0.97)'
    : treatment === 'mono' ? 'grayscale(1) contrast(1.1)'
    : undefined;
  const tapeStyle: React.CSSProperties = {
    position: 'absolute',
    width: w * 0.22,
    height: w * 0.07,
    background: 'rgba(232,222,196,0.75)',
    boxShadow: '0 1px 4px rgba(40,28,12,0.18)',
  };
  return (
    <Layer x={x} y={y} w={w} at={at} dur={dur} enter={enter} rotate={rotate} depth={depth} drift={drift} z={z}>
      <div style={{ background: VOX.cream, padding: w * 0.035, paddingBottom: caption ? w * 0.035 : w * 0.05, boxShadow: '0 16px 34px rgba(40,28,12,0.3)' }}>
        <Img src={src} style={{ width: '100%', display: 'block', filter: filt }} />
        {caption ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: w * 0.042, fontWeight: 500, color: VOX.inkSoft, paddingTop: w * 0.028, letterSpacing: 0.4 }}>
            {caption}
          </div>
        ) : null}
      </div>
      {tape ? (
        <>
          <div style={{ ...tapeStyle, top: -w * 0.02, left: -w * 0.05, transform: 'rotate(-38deg)' }} />
          <div style={{ ...tapeStyle, top: -w * 0.02, right: -w * 0.05, transform: 'rotate(35deg)' }} />
        </>
      ) : null}
    </Layer>
  );
};

// -----------------------------------------------------------------------------
// PaperBG — the board surface: texture image (preferred) or flat cream, plus
// fibre grain and a soft vignette. Size it to the full canvas, depth ~ -0.06.
// -----------------------------------------------------------------------------
export const PaperBG: React.FC<{ src?: string; w: number; h: number; depth?: number }> = ({ src, w, h, depth = -0.06 }) => {
  const { offX, offY } = useContext(CamCtx);
  return (
    <div
      style={{
        position: 'absolute',
        left: -w * 0.05,
        top: -h * 0.05,
        width: w * 1.1,
        height: h * 1.1,
        background: VOX.paper,
        transform: `translate(${-offX * depth}px, ${-offY * depth}px)`,
      }}
    >
      {src ? <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 46%, rgba(52,38,18,0.24) 100%)' }} />
    </div>
  );
};

// Film grain over EVERYTHING (mount last, outside the board). Re-seeds every 2 frames.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity }}>
      <svg width="100%" height="100%">
        <filter id="voxgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(frame / 2)} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#voxgrain)" />
      </svg>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LabelChip — the white annotation tag (place names, dates, stats).
// -----------------------------------------------------------------------------
export const LabelChip: React.FC<{
  text: string;
  x: number;
  y: number;
  at?: number;
  size?: number;
  rotate?: number;
  accent?: string; // left bar color; omit for plain
  kicker?: string; // tiny overline
  kickerColor?: string; // defaults to accent — override when the accent is too light
  //                       for text on cream (e.g. VOX.yellow)
  depth?: number;
  z?: number;
}> = ({ text, x, y, at = 0, size = 30, rotate = -1.5, accent, kicker, kickerColor, depth = 0.02, z }) => (
  <Layer x={x} y={y} w={size * text.length * 0.75 + 60} at={at} dur={10} enter="pop" rotate={rotate} depth={depth} drift={0.7} z={z}>
    <div
      style={{
        display: 'inline-block',
        background: VOX.cream,
        borderLeft: accent ? `${Math.max(5, size * 0.2)}px solid ${accent}` : undefined,
        padding: `${size * 0.38}px ${size * 0.65}px`,
        boxShadow: '0 6px 16px rgba(40,28,12,0.25)',
        whiteSpace: 'nowrap',
      }}
    >
      {kicker ? (
        <div style={{ fontFamily: FONT_BODY, fontSize: size * 0.52, fontWeight: 600, letterSpacing: 2.2, color: kickerColor ?? accent ?? VOX.red, textTransform: 'uppercase', margin: 0 }}>
          {kicker}
        </div>
      ) : null}
      <div style={{ fontFamily: FONT_BODY, fontSize: size, fontWeight: 600, color: VOX.ink, margin: 0, lineHeight: 1.15 }}>{text}</div>
    </div>
  </Layer>
);

// -----------------------------------------------------------------------------
// SerifStatement — the big editorial line; each word rises in, optional words
// get a marker-highlight sweep once the line has landed.
// -----------------------------------------------------------------------------
export const SerifStatement: React.FC<{
  words: { t: string; hl?: boolean }[];
  x: number;
  y: number;
  w: number;
  at?: number;
  size?: number;
  color?: string;
  hlColor?: string;
  align?: 'left' | 'center';
  backing?: boolean; // cream strips behind every word — REQUIRED over busy layers (maps,
  //                    photos): bare ink and the yellow sweep both die against sepia tones
  depth?: number;
  z?: number;
}> = ({ words, x, y, w, at = 0, size = 64, color = VOX.ink, hlColor = VOX.yellow, align = 'center', backing = false, depth = 0.03, z }) => {
  const frame = useCurrentFrame();
  const allIn = at + words.length * 3 + 10;
  return (
    <Layer x={x} y={y} w={w} at={at} dur={1} enter="none" depth={depth} drift={0.5} z={z}>
      <div style={{ fontFamily: FONT_EDITORIAL, fontSize: size, fontWeight: 700, color, textAlign: align, lineHeight: backing ? 1.42 : 1.22, margin: 0 }}>
        {words.map((wd, i) => {
          const p = interpolate(frame, [at + i * 3, at + i * 3 + 9], [0, 1], { easing: EASE_OUT, ...clamp });
          const sweep = wd.hl ? interpolate(frame, [allIn, allIn + 12], [0, 100], { easing: EASE_INOUT, ...clamp }) : 0;
          const bg = wd.hl
            ? `linear-gradient(to right, ${hlColor} ${sweep}%, ${backing ? VOX.cream : 'transparent'} ${sweep}%)`
            : backing
              ? VOX.cream
              : undefined;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: p,
                transform: `translateY(${(1 - p) * 24}px)`,
                marginRight: backing ? size * 0.14 : size * 0.26,
                background: bg,
                padding: backing ? `${size * 0.06}px ${size * 0.18}px` : wd.hl ? `0 ${size * 0.08}px` : undefined,
                boxShadow: backing ? '0 5px 14px rgba(40,28,12,0.22)' : undefined,
              }}
            >
              {wd.t}
            </span>
          );
        })}
      </div>
    </Layer>
  );
};

// -----------------------------------------------------------------------------
// RubberStamp — red official stamp that slams onto the collage (bans, verdicts,
// dates). Keep text short and uppercase-worthy; it renders uppercase regardless.
// -----------------------------------------------------------------------------
export const RubberStamp: React.FC<{
  text: string;
  x: number;
  y: number;
  at?: number;
  size?: number;
  color?: string;
  rotate?: number;
  depth?: number;
  z?: number;
}> = ({ text, x, y, at = 0, size = 72, color = VOX.red, rotate = -11, depth = 0.04, z }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 7], [0, 1], { easing: EASE_PLACE, ...clamp });
  return (
    <Layer x={x} y={y} w={size * text.length + 120} at={at} dur={1} enter="none" rotate={rotate} depth={depth} drift={0.4} z={z}>
      <div
        style={{
          display: 'inline-block',
          opacity: interpolate(p, [0, 0.4, 1], [0, 0.95, 0.88]),
          transform: `scale(${interpolate(p, [0, 1], [2.1, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_EDITORIAL,
            fontWeight: 900,
            fontSize: size,
            letterSpacing: size * 0.08,
            textTransform: 'uppercase',
            color,
            border: `${Math.max(5, size * 0.09)}px solid ${color}`,
            borderRadius: size * 0.12,
            padding: `${size * 0.12}px ${size * 0.3}px`,
            whiteSpace: 'nowrap',
            mixBlendMode: 'multiply',
            margin: 0,
          }}
        >
          {text}
        </div>
      </div>
    </Layer>
  );
};

// -----------------------------------------------------------------------------
// SketchArrow / DashedRoute — hand-annotation strokes that draw themselves on.
// Both take a raw SVG path in CANVAS coordinates (vb = canvas w/h).
// -----------------------------------------------------------------------------
export const SketchArrow: React.FC<{
  d: string;
  vb: { w: number; h: number };
  at?: number;
  dur?: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  head?: boolean;
  id: string; // unique per instance (mask id)
  z?: number;
}> = ({ d, vb, at = 0, dur = 20, color = VOX.red, width = 7, dashed = false, head = true, id, z }) => {
  const frame = useCurrentFrame();
  const prog = interpolate(frame, [at, at + dur], [0, 1], { easing: EASE_INOUT, ...clamp });
  if (frame < at || prog <= 0.001) return null;
  const evolved = evolvePath(prog, d);
  const len = getLength(d);
  const tip = getPointAtLength(d, len * prog);
  const back = getPointAtLength(d, Math.max(0, len * prog - 26));
  const ang = (Math.atan2(tip.y - back.y, tip.x - back.x) * 180) / Math.PI;
  return (
    <svg viewBox={`0 0 ${vb.w} ${vb.h}`} style={{ position: 'absolute', left: 0, top: 0, width: vb.w, height: vb.h, overflow: 'visible', zIndex: z }}>
      {dashed ? (
        <>
          <mask id={id}>
            <path d={d} fill="none" stroke="#fff" strokeWidth={width * 3} strokeDasharray={evolved.strokeDasharray} strokeDashoffset={evolved.strokeDashoffset} />
          </mask>
          <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${width * 2.6} ${width * 2.2}`} mask={`url(#${id})`} />
        </>
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={evolved.strokeDasharray} strokeDashoffset={evolved.strokeDashoffset} />
      )}
      {head && prog > 0.06 ? (
        <g transform={`translate(${tip.x}, ${tip.y}) rotate(${ang})`}>
          <path d={`M 0 0 L ${-width * 3.2} ${-width * 1.9} M 0 0 L ${-width * 3.2} ${width * 1.9}`} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
        </g>
      ) : null}
    </svg>
  );
};
