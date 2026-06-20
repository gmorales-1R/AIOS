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
