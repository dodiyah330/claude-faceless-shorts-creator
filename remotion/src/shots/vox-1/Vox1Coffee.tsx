import React from 'react';
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  ArchivalPhoto,
  CollageBoard,
  Cutout,
  Grain,
  LabelChip,
  PaperBG,
  RubberStamp,
  SerifStatement,
  SketchArrow,
  VOX,
} from '../../lib/collage';

// =============================================================================
// COMPOSITION CONFIG — "How Coffee Conquered the World", first real vox short.
// Beats + VO contract: vox/vox-1-coffee/beats.json. Facts verified 2026-07-14.
// =============================================================================
export const compositionConfig = {
  id: 'Vox1Coffee',
  durationInSeconds: 40.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const W = 1080;
const H = 1920;
const asset = (f: string) => staticFile(`projects/vox-1-coffee/layers/${f}`);

// =============================================================================
// CUES (GLOBAL frames @30) — estimated from beats.json windows; retimed to real
// word starts after gen_voice.py writes actual times. Keep every cue HERE.
// =============================================================================
// RETIMED to gen_voice.py's real word times (beats.json, 2026-07-14 run).
const CUE = {
  hookTitle: 4,
  hookCup: 18,
  hookChip: 45,
  ethChip: 165, //         "Ethiopian" 5.49s
  route: 395, //           "crossed" 13.15s
  mochaChip: 427, //       "Yemen" 14.22s
  banStart: 570, //        scene mount; "Rulers" hits 19.2s (f576)
  sultanIn: 580,
  mecca: 617, //           "Mecca" 20.58s
  stamp: 626, //           "banned" 20.88s
  cairo: 672, //           "Cairo" 22.40s
  konst: 717, //           "sultan" 23.91s
  houseStart: 795, //      scene mount; line starts 26.8s (f804)
  photoIn: 846, //         "coffeehouse" 28.19s
  statement: 935, //       "ideas" 31.16s (hl sweep lands with "revolutions" 32.26s)
  todayStart: 1010, //     scene mount; camera heads home
  cupBack: 1026, //        "Today" 34.20s
  titleBack: 1060,
  statChip: 1087, //       "billion" 36.22s
} as const;

// Camera: one journey — push on hook, dive into the map, widen for the ban,
// settle on the coffeehouse, return to the page-1 wide framing for the loop.
const CAM = [
  { f: 0, x: 540, y: 960, z: 1 },
  { f: 130, x: 540, y: 960, z: 1.06 },
  { f: 205, x: 430, y: 840, z: 1.6 },
  { f: 540, x: 445, y: 830, z: 1.66 },
  { f: 576, x: 445, y: 830, z: 1.66 },
  { f: 612, x: 600, y: 900, z: 1.26 },
  { f: 770, x: 610, y: 905, z: 1.3 },
  { f: 815, x: 540, y: 930, z: 1.05 },
  { f: 1000, x: 540, y: 940, z: 1.03 },
  { f: 1050, x: 540, y: 960, z: 1 },
  { f: 1214, x: 540, y: 960, z: 1 },
];

// Map geometry (map layer 1000px wide, centered 540/960; points are source fractions)
const MAP = { cx: 540, cy: 960, w: 1000 };
const mapPt = (fx: number, fy: number) => ({
  x: MAP.cx - MAP.w / 2 + fx * MAP.w,
  y: MAP.cy - MAP.w / 2 + fy * MAP.w,
});
const ETH = mapPt(0.24, 0.52);
const YEM = mapPt(0.56, 0.27);
const ROUTE = `M ${ETH.x} ${ETH.y} Q ${(ETH.x + YEM.x) / 2 + 40} ${ETH.y - 60} ${YEM.x} ${YEM.y}`;

const TITLE_WORDS = [{ t: 'How' }, { t: 'coffee', hl: true }, { t: 'conquered' }, { t: 'the' }, { t: 'world' }];

// Fades a whole scene's layers out over its last `dur` local frames.
const SceneFade: React.FC<{ out: number; dur?: number; children: React.ReactNode }> = ({ out, dur = 14, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [out - dur, out], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: op }}>{children}</div>;
};

const Vox1Coffee: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: VOX.paper }}>
      <CollageBoard cam={CAM}>
        <PaperBG src={asset('paper.png')} w={W} h={H} />

        {/* ---- HOOK (0–5.3s): title + cup, slow push ---- */}
        <Sequence from={0} durationInFrames={160} layout="none">
          <SceneFade out={157}>
            <SerifStatement x={540} y={400} w={960} at={CUE.hookTitle} size={82} words={TITLE_WORDS} />
            <Cutout src={asset('cup.png')} x={540} y={1120} w={600} at={CUE.hookCup} enter="place" rotate={2.5} depth={0.08} shadow={3} />
            <LabelChip x={540} y={1560} at={CUE.hookChip} text="It started on a hillside" kicker="Chapter one" accent={VOX.red} size={34} rotate={-1.2} />
          </SceneFade>
        </Sequence>

        {/* ---- MAP scenery (persists under ban + coffeehouse, leaves before the loop) ---- */}
        <Sequence from={140} durationInFrames={880} layout="none">
          <SceneFade out={876} dur={22}>
            <Cutout src={asset('map.png')} x={MAP.cx} y={MAP.cy} w={MAP.w} at={5} dur={16} enter="place" rotate={-1.2} sticker={0} shadow={3} drift={0.4} />
            <Cutout src={asset('branch.png')} x={165} y={430} w={380} at={25} enter="slide-l" rotate={-6} depth={0.12} sticker={6} shadow={2} />
          </SceneFade>
        </Sequence>

        {/* ---- ORIGIN + TRAVEL annotations (fade before the ban widens) ---- */}
        <Sequence from={150} durationInFrames={420} layout="none">
          <SceneFade out={416}>
            <Sequence from={CUE.ethChip - 150} layout="none">
              <LabelChip x={ETH.x} y={ETH.y + 60} at={0} text="Ethiopia" kicker="~ 850 AD" accent={VOX.red} size={26} rotate={-2} depth={0.03} />
            </Sequence>
            <SketchArrow id="route1" d={ROUTE} vb={{ w: W, h: H }} at={CUE.route - 150} dur={55} dashed color={VOX.red} width={6} />
            <Sequence from={CUE.mochaChip - 150} layout="none">
              <LabelChip x={YEM.x + 30} y={YEM.y - 55} at={0} text="Mocha, Yemen" kicker="1400s" accent={VOX.teal} size={26} rotate={1.6} depth={0.03} />
            </Sequence>
          </SceneFade>
        </Sequence>

        {/* ---- BAN (19–26s): sultan + BANNED stamp + city chips ---- */}
        <Sequence from={CUE.banStart} durationInFrames={215} layout="none">
          <SceneFade out={211}>
            <Cutout src={asset('sultan.png')} x={830} y={880} w={470} at={CUE.sultanIn - CUE.banStart} enter="slide-r" rotate={2} depth={0.08} sticker={6} shadow={3} />
            <RubberStamp text="Banned" x={790} y={700} at={CUE.stamp - CUE.banStart} size={78} rotate={-12} z={5} />
            <LabelChip x={370} y={640} at={CUE.mecca - CUE.banStart} text="Mecca" kicker="1511" accent={VOX.red} size={30} rotate={-2} depth={0.03} />
            <LabelChip x={330} y={800} at={CUE.cairo - CUE.banStart} text="Cairo" kicker="1500s" accent={VOX.red} size={30} rotate={1.5} depth={0.03} />
            <LabelChip x={430} y={975} at={CUE.konst - CUE.banStart} text="Constantinople" kicker="1633 · death penalty" accent={VOX.ink} size={30} rotate={-1} depth={0.03} />
          </SceneFade>
        </Sequence>

        {/* ---- COFFEEHOUSE (26–33.5s): archival print + statement ---- */}
        <Sequence from={CUE.houseStart} durationInFrames={225} layout="none">
          <SceneFade out={221}>
            <ArchivalPhoto
              src={asset('coffeehouse.png')}
              x={540}
              y={730}
              w={800}
              at={CUE.photoIn - CUE.houseStart}
              enter="place"
              rotate={-2.2}
              depth={0.06}
              caption="A coffeehouse, Constantinople — 1555"
            />
            <SerifStatement
              x={540}
              y={1330}
              w={900}
              at={CUE.statement - CUE.houseStart}
              size={80}
              backing
              words={[{ t: 'Ideas.' }, { t: 'Gossip.' }, { t: 'Revolutions.', hl: true }]}
            />
          </SceneFade>
        </Sequence>

        {/* ---- TODAY / LOOP (33–42s): back to the page-1 composition ≈ frame 0 ---- */}
        <Sequence from={CUE.todayStart} layout="none">
          <Cutout src={asset('cup.png')} x={540} y={1120} w={600} at={CUE.cupBack - CUE.todayStart} enter="place" rotate={2.5} depth={0.08} shadow={3} />
          <Sequence from={CUE.titleBack - CUE.todayStart} layout="none">
            <SerifStatement x={540} y={400} w={960} at={0} size={82} words={TITLE_WORDS} />
          </Sequence>
          <LabelChip
            x={540}
            y={1560}
            at={CUE.statChip - CUE.todayStart}
            text="2.25 billion cups. Every day."
            kicker="Today"
            accent={VOX.yellow}
            kickerColor={VOX.inkSoft}
            size={34}
            rotate={-1.2}
          />
        </Sequence>
      </CollageBoard>
      <Grain opacity={0.055} />
    </AbsoluteFill>
  );
};

export default Vox1Coffee;
