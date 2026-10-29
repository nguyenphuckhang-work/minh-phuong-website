// Hero: one press sheet goes through the factory on screen.
// It is printed plate by plate (C, M, Y, K), hot-foil stamped,
// spot UV coated and die-cut, then the blank folds itself into a carton.
//
// Everything is drawn in "sheet units": the sheet is 240 x 356, and the box
// net sits on it exactly where the faces of the 3D box are placed, so the
// printed sheet and the folded box are the same artwork.
(() => {
  const stage = document.querySelector(".machine");
  if (!stage) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = [...document.querySelectorAll(".run li")];
  const replay = document.querySelector(".run-again");

  const SW = 240;
  const SH = 356;

  // outline of the carton blank: tuck, lid, back + dust flaps, sides, bottom, front + dust flaps
  const NET =
    "M74 25H166L170 41V143L208 149V180L170 184V186H215V286H170V288L208 294V325L170 329V331H70V329L32 325V294L70 288V286H25V186H70V184L32 180V149L70 143V41Z";
  const CREASES =
    "M70 41H170M70 141H170M70 186H170M70 286H170M70 186V286M170 186V286M70 143V184M170 143V184M70 288V329M170 288V329";

  // ---------- artwork ----------
  // A red carton: a feng shui coin lattice on the walls and lid, varnished with spot UV
  // so it glints as the light moves; across the lid a fine branch of apricot blossom and
  // the name in a flowing script, both foil stamped.

  const NAME = "Minh Phuong";

  // a five-petal blossom drawn in outline, the way fine foil line work is cut
  const blossom = (x, y, r, turn) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = turn + i * 72;
      const rad = (a * Math.PI) / 180;
      const px = (x + Math.cos(rad) * r * 0.58).toFixed(2);
      const py = (y + Math.sin(rad) * r * 0.58).toFixed(2);
      return `<ellipse cx="${px}" cy="${py}" rx="${(r * 0.46).toFixed(2)}" ry="${(r * 0.36).toFixed(2)}" transform="rotate(${a} ${px} ${py})"/>`;
    }).join("");
  const FLOWERS = [
    [99, 63, 7.6, 12],
    [121, 52.5, 5.8, 40],
    [141, 67.5, 8.4, -14],
    [154, 84, 5.4, 22],
    [160, 56, 4.6, 4],
    [85, 69, 4.8, 30],
  ];
  const BUDS = [
    [129, 50.5, 1.8],
    [115, 64.5, 1.4],
    [148, 80, 1.6],
    [91, 64.5, 1.4],
    [163, 52, 1.3],
  ];
  const BRANCH = "M74 74C86 70 94 62 108 63S132 72 147 64S160 56 166 55";
  const TWIGS = "M108 63C112 56 118 53 124 50M134 69C138 76 145 80 151 83M88 70C90 66 92 65 94 64";

  // colour bar along the gripper and tail edge, the way a real sheet carries one
  const patches = ["#00a0e3", "#e5007d", "#ffed00", null, "#2e3192", "#e6332a", "#00a650", "#7fcff1", "#f27fbe", "#fff67f"];
  const bar = (y, ink) =>
    Array.from({ length: 20 }, (_, i) => {
      const fill = patches[i % patches.length];
      const isK = fill === null;
      if (ink === "k" ? !isK : isK) return "";
      return `<rect x="${20 + i * 10}" y="${y}" width="10" height="6" fill="${isK ? "#231f20" : fill}"/>`;
    }).join("");

  const reg = (x, y) =>
    `<g transform="translate(${x} ${y})" fill="none" stroke="#231f20" stroke-width=".4"><circle r="3"/><circle r="1.2" fill="#231f20"/><path d="M-5 0H5M0-5V5"/></g>`;
  // trim marks at the corners of the blank
  const crops = [
    [25, 25, -1, -1],
    [215, 25, 1, -1],
    [25, 331, -1, 1],
    [215, 331, 1, 1],
  ]
    .map(([x, y, dx, dy]) => `M${x + dx * 3} ${y}h${dx * 7}M${x} ${y + dy * 3}v${dy * 7}`)
    .join("");

  const rect = ([x, y, w, h], attrs) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/>`;
  const walls = [
    [25, 186, 45, 100],
    [170, 186, 45, 100],
    [70, 141, 100, 45],
    [70, 286, 100, 45],
  ];
  // the edge of each wall that ends up at the rim of the box
  const bands = [
    [25, 186, 5, 100],
    [210, 186, 5, 100],
    [70, 141, 100, 5],
    [70, 326, 100, 5],
  ];
  const rims = ["M32.5 188V284", "M207.5 188V284", "M72 148.5H168", "M72 323.5H168"];
  const LIDFIELD = [78, 49, 84, 84];

  const defs = `
<svg class="press-defs" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <filter id="sep-c" color-interpolation-filters="sRGB"><feColorMatrix values="1 0 0 0 0 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>
    <filter id="sep-m" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 1 0 1 0 0 0 0 0 0 0 1 0 0 0 1 0"/></filter>
    <filter id="sep-y" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 1 0 0 0 0 0 1 0"/></filter>

    <!-- champagne foil: light golds only, no brown -->
    <linearGradient id="foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="90" y2="45" spreadMethod="reflect">
      <stop offset="0" stop-color="#d2b679"/>
      <stop offset=".34" stop-color="#f1e3bd"/>
      <stop offset=".46" stop-color="#fffbf2"/>
      <stop offset=".6" stop-color="#e2c993"/>
      <stop offset=".85" stop-color="#c9aa6c"/>
      <stop offset="1" stop-color="#ecdcb2"/>
    </linearGradient>
    <!-- a band of light for the spot UV gloss -->
    <linearGradient id="uv-band" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="30">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".95"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="uv-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${SW}" height="${SH}">
      <rect width="${SW}" height="${SH}" fill="url(#uv-band)"/>
    </mask>

    <!-- the feng shui coin lattice: interlocking circles -->
    <pattern id="coins" patternUnits="userSpaceOnUse" width="12" height="12">
      <g fill="none" stroke="#e2533f" stroke-width=".75"><circle cx="6" cy="6" r="6"/><circle r="6"/><circle cx="12" r="6"/><circle cy="12" r="6"/><circle cx="12" cy="12" r="6"/></g>
    </pattern>
    <pattern id="coins-tone" patternUnits="userSpaceOnUse" width="9" height="9">
      <g fill="none" stroke="#a3111a" stroke-width=".6"><circle cx="4.5" cy="4.5" r="4.5"/><circle r="4.5"/><circle cx="9" r="4.5"/><circle cy="9" r="4.5"/><circle cx="9" cy="9" r="4.5"/></g>
    </pattern>
    <!-- a fine diagonal hatch, the kind of flood pattern an everyday carton carries, not the gift box's coin lattice -->
    <pattern id="ct-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
      <rect width="7" height="7" fill="#b9652c"/>
      <line x1="0" y1="0" x2="0" y2="7" stroke="#a85423" stroke-width="3"/>
    </pattern>
    <linearGradient id="ct-bean" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5b3420"/>
      <stop offset="1" stop-color="#8a5330"/>
    </linearGradient>
    <pattern id="coins-uv" patternUnits="userSpaceOnUse" width="12" height="12">
      <g fill="none" stroke="#fff" stroke-width=".9"><circle cx="6" cy="6" r="6"/><circle r="6"/><circle cx="12" r="6"/><circle cy="12" r="6"/><circle cx="12" cy="12" r="6"/></g>
    </pattern>
    <pattern id="coins-uv-tone" patternUnits="userSpaceOnUse" width="9" height="9">
      <g fill="none" stroke="#fff" stroke-width=".7"><circle cx="4.5" cy="4.5" r="4.5"/><circle r="4.5"/><circle cx="9" r="4.5"/><circle cy="9" r="4.5"/><circle cx="9" cy="9" r="4.5"/></g>
    </pattern>

    ${["c", "m", "y", "k", "f", "u"].map((p) => `<clipPath id="wipe-${p}"><rect width="${SW}" height="0"/></clipPath>`).join("")}
    <clipPath id="waste"><path clip-rule="evenodd" d="M0 0H${SW}V${SH}H0Z${NET}"/></clipPath>

    <g id="art-cmy">
      <path d="${NET}" fill="#bf1f27"/>
      ${walls.map((w) => rect(w, 'fill="url(#coins)"')).join("")}
      ${bands.map((b) => rect(b, 'fill="#12a19b"')).join("")}
      ${rect(LIDFIELD, 'fill="url(#coins-tone)"')}
      ${bar(8, "cmy")}${bar(342, "cmy")}
    </g>

    <g id="art-k">
      <text class="art-small" x="120" y="239" text-anchor="middle">mpjsc.com</text>
      ${reg(10, 178)}${reg(230, 178)}${reg(120, 3.6)}
      <path d="${crops}" stroke="#231f20" stroke-width=".3" fill="none"/>
      <text class="art-slug" x="20" y="354">Minh Phuong Printing   Speedmaster CX 102-6+L   Job 26-1030   Sheet 1 of 1</text>
      ${bar(8, "k")}${bar(342, "k")}
    </g>

    <g id="art-foil">
      ${rect([74, 45, 92, 92], 'fill="none" stroke="url(#foil)" stroke-width=".6"')}
      ${rims.map((d) => `<path d="${d}" fill="none" stroke="url(#foil)" stroke-width=".5"/>`).join("")}
      <path d="${BRANCH}" fill="none" stroke="url(#foil)" stroke-width="1" stroke-linecap="round"/>
      <path d="${TWIGS}" fill="none" stroke="url(#foil)" stroke-width=".6" stroke-linecap="round"/>
      <g fill="#bf1f27" stroke="url(#foil)" stroke-width=".45">${FLOWERS.map(([x, y, r, a]) => blossom(x, y, r, a)).join("")}</g>
      ${FLOWERS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${(r * 0.2).toFixed(2)}" fill="url(#foil)"/>`).join("")}
      ${BUDS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#foil)"/>`).join("")}
      <text class="art-word" x="120" y="117" text-anchor="middle" fill="url(#foil)">${NAME}</text>
      <path d="M108 124H132" stroke="url(#foil)" stroke-width=".35"/>
    </g>

    <!-- spot UV: clear gloss over the coin lattice, seen only where the light catches it -->
    <g id="art-uv" mask="url(#uv-mask)">
      ${walls.map((w) => rect(w, 'fill="url(#coins-uv)"')).join("")}
      ${rect(LIDFIELD, 'fill="url(#coins-uv-tone)"')}
    </g>

    <g id="art">
      <rect width="${SW}" height="${SH}" fill="#fbf9f3"/>
      <use href="#art-cmy"/><use href="#art-k"/><use href="#art-foil"/>
      <use href="#art-uv" class="uv-layer"/>
    </g>
  </defs>
</svg>`;

  // faces of the blank: where they hang, which way they fold, and their patch of the sheet
  // fold: [axis, final angle]; folding goes away from the printed side.
  // Dust flaps and the tuck go a little past 90 degrees so they sit inside the walls.
  const FLAP_L = "polygon(0 13%, 100% 4.4%, 100% 95.6%, 0 87%)";
  const FLAP_R = "polygon(0 4.4%, 100% 13%, 100% 87%, 0 95.6%)";
  const FACES = {
    net: { parent: null, x: 70, y: 186, w: 100, h: 100, sheet: [70, 186] },
    front: { parent: "net", x: 0, y: 100, w: 100, h: 45, o: "50% 0", fold: ["X", -90], sheet: [70, 286] },
    fl: { parent: "front", x: -38, y: 0, w: 38, h: 45, o: "100% 50%", fold: ["Y", -94], sheet: [32, 286], clip: FLAP_L },
    fr: { parent: "front", x: 100, y: 0, w: 38, h: 45, o: "0 50%", fold: ["Y", 94], sheet: [170, 286], clip: FLAP_R },
    back: { parent: "net", x: 0, y: -45, w: 100, h: 45, o: "50% 100%", fold: ["X", 90], sheet: [70, 141] },
    kl: { parent: "back", x: -38, y: 0, w: 38, h: 45, o: "100% 50%", fold: ["Y", -94], sheet: [32, 141], clip: FLAP_L },
    kr: { parent: "back", x: 100, y: 0, w: 38, h: 45, o: "0 50%", fold: ["Y", 94], sheet: [170, 141], clip: FLAP_R },
    lid: { parent: "back", x: 0, y: -100, w: 100, h: 100, o: "50% 100%", fold: ["X", 90], sheet: [70, 41] },
    tuck: { parent: "lid", x: 0, y: -16, w: 100, h: 16, o: "50% 100%", fold: ["X", 93], sheet: [70, 25], clip: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" },
    left: { parent: "net", x: -45, y: 0, w: 45, h: 100, o: "100% 50%", fold: ["Y", -90], sheet: [25, 186] },
    right: { parent: "net", x: 100, y: 0, w: 45, h: 100, o: "0 50%", fold: ["Y", 90], sheet: [170, 186] },
  };

  // how much each face darkens once it stands up (light comes from the top left)
  const SHADE = { front: 0.06, back: 0.3, left: 0.32, right: 0.14, fl: 0.4, fr: 0.4, kl: 0.4, kr: 0.4, lid: 0, tuck: 0.3, net: 0.2 };

  const faceHTML = (name) => {
    const f = FACES[name];
    const [sx, sy] = f.sheet;
    const kids = Object.keys(FACES).filter((k) => FACES[k].parent === name).map(faceHTML).join("");
    const clip = f.clip ? ` style="clip-path:${f.clip}"` : "";
    return `<div class="face face--${name}" data-face="${name}">
      <div class="skin skin--out"${clip}><svg viewBox="${sx} ${sy} ${f.w} ${f.h}" preserveAspectRatio="none"><use href="#art"/></svg></div>
      <div class="skin skin--in"${clip}></div>${kids}</div>`;
  };


  // ---------- the second piece: an everyday coffee carton from the same range ----------
  // Dropped beside the gift box once the lid closes, so the hero ends on a small family
  // of products rather than one box: a festive foil carton and a plain working one,
  // in their own colourway so neither is mistaken for the other.
  const CT = { x: 22, y: 236, w: 38, d: 38, h: 96 };
  const ctFace = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><rect width="${w}" height="${h}" fill="url(#ct-hatch)"/>${body}</svg>`;
  const ctBean = (cx, cy, r) =>
    `<g transform="translate(${cx} ${cy}) rotate(-18)"><ellipse rx="${r}" ry="${r * 0.72}" fill="url(#ct-bean)"/><path d="M0 ${-r * 0.6}C${r * 0.22} ${-r * 0.2} ${r * 0.22} ${r * 0.2} 0 ${r * 0.6}" fill="none" stroke="#3c2214" stroke-width="${r * 0.14}"/></g>`;
  const ctFront = (w, h) =>
    ctFace(
      w,
      h,
      `<rect width="${w}" height="${h * 0.22}" fill="#163432"/>
       <rect y="${h * 0.22 - 1.4}" width="${w}" height="1.4" fill="#e7c48b"/>
       <rect x="${w * 0.1}" y="${h * 0.32}" width="${w * 0.8}" height="${h * 0.4}" rx="2" fill="#f4ead9"/>
       ${ctBean(w * 0.5, h * 0.44, w * 0.12)}
       <text class="ct-word" x="${w / 2}" y="${h * 0.63}" text-anchor="middle">${NAME}</text>
       <text class="ct-sub" x="${w / 2}" y="${h * 0.69}" text-anchor="middle">ROASTED &amp; PACKED</text>`
    );
  const ctSide = (w, h) =>
    ctFace(w, h, `<rect width="${w}" height="${h * 0.22}" fill="#163432"/><rect y="${h * 0.22 - 1.4}" width="${w}" height="1.4" fill="#e7c48b"/>`);
  const ctTop = (w, h) => ctFace(w, h, `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="#f4ead9" stroke-width=".6"/>${ctBean(w / 2, h / 2, w * 0.16)}`);
  const cartonHTML = `
    <div class="carton">
      <div class="cf cf--top" style="--shade:0">${ctTop(CT.w, CT.d)}</div>
      <div class="cf cf--front" style="--shade:.06">${ctFront(CT.w, CT.h)}</div>
      <div class="cf cf--back" style="--shade:.3">${ctFront(CT.w, CT.h)}</div>
      <div class="cf cf--left" style="--shade:.32">${ctSide(CT.d, CT.h)}</div>
      <div class="cf cf--right" style="--shade:.14">${ctSide(CT.d, CT.h)}</div>
    </div>
    <div class="carton-shadow"></div>`;

  const plate = (p, filter) =>
    `<g clip-path="url(#wipe-${p})" class="plate">${filter ? `<g filter="url(#sep-${p})"><use href="#art-cmy"/></g>` : `<use href="#art-k"/>`}</g>`;

  stage.innerHTML = `${defs}
  <div class="world">
    <div class="sheet-shadow"></div>
    <div class="box-shadow"></div>
    ${cartonHTML}
    ${faceHTML("net")}
    <svg class="sheet" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="none">
      <g class="sheet-body">
        <rect width="${SW}" height="${SH}" fill="#fbf9f3"/>
        ${plate("c", true)}${plate("m", true)}${plate("y", true)}${plate("k", false)}
        <g clip-path="url(#wipe-f)"><use href="#art-foil"/></g>
        <g clip-path="url(#wipe-u)"><use href="#art-uv" class="uv-layer"/></g>
        <path class="die-crease" d="${CREASES}"/>
        <path class="die-cut" d="${NET}" pathLength="1"/>
      </g>
      ${["c", "m", "y", "k", "u"].map((p) => `<rect class="nip nip--${p}" width="${SW}" height="1.4" y="0"/>`).join("")}
    </svg>
  </div>`;

  const world = stage.querySelector(".world");
  const sheet = stage.querySelector(".sheet");
  const sheetBody = stage.querySelector(".sheet-body");
  const sheetShadow = stage.querySelector(".sheet-shadow");
  const boxShadow = stage.querySelector(".box-shadow");
  const dieCut = stage.querySelector(".die-cut");
  const dieCrease = stage.querySelector(".die-crease");
  const foil = document.getElementById("foil");
  const uvBand = document.getElementById("uv-band");
  const wipes = Object.fromEntries(["c", "m", "y", "k", "f", "u"].map((p) => [p, document.querySelector(`#wipe-${p} rect`)]));
  const nips = Object.fromEntries(["c", "m", "y", "k", "u"].map((p) => [p, stage.querySelector(`.nip--${p}`)]));
  const faces = Object.fromEntries([...stage.querySelectorAll("[data-face]")].map((el) => [el.dataset.face, el]));
  const carton = stage.querySelector(".carton");
  const cartonShadow = stage.querySelector(".carton-shadow");
  const cartonFaces = Object.fromEntries([...carton.children].map((el) => [el.classList[1].slice(4), el]));

  // only touch an attribute when its value really changes: every change repaints the artwork
  const memo = new Map();
  const setAttr = (el, name, value) => {
    const key = el;
    let m = memo.get(key);
    if (!m) memo.set(key, (m = {}));
    if (m[name] === value) return;
    m[name] = value;
    el.setAttribute(name, value);
  };

  // size every face in pixels from one unit.
  // The world is laid out at the size the finished box is seen at and scaled down for the
  // sheet, never up: the faces are drawn once at full size, so the foil lettering and the
  // blossom stay sharp on the closed box.
  const ZOOM = 2.15;
  let u = 1;
  const layout = () => {
    const r = stage.getBoundingClientRect();
    // the tilted sheet needs some room around it so it never runs over the readout below
    u = Math.min(r.width / (SW * 1.22), r.height / (SH * 1.16)) * ZOOM;
    world.style.width = `${SW * u}px`;
    world.style.height = `${SH * u}px`;
    Object.entries(FACES).forEach(([name, f]) => {
      const el = faces[name];
      el.style.left = `${f.x * u}px`;
      el.style.top = `${f.y * u}px`;
      el.style.width = `${f.w * u}px`;
      el.style.height = `${f.h * u}px`;
      if (f.o) el.style.transformOrigin = f.o;
    });
    boxShadow.style.cssText = `left:${70 * u}px;top:${186 * u}px;width:${100 * u}px;height:${100 * u}px`;
    const { x, y, w, d, h } = CT;
    carton.style.cssText = `left:${x * u}px;top:${y * u}px;width:${w * u}px;height:${d * u}px`;
    cartonShadow.style.cssText = `left:${x * u}px;top:${y * u}px;width:${w * u}px;height:${d * u}px`;
    const size = (el, fw, fh, t) => {
      el.style.width = `${fw * u}px`;
      el.style.height = `${fh * u}px`;
      el.style.marginLeft = `${(-fw * u) / 2}px`;
      el.style.marginTop = `${(-fh * u) / 2}px`;
      el.style.transform = t;
    };
    size(cartonFaces.top, w, d, `translateZ(${h * u}px)`);
    size(cartonFaces.front, w, h, `translateY(${(d * u) / 2}px) translateZ(${(h * u) / 2}px) rotateX(-90deg)`);
    size(cartonFaces.back, w, h, `translateY(${(-d * u) / 2}px) translateZ(${(h * u) / 2}px) rotateX(90deg) rotateZ(180deg)`);
    size(cartonFaces.left, d, h, `translateX(${(-w * u) / 2}px) translateZ(${(h * u) / 2}px) rotateZ(90deg) rotateX(-90deg)`);
    size(cartonFaces.right, d, h, `translateX(${(w * u) / 2}px) translateZ(${(h * u) / 2}px) rotateZ(-90deg) rotateX(-90deg)`);
  };

  // ---------- timeline (seconds) ----------
  const T = {
    feed: [0, 0.5],
    c: [0.35, 0.95],
    m: [0.7, 1.3],
    y: [1.05, 1.65],
    k: [1.4, 2.0],
    f: [2.15, 2.6],
    shine: [2.35, 3.2],
    u: [2.85, 3.35],
    gloss: [3.1, 4.0],
    die: [3.7, 4.35],
    cut: [4.45, 4.95],
    cam: [4.4, 6.5],
    flip: [4.9, 5.7],
    fb: [5.65, 6.2],
    flaps: [6.05, 6.4],
    lr: [6.3, 6.8],
    lid: [6.75, 7.35],
    tuck: [7.15, 7.6],
    carton: [7.3, 8.1],
  };
  const END = 8.2;
  // which line of the readout is lit
  const RUN = ["c", "f", "u", "die", "fb"];

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
  const at = (t, key, eased = true) => {
    const [a, b] = T[key];
    const v = clamp((t - a) / (b - a));
    return eased ? ease(v) : v;
  };
  const mix = (a, b, v) => a + (b - a) * v;

  let pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };

  // once the box is closed only the camera and the light still move: a frame then costs
  // one transform and, when the pointer has moved, a gradient position
  let settled = false;
  const idle = (now) => {
    setAttr(foil, "gradientTransform", `translate(${Math.round(30 + tilt.x * 70)} 0)`);
    setAttr(uvBand, "gradientTransform", `translate(${Math.round(90 + tilt.x * 120)} ${Math.round((90 + tilt.x * 120) * 0.9)})`);
    camera(1, reduceMotion ? 0 : Math.sin(now / 2600) * 5);
  };

  const camera = (cam, sway) => {
    const s = mix(1 / ZOOM, 1, cam);
    const rx = mix(24, 58, cam) + tilt.y * 8;
    const rz = mix(-8, 152, cam) + sway + tilt.x * 14;
    const ty = mix(0, -58, cam) * u;
    const tz = mix(0, -22, cam) * u;
    world.style.transform = `scale(${s.toFixed(3)}) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) translate3d(0, ${ty.toFixed(2)}px, ${tz.toFixed(2)}px)`;
  };

  const render = (t, now) => {
    const done = t >= END;
    if (done && settled) return idle(now);
    settled = done;

    // plates sweep down the sheet, gripper edge first; the coater lays the UV last
    ["c", "m", "y", "k", "f", "u"].forEach((p) => {
      const v = at(t, p, false);
      setAttr(wipes[p], "height", (v * SH).toFixed(1));
      if (nips[p]) {
        setAttr(nips[p], "y", (v * SH - 0.7).toFixed(1));
        nips[p].style.opacity = v > 0 && v < 1 ? 1 : 0;
      }
    });

    // light: a band runs over the foil and the varnish, later it follows the pointer
    const fx = done ? 30 + tilt.x * 70 : mix(-90, 150, at(t, "shine"));
    setAttr(foil, "gradientTransform", `translate(${Math.round(fx)} 0)`);
    const gx = done ? 90 + tilt.x * 120 : mix(-80, 300, at(t, "gloss"));
    setAttr(uvBand, "gradientTransform", `translate(${Math.round(gx)} ${Math.round(gx * 0.9)})`);


    const die = at(t, "die");
    dieCut.style.strokeDashoffset = 1 - die;
    dieCut.style.opacity = die > 0 ? 1 : 0;
    dieCrease.style.opacity = die;

    // waste is stripped away, the blank stays on the table
    const cut = at(t, "cut");
    if (cut > 0) setAttr(sheetBody, "clip-path", "url(#waste)");
    else if (memo.get(sheetBody)?.["clip-path"]) {
      sheetBody.removeAttribute("clip-path");
      memo.get(sheetBody)["clip-path"] = "";
    }
    const feed = at(t, "feed");
    sheet.style.opacity = cut >= 1 ? 0 : feed * (1 - cut);
    // once the waste is gone the sheet stops costing paint time
    sheet.style.visibility = cut >= 1 ? "hidden" : "visible";
    sheetShadow.style.visibility = cut >= 1 ? "hidden" : "visible";
    sheet.style.transform = `translate3d(0, ${(1 - feed) * -40 * u + cut * 26 * u}px, ${0.6 + cut * -30 * u}px)`;
    sheetShadow.style.opacity = feed * (1 - cut) * 0.9;
    faces.net.style.visibility = cut > 0 ? "visible" : "hidden";

    // turn the blank over, printed side down, then fold it
    const flip = at(t, "flip");
    const lift = Math.sin(Math.PI * flip) * 70 * u;
    faces.net.style.transform = `translateZ(${lift.toFixed(2)}px) rotateY(${(flip * 180).toFixed(2)}deg)`;

    const fold = { front: "fb", back: "fb", fl: "flaps", fr: "flaps", kl: "flaps", kr: "flaps", left: "lr", right: "lr", lid: "lid", tuck: "tuck" };
    Object.entries(fold).forEach(([name, key]) => {
      const v = at(t, key);
      const [axis, deg] = FACES[name].fold;
      faces[name].style.transform = `rotate${axis}(${(v * deg).toFixed(2)}deg)`;
      faces[name].style.setProperty("--shade", (SHADE[name] * v).toFixed(3));
    });
    faces.net.style.setProperty("--shade", (SHADE.net * flip).toFixed(3));

    // the carton comes down onto the table next to the box
    const ct = at(t, "carton");
    carton.style.opacity = ct > 0 ? Math.min(1, ct * 3).toFixed(2) : 0;
    carton.style.transform = `translateZ(${((1 - ct) * 60 * u).toFixed(1)}px)`;
    cartonShadow.style.opacity = (ct * 0.7).toFixed(2);

    const built = at(t, "lid");
    boxShadow.style.opacity = (at(t, "fb") * 0.55 + built * 0.35).toFixed(3);

    // camera: from looking down at the sheet to a three-quarter view of the box
    camera(at(t, "cam"), done && !reduceMotion ? Math.sin(now / 2600) * 5 : 0);

    // readout under the stage
    let on = -1;
    RUN.forEach((key, i) => {
      if (t >= T[key][0]) on = i;
    });
    steps.forEach((li, i) => {
      li.dataset.state = done || i < on ? "done" : i === on ? "on" : "";
    });
  };

  let start = 0;
  let last = 0;
  let running = false;
  let started = false;
  let visible = true;

  const frame = (now) => {
    if (!start) start = now - BLANK * 1000;
    const t = reduceMotion ? END : (now - start) / 1000;
    tilt.x += (pointer.x - tilt.x) * 0.08;
    tilt.y += (pointer.y - tilt.y) * 0.08;
    last = Math.min(t, END);
    render(last, now);
    stage.classList.toggle("is-done", t >= END);
    // keep animating while it runs, or while the finished box sways in view
    if (visible && !(reduceMotion && t >= END)) requestAnimationFrame(frame);
    else running = false;
  };

  const play = (fromStart) => {
    if (fromStart) {
      start = performance.now() - BLANK * 1000;
      settled = false;
    }
    started = true;
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };

  // before the run starts a blank sheet already lies on the table
  const BLANK = T.feed[1];
  last = BLANK;
  layout();
  render(BLANK, 0);
  window.addEventListener("resize", () => {
    layout();
    settled = false;
    if (!running) render(last, 0);
  });

  // the run starts the first time most of the stage is on screen (below the fold on phones)
  let fontsReady = false;
  let seen = false;
  const firstRun = () => {
    if (started || !fontsReady || !seen) return;
    setTimeout(() => play(true), reduceMotion ? 0 : 300);
  };
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (entry.intersectionRatio >= 0.45) seen = true;
      if (visible && started) play(false);
      firstRun();
    },
    { threshold: [0, 0.45] }
  ).observe(stage);

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    // the whole hero is the lamp: move anywhere in it and the box turns to the light
    const hero = stage.closest(".hero") || stage;
    hero.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      pointer = {
        x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
        y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)),
      };
    });
    hero.addEventListener("pointerleave", () => (pointer = { x: 0, y: 0 }));
  }

  replay?.addEventListener("click", () => play(true));

  // wait for the fonts so the foil lettering is set in Fraunces from the first frame
  const ready = () => {
    if (fontsReady) return;
    fontsReady = true;
    firstRun();
  };
  // the script face is only fetched once something asks for it, so ask for it up front
  (document.fonts
    ? Promise.all([document.fonts.ready, document.fonts.load('400 13px "Great Vibes"', NAME)])
    : Promise.resolve()
  ).then(ready, ready);
  setTimeout(ready, 2500);
})();
