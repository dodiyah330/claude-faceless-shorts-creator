#!/usr/bin/env python3
"""
cutout.py — turn an "isolated on white" image into a transparent collage cutout (vox engine).

Takes a gen_image.py output whose subject sits on a plain near-white background and produces
a transparent PNG layer, optionally with the Vox-style white sticker border baked in.

Methods (--method, default auto):
  rembg — ML matting (u2net via rembg). Handles cast shadows, gray backgrounds, subjects
          with white areas. PREFERRED; auto-picked when rembg is installed in the venv.
  key   — soft white-key: alpha from distance-to-white with a smooth ramp (tol → tol+soft).
          Fallback only. Fails when the subject's light tones match the background/shadow
          (proven on vox-1's cup: contact shadow ≈ glaze in distance-to-white).
  auto  — rembg if importable, else key.

Either way the matte is then eroded 1px, feathered, trimmed, optionally sticker-bordered.

Usage:
  python tools/cutout.py in.png out.png
  python tools/cutout.py in.png out.png --method key --tol 30 --soft 22 --border 14 --pad 24
  --tol N      distance-to-white (0-441) fully transparent below this      [default 34]
  --soft N     ramp width: fully opaque at tol+soft                        [default 26]
  --feather F  gaussian blur radius on the matte edge                      [default 1.0]
  --border N   bake a white sticker outline N px wide (0 = none; usually
               leave 0 and let lib/collage.tsx draw it via CSS so it scales)[default 0]
  --pad N      transparent padding kept around the trimmed subject          [default 16]
  --no-trim    keep original canvas instead of trimming to the subject bbox
"""
import argparse
import os
import sys

from PIL import Image, ImageFilter


def build_matte(img: Image.Image, tol: float, soft: float) -> Image.Image:
    """Alpha from distance-to-white with a smooth ramp: 0 below tol, 255 above tol+soft."""
    rgb = img.convert("RGB")
    px = rgb.load()
    w, h = rgb.size
    matte = Image.new("L", (w, h))
    mp = matte.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            dr, dg, db = 255 - r, 255 - g, 255 - b
            d = (dr * dr + dg * dg + db * db) ** 0.5
            if d <= tol:
                a = 0
            elif d >= tol + soft:
                a = 255
            else:
                a = int(255 * (d - tol) / soft)
            mp[x, y] = a
    return matte


def build_matte_fast(img: Image.Image, tol: float, soft: float):
    """numpy version of build_matte (used when numpy is importable — ~100x faster)."""
    import numpy as np

    arr = np.asarray(img.convert("RGB"), dtype=np.float32)
    d = np.sqrt(((255.0 - arr) ** 2).sum(axis=2))
    a = np.clip((d - tol) / max(soft, 1e-6), 0.0, 1.0) * 255.0
    return Image.fromarray(a.astype("uint8"), "L")


def matte_rembg(img: Image.Image) -> Image.Image:
    """ML matte via rembg/u2net — the robust path for shadows and non-white backgrounds."""
    from rembg import remove

    cut = remove(img.convert("RGBA"))
    return cut.getchannel("A")


def main():
    ap = argparse.ArgumentParser(description="turn an image into a transparent collage cutout")
    ap.add_argument("inp")
    ap.add_argument("out")
    ap.add_argument("--method", choices=["auto", "rembg", "key"], default="auto")
    ap.add_argument("--tol", type=float, default=34)
    ap.add_argument("--soft", type=float, default=26)
    ap.add_argument("--feather", type=float, default=1.0)
    ap.add_argument("--border", type=int, default=0)
    ap.add_argument("--pad", type=int, default=16)
    ap.add_argument("--no-trim", action="store_true")
    args = ap.parse_args()

    img = Image.open(args.inp)
    method = args.method
    if method == "auto":
        try:
            import rembg  # noqa: F401
            method = "rembg"
        except ImportError:
            method = "key"

    if method == "rembg":
        matte = matte_rembg(img)
    else:
        try:
            matte = build_matte_fast(img, args.tol, args.soft)
        except ImportError:
            matte = build_matte(img, args.tol, args.soft)

    # Erode 1px (kills the bright halo the key leaves at the silhouette), then feather.
    matte = matte.filter(ImageFilter.MinFilter(3))
    if args.feather > 0:
        matte = matte.filter(ImageFilter.GaussianBlur(args.feather))

    out = img.convert("RGBA")
    out.putalpha(matte)

    if not args.no_trim:
        bbox = matte.getbbox()
        if bbox is None:
            sys.exit("cutout.py: matte is fully transparent — check --tol / the source image")
        p = args.pad
        l = max(0, bbox[0] - p)
        t = max(0, bbox[1] - p)
        r = min(out.width, bbox[2] + p)
        b = min(out.height, bbox[3] + p)
        out = out.crop((l, t, r, b))

    if args.border > 0:
        a = out.getchannel("A").filter(ImageFilter.MaxFilter(args.border * 2 + 1))
        a = a.filter(ImageFilter.GaussianBlur(0.6))
        sticker = Image.new("RGBA", out.size, (255, 255, 255, 0))
        sticker.putalpha(a)
        white = Image.new("RGBA", out.size, (255, 255, 255, 255))
        sticker = Image.composite(white, sticker, a)
        sticker.putalpha(a)
        sticker.alpha_composite(out)
        out = sticker

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    out.save(args.out)
    op = sum(1 for v in out.getchannel("A").getdata() if v > 8)
    print(f"cutout[{method}]: {args.inp} -> {args.out}  {out.width}x{out.height}  opaque~{op * 100 // (out.width * out.height)}%")


if __name__ == "__main__":
    main()
