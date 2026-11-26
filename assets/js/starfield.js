(() => {
  const canvas = document.getElementById("site-starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const turn = Math.PI * 2;
  let width, height, ratio, stars;
  let rotation = 0;
  let elapsed = 0;
  let nextMeteor = 1.2;
  let meteors = [];
  let frame;
  let lastTime;

  function drawMeteor(meteor) {
    if (reducedMotion.matches) return;

    const age = elapsed - meteor.start;
    if (age < 0 || age >= meteor.life) return;

    const x = meteor.x + meteor.vx * age;
    const y = meteor.y + meteor.vy * age;
    const tailX = x - (meteor.vx / meteor.speed) * meteor.length;
    const tailY = y - (meteor.vy / meteor.speed) * meteor.length;
    const fade = Math.sin(Math.PI * (age / meteor.life)) * 0.85;

    const trail = ctx.createLinearGradient(tailX, tailY, x, y);
    trail.addColorStop(0, "rgba(231, 241, 255, 0)");
    trail.addColorStop(0.6, "rgba(231, 241, 255, 0.22)");
    trail.addColorStop(1, "rgba(255, 255, 255, 0.95)");

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = trail;
    ctx.lineWidth = 1.15;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.arc(x, y, 0.85, 0, turn);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const cx = width / 2;
    const cy = height / 2;
    for (const star of stars) {
      const angle = star.angle + rotation;
      const x = cx + Math.cos(angle) * star.radius;
      const y = cy + Math.sin(angle) * star.radius;
      ctx.fillStyle = star.color;
      ctx.fillRect(x, y, star.size, star.size);
    }
    for (const meteor of meteors) drawMeteor(meteor);
  }

  function spawnMeteor(delay = 0) {
    if (meteors.length >= 6) return;

    const speed = 280 + Math.random() * 420;
    const angle = Math.PI * (0.12 + Math.random() * 0.1);
    meteors.push({
      start: elapsed + delay,
      x: width * (0.08 + Math.random() * 0.5),
      y: height * (0.05 + Math.random() * 0.35),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      length: 90 + Math.random() * 45,
      life: 0.9,
    });
  }

  function resize() {
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    const nextRatio = Math.min(devicePixelRatio, 1.5);
    if (width === nextWidth && height === nextHeight && ratio === nextRatio) return;

    width = nextWidth;
    height = nextHeight;
    ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    const radius = Math.hypot(width, height) / 2;
    const density = width < 761 ? 0.00019 : 0.00029;
    const count = Math.max(75, Math.min(1000, Math.round(Math.PI * radius ** 2 * density)));
    stars = Array.from({ length: count }, () => {
      const tone = Math.random();
      const rgb = tone < 0.15 ? "175, 205, 242" : tone > 0.91 ? "246, 208, 163" : "225, 233, 242";
      return {
        angle: Math.random() * turn,
        radius: Math.sqrt(Math.random()) * radius,
        size: 0.55 + Math.random() ** 2 * 1.15,
        color: `rgba(${rgb}, ${0.2 + Math.random() ** 2 * 0.64})`,
      };
    });
    draw();
  }

  function animate(now) {
    const dt = lastTime === undefined ? 0 : Math.min((now - lastTime) / 1000, 0.075);
    lastTime = now;
    elapsed += dt;
    rotation = (rotation + dt * 0.012) % turn;
    meteors = meteors.filter((meteor) => elapsed - meteor.start < meteor.life);
    if (elapsed >= nextMeteor) {
      spawnMeteor();
      if (Math.random() < 0.5) spawnMeteor(0.35 + Math.random() * 1.3);
      nextMeteor = elapsed + 2.8 + Math.random() * 3.4;
    }
    draw();
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    lastTime = undefined;
    draw();
    if (!reducedMotion.matches && !document.hidden) {
      frame = requestAnimationFrame(animate);
    }
  }

  resize();
  updateMotion();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", updateMotion);
  reducedMotion.addEventListener("change", updateMotion);
})();
