# The URL That Isn't PayPal — short-8 (cybersecurity)

Fully-synthetic vertical short (1080×1920 @30, 43s). Reuses `lib/browser.tsx` — no new niche
lib. Opens the **cybersecurity series**: render the manipulative UI itself, then annotate it.

**Video-only.** The login page is a Remotion composition — divs, no form elements, no handlers,
nothing deployable. The whole beat structure exists to expose the trick, which is what makes
this awareness content and not a template.

## The fact check (this changed the script)

The originally-planned reveal was the **capital-I / lowercase-l homoglyph** (`paypaI.com`).
**It does not work in a URL bar.** The WHATWG URL spec's domain parser ASCII-lowercases the
host ("set result to domain, lowercased"), so a capital `I` typed into a hostname is displayed
as a lowercase `i` — `paypai.com` — and the dot on the `i` gives it away instantly. That trick
is real only in *link text*, *display names*, and *sender fields*, never in the address bar,
which is exactly where our hook puts it. Scrapped.

What we teach instead is **the subdomain trick** — the single most common structure in real
phishing URLs, 100 % accurate, all-ASCII, no Unicode, no punycode warning, and it survives
every browser defense because *nothing about it is malformed*:

```
paypal.com.secure-login.net/login
└──── subdomain ────┘└─ REAL SITE ─┘
```

`paypal.com.` is just a subdomain of `secure-login.net`. Anyone can create it. It costs nothing.
The eye reads left-to-right, stops at the first thing it recognises, and is beaten.

**The rule the short teaches** (this is the takeaway, and it's reusable):
1. Ignore everything after the first `/`.
2. Read what's left **right to left**.
3. The real site is the **last two parts** before that slash.

## The twist (a reframe, not a new topic)

The padlock we deliberately showed in the hook means **encrypted**, not **trustworthy**. Any
attacker can get a free TLS certificate for their domain in about a minute. The padlock says the
line to the thief is private. That's it. It re-reads an element already on screen — which is what
a twist should do — and it's why `secure-login.net` was chosen over a neutral fake domain: the
word "secure" in the URL is doing the same job as the padlock, and both are worthless.

## Beat sheet

| # | Beat | t (s) | On screen | VO |
|---|------|-------|-----------|-----|
| 1 | HOOK | 0.0–3.6 | Frame 0 fully composed: browser, PayPal login page, padlock, URL. Title "THIS IS NOT PAYPAL". Punch-in settles 1.06→1 | This is not PayPal. And you'd never notice. |
| 2 | SETUP | 3.6–12.2 | Padlock pulses ✓ · "paypal.com" underlines in the URL ✓ · password field fills with dots · cursor lands on Log In | The logo's right. The padlock's there. The address bar says paypal dot com. / So you'd type your password right here. |
| 3 | QUIZ | 12.2–16.3 | PauseCard: "which part is the real website?" — URL held big and still | Pause. Which part is the real website? |
| 4 | REVEAL | 16.3–34.9 | Camera lifts into the URL bar. ① `/login` strikes out and drops away ② a red arrow sweeps right→left ③ `secure-login` + `.net` box up in red → "THE REAL SITE" ④ `paypal.com.` greys out → "SUBDOMAIN · anyone can name this" | Ignore everything after the first slash. / Then read what's left right to left. / The real site is the last two parts before it. / Which makes this secure-login dot net. / Anyone can put your bank's name in a subdomain. It's free. |
| 5 | TWIST | 34.9–40.0 | The padlock — still in frame, still zoomed — gets a red ring and is struck through. "🔒 = ENCRYPTED, NOT TRUSTED" | And the padlock? It just means encrypted. Encrypted straight to the thief. |
| 6 | LOOP | 40.0–43.0 | Annotations dissolve, camera pulls back out, URL returns to its innocent state, title fades back in. Last frame == frame 0 | — (silent) |

**No engagement-CTA outro** (locked rule). The loop-into-intro *is* the ending: the page you
now know is fake recomposes into the page you trusted three seconds ago, and it replays.

## VO (87 words, ~2.7 words/sec with slack)

Timings below are ESTIMATES. `gen_voice.py` overwrites them with real per-word times from
ElevenLabs `/with-timestamps`, and the captions retime themselves — nothing rebuilds.

| # | Beat | Start | End | Line |
|---|------|-------|-----|------|
| 1 | hook | 0.4 | 3.4 | This is not PayPal. And you'd never notice. |
| 2 | setup | 4.0 | 8.8 | The logo's right. The padlock's there. The address bar says paypal dot com. |
| 3 | setup | 9.3 | 11.9 | So you'd type your password right here. |
| 4 | quiz | 12.4 | 15.0 | Pause. Which part is the real website? |
| 5 | reveal | 16.6 | 18.9 | Ignore everything after the first slash. |
| 6 | reveal | 19.6 | 22.2 | Then read what's left right to left. |
| 7 | reveal | 23.0 | 26.7 | The real site is the last two parts before it. |
| 8 | reveal | 27.4 | 29.7 | Which makes this secure-login dot net. |
| 9 | reveal | 30.4 | 34.5 | Anyone can put your bank's name in a subdomain. It's free. |
| 10 | twist | 35.2 | 39.6 | And the padlock? It just means encrypted. Encrypted straight to the thief. |

## Production notes

- **One persistent canvas.** The browser window mounts at frame 0 and never unmounts. The
  reveal is a *camera lift* into its own URL bar, not a cut — the login page stays behind,
  dimmed, so you never forget what's at stake.
- **Annotations live inside the URL string**, not in screen space. Each segment is its own
  `position: relative` span carrying its own highlight box / strike / label as absolute children,
  so nothing needs measured coordinates and the camera zoom magnifies annotations with the text.
- **Zoom is bounded by the string.** 32 chars at the in-bar size must still fit 1080px wide when
  lifted → effective on-screen font ≈ 50px, so the camera goes to ~1.6×, not 2.4×. Dropping
  `/login` in step ① buys a little more room, which is why that step comes first.
- `lib/browser.tsx` gains two **additive** props (`url` accepts a ReactNode; `uiScale` sizes the
  chrome for vertical). Existing shots pass strings and default `uiScale: 1` — byte-identical.
- Captions use `plate` (dark pill) — the page behind them is white.

## Seeds the cybersecurity series

- **rn → m** (`arnazon.com`) — the lookalike that *does* survive lowercasing.
- **"123456" falls in 0.02 seconds** — live cracking counter.
- **QR code scams** — the URL you can't read at all.
