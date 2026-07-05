#!/usr/bin/env python3
"""Generate placeholder isometric sprites for bones.

The real Kenney raw_assets packs referenced in .this/memory.md were never
committed to the repo and are unreachable from this environment. This
script procedurally generates size/pixel-ready placeholders on the same
256x512 canvas / bottom-center-anchor convention documented in memory.md,
so game.js has something real to load. Swap in real art later by keeping
the same filenames and canvas size.
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "files" / "assets"
CANVAS = (256, 512)
random.seed(7)


def new_canvas():
    return Image.new("RGBA", CANVAS, (0, 0, 0, 0))


def save(img, name):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    img.save(path)
    print(f"wrote {path} ({img.width}x{img.height})")


def make_tile(base_color, seed):
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    w, h = CANVAS
    diamond = [(w / 2, h - 128), (w, h - 64), (w / 2, h), (0, h - 64)]
    draw.polygon(diamond, fill=(*base_color, 255))

    rng = random.Random(seed)
    for _ in range(220):
        t = rng.random()
        u = rng.random()
        x = w / 2 + (u - 0.5) * w * (1 - abs(t - 0.5) * 2)
        y = (h - 128) + t * 128
        shade = rng.randint(-14, 14)
        c = tuple(max(0, min(255, ch + shade)) for ch in base_color)
        draw.point((x, y), fill=(*c, 255))

    draw.line(diamond + [diamond[0]], fill=(0, 0, 0, 60), width=2)
    return img


def make_witch():
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    w, h = CANVAS
    base_y = h - 96
    robe_color = (58, 42, 92)
    trim_color = (30, 20, 54)

    draw.polygon(
        [(w / 2 - 6, base_y - 210), (w / 2 - 46, base_y), (w / 2 + 46, base_y), (w / 2 + 6, base_y - 210)],
        fill=(*robe_color, 255),
    )
    draw.ellipse([w / 2 - 46, base_y - 14, w / 2 + 46, base_y + 14], fill=(*trim_color, 255))

    head_r = 26
    head_cy = base_y - 232
    skin = (222, 184, 158)
    draw.ellipse([w / 2 - head_r, head_cy - head_r, w / 2 + head_r, head_cy + head_r], fill=(*skin, 255))

    hat_color = (24, 18, 40)
    draw.polygon(
        [(w / 2, head_cy - head_r - 90), (w / 2 - 44, head_cy - head_r + 10), (w / 2 + 44, head_cy - head_r + 10)],
        fill=(*hat_color, 255),
    )
    draw.ellipse(
        [w / 2 - 56, head_cy - head_r - 4, w / 2 + 56, head_cy - head_r + 20],
        fill=(*hat_color, 255),
    )

    eye_y = head_cy + 2
    draw.ellipse([w / 2 - 12, eye_y - 3, w / 2 - 6, eye_y + 3], fill=(20, 10, 10, 255))
    draw.ellipse([w / 2 + 6, eye_y - 3, w / 2 + 12, eye_y + 3], fill=(20, 10, 10, 255))

    return img


def make_pet():
    """Single base shape, meant to be tinted per-instance in Phaser rather
    than re-drawn per variant — keeps the asset count flat as summon count
    scales up."""
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    w, h = CANVAS
    base_y = h - 96
    body_color = (235, 235, 235)

    draw.ellipse([w / 2 - 34, base_y - 56, w / 2 + 34, base_y + 4], fill=(*body_color, 255))
    for dx in (-16, 16):
        draw.polygon(
            [(w / 2 + dx - 10, base_y - 50), (w / 2 + dx, base_y - 80), (w / 2 + dx + 10, base_y - 50)],
            fill=(*body_color, 255),
        )
    eye_y = base_y - 30
    draw.ellipse([w / 2 - 16, eye_y - 4, w / 2 - 8, eye_y + 4], fill=(20, 20, 20, 255))
    draw.ellipse([w / 2 + 8, eye_y - 4, w / 2 + 16, eye_y + 4], fill=(20, 20, 20, 255))

    return img


if __name__ == "__main__":
    save(make_tile((94, 74, 58), seed=1), "tile_dirt.png")
    save(make_tile((104, 84, 66), seed=2), "tile_dirt_alt.png")
    save(make_witch(), "witch.png")
    save(make_pet(), "pet.png")
