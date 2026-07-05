#!/usr/bin/env python3
"""Prepare isometric sprites for bones.

`raw_assets/` is intentionally gitignored (see repo-root .gitignore:
`**/raw_assets/`) — it's a local-only drop location for third-party packs
(Kenney, etc.), never committed. It may or may not exist in any given
checkout. This script is non-breaking either way:

- If the expected Kenney source file exists under raw_assets/, it's
  resized/padded onto the standard 256x512 canvas ("size/pixel ready")
  and used.
- If not, a procedural placeholder is generated instead.

Either path writes the same output filenames into files/assets/, so
game.js never needs to know or care which source was used. Run this
before relying on files/assets/ — it's not committed output, it's
generated.

Pets are always procedural regardless of raw_assets availability: staying
on one shared, tintable shape is the scalability design (see this.md),
not just a fallback for missing art.
"""
import random
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw_assets"
OUT = ROOT / "files" / "assets"
CANVAS = (256, 512)
random.seed(7)


def new_canvas():
    return Image.new("RGBA", CANVAS, (0, 0, 0, 0))


def from_source(*relative_path):
    """Load a real Kenney source file and normalize it onto CANVAS, or
    return None if raw_assets isn't present / the file is missing."""
    src = RAW.joinpath(*relative_path)
    if not src.is_file():
        return None
    source = Image.open(src).convert("RGBA")
    if source.size == CANVAS:
        return source
    canvas = new_canvas()
    scale = min(CANVAS[0] / source.width, CANVAS[1] / source.height)
    resized = source.resize((max(1, int(source.width * scale)), max(1, int(source.height * scale))))
    x = (CANVAS[0] - resized.width) // 2
    y = CANVAS[1] - resized.height
    canvas.paste(resized, (x, y), resized)
    return canvas


def save(img, name, source_note=""):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    img.save(path)
    tag = f" [{source_note}]" if source_note else ""
    print(f"wrote {path} ({img.width}x{img.height}){tag}")


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


DUNGEON = ("kenney_isometric-miniature-dungeon", "Isometric")
DUNGEON_CHARS = ("kenney_isometric-miniature-dungeon", "Characters", "Male")

if __name__ == "__main__":
    if not RAW.is_dir():
        print(f"note: {RAW} not present (gitignored, local-only) — generating placeholders for everything")

    tile = from_source(*DUNGEON, "dirt_S.png")
    save(tile, "tile_dirt.png", source_note="real" if tile else "placeholder") if tile \
        else save(make_tile((94, 74, 58), seed=1), "tile_dirt.png", source_note="placeholder")

    tile_alt = from_source(*DUNGEON, "dirtTiles_S.png")
    save(tile_alt, "tile_dirt_alt.png", source_note="real") if tile_alt \
        else save(make_tile((104, 84, 66), seed=2), "tile_dirt_alt.png", source_note="placeholder")

    # No witch costume in the Kenney pack — variant 0 Idle is the closest
    # stand-in until real witch art is sourced.
    witch = from_source(*DUNGEON_CHARS, "Male_0_Idle.png")
    save(witch, "witch.png", source_note="real (Kenney variant-0 stand-in)") if witch \
        else save(make_witch(), "witch.png", source_note="placeholder")

    # Always procedural — see module docstring.
    save(make_pet(), "pet.png", source_note="placeholder (by design)")
