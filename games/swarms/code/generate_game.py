"""Generates game.html in games/swarms/files/."""

from pathlib import Path

OUTPUT = Path(__file__).parent.parent / "files" / "game.html"

html = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Swarms</title>
  <style>
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0a0a0f;
      font-family: monospace;
      color: #7fff7f;
    }
    h1 { font-size: 3rem; letter-spacing: 0.1em; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>
"""

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(html)
print(f"Written: {OUTPUT}")
