#!/usr/bin/env python3
"""
mix_music.py — audition mixer for the MUSIC pass (step 4 of the AI Video Editor).

Lays a continuous instrumental BED (from media/library/music/) under a base video and ducks it
HARD under the voice, so the music is felt-not-heard: quiet under speech, breathing up in
the gaps (intro/outro/pauses). Video is copied through untouched. This is the AUDITION mixer
— pick the bed + level with the user here; final polished mix / loudness normalization is
/assemble's job later.

The bed is looped/trimmed to the base length, gained to sit under the voice, high-passed a
touch so it never muddies speech, sidechain-ducked keyed by the base audio (voice + any SFX),
faded in/out, and summed with a safety limiter.

Usage:
  # one bed over the SFX'd first-60s -> a new file
  python tools/mix_music.py --bed ambient-pad --base video-1/output/video-1-first60-sfx.mp4 \
      --out video-1/output/video-1-first60-ambient-pad.mp4

  # compare every library bed at once (one out file per bed, <base-stem>-<bed>.mp4)
  python tools/mix_music.py --all --base video-1/output/video-1-first60-sfx.mp4

  --bed-gain -7      base bed level in dB (default -7; more negative = quieter)
  --duck 9           extra dB the bed drops under the voice (default 9)
  --fade 1.5         fade in/out seconds (default 1.5)
  --end 60           trim output to N seconds (default: full base)
  --print            show the resolved settings, no render

ffmpeg/ffprobe on PATH. Beds come from media/library/music/catalog.json (run tools/gen_music.py first).
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "media", "library", "music", "catalog.json")


def rp(p):
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def show(p):
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


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", path]).strip()
    return float(out)


def flag(args, name, default=None, cast=str):
    if name in args:
        return cast(args[args.index(name) + 1])
    return default


def mix_one(base, bed_file, out, bed_gain, duck, fade, end):
    """Render base video with `bed_file` ducked underneath. Returns out path."""
    os.makedirs(os.path.dirname(out), exist_ok=True)
    dur = end if end is not None else probe_duration(base)

    # input 0 = base video (voice + any SFX); input 1 = bed (looped to cover the base)
    cmd = ["ffmpeg", "-y", "-hide_banner",
           "-i", base,
           "-stream_loop", "-1", "-i", bed_file]

    parts = []
    # bed: standard format, gentle high-pass so it never muddies speech, trim to length,
    # set base level, fade in/out.
    parts.append(
        f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,"
        f"highpass=f=90,volume={bed_gain:.2f}dB,atrim=0:{dur:.3f},asetpts=N/SR/TB,"
        f"afade=t=in:st=0:d={fade:.2f},afade=t=out:st={max(0.0, dur - fade):.3f}:d={fade:.2f}[bed]"
    )
    # base voice: split — one copy is the sidechain key, one is the final voice.
    parts.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[key][voice]")
    # duck the bed under the voice: ratio/makeup tuned so the bed drops ~`duck` dB when the voice
    # speaks and recovers smoothly in the gaps. Slow release keeps it from pumping.
    ratio = max(2.0, duck / 3.0)   # ~9 dB target -> ratio 3
    parts.append(
        f"[bed][key]sidechaincompress=threshold=0.03:ratio={ratio:.2f}:attack=15:"
        f"release=450:makeup=1[bedduck]"
    )
    parts.append("[voice][bedduck]amix=inputs=2:normalize=0:dropout_transition=0[mixraw]")
    parts.append("[mixraw]alimiter=level_in=1:level_out=1:limit=0.97[mix]")

    cmd += ["-filter_complex", ";".join(parts),
            "-map", "0:v:0", "-map", "[mix]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{dur:.3f}", "-movflags", "+faststart", out]
    print(f"  rendering -> {show(out)}")
    run(cmd)
    return out


def main():
    args = sys.argv[1:]
    base = rp(flag(args, "--base", "video-1/output/video-1-first60-sfx.mp4"))
    bed_gain = flag(args, "--bed-gain", -7.0, float)
    duck = flag(args, "--duck", 9.0, float)
    fade = flag(args, "--fade", 1.5, float)
    end = flag(args, "--end", None, float)
    do_all = "--all" in args
    only_bed = flag(args, "--bed", None)
    out_override = flag(args, "--out", None)

    with open(CATALOG, encoding="utf-8") as f:
        catalog = json.load(f)
    beds = {c["id"]: c for c in catalog.get("clips", [])}

    if do_all:
        targets = list(beds.keys())
    elif only_bed:
        targets = [only_bed]
    else:
        sys.exit("specify --bed <id> or --all (available: " + ", ".join(beds) + ")")

    print(f"base: {show(base)}   bed-gain: {bed_gain}dB   duck: {duck}dB   fade: {fade}s"
          + (f"   end: {end}s" if end else ""))
    print(f"beds: {', '.join(targets)}")
    if not os.path.exists(base):
        sys.exit(f"missing base video: {base}")

    stem = os.path.splitext(os.path.basename(base))[0]
    results = []
    for bid in targets:
        clip = beds.get(bid)
        if not clip:
            print(f"  SKIP {bid}: not in catalog (run tools/gen_music.py)")
            continue
        bed_file = rp(os.path.join("media", "library", "music", clip["file"]))
        if not os.path.exists(bed_file):
            print(f"  SKIP {bid}: file missing {show(bed_file)}")
            continue
        if out_override and not do_all:
            out = rp(out_override)
        else:
            # auditions land next to the base video, whatever project it belongs to
            out = os.path.join(os.path.dirname(base), f"{stem}-{bid}.mp4")
        if "--print" in args:
            print(f"  {bid} -> {show(out)}")
            continue
        results.append(mix_one(base, bed_file, out, bed_gain, duck, fade, end))

    if results:
        print("\ndone:")
        for r in results:
            d = probe_duration(r)
            print(f"  {show(r)}  ({d:.1f}s)")


if __name__ == "__main__":
    main()
