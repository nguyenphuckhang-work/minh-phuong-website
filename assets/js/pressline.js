// Factory section: a press sheet runs through a six-colour UV press on screen.
// Sheets leave the feeder pile and pick up one colour at each unit, then the coating
// unit, pass under the UV lamps, and drop on the delivery pile.
//
// Everything is drawn from the side, then extruded back into the page: x and y are the
// side view, z runs across the width of the sheet. The parts that never change are drawn
// once into two layers, one behind the moving parts and one in front. The machine has no
// maker's name on it.
(() => {
  const stage = document.querySelector(".pressline");
  if (!stage) return;
  const canvas = stage.querySelector("canvas");
  const screen = canvas.getContext("2d");
  let ctx = screen;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = [...document.querySelectorAll(".pl-steps li")];
  const replay = document.querySelector(".pl-again");

  const WW = 1930;
  const WH = 722;
  const FLOOR = 652;
  const WIDTH = 150; // width of the sheet, in z
  const REAR = WIDTH + 14;
  const KX = 0.62;
  const KY = 0.36;
  const TAU = Math.PI * 2;
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
  const CARD = { hi: "#f5f4ec", lo: "#d0cfc4", top: "#fbfaf4", side: "#a4a499" };
  const WOOD = { hi: "#c99f70", lo: "#a67c50", top: "#d8b184", side: "#7c5a38" };

  const INKS = [
    { c: "#00a0e3", blanket: "#1c4f66", name: "C" },
    { c: "#e5007d", blanket: "#5f1c45", name: "M" },
    { c: "#ffe100", blanket: "#6a6420", name: "Y" },
    { c: "#231f20", blanket: "#25282a", name: "K" },
    { c: "#d6ac52", blanket: "#5e4f2b", name: "5" },
    { c: "#f05a28", blanket: "#64321f", name: "6" },
    { c: "#d9e6ea", blanket: "#59666b", name: "UV" },
  ];

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

  // ---------- the path of the sheet ----------
  const UNIT_W = 150;
  const PITCH = 158;
  const X0 = 330;
  const unitX = (i) => X0 + i * PITCH;
  const nipX = (i) => unitX(i) + 78;
  const NIP_Y = 505;
  const waveY = (x) => NIP_Y + 6 - 6 * Math.cos((TAU * (x - nipX(0))) / PITCH);

  const pts = [];
  {
    let s = 0;
    const add = (x, y) => {
      if (pts.length) s += Math.hypot(x - pts[pts.length - 1].x, y - pts[pts.length - 1].y);
      pts.push({ x, y, s });
    };
    for (let x = 120; x < 300; x += 12) add(x, lerp(507, waveY(300), clamp((x - 120) / 180)));
    const endWave = nipX(6) + 54;
    for (let x = 300; x <= endWave; x += 6) add(x, waveY(x));
    // up under the UV lamps to the delivery
    const x0 = pts[pts.length - 1].x;
    const y0 = pts[pts.length - 1].y;
    for (let i = 1; i <= 40; i++) {
      const k = i / 40;
      const m = 1 - k;
      add(
        m * m * m * x0 + 3 * m * m * k * (x0 + 60) + 3 * m * k * k * 1500 + k * k * k * 1590,
        m * m * m * y0 + 3 * m * m * k * y0 + 3 * m * k * k * 396 + k * k * k * 396
      );
    }
    for (let x = 1596; x <= 1696; x += 6) add(x, 396);
  }
  const PATH_LEN = pts[pts.length - 1].s;
  const sAtX = (x) => pts.find((p) => p.x >= x).s;
  const NIPS = INKS.map((_, i) => sAtX(nipX(i)));

  // ---------- timeline, in seconds ----------
  const SPEED = 520;
  const SHEET_L = 118;
  const SHEET_GAP = PITCH / SPEED;
  const SHEETS = 14;
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

  // ---------- the job on the sheet, plate by plate ----------
  // Each level is the sheet after one more unit: paper, then C, M, Y, K, two spots, coating.
  const TEX_W = 236;
  const TEX_H = 150;
  const textures = [];
  const cells = (fn) => {
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 3; row++) fn(16 + col * 110, 6 + row * 47.5);
    }
  };
  const CELL_W = 102;
  const CELL_H = 42;
  const barPatch = (g, slot, c) => {
    g.fillStyle = c;
    for (let i = 0; i < 12; i++) if (i % 6 === slot) g.fillRect(3, 4 + i * 12, 8, 10);
  };

  const buildTextures = () => {
    if (textures.length) return;
    const paint = [
      (g) => {
        // cyan: the field of each panel, with a hole where the seal goes
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
        // magenta: the seal, and a shade over the panel end
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
        // yellow: turns the cyan field green and the seal red
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
        // black: the lines of type and the keylines
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
        // first spot colour: a gold ring and rule
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
        // second spot colour: a small tag on each panel
        g.globalCompositeOperation = "source-over";
        g.fillStyle = "#f05a28";
        cells((x, y) => g.fillRect(x + CELL_W - 12, y, 12, 9));
        barPatch(g, 5, "#f05a28");
      },
      (g) => {
        // coating: gloss across the whole sheet
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

  const drawSheet = (head) => {
    const tail = head - SHEET_L;
    const piece = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.s < tail) continue;
      if (p.s > head) break;
      if (!piece.length && i > 0) {
        const q = pts[i - 1];
        const k = (tail - q.s) / (p.s - q.s || 1);
        piece.push({ x: lerp(q.x, p.x, k), y: lerp(q.y, p.y, k), s: tail });
      }
      piece.push(p);
    }
    if (piece.length < 2) return;
    for (let i = 0; i < piece.length - 1; i++) {
      const a = piece[i];
      const b = piece[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy);
      if (l < 0.01) continue;
      const u = ((a.s - tail) / SHEET_L) * TEX_W;
      const w = (l / SHEET_L) * TEX_W;
      const tex = textures[levelAt(a.s)];
      ctx.save();
      ctx.transform(dx / l, dy / l, KX, -KY, a.x, a.y);
      ctx.drawImage(tex, u, 0, Math.min(w + 0.6, TEX_W - u), TEX_H, 0, 0, l + 0.8, WIDTH);
      const f = facing(a.x, a.y, b.x, b.y);
      if (f < 0.94) {
        ctx.fillStyle = `rgba(0,15,15,${((0.94 - f) * 0.8).toFixed(3)})`;
        ctx.fillRect(0, 0, l + 0.8, WIDTH);
      }
      // violet light under the UV lamps
      if (a.x > 1440 && a.x < 1560) {
        ctx.fillStyle = "rgba(170,110,255,.42)";
        ctx.fillRect(0, 0, l + 0.8, WIDTH);
      }
      ctx.restore();
    }
    // edges
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(0,20,20,.4)";
    ctx.beginPath();
    piece.forEach((p, i) => (i ? ctx.lineTo(px(p.x, 0), py(p.y, 0)) : ctx.moveTo(px(p.x, 0), py(p.y, 0))));
    ctx.stroke();
    // the gripper bar that pulls the sheet
    const h = piece[piece.length - 1];
    ctx.strokeStyle = "#2a3134";
    ctx.lineWidth = 4;
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

  // ---------- cylinders ----------
  let light = -0.25;

  const bodyPath = (ax, ay, bx, by, r) => {
    ctx.beginPath();
    ctx.moveTo(ax + NX * r, ay + NY * r);
    ctx.lineTo(bx + NX * r, by + NY * r);
    ctx.lineTo(bx - NX * r, by - NY * r);
    ctx.lineTo(ax - NX * r, ay - NY * r);
    ctx.closePath();
  };

  const cylinder = (x, y, r, z0, z1, stops, spin, hub = "#39454a") => {
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
    // the gap in the cylinder, turning: seen only on the side that faces the viewer
    if (spin !== undefined) {
      const ca = Math.cos(spin);
      const sa = Math.sin(spin);
      if (ca * KX - sa * KY > 0) {
        ctx.strokeStyle = "rgba(0,0,0,.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px(x + ca * r, z0), py(y + sa * r, z0));
        ctx.lineTo(px(x + ca * r, z1), py(y + sa * r, z1));
        ctx.stroke();
      }
    }
    const end = ctx.createLinearGradient(ax - r, ay - r, ax + r, ay + r);
    end.addColorStop(0, "#d0d8da");
    end.addColorStop(1, "#6d7a7e");
    disc(ax, ay, r, end);
    ring(ax, ay, r, "rgba(0,0,0,.3)", 0.8);
    if (spin !== undefined) {
      for (let i = 0; i < 6; i++) {
        const a = spin + (i * TAU) / 6;
        disc(ax + Math.cos(a) * r * 0.66, ay + Math.sin(a) * r * 0.66, Math.max(1.2, r * 0.06), "#4b575b");
      }
    }
    disc(ax, ay, r * 0.32, hub);
  };

  const steelStops = () => [
    [0, "#6a7876"],
    [0.24 + light * 0.1, "#f6f8f8"],
    [0.3 + light * 0.1, "#cfd7d8"],
    [0.46, "#a4afb0"],
    [0.76, "#59666a"],
    [1, "#2a3538"],
  ];

  const rubberStops = (c) => [
    [0, c],
    [0.26 + light * 0.1, "#8d989b"],
    [0.36, c],
    [1, "#101416"],
  ];

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
    [200, 660, 1120, 1580].forEach((x) => {
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

  const drawBack = () => {
    drawFloor();
    contactShadow(84, 300, -14, WIDTH + 20);
    contactShadow(296, 1556, -74, WIDTH + 20);
    contactShadow(1550, 1800, -14, WIDTH + 20);

    // the long wall behind all the units: dark, so the cylinders stand out
    const wall = block(296, 1560, 230, FLOOR, REAR, REAR + 12, GRAPHITE);
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(wall[0], wall[1], wall[2], wall[3]);
    for (let i = 0; i < 8; i++) {
      const x = wall[0] + 14 + i * PITCH;
      vents(x + 30, wall[1] + 214, 90, 6, 7);
      rivet(x + 8, wall[1] + 206);
      rivet(x + 138, wall[1] + 206);
    }

    // feeder: far wall, pallet
    const fw = block(84, 296, 300, FLOOR, REAR, REAR + 10, GRAPHITE);
    door(fw[0] + 14, fw[1] + 16, fw[2] - 28, fw[3] - 36);
    drawPallet(112, 246, 598);

    // base under the UV lamps
    block(1436, 1560, 590, FLOOR, -6, WIDTH + 6, GRAPHITE);

    // delivery: far wall, pallet
    const dw = block(1550, 1800, 280, FLOOR, REAR, REAR + 10, GRAPHITE);
    door(dw[0] + 14, dw[1] + 16, dw[2] - 28, dw[3] - 36);
    drawPallet(1566, 1700, 598);
  };

  // ---------- drawn once, in front of the moving parts ----------
  const drawUnit = (i) => {
    const x = unitX(i);
    const ink = INKS[i];
    const coat = i === 6;

    // lower frame, with the cut-away above it
    const base = block(x, x + UNIT_W, 590, FLOOR, -8, WIDTH + 8, GRAPHITE);
    door(base[0] + 12, base[1] + 5, 60, 20);
    door(base[0] + 78, base[1] + 5, 60, 20);
    vents(base[0] + 20, base[1] + 10, 44, 2, 5);
    vents(base[0] + 86, base[1] + 10, 44, 2, 5);

    // the post that joins the upper and lower frame
    block(x, x + 14, 410, 590, -8, -2, GRAPHITE);

    // the upper body: a graphite strip with the controls, an aluminium panel beside it
    const upper = block(x, x + UNIT_W, 176, 410, -8, WIDTH + 8, SILVER);
    const [ax, ay, w, h] = upper;
    ctx.fillStyle = vgrad(ay, ay + h, GRAPHITE.hi, GRAPHITE.lo);
    ctx.fillRect(ax, ay, 52, h);
    brushed(ax + 52, ay, w - 52, h);
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.fillRect(ax + 51, ay, 1.5, h);

    // number and colour of the unit
    ctx.fillStyle = "#f2f3ef";
    ctx.fillRect(ax + 10, ay + 12, 32, 22);
    ctx.fillStyle = "#1e2528";
    ctx.font = "700 14px Archivo, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(coat ? "UV" : String(i + 1), ax + 26, ay + 23.5);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ink.c;
    ctx.fillRect(ax + 10, ay + 36, 32, 5);

    // small panel and stop button, as on each unit of the press
    ctx.fillStyle = "#eeefe9";
    ctx.fillRect(ax + 8, ay + 54, 36, 72);
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(ax + 8, ay + 54, 36, 72);
    ctx.fillStyle = "#22313a";
    ctx.fillRect(ax + 12, ay + 58, 28, 13);
    [[17, 80], [26, 80], [35, 80], [17, 90], [26, 90], [35, 90]].forEach(([bx, by], n) =>
      pushButton(ax + bx, ay + by, n === 2 ? "#2bbf6f" : "#c9cdc9", 2.6)
    );
    eStop(ax + 26, ay + 111, 7);

    // long handle down the guard
    ctx.strokeStyle = "#c9ced0";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ax + 26, ay + 148);
    ctx.bezierCurveTo(ax + 18, ay + 165, ax + 18, ay + 195, ax + 26, ay + 216);
    ctx.stroke();
    ctx.lineCap = "butt";

    // inking window, on the aluminium panel
    ctx.fillStyle = "#0e1416";
    ctx.fillRect(ax + 66, ay + 18, 72, 92);
    ctx.strokeStyle = "#6f777a";
    ctx.lineWidth = 2;
    ctx.strokeRect(ax + 66, ay + 18, 72, 92);
    rivet(ax + 60, ay + 12, 1.8);
    rivet(ax + 144, ay + 12, 1.8);
    rivet(ax + 60, ay + 116, 1.8);
    rivet(ax + 144, ay + 116, 1.8);

    // service door under the window
    door(ax + 64, ay + 126, 76, 96);
    vents(ax + 74, ay + 138, 56, 6, 7);

    // the ink cartridge on top, its colour showing through the tank
    const [cx, cy] = P(x + 78, 176, WIDTH / 2);
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
  };

  const drawFront = () => {
    // feeder: near posts and the top beam with its suction head
    block(84, 98, 340, FLOOR, -8, -2, GRAPHITE);
    block(282, 296, 340, FLOOR, -8, -2, GRAPHITE);
    block(120, 240, 446, 476, 10, WIDTH - 10, GRAPHITE);
    [150, 210].forEach((x) => {
      ctx.strokeStyle = "#2a3134";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(...P(x, 446, WIDTH / 2));
      ctx.bezierCurveTo(...P(x, 410, WIDTH / 2), ...P(x + 20, 380, WIDTH / 2), ...P(x + 20, 340, WIDTH / 2));
      ctx.stroke();
    });
    const beam = block(84, 296, 296, 340, -8, REAR, SILVER);
    brushed(beam[0], beam[1], beam[2], beam[3]);
    ctx.strokeStyle = "rgba(0,0,0,.3)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(beam[0], beam[1], beam[2], beam[3]);
    vents(beam[0] + 16, beam[1] + 12, 70, 4);
    pushButton(beam[0] + 170, beam[1] + 16, "#2bbf6f");
    pushButton(beam[0] + 186, beam[1] + 16, "#c9cdc9");
    eStop(beam[0] + 180, beam[1] + 32, 5);
    // feed board
    poly([P(240, 509, 0), P(300, 509, 0), P(300, 509, WIDTH), P(240, 509, WIDTH)], "rgba(190,198,200,.34)", "rgba(0,0,0,.25)", 0.8);

    // the units, left to right: each paints over the side of the one before
    for (let i = 0; i < INKS.length; i++) drawUnit(i);

    // UV section: a dark hood with its lamp, a frame below
    const hood = block(1436, 1560, 290, 366, -6, WIDTH + 6, GRAPHITE);
    vents(hood[0] + 16, hood[1] + 16, 92, 7);
    block(1436, 1448, 366, 590, -6, -1, GRAPHITE);
    ctx.fillStyle = "#b67bff";
    ctx.fillRect(hood[0] + 2, hood[1] + hood[3], hood[2] - 4, 3);

    // delivery: portal frame, as tall as the units
    const left = block(1550, 1566, 312, FLOOR, -10, -2, GRAPHITE);
    void left;
    block(1784, 1800, 312, FLOOR, -10, -2, GRAPHITE);
    const top = block(1550, 1800, 262, 312, -10, REAR, GRAPHITE);
    ctx.fillStyle = "#f4f4ee";
    ctx.fillRect(top[0] + 26, top[1] + top[3] - 8, 88, 3);
    ctx.fillRect(top[0] + 130, top[1] + top[3] - 8, 88, 3);
    // the two dials on the frame
    [top[0] + 214, top[0] + 234].forEach((dx) => {
      disc(dx, top[1] + 20, 8.5, "#e9ebe6");
      ring(dx, top[1] + 20, 8.5, "#20282b", 1.4);
      ctx.strokeStyle = "#b81f24";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(dx, top[1] + 20);
      ctx.lineTo(dx + 4, top[1] + 15);
      ctx.stroke();
    });
    // the company's name on the frame
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
    block(296, 1436, 616, FLOOR, -44, -10, walk);
    checker(296, 1436, 616, -44, -10);
    block(296, 1436, 634, FLOOR, -78, -44, walk);
    checker(296, 1436, 634, -78, -44);

    // the operator's desk by the delivery
    const desk = block(1472, 1532, 582, FLOOR, -58, -26, GRAPHITE);
    door(desk[0] + 8, desk[1] + 10, desk[2] - 16, desk[3] - 18);
    poly(
      [P(1462, 568, -64), P(1542, 568, -64), P(1542, 582, -22), P(1462, 582, -22)],
      "#f2f2ec",
      "rgba(0,0,0,.3)",
      0.8
    );
    const [ex, ey] = P(1472, 578, -52);
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
  let frontLayer = null;

  const camAt = (t) => {
    const lead = SHEET_L + 120 + SPEED * t;
    const k = clamp((t - T_SHEETS_END + 1.4) / 1.4);
    const follow = lead - viewW * 0.62;
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

  const render = (t) => {
    if (!backLayer) return;
    const flow = flowAt(t);
    const S = scale * dpr;
    camX = camMode ? clamp(camAt(t) + dragged, 0, WW - viewW) : 0;
    const shift = Math.round(camX * S);

    ctx = screen;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backLayer, -shift, 0);
    ctx.setTransform(S, 0, 0, S, -shift, 0);

    const running = t > 0 && t < T_STOP + 0.4;

    // ---- feeder pile, going down ----
    const started = clamp(Math.floor(t / SHEET_GAP) + 1, 0, SHEETS);
    const feedTop = 516 + (t > 0 ? started : 0) * 3;
    {
      const x0 = 120;
      const x1 = 238;
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
    const BASE = 38;
    const pileH = BASE + landedCount * 4.2;
    {
      const x0 = 1578;
      const x1 = 1696;
      const top = 598 - pileH;
      const [ax, ay] = P(x0, top, 0);
      ctx.fillStyle = "#ecebe2";
      ctx.fillRect(ax, ay, x1 - x0, pileH);
      poly([P(x1, top, 0), P(x1, top, WIDTH), P(x1, 598, WIDTH), P(x1, 598, 0)], "#c3c6bd");
      ctx.lineWidth = 0.8;
      for (let y = top + 4.2; y < 598; y += 4.2) {
        ctx.strokeStyle = "rgba(20,60,70,.35)";
        ctx.beginPath();
        ctx.moveTo(...P(x0, y, 0));
        ctx.lineTo(...P(x1, y, 0));
        ctx.lineTo(...P(x1, y, WIDTH));
        ctx.stroke();
      }
      flatSheet(x0, x1, top, 0, textures[textures.length - 1]);
    }

    // ---- impression cylinders and transfer drums, under the sheet ----
    const spin = flow / 15;
    for (let i = 0; i < INKS.length; i++) {
      const nx = nipX(i);
      cylinder(nx, NIP_Y + 16, 15, -4, WIDTH + 4, steelStops(), spin);
      if (i < INKS.length - 1) cylinder(nx + PITCH / 2, NIP_Y + 12 + 14, 13, -4, WIDTH + 4, steelStops(), -spin * 1.15);
    }

    // ---- sheets ----
    for (let i = 0; i < SHEETS; i++) {
      const dt = t - i * SHEET_GAP;
      if (dt < 0) continue;
      if (dt <= TRAVEL) {
        drawSheet(SHEET_L + SPEED * dt);
      } else if (dt < TRAVEL + FALL) {
        // released over the pile
        const k = (dt - TRAVEL) / FALL;
        const yy = lerp(396, 598 - pileH - 4, k * k);
        flatSheet(1578, 1696, yy, (1 - k) * 5, textures[textures.length - 1]);
      }
    }

    // ---- blanket cylinders, over the sheet ----
    for (let i = 0; i < INKS.length; i++) {
      cylinder(nipX(i), NIP_Y - 16, 15, -4, WIDTH + 4, rubberStops(INKS[i].blanket), -spin);
    }

    // ---- UV light on the rising sheet ----
    const uv = running ? clamp(t / 1.5) : 0;

    // ---- everything in front ----
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(frontLayer, -shift, 0);
    ctx.setTransform(S, 0, 0, S, -shift, 0);

    // the UV lamp lights up while the press runs
    if (running) {
      const [hx, hy] = P(1436, 366, -6);
      ctx.fillStyle = `rgba(214,180,255,${(0.9 * uv).toFixed(3)})`;
      ctx.fillRect(hx + 4, hy, 116, 3);
    }

    // the ink train seen through each window: plate cylinder and inked rollers, turning
    INKS.forEach((ink, i) => {
      const [ax, ay] = P(unitX(i), 176, -8);
      const wx = ax + 66;
      const wy = ay + 18;
      ctx.save();
      ctx.beginPath();
      ctx.rect(wx + 1, wy + 1, 70, 90);
      ctx.clip();
      const roller = (cx, cy, r, c, a) => {
        const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
        g.addColorStop(0, "rgba(255,255,255,.75)");
        g.addColorStop(0.28, c);
        g.addColorStop(1, c);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.4)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,.5)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8);
        ctx.stroke();
      };
      const turn = flow / 14;
      roller(wx + 36, wy + 70, 19, "#b6bfc1", -turn * 0.7);
      roller(wx + 16, wy + 46, 10, ink.c, turn);
      roller(wx + 36, wy + 38, 10, ink.c, -turn);
      roller(wx + 56, wy + 46, 10, ink.c, turn);
      roller(wx + 26, wy + 20, 8, ink.c, -turn * 1.2);
      roller(wx + 46, wy + 20, 8, ink.c, turn * 1.2);
      // glass
      ctx.fillStyle = "rgba(255,255,255,.08)";
      ctx.beginPath();
      ctx.moveTo(wx, wy + 90);
      ctx.lineTo(wx + 28, wy);
      ctx.lineTo(wx + 46, wy);
      ctx.lineTo(wx + 18, wy + 90);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // the operator's screen counts the sheets
    const [sx, sy] = P(1486, 580, -46);
    screenPanel(sx, sy - 18, 42, 18);
    ctx.fillStyle = "#7cf0d6";
    ctx.font = "600 12px Archivo, Arial, sans-serif";
    ctx.fillText(String(landedCount).padStart(4, "0"), sx + 7, sy - 5);

    // ---- what happens where ----
    const passed = (i) => t > 0 && (SHEET_L + SPEED * t >= NIPS[i]) && (SPEED * t - SHEET_GAP * SPEED * (SHEETS - 1) < NIPS[i]);
    labelAt(0, 110, t > 0 && t < (SHEETS - 1) * SHEET_GAP + 0.1, "#efece2");
    INKS.forEach((ink, i) => labelAt(i + 1, unitX(i) + 14, passed(i), ink.c));
    labelAt(8, 1444, running && t > NIPS[6] / SPEED, "#b67bff");
    labelAt(9, 1574, t >= TRAVEL, "#efece2");
  };

  // ---------- running it ----------
  let elapsed = 0;
  let last = 0;
  let playing = false;
  let visible = false;
  let finished = false;

  const setSteps = (t) => {
    steps.forEach((li, i) => {
      let on = false;
      if (i === 0) on = t > 0 && t < (SHEETS - 1) * SHEET_GAP + 0.1;
      else if (i <= 7) on = SHEET_L + SPEED * t >= NIPS[i - 1] && SPEED * t - SHEET_GAP * SPEED * (SHEETS - 1) < NIPS[i - 1];
      else if (i === 8) on = t > NIPS[6] / SPEED && t < T_STOP;
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
