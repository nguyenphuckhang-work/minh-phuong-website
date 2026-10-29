// One idea for the whole page: the visitor holds a lamp over a table of printed things.
// Feng shui coins blind-embossed in the board glow where the light falls, every printed
// object (photos, swatches, certificates, logo cards) shows a gloss under the light,
// headings print in plate by plate, photos are screened in as halftone, and the colour
// swatch fan opens as you reach it.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lively = finePointer && !reduceMotion;

  // ---------- the lamp ----------
  // Values go straight onto the few elements that use them: a custom property set on
  // <html> would make the browser restyle the whole page on every mouse move.
  const lamp = document.querySelector(".lamp");
  const signature = document.querySelector(".signature");
  if (lively && lamp) {
    let lx = window.innerWidth / 2;
    let ly = window.innerHeight / 3;
    let queued = false;
    const paint = () => {
      queued = false;
      lamp.style.setProperty("--lx", `${Math.round(lx)}px`);
      lamp.style.setProperty("--ly", `${Math.round(ly)}px`);
      lamp.style.setProperty("--sy", `${-Math.round(window.scrollY)}px`);
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener(
      "pointermove",
      (e) => {
        lx = e.clientX;
        ly = e.clientY;
        queue();
      },
      { passive: true }
    );
    window.addEventListener("scroll", queue, { passive: true });
    paint();
  }

  // gloss on printed objects: each one knows where the light is over it
  if (lively) {
    let target = null;
    let ev = null;
    let queued = false;
    const paint = () => {
      queued = false;
      if (!target || !ev) return;
      const r = target.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width;
      const y = (ev.clientY - r.top) / r.height;
      target.style.setProperty("--px", `${(x * 100).toFixed(1)}%`);
      target.style.setProperty("--py", `${(y * 100).toFixed(1)}%`);
      target.style.setProperty("--tx", (x * 2 - 1).toFixed(3));
      target.style.setProperty("--ty", (y * 2 - 1).toFixed(3));
    };
    document.addEventListener(
      "pointermove",
      (e) => {
        target = e.target.closest?.(".sheen") || null;
        ev = e;
        if (target && !queued) {
          queued = true;
          requestAnimationFrame(paint);
        }
      },
      { passive: true }
    );
  }

  // ---------- headings print in, plate by plate ----------
  // The plates are added only for the moment the heading prints, then removed again,
  // so the finished page carries each heading once.
  const heads = [...document.querySelectorAll(".h2")];
  const printIn = (h) => {
    const text = h.textContent;
    h.classList.add("plates", "is-in");
    h.insertAdjacentHTML(
      "beforeend",
      ["c", "m", "y"].map((p) => `<span class="plates__p plates__${p}" aria-hidden="true">${text}</span>`).join("")
    );
    h.lastElementChild.addEventListener(
      "animationend",
      () => {
        h.querySelectorAll(".plates__p").forEach((el) => el.remove());
        h.classList.remove("is-in");
        h.classList.add("is-printed");
      },
      { once: true }
    );
  };
  heads.forEach((h) => {
    const text = h.textContent;
    h.innerHTML = `<span class="plates__k">${text}</span>`;
    h.classList.add("plates");
  });

  // ---------- photos are screened in as halftone ----------
  const screens = [...document.querySelectorAll(".screen")];
  screens.forEach((el) =>
    el.addEventListener("transitionend", (e) => {
      if (e.propertyName === "--dot") el.classList.add("is-done");
    })
  );

  // ---------- figures count up as they print ----------
  const counters = [...document.querySelectorAll("[data-count]")];
  const fmt = new Intl.NumberFormat(root.lang === "vi" ? "vi-VN" : "en-US");
  const count = (el) => {
    const to = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const step = (now) => {
      const v = Math.min(1, (now - t0) / 1400);
      const e = 1 - Math.pow(1 - v, 3);
      el.textContent = fmt.format(Math.round(to * e)) + suffix;
      if (v < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (reduceMotion) {
    heads.forEach((h) => h.classList.add("is-printed"));
    screens.forEach((el) => el.classList.add("is-in", "is-done"));
  } else {
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          if (el.classList.contains("plates")) printIn(el);
          else el.classList.add("is-in");
          if (el.dataset.count) count(el);
          seen.unobserve(el);
        }),
      { rootMargin: "0px 0px -12% 0px" }
    );
    [...heads, ...screens, ...counters].forEach((el) => seen.observe(el));
  }

  // ---------- scroll-driven pieces: the process line and the swatch fan ----------
  // Each one only listens while it is near the screen.
  const tracked = [];
  const steps = document.querySelector(".steps");
  if (steps) {
    const items = [...steps.querySelectorAll(".step")];
    tracked.push({
      el: steps,
      update: () => {
        const r = steps.getBoundingClientRect();
        const p = (window.innerHeight * 0.75 - r.top) / (r.height * 0.9);
        items.forEach((it, i) => it.classList.toggle("is-reached", p >= i / items.length + 0.02));
      },
    });
  }
  const fan = document.querySelector(".fan");
  if (fan) {
    if (reduceMotion) fan.style.setProperty("--open", 1);
    else
      tracked.push({
        el: fan,
        update: () => {
          const r = fan.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (window.innerHeight * 0.95 - r.top) / (window.innerHeight * 0.55)));
          fan.style.setProperty("--open", p.toFixed(3));
        },
      });
  }

  if (tracked.length) {
    const near = new Set();
    let queued = false;
    const run = () => {
      queued = false;
      near.forEach((t) => t.update());
    };
    const queue = () => {
      if (queued || !near.size) return;
      queued = true;
      requestAnimationFrame(run);
    };
    const watch = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          tracked
            .filter((x) => x.el === en.target)
            .forEach((t) => {
              if (en.isIntersecting) near.add(t);
              else near.delete(t);
              t.update();
            });
        }),
      { rootMargin: "20% 0px" }
    );
    new Set(tracked.map((t) => t.el)).forEach((el) => watch.observe(el));
    window.addEventListener("scroll", queue, { passive: true });
  }

  // ---------- the swatch fan: the ink you point at washes out across the section ----------
  // Two wash layers take turns, so the last colour fades while the new one spreads.
  const blooms = [...document.querySelectorAll(".bloom")];
  if (fan && blooms.length) {
    const section = fan.closest("section");
    let turn = 0;
    let current = "";
    const place = () => {
      const s = section.getBoundingClientRect();
      const f = fan.getBoundingClientRect();
      const x = f.left + f.width / 2 - s.left;
      const y = f.top + f.height * 0.8 - s.top;
      blooms.forEach((b) => {
        b.style.setProperty("--bx", `${x.toFixed(0)}px`);
        b.style.setProperty("--by", `${y.toFixed(0)}px`);
      });
    };
    fan.querySelectorAll(".fan-card").forEach((card) =>
      card.addEventListener("pointerenter", () => {
        const ink = getComputedStyle(card).getPropertyValue("--ink").trim();
        if (ink === current) return;
        current = ink;
        place();
        const prev = blooms[turn];
        turn = (turn + 1) % blooms.length;
        const next = blooms[turn];
        if (prev.classList.contains("is-on")) prev.classList.replace("is-on", "is-off");
        next.style.setProperty("--bloom", ink);
        next.classList.remove("is-on", "is-off");
        void next.getBoundingClientRect();
        next.classList.add("is-on");
      })
    );
    fan.addEventListener("pointerleave", () => {
      current = "";
      blooms.forEach((b) => b.classList.contains("is-on") && b.classList.replace("is-on", "is-off"));
    });
  }

  // ---------- the closing name catches the same light as the coins ----------
  if (lively && signature) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const r = signature.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        signature.style.setProperty("--gx", `${Math.round(e.clientX - r.left)}px`);
        signature.style.setProperty("--gy", `${Math.round(e.clientY - r.top)}px`);
      },
      { passive: true }
    );
  }
})();
