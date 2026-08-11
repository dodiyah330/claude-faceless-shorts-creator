#!/usr/bin/env python3
"""
gen_music.py — grow the shared MUSIC library (media/library/music/) from a palette spec.

Step-4 (music) library builder for the AI Video Editor. Reads media/library/music/palette.json
(generic, reusable background-bed recipes) and, for every bed that is NOT already on disk,
generates it via the ElevenLabs Music API (force_instrumental), loudness-normalizes it to a
bed level for consistent mixing headroom, measures duration + loudness, and (re)writes
media/library/music/catalog.json — the manifest that /assemble and tools/mix_music.py read.

LIBRARY-FIRST: existing beds are skipped (never re-billed) unless --force. The style prompts
are reusable; each video generates the beds it wants at the length it needs.

Usage:
  python tools/gen_music.py                       # generate any missing palette beds (test length)
  python tools/gen_music.py --only ambient-pad    # just this bed
  python tools/gen_music.py --only ambient-pad --length 330000   # regenerate at full length (ms)
  python tools/gen_music.py --force               # regenerate all (re-bills ElevenLabs)
  python tools/gen_music.py --dry-run             # show what WOULD be generated, no API calls
  python tools/gen_music.py --renorm              # re-balance existing beds to target LUFS, no API

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
MUSIC_DIR = os.path.join(ROOT, "media", "library", "music")
PALETTE = os.path.join(MUSIC_DIR, "palette.json")
CATALOG = os.path.join(MUSIC_DIR, "catalog.json")
API_URL = "https://api.elevenlabs.io/v1/music"

LICENSE = ("ElevenLabs generated (text-to-music); owner: the generating account, commercial use per "
           "the account's ElevenLabs plan")
SOURCE = "elevenlabs:music"


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
    """Integrated loudness (ebur128). Reliable for music (multi-second, non-gated)."""
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
    """Loudness-normalize to target_lufs so a mix's bed gain is perceptually meaningful,
    but never let the peak exceed ceiling_db (single re-encode)."""
    lufs = measure_lufs(path)
    peak = measure_peak_db(path)
    if peak is None:
        return None, None
    if lufs is None or lufs < -50:
        apply_gain(path, ceiling_db - peak)
    else:
        gain = target_lufs - lufs
        if peak + gain > ceiling_db:      # would clip -> clamp to the ceiling
            gain = ceiling_db - peak
        apply_gain(path, gain)
    return measure_lufs(path), measure_peak_db(path)


def generate(api_key, prompt, length_ms, model, force_instrumental, output_format):
    body = {
        "prompt": prompt,
        "music_length_ms": int(length_ms),
        "model_id": model,
        "force_instrumental": bool(force_instrumental),
    }
    url = f"{API_URL}?output_format={output_format}"
    req = urllib.request.Request(
        url, data=json.dumps(body).encode("utf-8"),
        headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        return resp.read()


def main():
    args = sys.argv[1:]
    force = "--force" in args
    dry = "--dry-run" in args
    renorm = "--renorm" in args  # re-balance existing beds only, no API calls
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))
    length_override_ms = None
    if "--length" in args:
        length_override_ms = int(args[args.index("--length") + 1])

    with open(PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    target_lufs = d.get("target_lufs", -20.0)
    ceiling_db = d.get("ceiling_dbfs", -1.5)
    model = d.get("model", "music_v2")
    force_instrumental = d.get("force_instrumental", True)
    output_format = d.get("output_format", "mp3_44100_128")

    catalog = {"note": "", "clips": []}
    if os.path.exists(CATALOG):
        with open(CATALOG, encoding="utf-8") as f:
            catalog = json.load(f)
    catalog["note"] = ("Shared MUSIC library manifest for the AI Video Editor. Generated by "
                       "tools/gen_music.py from palette.json. Instrumental background beds "
                       "(mp3 in media/library/music/clips/), loudness-normalized to "
                       f"~{target_lufs} LUFS with a {ceiling_db} dBFS ceiling so a mix's bed gain "
                       "is perceptually meaningful. Meant to sit UNDER the voice as a continuous, "
                       "ducked bed (tools/mix_music.py). Read by /assemble. Grows every video "
                       "(library-first).")
    by_id = {c["id"]: c for c in catalog.get("clips", [])}

    clips_dir = os.path.join(MUSIC_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    env = load_env()
    api_key = env.get("ELEVENLABS_API_KEY", "").strip()

    def entry(s, rel, path, length_ms):
        lufs, peak = normalize_clip(path, target_lufs, ceiling_db)
        dur = probe_duration(path)
        print(f"   {s['id']}: dur={dur}s  peak={peak}dBFS  lufs={lufs}")
        return {
            "id": s["id"], "file": rel, "category": s.get("category", ""),
            "tags": s.get("tags", []), "duration_s": dur, "requested_ms": length_ms,
            "peak_dbfs": peak, "loudness_lufs": lufs, "source": SOURCE, "model": model,
            "force_instrumental": force_instrumental, "license": LICENSE,
            "prompt": s["prompt"], "used_in": by_id.get(s["id"], {}).get("used_in", []),
        }

    def write_catalog():
        order = [s["id"] for s in palette["beds"]]
        catalog["clips"] = ([by_id[i] for i in order if i in by_id]
                            + [c for i, c in by_id.items() if i not in order])
        with open(CATALOG, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"\ncatalog -> {os.path.relpath(CATALOG, ROOT)}  ({len(catalog['clips'])} beds)")

    if renorm:  # re-balance existing beds to the current loudness target, no API
        n = 0
        for s in palette["beds"]:
            if only and s["id"] not in only:
                continue
            rel = f"clips/{s['id']}.mp3"
            path = os.path.join(MUSIC_DIR, rel)
            if not os.path.exists(path):
                continue
            by_id[s["id"]] = entry(s, rel, path, by_id.get(s["id"], {}).get("requested_ms"))
            n += 1
        print(f"re-normalized {n} beds to ~{target_lufs} LUFS (ceiling {ceiling_db} dBFS)")
        write_catalog()
        return

    todo, skip = [], []
    for s in palette["beds"]:
        if only and s["id"] not in only:
            continue
        rel = f"clips/{s['id']}.mp3"
        path = os.path.join(MUSIC_DIR, rel)
        if os.path.exists(path) and not force:
            skip.append(s["id"])
            continue
        length_ms = length_override_ms or int(round(float(s["duration_s"]) * 1000))
        todo.append((s, rel, path, length_ms))

    print(f"palette: {len(palette['beds'])} beds | to generate: {len(todo)} | skip (exist): {len(skip)}")
    if skip:
        print("  skipping (library-first):", ", ".join(skip))
    if dry:
        for s, rel, _, length_ms in todo:
            print(f"  WOULD generate {s['id']} -> {rel}  ({length_ms/1000:.0f}s)  \"{s['prompt'][:60]}...\"")
        return
    if todo and not api_key:
        sys.exit("ELEVENLABS_API_KEY not set in .env — cannot generate. (Add it, or use --dry-run.)")

    for s, rel, path, length_ms in todo:
        print(f"\n-> {s['id']}  ({length_ms/1000:.0f}s)")
        try:
            audio = generate(api_key, s["prompt"], length_ms, model, force_instrumental, output_format)
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:400]}")
        with open(path, "wb") as f:
            f.write(audio)
        by_id[s["id"]] = entry(s, rel, path, length_ms)

    write_catalog()


if __name__ == "__main__":
    main()
