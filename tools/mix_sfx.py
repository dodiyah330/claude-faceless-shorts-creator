#!/usr/bin/env python3
"""
mix_sfx.py — audition mixer for the SFX pass (step 4 of the AI Video Editor).

Reads a per-video sfx-plan.json (the audited source of truth: one event per cue, times
on the MASTER timeline) + the shared library catalog + a composited preview, and renders
an SFX-mixed preview: each clip is delayed to its cue time, gained per the plan, summed
into an SFX bus, optionally ducked under the voice (sidechain), and mixed over the master
audio. Video is copied through untouched.

This is the AUDITION mixer — get the cues right with the user here. Final polished
mix / ducking / loudness normalization is /assemble's job later.

Usage:
  python tools/mix_sfx.py [video-1/work/sfx-plan.json]
  python tools/mix_sfx.py plan.json --print         # show the resolved cue sheet, no render
  python tools/mix_sfx.py plan.json --no-optional    # drop events marked "optional": true
  python tools/mix_sfx.py plan.json --no-duck --end 60 --out path.mp4

ffmpeg/ffprobe on PATH. The preview + all referenced clips must exist.
"""
import json
import os
import subprocess
import sys

# Windows consoles default to cp1252 — force UTF-8 so unicode cue text (✓, →) prints
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rp(p):
    """Engine/LIBRARY paths (catalog, clips) resolve relative to ROOT (=core/)."""
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def proj(p):
    """PROJECT-data paths (plan, preview, output) resolve relative to CWD — the type workspace
    you run from (longs/), where video-N lives — NOT ROOT (=core/, the shared engine)."""
    return p if os.path.isabs(p) else os.path.abspath(p)


def show(p):
    """relpath for display, but tolerate paths on a different drive (Windows)."""
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + r.stdout[-4000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def main():
    args = sys.argv[1:]
    flags = {"print": "--print" in args, "no_optional": "--no-optional" in args}
    duck_override = None
    if "--no-duck" in args:
        duck_override = False
    if "--duck" in args:
        duck_override = True
    end_override = out_override = preview_override = None
    if "--end" in args:
        end_override = float(args[args.index("--end") + 1])
    if "--out" in args:
        out_override = args[args.index("--out") + 1]
    if "--preview" in args:  # mix over a different composited video than the plan names
        preview_override = args[args.index("--preview") + 1]
    positional = [a for a in args if not a.startswith("--")
                  and a not in {str(end_override), out_override, preview_override}]
    plan_path = proj(positional[0]) if positional else proj(os.path.join("video-1", "work", "sfx-plan.json"))

    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    render = plan.get("render", {})
    catalog_path = rp(plan.get("catalog", "media/library/sfx/catalog.json"))
    with open(catalog_path, encoding="utf-8") as f:
        catalog = json.load(f)
    lib = {c["id"]: c for c in catalog.get("clips", [])}

    preview = proj(preview_override or render.get("preview", "video-1/output/video-1-preview.mp4"))
    out = proj(out_override or render.get("out", "video-1/output/video-1-first60-sfx.mp4"))
    end = end_override if end_override is not None else float(render.get("end_s", 60))
    duck = duck_override if duck_override is not None else bool(render.get("duck", True))

    # resolve + filter events
    events = []
    missing = set()
    for e in plan["events"]:
        if flags["no_optional"] and e.get("optional"):
            continue
        if float(e["at_s"]) >= end:
            continue
        clip = lib.get(e["sfx_id"])
        if not clip:
            missing.add(e["sfx_id"])
            continue
        f = rp(os.path.join("media", "library", "sfx", clip["file"]))
        if not os.path.exists(f):
            missing.add(e["sfx_id"] + " (file)")
            continue
        events.append({**e, "file": f, "clip": clip})
    events.sort(key=lambda e: e["at_s"])

    # cue sheet
    print(f"plan: {show(plan_path)}   catalog: {len(lib)} clips")
    print(f"preview: {show(preview)}   end: {end}s   duck: {duck}")
    print(f"events: {len(events)}" + (f"  (dropping {sum(1 for e in plan['events'] if e.get('optional'))} optional)"
                                      if flags["no_optional"] else ""))
    print(f"  {'at_s':>7}  {'sfx_id':<14} {'gain':>5}  cue")
    for e in events:
        opt = " (opt)" if e.get("optional") else ""
        print(f"  {e['at_s']:>7.2f}  {e['sfx_id']:<14} {e.get('gain_db', 0):>4}dB  {e.get('cue', '')[:64]}{opt}")
    if missing:
        print("  MISSING from library (run tools/gen_sfx.py):", ", ".join(sorted(missing)))
    if flags["print"]:
        return
    if not events:
        sys.exit("no events to mix.")
    if missing:
        sys.exit("missing clips — generate them first (tools/gen_sfx.py).")
    for p in (preview,):
        if not os.path.exists(p):
            sys.exit(f"missing preview: {p}")
    os.makedirs(os.path.dirname(out), exist_ok=True)

    # ffmpeg: input 0 = preview; inputs 1..N = each event's clip
    cmd = ["ffmpeg", "-y", "-hide_banner", "-i", preview]
    for e in events:
        cmd += ["-i", e["file"]]

    parts, labels = [], []
    for i, e in enumerate(events):
        ms = int(round(float(e["at_s"]) * 1000))
        g = float(e.get("gain_db", 0))
        parts.append(f"[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                     f"adelay={ms}:all=1,volume={g:.2f}dB[e{i}]")
        labels.append(f"[e{i}]")

    if len(labels) == 1:
        parts.append(f"{labels[0]}anull[sfxraw]")
    else:
        parts.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:"
                     f"dropout_transition=0[sfxraw]")

    if duck:
        parts.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[v1][v2]")
        # GENTLE duck: only tuck the SFX a few dB under the loudest speech, never bury them.
        # (The per-cue gain_db already sets them under the voice; this just cleans overlaps.)
        parts.append("[sfxraw][v1]sidechaincompress=threshold=0.15:ratio=2:attack=5:"
                     "release=200:makeup=2[sfxduck]")
        parts.append("[v2][sfxduck]amix=inputs=2:normalize=0[mixraw]")
    else:
        parts.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo[v2]")
        parts.append("[v2][sfxraw]amix=inputs=2:normalize=0[mixraw]")
    # gentle safety limiter so summed peaks never clip
    parts.append("[mixraw]alimiter=level_in=1:level_out=1:limit=0.97[mix]")

    cmd += ["-filter_complex", ";".join(parts),
            "-map", "0:v:0", "-map", "[mix]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{end:.3f}", "-movflags", "+faststart", out]
    print(f"\nrendering -> {show(out)}")
    run(cmd)
    dur = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", out]).strip()
    print(f"done -> {show(out)}  ({dur}s, {len(events)} cues)")


if __name__ == "__main__":
    main()
