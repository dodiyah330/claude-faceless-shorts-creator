import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import {
  BigTitle,
  Captions,
  Kicker,
  PauseCard,
  ProgressBar,
  ShortsBackdrop,
  prog,
} from '../../lib/shorts';
import { EqRow, TimesElevenDemo } from '../../lib/math';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short2Math',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE CONSTANTS
// =============================================================================
const GOLD = '#f5d76e';
const GREEN = '#4db8a8';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);

// =============================================================================
// DATA — VO (text + exact word times) lives in ./vo.gen.ts (tools/gen_voice.py)
// =============================================================================

// =============================================================================
// SCENES
// =============================================================================
// Shared hook/loop look — the loop's last frame lands on the hook's frame 0.
const ChallengeScene: React.FC<{ mode: 'settle' | 'grow'; digits: string; chip: string; chipColor: string }> = ({
  mode,
  digits,
  chip,
  chipColor,
}) => {
  const frame = useCurrentFrame();
  const scale =
    mode === 'settle'
      ? 1.06 - 0.06 * EASE_INOUT(prog(frame, 0, 28))
      : 1.0 + 0.06 * EASE_INOUT(prog(frame, 0, 156));
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <BigTitle
        lines={[
          { text: 'MULTIPLY BY 11', color: '#ffffff' },
          { text: 'IN YOUR HEAD', color: GOLD },
        ]}
        subtitle="in two seconds — no calculator"
        warm={mode === 'settle'}
      />
      <EqRow
        tokens={[{ t: digits }, { t: '×', color: 'rgba(255,255,255,0.6)' }, { t: '11' }, { t: '=', color: 'rgba(255,255,255,0.6)' }, { t: '?', color: GOLD, pulse: true }]}
        y={780}
        size={170}
        warm={mode === 'settle'}
      />
      <Kicker text={chip} color={chipColor} y={1210} at={mode === 'settle' ? -8 : 10} />
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 8 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: prog(frame, 0, dur) }}>{children}</AbsoluteFill>;
};

const TeachScene: React.FC = () => (
  <FadeIn>
    <Kicker text="THE TRICK" at={6} until={352} />
    {/* mounted at global 3.4s; cues sync to the VO words split/add/drop/result */}
    <TimesElevenDemo a={7} b={2} t={{ split: 126, sum: 222, drop: 255, result: 309 }} />
  </FadeIn>
);

const QuizScene: React.FC = () => (
  <FadeIn>
    <Kicker text="YOUR TURN" color={GOLD} at={4} until={122} />
    <EqRow
      tokens={[{ t: '45' }, { t: '×', color: 'rgba(255,255,255,0.6)' }, { t: '11' }, { t: '=', color: 'rgba(255,255,255,0.6)' }, { t: '?', color: GOLD, pulse: true }]}
      y={700}
      size={170}
    />
    {/* global 16.8–19.4s */}
    <Sequence from={42} durationInFrames={78}>
      <PauseCard durSec={2.6} title="PAUSE" subtitle="add the digits…" y={1050} />
    </Sequence>
  </FadeIn>
);

const AnswerScene: React.FC = () => (
  <FadeIn>
    <Kicker text="CHECK" color={GREEN} at={4} until={132} />
    <TimesElevenDemo a={4} b={5} t={{ split: 18, sum: 42, drop: 60, result: 84 }} />
  </FadeIn>
);

const CarryScene: React.FC = () => (
  <FadeIn>
    <Kicker text="LEVEL 2 — THE CARRY" at={6} until={366} />
    <TimesElevenDemo a={8} b={5} t={{ split: 105, sum: 156, drop: 204, carry: 240, result: 306 }} />
  </FadeIn>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const Short2Math: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#12101c' }}>
      <ShortsBackdrop base="#12101c" glow="#241d3a" />
      <Sequence from={0} durationInFrames={102}>
        <ChallengeScene mode="settle" digits="72" chip="2 SECONDS · NO CALCULATOR" chipColor={GOLD} />
      </Sequence>
      <Sequence from={102} durationInFrames={360}>
        <TeachScene />
      </Sequence>
      <Sequence from={462} durationInFrames={126}>
        <QuizScene />
      </Sequence>
      <Sequence from={588} durationInFrames={138}>
        <AnswerScene />
      </Sequence>
      <Sequence from={726} durationInFrames={372}>
        <CarryScene />
      </Sequence>
      <Sequence from={1098} durationInFrames={162}>
        <ChallengeScene mode="grow" digits="63" chip="GO." chipColor={GREEN} />
      </Sequence>
      <Captions lines={VO} y={1500} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short2Math;
