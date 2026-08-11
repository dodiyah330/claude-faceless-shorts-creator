import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Captions, ProgressBar } from '../../lib/shorts';
import { KenBurnsImage, StoryVignette } from '../../lib/story';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — "Little Pip", faceless AI-image kids story (ages 4-6).
// 9 watercolor stills, ken-burns + crossfades, word-synced captions over a v3
// emotion-tagged VO (George). Beats align 1:1 to the VO lines.
// =============================================================================
export const compositionConfig = {
  id: 'Short7Kids',
  durationInSeconds: 55,
  fps: 30,
  width: 1080,
  height: 1920,
};

const AMBER = '#ffcf6e';
const TAIL = 20; // frames each beat under-laps the next so the crossfade never gaps

// beat -> [start, end] frame @30, aligned to VO line starts (0,5,9.5,14.5,20,25.5,31.5,39,45.5s)
const BEATS = [
  { src: 'projects/short-7-kids/b1-hook.jpg', start: 0, end: 150, variant: 0, fadeIn: 0 },
  { src: 'projects/short-7-kids/b2-play.jpg', start: 150, end: 285, variant: 2 },
  { src: 'projects/short-7-kids/b3-wander.jpg', start: 285, end: 435, variant: 1 },
  { src: 'projects/short-7-kids/b4-worry.jpg', start: 435, end: 600, variant: 3 },
  { src: 'projects/short-7-kids/b5-scared.jpg', start: 600, end: 765, variant: 4 },
  { src: 'projects/short-7-kids/b6-cry.jpg', start: 765, end: 945, variant: 1 },
  { src: 'projects/short-7-kids/b7-firefly.jpg', start: 945, end: 1170, variant: 0 },
  { src: 'projects/short-7-kids/b8-journey.jpg', start: 1170, end: 1365, variant: 2 },
  { src: 'projects/short-7-kids/b9-reunion.jpg', start: 1365, end: 1650, variant: 5 },
] as const;

const Short7Kids: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#efe6d6' }}>
      {BEATS.map((b, i) => {
        const isLast = i === BEATS.length - 1;
        const dur = b.end - b.start + (isLast ? 0 : TAIL);
        return (
          <Sequence key={i} from={b.start} durationInFrames={dur}>
            <KenBurnsImage src={b.src} dur={dur} variant={b.variant} fadeIn={'fadeIn' in b ? b.fadeIn : 16} />
          </Sequence>
        );
      })}
      <StoryVignette />
      <Captions lines={VO} y={1330} size={54} accent={AMBER} maxWords={4} plate />
      <ProgressBar color={AMBER} />
    </AbsoluteFill>
  );
};

export default Short7Kids;
