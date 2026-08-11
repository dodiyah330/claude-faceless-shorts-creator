import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { TerminalWindow, TermLine } from '../../lib/terminal';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short4Reflog',
  durationInSeconds: 34,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE
// =============================================================================
const GOLD = '#f5d76e';
const GREEN = '#54c982';
const PINK = '#e8879f';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);

// The terminal frame — the persistent canvas. Same box everywhere so the loop's
// fresh-disaster terminal overlays the main terminal's frame-0 pixel-for-pixel.
const BOX = { x: 58, y: 280, w: 964, h: 900 };
const TERM = { fontSize: 27, lineH: 43, pad: 28, title: 'my-app — zsh', promptPath: 'my-app' } as const;

// The verified git session (see script.md). Cue `at` frames are keyed to the VO
// line STARTS (tight timing pass — no dead air): L1 git-log 4.45s, L4 reflog 12.8s,
// L6 highlight 18.35s, L7 restore 21.25s, L8 restored-log 24.2s, L9 twist 27.35s.
const DISASTER: TermLine[] = [
  { kind: 'cmd', text: 'git reset --hard HEAD~3', at: -5 },
  { kind: 'err', text: 'HEAD is now at 3f9a1c2 init', at: -5 },
];

const SESSION: TermLine[] = [
  ...DISASTER,
  // confirm the loss (L1 @ 4.45s)
  { kind: 'cmd', text: 'git log --oneline', type: true, at: 134 },
  { kind: 'out', text: '3f9a1c2 init', at: 160 },
  // the rescue — reflog (cmd L4 @ 12.8s; output cascades right after, settled as L5 @ 15.4s narrates it)
  { kind: 'cmd', text: 'git reflog', type: true, at: 384, gap: 10 },
  { kind: 'out', text: '3f9a1c2 HEAD@{0}: reset: moving to HEAD~3', at: 414 },
  { kind: 'out', text: 'e5c07d3 HEAD@{1}: commit: add payments', at: 426, hl: GOLD, hlAt: 560 },
  { kind: 'out', text: 'b21f6a9 HEAD@{2}: commit: add cart', at: 438 },
  { kind: 'out', text: '7d4e8b0 HEAD@{3}: commit: add auth', at: 450 },
  { kind: 'out', text: '3f9a1c2 HEAD@{4}: commit (initial): init', at: 462 },
  // restore (cmd L7 @ 21.25s)
  { kind: 'cmd', text: 'git reset --hard e5c07d3', type: true, at: 637, gap: 10 },
  { kind: 'ok', text: 'HEAD is now at e5c07d3 add payments', at: 690 },
  { kind: 'cmd', text: 'git log --oneline', type: true, at: 726 },
  { kind: 'ok', text: 'e5c07d3 add payments', at: 746 },
  { kind: 'ok', text: 'b21f6a9 add cart', at: 758 },
  { kind: 'ok', text: '7d4e8b0 add auth', at: 770 },
  { kind: 'ok', text: '3f9a1c2 init', at: 782 },
  // the twist, as a terminal comment (L9 @ 27.35s)
  { kind: 'dim', text: '# resets · rebases · deleted branches', at: 820, gap: 10 },
];

// =============================================================================
// SCENES
// =============================================================================
// The hook / loop headline. Only the TITLE carries the punch-in scale so the
// terminal underneath stays at scale 1 in both the hook and the loop — the loop's
// last frame (scale 1.06) lands exactly on the hook's frame-0 (scale 1.06).
const TitleCard: React.FC<{ mode: 'settle' | 'grow' }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const scale =
    mode === 'settle'
      ? 1.06 - 0.06 * EASE_INOUT(prog(frame, 0, 26))
      : 1.0 + 0.06 * EASE_INOUT(prog(frame, 0, 96));
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 150px', transform: `scale(${scale})` }}>
      <BigTitle
        lines={[
          { text: 'UNDO ANY', color: '#ffffff' },
          { text: 'GIT MISTAKE', color: GOLD },
        ]}
        y={80}
        size={70}
        warm={mode === 'settle'}
      />
    </div>
  );
};

const Term: React.FC<{ lines: TermLine[]; appearAt?: number }> = ({ lines, appearAt = -40 }) => (
  <TerminalWindow
    box={BOX}
    lines={lines}
    title={TERM.title}
    promptPath={TERM.promptPath}
    fontSize={TERM.fontSize}
    lineH={TERM.lineH}
    pad={TERM.pad}
    appearAt={appearAt}
  />
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const Short4Reflog: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0d1117' }}>
      <ShortsBackdrop base="#0d1117" glow="#161b22" />

      {/* persistent terminal — mounted from frame 0 so line `at` == global frame */}
      <Sequence from={0} durationInFrames={950} name="session">
        <FadeOut from={918} to={943}>
          <Term lines={SESSION} />
        </FadeOut>
      </Sequence>

      {/* hook headline over the frozen disaster (terminal shows only the 2 reset lines at f0) */}
      <Sequence from={0} durationInFrames={132} name="hook">
        <FadeOut from={108} to={130}>
          <TitleCard mode="settle" />
        </FadeOut>
      </Sequence>

      {/* section labels + impact stamps (global time) */}
      <Kicker text="THE DISASTER" color={PINK} y={205} at={138} until={372} />
      <Kicker text="THE FIX" color={GREEN} y={205} at={384} until={812} />
      <Stamp text="GONE?" color={PINK} x={560} y={560} at={165} until={300} rotate={-9} />
      <Stamp text="RESTORED" color={GREEN} x={540} y={980} at={775} until={858} rotate={-7} />

      {/* loop — dissolve back to a fresh disaster + headline; last frame == frame 0.
          Inside this Sequence useCurrentFrame is LOCAL (0 at global 905), so the
          fade + TitleCard 'grow' are authored in local frames. */}
      <Sequence from={905} durationInFrames={115} name="loop">
        <FadeIn from={0} to={40}>
          <Term lines={DISASTER} appearAt={-999} />
          <TitleCard mode="grow" />
        </FadeIn>
      </Sequence>

      <Captions lines={VO} y={1270} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

// Root-relative opacity envelopes (children keep their own global frame).
const FadeOut: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: 1 - prog(frame, from, to) }}>{children}</AbsoluteFill>;
};
const FadeIn: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: prog(frame, from, to) }}>{children}</AbsoluteFill>;
};

export default Short4Reflog;
