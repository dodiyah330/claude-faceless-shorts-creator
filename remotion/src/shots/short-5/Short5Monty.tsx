import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import {
  BigTitle,
  Captions,
  EASE_INOUT,
  EASE_OUT,
  Kicker,
  PauseCard,
  ProgressBar,
  ShortsBackdrop,
  prog,
} from '../../lib/shorts';
import { BigPct, Brace, Door, ProbChip, TallyGrid, montyTrials } from '../../lib/prob';
import { FONT_DISPLAY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short5Monty',
  durationInSeconds: 43,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE + GEOMETRY
// =============================================================================
const GOLD = '#f5d76e';
const TEAL = '#4db8a8'; // switch / car / win

// Door 1 = your pick, Door 2 = car, Door 3 = the goat the host opens.
const CX = [220, 540, 860];
const DOOR = { w: 280, h: 440, topY: 620 };
const CONTENT: ('car' | 'goat')[] = ['goat', 'car', 'goat'];
const edgeL = (i: number) => CX[i] - DOOR.w / 2;
const edgeR = (i: number) => CX[i] + DOOR.w / 2;
// Odds live BELOW the doors ("YOUR PICK"/"SWITCH" tags live above, inside <Door>).
const CHIP_Y = DOOR.topY + DOOR.h + 14; // door-1 "1/3" pill
const BELOW_Y = DOOR.topY + DOOR.h + 28; // brace line hugging the door bottoms

// The real, deterministic simulation used by the proof beat (seed 15 -> switch 66 / stay 34).
const TRIALS = montyTrials(15, 100);

// =============================================================================
// SHARED DOOR STAGE — one geometry, every scene drives its state by frame.
// =============================================================================
const z = [0, 0, 0];
const DoorsStage: React.FC<{
  open?: number[];
  pickedP?: number[];
  switchP?: number[];
  removedP?: number[];
  glow?: number[];
}> = ({ open = z, pickedP = z, switchP = z, removedP = z, glow = z }) => (
  <>
    {CX.map((x, i) => (
      <Door
        key={i}
        x={x}
        y={DOOR.topY}
        w={DOOR.w}
        h={DOOR.h}
        n={String(i + 1)}
        content={CONTENT[i]}
        openP={open[i]}
        pickedP={pickedP[i]}
        switchP={switchP[i]}
        removedP={removedP[i]}
        glow={glow[i]}
      />
    ))}
  </>
);

const FadeIn: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 8 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: prog(frame, 0, dur) }}>{children}</AbsoluteFill>;
};

// =============================================================================
// HOOK / LOOP — the "two doors left" moment. Frame 0 fully composed; loop rhymes.
// =============================================================================
const HookScene: React.FC<{ mode: 'settle' | 'grow' }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const scale =
    mode === 'settle'
      ? 1.06 - 0.06 * EASE_INOUT(prog(frame, 0, 28))
      : 1.0 + 0.06 * EASE_INOUT(prog(frame, 0, 88)); // ends at 1.06 == frame-0 start
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <BigTitle
        lines={[
          { text: 'MONTY HALL', color: '#ffffff' },
          { text: "IT'S NOT 50 / 50", color: GOLD },
        ]}
        subtitle="switch or stay?"
        y={168}
        size={78}
        warm={mode === 'settle'}
      />
      {/* door 1 picked (closed), door 2 closed, door 3 open goat + eliminated */}
      <DoorsStage open={[0, 0, 1]} pickedP={[1, 0, 0]} removedP={[0, 0, 0.55]} />
    </AbsoluteFill>
  );
};

// =============================================================================
// SETUP — rewind to 3 closed doors, pick door 1, host opens door 3.
// =============================================================================
const SetupScene: React.FC = () => {
  const frame = useCurrentFrame();
  // cues synced to real word times (local = globalSec*30 - 102)
  const legend = EASE_OUT(prog(frame, 46, 72)); // "three doors — one car, two goats"
  const picked = EASE_OUT(prog(frame, 104, 124)); // "pick"
  const chip1 = EASE_OUT(prog(frame, 146, 165)); // "one in three"
  const open3 = EASE_OUT(prog(frame, 226, 258)); // "opens"
  return (
    <FadeIn>
      <Kicker text="THE SETUP" at={4} until={290} />
      {/* legend: what's behind the doors (which door — hidden) */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: legend,
          transform: `translateY(${(1 - legend) * 12}px)`,
          fontFamily: FONT_DISPLAY,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 3,
            color: 'rgba(255,255,255,0.9)',
            border: '2px solid rgba(255,255,255,0.18)',
            borderRadius: 999,
            padding: '10px 30px',
            background: 'rgba(10,13,20,0.5)',
          }}
        >
          🚗 1 CAR &nbsp;·&nbsp; 🐐 2 GOATS
        </span>
      </div>
      <DoorsStage open={[0, 0, open3]} pickedP={[picked, 0, 0]} />
      <ProbChip x={CX[0]} y={CHIP_Y} text="1/3" color={GOLD} p={chip1} />
    </FadeIn>
  );
};

// =============================================================================
// QUIZ — the pause gate over the two-doors state.
// =============================================================================
const QuizScene: React.FC = () => (
  <FadeIn>
    <Kicker text="YOUR CALL" color={GOLD} at={4} until={90} />
    <DoorsStage open={[0, 0, 1]} pickedP={[1, 0, 0]} />
    <Sequence from={6} durationInFrames={82}>
      <PauseCard durSec={2.6} title="STAY or SWITCH?" subtitle="pick one…" y={1200} accent={TEAL} />
    </Sequence>
  </FadeIn>
);

// =============================================================================
// REVEAL — the intuition. 1/3 on door 1 -> brace 2/3 over {2,3} -> door 3 removed,
// brace retracts onto door 2 -> door 2 = 2/3, switch doubles.
// =============================================================================
const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  // cues synced to real word times (local = globalSec*30 - 495)
  const chip1 = 1; // "1/3" carried in from setup/quiz
  const braceP = EASE_OUT(prog(frame, 102, 128)); // "two-thirds ... elsewhere"
  const removed3 = EASE_OUT(prog(frame, 210, 240)); // "the host clears away"
  const retract = EASE_INOUT(prog(frame, 232, 278)); // "the wrong door"
  const braceX2 = edgeR(2) - (edgeR(2) - edgeR(1)) * retract; // 1000 -> 680
  const glow2 = EASE_OUT(prog(frame, 330, 366)); // "sits on one door"
  const switch2 = EASE_OUT(prog(frame, 391, 414)); // "Switch —"
  const doubleP = EASE_OUT(prog(frame, 418, 442)); // "double your odds"
  return (
    <FadeIn>
      <Kicker text="THE MATH" color={GOLD} at={4} until={452} />
      <DoorsStage
        open={[0, 0, 1]}
        pickedP={[1, 0, 0]}
        switchP={[0, switch2, 0]}
        removedP={[0, 0, removed3]}
        glow={[0, glow2, 0]}
      />
      <ProbChip x={CX[0]} y={CHIP_Y} text="1/3" color={GOLD} p={chip1} />
      <Brace x1={edgeL(1)} x2={braceX2} y={BELOW_Y} label="2/3" color={TEAL} p={braceP} />
      {/* "×2" badge on the double beat */}
      {doubleP > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: CX[1] + 150,
            top: DOOR.topY + 40,
            transform: `translateX(-50%) scale(${0.8 + 0.2 * doubleP})`,
            opacity: doubleP,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 64,
            color: TEAL,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          ×2
        </div>
      ) : null}
    </FadeIn>
  );
};

// =============================================================================
// PROOF — the live 100-game simulation (real data). Grid fills, counters settle.
// =============================================================================
const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  // fill starts on "a hundred games" and completes on "two out of three" (local = globalSec*30 - 954)
  const shown = Math.round(prog(frame, 40, 130) * 100);
  const switchWins = TRIALS.slice(0, shown).filter(Boolean).length;
  const switchPct = shown > 0 ? (switchWins / shown) * 100 : 0;
  const stayPct = shown > 0 ? 100 - switchPct : 0;
  const summary = EASE_OUT(prog(frame, 130, 156));
  return (
    <FadeIn>
      <Kicker text="100 GAMES · ALWAYS SWITCH" color={TEAL} at={4} until={238} />
      <BigPct x={70} y={330} label="switch" value={switchPct} color={TEAL} />
      <BigPct x={610} y={330} label="stay" value={stayPct} color={GOLD} />
      <TallyGrid trials={TRIALS} shown={shown} x={244} y={560} cols={10} cell={52} gap={8} winColor={TEAL} loseColor="#586274" />
      <ProbChip x={540} y={1200} text="SWITCHING WINS ≈ 2 IN 3" color={TEAL} p={summary} />
    </FadeIn>
  );
};

// =============================================================================
// MAIN
// =============================================================================
const Short5Monty: React.FC = () => (
  <AbsoluteFill style={{ background: '#0e1119' }}>
    <ShortsBackdrop base="#0e1119" glow="#182234" />
    <Sequence from={0} durationInFrames={102}>
      <HookScene mode="settle" />
    </Sequence>
    <Sequence from={102} durationInFrames={297}>
      <SetupScene />
    </Sequence>
    <Sequence from={399} durationInFrames={96}>
      <QuizScene />
    </Sequence>
    <Sequence from={495} durationInFrames={459}>
      <RevealScene />
    </Sequence>
    <Sequence from={954} durationInFrames={246}>
      <ProofScene />
    </Sequence>
    <Sequence from={1200} durationInFrames={90}>
      <FadeIn dur={12}>
        <HookScene mode="grow" />
      </FadeIn>
    </Sequence>
    <Captions lines={VO} y={1500} accent={GOLD} />
    <ProgressBar color={GOLD} />
  </AbsoluteFill>
);

export default Short5Monty;
