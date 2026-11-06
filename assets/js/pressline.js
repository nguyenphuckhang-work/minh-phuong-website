// Factory section: a sheetfed offset press, drawn as a cutaway, with sheets running through it.
// Each printing unit is laid out as on the press: an inking unit of many rollers fed from the
// ink fountain, a dampening unit with its water pan, the plate cylinder, the rubber blanket
// cylinder, and a double-size impression cylinder that carries the sheet. Between the units,
// triple-size skeleton transfer drums hand the sheet on, so it travels in a wave, over each
// impression cylinder and under each transfer drum. After six colours and the coating unit,
// the delivery chain takes the sheet under the UV lamps to the pile.
//
// Everything is drawn from the side, then extruded back into the page: x and y are the side
// view, z runs across the width of the sheet. The parts that never move are drawn once into
// layers. The machine carries no maker's name.
(() => {
  const stage = document.querySelector(".pressline");
  if (!stage) return;
  const canvas = stage.querySelector("canvas");
  const screen = canvas.getContext("2d");
  let ctx = screen;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = [...document.querySelectorAll(".pl-steps li")];
  const parts = [...document.querySelectorAll(".pl-parts li")].map((li) => li.textContent.trim());
  const replay = document.querySelector(".pl-again");

  const WW = 2040;
  const WH = 726;
  const FLOOR = 652;
  const BASE_Y = 625;
  const WIDTH = 150; // width of the sheet, in z
  const REAR = WIDTH + 14;
  const KX = 0.42;
  const KY = 0.24;
  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  const P = (x, y, z = 0) => [x + z * KX, y - z * KY];
  const px = (x, z) => x + z * KX;
  const py = (y, z) => y - z * KY;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;

  const AXIS_LEN = Math.hypot(KX, KY);
  const NX = KY / AXIS_LEN;
  const NY = KX / AXIS_LEN;

  // ---------- paint ----------
  const GRAPHITE = { hi: "#454e52", lo: "#23292c", top: "#5c666a", side: "#191e20" };
  const SILVER = { hi: "#dfe3e4", lo: "#aeb4b7", top: "#f1f3f3", side: "#767e82" };
  const WOOD = { hi: "#c99f70", lo: "#a67c50", top: "#d8b184", side: "#7c5a38" };

  const INKS = [
    { c: "#00a0e3", label: "1" },
    { c: "#e5007d", label: "2" },
    { c: "#ffe100", label: "3" },
    { c: "#231f20", label: "4" },
    { c: "#d6ac52", label: "5" },
    { c: "#f05a28", label: "6" },
    { c: "#cfe4ea", label: "L" },
  ];
  const COAT = INKS.length - 1;

  // takes "#rrggbb" or the "rgb(r,g,b)" that mix() returns
  const hex = (h) =>
    h[0] === "#" ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.match(/\d+/g).map(Number);
  const mix = (a, b, k) => {
    const x = hex(a);
    const y = hex(b);
    return `rgb(${Math.round(lerp(x[0], y[0], k))},${Math.round(lerp(x[1], y[1], k))},${Math.round(lerp(x[2], y[2], k))})`;
  };

  const vgrad = (y0, y1, a, b) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    return g;
  };

  const poly = (pts, fill, stroke, lw = 1) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  };

  const disc = (x, y, r, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  };

  const ring = (x, y, r, stroke, lw = 1) => {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
  };

  // a solid box: top, right side and front. Returns the front face on screen.
  const block = (x0, x1, y0, y1, z0, z1, c) => {
    poly([P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], c.top, "rgba(0,0,0,.16)", 0.8);
    poly([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)], c.side, "rgba(0,0,0,.2)", 0.8);
    const [ax, ay] = P(x0, y0, z0);
    const w = x1 - x0;
    const h = y1 - y0;
    ctx.fillStyle = vgrad(ay, ay + h, c.hi, c.lo);
    ctx.fillRect(ax, ay, w, h);
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(ax, ay, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.34)";
    ctx.beginPath();
    ctx.moveTo(ax + 0.8, ay + h);
    ctx.lineTo(ax + 0.8, ay + 0.8);
    ctx.lineTo(ax + w, ay + 0.8);
    ctx.stroke();
    return [ax, ay, w, h];
  };

  const rivet = (x, y, r = 2.2) => {
    disc(x + 0.5, y + 0.6, r, "rgba(0,0,0,.35)");
    disc(x, y, r, "#aeb6b8");
    disc(x - 0.6, y - 0.7, r * 0.42, "#f2f4f4");
  };

  const door = (x, y, w, h) => {
    ctx.strokeStyle = "rgba(0,0,0,.36)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  };

  const vents = (x, y, w, n, gap = 6) => {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = "rgba(0,0,0,.5)";
      ctx.fillRect(x, y + i * gap, w, 2.4);
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fillRect(x, y + i * gap + 2.4, w, 0.8);
    }
  };

  const pushButton = (x, y, c, r = 3.6) => {
    disc(x, y, r + 1.4, "#2c3336");
    disc(x, y, r, c);
    disc(x - r * 0.3, y - r * 0.35, r * 0.3, "rgba(255,255,255,.7)");
  };

  const eStop = (x, y, r = 8) => {
    disc(x, y, r + 3, "#f2c230");
    disc(x, y, r, "#b81f24");
    disc(x - r * 0.25, y - r * 0.3, r * 0.36, "#ee6a68");
  };

  // brushed aluminium, with its highlight a third of the way across
  const brushed = (x, y, w, h) => {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#9aa2a6");
    g.addColorStop(0.24, "#f4f6f6");
    g.addColorStop(0.5, "#ccd2d4");
    g.addColorStop(0.82, "#a8afb2");
    g.addColorStop(1, "#7d8589");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,.07)";
    for (let i = 4; i < w; i += 6) ctx.fillRect(x + i, y, 1, h);
    ctx.fillStyle = "rgba(0,0,0,.035)";
    for (let i = 7; i < w; i += 6) ctx.fillRect(x + i, y, 1, h);
  };

  const screenPanel = (x, y, w, h) => {
    ctx.fillStyle = "#1c2225";
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = "#07151a";
    ctx.fillRect(x, y, w, h);
  };

  // ---------- the geometry of the units ----------
  // plate and blanket are single size, the impression cylinder double, the transfer drums triple
  const R_PLATE = 20;
  const R_IMP = 40;
  const R_DRUM = 60;
  const PITCH = 176;
  const I_Y = 512;
  const I_X0 = 440;
  const DRUM_DX = PITCH / 2;
  const DRUM_DY = Math.sqrt((R_IMP + R_DRUM) ** 2 - DRUM_DX ** 2);
  const HAND = Math.atan2(DRUM_DY, DRUM_DX); // angle from an impression cylinder to the next drum

  const UNITS = INKS.map((ink, i) => {
    const ix = I_X0 + i * PITCH;
    const imp = { x: ix, y: I_Y };
    const blanket = { x: ix + Math.cos(240 * DEG) * (R_IMP + R_PLATE), y: I_Y + Math.sin(240 * DEG) * (R_IMP + R_PLATE) };
    const plate = {
      x: blanket.x + Math.cos(300 * DEG) * R_PLATE * 2,
      y: blanket.y + Math.sin(300 * DEG) * R_PLATE * 2,
    };
    return { i, ink, imp, blanket, plate, u0: ix - 78, u1: ix + 82, drum: { x: ix + DRUM_DX, y: I_Y + DRUM_DY } };
  });
  const FEED_DRUM = { x: I_X0 - DRUM_DX, y: I_Y + DRUM_DY };

  // ---------- the path of the sheet ----------
  const pts = [];
  let sNow = 0;
  const add = (x, y, hide = false) => {
    if (pts.length) sNow += Math.hypot(x - pts[pts.length - 1].x, y - pts[pts.length - 1].y);
    pts.push({ x, y, s: sNow, hide });
  };
  const line = (x, y) => {
    const a = pts[pts.length - 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x - a.x, y - a.y) / 6));
    for (let i = 1; i <= n; i++) add(lerp(a.x, x, i / n), lerp(a.y, y, i / n));
  };
  // a part of the sheet that lies on the far side of an impression cylinder is drawn before it,
  // and so is all of the sheet on a transfer drum, which sits below and behind the cylinders
  const arc = (cx, cy, r, a0, a1, kind) => {
    const n = Math.ceil((Math.abs(a1 - a0) * r) / 5);
    for (let i = 1; i <= n; i++) {
      const a = lerp(a0, a1, i / n);
      const hide = kind === "drum" || (kind === "solid" && Math.cos(a) * KX - Math.sin(a) * KY < 0);
      add(cx + Math.cos(a) * r, cy + Math.sin(a) * r, hide);
    }
  };

  // sheets, not a web: each one is shorter than half the impression cylinder, so a clear gap
  // runs between them, and the grippers hold every sheet by its leading edge
  const PILE_X0 = 112;
  const SHEET_L = 90;
  const NIPS = [];
  // where and at what angle the sheet comes onto each drum and impression cylinder
  const FEED_IN = {};
  let S_DELIVERY = 0;
  {
    add(PILE_X0, 452);
    line(270, 452);
    arc(270, 474, 22, -Math.PI / 2, 0);
    line(FEED_DRUM.x - R_DRUM, FEED_DRUM.y);
    Object.assign(FEED_IN, { s: sNow, a: Math.PI });
    arc(FEED_DRUM.x, FEED_DRUM.y, R_DRUM, Math.PI, -HAND, "drum");
    UNITS.forEach((u, i) => {
      const from = Math.PI - HAND;
      const last = i === UNITS.length - 1;
      // over the impression cylinder, where the blanket prints
      u.impIn = { s: sNow, a: from };
      arc(u.imp.x, u.imp.y, R_IMP, from, 240 * DEG, "solid");
      NIPS.push(sNow);
      arc(u.imp.x, u.imp.y, R_IMP, 240 * DEG, last ? 270 * DEG : TAU + HAND, "solid");
      // under the transfer drum to the next unit
      if (!last) {
        u.drumIn = { s: sNow, a: Math.PI + HAND };
        arc(u.drum.x, u.drum.y, R_DRUM, Math.PI + HAND, -HAND, "drum");
      }
    });
    // the delivery chain lifts the sheet past the UV lamps to the pile
    S_DELIVERY = sNow;
    const ux = UNITS[COAT].imp.x;
    const y0 = I_Y - R_IMP;
    line(ux + 70, y0);
    const a = pts[pts.length - 1];
    for (let i = 1; i <= 40; i++) {
      const k = i / 40;
      const m = 1 - k;
      add(
        m * m * m * a.x + 3 * m * m * k * (a.x + 70) + 3 * m * k * k * 1640 + k * k * k * 1712,
        m * m * m * a.y + 3 * m * m * k * a.y + 3 * m * k * k * 380 + k * k * k * 380
      );
    }
    line(1832, 380);
  }
  const PATH_LEN = sNow;
  const xAtS = (s) => {
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].s < s) lo = mid;
      else hi = mid;
    }
    return pts[hi].x;
  };

  // ---------- timeline, in seconds ----------
  const SPEED = 640;
  const SPACING = Math.PI * R_IMP; // one sheet on each half of the double-size impression cylinder
  const SHEET_GAP = SPACING / SPEED;
  const SHEETS = 20;
  const TRAVEL = (PATH_LEN - SHEET_L) / SPEED;
  const FALL = 0.22;
  const T_SHEETS_END = (SHEETS - 1) * SHEET_GAP + TRAVEL + FALL;
  const T_STOP = T_SHEETS_END + 0.1;
  const T_END = T_STOP + 0.7;

  const flowAt = (t) => {
    if (t <= T_STOP) return SPEED * t;
    const dt = Math.min(t - T_STOP, 0.6);
    return SPEED * T_STOP + SPEED * (dt - (dt * dt) / 1.2);
  };

  // each drum and impression cylinder turns so its grippers meet the leading edge of every
  // sheet; blanket and plate turn so their gaps pass the nip between two sheets
  const gripPhase = (inAt, r, dir) => inAt.a + (dir * (SHEET_L - inAt.s)) / r;
  const FEED_PHASE = gripPhase(FEED_IN, R_DRUM, -1);
  UNITS.forEach((u) => {
    u.impPhase = gripPhase(u.impIn, R_IMP, 1);
    if (u.drumIn) u.drumPhase = gripPhase(u.drumIn, R_DRUM, -1);
    u.blanketPhase = Math.PI - 2 * u.impPhase;
    u.platePhase = 420 * DEG - u.blanketPhase;
  });

  // ---------- the job on the sheet, plate by plate ----------
  const TEX_W = 236;
  const TEX_H = 150;
  const textures = [];
  const cells = (fn) => {
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 3; row++) fn(22 + col * 103, 10 + row * 45);
    }
  };
  const CELL_W = 95;
  const CELL_H = 40;
  const barPatch = (g, slot, c) => {
    g.fillStyle = c;
    for (let i = 0; i < 12; i++) if (i % 6 === slot) g.fillRect(3, 4 + i * 12, 8, 10);
  };

  const buildTextures = () => {
    if (textures.length) return;
    const paint = [
      (g) => {
        g.globalCompositeOperation = "multiply";
        g.fillStyle = "#00a0e3";
        cells((x, y) => {
          g.beginPath();
          g.rect(x, y, CELL_W, CELL_H);
          g.arc(x + 22, y + 21, 15, 0, TAU);
          g.fill("evenodd");
        });
        barPatch(g, 0, "#00a0e3");
      },
      (g) => {
        g.globalCompositeOperation = "multiply";
        cells((x, y) => {
          g.fillStyle = "#e5007d";
          g.beginPath();
          g.arc(x + 22, y + 21, 15, 0, TAU);
          g.fill();
          const m = g.createLinearGradient(x + 60, 0, x + CELL_W, 0);
          m.addColorStop(0, "rgba(229,0,125,0)");
          m.addColorStop(1, "rgba(229,0,125,.75)");
          g.fillStyle = m;
          g.fillRect(x + 60, y, CELL_W - 60, CELL_H);
        });
        barPatch(g, 1, "#e5007d");
      },
      (g) => {
        g.globalCompositeOperation = "multiply";
        cells((x, y) => {
          g.fillStyle = "rgba(255,225,0,.62)";
          g.fillRect(x, y, CELL_W, CELL_H);
          g.fillStyle = "#ffe100";
          g.beginPath();
          g.arc(x + 22, y + 21, 15, 0, TAU);
          g.fill();
        });
        barPatch(g, 2, "#ffe100");
      },
      (g) => {
        g.globalCompositeOperation = "source-over";
        g.fillStyle = "#1c1a1b";
        cells((x, y) => {
          g.fillRect(x + 46, y + 11, 44, 3.4);
          g.fillRect(x + 46, y + 19, 32, 2.2);
          g.fillRect(x + 46, y + 25, 38, 2.2);
          g.strokeStyle = "rgba(28,26,27,.65)";
          g.lineWidth = 0.7;
          g.strokeRect(x, y, CELL_W, CELL_H);
        });
        barPatch(g, 3, "#231f20");
      },
      (g) => {
        g.globalCompositeOperation = "source-over";
        g.strokeStyle = "#e0b75a";
        g.fillStyle = "#e0b75a";
        g.lineWidth = 2.2;
        cells((x, y) => {
          g.beginPath();
          g.arc(x + 22, y + 21, 15.6, 0, TAU);
          g.stroke();
          g.fillRect(x + 46, y + 32, 44, 1.6);
        });
        barPatch(g, 4, "#e0b75a");
      },
      (g) => {
        g.globalCompositeOperation = "source-over";
        g.fillStyle = "#f05a28";
        cells((x, y) => g.fillRect(x + CELL_W - 12, y, 12, 9));
        barPatch(g, 5, "#f05a28");
      },
      (g) => {
        g.globalCompositeOperation = "source-over";
        const v = g.createLinearGradient(0, 0, TEX_W, TEX_H);
        v.addColorStop(0, "rgba(255,255,255,.05)");
        v.addColorStop(0.42, "rgba(255,255,255,.08)");
        v.addColorStop(0.5, "rgba(255,255,255,.42)");
        v.addColorStop(0.58, "rgba(255,255,255,.08)");
        v.addColorStop(1, "rgba(255,255,255,.04)");
        g.fillStyle = v;
        g.fillRect(0, 0, TEX_W, TEX_H);
      },
    ];
    const first = document.createElement("canvas");
    first.width = TEX_W;
    first.height = TEX_H;
    const f = first.getContext("2d");
    f.fillStyle = "#f8f7f1";
    f.fillRect(0, 0, TEX_W, TEX_H);
    textures.push(first);
    paint.forEach((plate) => {
      const c = document.createElement("canvas");
      c.width = TEX_W;
      c.height = TEX_H;
      const g = c.getContext("2d");
      g.drawImage(textures[textures.length - 1], 0, 0);
      plate(g);
      textures.push(c);
    });
  };

  // ---------- sheets ----------
  const facing = (ax, ay, bx, by) => {
    const tx = bx - ax;
    const ty = by - ay;
    const l = Math.hypot(tx, ty) || 1;
    let nx = ty / l;
    let ny = -tx / l;
    if (nx * KX - ny * KY < 0) {
      nx = -nx;
      ny = -ny;
    }
    return clamp((nx * 0.34 - ny * 0.94) * 0.5 + 0.5);
  };

  const levelAt = (s) => {
    let n = 0;
    while (n < NIPS.length && s >= NIPS[n]) n++;
    return n;
  };

  // pass "far" draws what lies behind an impression cylinder, pass "near" the rest
  const drawSheet = (head, pass) => {
    const tail = head - SHEET_L;
    const far = pass === "far";
    let first = -1;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (b.s < tail) continue;
      if (a.s > head) break;
      if (first < 0) first = i;
      if (a.hide !== far) continue;
      const s0 = Math.max(a.s, tail);
      const s1 = Math.min(b.s, head);
      const k0 = (s0 - a.s) / (b.s - a.s || 1);
      const k1 = (s1 - a.s) / (b.s - a.s || 1);
      const ax = lerp(a.x, b.x, k0);
      const ay = lerp(a.y, b.y, k0);
      const dx = lerp(a.x, b.x, k1) - ax;
      const dy = lerp(a.y, b.y, k1) - ay;
      const l = Math.hypot(dx, dy);
      if (l < 0.01) continue;
      const u = ((s0 - tail) / SHEET_L) * TEX_W;
      const w = (l / SHEET_L) * TEX_W;
      const tex = textures[levelAt(s0)];
      ctx.save();
      ctx.transform(dx / l, dy / l, KX, -KY, ax, ay);
      ctx.drawImage(tex, u, 0, Math.min(w + 0.6, TEX_W - u), TEX_H, 0, 0, l + 0.8, WIDTH);
      const f = facing(a.x, a.y, b.x, b.y);
      if (f < 0.94) {
        ctx.fillStyle = `rgba(0,15,15,${((0.94 - f) * 0.75).toFixed(3)})`;
        ctx.fillRect(0, 0, l + 0.8, WIDTH);
      }
      if (a.x > 1580 && a.x < 1700) {
        ctx.fillStyle = "rgba(170,110,255,.4)";
        ctx.fillRect(0, 0, l + 0.8, WIDTH);
      }
      ctx.restore();
    }
    if (far || first < 0) return;
    // the near side and the trailing edge, so each sheet reads on its own
    ctx.strokeStyle = "rgba(0,22,24,.5)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    let open = false;
    for (let i = first; i < pts.length && pts[i].s <= head; i++) {
      const p = pts[i];
      if (p.s < tail || p.hide) {
        open = false;
        continue;
      }
      if (open) ctx.lineTo(...P(p.x, p.y, 0));
      else ctx.moveTo(...P(p.x, p.y, 0));
      open = true;
    }
    ctx.stroke();
    const end = pts.find((p) => p.s >= tail);
    if (end && !end.hide) {
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(...P(end.x, end.y, 0));
      ctx.lineTo(...P(end.x, end.y, WIDTH));
      ctx.stroke();
    }
    // the gripper bar that holds the leading edge
    let h = pts.find((p) => p.s >= head) || pts[pts.length - 1];
    ctx.strokeStyle = "#2a3134";
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(...P(h.x, h.y, -4));
    ctx.lineTo(...P(h.x, h.y, WIDTH + 4));
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...P(h.x - 1, h.y - 1.5, -4));
    ctx.lineTo(...P(h.x - 1, h.y - 1.5, WIDTH + 4));
    ctx.stroke();
  };

  const flatSheet = (x0, x1, y, tilt, tex) => {
    ctx.save();
    ctx.transform(1, (-2 * tilt) / (x1 - x0), KX, -KY, x0, y + tilt);
    ctx.drawImage(tex, 0, 0, TEX_W, TEX_H, 0, 0, x1 - x0, WIDTH);
    ctx.restore();
    ctx.strokeStyle = "rgba(0,20,20,.3)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(...P(x0, y + tilt, 0));
    ctx.lineTo(...P(x1, y - tilt, 0));
    ctx.stroke();
  };

  // ---------- cylinders and rollers ----------
  let light = -0.25;

  const bodyPath = (ax, ay, bx, by, r) => {
    ctx.beginPath();
    ctx.moveTo(ax + NX * r, ay + NY * r);
    ctx.lineTo(bx + NX * r, by + NY * r);
    ctx.lineTo(bx - NX * r, by - NY * r);
    ctx.lineTo(ax - NX * r, ay - NY * r);
    ctx.closePath();
  };

  const steelStops = () => [
    [0, "#6a7876"],
    [0.24 + light * 0.1, "#f6f8f8"],
    [0.3 + light * 0.1, "#cfd7d8"],
    [0.46, "#a4afb0"],
    [0.76, "#59666a"],
    [1, "#2a3538"],
  ];

  const tintStops = (c, hi) => [
    [0, mix(c, "#000000", 0.35)],
    [0.26 + light * 0.1, hi],
    [0.4, c],
    [1, mix(c, "#000000", 0.7)],
  ];

  const BLANKET_END = ["#4a5961", "#151c20"];
  const PLATE_END = ["#eef2f3", "#7f8b8f"];

  // a solid cylinder along z; gaps turn with it on the side facing the viewer
  const cylinder = (x, y, r, z0, z1, stops, spin, gaps = 1, endFill) => {
    const ax = px(x, z0);
    const ay = py(y, z0);
    const bx = px(x, z1);
    const by = py(y, z1);
    const g = ctx.createLinearGradient(ax - NX * r, ay - NY * r, ax + NX * r, ay + NY * r);
    stops.forEach(([o, c]) => g.addColorStop(clamp(o), c));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, TAU);
    ctx.fill();
    bodyPath(ax, ay, bx, by, r);
    ctx.fill();
    if (spin !== undefined) {
      for (let k = 0; k < gaps; k++) {
        const a = spin + (k * TAU) / gaps;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        if (ca * KX - sa * KY <= 0) continue;
        ctx.strokeStyle = "rgba(0,0,0,.5)";
        ctx.lineWidth = Math.max(1.4, r * 0.07);
        ctx.beginPath();
        ctx.moveTo(px(x + ca * r, z0), py(y + sa * r, z0));
        ctx.lineTo(px(x + ca * r, z1), py(y + sa * r, z1));
        ctx.stroke();
      }
    }
    endCap(ax, ay, r, spin, endFill);
  };

  // the near end of a cylinder: also drawn again over the inking rollers, which lie behind it
  function endCap(ax, ay, r, spin, endFill) {
    const end = ctx.createLinearGradient(ax - r, ay - r, ax + r, ay + r);
    end.addColorStop(0, endFill ? endFill[0] : "#d0d8da");
    end.addColorStop(1, endFill ? endFill[1] : "#6d7a7e");
    disc(ax, ay, r, end);
    ring(ax, ay, r, "rgba(0,0,0,.32)", 0.8);
    if (r > 16 && spin !== undefined) {
      for (let i = 0; i < 6; i++) {
        const a = spin + (i * TAU) / 6;
        disc(ax + Math.cos(a) * r * 0.66, ay + Math.sin(a) * r * 0.66, Math.max(1.1, r * 0.05), "#4b575b");
      }
    }
    disc(ax, ay, Math.max(2, r * 0.3), "#39454a");
  }

  // a band of a cylinder's surface between two angles, the part that faces the viewer
  const VIEW = Math.atan2(-KY, KX);
  const surface = (x, y, r, a0, a1, z0, z1, fill, stroke) => {
    for (let k = -1; k <= 1; k++) {
      const shift = Math.round((VIEW - (a0 + a1) / 2) / TAU) * TAU + k * TAU;
      const lo = Math.max(a0 + shift, VIEW - Math.PI / 2);
      const hi = Math.min(a1 + shift, VIEW + Math.PI / 2);
      if (hi <= lo) continue;
      const n = Math.max(2, Math.ceil((hi - lo) * 8));
      const out = [];
      for (let i = 0; i <= n; i++) {
        const a = lerp(lo, hi, i / n);
        out.push(P(x + Math.cos(a) * r, y + Math.sin(a) * r, z0));
      }
      for (let i = n; i >= 0; i--) {
        const a = lerp(lo, hi, i / n);
        out.push(P(x + Math.cos(a) * r, y + Math.sin(a) * r, z1));
      }
      poly(out, fill, stroke, 0.8);
    }
  };

  // The plate: a thin aluminium sheet wrapped round the plate cylinder, narrower than the
  // cylinder, its two ends bent into the clamp gap. Its image, laid out like the job on the
  // sheet, carries the unit's ink. The part just behind the gap meets the blanket first.
  const PLATE_Z0 = 10;
  const PLATE_Z1 = WIDTH - 10;
  const PLATE_GAP = 0.17;
  const plateWrap = (u, spin) => {
    const { x, y } = u.plate;
    const r = R_PLATE + 0.5;
    const ax = px(x, 0);
    const ay = py(y, 0);
    const g = ctx.createLinearGradient(ax - NX * r, ay - NY * r, ax + NX * r, ay + NY * r);
    g.addColorStop(0, "#5f7d8a");
    g.addColorStop(clamp(0.24 + light * 0.1), "#eef7fa");
    g.addColorStop(0.36, "#bcd8e3");
    g.addColorStop(0.72, "#82a8b8");
    g.addColorStop(1, "#34505c");
    surface(x, y, r, spin + PLATE_GAP, spin + TAU - PLATE_GAP, PLATE_Z0, PLATE_Z1, g, "rgba(10,30,40,.55)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const ink = mix(u.ink.c, "#ffffff", u.ink.c === "#231f20" ? 0.25 : 0.12);
    for (let col = 0; col < 2; col++) {
      const a1 = spin - 0.36 - col * 2.05;
      for (let row = 0; row < 3; row++) {
        const z0 = PLATE_Z0 + 8 + row * 42;
        surface(x, y, r + 0.2, a1 - 1.8, a1, z0, z0 + 36, ink);
      }
    }
    ctx.restore();
    // the bent ends of the plate, either side of the gap
    ctx.strokeStyle = "rgba(240,248,250,.9)";
    ctx.lineWidth = 1.2;
    [spin + PLATE_GAP, spin - PLATE_GAP].forEach((a) => {
      if (Math.cos(a) * KX - Math.sin(a) * KY <= 0) return;
      ctx.beginPath();
      ctx.moveTo(...P(x + Math.cos(a) * r, y + Math.sin(a) * r, PLATE_Z0));
      ctx.lineTo(...P(x + Math.cos(a) * r, y + Math.sin(a) * r, PLATE_Z1));
      ctx.stroke();
    });
  };

  // a triple-size transfer drum is a skeleton: two end rings, spokes and gripper bars
  const skeletonBack = (x, y, r, spin) => {
    const [bx, by] = P(x, y, WIDTH + 4);
    ring(bx, by, r, "#4b565b", 5);
    for (let k = 0; k < 3; k++) {
      const a = spin + (k * TAU) / 3;
      const gx = x + Math.cos(a) * (r - 3);
      const gy = y + Math.sin(a) * (r - 3);
      cylinder(gx, gy, 3.4, -4, WIDTH + 4, steelStops());
    }
    // the shaft
    cylinder(x, y, 6, -6, WIDTH + 6, steelStops());
  };
  const skeletonFront = (x, y, r, spin) => {
    const [ax, ay] = P(x, y, -6);
    ring(ax, ay, r, "#2b3336", 7);
    ring(ax, ay, r, "#b7c1c4", 2.2);
    ctx.strokeStyle = "#3a4448";
    ctx.lineWidth = 5;
    for (let k = 0; k < 3; k++) {
      const a = spin + (k * TAU) / 3 + Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(a) * r, ay + Math.sin(a) * r);
      ctx.stroke();
    }
    disc(ax, ay, 10, "#59666a");
    disc(ax, ay, 4, "#c9d1d3");
  };

  // ---------- the inking and dampening units: drawn once ----------
  // positions relative to the plate cylinder: [dx, dy, r, kind]. The plate turns clockwise, so
  // after it prints onto the blanket it meets the water on its left, then the three ink form rollers.
  // The ink comes down from the fountain through the ductor, a rider and two distributors to the form rollers.
  const INKING = [
    [-18, -21.4, 8, "form"],
    [0, -28, 8, "form"],
    [18, -21.4, 8, "form"],
    [-14.2, -39, 10, "steel"],
    [14.2, -39, 10, "steel"],
    [0, -50.1, 8, "rubber"],
    [11, -58.7, 6, "ductor"],
    [25.4, -64.5, 9.5, "fountain"],
  ];
  const DAMPENING = [
    [-26.6, 7.1, 7.5, "water-form"],
    [-40, -3, 6.5, "chrome"],
    [-46, 16, 7.5, "chrome"],
  ];

  const roller = (x, y, r, kind, ink) => {
    let stops;
    if (kind === "steel" || kind === "fountain" || kind === "chrome") {
      stops = steelStops();
      if (kind === "steel") stops[2] = [0.3, mix("#cfd7d8", ink, 0.25)];
    } else if (kind === "water-form") {
      stops = tintStops("#2f4a55", "#9fb5bd");
    } else {
      // rubber rollers carry a film of ink
      stops = tintStops(mix(ink, "#2a3134", ink === "#231f20" ? 0.2 : 0.35), mix(ink, "#ffffff", 0.45));
    }
    cylinder(x, y, r, -3, WIDTH + 3, stops, undefined, 0, kind === "steel" || kind === "fountain" || kind === "chrome" ? undefined : [mix(ink, "#ffffff", 0.3), mix(ink, "#1b2224", 0.5)]);
  };

  const drawInking = () => {
    UNITS.forEach((u) => {
      const p = u.plate;
      const ink = u.ink.c;
      if (u.i === COAT) {
        // coating unit: an anilox roller fed from a chamber blade, onto the coating forme
        const b = u.blanket;
        const ax = b.x + Math.cos(300 * DEG) * (R_PLATE + 12);
        const ay = b.y + Math.sin(300 * DEG) * (R_PLATE + 12);
        block(ax + 6, ax + 26, ay - 22, ay + 6, -4, WIDTH + 4, GRAPHITE);
        cylinder(ax, ay, 12, -3, WIDTH + 3, steelStops(), undefined, 0, ["#e8eef0", "#7c888c"]);
        // fine cells on the anilox surface
        const [cx, cy] = P(ax, ay, -3);
        ctx.fillStyle = "rgba(40,60,70,.35)";
        for (let a = 0; a < TAU; a += TAU / 18) ctx.fillRect(cx + Math.cos(a) * 8 - 0.6, cy + Math.sin(a) * 8 - 0.6, 1.2, 1.2);
        return;
      }
      // water pan for the dampening unit
      block(p.x - 58, p.x - 34, p.y + 16, p.y + 30, -3, WIDTH + 3, { hi: "#55636a", lo: "#323c41", top: "#78b8d6", side: "#2a3338" });
      // ink fountain: a trough of ink against the fountain roller
      const fx = p.x + 25.4;
      const fy = p.y - 64.5;
      block(fx + 4, fx + 22, fy - 12, fy + 6, -3, WIDTH + 3, GRAPHITE);
      poly([P(fx + 6, fy - 12, -3), P(fx + 18, fy - 12, -3), P(fx + 18, fy - 12, WIDTH + 3), P(fx + 6, fy - 12, WIDTH + 3)], ink);
      poly([P(fx + 4, fy - 12, -3), P(fx + 16, fy - 12, -3), P(fx + 4, fy - 2, -3)], ink);
      // rollers, far ones first
      const all = [
        ...INKING.map(([dx, dy, r, kind]) => [p.x + dx, p.y + dy, r, kind]),
        ...DAMPENING.map(([dx, dy, r, kind]) => [p.x + dx, p.y + dy, r, kind]),
      ].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      all.forEach(([x, y, r, kind]) => roller(x, y, r, kind, ink));
    });
  };

  // ---------- drawn once, behind the moving parts ----------
  const contactShadow = (x0, x1, z0, z1, a = 0.3) => {
    [14, 8, 3].forEach((grow, i) =>
      poly(
        [P(x0 - grow, FLOOR, z0 - grow), P(x1 + grow, FLOOR, z0 - grow), P(x1 + grow, FLOOR, z1 + grow), P(x0 - grow, FLOOR, z1 + grow)],
        `rgba(0,14,14,${a * (0.3 + i * 0.25)})`
      )
    );
  };

  const drawFloor = () => {
    const top = FLOOR - 150;
    const g = ctx.createLinearGradient(0, top, 0, WH);
    g.addColorStop(0, "rgba(40,110,104,0)");
    g.addColorStop(0.34, "rgba(40,110,104,.55)");
    g.addColorStop(0.7, "rgba(36,100,96,.55)");
    g.addColorStop(1, "rgba(36,100,96,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-20, top, WW + 40, WH - top);
    [220, 720, 1220, 1720].forEach((x) => {
      const y = FLOOR - 40;
      const glow = ctx.createRadialGradient(x, y, 4, x, y, 210);
      glow.addColorStop(0, "rgba(255,255,255,.09)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.28);
      ctx.translate(-x, -y);
      ctx.fillStyle = glow;
      ctx.fillRect(x - 220, y - 220, 440, 440);
      ctx.restore();
    });
    poly([P(-20, FLOOR, -86), P(WW + 20, FLOOR, -86), P(WW + 20, FLOOR, -94), P(-20, FLOOR, -94)], "rgba(236,200,90,.72)");
  };

  const drawPallet = (x0, x1, deckY) => {
    [x0 + 2, (x0 + x1) / 2 - 10, x1 - 22].forEach((x) => block(x, x + 20, deckY + 10, FLOOR, -8, WIDTH + 8, WOOD));
    const deck = block(x0, x1, deckY, deckY + 10, -8, WIDTH + 8, WOOD);
    ctx.strokeStyle = "rgba(70,40,10,.4)";
    ctx.lineWidth = 0.9;
    for (let z = 14; z < WIDTH + 8; z += 22) {
      ctx.beginPath();
      ctx.moveTo(...P(x0, deckY, z));
      ctx.lineTo(...P(x1, deckY, z));
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) ctx.strokeRect(deck[0] + 8 + (i * (x1 - x0 - 16)) / 3, deck[1] + 3.5, 2, 2);
  };

  const DELIVERY = { x0: 1704, x1: 1720 + 230, pile0: 1832 - SHEET_L, pile1: 1832, deck: 598 };
  const UV = { x0: 1580, x1: 1700 };

  const drawBack = () => {
    drawFloor();
    contactShadow(70, 300, -14, WIDTH + 20);
    contactShadow(UNITS[0].u0 - 60, UV.x1, -74, WIDTH + 20);
    contactShadow(DELIVERY.x0, DELIVERY.x1, -14, WIDTH + 20);

    // the long wall behind the units, dark so the cylinders stand out
    const wall = block(UNITS[0].u0 - 70, UV.x0, 228, FLOOR, REAR, REAR + 12, GRAPHITE);
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.fillRect(wall[0], wall[1], wall[2], wall[3]);

    // the far side frame of each unit, with a bearing for every cylinder
    UNITS.forEach((u) => {
      const f = block(u.u0 + 4, u.u1 - 4, 280, BASE_Y, WIDTH + 6, WIDTH + 10, { hi: "#3c4549", lo: "#2a3134", top: "#4b555a", side: "#1d2326" });
      void f;
      [
        [u.imp, R_IMP],
        [u.blanket, R_PLATE],
        [u.plate, R_PLATE],
        ...(u.i < COAT ? [[u.drum, R_DRUM]] : []),
      ].forEach(([c, r]) => {
        const [bx, by] = P(c.x, c.y, WIDTH + 6);
        ring(bx, by, r * 0.38, "rgba(255,255,255,.12)", 2);
      });
    });

    // feeder: far wall, pallet
    const fw = block(64, 266, 300, FLOOR, REAR, REAR + 10, GRAPHITE);
    door(fw[0] + 14, fw[1] + 16, fw[2] - 28, fw[3] - 36);
    drawPallet(PILE_X0 - 12, PILE_X0 + SHEET_L + 12, 598);

    // the frame under the UV lamps
    block(UV.x0, UV.x1, 590, FLOOR, -6, WIDTH + 6, GRAPHITE);

    // delivery: far wall, pallet
    const dw = block(DELIVERY.x0, DELIVERY.x1, 280, FLOOR, REAR, REAR + 10, GRAPHITE);
    door(dw[0] + 14, dw[1] + 16, dw[2] - 28, dw[3] - 36);
    drawPallet(DELIVERY.pile0 - 14, DELIVERY.pile1 + 14, DELIVERY.deck);
  };

  // ---------- drawn once, in front of the moving parts ----------
  const drawUnit = (u) => {
    const { u0, u1, ink } = u;
    const coat = u.i === COAT;

    // lower frame
    const base = block(u0, u1, BASE_Y, FLOOR, -8, WIDTH + 8, GRAPHITE);
    vents(base[0] + 20, base[1] + 8, 50, 2, 5);
    vents(base[0] + 90, base[1] + 8, 50, 2, 5);

    // near side frame: a post at each end, cut away between them to show the unit
    block(u0, u0 + 10, 280, BASE_Y, -8, -2, GRAPHITE);

    // the guard over the inking unit
    const hood = block(u0, u1, 228, 280, -8, WIDTH + 8, SILVER);
    const [ax, ay, w, h] = hood;
    brushed(ax, ay, w, h);
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(ax, ay, w, h);
    ctx.fillStyle = vgrad(ay, ay + h, GRAPHITE.hi, GRAPHITE.lo);
    ctx.fillRect(ax, ay, 46, h);
    ctx.fillStyle = "#f2f3ef";
    ctx.fillRect(ax + 8, ay + 8, 30, 20);
    ctx.fillStyle = "#1e2528";
    ctx.font = "700 13px Archivo, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ink.label, ax + 23, ay + 18.5);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ink.c;
    ctx.fillRect(ax + 8, ay + 31, 30, 5);
    // the small panel on each unit
    ctx.fillStyle = "#eeefe9";
    ctx.fillRect(ax + 56, ay + 10, 44, 32);
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.strokeRect(ax + 56, ay + 10, 44, 32);
    ctx.fillStyle = "#22313a";
    ctx.fillRect(ax + 60, ay + 14, 20, 11);
    [[86, 18], [95, 18], [86, 28], [95, 28]].forEach(([bx, by], n) => pushButton(ax + bx, ay + by, n === 0 ? "#2bbf6f" : "#c9cdc9", 2.4));
    pushButton(ax + 64, ay + 34, "#c9cdc9", 2.4);
    pushButton(ax + 73, ay + 34, "#c9cdc9", 2.4);
    eStop(ax + 124, ay + 26, 7);
    vents(ax + 140, ay + 14, 14, 4, 6);

    // the ink cartridge on top
    const [cx, cy] = P(u.plate.x + 40, 228, WIDTH / 2);
    ctx.fillStyle = "#3a4347";
    ctx.fillRect(cx - 20, cy - 12, 40, 12);
    const tank = ctx.createLinearGradient(cx - 13, 0, cx + 13, 0);
    tank.addColorStop(0, "#39454a");
    tank.addColorStop(0.28, ink.c);
    tank.addColorStop(0.6, ink.c);
    tank.addColorStop(1, "#20292c");
    ctx.fillStyle = tank;
    ctx.fillRect(cx - 13, cy - 50, 26, 40);
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.fillRect(cx - 8, cy - 50, 3, 40);
    ctx.fillStyle = "#2c3336";
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy - 50);
    ctx.lineTo(cx - 12, cy - 66);
    ctx.lineTo(cx + 20, cy - 66);
    ctx.lineTo(cx + 26, cy - 54);
    ctx.lineTo(cx + 18, cy - 50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#59646a";
    ctx.fillRect(cx - 8, cy - 62, 22, 4);
    if (coat) {
      ctx.fillStyle = "rgba(255,255,255,.4)";
      ctx.fillRect(cx - 13, cy - 30, 26, 20);
    }
  };

  const drawFront = () => {
    // feeder: posts and the top beam with its suction head over the pile
    block(64, 78, 340, FLOOR, -8, -2, GRAPHITE);
    block(236, 250, 340, FLOOR, -8, -2, GRAPHITE);
    block(PILE_X0, PILE_X0 + SHEET_L, 404, 430, 10, WIDTH - 10, GRAPHITE);
    [PILE_X0 + 22, PILE_X0 + 68].forEach((x) => {
      ctx.strokeStyle = "#2a3134";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(...P(x, 404, WIDTH / 2));
      ctx.bezierCurveTo(...P(x, 380, WIDTH / 2), ...P(x + 20, 362, WIDTH / 2), ...P(x + 20, 340, WIDTH / 2));
      ctx.stroke();
    });
    const beam = block(64, 250, 296, 340, -8, REAR, SILVER);
    brushed(beam[0], beam[1], beam[2], beam[3]);
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(beam[0], beam[1], beam[2], beam[3]);
    vents(beam[0] + 16, beam[1] + 12, 60, 4);
    pushButton(beam[0] + 140, beam[1] + 16, "#2bbf6f");
    pushButton(beam[0] + 156, beam[1] + 16, "#c9cdc9");
    eStop(beam[0] + 150, beam[1] + 32, 5);
    // feed table, from the pile to the drop onto the feed drum
    poly([P(PILE_X0 + SHEET_L, 455, 0), P(270, 455, 0), P(270, 455, WIDTH), P(PILE_X0 + SHEET_L, 455, WIDTH)], "rgba(150,160,164,.35)", "rgba(0,0,0,.25)", 0.8);

    UNITS.forEach(drawUnit);

    // UV section: a dark hood with its lamp
    const hood = block(UV.x0, UV.x1, 296, 352, -6, WIDTH + 6, GRAPHITE);
    vents(hood[0] + 16, hood[1] + 14, 92, 6);
    block(UV.x0, UV.x0 + 12, 352, 590, -6, -1, GRAPHITE);

    // delivery: portal frame
    block(DELIVERY.x0, DELIVERY.x0 + 16, 312, FLOOR, -10, -2, GRAPHITE);
    block(DELIVERY.x1 - 16, DELIVERY.x1, 312, FLOOR, -10, -2, GRAPHITE);
    const top = block(DELIVERY.x0, DELIVERY.x1, 262, 312, -10, REAR, GRAPHITE);
    ctx.fillStyle = "#f4f4ee";
    ctx.fillRect(top[0] + 26, top[1] + top[3] - 8, 88, 3);
    ctx.fillRect(top[0] + 130, top[1] + top[3] - 8, 88, 3);
    [top[0] + 200, top[0] + 220].forEach((dx) => {
      disc(dx, top[1] + 20, 8.5, "#e9ebe6");
      ring(dx, top[1] + 20, 8.5, "#20282b", 1.4);
      ctx.strokeStyle = "#b81f24";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(dx, top[1] + 20);
      ctx.lineTo(dx + 4, top[1] + 15);
      ctx.stroke();
    });
    disc(top[0] + 24, top[1] + 20, 5, "#19b5b1");
    ctx.fillStyle = "#eef0ec";
    ctx.font = "700 14px Archivo, Arial, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("MINH PHUONG", top[0] + 36, top[1] + 21);
    ctx.textBaseline = "alphabetic";

    // walkway along the units: two steps of checker plate
    const checker = (x0, x1, y, z0, z1) => {
      ctx.fillStyle = "rgba(255,255,255,.2)";
      for (let z = z0 + 3; z < z1; z += 5) {
        for (let x = x0 + 6 + (Math.round(z) % 2 ? 6 : 0); x < x1; x += 12) {
          const [a, b] = P(x, y, z);
          ctx.fillRect(a, b, 3.2, 1.1);
        }
      }
    };
    const walk = { hi: "#3c4549", lo: "#1d2326", top: "#89929a", side: "#14191b" };
    const w0 = UNITS[0].u0 - 40;
    const w1 = UNITS[COAT].u1;
    block(w0, w1, 630, FLOOR, -44, -10, walk);
    checker(w0, w1, 630, -44, -10);
    block(w0, w1, 642, FLOOR, -78, -44, walk);
    checker(w0, w1, 642, -78, -44);

    // the operator's desk by the delivery
    const desk = block(UV.x0 + 30, UV.x0 + 90, 582, FLOOR, -58, -26, GRAPHITE);
    door(desk[0] + 8, desk[1] + 10, desk[2] - 16, desk[3] - 18);
    poly(
      [P(UV.x0 + 20, 568, -64), P(UV.x0 + 100, 568, -64), P(UV.x0 + 100, 582, -22), P(UV.x0 + 20, 582, -22)],
      "#f2f2ec",
      "rgba(0,0,0,.3)",
      0.8
    );
    const [ex, ey] = P(UV.x0 + 30, 578, -52);
    eStop(ex + 2, ey, 3.8);
  };

  // ---------- one frame ----------
  let scale = 1;
  let dpr = 1;
  let camX = 0;
  let camMode = false;
  let viewW = WW;
  let dragged = 0;
  let backLayer = null;
  let inkLayer = null;
  let frontLayer = null;

  const camAt = (t) => {
    const lead = xAtS(Math.min(PATH_LEN, SHEET_L + SPEED * t));
    const k = clamp((t - T_SHEETS_END + 1.4) / 1.4);
    const follow = lead - viewW * 0.6;
    return clamp(lerp(follow, WW, k * k), 0, WW - viewW);
  };

  const labelAt = (i, x, on, color) => {
    const li = steps[i];
    if (!li || camMode) return;
    const y = FLOOR + 52;
    ctx.font = `${on ? 600 : 500} ${13.5 / scale}px Archivo, Arial, sans-serif`;
    const r = 4 / scale;
    disc(x, y - 4.5 / scale, r, color);
    if (color === "#231f20") ring(x, y - 4.5 / scale, r, "rgba(239,236,226,.5)", 0.8);
    ctx.fillStyle = on ? "#f7f5ea" : "rgba(239,236,226,.62)";
    ctx.fillText(li.textContent.trim(), x + 10 / scale, y);
  };

  // letters on the parts of the first unit, and a key above the feeder
  const drawCallouts = () => {
    if (!parts.length) return;
    const u = UNITS[0];
    const p = u.plate;
    const spots = [
      P(p.x, p.y - 50, -3),
      P(p.x - 40, p.y - 3, -3),
      P(p.x + Math.cos(15 * DEG) * R_PLATE, p.y + Math.sin(15 * DEG) * R_PLATE, 36),
      P(u.blanket.x - 4, u.blanket.y + 4, -4),
      P(u.imp.x - 14, u.imp.y + 16, -4),
    ];
    const r = Math.min(8 / scale, 16);
    const badgeFont = `700 ${Math.min(10.5 / scale, 21)}px Archivo, Arial, sans-serif`;
    const labelFont = `500 ${12.5 / scale}px Archivo, Arial, sans-serif`;
    const gap = 25 / scale;
    const top = Math.max(gap * 0.6, 250 - 4.5 * gap);
    const lx = 40;
    const badge = (x, y, ch) => {
      disc(x, y, r + 1.8 / scale, "rgba(4,18,18,.75)");
      disc(x, y, r, "#f7f5ea");
      ctx.font = badgeFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#12302f";
      ctx.fillText(ch, x, y + 0.6 / scale);
    };
    ctx.font = labelFont;
    const widest = Math.max(...parts.slice(0, 5).map((t) => ctx.measureText(t).width));
    ctx.fillStyle = "rgba(9,32,32,.84)";
    ctx.beginPath();
    ctx.roundRect(lx - 8 / scale, top - gap * 0.5, widest + r * 2 + 24 / scale, gap * 5, 6 / scale);
    ctx.fill();
    parts.slice(0, 5).forEach((text, i) => {
      const ch = "ABCDE"[i];
      badge(spots[i][0], spots[i][1], ch);
      const ky = top + i * gap;
      badge(lx + r, ky, ch);
      ctx.font = labelFont;
      ctx.textAlign = "start";
      ctx.fillStyle = "#f2efe4";
      ctx.fillText(text, lx + r * 2 + 8 / scale, ky + 0.6 / scale);
    });
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  };

  const render = (t) => {
    if (!backLayer) return;
    const flow = flowAt(t);
    const S = scale * dpr;
    camX = camMode ? clamp(camAt(t) + dragged, 0, WW - viewW) : 0;
    const shift = Math.round(camX * S);
    const blit = (layer) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(layer, -shift, 0);
      ctx.setTransform(S, 0, 0, S, -shift, 0);
    };

    ctx = screen;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blit(backLayer);

    const running = t > 0 && t < T_STOP + 0.4;

    // ---- feeder pile, going down ----
    const started = clamp(Math.floor(t / SHEET_GAP) + 1, 0, SHEETS);
    const feedTop = 452 + (t > 0 ? started : 0) * 1.6;
    {
      const x0 = PILE_X0;
      const x1 = PILE_X0 + SHEET_L;
      const [ax, ay] = P(x0, feedTop, 0);
      ctx.fillStyle = "#ecebe2";
      ctx.fillRect(ax, ay, x1 - x0, 598 - feedTop);
      poly([P(x1, feedTop, 0), P(x1, feedTop, WIDTH), P(x1, 598, WIDTH), P(x1, 598, 0)], "#c3c6bd");
      ctx.strokeStyle = "rgba(60,70,60,.2)";
      ctx.lineWidth = 0.7;
      for (let y = feedTop + 4; y < 598; y += 4) {
        ctx.beginPath();
        ctx.moveTo(...P(x0, y, 0));
        ctx.lineTo(...P(x1, y, 0));
        ctx.lineTo(...P(x1, y, WIDTH));
        ctx.stroke();
      }
      flatSheet(x0, x1, feedTop, 0, textures[0]);
    }

    // ---- delivery pile, going up ----
    const landedCount = clamp(Math.floor((t - TRAVEL - FALL) / SHEET_GAP) + 1, 0, SHEETS);
    const pileH = 40 + landedCount * 3.4;
    {
      const x0 = DELIVERY.pile0;
      const x1 = DELIVERY.pile1;
      const top = DELIVERY.deck - pileH;
      const [ax, ay] = P(x0, top, 0);
      ctx.fillStyle = "#ecebe2";
      ctx.fillRect(ax, ay, x1 - x0, pileH);
      poly([P(x1, top, 0), P(x1, top, WIDTH), P(x1, DELIVERY.deck, WIDTH), P(x1, DELIVERY.deck, 0)], "#c3c6bd");
      ctx.lineWidth = 0.8;
      for (let y = top + 3.4; y < DELIVERY.deck; y += 3.4) {
        ctx.strokeStyle = "rgba(20,60,70,.35)";
        ctx.beginPath();
        ctx.moveTo(...P(x0, y, 0));
        ctx.lineTo(...P(x1, y, 0));
        ctx.lineTo(...P(x1, y, WIDTH));
        ctx.stroke();
      }
      flatSheet(x0, x1, top, 0, textures[textures.length - 1]);
    }

    // ---- the inside of the skeleton drums, then sheets behind the impression cylinders ----
    const drumSpin = -flow / R_DRUM;
    const impSpin = flow / R_IMP;
    skeletonBack(FEED_DRUM.x, FEED_DRUM.y, R_DRUM, FEED_PHASE + drumSpin);
    UNITS.forEach((u, i) => i < COAT && skeletonBack(u.drum.x, u.drum.y, R_DRUM, u.drumPhase + drumSpin));

    const heads = [];
    for (let i = 0; i < SHEETS; i++) {
      const dt = t - i * SHEET_GAP;
      if (dt >= 0 && dt <= TRAVEL) heads.push(SHEET_L + SPEED * dt);
    }
    heads.forEach((h) => drawSheet(h, "far"));

    // ---- impression cylinders: double size, two gripper gaps ----
    UNITS.forEach((u) => cylinder(u.imp.x, u.imp.y, R_IMP, -4, WIDTH + 4, steelStops(), u.impPhase + impSpin, 2));

    // ---- sheets on top ----
    heads.forEach((h) => drawSheet(h, "near"));

    // the delivery chain, its gripper bars travelling with the sheets
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.lineDashOffset = -flow * 0.5;
    [-3, WIDTH + 3].forEach((z) => {
      ctx.strokeStyle = "#2a3236";
      ctx.beginPath();
      let started2 = false;
      pts.forEach((p) => {
        if (p.s < S_DELIVERY) return;
        if (!started2) {
          ctx.moveTo(...P(p.x, p.y + 3, z));
          started2 = true;
        } else ctx.lineTo(...P(p.x, p.y + 3, z));
      });
      ctx.stroke();
    });
    ctx.setLineDash([]);
    {
      const phase = (SHEET_L + flow) % SPACING;
      for (let s = S_DELIVERY + phase; s < PATH_LEN; s += SPACING) {
        const x = xAtS(s);
        const p = pts.find((q) => q.s >= s);
        ctx.strokeStyle = "#39454a";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(...P(x, p.y + 2, -4));
        ctx.lineTo(...P(x, p.y + 2, WIDTH + 4));
        ctx.stroke();
      }
    }

    // a sheet released over the pile
    for (let i = 0; i < SHEETS; i++) {
      const dt = t - i * SHEET_GAP - TRAVEL;
      if (dt < 0 || dt >= FALL) continue;
      const k = dt / FALL;
      const yy = lerp(380, DELIVERY.deck - pileH - 4, k * k);
      flatSheet(DELIVERY.pile0, DELIVERY.pile1, yy, (1 - k) * 5, textures[textures.length - 1]);
    }

    // ---- skeleton drums, near ends ----
    skeletonFront(FEED_DRUM.x, FEED_DRUM.y, R_DRUM, FEED_PHASE + drumSpin);
    UNITS.forEach((u, i) => i < COAT && skeletonFront(u.drum.x, u.drum.y, R_DRUM, u.drumPhase + drumSpin));

    // ---- blanket and plate cylinders, the plate wrapped round its cylinder ----
    UNITS.forEach((u) => {
      const ink = u.ink.c;
      const coat = u.i === COAT;
      cylinder(u.blanket.x, u.blanket.y, R_PLATE, -4, WIDTH + 4, tintStops(mix("#24323b", ink, coat ? 0.1 : 0.22), "#8d9ba2"), u.blanketPhase - impSpin * 2, 1, BLANKET_END);
      if (!coat) {
        cylinder(u.plate.x, u.plate.y, R_PLATE, -4, WIDTH + 4, steelStops(), u.platePhase + impSpin * 2, 1, PLATE_END);
        plateWrap(u, u.platePhase + impSpin * 2);
      }
    });

    // ---- the inking units, then the near ends of the blanket and plate in front of them ----
    blit(inkLayer);
    UNITS.forEach((u) => {
      endCap(px(u.blanket.x, -4), py(u.blanket.y, -4), R_PLATE, u.blanketPhase - impSpin * 2, BLANKET_END);
      if (u.i !== COAT) endCap(px(u.plate.x, -4), py(u.plate.y, -4), R_PLATE, u.platePhase + impSpin * 2, PLATE_END);
    });

    // ---- everything in front ----
    blit(frontLayer);

    // the UV lamp lights up while the press runs
    if (running) {
      const uv = clamp(t / 1.5);
      const [hx, hy] = P(UV.x0, 352, -6);
      ctx.fillStyle = `rgba(214,180,255,${(0.9 * uv).toFixed(3)})`;
      ctx.fillRect(hx + 4, hy, UV.x1 - UV.x0 - 8, 3);
    }

    // the operator's screen counts the sheets
    const [sx, sy] = P(UV.x0 + 44, 580, -46);
    screenPanel(sx, sy - 18, 42, 18);
    ctx.fillStyle = "#7cf0d6";
    ctx.font = "600 12px Archivo, Arial, sans-serif";
    ctx.fillText(String(landedCount).padStart(4, "0"), sx + 7, sy - 5);

    drawCallouts();

    // ---- what happens where ----
    const lastStart = SHEET_GAP * (SHEETS - 1);
    const passed = (s) => t > 0 && SHEET_L + SPEED * t >= s && SPEED * (t - lastStart) < s;
    labelAt(0, PILE_X0, t > 0 && t < lastStart + 0.1, "#efece2");
    UNITS.forEach((u, i) => labelAt(i + 1, u.u0 + 12, passed(NIPS[i]), u.ink.c));
    labelAt(8, UV.x0 + 6, running && t > NIPS[COAT] / SPEED, "#b67bff");
    labelAt(9, DELIVERY.x0 + 18, t >= TRAVEL, "#efece2");
  };

  // ---------- running it ----------
  let elapsed = 0;
  let last = 0;
  let playing = false;
  let visible = false;
  let finished = false;

  const setSteps = (t) => {
    const lastStart = SHEET_GAP * (SHEETS - 1);
    steps.forEach((li, i) => {
      let on = false;
      if (i === 0) on = t > 0 && t < lastStart + 0.1;
      else if (i <= 7) on = SHEET_L + SPEED * t >= NIPS[i - 1] && SPEED * (t - lastStart) < NIPS[i - 1];
      else if (i === 8) on = t > NIPS[COAT] / SPEED && t < T_STOP;
      else on = t >= TRAVEL && t < T_END;
      li.dataset.state = t >= T_END ? "done" : on ? "on" : "";
    });
  };

  const frame = (now) => {
    if (!playing) return;
    if (visible) {
      elapsed += Math.min(0.05, (now - last) / 1000);
      render(elapsed);
      setSteps(elapsed);
      if (elapsed >= T_END) {
        playing = false;
        finished = true;
        stage.classList.add("is-done");
        return;
      }
    }
    last = now;
    requestAnimationFrame(frame);
  };

  const play = () => {
    stage.classList.remove("is-done");
    finished = false;
    elapsed = 0;
    dragged = 0;
    last = performance.now();
    if (playing) return;
    playing = true;
    requestAnimationFrame(frame);
  };

  const showFinal = () => {
    elapsed = T_END;
    render(T_END);
    setSteps(T_END);
    finished = true;
    stage.classList.add("is-done");
  };

  replay?.addEventListener("click", () => (reduceMotion ? showFinal() : play()));

  // the highlight on the cylinders follows the pointer
  let queued = false;
  const redraw = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render(elapsed);
    });
  };
  stage.addEventListener(
    "pointermove",
    (e) => {
      const r = stage.getBoundingClientRect();
      light = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      if (finished) redraw();
    },
    { passive: true }
  );

  // on a narrow screen the view follows the sheet; afterwards it can be dragged sideways
  let dragFrom = null;
  stage.addEventListener("pointerdown", (e) => {
    if (camMode) dragFrom = { x: e.clientX, d: dragged };
  });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!dragFrom) return;
      dragged = dragFrom.d - (e.clientX - dragFrom.x) / scale;
      if (finished) {
        const base = camAt(elapsed);
        dragged = clamp(dragged, -base, WW - viewW - base);
        redraw();
      }
    },
    { passive: true }
  );
  const endDrag = () => (dragFrom = null);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  const bake = (draw) => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(WW * scale * dpr);
    c.height = Math.ceil(WH * scale * dpr);
    ctx = c.getContext("2d");
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    draw();
    ctx = screen;
    return c;
  };

  const size = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    // wide enough for the whole press, or else the view follows the sheet
    camMode = w < 1100;
    scale = camMode ? h / WH : w / WW;
    viewW = w / scale;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    backLayer = bake(drawBack);
    inkLayer = bake(drawInking);
    frontLayer = bake(drawFront);
    render(elapsed);
  };

  buildTextures();
  new ResizeObserver(size).observe(stage);
  size();
  document.fonts?.ready.then(size);

  if (reduceMotion) {
    showFinal();
    return;
  }

  let started = false;
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !started) {
        started = true;
        play();
      }
      if (visible) last = performance.now();
    },
    { threshold: 0.35 }
  ).observe(stage);
})();
