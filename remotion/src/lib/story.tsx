// Storybook kit — animated stills for the image-driven STORY shorts (kids, manga…).
// One new niche lib for the whole story-shorts series. Ken-burns over a full-bleed AI
// image; base scale stays >= 1.12 so soft watercolor "paper" edges always crop OUTSIDE
// the 1080x1920 frame (the AI stills often bleed to a deckled white border). Motion
// varies per beat via `variant` so no two adjacent beats drift the same way.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE_INOUT, prog } from './shorts';

// Gentle motion presets: s = [scaleFrom, scaleTo]; x/y = translate % (within the zoom
// margin so an edge never shows). Min scale 1.12 => ~6% margin each side; |translate| <= 2%.
const MOVES = [
  { s: [1.12, 1.2], x: [0, -2], y: [0, -1.5] }, // slow zoom-in, drift up-left
  { s: [1.2, 1.12], x: [1.5, 0], y: [1, 0] }, //   slow zoom-out, settle
  { s: [1.12, 1.2], x: [-2, 1.5], y: [0, 0] }, //  zoom-in, pan right
  { s: [1.18, 1.12], x: [0, 0], y: [-1.5, 1] }, // ease-out, pan down
  { s: [1.12, 1.19], x: [2, -1], y: [0.5, -1] }, // zoom-in, pan left-up
  { s: [1.16, 1.22], x: [0, 1], y: [1, -1] }, //   push-in, drift (payoff)
] as const;

export const KenBurnsImage: React.FC<{
  src: string; //     staticFile path, e.g. 'projects/short-7-kids/b1-hook.png'
  dur: number; //     sequence length in frames (motion spans this)
  variant?: number; // index into MOVES
  fadeIn?: number; // frames to fade in (0 = fully composed at frame 0 — hook rule)
}> = ({ src, dur, variant = 0, fadeIn = 14 }) => {
  const frame = useCurrentFrame();
  const m = MOVES[variant % MOVES.length];
  const p = EASE_INOUT(prog(frame, 0, dur));
  const scale = m.s[0] + (m.s[1] - m.s[0]) * p;
  const tx = m.x[0] + (m.x[1] - m.x[0]) * p;
  const ty = m.y[0] + (m.y[1] - m.y[0]) * p;
  const opacity = fadeIn > 0 ? prog(frame, 0, fadeIn) : 1;
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
          transformOrigin: 'center center',
        }}
      />
    </AbsoluteFill>
  );
};

// Soft dark vignette to seat captions and focus the eye — gentle, storybook.
export const StoryVignette: React.FC<{ strength?: number }> = ({ strength = 0.42 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 108% 82% at 50% 44%, transparent 46%, rgba(20,16,30,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);
