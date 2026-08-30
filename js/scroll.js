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

  // paint each chapter with its own wall tone up front (animated light gradient sits on top via CSS)
  chapters.forEach((ch, i) => {
    ch.style.setProperty("--wall", rgbToCss(bgColors[i]));
  });

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
        // arch backdrop drifts from TOP (not sides) — consistent parallax for 08/09 too.
        // 08/09 get a faster, more pronounced vertical drift per Jhon's request.
        const fast = (ch.getAttribute("data-enter") === "left" || ch.getAttribute("data-enter") === "right");
        const bgTy = lerp(0, vh * (fast ? 0.22 : 0.08), p);
        const bgScale = lerp(fast ? 1.06 : 1.02, fast ? 1.30 : 1.12, p);
        bg.style.transform = `translate3d(0, ${(-bgTy).toFixed(1)}px, 0) scale(${bgScale.toFixed(3)})`;
        bg.style.transformOrigin = "center center";
      }
      if (!reduce && model) {
        // Model: enters from the TOP (translateY -25vh -> 0) in the first 40% of the
        // chapter for ALL chapters (consistency — no more side slides), then grows
        // (scale 1 -> 1.15) as you scroll down, before the next chapter arrives.
        const enterT = clamp01(p / 0.40);
        const ty = lerp(-window.innerHeight * 0.25, 0, enterT);
        const scale = lerp(1.0, 1.15, p);
        model.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        // Dynamic drop-shadow grows with scroll progress -> sense of descending / depth.
        const drop = (p * 26).toFixed(1);
        model.style.setProperty("--model-drop", drop + "px");
      }

      if (text) {
        // text: quick fade-in at the very start, then STAYS visible to the end
        // (per request: readable from beginning to end of the chapter, no fade-out).
        let op, ty2;
        if (p < 0.06) { const t = p / 0.06; op = t; ty2 = lerp(40, 0, t); }
        else { op = 1; ty2 = 0; }
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
