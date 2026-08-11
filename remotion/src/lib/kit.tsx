// Shared building blocks for video-1 shots. NOT a shot itself (no compositionConfig,
// and it lives outside src/shots so gen-registry never scans it). Keeps every level
// beat on one consistent look. Frame-based only; monotonic interpolate + clamp.
import React from 'react';
import {
  AbsoluteFill, interpolate, Img, staticFile, useCurrentFrame,
} from 'remotion';
import {
  Mic, Plus, Slash, Zap, ArrowUp, Square, Check,
  Files, Search, GitBranch, Play, LayoutGrid, Folder, Settings, FileText, Braces,
  Image as ImageIcon, Info, MoreHorizontal, Lock, SplitSquareHorizontal, Clock, X,
} from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO, FONT_SERIF } from '../fonts';

export const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const lib = (name: string) => staticFile(`${name}`);

// ---- brand backdrop: paper + soft color glow + faint dotted grid -------------
export const BrandBg: React.FC<{ glow?: string }> = ({ glow = COLORS.accent }) => (
  <>
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }} />
    <AbsoluteFill style={{ background: `radial-gradient(1300px 700px at 50% -12%, ${glow}22, transparent 60%)` }} />
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${COLORS.line} 1.5px, transparent 1.5px)`, backgroundSize: '46px 46px', opacity: 0.45 }} />
  </>
);

// rise-in (fade + translateY), driven by the current frame
export const useRise = () => {
  const frame = useCurrentFrame();
  return (start: number, dist = 24, dur = 14) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [dist, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
};

// =============================================================================
// Claude Code clone — realistic terminal/chat with a typed prompt (dark + coral)
// =============================================================================
const CC = {
  bg: '#1c1b19', input: '#242220', border: '#38342e', coral: '#cd8064',
  coralSend: '#c8785b', text: '#ebe8e3', muted: '#8f8981', faint: '#6d675f',
} as const;
const CLAUDE_PATH =
  'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z';
export const Sunburst: React.FC<{ size: number; color?: string }> = ({ size, color = CC.coral }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d={CLAUDE_PATH} /></svg>
);

export const ClaudeCodePromptShot: React.FC<{
  prompt: string;
  cwd?: string;
  responseLabel?: string;
  typeStart?: number;
  perChar?: number;
}> = ({ prompt, cwd, responseLabel = 'Generating image…', typeStart = 22, perChar = 1.35 }) => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });
  const appear = r(0, 16);
  const typeEnd = typeStart + prompt.length * perChar;
  const send = typeEnd + 12;
  const typed = prompt.slice(0, Math.floor(r(typeStart, typeEnd, 0, prompt.length, EASINGS.easeInOut)));
  const sent = frame >= send;
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && !sent;
  const chatOp = r(send, send + 12);
  const spin = (frame * 9) % 360;

  return (
    <AbsoluteFill style={{ backgroundColor: CC.bg, fontFamily: FONT_BODY, opacity: appear }}>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <Sunburst size={30} />
        <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 40, color: CC.coral }}>Claude Code</span>
      </div>

      <div style={{ position: 'absolute', top: 170, left: '50%', transform: 'translateX(-50%)', width: 1240, opacity: chatOp }}>
        {cwd && <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: CC.faint, marginBottom: 18, textAlign: 'right' }}>{cwd}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 34 }}>
          <div style={{ background: CC.input, border: `1px solid ${CC.border}`, borderRadius: 14, padding: '18px 26px', color: CC.text, fontFamily: FONT_MONO, fontSize: 28, maxWidth: 1000 }}>{prompt}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: r(send + 6, send + 18) }}>
          <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Sunburst size={26} /></div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: CC.text }}>{responseLabel}</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', width: 1240 }}>
        <div style={{ background: CC.input, border: `1px solid ${sent ? CC.border : CC.coral}`, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '24px 28px', minHeight: 34 }}>
            {sent ? (
              <span style={{ flex: 1, color: CC.faint, fontSize: 28 }}>Queue another message…</span>
            ) : typed.length ? (
              <span style={{ flex: 1, color: CC.text, fontFamily: FONT_MONO, fontSize: 28 }}>{typed}<span style={{ opacity: cursorOn ? 1 : 0, color: CC.coral }}>▌</span></span>
            ) : (
              <span style={{ flex: 1, color: CC.faint, fontSize: 28 }}>ctrl esc to focus or unfocus Claude</span>
            )}
            <Mic size={26} color={CC.muted} strokeWidth={2} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Plus size={30} color={CC.muted} strokeWidth={2} />
              <div style={{ width: 40, height: 34, borderRadius: 9, border: `1px solid ${CC.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Slash size={20} color={CC.muted} strokeWidth={2} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Zap size={22} color={CC.muted} strokeWidth={2} />
              <span style={{ color: CC.muted, fontSize: 26 }}>Auto mode</span>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: CC.coralSend, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sent ? <Square size={20} color={'#f6efe9'} fill={'#f6efe9'} /> : <ArrowUp size={26} color={'#f6efe9'} strokeWidth={2.4} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// Level intro title card (full-screen)
// =============================================================================
export const LevelTitleShot: React.FC<{ n: string; title: string; subtitle: string; color: string }> = ({ n, title, subtitle, color }) => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={color} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 16), fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 6, color, marginBottom: 18 }}>LEVEL</div>
        <div style={{ ...rise(8), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 340, lineHeight: 0.9, color, margin: 0 }}>{n}</div>
        <div style={{ ...rise(16), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, color: COLORS.ink, marginTop: 6 }}>{title}</div>
        <div style={{ ...rise(24), fontSize: 38, color: COLORS.muted, marginTop: 18 }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============================================================================
// Full-screen image reveal (the real generated asset in a framed card)
// =============================================================================
export const ImageRevealShot: React.FC<{
  src: string; tag: string; title: string; subtitle?: string;
  color: string; boxW?: number; boxH?: number;
}> = ({ src, tag, title, subtitle, color, boxW = 760, boxH = 760 }) => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const imgScale = interpolate(frame, [8, 30], [0.92, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const imgOp = interpolate(frame, [8, 26], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={color} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        {/* eyebrow tag */}
        <div style={{ ...rise(2, 14), display: 'flex', alignItems: 'center', gap: 12, background: `${color}16`, border: `1px solid ${color}44`, borderRadius: RADIUS.pill, padding: '10px 22px' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={15} color="#fff" strokeWidth={3.4} />
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 1.5, color, fontWeight: 500 }}>{tag}</span>
        </div>
        {/* image card */}
        <div style={{ width: boxW, height: boxH, borderRadius: RADIUS.card, overflow: 'hidden', border: `1px solid ${COLORS.line}`, boxShadow: SHADOW.card, background: COLORS.cream, opacity: imgOp, transform: `scale(${imgScale})` }}>
          <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* caption */}
        <div style={{ ...rise(20, 16), textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: COLORS.ink }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: COLORS.muted, marginTop: 6 }}>{subtitle}</div>}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============================================================================
// VS CODE WINDOW CLONE — real Claude Code extension surface. Used for every
// "here's my actual editor" demo (typed prompts). Clone of a real Claude Code window.
// =============================================================================
export const V = {
  chrome: '#181818', editor: '#1e1e1e', sidebar: '#181818', border: '#2b2b2b',
  text: '#cccccc', dim: '#8b8b8b', faint: '#6e6e6e', blue: '#3794ff', green: '#4ec98f',
  coral: '#cd8064', input: '#242424', inputBorder: '#3a3a3a',
} as const;
// geometry (px on 1920x1080)
export const VSC = { TITLE_H: 44, ACT_W: 54, SB_X: 54, SB_W: 372, ED_X: 426, ED_W: 1494, ED_CX: 426 + 747 } as const;

const FOLDERS = ['.claude\\skills', 'level-1-2-3-comparison', 'level1-examples', 'level2-examples', 'level3-examples', 'stories'];
const FILES: { name: string; Icon: React.FC<any>; color: string; mark: string | null }[] = [
  { name: '.env', Icon: Settings, color: V.dim, mark: null },
  { name: '.env.example', Icon: FileText, color: '#c9a26b', mark: 'U' },
  { name: '.gitattributes', Icon: FileText, color: V.dim, mark: 'U' },
  { name: '.gitignore', Icon: FileText, color: V.dim, mark: 'U' },
  { name: '.mcp.json', Icon: Braces, color: '#c9a26b', mark: 'U' },
  { name: 'out.jpg', Icon: ImageIcon, color: '#4ec98f', mark: null },
  { name: 'README.md', Icon: Info, color: '#4a9ee6', mark: 'U' },
];
const ActIcon: React.FC<{ Icon: React.FC<any>; active?: boolean; badge?: string }> = ({ Icon, active, badge }) => (
  <div style={{ position: 'relative', width: VSC.ACT_W, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: `2px solid ${active ? V.text : 'transparent'}` }}>
    <Icon size={26} color={active ? V.text : V.faint} strokeWidth={1.6} />
    {badge && <span style={{ position: 'absolute', bottom: 8, right: 9, background: V.blue, color: '#fff', fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '0 5px', lineHeight: '16px' }}>{badge}</span>}
  </div>
);

// Full VS Code chrome. Pass the editor-pane content as children (they position
// themselves in the ED_X..1920 region using the VSC constants).
export const VSCodeShell: React.FC<{ children?: React.ReactNode; tab?: string }> = ({ children, tab = 'Claude Code' }) => (
  <AbsoluteFill style={{ backgroundColor: V.editor, fontFamily: FONT_BODY }}>
    {/* title bar */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: VSC.TITLE_H, background: V.chrome, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${V.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 16 }}>
        <Img src={lib('library/logos/vscode.webp')} style={{ width: 26, height: 26 }} />
        {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((m) => (
          <span key={m} style={{ fontSize: 18, color: V.text, opacity: 0.85 }}>{m}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, width: 620, height: 30, background: '#2a2a2a', border: `1px solid ${V.border}`, borderRadius: 7, justifyContent: 'center' }}>
        <Search size={16} color={V.faint} />
        <span style={{ fontSize: 17, color: V.dim }}>claude-image-generation</span>
        <span style={{ fontSize: 17, color: V.faint }}>[Administrator]</span>
      </div>
      <div style={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: 26, paddingRight: 22, color: V.dim, fontSize: 18 }}>
        <LayoutGrid size={17} color={V.dim} /><span>—</span><span style={{ fontSize: 15 }}>▢</span><span>✕</span>
      </div>
    </div>
    {/* activity bar */}
    <div style={{ position: 'absolute', top: VSC.TITLE_H, left: 0, width: VSC.ACT_W, bottom: 0, background: V.chrome, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        <ActIcon Icon={Files} active /><ActIcon Icon={Search} /><ActIcon Icon={GitBranch} badge="163" /><ActIcon Icon={Play} /><ActIcon Icon={LayoutGrid} />
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6 }}><Sunburst size={26} color={V.coral} /></div>
      </div>
      <Settings size={26} color={V.faint} strokeWidth={1.6} />
    </div>
    {/* sidebar */}
    <div style={{ position: 'absolute', top: VSC.TITLE_H, left: VSC.SB_X, width: VSC.SB_W, bottom: 0, background: V.sidebar, borderRight: `1px solid ${V.border}`, paddingTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 12px' }}>
        <span style={{ fontSize: 15, letterSpacing: 1, color: V.dim }}>EXPLORER</span><MoreHorizontal size={18} color={V.dim} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: V.text, padding: '6px 14px', letterSpacing: 0.4 }}>CLAUDE-IMAGE-GENERATION</div>
      {FOLDERS.map((f) => (
        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px 5px 22px' }}>
          <span style={{ color: V.dim, fontSize: 16, width: 12 }}>›</span><Folder size={17} color="#c0a06a" strokeWidth={1.7} />
          <span style={{ fontSize: 18, color: V.text, flex: 1 }}>{f}</span><span style={{ width: 8, height: 8, borderRadius: '50%', background: V.green }} />
        </div>
      ))}
      {FILES.map((f) => (
        <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px 5px 40px' }}>
          <f.Icon size={17} color={f.color} strokeWidth={1.7} /><span style={{ fontSize: 18, color: V.text, flex: 1 }}>{f.name}</span>
          {f.mark && <span style={{ fontSize: 15, color: V.green, fontWeight: 600 }}>{f.mark}</span>}
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1px solid ${V.border}` }}>
        {['OUTLINE', 'TIMELINE'].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}><span style={{ color: V.dim }}>›</span><span style={{ fontSize: 15, letterSpacing: 1, color: V.dim }}>{s}</span></div>
        ))}
      </div>
    </div>
    {/* tab bar */}
    <div style={{ position: 'absolute', top: VSC.TITLE_H, left: VSC.ED_X, width: VSC.ED_W, height: 40, background: V.chrome, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%', padding: '0 20px', background: V.editor, borderTop: `1px solid ${V.coral}`, borderRight: `1px solid ${V.border}` }}>
        <Sunburst size={18} color={V.coral} /><span style={{ fontSize: 18, color: V.text }}>{tab}</span><X size={17} color={V.dim} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingRight: 20 }}>
        <Sunburst size={18} color={V.coral} /><SplitSquareHorizontal size={18} color={V.dim} /><Lock size={17} color={V.coral} /><MoreHorizontal size={18} color={V.dim} />
      </div>
    </div>
    <div style={{ position: 'absolute', top: VSC.TITLE_H + 40, left: VSC.ED_X, width: VSC.ED_W, height: 34, background: V.editor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', borderBottom: `1px solid ${V.border}` }}>
      <span style={{ fontSize: 17, color: V.dim }}>Untitled</span>
      <div style={{ display: 'flex', gap: 16 }}><Clock size={16} color={V.dim} /><Plus size={16} color={V.dim} /></div>
    </div>
    {children}
  </AbsoluteFill>
);

// The Claude Code chat inside the editor pane: wordmark, /model empty state,
// typed prompt, then an assistant response. Pass renderResponse for custom
// assistant content (e.g. a running-pipeline card); else a "responseLabel" line.
export const ClaudeChatPanel: React.FC<{
  prompt: string; responseLabel?: string; typeStart?: number; perChar?: number;
  region?: { x: number; w: number };
  emptyText?: React.ReactNode;
  renderResponse?: (ctx: { frame: number; send: number; spin: number; r: (a: number, b: number, from?: number, to?: number) => number }) => React.ReactNode;
}> = ({ prompt, responseLabel = 'Generating image…', typeStart = 24, perChar = 1.3, region, emptyText, renderResponse }) => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1) => interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });
  const typeEnd = typeStart + prompt.length * perChar;
  const send = typeEnd + 12;
  const typed = prompt.slice(0, Math.floor(interpolate(frame, [typeStart, typeEnd], [0, prompt.length], { ...CLAMP, easing: EASINGS.easeInOut })));
  const sent = frame >= send;
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && !sent;
  const emptyOp = 1 - r(send - 4, send + 10);
  const chatOp = r(send, send + 12);
  const spin = (frame * 9) % 360;
  const ED_X = region ? region.x : VSC.ED_X;
  const ED_W = region ? region.w : VSC.ED_W;

  return (
    <>
      {/* wordmark */}
      <div style={{ position: 'absolute', top: 150, left: ED_X, width: ED_W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Sunburst size={26} color={V.coral} /><span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 36, color: V.coral }}>Claude Code</span>
      </div>
      {/* empty state */}
      <div style={{ position: 'absolute', top: 420, left: ED_X, width: ED_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: emptyOp }}>
        <Img src={staticFile('library/logos/claude-code-bot.png')} style={{ width: 110, height: 110 }} />
        <span style={{ fontSize: 26, color: V.dim }}>{emptyText ?? <>Ready to code? Let&rsquo;s write something worth deploying.</>}</span>
      </div>
      {/* chat */}
      <div style={{ position: 'absolute', top: 210, left: ED_X + 60, width: ED_W - 120, opacity: chatOp }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <div style={{ background: V.input, border: `1px solid ${V.inputBorder}`, borderRadius: 12, padding: '16px 24px', color: V.text, fontFamily: FONT_MONO, fontSize: 26, maxWidth: ED_W - 260 }}>{prompt}</div>
        </div>
        {renderResponse ? renderResponse({ frame, send, spin, r }) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: r(send + 6, send + 18) }}>
            <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Sunburst size={24} color={V.coral} /></div>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: V.text }}>{responseLabel}</span>
          </div>
        )}
      </div>
      {/* input dock */}
      <div style={{ position: 'absolute', bottom: 30, left: ED_X + 24, width: ED_W - 48 }}>
        <div style={{ background: V.input, border: `1px solid ${sent ? V.inputBorder : V.coral}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', minHeight: 30 }}>
            {sent ? <span style={{ flex: 1, color: V.faint, fontSize: 26 }}>Queue another message…</span>
              : typed.length ? <span style={{ flex: 1, color: V.text, fontFamily: FONT_MONO, fontSize: 26 }}>{typed}<span style={{ opacity: cursorOn ? 1 : 0, color: V.coral }}>▌</span></span>
              : <span style={{ flex: 1, color: V.faint, fontSize: 26 }}>ctrl esc to focus or unfocus Claude</span>}
            <Mic size={24} color={V.dim} strokeWidth={2} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Plus size={26} color={V.dim} strokeWidth={2} />
              <div style={{ width: 36, height: 30, borderRadius: 8, border: `1px solid ${V.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Slash size={18} color={V.dim} strokeWidth={2} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Zap size={20} color={V.dim} strokeWidth={2} /><span style={{ color: V.dim, fontSize: 24 }}>Auto mode</span>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: V.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sent ? <Square size={18} color="#fff" fill="#fff" /> : <ArrowUp size={24} color="#fff" strokeWidth={2.4} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
