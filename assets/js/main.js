(() => {
  const root = document.documentElement;
  const base = root.dataset.base || "";
  const vi = root.lang === "vi";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- work gallery data ----------
  // [file, category, english caption, vietnamese caption, has an 800px copy]
  const WORK = [
    ["products/paper-boxes", "carton", "Folding cartons for coffee and milk tea", "Hộp giấy cà phê, trà sữa", 1],
    ["products/metallized", "carton", "Metallized gift bags and boxes", "Túi và hộp giấy metalize", 1],
    ["products/cigarette-packs", "carton", "Cigarette packs", "Bao bì thuốc lá", 1],
    ["products/cigarette-range", "carton", "Cigarette pack range", "Các mẫu bao thuốc lá", 1],
    ["products/cigarette-flat", "carton", "Cigarette carton blanks", "Tờ in bao bì thuốc lá", 1],
    ["products/printed-sheet-1", "carton", "Printed carton sheet", "Tờ in hộp giấy", 0],
    ["products/printed-sheet-2", "carton", "Printed carton sheet", "Tờ in hộp giấy", 0],
    ["products/printed-sheet-3", "carton", "Printed carton sheet", "Tờ in hộp giấy", 0],
    ["products/printed-sheet-4", "carton", "Printed carton sheet", "Tờ in hộp giấy", 0],
    ["work/mori-lotus-box", "rigid", "Mid-autumn gift box for Mori", "Hộp quà Trung thu cho Mori", 1],
    ["work/peacock-boxes", "rigid", "Lunar New Year gift boxes", "Hộp quà Tết họa tiết chim công", 1],
    ["work/mori-rabbit-set", "rigid", "Mooncake set with rabbit illustration", "Bộ hộp bánh Trung thu họa tiết thỏ", 1],
    ["work/floral-gift-box", "rigid", "Gift set for W Gourmet", "Hộp quà W Gourmet", 1],
    ["work/gold-pattern-box", "rigid", "Coffee gift box with foil pattern", "Hộp quà cà phê ép kim", 1],
    ["work/red-koi-box", "rigid", "Red koi mooncake box", "Hộp bánh Trung thu cá chép đỏ", 1],
    ["work/mori-four-boxes", "rigid", "Four-piece gift box for Mori", "Hộp quà 4 ngăn cho Mori", 1],
    ["work/pastel-sweets-box", "rigid", "Pastel confectionery box", "Hộp bánh kẹo màu pastel", 1],
    ["work/cherry-blossom-box", "rigid", "Cherry blossom gift box", "Hộp quà hoa anh đào", 1],
    ["work/chivas-gift-bags", "rigid", "Chivas Regal gift box and bag", "Hộp và túi quà Chivas Regal", 1],
    ["work/round-mooncake-tins", "rigid", "Round mooncake boxes", "Hộp bánh Trung thu tròn", 1],
    ["work/floral-paper-bags", "rigid", "Floral paper bags", "Túi giấy họa tiết hoa", 1],
    ["work/flower-cube-box", "rigid", "Flower box with window", "Hộp hoa có cửa sổ", 1],
    ["work/mooncake-blue-green", "rigid", "Blue and green mooncake set", "Bộ hộp Trung thu xanh", 1],
    ["work/red-gift-set", "rigid", "Red gift set with bag", "Bộ hộp quà đỏ kèm túi", 1],
    ["work/black-gold-box", "rigid", "Black and gold presentation box", "Hộp đen ép kim vàng", 1],
    ["work/lexom-tea-box", "rigid", "Tea box for Lexom", "Hộp trà Lexom", 1],
    ["work/lexom-white-box", "rigid", "White display box for Lexom", "Hộp trưng bày trắng Lexom", 1],
    ["work/leather-trunk-boxes", "rigid", "Trunk-style boxes", "Hộp kiểu rương da", 1],
    ["work/suitcase-boxes", "rigid", "Suitcase-style boxes", "Hộp kiểu vali", 1],
    ["work/kraft-box", "rigid", "Kraft board box", "Hộp giấy kraft", 0],
    ["products/labels", "print", "Labels and stickers", "Nhãn và decal", 0],
    ["work/magazines", "print", "Magazine covers", "Bìa tạp chí", 1],
    ["products/magazines", "print", "Magazines", "Tạp chí", 1],
  ];

  const gallery = document.getElementById("gallery");
  if (gallery) {
    const frag = document.createDocumentFragment();
    WORK.forEach(([file, cat, en, viCap, hasSmall]) => {
      const full = `${base}assets/img/${file}.webp`;
      const thumb = hasSmall ? `${base}assets/img/${file}-800.webp` : full;
      const caption = vi ? viCap : en;
      const fig = document.createElement("figure");
      fig.className = "tile";
      fig.dataset.cat = cat;
      fig.innerHTML = `<button class="sheen" type="button" data-full="${full}" data-caption="${caption}"><img class="screen" src="${thumb}" alt="${caption}" loading="lazy" decoding="async"></button><figcaption>${caption}</figcaption>`;
      frag.appendChild(fig);
    });
    gallery.appendChild(frag);

    // show a first handful; the rest open with one button so the page stays short
    const tiles = [...gallery.querySelectorAll(".tile")];
    const filters = [...document.querySelectorAll(".filter")];
    const more = document.querySelector(".gallery-more");
    const FIRST = 9;
    let filter = "all";
    let expanded = false;

    const apply = () => {
      const match = tiles.filter((t) => filter === "all" || t.dataset.cat === filter);
      tiles.forEach((t) => (t.hidden = true));
      match.forEach((t, i) => (t.hidden = !expanded && i >= FIRST));
      if (more) {
        more.hidden = expanded || match.length <= FIRST;
        more.querySelector("span").textContent = match.length;
      }
    };

    filters.forEach((btn) => {
      const f = btn.dataset.filter;
      const n = f === "all" ? tiles.length : tiles.filter((t) => t.dataset.cat === f).length;
      btn.insertAdjacentHTML("beforeend", `<span>${n}</span>`);
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        filter = f;
        apply();
      });
    });

    more?.addEventListener("click", () => {
      expanded = true;
      apply();
    });
    apply();
  }

  // ---------- lightbox (gallery + certificates) ----------
  const lb = document.getElementById("lightbox");
  if (lb) {
    const img = lb.querySelector("img");
    const cap = lb.querySelector("figcaption");
    let set = [];
    let index = 0;

    const show = (i) => {
      index = (i + set.length) % set.length;
      const b = set[index];
      img.src = b.dataset.full;
      img.alt = b.dataset.caption;
      cap.textContent = b.dataset.caption;
      lb.querySelectorAll(".lb-prev, .lb-next").forEach((el) => (el.hidden = set.length < 2));
    };

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-full]");
      if (!b) return;
      const group = b.closest(".gallery, .certs");
      set = [...group.querySelectorAll("[data-full]")].filter((el) => !el.closest("[hidden]"));
      show(set.indexOf(b));
      lb.showModal();
    });

    lb.addEventListener("click", (e) => {
      const action = e.target.closest("[data-lb]")?.dataset.lb;
      if (action === "close" || e.target === lb) lb.close();
      if (action === "prev") show(index - 1);
      if (action === "next") show(index + 1);
    });

    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  // ---------- header: mobile menu + hairline once scrolled ----------
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- header hairline once the page has scrolled ----------
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header?.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- products: one viewer, screened in as halftone ----------
  const items = [...document.querySelectorAll(".cat-item")];
  const frame = document.querySelector(".viewer-frame");
  const viewerCap = document.querySelector(".viewer figcaption");
  if (items.length && frame) {
    let current = items.find((i) => i.classList.contains("is-active")) || items[0];
    let latest = null;

    const activate = (item) => {
      if (item === current) return;
      current.classList.remove("is-active");
      item.classList.add("is-active");
      current = item;
      if (viewerCap) viewerCap.textContent = item.dataset.caption;

      const incoming = document.createElement("img");
      incoming.alt = "";
      incoming.className = "is-incoming";
      incoming.src = item.dataset.img;
      latest = incoming;
      const reveal = () => {
        if (incoming !== latest) return;
        frame.appendChild(incoming);
        if (reduceMotion) return cleanup();
        void incoming.offsetWidth;
        incoming.classList.add("go");
        incoming.addEventListener("transitionend", cleanup, { once: true });
        setTimeout(cleanup, 1000);
      };
      const cleanup = () => {
        if (!incoming.isConnected || incoming.classList.contains("is-current")) return;
        if (incoming !== latest) return incoming.remove();
        frame.querySelectorAll("img").forEach((el) => el !== incoming && el.remove());
        incoming.className = "is-current";
      };
      incoming.decode ? incoming.decode().then(reveal, reveal) : (incoming.onload = reveal);
    };

    items.forEach((item) => {
      item.addEventListener("pointerenter", () => activate(item));
    });

    // while scrolling, the item crossing the middle of the screen is the one shown
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && activate(en.target)),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach((item) => io.observe(item));
  }

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
