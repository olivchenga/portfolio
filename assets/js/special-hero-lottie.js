(() => {
  const root = document.querySelector(".case-hero-media__lottie");
  const stage = root?.querySelector(".case-hero-lottie__stage");
  const inner = root?.querySelector(".case-hero-lottie__inner");
  if (!root || !stage || !inner) {
    return;
  }

  const fitStage = () => {
    const { width, height } = stage.getBoundingClientRect();
    const scale = Math.min(width / 750, height / 684);
    inner.style.transform = `scale(${scale})`;
  };
  fitStage();
  if ("ResizeObserver" in window) {
    new ResizeObserver(fitStage).observe(stage);
  }

  const fps = 60;
  const layers = [
    {
      name: "rays",
      p: [{ t: 0, s: [374.5, 353.5] }],
      s: [{ t: 0, s: [100] }],
      o: [{ t: 0, s: [100] }],
      r: [
        { t: 0, s: [0] },
        { t: 1080, s: [360] },
      ],
      a: [387.5, 388.5],
      loopRotate: true,
    },
    {
      name: "ticket3",
      p: [
        { t: 50, s: [444.437, 404.698] },
        { t: 70, s: [474.161, 387.16] },
        { t: 80, s: [460.399, 386.895] },
      ],
      s: [
        { t: 50, s: [40] },
        { t: 80, s: [100] },
      ],
      o: [
        { t: 50, s: [0] },
        { t: 80, s: [100] },
      ],
      r: [
        { t: 50, s: [30] },
        { t: 80, s: [0] },
      ],
      a: [482.399, 262.895],
    },
    {
      name: "ticket2",
      p: [
        { t: 40, s: [415.41, 401.686] },
        { t: 70, s: [420.815, 398.616] },
      ],
      s: [
        { t: 40, s: [40] },
        { t: 70, s: [100] },
      ],
      o: [
        { t: 40, s: [0] },
        { t: 70, s: [100] },
      ],
      r: [
        { t: 40, s: [30] },
        { t: 70, s: [0] },
      ],
      a: [406.815, 274.616],
    },
    {
      name: "ticket1",
      p: [
        { t: 30, s: [383.766, 399.477] },
        { t: 60, s: [355.766, 403.477] },
      ],
      s: [
        { t: 30, s: [40] },
        { t: 60, s: [100] },
      ],
      o: [
        { t: 30, s: [0] },
        { t: 60, s: [100] },
      ],
      r: [
        { t: 30, s: [30] },
        { t: 60, s: [0] },
      ],
      a: [345.766, 279.477],
    },
    {
      name: "coin2",
      p: [
        { t: 20, s: [138.306, 591.815] },
        { t: 50, s: [154.172, 415.948] },
        { t: 200, s: [134.172, 385.948] },
        { t: 320, s: [154.172, 421.948] },
      ],
      s: [
        { t: 20, s: [40] },
        { t: 50, s: [100] },
      ],
      o: [
        { t: 20, s: [0] },
        { t: 50, s: [100] },
      ],
      r: [
        { t: 20, s: [-50] },
        { t: 50, s: [0] },
      ],
      a: [140.172, 291.948],
      floatAfter: 50,
      float: [
        { t: 0, s: [154.172, 415.948] },
        { t: 150, s: [134.172, 385.948] },
        { t: 300, s: [154.172, 415.948] },
      ],
    },
    {
      name: "coin1",
      p: [
        { t: 10, s: [546.361, 577.535] },
        { t: 40, s: [463.854, 392.148] },
        { t: 160, s: [488.122, 372.526] },
        { t: 280, s: [463.854, 392.148] },
      ],
      s: [
        { t: 10, s: [40] },
        { t: 40, s: [100] },
      ],
      o: [
        { t: 10, s: [0] },
        { t: 40, s: [100] },
      ],
      r: [
        { t: 10, s: [30] },
        { t: 40, s: [0] },
      ],
      a: [449.574, 264.974],
      floatAfter: 40,
      float: [
        { t: 0, s: [463.854, 392.148] },
        { t: 120, s: [488.122, 372.526] },
        { t: 240, s: [463.854, 392.148] },
      ],
    },
  ];

  const nodes = layers.map((layer) => {
    const img = root.querySelector(`[data-lottie-layer="${layer.name}"]`);
    return img ? { img, layer } : null;
  }).filter(Boolean);

  if (!nodes.length) {
    return;
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - (1 - t) ** 3;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

  const sample = (keys, frame, ease = easeOut) => {
    if (frame <= keys[0].t) {
      return keys[0].s;
    }
    const last = keys[keys.length - 1];
    if (frame >= last.t) {
      return last.s;
    }
    for (let i = 0; i < keys.length - 1; i += 1) {
      const from = keys[i];
      const to = keys[i + 1];
      if (frame >= from.t && frame <= to.t) {
        const u = ease((frame - from.t) / (to.t - from.t));
        return from.s.map((value, index) => lerp(value, to.s[index], u));
      }
    }
    return last.s;
  };

  const samplePosition = (layer, frame) => {
    if (!layer.float || frame < layer.floatAfter) {
      return sample(layer.p, frame);
    }
    const loopLength = layer.float[layer.float.length - 1].t;
    return sample(layer.float, (frame - layer.floatAfter) % loopLength, easeInOut);
  };

  const apply = (frame, elapsed) => {
    nodes.forEach(({ img, layer }) => {
      const [x, y] = samplePosition(layer, frame);
      const [scale] = sample(layer.s, frame);
      const [opacity] = sample(layer.o, frame);
      const rotate = layer.loopRotate
        ? ((elapsed / 18) * 360) % 360
        : sample(layer.r, frame)[0];
      const [anchorX, anchorY] = layer.a;
      img.style.opacity = String(opacity / 100);
      img.style.transformOrigin = `${anchorX}px ${anchorY}px`;
      img.style.transform = `translate(${x - anchorX}px, ${y - anchorY}px) rotate(${rotate}deg) scale(${scale / 100})`;
    });
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply(320, 0);
    return;
  }

  const started = performance.now();
  const tick = (now) => {
    const elapsed = (now - started) / 1000;
    apply(elapsed * fps, elapsed);
    window.requestAnimationFrame(tick);
  };

  apply(0, 0);
  window.requestAnimationFrame(tick);
})();
