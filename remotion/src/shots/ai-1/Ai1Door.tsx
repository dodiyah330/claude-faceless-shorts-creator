import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { Captions, ProgressBar } from '../../lib/shorts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — "The Door", blue-man #1 (generative track).
// 6 Seedance 1.5 Pro clips (character locked in ai-video/blue-man/character.json),
// word-synced captions over a George v3 VO. Loop: shot 6 was generated with
// end_image_url == shot 1's frame 0, and the last 10 frames dissolve onto that
// exact still so frame 0 == last frame is pixel-true.
// =============================================================================
export const compositionConfig = {
  id: 'Ai1Door',
  durationInSeconds: 36.4,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#d2a854'; // the scarf yellow (sampled, character.json)
const TAIL = 8; // frames each shot under-laps the next for the crossfade

// shot boundaries in comp frames @30fps, cut on the real VO line starts
const SHOTS = [
  { src: 'projects/blue-man/01-desert-door.mp4', start: 0, end: 150 },
  { src: 'projects/blue-man/02-snow-walk.mp4', start: 150, end: 312 },
  { src: 'projects/blue-man/03-threshold.mp4', start: 312, end: 465 },
  { src: 'projects/blue-man/04-meadow-again.mp4', start: 465, end: 666 },
  { src: 'projects/blue-man/05-many-doors.mp4', start: 666, end: 885 },
  { src: 'projects/blue-man/06-loop-return.mp4', start: 885, end: 1092 },
] as const;

const LOOP_STILL = 'projects/blue-man/01-desert-door-frame0.png';
const LOOP_DISSOLVE = 10; // frames at the very end that settle onto frame 0's pixels

const Shot: React.FC<{ src: string; fadeIn: number }> = ({ src, fadeIn }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], {
    extrapolateRight: 'clamp',
  }) : 1;
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </AbsoluteFill>
  );
};

const LoopSettle: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, LOOP_DISSOLVE], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={staticFile(LOOP_STILL)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
  );
};

const Ai1Door: React.FC = () => {
  const total = SHOTS[SHOTS.length - 1].end;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SHOTS.map((s, i) => {
        const fadeIn = i === 0 ? 0 : TAIL;
        const from = i === 0 ? 0 : s.start - TAIL;
        const dur = s.end - from;
        return (
          <Sequence key={s.src} from={from} durationInFrames={dur}>
            <Shot src={s.src} fadeIn={fadeIn} />
          </Sequence>
        );
      })}
      <Sequence from={total - LOOP_DISSOLVE} durationInFrames={LOOP_DISSOLVE}>
        <LoopSettle />
      </Sequence>
      <Captions lines={VO} y={1430} size={54} accent={ACCENT} maxWords={4} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
};

export default Ai1Door;
