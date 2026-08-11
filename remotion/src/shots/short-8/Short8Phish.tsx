import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { WebBrowserFrame, CHROME } from '../../lib/browser';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short8Phish',
  durationInSeconds: 43,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE
// =============================================================================
// Brand danger (#e8879f) is a light pink — it disappears against the white login page, so the
// on-white annotations use a darkened derivation of it. GREEN is the *false* reassurance.
const RED = '#d1435b';
const GREEN = '#2e9e5b';
const GOLD = '#f5d76e';
const INK = '#3c4043'; // chrome text, matches lib/browser
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);

// =============================================================================
// GEOMETRY — every number below is in UNZOOMED screen space. The camera wrapper scales the
// whole browser (annotations included), so nothing here needs to know about the zoom.
// =============================================================================
const UI = 1.7; // chrome scale: a 1080-wide vertical frame needs bigger chrome than a 16:9 shot
const BOX = { x: 40, y: 450, w: 1000, h: 780 };
const TAB_H = CHROME.tab * UI;
const NAV_H = CHROME.nav * UI;
const PAGE_H = BOX.h - TAB_H - NAV_H; // the white page region, below the chrome
const URLBAR_CY = BOX.y + TAB_H + NAV_H / 2; // the camera pivots on this

// The URL is the star, so it gets its own size independent of UI — big enough to read, small
// enough that all 32 chars fit the pill at rest AND fit 1080px wide once lifted.
const URL_FS = 26;
const ZOOM = 1.9; // 26px * 1.9 = ~49px on screen, ~950px wide — just inside the frame
const CAM_DY = 760 - URLBAR_CY; // lift the bar to y=760, leaving room for chips above

// =============================================================================
// CUES (global frames @30 — the whole shot is root-level, so local == global everywhere
// except the one PauseCard Sequence. No local-frame conversion, no chance of the classic bug.)
// =============================================================================
// Retimed against the REAL ElevenLabs word times in vo.gen.ts — every cue lands on the word
// that names it, not on my pre-voice estimate. The spoken word is in the comment.
const F = (s: number) => Math.round(s * 30);
const HOOK_OUT = F(3.0); // "notice." ends
const LOCK_TICK = F(5.2); // "padlock's"
const URL_UNDERLINE = F(6.9); // sweeps into "paypal" (7.41)
const PW_START = F(9.7); // "type your password"
const PW_END = F(11.0);
const POINTER_LAND = F(11.5); // "here."
const PAUSE_FROM = F(12.3); // "Pause."
const PAUSE_DUR = F(3.9);
const LIFT_IN = F(15.8);
const LIFT_DONE = F(17.0);
const RULE_1 = F(16.6); // "Ignore everything after..."
const PATH_STRIKE = F(17.9); // lands on "slash." (18.09)
const PATH_DROP = F(18.9);
const ARROW = F(20.3); // sweeps through "right to left." (20.55–20.95)
const REG_BOX = F(23.9); // "last two parts" — the box grows leftward out of .net
const REAL_LABEL = F(25.6); // "before it." ends
const REG_PULSE = F(28.1); // "secure-login" — the box punches on its own name
const SUB_GREY = F(31.2); // "...in a subdomain"
const SUB_LABEL = F(31.9); // "subdomain."
const LOCK_RING = F(35.6); // "padlock?"
const LOCK_LABEL = F(37.1); // "just means encrypted"
const LOCK_STRIKE = F(38.1); // "Encrypted straight to the thief"
const LOOP = F(40.0); // VO ends 39.80
const END = F(43.0);

const PW_DOTS = 11;

// How far the camera has lifted, 0..1 — shared by the transform and the page dim so they can
// never drift apart.
const camAmount = (f: number) =>
  EASE_INOUT(prog(f, LIFT_IN, LIFT_DONE)) * (1 - EASE_INOUT(prog(f, LOOP, LOOP + 54)));

// Every annotation hangs BELOW the URL, over the dimmed page. The nav bar is only ~95px tall,
// so there is no room above it — an earlier pass put the arrow there and it escaped into the
// tab strip. Two tiers, and nothing shares a tier at the same time.
const TIER_1 = 'calc(100% + 16px)'; // the r-to-l arrow, then THE REAL SITE
const TIER_2 = 'calc(100% + 78px)'; // SUBDOMAIN, then ENCRYPTED ≠ TRUSTED

// =============================================================================
// THE URL — the whole lesson lives in this one string.
//
// Each segment is a position:relative span carrying its OWN highlight box / strike / label as
// absolutely-positioned children. That means no segment ever needs a measured x-coordinate,
// and the camera zoom magnifies the annotations along with the text they point at.
// =============================================================================
const UrlLine: React.FC = () => {
  const f = useCurrentFrame();

  // everything drawn on top of the URL dissolves when the loop begins...
  const annOut = 1 - prog(f, LOOP, LOOP + 20);
  const a = (p: number) => p * annOut;
  // ...and /login, which was struck out and collapsed away, grows back — otherwise the last
  // frame shows a shorter URL than frame 0 and the loop visibly jumps.
  const restore = prog(f, LOOP, LOOP + 24);

  const tick = a(prog(f, LOCK_TICK, LOCK_TICK + 10) * (1 - prog(f, F(9.0), F(9.6))));
  const underline = a(prog(f, URL_UNDERLINE, URL_UNDERLINE + 16) * (1 - prog(f, LIFT_DONE, LIFT_DONE + 16)));
  const strike = a(prog(f, PATH_STRIKE, PATH_STRIKE + 14));
  const drop = prog(f, PATH_DROP, PATH_DROP + 14) * (1 - restore);
  const collapse = prog(f, PATH_DROP + 8, PATH_DROP + 24) * (1 - restore);
  const arrow = a(prog(f, ARROW, ARROW + 24) * (1 - prog(f, REG_BOX - 8, REG_BOX + 4)));
  const box = a(prog(f, REG_BOX, REG_BOX + 16));
  const realLabel = a(prog(f, REAL_LABEL, REAL_LABEL + 12));
  const grey = prog(f, SUB_GREY, SUB_GREY + 18) * annOut;
  // the SUBDOMAIN callout clears out before the padlock callout claims the same slot above the URL
  const subLabel = a(prog(f, SUB_LABEL, SUB_LABEL + 12) * (1 - prog(f, LOCK_RING - 18, LOCK_RING)));
  const ring = a(prog(f, LOCK_RING, LOCK_RING + 12));
  const lockLabel = a(prog(f, LOCK_LABEL, LOCK_LABEL + 12));
  const lockStrike = a(prog(f, LOCK_STRIKE, LOCK_STRIKE + 12));

  // The lock icon sits just left of this line: gap(10) + half the icon (15/2), both at UI scale.
  const LOCK_DX = -(10 * UI + (15 * UI) / 2);

  const subColor = grey > 0 ? `rgba(60,64,67,${1 - 0.72 * grey})` : INK;
  const regColor = box > 0.35 ? RED : INK;

  const pill: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    fontFamily: FONT_BODY,
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    borderRadius: 8,
    padding: '6px 12px',
  };

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: FONT_MONO,
        fontSize: URL_FS,
        fontWeight: 500,
        color: INK,
        whiteSpace: 'nowrap',
      }}
    >
      {/* ---- the padlock callouts (the lock itself is drawn by WebBrowserFrame, just left of us) */}
      {tick > 0.01 ? (
        <span
          style={{
            position: 'absolute', left: LOCK_DX, top: '50%', width: 42, height: 42,
            transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * EASE_OUT(tick)})`,
            border: `3px solid ${GREEN}`, borderRadius: 999, opacity: tick,
          }}
        />
      ) : null}
      {ring > 0.01 ? (
        <span
          style={{
            position: 'absolute', left: LOCK_DX, top: '50%', width: 46, height: 46,
            transform: `translate(-50%,-50%) scale(${1.35 - 0.35 * EASE_OUT(ring)})`,
            border: `4px solid ${RED}`, borderRadius: 999, opacity: ring,
          }}
        />
      ) : null}
      {lockStrike > 0.01 ? (
        <span
          style={{
            position: 'absolute', left: LOCK_DX, top: '50%', width: 52, height: 4,
            background: RED, borderRadius: 2, opacity: lockStrike,
            transform: `translate(-50%,-50%) rotate(-45deg) scaleX(${EASE_OUT(lockStrike)})`,
          }}
        />
      ) : null}
      {lockLabel > 0.01 ? (
        // LEFT-anchored, not centred on the lock: at 1.9x zoom the lock sits at the very edge of
        // the frame, and a centred pill would hang off it. This starts at the URL and runs right.
        <span style={{ ...pill, top: TIER_2, left: 0, transform: 'none', background: RED, color: '#fff', opacity: lockLabel }}>
          encrypted ≠ trusted
        </span>
      ) : null}

      {/* ---- the right-to-left read (tier 1, before THE REAL SITE claims it) */}
      {arrow > 0.01 ? (
        <span style={{ position: 'absolute', left: 0, right: 0, top: TIER_1, height: 20, opacity: arrow }}>
          <span
            style={{
              position: 'absolute', left: 0, right: 14, top: 8, height: 3, background: RED,
              transformOrigin: 'right', transform: `scaleX(${EASE_INOUT(arrow)})`,
            }}
          />
          <span
            style={{
              position: 'absolute', left: 0, top: 2, width: 0, height: 0,
              borderTop: '8px solid transparent', borderBottom: '8px solid transparent',
              borderRight: `14px solid ${RED}`, opacity: prog(arrow, 0.75, 1),
            }}
          />
        </span>
      ) : null}

      {/* ---- paypal.com.  — the lie you read first */}
      <span style={{ position: 'relative', color: subColor }}>
        paypal.com
        <span
          style={{
            position: 'absolute', left: 0, right: 0, bottom: -7, height: 3, background: GREEN,
            transformOrigin: 'left', transform: `scaleX(${EASE_OUT(underline)})`, opacity: underline,
          }}
        />
        {subLabel > 0.01 ? (
          // also left-anchored — this segment starts at the frame edge when zoomed
          <span style={{ ...pill, top: TIER_2, left: 0, transform: 'none', background: '#22262b', color: '#fff', opacity: subLabel }}>
            just a subdomain
          </span>
        ) : null}
      </span>
      <span style={{ color: subColor }}>.</span>

      {/* ---- secure-login.net — the site you're actually on */}
      <span
        style={{
          position: 'relative', display: 'inline-block', color: regColor,
          fontWeight: box > 0.35 ? 700 : 500,
          // punches on its own name — "which makes this SECURE-LOGIN dot net"
          transform: `scale(${1 + 0.06 * Math.sin(prog(f, REG_PULSE, REG_PULSE + 18) * Math.PI)})`,
        }}
      >
        secure-login.net
        {box > 0.01 ? (
          <span
            style={{
              position: 'absolute', left: -8, right: -8, top: -8, bottom: -8,
              border: `3px solid ${RED}`, borderRadius: 9, opacity: box,
              // grows leftward out of .net — which is exactly the rule being taught
              transformOrigin: 'right', transform: `scaleX(${0.28 + 0.72 * EASE_OUT(box)})`,
            }}
          />
        ) : null}
        {realLabel > 0.01 ? (
          <span style={{ ...pill, top: TIER_1, background: RED, color: '#fff', opacity: realLabel }}>
            the real site
          </span>
        ) : null}
      </span>

      {/* ---- /login — noise. Struck out, then collapsed away. */}
      <span
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          ...(collapse > 0 ? { maxWidth: 110 * (1 - collapse) } : {}),
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            color: strike > 0.2 ? '#9aa0a6' : INK,
            opacity: 1 - drop,
            transform: `translateY(${drop * 26}px)`,
          }}
        >
          /login
          <span
            style={{
              position: 'absolute', left: -2, right: -2, top: '52%', height: 3, background: RED,
              transformOrigin: 'left', transform: `scaleX(${EASE_OUT(strike)})`, opacity: strike,
            }}
          />
        </span>
      </span>
    </span>
  );
};

// =============================================================================
// THE PAGE — a login screen rendered as inert divs. No form elements, no handlers; the brand
// is set as styled text rather than a cloned logo asset. It exists to be exposed.
// =============================================================================
const LoginPage: React.FC = () => {
  const f = useCurrentFrame();
  // The loop rewinds the page to untouched — password cleared, pointer gone — so the last frame
  // lands exactly on frame 0. Without this the replay jumps.
  const reset = 1 - prog(f, LOOP, LOOP + 24);
  const dots = Math.floor(prog(f, PW_START, PW_END) * PW_DOTS * reset);
  const caret = f >= PW_START && f < PW_END + 20 && Math.floor(f / 8) % 2 === 0;
  const pointer = prog(f, POINTER_LAND - 44, POINTER_LAND) * reset;
  const hover = prog(f, POINTER_LAND - 6, POINTER_LAND + 6) * reset;

  const field: React.CSSProperties = {
    width: 620, height: 62, borderRadius: 8, border: '1px solid #cbd2d6',
    background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px',
    fontFamily: FONT_BODY, fontSize: 22, color: '#2c2e2f',
  };

  // The dim lives INSIDE the page, not over the whole browser — so the URL bar (and the
  // annotations hanging off it) stay lit while everything at stake goes dark behind them.
  const dim = 0.74 * camAmount(f);

  return (
    <div style={{ position: 'relative', width: BOX.w, height: PAGE_H, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, background: '#fff' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#0b0e13', opacity: dim, zIndex: 3 }} />
      {/* wordmark — styled text, not a logo file */}
      <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontStyle: 'italic', fontSize: 44, letterSpacing: -1 }}>
        <span style={{ color: '#003087' }}>Pay</span>
        <span style={{ color: '#009cde' }}>Pal</span>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 25, color: '#2c2e2f', marginTop: 22, marginBottom: 26 }}>
        Log in to your account
      </div>
      <div style={{ ...field, color: '#6c7378' }}>alex.morgan@fastmail.com</div>
      <div style={{ ...field, marginTop: 16, borderColor: dots > 0 ? '#0070ba' : '#cbd2d6' }}>
        <span style={{ letterSpacing: 5, fontSize: 26, color: '#2c2e2f' }}>{'•'.repeat(dots)}</span>
        {caret ? <span style={{ width: 2, height: 28, background: '#2c2e2f', marginLeft: 3 }} /> : null}
      </div>
      <div
        style={{
          width: 620, height: 62, borderRadius: 999, marginTop: 26,
          background: hover > 0.5 ? '#005ea6' : '#0070ba',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, color: '#fff',
        }}
      >
        Log In
      </div>

      {/* pointer — glides in and settles on the button */}
      {pointer > 0.01 ? (
        <svg
          width={30}
          height={40}
          viewBox="0 0 30 40"
          style={{
            position: 'absolute',
            left: 500 + (1 - EASE_OUT(pointer)) * 150,
            top: 372 + (1 - EASE_OUT(pointer)) * 120,
            opacity: pointer,
          }}
        >
          <path d="M2 2 L2 30 L9 23 L14 34 L19 31 L14 21 L23 21 Z" fill="#1a1a2e" stroke="#fff" strokeWidth={1.6} />
        </svg>
      ) : null}
    </div>
  );
};

// =============================================================================
// MAIN — one canvas, no cuts. The browser mounts at frame 0 and never unmounts; the "reveal"
// is a camera move into its own URL bar, with the login page dimmed but still there behind it.
// =============================================================================
const Short8Phish: React.FC = () => {
  const f = useCurrentFrame();

  // hook punch-in settles 1.06 -> 1; the loop grows it back to 1.06 so the last frame lands
  // exactly on frame 0 and the replay is seamless.
  const punch =
    f < LOOP
      ? 1.06 - 0.06 * EASE_INOUT(prog(f, 0, 28))
      : 1.0 + 0.06 * EASE_INOUT(prog(f, LOOP, END));

  // camera lift into the URL bar, and back out again for the loop
  const cam = camAmount(f);
  const camScale = 1 + (ZOOM - 1) * cam;

  const titleOp = (1 - prog(f, HOOK_OUT, HOOK_OUT + 20)) + prog(f, LOOP + 8, LOOP + 34);

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#2a1a24" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: Math.min(1, titleOp) }}>
          <BigTitle
            lines={[
              { text: 'THIS IS NOT', color: '#ffffff' },
              { text: 'PAYPAL', color: '#e8879f' },
            ]}
            y={170}
            size={78}
            warm={f < LOOP}
          />
        </div>

        <Kicker text="LOOKS LEGIT" color={GREEN} y={190} at={F(4.0)} until={F(12.2)} />
        <Kicker text="THE RULE" color={GOLD} y={190} at={LIFT_IN} until={F(35.0)} />
        <Kicker text="THE PADLOCK LIE" color="#e8879f" y={190} at={F(35.2)} until={F(39.9)} />

        <Kicker text="1 · IGNORE THE PATH" color={GOLD} y={296} at={RULE_1} until={ARROW - 4} />
        <Kicker text="2 · READ RIGHT TO LEFT" color={GOLD} y={296} at={ARROW} until={REG_BOX - 4} />
        <Kicker text="3 · LAST TWO PARTS" color={GOLD} y={296} at={REG_BOX} until={F(35.0)} />

        {/* the camera wrapper: browser + page-dim share one transform, so annotations that live
            inside the URL string scale with the text they annotate */}
        <AbsoluteFill
          style={{
            transform: `translateY(${CAM_DY * cam}px) scale(${camScale})`,
            transformOrigin: `540px ${URLBAR_CY}px`,
          }}
        >
          <WebBrowserFrame
            url={<UrlLine />}
            tabTitle="Log in to your account"
            box={BOX}
            uiScale={UI}
            // negative, so the window is ALREADY fully composed at frame 0 — the hook rule.
            // appearAt={0} would fade it up from nothing and the thumbnail would be empty.
            appearAt={-20}
            favicon={<span style={{ width: 17 * UI, height: 17 * UI, borderRadius: 4, background: '#0070ba' }} />}
          >
            <LoginPage />
          </WebBrowserFrame>
        </AbsoluteFill>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="which part is the real website?" durSec={3.9} accent={GOLD} y={900} />
      </Sequence>

      <Captions lines={VO} y={1310} accent={GOLD} plate />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short8Phish;
