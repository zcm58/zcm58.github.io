(function () {
  'use strict';

  const root = document.querySelector('#zm-constellation');
  if (!root) return;
  const canvas = root.querySelector('.zm-brain');
  const motionControl = root.querySelector('[data-brain-motion]');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // A decorative lateral brain, built from cubic contours rather than an image.
  // Keep the seeded particles aligned with the approved neural-constellation art.
  const contours = [
    [82, 196, 67, 180, 78, 159, 94, 152, 91, 133, 110, 114, 129, 115, 133, 96, 154, 86, 175, 95, 189, 78, 214, 76, 230, 88, 249, 74, 275, 85, 284, 99, 305, 91, 328, 103, 337, 122, 359, 122, 375, 140, 373, 159, 391, 172, 390, 197, 377, 211, 381, 229, 365, 241, 349, 241, 336, 253, 314, 249, 301, 240, 285, 247, 274, 245, 261, 238, 250, 259, 224, 264, 207, 252, 184, 259, 162, 247, 159, 231, 141, 238, 118, 231, 111, 218, 94, 221, 81, 211, 82, 196],
    [99, 155, 118, 155, 120, 169, 111, 181, 96, 182, 96, 198, 112, 204, 125, 212, 139, 206, 143, 194],
    [108, 144, 123, 133, 139, 138, 139, 154, 136, 164, 147, 173, 157, 165, 170, 151, 164, 136, 151, 130],
    [131, 117, 149, 108, 168, 116, 171, 131, 169, 147, 182, 153, 193, 146],
    [167, 98, 184, 102, 183, 116, 195, 120, 206, 124, 215, 112, 211, 102],
    [223, 92, 234, 108, 224, 119, 212, 130, 197, 140, 197, 156, 207, 169],
    [249, 92, 233, 113, 249, 125, 246, 143, 243, 163, 226, 168, 226, 185, 228, 195, 242, 198, 250, 187],
    [275, 103, 260, 112, 268, 128, 280, 130, 293, 132, 294, 118, 286, 115],
    [307, 112, 301, 132, 314, 142, 327, 139, 344, 134, 354, 147, 347, 157],
    [268, 146, 283, 138, 298, 147, 295, 160, 292, 173, 307, 180, 319, 169],
    [317, 151, 322, 160, 334, 163, 341, 155],
    [362, 164, 347, 167, 348, 185, 361, 187, 374, 189, 374, 202, 364, 210],
    [338, 183, 328, 175, 317, 185, 322, 197, 329, 212, 344, 202, 350, 214],
    [106, 191, 124, 183, 134, 175, 153, 185, 165, 196, 170, 208, 188, 207, 207, 207, 212, 196, 223, 199, 241, 206, 254, 201, 264, 189, 274, 178, 284, 181, 293, 187],
    [137, 217, 153, 210, 168, 219, 171, 232, 175, 245, 193, 247, 199, 233],
    [183, 221, 191, 212, 208, 217, 208, 230, 207, 244, 224, 250, 237, 241],
    [223, 218, 237, 210, 252, 214, 251, 227, 249, 238, 266, 242, 274, 229],
    [264, 209, 278, 197, 297, 203, 299, 216, 300, 229, 316, 235, 327, 227],
    [172, 175, 187, 169, 192, 182, 187, 193],
    [298, 232, 310, 218, 334, 217, 348, 231, 363, 249, 350, 273, 329, 277, 306, 281, 289, 263, 289, 246, 291, 239, 294, 235, 298, 232],
    [301, 236, 314, 228, 334, 230, 343, 240],
    [297, 246, 312, 237, 337, 242, 345, 249],
    [298, 257, 315, 247, 332, 252, 340, 258],
    [306, 267, 316, 260, 327, 261, 331, 268],
    [275, 242, 270, 258, 279, 280, 296, 287, 302, 289, 306, 284, 301, 279, 290, 270, 287, 261, 289, 250]
  ];

  function cubic(a, b, c, d, t) {
    const s = 1 - t;
    return s * s * s * a + 3 * s * s * t * b + 3 * s * t * t * c + t * t * t * d;
  }

  function makePath(data) {
    const path = new Path2D();
    path.moveTo(data[0], data[1]);
    for (let i = 2; i < data.length; i += 6) path.bezierCurveTo(...data.slice(i, i + 6));
    return path;
  }

  const paths = contours.map(makePath);
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loopDuration = 20000;
  const frameInterval = 1000 / 30;
  let reduced = media.matches;
  let paused = false;
  let frame = 0;
  let elapsed = 0;
  let lastTime = null;
  let lastDraw = null;
  let width = 450;
  let height = 400;
  let dpr = 1;
  let inView = false;
  let seed = 19870321;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const points = [];
  const stars = [];

  function point(x, y, edge, group, relief = 0.5, ridge = 0) {
    const r = 17 + Math.pow(random(), 0.63) * 161;
    const arm = Math.floor(random() * 3);
    const angle = arm * Math.PI * 2 / 3 + r * 0.028 + (random() - 0.5) * 0.58;
    const bright = random() > (edge ? 0.989 : 0.994);
    points.push({ x, y, edge, group, radius: edge ? 0.4 + random() * 0.37 :
        0.4 + random() * (0.5 + relief * 0.3),
      alpha: edge ? 0.32 + random() * 0.3 :
        (0.23 + relief * 0.59 + ridge * 0.12) * (0.74 + random() * 0.26),
      tint: edge ? '#88b9da' : relief > 0.68 ? '#c1e5fa' : relief > 0.45 ? '#8db8d4' : '#557d9d',
      gold: random() > 0.995, bright,
      r, angle, phase: random() * Math.PI * 2 });
  }

  // Sample the linework at an even distance so it reads as drawn structure.
  contours.forEach((data, group) => {
    let ax = data[0];
    let ay = data[1];
    let lastX = ax;
    let lastY = ay;
    point(ax, ay, true, group);
    for (let i = 2; i < data.length; i += 6) {
      const [bx, by, cx, cy, dx, dy] = data.slice(i, i + 6);
      for (let step = 1; step <= 32; step++) {
        const t = step / 32;
        const x = cubic(ax, bx, cx, dx, t);
        const y = cubic(ay, by, cy, dy, t);
        if (Math.hypot(x - lastX, y - lastY) >= (group === 0 ? 3.5 : 4.4)) {
          point(x, y, true, group);
          lastX = x;
          lastY = y;
        }
      }
      ax = dx;
      ay = dy;
    }
  });

  // Dark grooves separate luminous cortical ridges. Light falls across the
  // particle surface from the upper left, giving the dust a sculpted volume.
  const groovePoints = points.filter(p => p.group > 0 && p.group < 19);
  let filled = 0;
  for (let i = 0; i < 18000 && filled < 2500; i++) {
    const x = 80 + random() * 306;
    const y = 80 + random() * 208;
    const inCortex = ctx.isPointInPath(paths[0], x, y);
    const inCerebellum = ctx.isPointInPath(paths[19], x, y);
    const inStem = ctx.isPointInPath(paths[24], x, y);
    if (!inCortex && !inCerebellum && !inStem) continue;
    let distance = 10000;
    if (inCortex) {
      for (const p of groovePoints) {
        const dx = x - p.x;
        const dy = y - p.y;
        distance = Math.min(distance, dx * dx + dy * dy);
      }
      distance = Math.sqrt(distance);
      if (distance < 2.45) continue;
    } else if (inCerebellum) {
      // The cerebellum has finer horizontal folds than the cortex.
      distance = 2 + (Math.sin(y * 0.7 + x * 0.04) + 1) * 3.5;
      if (distance < 2.6) continue;
    }
    const nx = (x - 226) / 158;
    const ny = (y - 179) / 102;
    const volume = Math.sqrt(Math.max(0, 1 - nx * nx * 0.84 - ny * ny * 0.8));
    const ridge = Math.exp(-Math.pow((distance - 6.5) / 4.1, 2));
    const relief = Math.max(0.1, Math.min(1,
      0.26 + volume * 0.52 - nx * 0.16 - ny * 0.2 + ridge * 0.16));
    if (random() > 0.45 + volume * 0.4 + ridge * 0.15) continue;
    point(x, y, false, -1, relief, ridge);
    filled++;
  }
  for (let i = 0; i < 34; i++) {
    stars.push({ x: 24 + random() * 402, y: 43 + random() * 303,
      r: 0.35 + random() * 0.6, alpha: 0.15 + random() * 0.36,
      cross: i === 3 || i === 18 || i === 26, gold: i === 18 });
  }

  function strokeOrbit(cx, cy, rx, ry, angle, color, start = 0, end = Math.PI * 2) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, angle, start, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  function draw() {
    const phase = (reduced ? 0 : elapsed) / loopDuration * Math.PI * 2;
    // Cosine brings both shape and velocity back to their start at the seam.
    const spreading = (1 - Math.cos(phase)) / 2;
    const theta = -0.26 + Math.sin(phase) * 0.25;
    const scale = Math.min(width / 450, height / 400);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-225, -200);

    for (const star of stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.gold ? '#d4b994' : '#a7c4e3';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
      if (star.cross) {
        ctx.strokeStyle = star.gold ? '#d4b994' : '#bdd7ed';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(star.x - 3, star.y);
        ctx.lineTo(star.x + 3, star.y);
        ctx.moveTo(star.x, star.y - 3);
        ctx.lineTo(star.x, star.y + 3);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    strokeOrbit(231, 196, 192, 91, -0.32, '#82afcf35', 0.15, Math.PI * 1.27);
    strokeOrbit(231, 196, 186, 113, 0.43, '#82afcf20', 2.6, 6.4);
    ctx.save();

    // The outline only hints at the silhouette; particles carry the surface.
    ctx.globalAlpha = (1 - spreading) * (1 - spreading);
    paths.forEach((path, i) => {
      ctx.strokeStyle = i === 0 ? '#91c5eb85' : '#98c6e54b';
      ctx.lineWidth = i === 0 ? 0.64 : 0.48;
      ctx.stroke(path);
    });
    ctx.globalAlpha = 1;

    if (spreading > 0) {
      ctx.save();
      ctx.translate(231, 190);
      ctx.rotate(theta);
      ctx.scale(1, 0.45);
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        for (let r = 23; r <= 177; r += 2) {
          const angle = arm * Math.PI * 2 / 3 + r * 0.028;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (r === 23) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(143, 190, 223, ${0.12 * spreading})`;
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
      ctx.restore();
    }

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    for (const p of points) {
      const gx = Math.cos(p.angle) * p.r;
      const gy = Math.sin(p.angle) * p.r * 0.45;
      const targetX = 231 + gx * cos - gy * sin;
      const targetY = 190 + gx * sin + gy * cos;
      const arc = Math.sin(spreading * Math.PI) * 21;
      const x = p.x + (targetX - p.x) * spreading + Math.cos(p.phase + phase) * arc;
      const y = p.y + (targetY - p.y) * spreading + Math.sin(p.phase + phase) * arc * 0.6;
      const alpha = p.bright ? 0.98 : p.alpha + (0.66 - p.alpha) * spreading * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.gold ? '#dec49c' : p.bright ? '#f0f8ff' : p.tint;
      ctx.beginPath();
      ctx.arc(x, y, p.radius + (p.bright ? 0.44 : 0), 0, Math.PI * 2);
      ctx.fill();
      if (p.bright) {
        ctx.globalAlpha = alpha * 0.1;
        ctx.beginPath();
        ctx.arc(x, y, p.radius * 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.035;
        ctx.beginPath();
        ctx.arc(x, y, p.radius * 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width || 450;
    height = bounds.height || 400;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    draw();
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
    lastDraw = null;
    canvas.dataset.animating = 'false';
  }

  function tick(time) {
    if (lastTime !== null) elapsed = (elapsed + time - lastTime) % loopDuration;
    lastTime = time;
    if (lastDraw === null || time - lastDraw >= frameInterval - 0.5) {
      draw();
      lastDraw = time;
    }
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    canvas.dataset.reducedMotion = String(reduced);
    motionControl.disabled = reduced;
    motionControl.textContent = reduced ? 'Motion reduced' : paused ? 'Resume animation' : 'Pause animation';
    if (reduced || paused || !inView || document.hidden) {
      stop();
    } else if (!frame) {
      canvas.dataset.animating = 'true';
      frame = requestAnimationFrame(tick);
    }
  }

  motionControl.addEventListener('click', () => {
    paused = !paused;
    syncPlayback();
  });
  media.addEventListener('change', event => {
    reduced = event.matches;
    // Enter and leave the motion preference on the same static brain frame.
    elapsed = 0;
    stop();
    draw();
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);

  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncPlayback();
  });
  resizeObserver.observe(canvas);
  visibilityObserver.observe(canvas);
  resize();
  root.classList.add('has-brain-canvas');
  motionControl.hidden = false;
  syncPlayback();
})();
