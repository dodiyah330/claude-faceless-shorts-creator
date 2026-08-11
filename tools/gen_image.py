#!/usr/bin/env python3
"""
gen_image.py — in-video AI images via the DIRECT Google Gemini API (channel shorts).

General-purpose sibling of gen_thumbnail.py (which stays thumbnail-specialized): generates
an illustration/atmosphere/still frame for a video beat, saves PNG + a sidecar .json
(prompt, model, refs, seed) so any render can be reproduced or re-rolled.

Model presets (confirmed against the live models endpoint 2026-07-10):
  pro   -> gemini-3-pro-image          (Nano Banana Pro — complex scenes, best quality)
  fast  -> gemini-3.1-flash-image      (Nano Banana 2 — cheaper, quick images)
  lite  -> gemini-3.1-flash-lite-image (Nano Banana 2 Lite — cheapest drafts)
Any raw model id is also accepted.

Usage:
  python tools/gen_image.py --prompt "..." --out shorts/ch-1-rate-limiting/assets/night.png
  python tools/gen_image.py --prompt-file p.txt --model pro --aspect 9:16 --out x.png
  python tools/gen_image.py --prompt "..." --ref media/library/faces/a.jpg --out x.png
  --aspect 9:16 (default, vertical shorts) | 16:9 | 1:1 ...   --size 1K|2K|4K (default 2K)
  --seed N   --dry-run

Needs GEMINI_API_KEY in .env and the google-genai SDK. Reference images are OPTIONAL and
explicit (no default face kit here — that's gen_thumbnail.py's behavior).
"""
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRESETS = {
    "pro": "gemini-3-pro-image",
    "fast": "gemini-3.1-flash-image",
    "lite": "gemini-3.1-flash-lite-image",
}
DEFAULT_MODEL = "fast"
RESPONSE_MODALITIES = ["TEXT", "IMAGE"]


def load_env():
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


def get_arg(args, name, default=None):
    return args[args.index(name) + 1] if name in args else default


def get_args_multi(args, name):
    return [args[i + 1] for i, a in enumerate(args) if a == name]


def rel(p):
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def mime_for(path):
    return "image/png" if path.lower().endswith(".png") else "image/jpeg"


def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args

    prompt = get_arg(args, "--prompt")
    pf = get_arg(args, "--prompt-file")
    if pf:
        prompt = open(pf, encoding="utf-8").read()
    out = get_arg(args, "--out")
    if not prompt or not out:
        sys.exit("need --prompt/--prompt-file and --out (see file header)")

    model = get_arg(args, "--model", DEFAULT_MODEL)
    model = PRESETS.get(model, model)
    aspect = get_arg(args, "--aspect", "9:16")
    size = get_arg(args, "--size", "2K")
    seed = get_arg(args, "--seed")
    seed = int(seed) if seed is not None else None
    refs = [r for r in get_args_multi(args, "--ref") if os.path.exists(r)]

    print(f"model={model}  aspect={aspect}  size={size}  seed={seed}")
    print(f"refs ({len(refs)}):", ", ".join(rel(r) for r in refs) or "(none)")
    print(f"out -> {rel(out)}")
    if dry:
        print("[dry-run] validated; no API call.")
        return

    api_key = load_env().get("GEMINI_API_KEY", "").strip()
    if not api_key:
        sys.exit("GEMINI_API_KEY not set in .env")

    from google import genai
    from google.genai import types

    contents = [prompt]
    for r in refs:
        with open(r, "rb") as f:
            contents.append(types.Part.from_bytes(data=f.read(), mime_type=mime_for(r)))

    cfg_kwargs = dict(
        response_modalities=RESPONSE_MODALITIES,
        image_config=types.ImageConfig(aspect_ratio=aspect, image_size=size),
    )
    if seed is not None and "seed" in types.GenerateContentConfig.model_fields:
        cfg_kwargs["seed"] = seed

    client = genai.Client(api_key=api_key)
    try:
        resp = client.models.generate_content(
            model=model, contents=contents, config=types.GenerateContentConfig(**cfg_kwargs))
    except Exception as e:
        sys.exit(f"Gemini API error: {type(e).__name__}: {e}")

    img_bytes, texts = None, []
    for cand in (resp.candidates or []):
        for part in ((cand.content.parts if cand.content else None) or []):
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                img_bytes = inline.data
            elif getattr(part, "text", None):
                texts.append(part.text)
    if texts:
        print("  model text:", " ".join(texts)[:300])
    if not img_bytes:
        sys.exit("No image returned (safety block / refusal / wrong model id?)")

    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, "wb") as f:
        f.write(img_bytes)
    print(f"  png  -> {rel(out)}  ({len(img_bytes)//1024}KB)")

    sidecar = os.path.splitext(out)[0] + ".json"
    with open(sidecar, "w", encoding="utf-8") as f:
        json.dump({"prompt": prompt, "model": model, "aspect_ratio": aspect,
                   "image_size": size, "seed": seed, "refs": [rel(r) for r in refs],
                   "created": time.strftime("%Y-%m-%dT%H:%M:%S")}, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"  meta -> {rel(sidecar)}")


if __name__ == "__main__":
    main()
