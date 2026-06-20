"""Generates game.html and game.js in games/swarms/files/."""

from pathlib import Path

FILES = Path(__file__).parent.parent / "files"

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
  <h1 id="title">Hello, World!</h1>
  <script src="game.js"></script>
</body>
</html>
"""

js = """\
(function () {
  const el = document.getElementById("title");
  let angle = 0;

  function tick() {
    angle = (angle + 1) % 360;
    el.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
"""

FILES.mkdir(parents=True, exist_ok=True)
(FILES / "game.html").write_text(html)
(FILES / "game.js").write_text(js)
print(f"Written: {FILES / 'game.html'}")
print(f"Written: {FILES / 'game.js'}")
