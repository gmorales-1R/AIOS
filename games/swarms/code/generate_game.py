"""Assembles the Swarms hex-game into games/swarms/files/.

Reads source files from games/swarms/code/src/ and writes them to
games/swarms/files/ (same output paths as before).

  files/game.html
  files/css/style.css
  files/js/{config,hex,camera,pathfind,inventory,creatures,world,
             character,save,ui,input,render,game}.js

Run from anywhere:  python games/swarms/code/generate_game.py
"""

import subprocess
from pathlib import Path
from datetime import datetime
try:
    from zoneinfo import ZoneInfo
    _tz = ZoneInfo("America/Santiago")
except ImportError:
    from datetime import timezone as _timezone
    _tz = _timezone.utc

HERE  = Path(__file__).parent
SRC   = HERE / "src"
FILES = HERE.parent / "files"

try:
    _commits = subprocess.check_output(
        ["git", "rev-list", "--count", "HEAD"],
        cwd=HERE, stderr=subprocess.DEVNULL
    ).decode().strip()
    _version = f"v{_commits}"
except Exception:
    _version = "v?"

BUILD_TIME = f"{_version} {datetime.now(_tz).strftime('%d/%m/%Y %H:%M')}"

COPIES = [
    (SRC / "game.html",          FILES / "game.html"),
    (SRC / "css" / "style.css",  FILES / "css" / "style.css"),
    (SRC / "js" / "config.js",   FILES / "js" / "config.js"),
    (SRC / "js" / "hex.js",      FILES / "js" / "hex.js"),
    (SRC / "js" / "camera.js",   FILES / "js" / "camera.js"),
    (SRC / "js" / "pathfind.js", FILES / "js" / "pathfind.js"),
    (SRC / "js" / "inventory.js",FILES / "js" / "inventory.js"),
    (SRC / "js" / "creatures.js",FILES / "js" / "creatures.js"),
    (SRC / "js" / "world.js",    FILES / "js" / "world.js"),
    (SRC / "js" / "character.js",FILES / "js" / "character.js"),
    (SRC / "js" / "save.js",     FILES / "js" / "save.js"),
    (SRC / "js" / "ui.js",       FILES / "js" / "ui.js"),
    (SRC / "js" / "input.js",    FILES / "js" / "input.js"),
    (SRC / "js" / "render.js",   FILES / "js" / "render.js"),
    (SRC / "js" / "game.js",     FILES / "js" / "game.js"),
]


def main():
    (FILES / "js").mkdir(parents=True, exist_ok=True)
    (FILES / "css").mkdir(parents=True, exist_ok=True)

    for src, dst in COPIES:
        text = src.read_text(encoding="utf-8")
        if dst.name == "config.js":
            text = text.replace("__BUILD_TIME__", BUILD_TIME)
        dst.write_text(text, encoding="utf-8")
        print(f"Written: {dst}")


if __name__ == "__main__":
    main()
