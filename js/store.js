/* Africa Supermarket — storefront app (demo) · Dalal Technologies */
(function () {
  const A = window.AS, C = A.C, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const I = A.icon, esc = A.esc, money = A.money;
  const CATS = window.AS_CATEGORIES, REG = window.AS_REGIONS, BOXES = window.AS_BOXES;
  const catById = id => CATS.find(c => c.id === id);
  const live = () => A.products().filter(p => p.active);
  let viewRefresh = null;

  /* ================= header / chrome ================= */
  function chrome() {
    $("#u-phone").innerHTML = I("phone") + " " + C.store.phone;
    const ua = $("#u-addr"); ua.href = C.store.mapsUrl; ua.innerHTML = I("pin") + " " + C.store.street + ", " + C.store.city + ", " + C.store.state + " " + C.store.zip;
    $(".hbtns a[href='#/account']").innerHTML = I("user") + "<span>Account</span>";
    $("#crail").innerHTML = `<a href="#/shop" data-cat="">All products</a><a class="hot" href="#/brands">Shop by brand</a>` +
      CATS.map(c => `<a href="#/shop?cat=${c.id}" data-cat="${c.id}">${c.short}</a>`).join("") + `<a href="#/boxes">Pantry boxes</a>`;
    $("#zipIc").innerHTML = I("pin");
    $(".search .go").innerHTML = I("search") + "<span>Search</span>";
    renderFoot(); renderBnav(); refreshChrome();
  }
  function refreshChrome() {
    const t = A.totals();
    $("#h-cart").innerHTML = I("cart") + `<span><span class="lbl"><small>Cart</small></span><span class="amt">${t.count ? t.count + " item" + (t.count === 1 ? "" : "s") : "Empty"}</span></span>` + (t.count ? `<span class="badge">${t.count}</span>` : "");
    const w = A.wish().length;
    $("#h-wish").innerHTML = I("heart") + "<span>Saved</span>" + (w ? `<span class="badge">${w}</span>` : "");
    const f = A.fulfillment(), m = A.mode();
    const mi = { ship: "truck", pickup: "store", local: "bike" };
    $("#modeSeg").innerHTML = ["ship", "pickup", "local"].filter(k => f[k].active).map(k =>
      `<button type="button" data-act="mode" data-mode="${k}" aria-pressed="${m === k}">${I(mi[k])}${f[k].short}${f[k].proposed ? '<span class="pill">PROPOSED</span>' : ""}</button>`).join("");
    const zi = $("#zip"); if (document.activeElement !== zi) zi.value = A.zip();
    $("#zipForm").style.display = m === "pickup" ? "none" : "";
    const st = A.zipStatus();
    $("#zipMsg").className = "zipmsg " + (st.ok === true ? "ok" : st.ok === false ? "bad" : "");
    $("#zipMsg").innerHTML = (st.ok === true ? I("check") : st.ok === false ? I("alert") : I("info")) + `<span>${esc(st.text)}${st.sub ? `<small>${esc(st.sub)}</small>` : ""}</span>`;
    renderBnav();
  }
  function renderBnav() {
    const h = location.hash || "#/"; const t = A.totals();
    const on = p => (h === p || (p !== "#/" && h.startsWith(p))) ? "on" : "";
    $("#bnav").innerHTML = `<a href="#/" class="${h === "#/" || h === "" ? "on" : ""}">${I("home")}Home</a>
      <a href="#/shop" class="${on("#/shop")}">${I("grid")}Shop</a>
      <button data-act="focus-search">${I("search")}Search</button>
      <a href="#/wishlist" class="${on("#/wishlist")}">${I("heart")}Saved${A.wish().length ? `<span class="badge">${A.wish().length}</span>` : ""}</a>
      <button class="cartb" data-act="open-cart"><span class="bub">${I("cart")}</span>Cart${t.count ? `<span class="badge">${t.count}</span>` : ""}</button>`;
  }
  function dalalMark() {
    const b = C.builder;
    return b.logo ? `<img src="${b.logo}" alt="Dalal Technologies">` :
      `<span class="dalal-wm"><span class="d">D</span><span><b>DALAL</b><i>TECHNOLOGIES</i></span></span>`;
  }
  function renderFoot() {
    const b = C.builder, s = C.store;
    $("#foot").innerHTML = `<div class="cols">
      <div><span class="flogo"><img src="img/logo.png" alt="Africa Supermarket"></span>
        <p style="margin:0">African groceries, spices, beauty and household goods from Columbus, Ohio — proposed for nationwide shipping of eligible pantry items.</p></div>
      <div><h4>Shop</h4>${CATS.filter(c => !c.pending).slice(0, 7).map(c => `<a href="#/shop?cat=${c.id}">${c.short}</a>`).join("")}<a href="#/boxes">Pantry boxes</a></div>
      <div><h4>Help</h4><a href="#/shipping">Shipping & delivery</a><a href="#/shipping">Store pickup</a><a href="#" data-act="bulk">Bulk & event orders</a><a href="#/account">My account (sample)</a><a href="#/about-demo">About this demo</a><a href="dashboard.html">Owner dashboard (demo)</a></div>
      <div><h4>Visit the store</h4><a href="${s.mapsUrl}" target="_blank" rel="noopener">${s.street}<br>${s.city}, ${s.state} ${s.zip}</a><a href="${s.phoneHref}">${s.phone}</a><p style="margin:6px 0 0;color:#8E998D;font-size:13px">${s.hoursNote}</p></div>
    </div>
    <div class="credit">
      <a class="dalal-mark" href="${b.website}" target="_blank" rel="noopener" aria-label="Dalal Technologies">${dalalMark()}</a>
      <div class="contact">Website concept, design & development by <b style="color:#fff">Dalal Technologies</b> — ${esc(b.tagline)}<br>
        <a href="${b.website}" target="_blank" rel="noopener">${b.websiteLabel}</a> · <a href="mailto:${b.email}">${b.email}</a> · <a href="${b.phoneHref}">${b.phone}</a> · ${esc(b.address)}</div>
    </div>
    <p class="disclaim">Demonstration prototype prepared for Africa Supermarket. The branded products shown are demonstration inventory: Africa Supermarket has not confirmed it stocks them, and no store prices, stock levels or shipping eligibility have been set. Brand names and product photographs belong to their respective owners and are used for internal demonstration only; permission or approved manufacturer images are required before public commercial use. Shipping zones, delivery areas and coupons are proposals. No orders are transmitted and no payments are processed. SNAP/EBT online payment is not active. © ${new Date().getFullYear()} Africa Supermarket (brand) · prototype © Dalal Technologies.</p>`;
  }

  /* ================= product card ================= */
  function fchip(p) {
    if (p.ship === true) return `<span class="chip chip-ship">${I("truck")}Ships nationwide</span>`;
    if (p.ship === false) return `<span class="chip chip-local">${I("store")}Pickup / local only</span>`;
    return `<span class="chip chip-tbc">${I("info")}Shipping to be confirmed</span>`;
  }
  function actionsHTML(p) {
    const q = A.qtyOf(p.id);
    if (q) return `<div class="stepper"><button data-act="dec" data-id="${p.id}" aria-label="Decrease">${I("minus")}</button><span>${q} in cart</span><button data-act="inc" data-id="${p.id}" aria-label="Increase">${I("plus")}</button></div>`;
    const ok = A.canFulfill(p).ok;
    return ok ? `<button class="addbtn" data-act="add" data-id="${p.id}">${I("plus")}Add to cart</button>`
      : `<button class="addbtn warn" data-act="add" data-id="${p.id}" title="${esc(A.canFulfill(p).reason)}">${I("store")}Add · pickup/delivery only</button>`;
  }
  function card(p) {
    const w = A.wish().includes(p.id);
    return `<article class="card">
      <a class="media" href="#/p/${p.handle}">${A.art(p)}<span class="demo-tag">Demo item · not confirmed in store</span></a>
      <button class="wishbtn ${w ? "on" : ""}" data-act="wish" data-id="${p.id}" data-wish="${p.id}" aria-label="Save ${esc(p.title)}" aria-pressed="${w}">${I("heart")}</button>
      <div class="body">
        <span class="brand">${esc(p.brand)}</span>
        <a class="t" href="#/p/${p.handle}">${esc(p.title)}</a>
        <span class="s">${p.size ? esc(p.size) : "Size to be confirmed"}</span>
        <div>${fchip(p)}</div>
        <div class="prow">${A.priceHTML(p)}</div>
        <div class="actions" data-actions="${p.id}">${actionsHTML(p)}</div>
      </div></article>`;
  }
  function refreshCards() {
    $$("[data-actions]").forEach(el => { const p = A.product(el.dataset.actions); if (p) el.innerHTML = actionsHTML(p); });
    const w = A.wish();
    $$("[data-wish]").forEach(el => { const on = w.includes(el.dataset.wish); el.classList.toggle("on", on); el.setAttribute("aria-pressed", on); });
  }

  /* ================= views ================= */
  const V = {};

  V.home = () => {
    const P = live(); const by = id => A.product(id);
    const brands = [...new Set(P.map(p => p.brand))].filter(b => b !== "Market pack");
    const staples = ["r08", "r07", "r01", "r10", "r09", "r12", "r03", "r05"].map(by).filter(p => p && p.active);
    const past = ["r08", "r07", "r11", "r05", "r09", "r12"].map(by).filter(p => p && p.active);
    return `
    <section class="hero"><div class="wrap hero-grid">
      <div class="hero-main">
        <span class="eyebrow">Columbus, Ohio · Proposed nationwide shipping</span>
        <h1>The Flavors of Africa, <em>Delivered to Your Door.</em></h1>
        <p class="lead">The brands you grew up with, like Milo, Peak, Maggi, Indomie, Titus, garri and honey beans, ordered online from Africa Supermarket on East Livingston Avenue.</p>
        <div class="hero-ctas"><a class="btn btn-p" href="#/shop">${I("grid")}Shop the pantry</a><a class="btn btn-o" href="#/brands">Shop by brand</a></div>
        <div class="hero-modes">
          <button data-act="mode" data-mode="ship">${I("truck")}<span><b>Ship nationwide</b><small>Eligible pantry items*</small></span></button>
          <button data-act="mode" data-mode="pickup">${I("store")}<span><b>Pick up in store</b><small>Order ahead, collect in Columbus</small></span></button>
          <button data-act="mode" data-mode="local">${I("bike")}<span><b>Local delivery</b><small>Proposed for nearby ZIPs</small></span></button>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-shelf">
          ${["r11", "r08", "r04", "r05", "r09", "r06"].map(by).map((p, i) => `<a class="shelf-item s${i}" href="#/p/${p.handle}">${A.art(p)}<span class="lbl"><b>${esc(p.brand)}</b>${esc(p.title)}</span></a>`).join("")}
          <span class="cap">Demonstration items · availability at Africa Supermarket not yet confirmed</span>
        </div>
        <div class="hero-strip">
          <a class="offer offer-gold" href="#/brands">${I("tag")}<span><b>${brands.length} trusted brands</b><small>Nestlé, Peak, Maggi, Indomie, Titus…</small></span></a>
          <a class="offer offer-fresh" href="#/boxes">${I("box")}<span><b>Pantry boxes</b><small>Proposed bundles for gifts & first orders</small></span></a>
        </div>
      </div>
    </div></section>

    <section class="sec"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Aisles</span><h2>Shop by category</h2></div><a class="more" href="#/shop">All products ${I("arrow")}</a></div>
      <div class="cats">${CATS.map(c => { const items = P.filter(p => p.category === c.id);
        return `<a class="cat" href="#/shop?cat=${c.id}" style="background:${c.tint}"><span class="catstack">${items.slice(0, 3).map(p => A.art(p)).join("")}</span><b>${c.name}</b><small>${items.length} demo item${items.length === 1 ? "" : "s"}</small></a>`; }).join("")}</div>
      <div class="pending-aisles"><span>${I("info")}<b>More aisles once the store's inventory is imported:</b></span>${window.AS_PENDING_AISLES.map(a => `<span class="pa">${a}</span>`).join("")}</div>
    </div></section>

    <section class="sec" style="padding-top:6px"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Cook from home</span><h2>Shop by kitchen</h2><p>Find the staples for the dishes you grew up with.</p></div></div>
      <div class="regions r3">${REG.map(r => { const items = P.filter(p => p.regions.includes(r.id)).slice(0, 4);
        return `<a class="region" href="#/shop?region=${r.id}" style="--hue:${r.hue}"><h3>${r.name}</h3><small>${r.countries}</small><div class="stack">${items.map(p => A.art(p)).join("")}</div><span class="go">${I("arrow")}</span></a>`; }).join("")}</div>
    </div></section>

    <section class="sec" style="padding-top:6px"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Pantry staples</span><h2>Everyday West African essentials</h2><p>Real brands shown for demonstration. Prices and stock will come from the store.</p></div><a class="more" href="#/shop">See all ${I("arrow")}</a></div>
      <div class="rail">${staples.map(card).join("")}</div>
    </div></section>

    <section class="sec"><div class="wrap"><div class="brandband">
      <div class="sec-h"><div><span class="eyebrow" style="color:var(--gold)">Familiar names</span><h2>Shop by brand</h2><p>Brand names belong to their owners. Shown as demonstration inventory only.</p></div><a class="more" href="#/brands" style="color:var(--fresh)">All brands ${I("arrow")}</a></div>
      <div class="brandgrid">${brands.map(b => { const items = P.filter(p => p.brand === b);
        return `<a class="brandtile" href="#/shop?brand=${encodeURIComponent(b)}"><span class="bstack">${items.slice(0, 2).map(p => A.art(p)).join("")}</span><b>${esc(b)}</b><small>${items.length} item${items.length === 1 ? "" : "s"}</small></a>`; }).join("")}</div>
    </div></div></section>

    <section class="sec" id="ship"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Nationwide collection · proposed</span><h2>Packaged pantry staples, shipped from Columbus*</h2><p>The store decides which items ship. Until then, every item shows “shipping to be confirmed”.</p></div></div>
      <div class="shipzone">${shipCard()}<div class="pgrid">${P.slice(0, 8).map(card).join("")}</div></div>
    </div></section>

    <section class="sec" id="boxes"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">New idea · curated</span><h2>African pantry boxes</h2><p>Ready-made bundles: easy gifts, easy first orders. Contents and pricing to be set by the store.</p></div><a class="more" href="#/boxes">All boxes ${I("arrow")}</a></div>
      ${boxesHTML()}
    </div></section>

    <section class="sec"><div class="wrap"><div class="reorder">
      <div class="who"><span class="chip chip-demo" style="align-self:flex-start">Sample returning customer</span><div class="avatar">A</div><h3>Welcome back, Aminata</h3>
        <p style="margin:0;color:var(--ink-2);font-size:14px">Your usual items, one tap away (sample order history).</p>
        <button class="btn btn-d" data-act="reorder-all" style="align-self:flex-start">${I("repeat")}Add all to cart</button>
        <span class="note-demo">${I("info")}Repeat delivery (every 2–6 weeks) is a proposed option, not yet offered.</span></div>
      <div class="relist">${past.map(p => `<div class="reitem">${A.art(p)}<span><b>${esc(p.brand)} ${esc(p.title)}</b><small>${p.size ? esc(p.size) + " · " : ""}${p.price != null ? money(p.price) : "price set by store"}</small></span><button data-act="add" data-id="${p.id}" aria-label="Add ${esc(p.title)} again">${I("plus")}</button></div>`).join("")}</div>
    </div></div></section>

    <section class="sec"><div class="wrap duo">
      <div class="panel panel-gold"><span class="eyebrow" style="color:var(--forest)">Restaurants · events · community groups</span><h3>Need it in bulk?</h3>
        <p>Weddings, naming ceremonies, Eid, church and mosque events, restaurants and caterers. Request a quote for large quantities.</p>
        <div class="uses"><span>Bags of rice</span><span>Cases of evaporated milk</span><span>Party supplies</span><span>Halal meat orders</span></div>
        <button class="btn btn-d" data-act="bulk">Request a bulk quote ${I("arrow")}</button></div>
      <div class="panel panel-white"><span class="eyebrow">Stay in the loop</span><h3>New arrivals in your inbox</h3>
        <p style="color:var(--ink-2)">Restocks of hard-to-find items and store news. One email a week.</p>
        <form class="inline-form" data-form="news"><label class="sr" for="nl">Email</label><input id="nl" type="email" required placeholder="you@email.com"><button class="btn btn-d">Sign up</button></form>
        <p class="note-demo" style="margin-top:10px">${I("info")}Demo form: no email is stored or sent.</p></div>
    </div></section>

    <section class="sec"><div class="wrap">
      <div class="sec-h"><div><span class="eyebrow">Our store</span><h2>Visit us on East Livingston</h2></div><a class="more" href="${C.store.mapsUrl}" target="_blank" rel="noopener">Directions ${I("arrow")}</a></div>
      <div class="store">
        <figure><img src="img/store-front.webp" alt="Africa Supermarket storefront windows with grocery and halal graphics" loading="lazy"><figcaption>Storefront display, Africa Supermarket (from the store's Facebook page)</figcaption></figure>
        <figure><img src="img/store-aisle.webp" alt="Grocery aisle with shelves of African products and flags overhead" loading="lazy"><figcaption>Aisle photo · source to be confirmed by the owner before launch</figcaption></figure>
        <div class="storeinfo"><h3>Africa Supermarket</h3>
          <div class="row">${I("pin")}<span>${C.store.street}<br>${C.store.city}, ${C.store.state} ${C.store.zip}</span></div>
          <div class="row">${I("phone")}<a href="${C.store.phoneHref}">${C.store.phone}</a></div>
          <div class="row">${I("store")}<span>Order online, pick up in store<br><small style="color:#B9CBB6">${C.store.hoursNote}</small></span></div>
          <a class="btn btn-p" href="${C.store.mapsUrl}" target="_blank" rel="noopener" style="margin-top:auto">${I("pin")}Get directions</a></div>
      </div>
    </div></section>`;
  };

  function shipCard() {
    const s = A.shipping();
    return `<aside class="shipcard"><span class="eyebrow">Check your address</span><h3>Where could we ship?</h3>
      <form class="zipf" data-form="zip2" style="width:100%"><span>${I("pin")}</span><input name="z" inputmode="numeric" maxlength="5" placeholder="Your ZIP" value="${esc(A.zip())}" style="flex:1"><button>Check</button></form>
      <ul><li>${I("check")}<span>Packaged, shelf-stable pantry items, once the store approves each one</span></li>
        <li>${I("info")}<span>Shipping cost quoted by the store until prices and package weights are entered</span></li>
        <li class="no">${I("x")}<span>Fresh, frozen, halal meat and glass items would stay pickup or local delivery</span></li></ul>
      <table class="zonetable" aria-label="Proposed shipping zones"><tbody>${s.zones.map(z => `<tr><td>${z.name}</td><td>${z.days} days</td></tr>`).join("")}</tbody></table>
      <p class="note-demo" style="margin-top:10px">${I("info")}*Proposed zones and delivery times for discussion. ${esc(s.blockedNote)}. Real rates would come from the store's carrier account.</p></aside>`;
  }
  function boxesHTML() {
    return `<div class="boxes">${BOXES.map(b => { const items = b.items.map(A.product); const priced = items.every(p => p.price != null);
      return `<article class="boxc"><div class="top" style="--hue:${b.hue}"><span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${I("box")}Proposed bundle</span><h3>${b.title}</h3><small>${b.tag}</small>
        <div class="crate">${items.map(p => A.art(p)).join("")}</div></div>
        <div class="bd"><ul>${items.map(p => `<li>${esc(p.brand)} ${esc(p.title)}${p.size ? ` <span style="color:var(--ink-3)">· ${esc(p.size)}</span>` : ""}</li>`).join("")}</ul>
        <div class="subrow">${I("repeat")}<span><b>Proposed:</b> repeat this box every 4 weeks. Not yet offered.</span></div>
        <div class="prow">${priced ? `<span class="price">${money(items.reduce((s, p) => s + p.price, 0))}</span><span class="note-demo">sum of store prices</span>` : `<span class="price tbd">Bundle price set by store</span>`}</div>
        <button class="btn btn-d" data-act="addbox" data-id="${b.id}">${I("box")}Add box to cart</button></div></article>`; }).join("")}</div>`;
  }

  V.brands = () => {
    const P = live(); const brands = [...new Set(P.map(p => p.brand))].filter(b => b !== "Market pack");
    return `<div class="wrap" style="padding-top:20px"><div class="sec-h"><div><span class="eyebrow">Demonstration inventory</span><h2>Shop by brand</h2><p>Brand names and product photos belong to their owners. Availability at Africa Supermarket is not yet confirmed.</p></div></div>
      ${brands.map(b => `<section class="sec" style="padding:14px 0"><div class="sec-h"><h2 style="font-size:22px">${esc(b)}</h2><a class="more" href="#/shop?brand=${encodeURIComponent(b)}">View ${I("arrow")}</a></div><div class="rail">${P.filter(p => p.brand === b).map(card).join("")}</div></section>`).join("")}</div>`;
  };

  /* ---------- shop / search ---------- */
  function parseQ() { const h = location.hash; const i = h.indexOf("?"); return new URLSearchParams(i >= 0 ? h.slice(i + 1) : ""); }
  function matches(p, q) {
    if (!q) return true; const cat = catById(p.category);
    const hay = (p.brand + " " + p.title + " " + p.desc + " " + p.size + " " + cat.name + " " + p.regions.map(r => (REG.find(y => y.id === r) || {}).name).join(" ")).toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
    return q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter(Boolean).every(w => hay.includes(w));
  }
  function filtered(qs) {
    const cat = qs.get("cat"), q = qs.get("q") || "", region = qs.get("region"), brand = qs.get("brand"), sort = qs.get("sort") || "cat";
    let L = live().filter(p => (!cat || p.category === cat) && (!region || p.regions.includes(region)) && (!brand || p.brand === brand) && matches(p, q));
    const ci = id => CATS.findIndex(c => c.id === id);
    const S = { cat: (a, b) => ci(a.category) - ci(b.category), az: (a, b) => a.title.localeCompare(b.title), brand: (a, b) => a.brand.localeCompare(b.brand) || a.title.localeCompare(b.title) };
    return L.sort(S[sort] || S.cat);
  }
  V.shop = () => {
    const qs = parseQ(); const L = filtered(qs); const cat = catById(qs.get("cat")); const region = REG.find(r => r.id === qs.get("region")); const brand = qs.get("brand");
    const title = qs.get("q") ? `Results for “${esc(qs.get("q"))}”` : cat ? cat.name : region ? region.name : brand ? esc(brand) : "All products";
    const link = (k, v) => { const n = new URLSearchParams(qs); if (v === null || n.get(k) === v) n.delete(k); else n.set(k, v); const s = n.toString(); return "#/shop" + (s ? "?" + s : ""); };
    const base = live(); const brands = [...new Set(base.map(p => p.brand))].filter(b => b !== "Market pack");
    const chips = [];
    if (qs.get("q")) chips.push(["q", "“" + qs.get("q") + "”"]); if (cat) chips.push(["cat", cat.short]); if (region) chips.push(["region", region.name]); if (brand) chips.push(["brand", brand]);
    return `<div class="wrap shop">
      <aside class="filters" id="filters">
        <div><h4>Category</h4><a href="${link("cat", null)}" class="${!cat ? "on" : ""}">All <span class="n">${base.length}</span></a>
          ${CATS.map(c => { const n = base.filter(p => p.category === c.id).length; return n ? `<a href="${link("cat", c.id)}" class="${cat && cat.id === c.id ? "on" : ""}">${c.short}<span class="n">${n}</span></a>` : ""; }).join("")}</div>
        <div><h4>Brand</h4>${brands.map(b => `<a href="${link("brand", b)}" class="${brand === b ? "on" : ""}">${esc(b)}<span class="n">${base.filter(p => p.brand === b).length}</span></a>`).join("")}</div>
        <div><h4>Kitchen</h4>${REG.map(r => `<a href="${link("region", r.id)}" class="${region && region.id === r.id ? "on" : ""}">${r.name}</a>`).join("")}</div>
        <p class="note-demo">${I("info")}${base.length} real branded products shown as demonstration inventory. The store's full catalog would be imported from its inventory records.</p>
        <button class="btn btn-d filter-toggle" data-act="filters">Show ${L.length} results</button>
      </aside>
      <div>
        <div class="toolbar"><h1>${title}</h1><button class="btn btn-o filter-toggle" data-act="filters" style="padding:8px 14px;color:var(--forest)">${I("filter")}Filters</button>
          <label class="sr" for="sort">Sort</label><select id="sort" data-act="sort">${[["cat", "By aisle"], ["brand", "Brand A–Z"], ["az", "Name A–Z"]].map(([v, l]) => `<option value="${v}" ${qs.get("sort") === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        ${chips.length ? `<div class="fchips">${chips.map(([k, l]) => `<a class="fchip" href="${link(k, null)}">${esc(l)} ${I("x")}</a>`).join("")}<a class="fchip" href="#/shop">Clear all</a></div>` : ""}
        <div class="banner banner-info">${I("info")}<span><b>Demonstration inventory.</b> Africa Supermarket has not yet confirmed which of these it stocks. Prices, stock and shipping eligibility will be set by the store.</span></div>
        ${L.length ? `<div class="pgrid">${L.map(card).join("")}</div>` : `<div class="empty">${I("search")}<p><b>No demo products match.</b><br>Try “Milo”, “garri”, “Maggi” or browse a category.</p><a class="btn btn-d" href="#/shop">See all products</a></div>`}
      </div></div>`;
  };

  /* ---------- product detail ---------- */
  V.product = (handle) => {
    const p = A.product(handle); if (!p || !p.active) return `<div class="wrap empty"><p>Product not found.</p><a class="btn btn-d" href="#/shop">Back to shop</a></div>`;
    const cat = catById(p.category), f = A.fulfillment();
    const opt = (icon, label, st, why) => `<div class="fopt ${st === true ? "yes" : st === false ? "no" : "tbc"}">${I(st === false ? "x" : icon)}<span><b>${label}</b><small>${esc(why)}</small></span><span class="st">${st === true ? "Available" : st === false ? "Not available" : "To be confirmed"}</span></div>`;
    const related = live().filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
    const w = A.wish().includes(p.id);
    return `<div class="wrap">
      <div class="pd">
        <div class="gallery">${A.art(p, "art big")}<span class="cap">Product photo: ${esc(p.imageSource || "")} · © brand owner · permission required before public use</span></div>
        <div>
          <nav class="crumbs"><a href="#/">Home</a>/<a href="#/shop?cat=${cat.id}">${cat.name}</a>/<a href="#/shop?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a></nav>
          <span class="brand" style="font-size:14px;margin-top:10px;display:block">${esc(p.brand)}</span>
          <h1>${esc(p.title)}</h1><div class="size">${p.size ? esc(p.size) : "Pack size to be confirmed"}</div>
          <div class="banner banner-info" style="margin:12px 0">${I("info")}<span><b>Demonstration item.</b> Not yet confirmed as stocked by Africa Supermarket.</span></div>
          <div>${A.priceHTML(p, "bigprice")}</div>
          <p style="color:var(--ink-2);font-size:16px">${esc(p.desc)}</p>
          <div class="fopts">
            ${opt("truck", f.ship.label, p.ship, p.ship === true ? "Ships from Columbus" : p.ship === false ? "Store has marked this item pickup/local only" : "Store will confirm shipping eligibility")}
            ${opt("store", f.pickup.label, p.pickup, C.store.street)}
            ${opt("bike", f.local.label + " (proposed)", p.local, "Approved Columbus ZIP codes")}
          </div>
          <div class="buyrow" data-actions="${p.id}" style="display:block">${actionsHTML(p)}</div>
          <div style="display:flex;gap:10px;margin-top:10px"><button class="btn btn-o" style="color:var(--forest);flex:1" data-act="wish" data-id="${p.id}" data-wish="${p.id}">${I("heart")}${w ? "Saved" : "Save for later"}</button></div>
          <div class="specs">
            <div><span>Brand</span><b>${esc(p.brand)}</b></div>
            <div><span>Category</span><b>${cat.name}</b></div>
            <div><span>Stock at Africa Supermarket</span><b>${p.stock == null ? "Not confirmed" : p.stock > 0 ? "In stock" : "Out of stock"}</b></div>
            <div><span>Demo SKU</span><b>${p.sku}</b></div>
          </div>
        </div>
      </div>
      ${related.length ? `<section class="sec"><div class="sec-h"><h2>More in ${cat.short}</h2></div><div class="rail">${related.map(card).join("")}</div></section>` : ""}
    </div>`;
  };

  /* ---------- wishlist ---------- */
  V.wishlist = () => {
    const L = A.wish().map(A.product).filter(Boolean);
    return `<div class="wrap" style="padding-top:20px"><div class="toolbar"><h1>Saved items</h1>${L.length ? `<button class="btn btn-d" data-act="wish-all">${I("cart")}Add all to cart</button>` : ""}</div>
      ${L.length ? `<div class="pgrid">${L.map(card).join("")}</div>` : `<div class="empty">${I("heart")}<p><b>Nothing saved yet.</b><br>Tap the heart on any product to save it here.</p><a class="btn btn-d" href="#/shop">Start shopping</a></div>`}</div>`;
  };

  /* ---------- boxes ---------- */
  V.boxes = () => `<div class="wrap" style="padding-top:20px"><div class="sec-h"><div><span class="eyebrow">Curated · ships nationwide</span><h2>African pantry boxes</h2><p>Bundles built from the demo products. Contents are proposals for the owner to adjust; bundle prices come from the store's own prices.</p></div></div>${boxesHTML()}</div>`;

  /* ---------- shipping info ---------- */
  V.shipping = () => {
    const f = A.fulfillment(), s = A.shipping();
    return `<div class="wrap" style="padding-top:20px;max-width:980px"><span class="eyebrow">Proposed policy · to be finalized with the owner</span><h1 style="font-family:var(--font-d);font-size:36px;margin:6px 0 16px;letter-spacing:-.8px">Shipping, pickup & delivery</h1>
      <div class="shipzone">${shipCard()}<div>
        <div class="step"><h2>${I("truck")}${f.ship.label}</h2><p style="margin:0">Proposed: packaged, shelf-stable items the store approves for shipping, sent from the Columbus store. Rates would be calculated from package weight and destination zone once the store enters prices and weights; until then the store quotes shipping.</p></div>
        <div class="step"><h2>${I("store")}${f.pickup.label}</h2><p style="margin:0">Order ahead and collect at ${C.store.street}. ${f.pickup.readyNote}.</p></div>
        <div class="step"><h2>${I("bike")}${f.local.label} <span class="chip chip-demo">Proposed</span></h2><p style="margin:0">A possible delivery service for nearby ZIP codes (${A.localZips().length} sample ZIPs), ${money(f.local.fee)} fee, ${money(f.local.minOrder)} minimum. Local delivery does not exist yet; it is shown here as an option to evaluate.</p></div>
        <div class="step"><h2>${I("snow")}What can't ship</h2><p style="margin:0">Fresh, refrigerated and frozen foods, halal meat and glass bottles are excluded from nationwide shipping in this demo. Any future perishable shipping would need cold-chain packaging, carrier rules and food-safety review before it's offered.</p></div>
        <div class="step"><h2>${I("info")}SNAP / EBT</h2><p style="margin:0">Online SNAP/EBT payment is <b>not active</b>. It would require USDA authorization for online acceptance and an approved payment provider.</p></div>
      </div></div></div>`;
  };

  /* ---------- account (sample) ---------- */
  V.account = () => {
    const mine = A.orders();
    const sample = [{ id: "SAMPLE-0987", at: Date.now() - 21 * 864e5, total: null, status: "Delivered", mode: "ship", lines: [{ title: "Tropical Sun Fragrant Rice", qty: 1 }, { title: "Afrigrid Ijebu Garri", qty: 2 }, { title: "Nestlé Milo Tin 1.5 kg", qty: 1 }] },
      { id: "SAMPLE-0912", at: Date.now() - 52 * 864e5, total: null, status: "Picked up", mode: "pickup", lines: [{ title: "Peak Evaporated Milk 13 oz", qty: 6 }, { title: "Maggi Chicken Seasoning Cubes", qty: 1 }] }];
    const all = mine.concat(sample);
    const ml = { ship: "Shipped", pickup: "Pickup", local: "Local delivery" };
    return `<div class="wrap" style="padding-top:20px;max-width:980px">
      <div class="toolbar"><h1>My account</h1><span class="chip chip-demo">Sample customer view</span></div>
      <div class="duo"><div class="step"><h2>${I("user")}Aminata D. (sample)</h2><p style="margin:0;color:var(--ink-2)">aminata@example.com · Default: ${A.fulfillment()[A.mode()].label}</p>
        <div class="subrow" style="margin-top:12px">${I("repeat")}<span><b>Proposed feature:</b> Subscribe to regular items and get them every 2, 4 or 6 weeks. Not yet offered.</span></div></div>
        <div class="step"><h2>${I("heart")}Saved items</h2><p style="margin:0 0 10px">${A.wish().length} saved</p><a class="btn btn-d" href="#/wishlist">View saved</a></div></div>
      <h2 style="font-family:var(--font-d);margin:18px 0 10px">Orders</h2>
      ${all.map(o => `<div class="step" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:200px"><b>${o.id}</b> · ${new Date(o.at).toLocaleDateString()} · ${ml[o.mode]}<br><small style="color:var(--ink-3)">${o.lines.map(l => l.qty + "× " + esc(l.title)).join(", ")}</small></div><b>${o.total != null ? money(o.total) : "—"}</b><span class="chip ${o.status === "New" ? "chip-local" : "chip-ship"}">${o.status}</span>${o.id.startsWith("SAMPLE") ? `<button class="btn btn-o" style="color:var(--forest);padding:8px 14px" data-act="reorder-all">${I("repeat")}Reorder</button>` : ""}</div>`).join("")}
    </div>`;
  };

  /* ---------- about demo ---------- */
  V.about = () => {
    const rows = [
      ["Store name, logo, address and phone", "From the store's public Facebook page", "Real"],
      ["Storefront photo", "From the store's Facebook page", "Real"],
      ["Aisle photo", "Supplied; source not yet confirmed", "To verify"],
      ["12 branded products & photos", "Real products; photos from grocery retailer sites (listed in img/products/SOURCES.csv). Not yet confirmed as stocked by this store", "Demo inventory"],
      ["Product photo rights", "Owned by brands/retailers; permission or manufacturer images needed before public use", "To clear"],
      ["Prices, stock, shipping eligibility", "Not set — entered by the store in the owner dashboard", "Store to set"],
      ["Shipping zones, delivery ZIPs, coupons", "Proposed settings for discussion", "Sample"],
      ["Local delivery, subscriptions, pantry boxes", "Proposed services, not offered today", "Proposed"],
      ["Checkout & payment", "Preview only — no payment is collected", "Not connected"],
      ["SNAP / EBT online", "Requires USDA authorization + provider", "Not active"],
      ["Owner dashboard figures", "Sample data", "Sample"]
    ];
    return `<div class="wrap" style="padding-top:20px;max-width:900px"><span class="eyebrow">Transparency</span><h1 style="font-family:var(--font-d);font-size:36px;margin:6px 0 10px;letter-spacing:-.8px">What's real in this demo?</h1>
      <p style="color:var(--ink-2);font-size:16px">This is a working prototype prepared by Dalal Technologies to show how Africa Supermarket could sell online. The products are real, well-known brands sold in African grocery stores, shown as demonstration inventory until the store confirms what it carries and sets its own prices.</p>
      <div class="step" style="padding:6px 18px">${rows.map(([a, b, c]) => `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);align-items:center"><div style="flex:1"><b>${a}</b><br><small style="color:var(--ink-3)">${b}</small></div><span class="chip ${c === "Real" ? "chip-ship" : ["Sample", "Illustrative", "Demo inventory"].includes(c) ? "chip-demo" : "chip-local"}">${c}</span></div>`).join("")}</div>
      <div class="step"><h2>${I("settings")}Built to connect to a proven platform</h2><p style="margin:0">The catalog uses the same fields as Shopify products (handle, SKU, price, weight, inventory, tags), so the store's real inventory can be imported and checkout handled by a proven, PCI-compliant payment system. No custom payment system is built here.</p></div>
      <a class="btn btn-d" href="#/">Back to the store</a></div>`;
  };

  /* ---------- checkout ---------- */
  let coDraft = {};
  V.checkout = () => {
    if (!A.cart().length) return `<div class="wrap empty" style="padding-top:60px">${I("cart")}<p><b>Your cart is empty.</b></p><a class="btn btn-d" href="#/shop">Start shopping</a></div>`;
    const m = A.mode(), f = A.fulfillment();
    const mi = { ship: "truck", pickup: "store", local: "bike" };
    const d = coDraft; const v = k => esc(d[k] || "");
    return `<div class="wrap co"><div>
      <span class="eyebrow">Checkout preview · demo</span><h1>Checkout</h1>
      <div class="banner banner-info" style="margin:8px 0 14px">${I("lock")}<span>This is a preview of the checkout experience. <b>No payment will be taken and no order is sent to the store.</b> In production, payment would be handled by the e-commerce platform's secure checkout.</span></div>
      <div class="step"><h2><span class="n">1</span>Contact</h2><div class="fgrid">
        <div class="field"><label for="c-name">Full name</label><input id="c-name" data-k="name" value="${v("name")}" autocomplete="name" placeholder="Your name"></div>
        <div class="field"><label for="c-phone">Phone</label><input id="c-phone" data-k="phone" value="${v("phone")}" inputmode="tel" autocomplete="tel" placeholder="(555) 555-0100"></div>
        <div class="field full"><label for="c-email">Email for order updates</label><input id="c-email" data-k="email" value="${v("email")}" type="email" autocomplete="email" placeholder="you@email.com"></div></div></div>
      <div class="step"><h2><span class="n">2</span>How would you like your order?</h2>
        <div class="modecards">${["ship", "pickup", "local"].filter(k => f[k].active).map(k => `<button type="button" class="modecard" data-act="mode" data-mode="${k}" aria-pressed="${m === k}">${I(mi[k])}<b>${f[k].label}${f[k].proposed ? " · proposed" : ""}</b><small>${esc(f[k].note)}</small></button>`).join("")}</div>
        <div id="co-mode" style="margin-top:12px"></div></div>
      <div class="step"><h2><span class="n">3</span>Payment</h2>
        <div class="pay">
          <div class="payopt">${I("lock")}<span><b>Credit / debit card, Apple Pay, Google Pay</b><br><small style="color:var(--ink-3)">Via the platform's hosted, PCI-compliant checkout (e.g. Shopify Payments)</small></span><span class="st st-pend">After approval</span></div>
          <div class="payopt">${I("store")}<span><b>Pay at pickup</b><br><small style="color:var(--ink-3)">Optional — owner decides</small></span><span class="st st-pend">Optional</span></div>
          <div class="payopt" style="opacity:.75">${I("info")}<span><b>SNAP / EBT online</b><br><small style="color:var(--ink-3)">Requires USDA online authorization and an approved provider</small></span><span class="st st-off">Not active</span></div>
        </div></div>
    </div>
    <aside class="summary"><div class="step" id="co-sum"></div></aside></div>`;
  };
  V.checkout.after = () => { coRefresh(); };
  function coRefresh() {
    const box = $("#co-mode"); if (!box) return;
    const m = A.mode(), t = A.totals(), st = A.zipStatus(), d = coDraft;
    let h = "";
    if (m === "pickup") h = `<div class="fgrid"><div class="field"><label for="c-pt">Pickup time</label><select id="c-pt" data-k="pickup">${["Today, 4–6 pm", "Today, 6–8 pm", "Tomorrow, 10 am–12 pm", "Tomorrow, 2–4 pm"].map(x => `<option ${d.pickup === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label>Location</label><input value="${C.store.street}, ${C.store.city}" disabled></div></div><p class="note-demo" style="margin-top:8px">${I("info")}Sample time slots — real slots would follow store hours.</p>`;
    else h = `<div class="fgrid"><div class="field full"><label for="c-addr">Street address</label><input id="c-addr" data-k="addr" value="${esc(d.addr || "")}" autocomplete="street-address" placeholder="123 Main St"></div>
      <div class="field"><label for="c-city">City</label><input id="c-city" data-k="city" value="${esc(d.city || "")}" placeholder="City"></div>
      <div class="field"><label for="c-zip">ZIP code</label><input id="c-zip" data-k="zipco" inputmode="numeric" maxlength="5" value="${esc(A.zip())}" placeholder="ZIP"></div></div>
      <div class="banner ${st.ok ? "banner-ok" : st.ok === false ? "banner-warn" : "banner-info"}" style="margin:10px 0 0">${I(st.ok ? "check" : "info")}<span><b>${esc(st.text)}</b>${st.sub ? "<br>" + esc(st.sub) : ""}</span></div>`;
    if (t.blocked.length) h += `<div class="banner banner-warn" style="margin-top:10px">${I("alert")}<span><b>${t.blocked.length} item${t.blocked.length > 1 ? "s" : ""} can't be ${m === "ship" ? "shipped" : "fulfilled this way"}:</b> ${t.blocked.map(l => esc(l.title)).join(", ")}.<br>
      <span style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn btn-d" style="padding:7px 12px;font-size:13px" data-act="mode" data-mode="pickup">Switch to store pickup</button><button class="btn btn-o" style="padding:6px 12px;font-size:13px" data-act="remove-blocked">Remove these items</button></span></span></div>`;
    box.innerHTML = h;
    $("#co-sum").innerHTML = summaryHTML(t, true);
  }
  function summaryHTML(t, full) {
    const ready = !t.blocked.length && t.deliveryOk;
    const cp = t.coupon; const m = A.mode();
    const lp = l => l.price != null ? money(l.price * l.qty) : "Price TBC";
    return `<h2 style="margin-bottom:10px">Order summary · ${t.count} item${t.count === 1 ? "" : "s"}</h2>
      ${full ? t.lines.map(l => `<div class="sumrow"><span>${l.qty}× ${esc((l.brand && !l.isBox ? l.brand + " " : "") + l.title)}${A.canFulfill(l).ok ? "" : ` <span class="chip chip-local">Can't ${m === "ship" ? "ship" : "fulfill"}</span>`}</span><span>${lp(l)}</span></div>`).join("") + '<hr style="border:0;border-top:1px solid var(--line)">' : ""}
      ${t.allPriced ? `<div class="sumrow"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>` : `<div class="sumrow"><span>Subtotal</span><span class="muted">Confirmed by store</span></div>`}
      ${t.discount ? `<div class="sumrow" style="color:var(--ok)"><span>Discount (${cp.code})</span><span>−${money(t.discount)}</span></div>` : ""}
      <div class="sumrow"><span>${esc(t.deliveryLabel)}</span><span class="${t.deliveryOk && !t.deliveryQuoted ? "" : "muted"}">${esc(t.deliveryNote)}</span></div>
      <div class="sumrow tot"><span>Total</span><span>${t.total != null ? money(t.total) : "Confirmed by store"}</span></div>
      ${!t.allPriced ? `<div class="banner banner-info" style="margin:8px 0 0">${I("info")}<span>Store prices aren't set in this demo, so the order goes in as a <b>request</b>: the store confirms prices, availability and ${m === "ship" ? "shipping" : "pickup"} before anyone pays.</span></div>` : ""}
      ${t.pendingShip.length ? `<div class="banner banner-warn" style="margin:8px 0 0">${I("alert")}<span>Shipping eligibility for ${t.pendingShip.length} item${t.pendingShip.length > 1 ? "s" : ""} is still to be confirmed by the store.</span></div>` : ""}
      <form data-form="coupon" style="display:flex;gap:6px;margin:10px 0"><label class="sr" for="cpn">Promo code</label><input id="cpn" name="c" placeholder="Promo code" value="${cp ? cp.code : ""}" style="flex:1;height:40px;border-radius:10px;border:1.5px solid var(--line);padding:0 10px;background:var(--ivory);text-transform:uppercase"><button class="btn btn-o" style="padding:6px 12px;color:var(--forest)">${cp ? "Remove" : "Apply"}</button></form>
      ${cp && cp.unmet ? `<p class="note-demo" style="color:var(--amber)">${I("info")}${cp.needPrices ? cp.code + " will apply once store prices are set." : cp.code + " needs a " + money(cp.minSubtotal) + " subtotal."}</p>` : ""}
      ${full ? `<button class="btn btn-p" style="width:100%;height:52px;font-size:16px" data-act="place" ${ready ? "" : "disabled"}>${I("check")}${t.allPriced ? "Place demo order" : "Send demo order request"}</button>
        ${ready ? `<p class="note-demo" style="margin-top:8px">${I("lock")}Demo only: nothing is charged or sent.</p>` : `<p class="note-demo" style="margin-top:8px;color:var(--amber)">${I("alert")}${t.blocked.length ? "Resolve the items that can't be fulfilled." : "Complete the delivery details above."}</p>`}`
        : `<a class="btn btn-p" href="#/checkout" style="width:100%;height:50px;margin-top:4px" data-act="go-checkout">Checkout ${t.total != null ? money(t.total) : ""} ${I("arrow")}</a>`}`;
  }

  /* ---------- confirmation ---------- */
  V.confirm = (id) => {
    const o = A.orders().find(x => x.id === id); if (!o) return `<div class="wrap empty"><p>Order not found.</p></div>`;
    const ml = { ship: "Nationwide shipping", pickup: "Store pickup", local: "Local delivery" };
    const steps = o.mode === "pickup" ? ["Order received", "Being picked", "Ready for pickup", "Picked up"] : ["Order received", "Packed in Columbus", o.mode === "ship" ? "Shipped with tracking" : "Out for delivery", "Delivered"];
    return `<div class="wrap confirm">
      <div class="hero-ok"><span class="tick">${I("check")}</span><div><span class="eyebrow" style="color:var(--gold)">Demo order · nothing was charged or sent</span><h1>Thank you${o.customer.name ? ", " + esc(o.customer.name.split(" ")[0]) : ""}! ${o.request ? "Order request" : "Order"} ${o.id} is in.</h1><p style="margin:4px 0 0;color:#B9CBB6">${ml[o.mode]}${o.zip && o.mode !== "pickup" ? " to " + o.zip : ""} · ${o.total != null ? money(o.total) : "total confirmed by store"}</p></div></div>
      <div class="timeline">${steps.map((s, i) => `<div class="${i === 0 ? "done" : ""}"><b>${i + 1}. ${s}</b>${i === 0 ? "Just now" : "Pending"}</div>`).join("")}</div>
      <div class="step"><h2>${I("cart")}Items</h2>${o.lines.map(l => `<div class="sumrow"><span>${l.qty}× ${esc(l.title)}</span><span>${l.price != null ? money(l.price * l.qty) : "Price TBC"}</span></div>`).join("")}
        <div class="sumrow tot"><span>Total</span><span>${o.total != null ? money(o.total) : "Confirmed by store"}</span></div></div>
      <div class="step"><h2>${I("info")}What happens next (in the live version)</h2><ul style="margin:0;padding-left:20px;line-height:1.7"><li>The customer gets an email/SMS confirmation.</li>${o.request ? "<li>The store confirms availability and prices, then sends a secure payment link.</li>" : ""}<li>The order appears instantly in the store's <a href="dashboard.html#orders">owner dashboard</a> — try it.</li><li>Staff pick and pack it, print a shipping label, and the customer gets tracking.</li><li>A “buy it again” reminder brings the customer back for their next order.</li></ul></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-d" href="#/">Keep shopping</a><a class="btn btn-o" style="color:var(--forest)" href="dashboard.html#orders">See it in the owner dashboard ${I("arrow")}</a></div></div>`;
  };

  /* ================= cart drawer ================= */
  function drawerHTML() {
    const t = A.totals(), m = A.mode(), f = A.fulfillment();
    if (!t.lines.length) return `<div class="dh"><h2>Your cart</h2><button class="x" data-act="close" aria-label="Close">${I("x")}</button></div><div class="db"><div class="empty">${I("cart")}<p><b>Your cart is empty.</b><br>Add pantry favorites to get started.</p><button class="btn btn-d" data-act="close-shop">Browse products</button></div></div>`;
    const s = A.shipping();
    return `<div class="dh"><h2>Your cart</h2><span class="chip chip-ship">${t.count} item${t.count === 1 ? "" : "s"}</span><button class="x" data-act="close" aria-label="Close">${I("x")}</button></div>
      <div class="db">
        <div class="banner ${t.blocked.length ? "banner-warn" : "banner-ok"}">${I(t.blocked.length ? "alert" : "check")}<span><b>${f[m].label}</b>${m !== "pickup" && !A.zip() ? " · enter your ZIP above for rates" : ""}${t.blocked.length ? `<br>${t.blocked.length} item${t.blocked.length > 1 ? "s" : ""} can't be ${m === "ship" ? "shipped" : "fulfilled this way"}. <button data-act="mode" data-mode="pickup" style="text-decoration:underline;font-weight:800">Switch to pickup</button>` : ""}</span></div>
        ${m === "ship" && t.allPriced ? (t.freeLeft > 0 ? `<div style="font-size:13px;margin-bottom:10px"><b>${money(t.freeLeft)}</b> away from free shipping (sample threshold)<div class="progress"><i style="width:${Math.min(100, t.subtotal / s.freeThreshold * 100)}%"></i></div></div>` : `<div class="banner banner-ok">${I("truck")}<span>You've unlocked free shipping (sample).</span></div>`) : ""}
        ${t.lines.map(l => { const ok = A.canFulfill(l).ok;
          return `<div class="line ${ok ? "" : "blocked"}">${A.art(l)}
            <div class="info"><b>${esc((l.brand && !l.isBox ? l.brand + " " : "") + l.title)}</b><small>${l.size ? esc(l.size) + " · " : ""}${l.price != null ? money(l.price) : "price set by store"}</small>${ok ? "" : `<div class="warnmsg">${I("alert")}${esc(A.canFulfill(l).reason)}</div>`}</div>
            <div class="r"><b>${l.price != null ? money(l.price * l.qty) : ""}</b><div class="qty"><button data-act="setq" data-key="${l.key}" data-q="${l.qty - 1}" aria-label="Decrease">${I(l.qty === 1 ? "x" : "minus")}</button><span>${l.qty}</span><button data-act="setq" data-key="${l.key}" data-q="${l.qty + 1}" aria-label="Increase">${I("plus")}</button></div></div></div>`; }).join("")}
      </div>
      <div class="df">${summaryHTML(t, false)}</div>`;
  }
  function openDrawer() { $("#toast").classList.remove("on"); $("#drawer").innerHTML = drawerHTML(); $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on"); }
  function closeAll() { $("#drawer").classList.remove("on"); $("#drawer").setAttribute("aria-hidden", "true"); $("#modal").classList.remove("on"); $("#scrim").classList.remove("on"); const fl = $("#filters"); if (fl) fl.classList.remove("on"); }
  function openModal(html) { $("#modal").innerHTML = html; $("#modal").classList.add("on"); $("#scrim").classList.add("on"); }

  let toastT;
  function toast(html) { const t = $("#toast"); t.innerHTML = I("check") + "<span>" + html + "</span>"; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }

  function bulkModal() {
    openModal(`<button class="x" data-act="close" aria-label="Close" style="float:right;width:36px;height:36px;border-radius:50%;background:var(--ivory);display:grid;place-items:center">${I("x")}</button>
      <span class="eyebrow">Bulk & special orders</span><h3>Request a quote</h3><p style="color:var(--ink-2);margin:0 0 12px">For restaurants, caterers, events and community organizations. The store replies with availability and pricing.</p>
      <form data-form="bulk"><div class="fgrid">
        <div class="field"><label for="b1">Name</label><input id="b1" required></div><div class="field"><label for="b2">Phone or email</label><input id="b2" required></div>
        <div class="field"><label for="b3">Type</label><select id="b3"><option>Event / celebration</option><option>Restaurant / caterer</option><option>Church / mosque / community</option><option>Other</option></select></div>
        <div class="field"><label for="b4">Needed by</label><input id="b4" type="date"></div>
        <div class="field full"><label for="b5">What do you need?</label><textarea id="b5" placeholder="e.g. 4 × 50 lb rice, 2 cases palm oil, 20 lb goat meat"></textarea></div></div>
        <button class="btn btn-d" style="margin-top:12px;width:100%">Send request (demo)</button>
        <p class="note-demo" style="margin-top:8px">${I("info")}Demo: requests aren't sent. In production they'd arrive by email and in the owner dashboard.</p></form>`);
  }

  /* ================= search suggest ================= */
  let sel = -1;
  function suggest() {
    const q = $("#q").value.trim(); const box = $("#suggest");
    if (q.length < 2) { box.classList.remove("on"); return; }
    const L = live().filter(p => matches(p, q)).slice(0, 6);
    const cats = CATS.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 2);
    box.innerHTML = cats.map(c => `<a href="#/shop?cat=${c.id}" role="option">${A.icon("grid")}<span><b>${c.name}</b><small>Category</small></span></a>`).join("") +
      (L.length ? L.map(p => `<a href="#/p/${p.handle}" role="option">${A.art(p)}<span><b>${esc(p.brand)} ${esc(p.title)}</b><small>${p.size ? esc(p.size) + " · " : ""}Demo item</small></span></a>`).join("") : `<div style="padding:10px;color:var(--ink-3)">No demo products match “${esc(q)}”.</div>`) +
      `<a href="#/shop?q=${encodeURIComponent(q)}" role="option" style="justify-content:center;font-weight:800;color:var(--forest)">See all results ${I("arrow")}</a>`;
    box.classList.add("on"); sel = -1;
  }

  /* ================= router ================= */
  function route() {
    const h = location.hash.replace(/^#/, "") || "/";
    const path = h.split("?")[0]; const parts = path.split("/").filter(Boolean);
    let html, after = null; viewRefresh = null;
    if (!parts.length) { html = V.home(); after = V.home.after; }
    else if (parts[0] === "shop") html = V.shop();
    else if (parts[0] === "p") html = V.product(parts[1]);
    else if (parts[0] === "wishlist") html = V.wishlist();
    else if (parts[0] === "boxes") html = V.boxes();
    else if (parts[0] === "brands") html = V.brands();
    else if (parts[0] === "shipping") html = V.shipping();
    else if (parts[0] === "account") html = V.account();
    else if (parts[0] === "about-demo") html = V.about();
    else if (parts[0] === "checkout") { html = V.checkout(); after = V.checkout.after; viewRefresh = coRefresh; }
    else if (parts[0] === "confirm") html = V.confirm(parts[1]);
    else html = V.home();
    if (parts[0] === "shop" || parts[0] === "wishlist") viewRefresh = () => { if (parts[0] === "wishlist") { $("#view").innerHTML = V.wishlist(); } else refreshShopBanner(); };
    $("#view").innerHTML = html; if (after) after();
    $$("#crail a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + h));
    $("#suggest").classList.remove("on"); closeAll();
    window.scrollTo(0, 0); renderBnav();
    if (parts[0] === "shop" && parseQ().get("q")) $("#q").value = parseQ().get("q");
  }
  function refreshShopBanner() { /* simple: re-render shop when mode changes */ const y = window.scrollY; $("#view").innerHTML = V.shop(); window.scrollTo(0, y); }

  /* ================= events ================= */
  let lastMode = A.mode();
  A.on(() => {
    refreshChrome(); refreshCards();
    if ($("#drawer").classList.contains("on")) $("#drawer").innerHTML = drawerHTML();
    const modeChanged = A.mode() !== lastMode; lastMode = A.mode();
    if (viewRefresh && (modeChanged || viewRefresh === coRefresh || location.hash.startsWith("#/wishlist"))) viewRefresh();
  });

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) {
      if (!e.target.closest("#search")) $("#suggest").classList.remove("on"); return; }
    const a = el.dataset.act, id = el.dataset.id;
    if (el.tagName === "SELECT") return;
    switch (a) {
      case "add": { const p = A.product(id); A.addToCart(id); const ok = A.canFulfill(p).ok;
        toast(`Added <b>${esc(p.brand)} ${esc(p.title)}</b>${ok ? "" : " · pickup/local only"} · <a href="#" data-act="open-cart">View cart</a>`); if (el.closest(".reitem")) { el.classList.add("done"); el.innerHTML = I("check"); } break; }
      case "inc": A.addToCart(id); break;
      case "dec": A.setQty(id, A.qtyOf(id) - 1); break;
      case "setq": A.setQty(el.dataset.key, +el.dataset.q); break;
      case "wish": { const on = A.toggleWish(id); toast(on ? "Saved for later" : "Removed from saved"); break; }
      case "wish-all": A.wish().forEach(w => A.addToCart(w)); toast("Saved items added to cart"); break;
      case "addbox": { A.addBox(id); const b = BOXES.find(x => x.id === id); toast(`Added <b>${esc(b.title)}</b> · <a href="#" data-act="open-cart">View cart</a>`); break; }
      case "reorder-all": ["r08", "r07", "r11", "r05", "r09", "r12"].forEach(x => A.addToCart(x)); toast("Usual items added · <a href='#' data-act='open-cart'>View cart</a>"); break;
      case "mode": e.preventDefault(); A.setMode(el.dataset.mode); if (el.closest(".hero-modes")) { toast(A.fulfillment()[el.dataset.mode].label + " selected"); if (el.dataset.mode !== "pickup") $("#zip").focus(); } break;
      case "open-cart": e.preventDefault(); openDrawer(); break;
      case "close": closeAll(); break;
      case "close-shop": closeAll(); location.hash = "#/shop"; break;
      case "go-checkout": closeAll(); break;
      case "focus-search": $("#q").focus(); window.scrollTo(0, 0); break;
      case "filters": $("#filters").classList.toggle("on"); $("#scrim").classList.toggle("on", $("#filters").classList.contains("on")); break;
      case "bulk": e.preventDefault(); bulkModal(); break;
      case "remove-blocked": A.totals().blocked.forEach(l => A.setQty(l.key, 0)); break;
      case "place": {
        const o = A.placeOrder({ name: coDraft.name || "", email: coDraft.email || "", phone: coDraft.phone || "", addr: coDraft.addr || "", city: coDraft.city || "", pickup: coDraft.pickup || "" });
        coDraft = {}; location.hash = "#/confirm/" + o.id; break; }
    }
  });
  $("#scrim").addEventListener("click", closeAll);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
    if (e.key === "P" && e.shiftKey && e.altKey) location.href = "present.html";
  });
  document.addEventListener("change", e => {
    if (e.target.id === "sort") { const qs = parseQ(); qs.set("sort", e.target.value); location.hash = "#/shop?" + qs.toString(); }
    if (e.target.dataset.k === "pickup") coDraft.pickup = e.target.value;
  });
  document.addEventListener("input", e => {
    const k = e.target.dataset.k; if (!k) return;
    if (k === "zipco") { const z = e.target.value.replace(/\D/g, "").slice(0, 5); e.target.value = z; if (z.length === 5 || z.length === 0) { A.setZip(z); setTimeout(() => { const n = $("#c-zip"); if (n) { n.focus(); n.setSelectionRange(5, 5); } }, 0); } return; }
    coDraft[k] = e.target.value;
  });
  document.addEventListener("submit", e => {
    const f = e.target; const k = f.dataset.form;
    if (f.id === "search") { e.preventDefault(); const q = $("#q").value.trim(); location.hash = q ? "#/shop?q=" + encodeURIComponent(q) : "#/shop"; $("#q").blur(); return; }
    if (f.id === "zipForm") { e.preventDefault(); A.setZip($("#zip").value.replace(/\D/g, "").slice(0, 5)); return; }
    if (!k) return; e.preventDefault();
    if (k === "zip2") { A.setZip(f.z.value.replace(/\D/g, "").slice(0, 5)); if (A.mode() === "pickup") A.setMode("ship"); toast(A.zipStatus().text); }
    if (k === "news") { f.reset(); toast("Demo: thanks! (No email stored — mailing platform to be connected.)"); }
    if (k === "bulk") { closeAll(); toast("Demo: bulk request captured (not sent)."); }
    if (k === "coupon") { if (A.appliedCoupon()) { A.removeCoupon(); } else { const r = A.applyCoupon(f.c.value); toast(r.msg); } }
  });
  $("#q").addEventListener("input", suggest);
  $("#q").addEventListener("focus", suggest);
  $("#q").addEventListener("keydown", e => {
    const items = $$("#suggest a"); if (!items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle("sel", i === sel)); }
    if (e.key === "Enter" && sel >= 0) { e.preventDefault(); location.hash = items[sel].getAttribute("href"); $("#q").blur(); }
  });
  $("#zip").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 5); if (e.target.value.length === 5) A.setZip(e.target.value); });

  /* presenter trigger: triple-tap the hidden corner, or Alt+Shift+P */
  let taps = 0, tapT;
  $("#ptrig").addEventListener("click", () => { taps++; clearTimeout(tapT); tapT = setTimeout(() => taps = 0, 900); if (taps >= 3) location.href = "present.html"; });

  window.addEventListener("hashchange", route);
  chrome(); route();
})();
