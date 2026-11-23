/* Africa Supermarket — owner dashboard (demo) · Dalal Technologies
 * All figures are SIMULATED sample data generated in the browser.
 * In production this view would read orders, products, customers and
 * discounts from the e-commerce platform's Admin API (e.g. Shopify).
 */
(function () {
  const A = window.AS, C = A.C, I = A.icon, esc = A.esc, money = A.money, money0 = A.money0;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const COL = { ship: "#2E7D4F", pickup: "#C98A1B", local: "#3D6FB0" };
  const MODE = { ship: "Shipped", pickup: "Pickup", local: "Local delivery" };
  const MI = { ship: "truck", pickup: "store", local: "bike" };

  /* ---------------- simulated data ---------------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = rng(20261122);
  const pick = a => a[Math.floor(R() * a.length)];
  const FIRST = ["Aminata", "Kwame", "Fatima", "Chinedu", "Hodan", "Abena", "Ibrahima", "Ngozi", "Mohamed", "Yaa", "Tolu", "Awa", "Hassan", "Efua", "Samuel", "Asha", "Kofi", "Mariama", "Daniel", "Hawa", "Emeka", "Fadumo", "Grace", "Ousmane", "Ruth", "Ali", "Esi", "Musa", "Adaeze", "Sahra", "Joseph", "Binta", "Peter", "Zainab", "Kemi", "Abdi", "Akosua", "Moussa", "Lydia", "Nasra"];
  const LAST = ["D.", "M.", "O.", "A.", "B.", "K.", "S.", "T.", "N.", "W.", "F.", "J."];
  const STATES = [["OH", 60, "Columbus"], ["NY", 9, "Bronx"], ["TX", 8, "Houston"], ["GA", 7, "Atlanta"], ["MD", 6, "Silver Spring"], ["MN", 6, "Minneapolis"], ["NJ", 5, "Newark"], ["IL", 4, "Chicago"], ["NC", 4, "Charlotte"], ["PA", 4, "Philadelphia"], ["MA", 3, "Boston"], ["VA", 3, "Alexandria"], ["CA", 3, "Oakland"], ["WA", 3, "Seattle"], ["MI", 3, "Detroit"], ["KY", 2, "Louisville"]];
  const wpick = arr => { const tot = arr.reduce((s, x) => s + x[1], 0); let r = R() * tot; for (const x of arr) { r -= x[1]; if (r <= 0) return x; } return arr[0]; };
  const customers = Array.from({ length: 70 }, (_, i) => { const st = wpick(STATES); return { id: "C" + (100 + i), name: FIRST[i % FIRST.length] + " " + LAST[(i * 7) % LAST.length], state: st[0], city: st[2] }; });
  const P = A.products();
  const DAY = 864e5, today = new Date(); today.setHours(12, 0, 0, 0);
  const SAMPLE = [];
  let num = 0;
  for (let i = 89; i >= 0; i--) {
    const n = Math.round(2 + (89 - i) * 0.06 + R() * 3 + ([5, 6].includes(new Date(today - i * DAY).getDay()) ? 2 : 0));
    for (let k = 0; k < n; k++) {
      let mode = R(); mode = mode < 0.5 ? "ship" : mode < 0.88 ? "pickup" : "local";
      const cpool = mode === "ship" ? customers : customers.filter(c => c.state === "OH");
      const cust = R() < 0.5 ? cpool[Math.floor(R() * Math.min(12, cpool.length))] : pick(cpool);
      const pool = P.filter(p => p.active);
      const lines = []; const nl = 2 + Math.floor(R() * 5);
      for (let j = 0; j < nl; j++) { const p = pick(pool); if (!lines.find(l => l.id === p.id)) lines.push({ id: p.id, title: p.brand + " " + p.title + (p.size ? " " + p.size : ""), qty: 1 + Math.floor(R() * 3), price: null, cat: p.category }); }
      // Simulated basket value (assumption ~ $55 average) — NOT derived from store prices, which are not set.
      const sub = Math.round((30 + R() * 50) * 100) / 100;
      const del = mode === "ship" ? (sub >= 99 ? 0 : 9 + R() * 9) : mode === "local" ? 7.99 : 0;
      const age = i;
      const status = age > 3 ? "Completed" : age > 0 ? (mode === "ship" ? "Shipped" : "Ready") : (R() < 0.6 ? "New" : "Packing");
      SAMPLE.push({ id: "S-" + (1000 + (++num)), at: today - i * DAY - Math.floor(R() * 8) * 3600e3, mode, cust, lines, subtotal: sub, delivery: del, total: sub + del, status, sample: true, state: mode === "ship" ? cust.state : "OH" });
    }
  }
  SAMPLE.reverse();
  const statusOverrides = A.LS.get("as_dash_status", {});
  SAMPLE.forEach(o => { if (statusOverrides[o.id]) o.status = statusOverrides[o.id]; });

  function liveOrders() {
    return A.orders().map(o => ({ id: o.id, at: o.at, mode: o.mode, cust: { name: o.customer.name || "Demo customer", city: o.customer.city || (o.mode === "ship" ? "—" : "Columbus"), state: o.mode === "ship" ? zipState(o.zip) : "OH" },
      lines: o.lines, subtotal: o.subtotal, delivery: o.delivery, total: o.total, status: o.status, live: true, state: o.mode === "ship" ? zipState(o.zip) : "OH", zip: o.zip, pickup: o.customer.pickup }));
  }
  function zipState(z) { if (!z) return "—"; const d = +z.slice(0, 3); if (d >= 430 && d <= 459) return "OH"; if (d >= 100 && d <= 149) return "NY"; if (d >= 750 && d <= 799) return "TX"; if (d >= 300 && d <= 319) return "GA"; if (d >= 900 && d <= 961) return "CA"; return "US"; }
  const allOrders = () => liveOrders().concat(SAMPLE);

  /* ---------------- helpers ---------------- */
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const dayKey = t => { const d = new Date(t); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
  const fmtDate = t => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtTime = t => new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2200); }
  const statusPill = s => `<span class="pill ${{ New: "p-new", Packing: "p-pack", Ready: "p-ready", Shipped: "p-ready", Completed: "p-done", Cancelled: "p-bad" }[s] || "p-new"}">${s}</span>`;

  /* tooltip */
  const tip = $("#tip");
  function showTip(e, html) { tip.innerHTML = html; tip.classList.add("on"); const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8); tip.style.left = x + "px"; tip.style.top = (e.clientY - tip.offsetHeight - 12) + "px"; }
  function hideTip() { tip.classList.remove("on"); }
  document.addEventListener("pointermove", e => { const h = e.target.closest("[data-tip]"); if (h) showTip(e, h.dataset.tip); else hideTip(); });

  /* ---------------- charts (SVG) ---------------- */
  function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
  function barChart(data, opt = {}) {
    const W = 720, H = opt.h || 230, pl = 46, pr = 8, pt = 10, pb = 26, iw = W - pl - pr, ih = H - pt - pb;
    const max = niceMax(Math.max(...data.map(d => d.v)) * 1.05); const bw = iw / data.length; const gap = Math.max(2, bw * 0.22);
    const y = v => pt + ih - v / max * ih; const fmt = opt.fmt || money0;
    let g = `<g class="grid">${[0, .25, .5, .75, 1].map(f => `<line x1="${pl}" x2="${W - pr}" y1="${y(max * f)}" y2="${y(max * f)}"/><text class="ax" x="${pl - 6}" y="${y(max * f) + 4}" text-anchor="end">${fmt(max * f)}</text>`).join("")}</g>`;
    data.forEach((d, i) => {
      const x = pl + i * bw + gap / 2, w = bw - gap, h = Math.max(0, ih - (y(d.v) - pt)), yy = y(d.v), r = Math.min(4, w / 2, h);
      const path = h > 0 ? `M${x} ${pt + ih}V${yy + r}q0 -${r} ${r} -${r}h${w - 2 * r}q${r} 0 ${r} ${r}V${pt + ih}z` : "";
      g += `<path class="bar" d="${path}" fill="${d.c || opt.color || COL.ship}"/>`;
      g += `<rect class="hit" x="${pl + i * bw}" y="${pt}" width="${bw}" height="${ih}" data-tip="<b>${esc(d.l)}</b>${esc(fmt(d.v))}${d.s ? " · " + esc(d.s) : ""}"/>`;
      if (data.length <= 12 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) g += `<text class="ax" x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${esc(d.short || d.l)}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label || "Bar chart")}">${g}</svg>`;
  }
  function lineChart(series, labels, opt = {}) {
    const W = 720, H = 250, pl = 54, pr = 96, pt = 12, pb = 26, iw = W - pl - pr, ih = H - pt - pb;
    const max = niceMax(Math.max(...series.flatMap(s => s.values)) * 1.05);
    const x = i => pl + i / (labels.length - 1) * iw, y = v => pt + ih - v / max * ih;
    let g = `<g class="grid">${[0, .25, .5, .75, 1].map(f => `<line x1="${pl}" x2="${pl + iw}" y1="${y(max * f)}" y2="${y(max * f)}"/><text class="ax" x="${pl - 6}" y="${y(max * f) + 4}" text-anchor="end">${money0(max * f)}</text>`).join("")}</g>`;
    labels.forEach((l, i) => { if (i % 2 === 0 || i === labels.length - 1) g += `<text class="ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>`; });
    series.forEach(s => {
      g += `<path d="${s.values.map((v, i) => (i ? "L" : "M") + x(i) + " " + y(v)).join("")}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round"/>`;
      const lv = s.values[s.values.length - 1];
      g += `<circle cx="${x(labels.length - 1)}" cy="${y(lv)}" r="4" fill="${s.color}" stroke="#fff" stroke-width="2"/><text x="${x(labels.length - 1) + 8}" y="${y(lv) + 4}" font-size="11.5" font-weight="700" fill="#202720">${esc(s.name)}</text>`;
    });
    labels.forEach((l, i) => {
      const tipH = `<b>${esc(l)}</b>` + series.map(s => `${esc(s.name)}: ${money0(s.values[i])}`).join("<br>");
      g += `<rect class="hit" x="${x(i) - iw / (labels.length - 1) / 2}" y="${pt}" width="${iw / (labels.length - 1)}" height="${ih}" data-tip="${esc(tipH)}"/>`;
    });
    return `<div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join("")}</div><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label || "Line chart")}">${g}</svg>`;
  }
  function hbars(rows, fmt = money0, color) {
    const max = Math.max(...rows.map(r => r.v)) || 1;
    return `<div class="hbars">${rows.map(r => `<div class="hbar" data-tip="<b>${esc(r.l)}</b>${esc(fmt(r.v))}${r.s ? " · " + esc(r.s) : ""}"><span>${r.dot ? `<i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${r.c};margin-right:6px"></i>` : ""}${esc(r.l)}</span><span class="track"><i style="width:${r.v / max * 100}%;background:${r.c || color || COL.ship}"></i></span><span class="v">${fmt(r.v)}</span></div>`).join("")}</div>`;
  }
  const tableView = (head, rows) => `<details class="tbl"><summary>View as table</summary><div class="tbl-wrap"><table><thead><tr>${head.map((h, i) => `<th class="${i ? "num" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i ? "num" : ""}">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;

  /* ---------------- views ---------------- */
  const NAV = [["overview", "chart", "Overview"], ["orders", "box", "Orders"], ["products", "tag", "Products"], ["inventory", "grid", "Inventory"], ["customers", "users", "Customers"], ["fulfillment", "truck", "Fulfillment"], ["carts", "cart", "Abandoned carts"], ["coupons", "star", "Coupons"], ["reports", "chart", "Revenue reports"]];
  const V = {};

  function daily(days) {
    const O = allOrders(); const out = [];
    for (let i = days - 1; i >= 0; i--) { const t = today - i * DAY; const k = dayKey(t); const os = O.filter(o => dayKey(o.at) === k); out.push({ l: fmtDate(t), short: new Date(t).getDate() + "", v: sum(os, o => o.total), s: os.length + " orders" }); }
    return out;
  }

  V.overview = () => {
    const O = allOrders(), tk = dayKey(Date.now());
    const tod = O.filter(o => dayKey(o.at) === tk), yk = dayKey(Date.now() - DAY), yest = O.filter(o => dayKey(o.at) === yk);
    const m30 = O.filter(o => o.at > Date.now() - 30 * DAY), p30 = O.filter(o => o.at <= Date.now() - 30 * DAY && o.at > Date.now() - 60 * DAY);
    const newO = O.filter(o => o.status === "New" || o.status === "Packing");
    const rev30 = sum(m30, o => o.total), revP = sum(p30, o => o.total);
    const aov = rev30 / (m30.length || 1);
    const mix = ["ship", "pickup", "local"].map(m => ({ l: MODE[m], v: sum(m30.filter(o => o.mode === m), o => o.total), c: COL[m], dot: true, s: m30.filter(o => o.mode === m).length + " orders" }));
    const low = A.products().filter(p => p.active && p.stock != null && p.stock <= 12).sort((a, b) => a.stock - b.stock);
    const unset = A.products().filter(p => p.price == null || p.stock == null || p.ship == null).length;
    const live = liveOrders();
    const pct = (a, b) => b ? Math.round((a - b) / b * 100) : 0;
    const d1 = pct(sum(tod, o => o.total), sum(yest, o => o.total)), d2 = pct(rev30, revP);
    return `
      ${live.length ? `<div class="banner b-ok">${I("check")}<span><b>${live.length} order${live.length > 1 ? "s" : ""} placed from the demo storefront on this device</b> — they appear below and in Orders.</span></div>` : `<div class="banner b-info">${I("info")}<span>Tip for the demo: place an order on the <a href="index.html">storefront</a>, then come back — it shows up here instantly.</span></div>`}
      <div class="grid g4">
        <div class="card kpi hl"><div class="l">Sales today</div><div class="v">${money0(sum(tod, o => o.total))}</div><div class="d">${tod.length} orders · ${d1 >= 0 ? "▲" : "▼"} ${Math.abs(d1)}% vs yesterday</div></div>
        <div class="card kpi"><div class="l">Last 30 days</div><div class="v">${money0(rev30)}</div><div class="d ${d2 >= 0 ? "up" : "down"}">${d2 >= 0 ? "▲" : "▼"} ${Math.abs(d2)}% vs prior 30 days</div></div>
        <div class="card kpi"><div class="l">Orders to fulfill</div><div class="v">${newO.length}</div><div class="d">${newO.filter(o => o.mode === "ship").length} to ship · ${newO.filter(o => o.mode !== "ship").length} local/pickup</div></div>
        <div class="card kpi"><div class="l">Average order</div><div class="v">${money(aov)}</div><div class="d">${m30.length} orders in 30 days</div></div>
      </div>
      <div class="grid g21" style="margin-top:12px">
        <div class="card"><h2>${I("chart")}Daily online sales</h2><p class="sub">Last 30 days · hover a bar for details</p>${barChart(daily(30), { label: "Daily online sales, last 30 days" })}
          ${tableView(["Day", "Sales", "Orders"], daily(30).map(d => [d.l, money0(d.v), d.s]))}</div>
        <div class="card"><h2>${I("truck")}How customers get orders</h2><p class="sub">Sales by fulfillment method, 30 days</p>${hbars(mix)}
          <p class="note">${I("info")}Local delivery is a proposed service; figures are simulated.</p></div>
      </div>
      <div class="grid g2" style="margin-top:12px">
        <div class="card"><h2>${I("box")}New orders</h2><p class="sub">Newest first · <a href="#orders">manage all</a></p><div class="olist">${newO.slice(0, 5).map(orderRow).join("") || "<p>No new orders.</p>"}</div></div>
        <div class="card"><h2>${I("alert")}Needs the store's input</h2><p class="sub">${unset} of ${A.products().length} demo products still need a price, stock count or shipping decision · <a href="#products">set them</a></p>
          ${A.products().filter(p => p.price == null || p.stock == null || p.ship == null).slice(0, 5).map(p => `<div class="prod" style="grid-template-columns:44px 1fr auto">${A.art(p, "thumb")}<div class="t"><b>${esc(p.brand)} ${esc(p.title)}</b><small>${[p.price == null ? "price" : "", p.stock == null ? "stock" : "", p.ship == null ? "shipping" : ""].filter(Boolean).join(" · ")} not set</small></div><span class="pill p-pack">To set</span></div>`).join("")}
          ${low.length ? `<p class="sub" style="margin-top:10px"><b>${low.length}</b> item(s) at 12 units or fewer.</p>` : ""}</div>
      </div>`;
  };

  function orderRow(o) {
    const st = ["New", "Packing", o.mode === "ship" ? "Shipped" : "Ready", "Completed", "Cancelled"];
    return `<div class="order ${o.live ? "fresh" : ""}"><span class="mic m-${o.mode}">${I(MI[o.mode])}</span>
      <div><b>${o.id}</b> · ${esc(o.cust.name)} ${o.live ? '<span class="pill p-new">From storefront</span>' : ""}<small>${fmtTime(o.at)} · ${MODE[o.mode]}${o.mode === "ship" ? " → " + esc(o.state) + (o.zip ? " " + o.zip : "") : o.pickup ? " · " + esc(o.pickup) : ""} · ${o.lines.reduce((s, l) => s + l.qty, 0)} items</small></div>
      <div class="r row"><b>${o.total != null ? money(o.total) : (o.live ? "Price request" : "—")}</b><label class="sr" style="position:absolute;left:-9999px" for="st-${o.id}">Status</label><select id="st-${o.id}" data-status="${o.id}" data-live="${o.live ? 1 : 0}">${st.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></div></div>`;
  }

  let ofilter = "open";
  V.orders = () => {
    const O = allOrders();
    const F = { open: o => ["New", "Packing"].includes(o.status), ready: o => ["Ready", "Shipped"].includes(o.status), done: o => o.status === "Completed", ship: o => o.mode === "ship", pickup: o => o.mode === "pickup", local: o => o.mode === "local", all: () => true };
    const L = O.filter(F[ofilter]).slice(0, 60);
    const btn = (k, l) => `<button data-of="${k}" class="${ofilter === k ? "on" : ""}">${l} <small>(${O.filter(F[k]).length})</small></button>`;
    return `<div class="card"><h2>${I("box")}Orders</h2><p class="sub">Change a status and it saves. Customers would be notified automatically in the live version.</p>
      <div class="filters">${btn("open", "To fulfill")}${btn("ready", "Ready / shipped")}${btn("done", "Completed")}${btn("ship", "Shipping")}${btn("pickup", "Pickup")}${btn("local", "Local")}${btn("all", "All")}</div>
      <div class="olist">${L.map(orderRow).join("") || "<p>No orders in this view.</p>"}</div>
      ${O.filter(F[ofilter]).length > 60 ? `<p class="note">${I("info")}Showing the 60 most recent.</p>` : ""}</div>`;
  };

  let pq = "", pcat = "";
  V.products = () => {
    const L = A.products().filter(p => (!pcat || p.category === pcat) && (!pq || p.title.toLowerCase().includes(pq.toLowerCase())));
    return `<div class="card"><h2>${I("tag")}Product management</h2><p class="sub">Set price, package weight and where each product can be sold. Changes appear on the storefront immediately (this browser).</p>
      <div class="row" style="flex-wrap:wrap;margin-bottom:8px"><input class="search" id="pq" placeholder="Search products" value="${esc(pq)}"><select class="search" id="pcat" style="min-width:160px"><option value="">All categories</option>${window.AS_CATEGORIES.map(c => `<option value="${c.id}" ${pcat === c.id ? "selected" : ""}>${c.short}</option>`).join("")}</select>
        <span style="flex:1"></span><button class="btn btn-o btn-sm" data-act="import">${I("arrow")}Import inventory (CSV)</button></div>
      <div class="banner b-info">${I("info")}<span>These are <b>demonstration products</b>. Nothing is priced or approved for shipping until the store sets it here. Try it live: enter a price, set <b>Ship = No</b> on an item, then look at the storefront cart.</span></div>
      <div id="plist">${L.map(prodRow).join("")}</div></div>`;
  };
  function prodRow(p) {
    const t = (k, l, v) => `<label>${l}<span class="tog"><input type="checkbox" data-pk="${k}" data-pid="${p.id}" ${v ? "checked" : ""}><span></span></span></label>`;
    const shipSel = `<label>Ship<select class="n" style="width:92px;text-align:left" data-pk="ship" data-pid="${p.id}"><option value="" ${p.ship == null ? "selected" : ""}>Not set</option><option value="yes" ${p.ship === true ? "selected" : ""}>Yes</option><option value="no" ${p.ship === false ? "selected" : ""}>No</option></select></label>`;
    return `<div class="prod">${A.art(p, "thumb")}<div class="t"><b>${esc(p.brand)} ${esc(p.title)}</b><small>${p.size ? esc(p.size) + " · " : ""}${p.sku} · demo item</small></div>
      <div class="ctl"><label>Price $<input class="n" data-pk="price" data-pid="${p.id}" type="number" step="0.01" min="0" placeholder="Not set" value="${p.price != null ? p.price.toFixed(2) : ""}"></label><label>Weight lb<input class="n" style="width:64px" data-pk="weightLb" data-pid="${p.id}" type="number" step="0.1" min="0" placeholder="—" value="${p.weightLb != null ? p.weightLb : ""}"></label>${shipSel}${t("pickup", "Pickup", p.pickup)}${t("local", "Local", p.local)}${t("active", "Online", p.active)}</div></div>`;
  }

  V.inventory = () => {
    const L = A.products().slice().sort((a, b) => (a.stock == null ? -1 : a.stock) - (b.stock == null ? -1 : b.stock));
    const counted = L.filter(p => p.stock != null), units = sum(counted, p => p.stock), value = sum(counted.filter(p => p.price != null), p => p.stock * p.price);
    return `<div class="grid g3"><div class="card kpi"><div class="l">Products counted</div><div class="v">${counted.length} / ${L.length}</div></div><div class="card kpi"><div class="l">Units on hand</div><div class="v">${units.toLocaleString()}</div></div><div class="card kpi"><div class="l">Retail value (priced items)</div><div class="v">${money0(value)}</div></div></div>
      <div class="card" style="margin-top:12px"><h2>${I("grid")}Inventory</h2><p class="sub">No counts are entered yet. Type a count after a delivery; products at 0 show “Out of stock” online.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Product</th><th>Storage</th><th class="num">On hand</th><th class="num">Status</th></tr></thead><tbody>
      ${L.map(p => `<tr><td><div class="row">${A.art(p, "thumb")}<span><b>${esc(p.brand)} ${esc(p.title)}</b><br><small style="color:var(--ink-3)">${esc(p.size || "size TBC")}</small></span></div></td><td>Packaged</td>
        <td class="num"><input class="n" style="width:70px;height:34px;border-radius:8px;border:1.5px solid var(--line);text-align:right;font-weight:700;padding:0 8px;background:var(--ivory)" type="number" min="0" placeholder="—" data-pk="stock" data-pid="${p.id}" value="${p.stock != null ? p.stock : ""}"></td>
        <td class="num">${p.stock == null ? '<span class="pill p-new">Not counted</span>' : p.stock === 0 ? '<span class="pill p-bad">Out</span>' : p.stock <= 9 ? '<span class="pill p-bad">Reorder</span>' : p.stock <= 12 ? '<span class="pill p-pack">Low</span>' : '<span class="pill p-done">OK</span>'}</td></tr>`).join("")}
      </tbody></table></div><p class="note">${I("info")}In production, counts would sync with the store's point-of-sale so in-store and online stock stay aligned.</p></div>`;
  };

  V.customers = () => {
    const O = allOrders(); const map = {};
    O.forEach(o => { const k = o.cust.name; map[k] = map[k] || { name: k, city: o.cust.city, state: o.state === "—" ? o.cust.state : o.state, orders: 0, spent: 0, last: 0 }; map[k].orders++; map[k].spent += o.total; map[k].last = Math.max(map[k].last, o.at); });
    const L = Object.values(map).sort((a, b) => b.spent - a.spent);
    const rep = L.filter(c => c.orders > 1);
    return `<div class="grid g4"><div class="card kpi"><div class="l">Customers</div><div class="v">${L.length}</div></div><div class="card kpi hl"><div class="l">Repeat customers</div><div class="v">${rep.length}</div><div class="d">${Math.round(rep.length / L.length * 100)}% ordered more than once</div></div>
      <div class="card kpi"><div class="l">Revenue from repeat buyers</div><div class="v">${Math.round(sum(rep, c => c.spent) / sum(L, c => c.spent) * 100)}%</div></div><div class="card kpi"><div class="l">Out-of-state customers</div><div class="v">${L.filter(c => c.state !== "OH").length}</div></div></div>
      <div class="card" style="margin-top:12px"><h2>${I("users")}Customer list</h2><p class="sub">Sample customers, ranked by spend.</p><div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Location</th><th class="num">Orders</th><th class="num">Spent</th><th class="num">Last order</th></tr></thead><tbody>
      ${L.slice(0, 40).map(c => `<tr><td><b>${esc(c.name)}</b> ${c.orders > 2 ? '<span class="pill p-done">Repeat</span>' : ""}</td><td>${esc(c.city)}, ${esc(c.state)}</td><td class="num">${c.orders}</td><td class="num">${money(c.spent)}</td><td class="num">${fmtDate(c.last)}</td></tr>`).join("")}</tbody></table></div></div>`;
  };

  V.fulfillment = () => {
    const O = allOrders().filter(o => o.mode === "ship"); const by = {};
    O.forEach(o => { by[o.state] = (by[o.state] || 0) + 1; });
    const dest = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([s, n]) => ({ l: s, v: n }));
    const s = A.shipping(), f = A.fulfillment();
    const modeT = k => `<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid #F0EBDD"><span class="row">${I(MI[k])}<b>${f[k].label}</b>${f[k].proposed ? '<span class="pill p-ready">Proposed</span>' : ""}</span><span class="tog"><input type="checkbox" data-fm="${k}" ${f[k].active ? "checked" : ""} aria-label="${f[k].label} on/off"><span></span></span></div>`;
    return `<div class="grid g2">
      <div class="card"><h2>${I("pin")}Shipping destinations</h2><p class="sub">Shipped orders by state, 90 days (sample)</p>${hbars(dest, v => v + " orders")}</div>
      <div class="card"><h2>${I("settings")}Fulfillment methods</h2><p class="sub">Turn methods on or off for the storefront.</p>${["ship", "pickup", "local"].map(modeT).join("")}
        <div class="fgrid" style="margin-top:12px">
          <div class="field"><label>Free shipping over ($)</label><input type="number" data-sh="freeThreshold" value="${s.freeThreshold}"></div>
          <div class="field"><label>Handling fee ($)</label><input type="number" step="0.5" data-sh="handlingFee" value="${s.handlingFee}"></div>
          <div class="field"><label>Max package (lb)</label><input type="number" data-sh="maxPackageLb" value="${s.maxPackageLb}"></div>
          <div class="field"><label>Local delivery fee ($)</label><input type="number" step="0.01" data-lf="fee" value="${f.local.fee}"></div>
          <div class="field"><label>Local minimum order ($)</label><input type="number" data-lf="minOrder" value="${f.local.minOrder}"></div></div></div>
    </div>
    <div class="grid g2" style="margin-top:12px">
      <div class="card"><h2>${I("truck")}Shipping zones & rates</h2><p class="sub">Rate = base per package + per-lb charge. Edit and the storefront recalculates.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Zone</th><th class="num">Base $</th><th class="num">Per lb $</th><th class="num">Days</th></tr></thead><tbody>
        ${s.zones.map((z, i) => `<tr><td><b>${z.id}</b><br><small style="color:var(--ink-3)">${esc(z.name.split("·")[1] || "")} · ZIPs ${z.zipFirstDigits.join(",")}xxxx</small></td><td class="num"><input class="n" style="width:70px;height:32px;border:1.5px solid var(--line);border-radius:8px;text-align:right;padding:0 6px" type="number" step="0.05" data-zone="${i}" data-zk="base" value="${z.base}"></td><td class="num"><input class="n" style="width:62px;height:32px;border:1.5px solid var(--line);border-radius:8px;text-align:right;padding:0 6px" type="number" step="0.05" data-zone="${i}" data-zk="perLb" value="${z.perLb}"></td><td class="num">${z.days}</td></tr>`).join("")}</tbody></table></div>
        <p class="note">${I("info")}Production rates would come from the carrier account (USPS/UPS) in the e-commerce platform.</p></div>
      <div class="card"><h2>${I("bike")}Local delivery ZIP codes</h2><p class="sub">Comma-separated list of approved ZIPs (${A.localZips().length} now).</p>
        <div class="field"><textarea id="lz">${A.localZips().join(", ")}</textarea></div><button class="btn btn-d" style="margin-top:8px" data-act="savezips">Save ZIP list</button>
        <h2 style="margin-top:16px">${I("snow")}Shipping restrictions</h2><p class="sub" style="margin:0">Perishable, refrigerated, frozen and glass items stay pickup/local by default. Product-level overrides are on the Products page.</p></div>
    </div>
    <div style="margin-top:12px"><button class="btn btn-o" data-act="reset">${I("repeat")}Reset all demo settings</button></div>`;
  };

  const SAMPLE_CARTS = [
    { who: "Kemi O.", email: "k•••@gmail.com", items: ["r07", "r10", "r09"], ago: 2, state: "TX" },
    { who: "Guest", email: "—", items: ["r08", "r05"], ago: 5, state: "OH" },
    { who: "Abdi M.", email: "a•••@yahoo.com", items: ["r11", "r04"], ago: 9, state: "OH" },
    { who: "Grace A.", email: "g•••@outlook.com", items: ["r12", "r03", "r06"], ago: 20, state: "GA" },
    { who: "Moussa D.", email: "m•••@gmail.com", items: ["box-naija"], ago: 26, state: "NY" }
  ];
  V.carts = () => {
    const live = A.cartLines(); const touched = A.LS.get("as_cart_touched", 0);
    const nm = id => { const p = A.product(id); if (p) return p.brand + " " + p.title; const b = window.AS_BOXES.find(x => x.id === id); return b ? b.title : id; };
    return `<div class="grid g3"><div class="card kpi"><div class="l">Open carts (sample)</div><div class="v">${SAMPLE_CARTS.length + (live.length ? 1 : 0)}</div></div><div class="card kpi"><div class="l">Items left in carts</div><div class="v">${sum(SAMPLE_CARTS, c => c.items.length) + sum(live, l => l.qty)}</div></div><div class="card kpi"><div class="l">Typical recovery with reminders</div><div class="v">5–15%</div><div class="d">Industry rule of thumb, not a promise</div></div></div>
      <div class="card" style="margin-top:12px"><h2>${I("cart")}Abandoned carts</h2><p class="sub">Shoppers who added items but didn't check out. Send a reminder or a small coupon.</p>
      ${live.length ? `<div class="order fresh"><span class="mic">${I("cart")}</span><div><b>This device (live demo cart)</b><small>${live.map(l => l.qty + "× " + esc(l.title)).join(", ")} · ${touched ? fmtTime(touched) : ""}</small></div><div class="r row"><button class="btn btn-p btn-sm" data-act="remind">Send reminder</button></div></div>` : ""}
      <div class="olist" style="margin-top:8px">${SAMPLE_CARTS.map(c => `<div class="order"><span class="mic">${I("cart")}</span><div><b>${c.who}</b> · ${c.email} · ${c.state}<small>${c.items.map(nm).map(esc).join(", ")} · ${c.ago} h ago</small></div><div class="r row"><button class="btn btn-o btn-sm" data-act="remind">Send reminder</button></div></div>`).join("")}</div>
      <p class="note">${I("info")}Reminder emails would be sent by the platform's marketing tools; nothing is sent from this demo.</p></div>`;
  };

  V.coupons = () => {
    const L = A.coupons();
    return `<div class="card"><h2>${I("star")}Coupons</h2><p class="sub">Active codes work at the storefront checkout right away (this browser).</p>
      <div class="tbl-wrap"><table><thead><tr><th>Code</th><th>Offer</th><th>Minimum</th><th class="num">Active</th></tr></thead><tbody>
      ${L.map((c, i) => `<tr><td><b>${esc(c.code)}</b></td><td>${c.type === "percent" ? c.value + "% off" : c.type === "fixed" ? money(c.value) + " off" : "Free shipping"}<br><small style="color:var(--ink-3)">${esc(c.note || "")}</small></td><td>${c.minSubtotal ? money(c.minSubtotal) : "—"}</td><td class="num"><span class="tog"><input type="checkbox" data-cp="${i}" ${c.active ? "checked" : ""} aria-label="Activate ${esc(c.code)}"><span></span></span></td></tr>`).join("")}</tbody></table></div>
      <h2 style="margin-top:16px">${I("plus")}Create a coupon</h2>
      <form id="newcp" class="fgrid"><div class="field"><label>Code</label><input name="code" required placeholder="EID15" style="text-transform:uppercase"></div>
        <div class="field"><label>Type</label><select name="type"><option value="percent">% off</option><option value="fixed">$ off</option><option value="freeship">Free shipping</option></select></div>
        <div class="field"><label>Value</label><input name="value" type="number" step="0.01" value="10"></div>
        <div class="field"><label>Minimum order ($)</label><input name="min" type="number" value="0"></div>
        <div class="field" style="align-self:end"><button class="btn btn-d" style="width:100%;height:40px">Create</button></div></form></div>`;
  };

  let scen = "moderate";
  V.reports = () => {
    const O = allOrders();
    const months = [2, 1, 0].map(k => { const d = new Date(today); d.setMonth(d.getMonth() - k, 1); const m = d.getMonth(), y = d.getFullYear(); const os = O.filter(o => { const x = new Date(o.at); return x.getMonth() === m && x.getFullYear() === y; }); return { l: d.toLocaleDateString("en-US", { month: "long" }), short: d.toLocaleDateString("en-US", { month: "short" }), v: sum(os, o => o.total), s: os.length + " orders" + (k === 0 ? " (month to date)" : "") }; });
    const cats = window.AS_CATEGORIES.map(c => ({ l: c.short, v: sum(O, o => sum(o.lines.filter(l => (A.product(l.id) || {}).category === c.id), l => l.qty)) })).filter(c => c.v > 0).sort((a, b) => b.v - a.v);
    const tot = sum(O, o => o.total);
    // growth scenarios (12 months) — assumptions, editable on the presenter view
    const S = { conservative: { o: 120, g: 0.03, b: 48 }, moderate: { o: 250, g: 0.05, b: 55 }, ambitious: { o: 500, g: 0.07, b: 62 } };
    const lab = Array.from({ length: 12 }, (_, i) => "M" + (i + 1));
    const ser = Object.entries(S).map(([k, s], i) => ({ name: k[0].toUpperCase() + k.slice(1), color: [COL.pickup, COL.ship, COL.local][i], values: lab.map((_, m) => s.o * Math.pow(1 + s.g, m) * s.b) }));
    return `<div class="grid g3"><div class="card kpi hl"><div class="l">Online revenue, 90 days (sample)</div><div class="v">${money0(tot)}</div><div class="d">${O.length} orders</div></div><div class="card kpi"><div class="l">Average order</div><div class="v">${money(tot / O.length)}</div></div><div class="card kpi"><div class="l">Shipped share of revenue</div><div class="v">${Math.round(sum(O.filter(o => o.mode === "ship"), o => o.total) / tot * 100)}%</div><div class="d">New customers outside Columbus</div></div></div>
      <div class="grid g2" style="margin-top:12px">
        <div class="card"><h2>${I("chart")}Revenue by month</h2><p class="sub">Simulated launch period</p>${barChart(months, { h: 200, label: "Revenue by month" })}${tableView(["Month", "Revenue", "Orders"], months.map(m => [m.l, money0(m.v), m.s]))}</div>
        <div class="card"><h2>${I("tag")}Units by category</h2><p class="sub">Which aisles sell online (simulated)</p>${hbars(cats.slice(0, 8), v => v + " units")}</div>
      </div>
      <div class="card" style="margin-top:12px"><h2>${I("chart")}Sample sales growth scenarios — monthly online revenue</h2><p class="sub">Illustrative assumptions only (starting orders/month, monthly growth, average basket). Not a forecast.</p>
        <div class="scen">${Object.entries(S).map(([k, s], i) => `<div style="border-color:${[COL.pickup, COL.ship, COL.local][i]}"><small>${k[0].toUpperCase() + k.slice(1)}</small><b>${money0(sum(ser[i].values, v => v))}</b><small>year-one online revenue · ${s.o} orders/mo start, +${Math.round(s.g * 100)}%/mo, ${money0(s.b)} basket</small></div>`).join("")}</div>
        ${lineChart(ser, lab, { label: "Sample growth scenarios" })}
        ${tableView(["Month"].concat(ser.map(s => s.name)), lab.map((l, i) => [l].concat(ser.map(s => money0(s.values[i])))))}</div>`;
  };

  /* ---------------- shell ---------------- */
  function shell() {
    const cur = (location.hash.slice(1) || "overview");
    $("#side").innerHTML = `<div class="brand"><img src="img/logo.png" alt="Africa Supermarket"><span>Owner<br>dashboard</span></div>` +
      NAV.map(([k, ic, l]) => `<a href="#${k}" class="${cur === k ? "on" : ""}">${I(ic)}${l}</a>`).join("") +
      `<span class="sp"></span><a class="store-link" href="index.html">${I("store")}View storefront</a><small>Demo by Dalal Technologies · ${C.builder.websiteLabel} · ${C.builder.phone}</small>`;
    $("#tabs").innerHTML = NAV.map(([k, ic, l]) => `<a href="#${k}" class="${cur === k ? "on" : ""}">${I(ic)}${l.split(" ")[0]}</a>`).join("") + `<a href="index.html">${I("store")}Store</a>`;
    const title = (NAV.find(n => n[0] === cur) || NAV[0])[2];
    $("#top").innerHTML = `<img class="mlogo" src="img/logo.png" alt=""><h1>${title}</h1><span class="who"><span>Owner · Africa Supermarket</span><span class="av">AS</span></span>`;
  }
  function render() {
    const cur = (location.hash.slice(1) || "overview"); shell();
    $("#view").innerHTML = (V[cur] || V.overview)();
  }
  function rerender() { const y = scrollY; $("#view").innerHTML = (V[location.hash.slice(1) || "overview"] || V.overview)(); scrollTo(0, y); }
  window.addEventListener("hashchange", () => { render(); scrollTo(0, 0); });

  /* ---------------- edits → overrides ---------------- */
  function ovr(fn) { const o = A.overrides(); o.products = o.products || {}; fn(o); A.LS.set("as_overrides", o); }
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.status) {
      if (t.dataset.live === "1") A.setOrderStatus(t.dataset.status, t.value);
      else { const so = A.LS.get("as_dash_status", {}); so[t.dataset.status] = t.value; A.LS.set("as_dash_status", so); const o = SAMPLE.find(x => x.id === t.dataset.status); if (o) o.status = t.value; }
      toast(t.dataset.status + " → " + t.value); return;
    }
    if (t.dataset.pk) {
      const k = t.dataset.pk, id = t.dataset.pid;
      let v = t.type === "checkbox" ? t.checked : t.tagName === "SELECT" ? (t.value === "" ? null : t.value === "yes") : (t.value === "" ? null : parseFloat(t.value));
      if (t.type === "number" && v !== null && (isNaN(v) || v < 0)) { toast("Enter a valid number"); return; }
      if (k === "stock" && v !== null) v = Math.round(v);
      ovr(o => { o.products[id] = Object.assign(o.products[id] || {}, { [k]: v }); });
      toast("Saved · storefront updated"); rerender(); return;
    }
    if (t.dataset.fm) { ovr(o => { o.fulfillment = o.fulfillment || {}; o.fulfillment[t.dataset.fm] = Object.assign(o.fulfillment[t.dataset.fm] || {}, { active: t.checked }); }); toast("Fulfillment updated"); return; }
    if (t.dataset.sh) { ovr(o => { o.shipping = Object.assign(o.shipping || {}, { [t.dataset.sh]: parseFloat(t.value) || 0 }); }); toast("Shipping settings saved"); return; }
    if (t.dataset.lf) { ovr(o => { o.fulfillment = o.fulfillment || {}; o.fulfillment.local = Object.assign(o.fulfillment.local || {}, { [t.dataset.lf]: parseFloat(t.value) || 0 }); }); toast("Local delivery saved"); return; }
    if (t.dataset.zone) { const s = A.shipping(); const zones = JSON.parse(JSON.stringify(s.zones)); zones[+t.dataset.zone][t.dataset.zk] = parseFloat(t.value) || 0; ovr(o => { o.shipping = Object.assign(o.shipping || {}, { zones }); }); toast("Rate saved"); return; }
    if (t.dataset.cp) { const L = JSON.parse(JSON.stringify(A.coupons())); L[+t.dataset.cp].active = t.checked; ovr(o => { o.coupons = L; }); toast(L[+t.dataset.cp].code + (t.checked ? " activated" : " paused")); return; }
    if (t.id === "pcat") { pcat = t.value; rerender(); }
  });
  document.addEventListener("input", e => { if (e.target.id === "pq") { pq = e.target.value; $("#plist").innerHTML = A.products().filter(p => (!pcat || p.category === pcat) && (!pq || p.title.toLowerCase().includes(pq.toLowerCase()))).map(prodRow).join(""); } });
  document.addEventListener("click", e => {
    const of = e.target.closest("[data-of]"); if (of) { ofilter = of.dataset.of; rerender(); return; }
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act;
    if (act === "savezips") { const z = $("#lz").value.split(/[\s,]+/).filter(x => /^\d{5}$/.test(x)); ovr(o => { o.localZips = z; }); toast(z.length + " ZIP codes saved"); rerender(); }
    if (act === "reset") { A.LS.del("as_overrides"); A.LS.del("as_dash_status"); toast("Demo settings reset"); setTimeout(() => location.reload(), 500); }
    if (act === "remind") { a.textContent = "Reminder queued (demo)"; a.disabled = true; }
    if (act === "import") toast("Demo: CSV import would map POS/Shopify columns to products");
  });
  document.addEventListener("submit", e => {
    if (e.target.id !== "newcp") return; e.preventDefault(); const f = e.target;
    const code = f.code.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!code) return;
    const L = JSON.parse(JSON.stringify(A.coupons())).filter(c => c.code !== code);
    const type = f.type.value, value = parseFloat(f.value.value) || 0, min = parseFloat(f.min.value) || 0;
    L.push({ code, type, value, minSubtotal: min, active: true, note: type === "percent" ? value + "% off" : type === "fixed" ? "$" + value + " off" : "Free shipping" });
    ovr(o => { o.coupons = L; }); toast(code + " created — try it at checkout"); rerender();
  });
  window.addEventListener("storage", () => rerender());
  render();
})();
