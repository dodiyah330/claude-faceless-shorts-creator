# short-4 · Dev tip — "git reflog undoes any mistake"

**Niche #5 (Dev / AI tips).** Canvas = ONE persistent dark terminal (GitHub-ink, from
`lib/terminal.tsx`). No new niche lib. The whole video is a single git session that scrolls
from a self-inflicted disaster to a one-command rescue. Every command and every hash on
screen is technically correct — a viewer can type these exact commands and get this exact
result.

## The promise

You ran `git reset --hard` and your commits vanished. They are NOT gone — `git reflog` logs
every place `HEAD` has ever pointed, so you can `reset` straight back to the "lost" commit.

## The git session (ground truth — verified)

Starting repo (4 commits on `main`, HEAD at *add payments*):

```
e5c07d3  add payments   ← HEAD
b21f6a9  add cart
7d4e8b0  add auth
3f9a1c2  init
```

**Disaster** (already done at frame 0):
```
➜ my-app git reset --hard HEAD~3
HEAD is now at 3f9a1c2 init
```
`HEAD~3` walks back payments → cart → auth → lands on `init`. The three newer commits are now
unreachable from `main`.

**Confirm the loss:**
```
➜ my-app git log --oneline
3f9a1c2 init
```
Only `init` is reachable. Looks wiped.

**The rescue — `git reflog`** (reflog = the log of where HEAD has BEEN, kept locally ~90 days):
```
➜ my-app git reflog
3f9a1c2 HEAD@{0}: reset: moving to HEAD~3
e5c07d3 HEAD@{1}: commit: add payments      ← the last good state
b21f6a9 HEAD@{2}: commit: add cart
7d4e8b0 HEAD@{3}: commit: add auth
3f9a1c2 HEAD@{4}: commit (initial): init
```
`HEAD@{1}` is where HEAD sat *before* the reset. Its hash `e5c07d3` still points at the full
history — git never deleted the objects.

**Restore:**
```
➜ my-app git reset --hard e5c07d3
HEAD is now at e5c07d3 add payments
➜ my-app git log --oneline
e5c07d3 add payments
b21f6a9 add cart
7d4e8b0 add auth
3f9a1c2 init
```
All four commits back. (Equivalent shortcut: `git reset --hard HEAD@{1}`.)

**Twist:** the reflog records EVERY move HEAD makes — a botched rebase, a deleted branch, a
hard reset. It's your local undo history for the whole repo.

## Beat sheet (~34s — tight timing pass, gaps ~0.25s, no dead air)

| # | t (s) | On screen | VO |
|---|-------|-----------|----|
| HOOK | 0.0–4.45 | Title **UNDO ANY / GIT MISTAKE** over the frozen disaster terminal (red `HEAD is now at 3f9a1c2`) — payoff/trap already visible at frame 0 | "You just ran git reset --hard. Three commits — gone." |
| SETUP | 4.45–7.35 | Terminal types `git log --oneline` → only `3f9a1c2 init` prints | "git log only shows the very first commit." |
| SETUP | 7.35–10.25 | Hold on the lonely single-commit log; pink **GONE?** stamp | "An hour of work — completely wiped." |
| TURN | 10.25–12.8 | Beat of hope; kicker flips to **THE FIX** (teal) | "But git kept a hidden log of everything." |
| REVEAL | 12.8–15.4 | Terminal types `git reflog` | "Here it is — git reflog." |
| REVEAL | 15.4–18.35 | 5 reflog lines cascade in | "Every move HEAD ever made is right here." |
| REVEAL | 18.35–21.25 | Gold highlight bar lands on `e5c07d3 HEAD@{1}: commit: add payments` | "There's your lost commit. Grab its hash." |
| REVEAL | 21.25–24.2 | Terminal types `git reset --hard e5c07d3` | "Then reset hard, straight back to it." |
| PAYOFF | 24.2–27.35 | `git log --oneline` prints all 4 commits, green flash + **RESTORED** stamp | "And every single commit is back." |
| TWIST | 27.35–30.7 | Dim terminal comment: `# resets · rebases · deleted branches` | "Bad rebase, deleted branch, hard reset — all logged." |
| LOOP | 30.7–34.0 | Terminal dissolves back to the frozen disaster + title (grow) → last frame == frame 0 | "git reflog is your undo button for everything." |

**Outro:** no CTA. Ends on the payoff line while the frame dissolves back into the hook
(disaster terminal + title), so the replay is seamless. See `[[shorts-outro-no-cta]]`.

## Production notes

- **Persistent canvas:** one `TerminalWindow` mounted frame 0 → ~loop; 18 lines total, disaster
  pre-revealed, the rest reveal at their `at` frame. All 18 lines fit above the caption band
  (no scroll) — the red disaster stays at top, teal restore lands at the bottom = built-in
  before/after in one frame.
- **Sequence-frame check:** the main terminal is mounted `from={0}`, so line `at` frames ==
  global frames (no offset math). Hook-title and loop scenes are separate overlay Sequences.
- **Highlight:** added an additive optional `hl` / `hlAt` to `TermLine` in `lib/terminal.tsx`
  (backward-compatible — the ebq lecture shots are untouched).
- Voice = real ElevenLabs (Liam) word times via `gen_voice.py`. **Tight timing pass (2026-07-14):**
  the first cut left ~10s of dead air (gaps up to 2.4s between lines — Hasan flagged it as slow
  with "stops"). Re-timed line starts to ~0.25s breaths, shortened the twist line, pulled the
  whole short 41s → 34s. `gen_voice` anchors each line at its authored start, so the terminal
  cue frames (keyed to line starts) stayed in sync — only the composition constants + SFX cue
  `at_s` were nudged; nothing rebuilt.
