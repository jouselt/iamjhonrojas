// scroll.js — Apple-style scroll-driven animation (vanilla, no libs).
// For each .chapter: as you scroll through its 200vh, the sticky photo scales + drifts
// (parallax) and the floating text fades/translates in and out. The body background
// colour interpolates between chapters (data-bg) so the whole page tone shifts.
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chapters = Array.from(document.querySelectorAll(".chapter"));
  if (!chapters.length) return;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  function hexToRgb(h) {
    const m = h.replace("#", "");
    return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
  }
  function rgbToCss(c) {
    return `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;
  }
  const bgColors = chapters.map((c) => hexToRgb(c.getAttribute("data-bg") || "#0B0B0F"));

  let ticking = false;
  function update() {
    const vh = window.innerHeight;
    let active = 0;
    let activeT = 0;

    chapters.forEach((ch, i) => {
      const rect = ch.getBoundingClientRect();
      // progress 0..1 across the chapter's scrollable height (200vh -> 100vh sticky)
      const total = ch.offsetHeight - vh;
      const p = clamp01((-rect.top) / (total || 1));

      const bg = ch.querySelector(".chapter__bg");
      const model = ch.querySelector(".chapter__model");
      const text = ch.querySelector(".chapter__text-inner");

      if (!reduce && bg) {
        // backdrop drifts slowly AND scales slightly (it's the slow layer)
        const bgTy = lerp(0, vh * 0.08, p);
        const bgScale = lerp(1, 1.08, p);
        bg.style.transform = `translate3d(0, ${bgTy.toFixed(1)}px, 0) scale(${bgScale.toFixed(3)})`;
      }
      if (!reduce && model) {
        // model moves faster but NEVER scales — so Jhon's head can't grow out of frame
        const modelTy = lerp(0, vh * 0.18, p);
        model.style.transform = `translate3d(0, ${modelTy.toFixed(1)}px, 0)`;
      }

      if (text) {
        // text: fade in around p=0.15..0.45, hold, fade out 0.6..0.9
        let op, ty2;
        if (p < 0.15) { op = 0; ty2 = 70; }
        else if (p < 0.45) { const t = (p - 0.15) / 0.30; op = t; ty2 = lerp(70, 0, t); }
        else if (p < 0.62) { op = 1; ty2 = 0; }
        else if (p < 0.9) { const t = (p - 0.62) / 0.28; op = 1 - t; ty2 = lerp(0, -50, t); }
        else { op = 0; ty2 = -50; }
        if (reduce) { op = 1; ty2 = 0; }
        text.style.setProperty("--text-op", op.toFixed(3));
        text.style.setProperty("--text-ty", ty2.toFixed(1) + "px");
      }

      // active chapter = the one whose sticky media is currently pinned (rect.top <= 0 < rect.bottom)
      if (rect.top <= 0 && rect.bottom > vh * 0.5) { active = i; activeT = p; }
    });

    // background colour: interpolate from active chapter toward next as we approach its start
    const next = Math.min(active + 1, bgColors.length - 1);
    const t = clamp01(activeT * 1.2); // shift a bit ahead so tone changes mid-scroll
    const c = [
      lerp(bgColors[active][0], bgColors[next][0], t),
      lerp(bgColors[active][1], bgColors[next][1], t),
      lerp(bgColors[active][2], bgColors[next][2], t),
    ];
    document.body.style.backgroundColor = rgbToCss(c);

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
