#!/usr/bin/env python3
"""
gen_sfx.py — grow the shared SFX library (media/library/sfx/) from a palette spec.

Step-4 (SFX) library builder for the AI Video Editor. Reads media/library/sfx/palette.json
(generic, reusable sound recipes), and for every sound that is NOT already on disk it
generates the clip via the ElevenLabs Sound Effects API (text -> sfx), peak-normalizes
it for consistent mixing headroom, measures duration + loudness, and (re)writes
media/library/sfx/catalog.json — the library manifest that /suggest-sfx and tools/mix_sfx.py read.

LIBRARY-FIRST: existing clips are skipped (never re-billed) unless --force. The library
is the durable, cross-project asset; each video is one draw from it.

Usage:
  python tools/gen_sfx.py                 # generate any missing palette sounds
  python tools/gen_sfx.py --force         # regenerate all (re-bills ElevenLabs)
  python tools/gen_sfx.py --only id1,id2  # just these ids
  python tools/gen_sfx.py --dry-run       # show what WOULD be generated, no API calls

Needs ELEVENLABS_API_KEY in .env (see .env.example). ffmpeg/ffprobe on PATH.
"""
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "media", "library", "sfx")
PALETTE = os.path.join(SFX_DIR, "palette.json")
CATALOG = os.path.join(SFX_DIR, "catalog.json")
API_URL = "https://api.elevenlabs.io/v1/sound-generation"

LICENSE = ("ElevenLabs generated (text-to-sfx); owner: the generating account, commercial use per "
           "the account's ElevenLabs plan")
SOURCE = "elevenlabs:sound-generation"


def load_env():
    """Minimal .env reader so we don't depend on python-dotenv."""
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def run_capture(cmd):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe_duration(path):
    out = run_capture(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                       "-of", "default=nw=1:nk=1", path]).strip()
    try:
        return round(float(out), 3)
    except ValueError:
        return None


def measure_peak_db(path):
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect",
                       "-f", "null", os.devnull])
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", out)
    return float(m.group(1)) if m else None


def measure_lufs(path):
    """Best-effort integrated loudness (ebur128). Unreliable for <1s transients; informational."""
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", os.devnull])
    ms = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", out)
    try:
        return float(ms[-1]) if ms else None
    except ValueError:
        return None


def apply_gain(path, gain_db):
    if abs(gain_db) < 0.1:
        return True
    tmp = path + ".norm.mp3"
    run_capture(["ffmpeg", "-y", "-hide_banner", "-i", path, "-af", f"volume={gain_db:.2f}dB",
                 "-c:a", "libmp3lame", "-q:a", "2", tmp])
    if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
        return True
    if os.path.exists(tmp):
        os.remove(tmp)
    return False


def normalize_clip(path, target_lufs, ceiling_db):
    """Loudness-normalize to target_lufs so gain_db in a plan is perceptually meaningful,
    but never let the peak exceed ceiling_db (single re-encode). Falls back to a plain
    peak-to-ceiling normalize for transients too short for a reliable ebur128 reading."""
    lufs = measure_lufs(path)
    peak = measure_peak_db(path)
    if peak is None:
        return None, None
    if lufs is None or lufs < -50:  # ebur128 gated the clip — peak-normalize instead
        apply_gain(path, ceiling_db - peak)
    else:
        gain = target_lufs - lufs
        if peak + gain > ceiling_db:      # would clip -> clamp to the ceiling
            gain = ceiling_db - peak
        apply_gain(path, gain)
    return measure_lufs(path), measure_peak_db(path)


def generate(api_key, prompt, duration_s, prompt_influence, model):
    body = {
        "text": prompt,
        "duration_seconds": float(duration_s),
        "prompt_influence": float(prompt_influence),
        "model_id": model,
    }
    req = urllib.request.Request(
        API_URL, data=json.dumps(body).encode("utf-8"),
        headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def main():
    args = sys.argv[1:]
    force = "--force" in args
    dry = "--dry-run" in args
    renorm = "--renorm" in args  # re-balance existing clips only, no API calls
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))

    with open(PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    pinf = d.get("prompt_influence", 0.45)
    target_lufs = d.get("target_lufs", -20.0)
    ceiling_db = d.get("ceiling_dbfs", -1.5)
    model = d.get("model", "eleven_text_to_sound_v2")

    catalog = {"note": "", "clips": []}
    if os.path.exists(CATALOG):
        with open(CATALOG, encoding="utf-8") as f:
            catalog = json.load(f)
    catalog["note"] = ("Shared SFX library manifest for the AI Video Editor. Generated by "
                       "tools/gen_sfx.py from palette.json. Clips are loudness-normalized mp3 in "
                       "media/library/sfx/clips/. Read by tools/mix_sfx.py and /suggest-sfx. Grows every "
                       "video (library-first). Note: SFX that must live INSIDE a Remotion TSX shot "
                       "go in remotion/public/media/library/sfx/ via staticFile(); this library is for the "
                       f"post-mix (tools/mix_sfx.py). Loudness-normalized to ~{target_lufs} LUFS with a "
                       f"{ceiling_db} dBFS peak ceiling, so a plan's per-cue gain_db is perceptually "
                       "meaningful (see each video's sfx-plan.json).")
    by_id = {c["id"]: c for c in catalog.get("clips", [])}

    clips_dir = os.path.join(SFX_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    env = load_env()
    api_key = env.get("ELEVENLABS_API_KEY", "").strip()

    def entry(s, rel, path):
        lufs, peak = normalize_clip(path, target_lufs, ceiling_db)
        dur = probe_duration(path)
        print(f"   {s['id']}: dur={dur}s  peak={peak}dBFS  lufs={lufs}")
        return {
            "id": s["id"], "file": rel, "category": s.get("category", ""),
            "tags": s.get("tags", []), "duration_s": dur, "peak_dbfs": peak,
            "loudness_lufs": lufs, "source": SOURCE, "model": model, "license": LICENSE,
            "prompt": s["prompt"], "used_in": by_id.get(s["id"], {}).get("used_in", []),
        }

    def write_catalog():
        order = [s["id"] for s in palette["sounds"]]
        catalog["clips"] = ([by_id[i] for i in order if i in by_id]
                            + [c for i, c in by_id.items() if i not in order])
        with open(CATALOG, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"\ncatalog -> {os.path.relpath(CATALOG, ROOT)}  ({len(catalog['clips'])} clips)")

    if renorm:  # re-balance existing clips to the current loudness target, no API
        n = 0
        for s in palette["sounds"]:
            if only and s["id"] not in only:
                continue
            rel = f"clips/{s['id']}.mp3"
            path = os.path.join(SFX_DIR, rel)
            if not os.path.exists(path):
                continue
            by_id[s["id"]] = entry(s, rel, path)
            n += 1
        print(f"re-normalized {n} clips to ~{target_lufs} LUFS (ceiling {ceiling_db} dBFS)")
        write_catalog()
        return

    todo, skip = [], []
    for s in palette["sounds"]:
        if only and s["id"] not in only:
            continue
        rel = f"clips/{s['id']}.mp3"
        path = os.path.join(SFX_DIR, rel)
        if os.path.exists(path) and not force:
            skip.append(s["id"])
            continue
        todo.append((s, rel, path))

    print(f"palette: {len(palette['sounds'])} sounds | to generate: {len(todo)} | skip (exist): {len(skip)}")
    if skip:
        print("  skipping (library-first):", ", ".join(skip))
    if dry:
        for s, rel, _ in todo:
            print(f"  WOULD generate {s['id']} -> {rel}  ({s['duration_s']}s)  \"{s['prompt'][:60]}...\"")
        return
    if todo and not api_key:
        sys.exit("ELEVENLABS_API_KEY not set in .env — cannot generate. (Add it, or use --dry-run.)")

    for s, rel, path in todo:
        print(f"\n-> {s['id']}  ({s['duration_s']}s)")
        try:
            audio = generate(api_key, s["prompt"], s["duration_s"], pinf, model)
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:400]}")
        with open(path, "wb") as f:
            f.write(audio)
        by_id[s["id"]] = entry(s, rel, path)

    write_catalog()


if __name__ == "__main__":
    main()
