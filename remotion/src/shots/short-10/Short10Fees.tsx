import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  ChartFrame,
  Curve,
  EndDot,
  GapArea,
  Legend,
  ShareBar,
  Ticker,
  contribSeries,
  lastPt,
  makeScale,
  money,
} from '../../lib/chart';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short10Fees',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e'; // the investor who pays no extra fee
const RED = '#ef5f6b'; // the 1% fee, and everything it eats
const GREY = '#8b96a5'; // what he merely deposited — the floor everything grows from
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE MATH — recomputed here at render time from the SAME formula as beats.json.money, so the
// curve that is drawn, the labels on its head, and the counted gap physically cannot disagree.
// $500/mo, 40 years, monthly compounding, deposit at month end:
//   7% net -> $1,312,407   ·   6% net -> $995,745   ·   gap $316,661 = 24.1% of the bigger pot.
// =============================================================================
const MONTHLY = 500;
const YEARS = 40;
const CLEAN = contribSeries(MONTHLY, 0.07, YEARS);
const FEE = contribSeries(MONTHLY, 0.06, YEARS);
// What he actually DEPOSITS — same series at 0% growth, i.e. a straight line to $240,000. It
// draws in during the setup (so the chart isn't empty while the narrator sets the scene) and
// then stays as a dim reference under both curves: everything above it is compounding, and the
// fee's $316,661 gap is bigger than every dollar he ever put in.
const PUT_IN = contribSeries(MONTHLY, 0, YEARS);
const CLEAN_FINAL = lastPt(CLEAN).y; // 1_312_406.70
const FEE_FINAL = lastPt(FEE).y; //   995_745.37
const GAP = CLEAN_FINAL - FEE_FINAL; // 316_661.33
const GAP_SHARE = GAP / CLEAN_FINAL; //      0.2413

// plot box — right edge at 910 keeps the curve heads and their labels clear of the Shorts
// UI button column (SAFE.right = 160px, i.e. anything past x=920).
const BOX = { x: 150, y: 540, w: 760, h: 520 };
const S = makeScale([0, YEARS], [0, 1_400_000], BOX);

// =============================================================================
// CUES — RETIMED to the REAL ElevenLabs word times (vo.gen.ts), not the script estimates.
// The estimates had the curves still growing at 21.3s while the narrator was already naming
// their final values — the labels would have read $1.0M / $780K under the words "one point
// three one million, versus nine hundred ninety six thousand". Every number on screen now
// lands on the word that says it. All cues are GLOBAL frames (the only nested Sequence is
// the PauseCard).
// =============================================================================
const HOOK_OUT = F(3.9);
const REWIND_IN = F(4.2); // the chart unwinds to year 0 — the rewind IS the setup
const REWIND_OUT = F(6.6);
const LEGEND_IN = F(5.0);
const PUTIN_IN = F(6.6); // the deposits line re-draws under "same five hundred a month..." (5.43)
const PUTIN_OUT = F(8.7);
const PAUSE_FROM = F(13.6); // "Pause." @ 13.70
const PAUSE_DUR = F(3.7); // ...through "cost him?" @ 17.35
const GROW_IN = F(17.4); // "Forty years of compounding..." @ 17.40 — "the gap opens up" @ 19.08
const GROW_OUT = F(21.6); // the curve heads LAND on their finals as he names them @ 21.30
const GOLD_SAY = F(21.3); // "One point three one million," @ 21.30–22.86
const GOLD_SAY_END = F(23.0);
const RED_SAY = F(23.4); // "nine hundred ninety six thousand." @ 23.44–25.62
const RED_SAY_END = F(25.7);
const COUNT_IN = F(26.0); // "That one percent cost him..." @ 26.00
const COUNT_OUT = F(28.9); // ...lands on "three hundred sixteen thousand dollars" @ 27.28–29.44
const SHARE_IN = F(30.6); // "But that's NOT one percent of his money" @ 30.88
const SLICE_IN = F(33.95); // "twenty four percent" @ 33.97–34.78
const SLICE_OUT = F(35.5);
// The loop can't start before he has SAID "a quarter" (38.44–38.84) — the ShareBar is the
// picture of those words. It restores through "gone." (39.57) and the tail.
const LOOP = F(39.3);
const END = F(42.0);

// a swell that rises, holds, and falls — used to make a number's chip react to its own word
const bump = (f: number, a: number, b: number) => Math.min(prog(f, a, a + 5), 1 - prog(f, b - 9, b));

// =============================================================================
// MAIN — ONE persistent chart, mounted at frame 0 and never unmounted. Frame 0 is the payoff:
// both curves complete, the gap shaded, the counter already on its final number. The SETUP
// rewinds that state away, and the REVEAL re-draws it — which is what makes the loop close
// for free: the end of the reveal IS frame 0 again.
// =============================================================================
const Short10Fees: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- growth: the single value everything on the chart is derived from ------------------
  // 1.0 at frame 0 (NOT ramped in from a component's own `at` — that renders blank at f0 and
  // is the bug that bit short-8/short-9), rewound to 0 through the setup, re-grown on the reveal.
  const rewound = EASE_INOUT(prog(f, REWIND_IN, REWIND_OUT)); // 0 -> 1
  const grown = EASE_INOUT(prog(f, GROW_IN, GROW_OUT)); // 0 -> 1
  const growth = Math.max(1 - rewound, grown);

  // the deposits line: full at frame 0, rewound with everything else, then re-drawn during the
  // setup — and from there it just stays (prog clamps at 1), including on the last frame.
  const putIn = Math.max(1 - rewound, prog(f, PUTIN_IN, PUTIN_OUT));

  // The gap counter is its OWN cue: the curves land first (under the words that name the two
  // pots), and only then does the counter run up to the gap (under the words that name IT).
  // Full at frame 0, rewound with everything else, counted up on the reveal.
  const count = Math.max(1 - rewound, EASE_INOUT(prog(f, COUNT_IN, COUNT_OUT)));

  // the head labels would sit on top of each other while both curves are still down in the
  // corner, so they only ride along once the curves have separated.
  const headLabels = prog(growth, 0.32, 0.5);

  // each pot's chip swells on the word that says its number
  const goldPulse = bump(f, GOLD_SAY, GOLD_SAY_END);
  const redPulse = bump(f, RED_SAY, RED_SAY_END);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 20) + prog(f, LOOP + 8, LOOP + 30));
  const legendOp = prog(f, LEGEND_IN, LEGEND_IN + 14) * (1 - prog(f, LOOP + 4, LOOP + 22));

  // TWIST: the ticker and the ShareBar occupy the same slot and cross-fade. The LOOP puts the
  // ticker back and takes the bar away — without that the last frame keeps a bar frame 0 has
  // never seen, and the loop visibly jumps.
  const shareOp = prog(f, SHARE_IN, SHARE_IN + 14) * (1 - prog(f, LOOP, LOOP + 12));
  // The counter is only on screen when it MEANS something: composed at frame 0, gone through the
  // setup, quiz and curve growth (a counter parked on $0 is dead pixels), back just before it
  // starts counting under "That one percent cost him...".
  const tickerLive = Math.max(1 - rewound, prog(f, COUNT_IN - 10, COUNT_IN));
  const tickerOp = Math.min(
    1,
    tickerLive * (1 - prog(f, SHARE_IN, SHARE_IN + 12)) + prog(f, LOOP + 4, LOOP + 18),
  );
  const sliceP = EASE_INOUT(prog(f, SLICE_IN, SLICE_OUT)) * (1 - prog(f, LOOP, LOOP + 10));

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#2a1c22" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'THE 1% FEE', color: '#ffffff' },
              { text: 'THAT EATS 24%', color: RED },
            ]}
            subtitle="of your retirement"
            y={150}
            size={84}
            warm
          />
        </div>

        <Kicker text="SAME SAVER · SAME 40 YEARS" color={GOLD} y={200} at={REWIND_IN} until={F(8.4)} />
        <Kicker text="ONE PAYS 1% MORE" color={RED} y={200} at={F(8.6)} until={F(13.4)} />
        <Kicker text="40 YEARS OF COMPOUNDING" color={GOLD} y={200} at={GROW_IN} until={F(30.2)} />
        <Kicker text="NOT 1% — 24%" color={RED} y={200} at={SHARE_IN} until={F(39.2)} />

        <ChartFrame scale={S} yTicks={[0, 400_000, 800_000, 1_200_000]} xTicks={[0, 10, 20, 30, 40]} />

        {/* what he DEPOSITED — the dim floor under both curves ($240K over 40 years) */}
        <Curve scale={S} pts={PUT_IN} color={GREY} p={putIn} width={5} glow={0} dashed opacity={0.75} />
        <EndDot
          scale={S}
          pts={PUT_IN}
          p={putIn}
          color={GREY}
          label="he put in"
          dy={-44}
          anchor="end"
          plate
          opacity={prog(putIn, 0.55, 0.8)}
        />

        {/* the gap is the argument: not a line, an AREA, and it opens up */}
        <GapArea scale={S} upper={CLEAN} lower={FEE} color={RED} p={growth} opacity={0.3} />
        <Curve scale={S} pts={FEE} color={RED} p={growth} width={8} />
        <Curve scale={S} pts={CLEAN} color={GOLD} p={growth} width={8} />

        {/* plated: the 6% head label lands ON the shaded gap, and red-on-red was unreadable */}
        <EndDot
          scale={S}
          pts={CLEAN}
          p={growth}
          color={GOLD}
          label="7% net"
          dy={-56}
          anchor="end"
          plate
          pulse={goldPulse}
          opacity={headLabels}
        />
        <EndDot
          scale={S}
          pts={FEE}
          p={growth}
          color={RED}
          label="6% net"
          dy={70}
          anchor="end"
          plate
          pulse={redPulse}
          opacity={headLabels}
        />

        <Legend
          items={[
            { color: GOLD, text: '$500/mo · 7% net' },
            { color: RED, text: '$500/mo · 6% net' },
          ]}
          x={196}
          y={572}
          opacity={legendOp}
        />

        {/* the counter reads the TRUE gap at whatever year the heads are at — it is derived
            from the same series as the curves, not animated to a hardcoded target */}
        <Ticker
          value={GAP}
          p={count}
          label="lost to the 1% fee"
          color={RED}
          x={540}
          y={1215}
          size={96}
          format={money}
          opacity={tickerOp}
        />

        <ShareBar
          x={150}
          y={1160}
          w={760}
          share={GAP_SHARE}
          p={sliceP}
          keepColor={GOLD}
          lostColor={RED}
          lostLabel={`${Math.round(GAP_SHARE * 100)}% GONE`}
          keepLabel="HIS $1.31M POT"
          opacity={shareOp}
        />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what does 1% cost him?" durSec={3.7} accent={GOLD} y={800} />
      </Sequence>

      <Captions lines={VO} y={1390} accent={GOLD} />
      <ProgressBar color={RED} />
    </AbsoluteFill>
  );
};

export default Short10Fees;
