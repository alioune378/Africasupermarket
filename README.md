# Africa Supermarket — National E-Commerce Demo

Prepared by **Dalal Technologies** · dalaltechnologies.com · info@dalaltechnologies.com · +1 (718) 912-3441 · 228 Park Ave S, PMB 473086, New York, NY 10003

Interactive demonstration for Africa Supermarket, 3639 E Livingston Avenue, Columbus, OH 43227 · (614) 237-7988.

## Pages
| Page | What it is |
|---|---|
| `index.html` | Shopper storefront: search, categories, kitchens, bestsellers, specials, nationwide collection, pantry boxes, reorder, bulk orders, newsletter, store info, cart, wishlist, ZIP check, checkout preview, confirmation |
| `dashboard.html` | Owner dashboard (mobile-friendly): sales, orders, products, inventory, customers, fulfillment & shipping rules, abandoned carts, coupons, revenue reports, growth scenarios |
| `present.html` | Presenter-only sales panel (PIN **2026**, set in `data/config.js`). Also reachable by triple-tapping the bottom-left corner of the storefront or Alt+Shift+P. Not linked from the store. The PIN hides the page from casual visitors; it is not security. |

## Deploy on Netlify
Drag the folder onto Netlify (Deploys → drag & drop), or connect a GitHub repo. No build step; `netlify.toml` publishes the root. All pages carry `noindex`.

## Data
- `data/catalog.js` — 12 real products (Tropiway, Rosa, Titus, Nestlé NIDO & Milo, Peak, Bird's, Afrigrid, Tropical Sun, Maggi, honey beans, Indomie), each with its own photo in `img/products/` (sources in `img/products/SOURCES.csv`). **Demonstration inventory:** the store has not confirmed it stocks them. `price`, `stock`, `weightLb` and `ship` are `null` (not set). Shoppers see "Price set by store" / "Shipping to be confirmed"; checkout becomes an order *request*.
- Photos were trimmed and padded onto a white square (640 px WebP). A missing file shows a plain "photo pending" tile, never an illustration.
- The owner sets price, weight, stock and Ship = Yes/No in the dashboard (Products / Inventory); the storefront updates immediately in that browser.
- `data/config.js` — store info, fulfillment modes, proposed shipping zones, local-delivery ZIPs, coupons, Dalal credit.
- Dashboard orders are simulated; basket values are assumptions, not store prices.

## Not active / to finish before launch
- Real inventory, prices and product photos from the store
- E-commerce backend (recommended: Shopify) with its hosted checkout and payments; no payment is processed here
- Carrier rates (USPS/UPS), sales tax, order emails/SMS, POS inventory sync
- Local delivery, subscriptions/repeat delivery, pantry boxes: proposed services, not offered today
- SNAP/EBT online: **not active**; requires USDA online authorization and an approved provider
- Original logo file (current logo is an approximation extracted from a Facebook screenshot)
- Confirm the aisle photo's source and whether the store carries clothing; confirm halal certification wording with suppliers

## Image credits
- Logo and storefront photo: from the store's public Facebook page
- Aisle photo: supplied, source to be confirmed
- Product photos: supplied image pack, originally from retailer sites listed in `img/products/SOURCES.csv`; © their owners; internal demo only until permission or manufacturer images are obtained. Do not hotlink retailer CDNs.
- Not used: the haircare product photo, the watermarked stock photo, the Facebook screenshots, AI ingredient images
