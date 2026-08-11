import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  CellView,
  FlashCue,
  FormulaBar,
  KeyCombo,
  SheetGrid,
  flashFillCol,
  pressPulse,
} from '../../lib/sheet';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short6Sheet',
  durationInSeconds: 38,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE + DATA
// =============================================================================
const GOLD = '#f5d76e';
const GREEN = '#54c982';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const KEYCAP_Y = 1122;

// The demo data — first names + emails are DERIVED from the names, so what Flash Fill
// "infers" on screen is the real pattern (no hand-faked outputs). Mirrors beats.json.
const NAMES = ['Jane Doe', 'Marcus Lee', 'Priya Patel', 'Chen Wei', 'Amir Hassan', 'Sofia Rossi', 'Liam Murphy', 'Nina Kaur'];
const FIRST = NAMES.map((n) => n.split(' ')[0]);
const EMAIL = NAMES.map((n) => `${n.toLowerCase().replace(' ', '.')}@acme.com`);

// Persistent-grid scene mounts at global 3.4s (frame 102). Cue frames below are LOCAL:
// local_f = round(global_s * 30) − 102.  (The recurring Sequence-frame bug — checked.)
const SHEET_FROM = 102;
const L = (s: number) => Math.round(s * 30) - SHEET_FROM;
const D1: FlashCue = { typeStart: L(12.6), typeEnd: L(14.7), cascadeStart: L(17.6), stagger: 5.4 };
const D2: FlashCue = { typeStart: L(27.0), typeEnd: L(28.6), cascadeStart: L(29.4), stagger: 4.8 };
const D1_CTRL_E = L(16.0);
const D2_CTRL_E = L(29.0);
const ACTIVE_SWITCH = L(22.6); // formula bar moves B2 → C2 after demo 1 settles

// =============================================================================
// SCENES
// =============================================================================
// Hook / loop: the grid composed at its payoff — messy names beside clean first names,
// Ctrl+E glowing. Same grid geometry as the live scene so the loop rhymes seamlessly.
const HookScene: React.FC<{ mode: 'settle' | 'grow' }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const scale =
    mode === 'settle'
      ? 1.06 - 0.06 * EASE_INOUT(prog(frame, 0, 28))
      : // grow reaches 1.06 by the loop's last frame so it wraps seamlessly onto frame 0
        1.0 + 0.06 * EASE_INOUT(prog(frame, 0, 88));
  const glow = 0.55 + 0.45 * Math.abs(Math.sin(frame / 14));
  const cells: CellView[][] = NAMES.map((n, i) => [
    { text: n },
    { text: FIRST[i], flash: 0.4, box: i === 0 ? 'sel' : null },
    { text: '' },
  ]);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <BigTitle
        lines={[
          { text: 'EXCEL READS', color: '#ffffff' },
          { text: 'YOUR MIND', color: GOLD },
        ]}
        y={150}
        size={82}
        warm={mode === 'settle'}
      />
      <SheetGrid theme="excel" cells={cells} />
      <KeyCombo keys={['Ctrl', 'E']} y={KEYCAP_Y} glow={glow} />
    </AbsoluteFill>
  );
};

// The persistent demo: reset → type Jane → Ctrl+E → column B cascades → type an email →
// Ctrl+E → column C builds itself. One grid, one timeline.
const SheetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = 1 - prog(frame, 930, 948);

  const colB = flashFillCol(FIRST, D1, frame);
  const colC = flashFillCol(EMAIL, D2, frame);
  const cells: CellView[][] = NAMES.map((n, i) => [{ text: n }, colB[i], colC[i]]);

  // Active cell for the formula bar + a resting selection box on the example cell.
  const activeCol = frame < ACTIVE_SWITCH ? 1 : 2;
  const ac = cells[0][activeCol];
  if (!ac.box) ac.box = 'sel';
  const fbRef = `${activeCol === 1 ? 'B' : 'C'}2`;

  const press = Math.max(pressPulse(frame, D1_CTRL_E), pressPulse(frame, D2_CTRL_E));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Kicker text="THE MANUAL WAY" at={8} until={262} />
      <Kicker text="FLASH FILL · CTRL + E" color={GREEN} at={272} until={700} />
      <Kicker text="IT READS ANY PATTERN" color={GREEN} at={710} until={962} />
      <FormulaBar theme="excel" cellRef={fbRef} content={ac.text} cursor={!!ac.cursor} />
      <SheetGrid theme="excel" cells={cells} />
      <KeyCombo keys={['Ctrl', 'E']} y={KEYCAP_Y} press={press} glow={0.5 + 0.5 * press} />
    </AbsoluteFill>
  );
};

// The loop is a silent reset that dissolves the filled sheet back into the intro
// composition — no outro card, no comment-bait. The last frame == frame 0.
const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: prog(frame, 0, 12) }}>
      <HookScene mode="grow" />
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const Short6Sheet: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#153322" />
      <Sequence from={0} durationInFrames={102}>
        <HookScene mode="settle" />
      </Sequence>
      <Sequence from={SHEET_FROM} durationInFrames={948}>
        <SheetScene />
      </Sequence>
      <Sequence from={1050} durationInFrames={90}>
        <LoopScene />
      </Sequence>
      <Captions lines={VO} y={1300} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short6Sheet;
