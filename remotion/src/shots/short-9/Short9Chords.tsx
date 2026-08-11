import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { ChordChip, Keyboard, Lit, SongStamp, strike } from '../../lib/piano';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short9Chords',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const VIOLET = '#9b7cc4';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE CHORDS — triads mirror beats.json exactly. Only the triad LIGHTS; gen_chords.py also
// plays a bass root an octave or two below (audio-only), which would clutter the keyboard.
// =============================================================================
type ChordId = 'C' | 'G' | 'Am' | 'F';
const CHORDS: Record<ChordId, { label: string; roman: string; triad: string[] }> = {
  C: { label: 'C', roman: 'I', triad: ['C4', 'E4', 'G4'] },
  G: { label: 'G', roman: 'V', triad: ['G3', 'B3', 'D4'] },
  Am: { label: 'Am', roman: 'vi', triad: ['A3', 'C4', 'E4'] },
  F: { label: 'F', roman: 'IV', triad: ['F3', 'A3', 'C4'] },
};

// THE SCHEDULE — every chord press, in global seconds. This is the same list as
// beats.json.piano.schedule, and sfx-plan.json places the audio one-shots at these exact times.
// One source of truth: the sound cannot drift from the picture.
type Press = { at: number; chord: ChordId; song?: string; artist?: string };
const SCHEDULE: Press[] = [
  { at: F(4.6), chord: 'C' },
  { at: F(5.9), chord: 'G' },
  { at: F(7.2), chord: 'Am' },
  { at: F(8.5), chord: 'F' },

  { at: F(16.4), chord: 'C', song: 'Let It Be', artist: 'The Beatles' },
  { at: F(17.9), chord: 'G', song: 'With or Without You', artist: 'U2' },
  { at: F(19.4), chord: 'Am', song: 'No Woman No Cry', artist: 'Bob Marley' },
  { at: F(20.9), chord: 'F' },
  { at: F(22.4), chord: 'C', song: "Don't Stop Believin'", artist: 'Journey' },
  { at: F(23.9), chord: 'G', song: 'Someone Like You', artist: 'Adele' },
  { at: F(25.4), chord: 'Am', song: 'All Too Well', artist: 'Taylor Swift' },
  { at: F(26.9), chord: 'F' },

  { at: F(30.0), chord: 'Am' },
  { at: F(31.5), chord: 'F' },
  { at: F(33.0), chord: 'C' },
  { at: F(34.5), chord: 'G' },
  { at: F(36.0), chord: 'Am', song: 'Africa', artist: 'Toto' },
  { at: F(37.5), chord: 'F', song: 'Apologize', artist: 'OneRepublic' },

  { at: F(39.6), chord: 'C' },
];

const REVEAL_SONGS = SCHEDULE.filter((p) => p.song && p.at < F(28.8));
const TWIST_SONGS = SCHEDULE.filter((p) => p.song && p.at >= F(28.8));

// =============================================================================
// CUES
// =============================================================================
const HOOK_OUT = F(3.9);
const SETUP_IN = F(4.2);
const PAUSE_FROM = F(12.7);
const PAUSE_DUR = F(3.5);
const REVEAL_IN = F(16.2);
const SONGS_CLEAR = F(28.9); // the reveal list wipes before the rotation
const TWIST_IN = F(29.2);
const ROTATE = F(30.0); // the chips physically re-order — same four, new starting point
const LOOP = F(39.0);
const END = F(42.0);

// chip row geometry — four chips across, and the rotation slides them between these slots
const CHIP_W = 200;
const CHIP_GAP = 32;
const ROW_W = 4 * CHIP_W + 3 * CHIP_GAP;
const CHIP_X0 = (1080 - ROW_W) / 2;
const slotX = (i: number) => CHIP_X0 + i * (CHIP_W + CHIP_GAP);

const ORDER: ChordId[] = ['C', 'G', 'Am', 'F']; // I  V  vi IV
const ROTATED: ChordId[] = ['Am', 'F', 'C', 'G']; // vi IV I  V  — the documented rotation

// =============================================================================
// MAIN — one keyboard, mounted at frame 0, never unmounted. Chords light and decay on it; the
// twist rotates the SAME four keys rather than introducing new ones. That is the whole point.
// =============================================================================
const Short9Chords: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.06 - 0.06 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.06 * EASE_INOUT(prog(f, LOOP, END));

  // ---- which keys are glowing right now -------------------------------------------------
  // Frame 0 must be fully composed (hook rule), so before the first press all four chords sit
  // lit at a resting glow — the payoff is visible in the thumbnail.
  const preroll = 1 - prog(f, SETUP_IN, SETUP_IN + 14);
  const loopBack = prog(f, LOOP + 6, LOOP + 30); // and they come back for the loop
  const resting = Math.max(preroll, loopBack);

  const lit: Lit[] = [];
  if (resting > 0.01) {
    // uniform gold, not alternating colours — "these 8 keys are the whole song", one statement
    (Object.keys(CHORDS) as ChordId[]).forEach((id) => {
      CHORDS[id].triad.forEach((n) => lit.push({ note: n, color: GOLD, amount: 0.42 * resting }));
    });
  }
  // Release is SHORTER than the 1.5s between presses, so the chord that is sounding reads clearly
  // instead of smearing into the previous one. (At the 1.5s default they all overlapped and the
  // keyboard turned into a wash of gold.)
  SCHEDULE.forEach((p) => {
    const a = strike(f, p.at, 30, 0.9);
    if (a > 0.01) CHORDS[p.chord].triad.forEach((n) => lit.push({ note: n, color: GOLD, amount: a }));
  });

  // ---- chip row: which chord is sounding, and where each chip sits ----------------------
  const lastPress = [...SCHEDULE].reverse().find((p) => f >= p.at);
  const rot = EASE_INOUT(prog(f, ROTATE, ROTATE + 26)) * (1 - EASE_INOUT(prog(f, LOOP, LOOP + 26)));

  const titleOp = 1 - prog(f, HOOK_OUT, HOOK_OUT + 20) + prog(f, LOOP + 10, LOOP + 34);
  const songsOut = prog(f, SONGS_CLEAR, SONGS_CLEAR + 12);

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#241d33" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: Math.min(1, titleOp) }}>
          <BigTitle
            lines={[
              { text: 'THE 4 CHORDS', color: '#ffffff' },
              { text: 'IN EVERY HIT', color: GOLD },
            ]}
            y={150}
            size={80}
            warm={f < LOOP}
          />
        </div>

        <Kicker text="C · G · Am · F" color={GOLD} y={190} at={SETUP_IN} until={F(12.4)} />
        <Kicker text="I · V · vi · IV" color={GOLD} y={190} at={F(9.0)} until={F(12.4)} />
        <Kicker text="SAME 4 CHORDS" color={GOLD} y={190} at={REVEAL_IN} until={F(28.6)} />
        <Kicker text="NOW ROTATE THEM" color={VIOLET} y={190} at={TWIST_IN} until={F(38.9)} />

        {/* The song list stacks through the reveal, then wipes before the rotation. It lives in the
            band ABOVE the chip row (which starts at y=760) — an earlier pass started it at 430 and
            the sixth song landed on top of the C and G chips. */}
        {REVEAL_SONGS.map((p, i) => (
          <SongStamp
            key={`r${i}`}
            title={p.song!}
            artist={p.artist!}
            y={342 + i * 70}
            at={p.at + 2}
            until={SONGS_CLEAR}
          />
        ))}
        {/* the rotation's songs — different progression, different songs, same four keys.
            `until` matters: without it these two survived to the last frame, and frame 0 has no
            song list, so the loop visibly jumped. */}
        {TWIST_SONGS.map((p, i) => (
          <SongStamp
            key={`t${i}`}
            title={p.song!}
            artist={p.artist!}
            y={480 + i * 70}
            at={p.at + 2}
            until={LOOP}
            color={VIOLET}
          />
        ))}

        {/* chip row — the chords themselves. On the twist they SLIDE into the rotated order,
            which is the visual argument: nothing new arrived, they just re-ordered. */}
        {ORDER.map((id) => {
          const from = ORDER.indexOf(id);
          const to = ROTATED.indexOf(id);
          const x = slotX(from) + (slotX(to) - slotX(from)) * rot;
          const active = lastPress?.chord === id ? strike(f, lastPress.at, 30, 0.8) : 0;
          return (
            <ChordChip
              key={id}
              label={CHORDS[id].label}
              roman={CHORDS[id].roman}
              x={x}
              y={760}
              w={CHIP_W}
              color={rot > 0.5 ? VIOLET : GOLD}
              // NEGATIVE, so the chips are already fully faded in AT frame 0 — the hook rule.
              // at={0} is not enough: ChordChip ramps in over 12 frames from `at`, so frame 0
              // would still be blank. (Keying them to each chord's first press was worse still —
              // the thumbnail was a lit keyboard with no chord names on it at all.)
              at={-14}
              active={active}
            />
          );
        })}

        <Keyboard from="C3" to="C5" lit={lit} x={40} y={1010} w={1000} h={290} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="where have you heard this?" durSec={3.5} accent={GOLD} y={560} />
      </Sequence>

      <Captions lines={VO} y={1370} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short9Chords;
