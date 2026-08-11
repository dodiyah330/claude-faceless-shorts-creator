import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import {
  BigTitle,
  Captions,
  Kicker,
  ProgressBar,
  ShortsBackdrop,
  StatChip,
  prog,
} from '../../lib/shorts';
import { BarPanel, bubbleSteps, quickSteps, raceState, seededShuffle } from '../../lib/algo';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short3Algo',
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
const PINK = '#e8879f';
const TEAL = '#4ecdc4';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);

// =============================================================================
// PRE-GENERATED DATA — the REAL race (same list, same replay speed for both)
// =============================================================================
const N = 20;
const INITIAL = seededShuffle(N, 7);
const BUBBLE = bubbleSteps(INITIAL); // 190 ops
const QUICK = quickSteps(INITIAL); // 78 ops
const OPS_PER_SEC = 14;
const RACE_START_LOC = 348; // global 15.0s − scene mount 3.4s
const bubbleDoneLoc = RACE_START_LOC + Math.ceil((BUBBLE.length / OPS_PER_SEC) * 30);
const quickDoneLoc = RACE_START_LOC + Math.ceil((QUICK.length / OPS_PER_SEC) * 30);
const doneLabel = (steps: { length: number }) => `DONE · ${(steps.length / OPS_PER_SEC).toFixed(1)}s`;

const PANEL = { x: 70, w: 940, h: 430 } as const;

const VsChip: React.FC<{ y: number }> = ({ y }) => (
  <div
    style={{
      position: 'absolute',
      top: y,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: 3,
        color: 'rgba(255,255,255,0.65)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: 999,
        padding: '8px 24px',
        background: 'rgba(10,12,16,0.6)',
      }}
    >
      VS
    </div>
  </div>
);

// =============================================================================
// SCENES
// =============================================================================
// Hook/loop: the race frozen at its most humiliating moment.
const HookScene: React.FC<{ mode: 'settle' | 'grow'; subtitle: string; chip?: string }> = ({ mode, subtitle, chip }) => {
  const frame = useCurrentFrame();
  const scale =
    mode === 'settle'
      ? 1.06 - 0.06 * EASE_INOUT(prog(frame, 0, 28))
      : 1.0 + 0.06 * EASE_INOUT(prog(frame, 0, 150));
  const bubble = raceState(INITIAL, BUBBLE, Math.floor(BUBBLE.length * 0.55));
  const quick = raceState(INITIAL, QUICK, QUICK.length);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <BigTitle
        lines={[
          { text: '1 LIST.', color: '#ffffff' },
          { text: '2 ALGORITHMS.', color: GOLD },
        ]}
        subtitle={subtitle}
        warm={mode === 'settle'}
      />
      <BarPanel x={PANEL.x} y={520} w={PANEL.w} h={390} label="Bubble sort" color={PINK} values={bubble.values} max={N} hi={bubble.hi} ops={bubble.ops} labelAt={-8} />
      <VsChip y={922} />
      <BarPanel x={PANEL.x} y={985} w={PANEL.w} h={390} label="Quick sort" color={TEAL} values={quick.values} max={N} hi={null} ops={quick.ops} labelAt={-8} doneAtFrame={mode === 'settle' ? -24 : 4} doneText={doneLabel(QUICK)} />
      {chip ? <Kicker text={chip} color={GREEN} y={436} at={mode === 'settle' ? -8 : 12} /> : null}
    </AbsoluteFill>
  );
};

// The persistent race: setup → GO → race (real replay) → why chips. One timeline.
const RaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = 1 - prog(frame, 986, 1002);
  const opsDone = Math.max(0, ((frame - RACE_START_LOC) / 30) * OPS_PER_SEC);
  const bubble = raceState(INITIAL, BUBBLE, opsDone);
  const quick = raceState(INITIAL, QUICK, opsDone);
  const goP = prog(frame, RACE_START_LOC, RACE_START_LOC + 8);
  const goOut = 1 - prog(frame, RACE_START_LOC + 26, RACE_START_LOC + 40);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Kicker text="THE SETUP" at={8} until={310} />
      <Kicker text="THE RACE" color={PINK} at={322} until={762} />
      <Kicker text="WHY IT MATTERS" at={774} until={996} />

      <BarPanel x={PANEL.x} y={430} w={PANEL.w} h={PANEL.h} label="Bubble sort" color={PINK} values={bubble.values} max={N} hi={bubble.hi} ops={bubble.ops} labelAt={18} doneAtFrame={bubbleDoneLoc} doneText={doneLabel(BUBBLE)} />
      <VsChip y={872} />
      <BarPanel x={PANEL.x} y={950} w={PANEL.w} h={PANEL.h} label="Quick sort" color={TEAL} values={quick.values} max={N} hi={quick.hi} ops={quick.ops} labelAt={176} doneAtFrame={quickDoneLoc} doneText={doneLabel(QUICK)} />

      {/* GO! flash on the start */}
      {goP > 0.01 && goOut > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            top: 880,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 140,
            color: GOLD,
            opacity: goP * goOut,
            transform: `scale(${1.6 - 0.6 * goP})`,
            textShadow: '0 8px 60px rgba(0,0,0,0.6)',
          }}
        >
          GO!
        </div>
      ) : null}

      <StatChip label="Bubble — n²" value={`${BUBBLE.length} operations`} color={PINK} x={70} y={262} at={774} />
      <StatChip label="Quick — n·log n" value={`${QUICK.length} operations`} color={GREEN} x={570} y={262} at={786} />
    </AbsoluteFill>
  );
};

const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: prog(frame, 0, 12) }}>
      <HookScene mode="grow" subtitle="what should I race next?" chip="COMMENT YOUR PICK" />
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const Short3Algo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0e141a' }}>
      <ShortsBackdrop base="#0e141a" glow="#16222e" />
      <Sequence from={0} durationInFrames={102}>
        <HookScene mode="settle" subtitle="same speed — no mercy" />
      </Sequence>
      <Sequence from={102} durationInFrames={1002}>
        <RaceScene />
      </Sequence>
      <Sequence from={1104} durationInFrames={156}>
        <LoopScene />
      </Sequence>
      <Captions lines={VO} y={1500} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short3Algo;
