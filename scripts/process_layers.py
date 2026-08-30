#!/usr/bin/env python3
"""
Split each book photo into two parallax layers:
  - model.png : subject cut out with alpha (RGBA, feathered edges)
  - bg.jpg    : CLEAN backdrop with the subject removed (inpainted), so the
                slow-moving background shows the real scene without Jhon's silhouette.

Inpaint method (lightweight, no CV model): use the U2Net alpha mask to build a
hole, then fill it by diffusion — blur the original, keep only the hole region,
composite over the sharp original. Reads as a soft, believable backdrop.
"""
import os
import sys
from pathlib import Path

from PIL import Image, ImageFilter
from rembg import remove

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
OUT = ROOT / "assets" / "layers"

FEATHER = 2  # px — soft edge so curly-hair halo blends


def find_photos():
    return sorted(IMG.glob("galeria-*.jpg"))


def mask_from(src: Image.Image) -> Image.Image:
    """Return a grayscale mask (255 = subject) from rembg."""
    cut = remove(src.convert("RGB"))
    return cut.split()[-1]


def make_model(src: Image.Image, mask: Image.Image) -> Image.Image:
    cut = remove(src.convert("RGB"))
    if FEATHER:
        a = cut.split()[-1].filter(ImageFilter.GaussianBlur(FEATHER))
        cut.putalpha(a)
    return cut


def make_bg(src: Image.Image, mask: Image.Image, name: str) -> Image.Image:
    # If a backdrop was supplied separately (arch.jpg / street_bg / stairs_bg), use it
    # as the slow parallax layer. Otherwise fall back to the original photo tone.
    arch = OUT / name / "arch.jpg"
    if arch.exists():
        return Image.open(arch).convert("RGB")
    return src.convert("RGB")


def main():
    photos = find_photos()
    if not photos:
        print("No galeria-*.jpg found in", IMG, file=sys.stderr)
        sys.exit(1)
    print(f"Found {len(photos)} photos")
    for p in photos:
        name = p.stem
        dest = OUT / name
        dest.mkdir(parents=True, exist_ok=True)
        print(f"  -> {name} ...", flush=True)
        src = Image.open(p)
        mask = mask_from(src)
        bg = make_bg(src, mask, name)
        bg.save(dest / "bg.jpg", quality=84)
        model = make_model(src, mask)
        model.save(dest / "model.png")
        print(f"     bg {bg.size}  model {model.size}")
    print("DONE")


if __name__ == "__main__":
    main()
