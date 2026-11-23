/*
 * Africa Supermarket demo — shared data layer (storefront + dashboard)
 * Dalal Technologies. All data is demonstration data.
 *
 * Storage keys (browser localStorage, this device only):
 *   as_cart, as_wish, as_mode, as_zip, as_orders, as_overrides, as_coupon
 * In production, cart/checkout/orders would be handled by Shopify
 * (Storefront API cart + hosted checkout) and products by the Admin API.
 */
(function () {
  const C = window.AS_CONFIG;
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- overrides from the owner dashboard ---------- */
  function overrides() { return LS.get("as_overrides", { products: {}, shipping: null, localZips: null, coupons: null, fulfillment: null }); }
  function saveOverrides(o) { LS.set("as_overrides", o); emit(); }

  function storageRule(s) { return C.storageRules[s] || C.storageRules.ambient; }

  function products() {
    const o = overrides().products || {};
    return window.AS_PRODUCTS.map(p => {
      const base = Object.assign({}, p);
      base.pickup = true; base.local = true; base.active = true;
      Object.assign(base, o[p.id] || {});
      return base;
    });
  }
  function product(id) { return products().find(p => p.id === id || p.handle === id); }
  function shipping() { return Object.assign({}, C.shipping, overrides().shipping || {}); }
  function localZips() { return overrides().localZips || C.localZips; }
  function coupons() { return overrides().coupons || C.coupons; }
  function fulfillment() {
    const f = JSON.parse(JSON.stringify(C.fulfillment)); const o = overrides().fulfillment || {};
    Object.keys(o).forEach(k => Object.assign(f[k], o[k])); return f;
  }

  /* ---------- events ---------- */
  const subs = [];
  function on(fn) { subs.push(fn); }
  function emit() { subs.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
  window.addEventListener("storage", emit);

  /* ---------- formatting ---------- */
  const money = n => "$" + (Math.round(n * 100) / 100).toFixed(2);
  const money0 = n => "$" + Math.round(n).toLocaleString("en-US");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- fulfillment mode + ZIP ---------- */
  function mode() { return LS.get("as_mode", "ship"); }
  function setMode(m) { LS.set("as_mode", m); emit(); }
  function zip() { return LS.get("as_zip", ""); }
  function setZip(z) { LS.set("as_zip", z); emit(); }

  function zoneFor(z) {
    const s = shipping();
    if (!/^\d{5}$/.test(z)) return null;
    if ((s.blockedZipPrefixes || []).some(p => z.startsWith(p))) return { blocked: true };
    return s.zones.find(zz => zz.zipFirstDigits.includes(z[0])) || null;
  }
  /* Describe what the current ZIP means for the current mode. */
  function zipStatus(m, z) {
    m = m || mode(); z = z === undefined ? zip() : z;
    if (m === "pickup") return { ok: true, text: "Pick up at " + C.store.street, sub: fulfillment().pickup.readyNote };
    if (!z) return { ok: null, text: m === "local" ? "Enter ZIP to check delivery" : "Enter ZIP for shipping rates" };
    if (!/^\d{5}$/.test(z)) return { ok: false, text: "Enter a 5-digit US ZIP" };
    if (m === "local") {
      return localZips().includes(z)
        ? { ok: true, text: "Local delivery available to " + z, sub: fulfillment().local.windowNote }
        : { ok: false, text: z + " is outside the sample delivery area", sub: "Try store pickup or nationwide shipping" };
    }
    const zn = zoneFor(z);
    if (!zn) return { ok: false, text: "ZIP not recognized" };
    if (zn.blocked) return { ok: false, text: "Shipping to " + z + " not offered in this demo", sub: shipping().blockedNote };
    return { ok: true, text: "Ships to " + z + " · " + zn.days + " business days", sub: zn.name, zone: zn };
  }

  /* Can product p be fulfilled with mode m? */
  function canFulfill(p, m) {
    m = m || mode();
    if (m === "ship") return p.ship === false ? { ok: false, reason: "Store has marked this item as not shippable" } : { ok: true, pending: p.ship !== true };
    if (m === "pickup") return p.pickup ? { ok: true } : { ok: false, reason: "Not available for pickup" };
    if (m === "local") return p.local ? { ok: true } : { ok: false, reason: "Not available for local delivery" };
    return { ok: true };
  }

  /* ---------- cart ---------- */
  function cart() { return LS.get("as_cart", []); } // [{id, qty} | {box, qty}]
  function saveCart(c) { LS.set("as_cart", c); if (c.length) LS.set("as_cart_touched", Date.now()); emit(); }
  function addToCart(id, qty = 1) {
    const c = cart(); const it = c.find(i => i.id === id);
    if (it) it.qty = Math.min(99, it.qty + qty); else c.push({ id, qty });
    saveCart(c);
  }
  function addBox(boxId) {
    const c = cart(); const it = c.find(i => i.box === boxId);
    if (it) it.qty += 1; else c.push({ box: boxId, qty: 1 }); saveCart(c);
  }
  function setQty(key, qty) {
    let c = cart();
    c.forEach(i => { if ((i.id || i.box) === key) i.qty = qty; });
    c = c.filter(i => i.qty > 0); saveCart(c);
  }
  function qtyOf(id) { const i = cart().find(x => x.id === id); return i ? i.qty : 0; }
  function clearCart() { saveCart([]); LS.del("as_coupon"); }

  function cartLines() {
    return cart().map(i => {
      if (i.box) {
        const b = window.AS_BOXES.find(x => x.id === i.box); if (!b) return null;
        const items = b.items.map(product).filter(Boolean);
        const price = items.every(p => p.price != null) ? items.reduce((s, p) => s + p.price, 0) : null;
        const weight = items.every(p => p.weightLb != null) ? items.reduce((s, p) => s + p.weightLb, 0) : null;
        const ship = items.some(p => p.ship === false) ? false : items.every(p => p.ship === true) ? true : null;
        return { key: b.id, box: b, title: b.title, brand: "Bundle", size: items.length + " items · proposed bundle", price, qty: i.qty,
          weightLb: weight, ship, pickup: true, local: true, storage: "ambient", isBox: true, items };
      }
      const p = product(i.id); if (!p) return null;
      return Object.assign({ key: p.id, qty: i.qty, product: p }, p);
    }).filter(Boolean);
  }

  /* ---------- coupons ---------- */
  function appliedCoupon() { return LS.get("as_coupon", ""); }
  function applyCoupon(code) {
    code = (code || "").trim().toUpperCase();
    const cp = coupons().find(c => c.code === code);
    if (!cp) return { ok: false, msg: "Code not found (try WELCOME10)" };
    if (!cp.active) return { ok: false, msg: "This code is paused by the store" };
    LS.set("as_coupon", code); emit(); return { ok: true, msg: cp.note };
  }
  function removeCoupon() { LS.del("as_coupon"); emit(); }

  /* ---------- totals ---------- */
  function totals(m, z) {
    m = m || mode(); z = z === undefined ? zip() : z;
    const lines = cartLines();
    const priced = lines.filter(l => l.price != null), unpriced = lines.filter(l => l.price == null);
    const allPriced = !unpriced.length && lines.length > 0;
    const subtotal = priced.reduce((s, l) => s + l.price * l.qty, 0);
    const blocked = lines.filter(l => !canFulfill(l, m).ok);
    const pendingShip = m === "ship" ? lines.filter(l => l.ship !== true && l.ship !== false) : [];
    let discount = 0, freeShip = false, coupon = null;
    const code = appliedCoupon();
    if (code) {
      coupon = coupons().find(c => c.code === code && c.active);
      if (coupon && allPriced && subtotal >= coupon.minSubtotal) {
        if (coupon.type === "percent") discount = subtotal * coupon.value / 100;
        if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal);
        if (coupon.type === "freeship") freeShip = true;
      } else if (coupon) { coupon = Object.assign({ unmet: true, needPrices: !allPriced }, coupon); }
    }
    let delivery = 0, deliveryLabel = "", deliveryNote = "", deliveryOk = true, deliveryQuoted = false;
    const s = shipping(), f = fulfillment();
    if (m === "pickup") { delivery = f.pickup.fee || 0; deliveryLabel = "Store pickup"; deliveryNote = "Free"; }
    if (m === "local") {
      deliveryLabel = "Local delivery";
      const st = zipStatus("local", z);
      if (!st.ok) { deliveryOk = false; deliveryNote = st.ok === null ? "Enter ZIP" : "Not available"; }
      else if (allPriced && subtotal < f.local.minOrder) { deliveryOk = false; deliveryNote = money(f.local.minOrder) + " minimum"; delivery = f.local.fee; }
      else { delivery = f.local.fee; deliveryNote = money(delivery); }
    }
    if (m === "ship") {
      deliveryLabel = "Shipping";
      const st = zipStatus("ship", z);
      if (!st.ok) { deliveryOk = false; deliveryNote = st.ok === null ? "Enter ZIP" : "Not available"; }
      else {
        const shippable = lines.filter(l => l.ship !== false);
        const knownW = shippable.every(l => l.weightLb != null);
        deliveryLabel = "Shipping · " + st.zone.id + " · " + st.zone.days + " days";
        if (!knownW || !allPriced) { deliveryQuoted = true; deliveryNote = "Quoted by store"; }
        else {
          const w = shippable.reduce((a, l) => a + l.weightLb * l.qty, 0);
          const packages = Math.max(1, Math.ceil(w / s.maxPackageLb));
          delivery = st.zone.base * packages + st.zone.perLb * w + s.handlingFee;
          if (freeShip || subtotal >= s.freeThreshold) delivery = 0;
          deliveryNote = delivery === 0 ? "Free" : money(delivery);
        }
      }
    }
    const total = allPriced ? Math.max(0, subtotal - discount) + (deliveryOk && !deliveryQuoted ? delivery : 0) : null;
    return { lines, subtotal, allPriced, unpriced, blocked, pendingShip, discount, coupon, delivery, deliveryLabel, deliveryNote, deliveryOk, deliveryQuoted, total,
      count: lines.reduce((s2, l) => s2 + l.qty, 0), freeLeft: (m === "ship" && allPriced) ? Math.max(0, s.freeThreshold - subtotal) : 0 };
  }

  /* ---------- wishlist ---------- */
  function wish() { return LS.get("as_wish", []); }
  function toggleWish(id) { const w = wish(); const i = w.indexOf(id); if (i >= 0) w.splice(i, 1); else w.push(id); LS.set("as_wish", w); emit(); return i < 0; }

  /* ---------- orders (demo) ---------- */
  function orders() { return LS.get("as_orders", []); }
  function placeOrder(info) {
    const t = totals(); const list = orders();
    const num = "DEMO-" + (1041 + list.length);
    const o = { id: num, at: Date.now(), mode: mode(), zip: zip(), customer: info, status: "New",
      lines: t.lines.map(l => ({ id: l.key, title: (l.brand && !l.isBox ? l.brand + " " : "") + l.title, qty: l.qty, price: l.price })), request: !t.allPriced,
      subtotal: t.subtotal, discount: t.discount, delivery: t.delivery, total: t.total, coupon: t.coupon && !t.coupon.unmet ? t.coupon.code : null };
    list.unshift(o); LS.set("as_orders", list); clearCart(); return o;
  }
  function setOrderStatus(id, st) { const l = orders(); const o = l.find(x => x.id === id); if (o) { o.status = st; LS.set("as_orders", l); emit(); } }

  /* ---------- product art (SVG illustrations, not photographs) ---------- */
  /* Product photo (real branded image). If the file is missing, a plain
     "photo pending" tile is shown — never an illustrated package. */
  function art(p, cls) {
    if (p.isBox || p.box) return `<span class="ph ${cls || "art"} boxph" style="background:${(p.box || p).hue}">${icon("box")}</span>`;
    const alt = esc((p.brand ? p.brand + " " : "") + p.title + (p.size ? " " + p.size : ""));
    return `<span class="ph ${cls || "art"}"><img src="${esc(p.image || "")}" alt="${alt}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('nophoto')"><span class="phf"><b>${esc(p.brand || "")}</b><small>Product photo pending</small></span></span>`;
  }
  function priceHTML(p, cls) {
    return p.price != null ? `<span class="price ${cls || ""}">${money(p.price)}</span>` : `<span class="price tbd ${cls || ""}">Price set by store</span>`;
  }

  /* ---------- small icon set (stroke icons) ---------- */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    cart: '<path d="M3 4h2l2.4 11h10.8L21 7H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    truck: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    store: '<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9c0 2 1.4 3 3 3s3-1 3-3c0 2 1.4 3 2 3s2-1 2-3c0 2 1.4 3 3 3s3-1 3-3M10 20v-5h4v5"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8H8M13 8l-3 8"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0114 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    repeat: '<path d="M4 9a7 7 0 0112-3l2 2M20 15a7 7 0 01-12 3l-2-2"/><path d="M18 4v4h-4M6 20v-4h4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-4 4-6 7-6s6 2 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 1.5 5 5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'
  };
  function icon(n, cls) { return `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`; }

  /* ---------- category illustrations ---------- */
  function catArt(id) {
    const g = {
      grain: '<path d="M22 30c0-6 4-9 8-9h20c4 0 8 3 8 9l4 30c0 6-4 9-9 9H27c-5 0-9-3-9-9z" fill="#F2EAD3" stroke="#143B2B" stroke-width="2.5"/><path d="M28 22c4 5 20 5 24 0" stroke="#143B2B" stroke-width="2.5" fill="none"/><path d="M40 36l5 5-5 5-5-5z" fill="#D7A849"/>',
      spice: '<rect x="20" y="22" width="18" height="8" rx="2" fill="#D7A849"/><rect x="18" y="30" width="22" height="36" rx="5" fill="#B5441F"/><rect x="44" y="30" width="16" height="6" rx="2" fill="#143B2B"/><rect x="42" y="36" width="20" height="30" rx="5" fill="#E9C46A"/><circle cx="29" cy="48" r="5" fill="#F9F6EC"/>',
      bottle: '<rect x="34" y="12" width="12" height="9" rx="2" fill="#D7A849"/><path d="M35 21h10v9c7 3 11 8 11 15v20c0 4-3 6-6 6H30c-3 0-6-2-6-6V45c0-7 4-12 11-15z" fill="#C2410C"/><rect x="28" y="44" width="24" height="12" rx="2" fill="#F9F6EC"/>',
      bean: '<ellipse cx="30" cy="44" rx="10" ry="7" transform="rotate(-25 30 44)" fill="#7A3B1D"/><ellipse cx="48" cy="38" rx="10" ry="7" transform="rotate(20 48 38)" fill="#F5EFE0" stroke="#202720" stroke-width="2"/><circle cx="48" cy="38" r="2.4" fill="#202720"/><ellipse cx="44" cy="56" rx="10" ry="7" fill="#B07A43"/>',
      snack: '<path d="M18 22h28l-2 6 2 38H18l2-38z" fill="#80B943"/><rect x="18" y="22" width="28" height="5" fill="#143B2B"/><path d="M50 34h14l-2 32H52z" fill="#3B2416"/><rect x="52" y="44" width="10" height="8" fill="#D7A849"/>',
      leaf: '<path d="M18 62C18 34 38 18 62 18c0 26-16 44-44 44z" fill="#5E7D3A"/><path d="M18 62L50 30" stroke="#F9F6EC" stroke-width="2.5"/><path d="M50 60c0-10 6-16 14-16 0 10-6 16-14 16z" fill="#7A1E3A"/>',
      drop: '<path d="M40 14s-16 18-16 32a16 16 0 0032 0c0-14-16-32-16-32z" fill="#D7A849"/><rect x="48" y="44" width="18" height="22" rx="5" fill="#F3E7C4" stroke="#143B2B" stroke-width="2"/><path d="M33 46a7 7 0 007 7" stroke="#fff" stroke-width="2.5" fill="none"/>',
      home: '<path d="M14 40l26-20 26 20v24H14z" fill="#E1E6DD" stroke="#143B2B" stroke-width="2.5"/><rect x="34" y="46" width="12" height="18" fill="#D7A849"/><path d="M48 26c8-4 14 4 10 10" stroke="#2F7A5A" stroke-width="5" fill="none" stroke-linecap="round"/>',
      produce: '<path d="M16 60c6-26 26-38 44-36-10 8-26 22-30 40z" fill="#6FA83A" stroke="#2F5A1E" stroke-width="2"/><path d="M26 64c6-22 22-32 38-30-8 8-22 18-26 34z" fill="#80B943" stroke="#2F5A1E" stroke-width="2"/><circle cx="56" cy="58" r="8" fill="#D7261E"/>',
      frozen: '<rect x="18" y="18" width="44" height="48" rx="6" fill="#B8D3E0" stroke="#143B2B" stroke-width="2"/><path d="M40 26v32M28 34l24 16M52 34L28 50" stroke="#143B2B" stroke-width="2.5" stroke-linecap="round"/>',
      cloth: '<path d="M18 30c12-10 32-10 44 0v26c-12 10-32 10-44 0z" fill="#D7A849"/>' + [36, 46].map(y => [28, 40, 52].map(x => `<path d="M${x} ${y - 4}l4 4-4 4-4-4z" fill="#143B2B"/>`).join("")).join("")
    }[id] || "";
    return `<svg class="catart" viewBox="0 0 80 80" aria-hidden="true">${g}</svg>`;
  }

  window.AS = { C, LS, on, emit, money, money0, esc, products, product, shipping, localZips, coupons, fulfillment, overrides, saveOverrides,
    storageRule, priceHTML, mode, setMode, zip, setZip, zoneFor, zipStatus, canFulfill, cart, addToCart, addBox, setQty, qtyOf, clearCart, cartLines,
    appliedCoupon, applyCoupon, removeCoupon, totals, wish, toggleWish, orders, placeOrder, setOrderStatus, art, icon, catArt };
})();
