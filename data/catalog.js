/*
 * Africa Supermarket — DEMONSTRATION CATALOG (real branded products, real photos)
 * ------------------------------------------------------------------
 * 12 real African-grocery products, each with its own photograph from the
 * supplied image pack (img/products/, sources in img/products/SOURCES.csv).
 *   • Africa Supermarket has NOT confirmed it stocks any of them.
 *   • price / stock / weightLb / ship are null (not set) until the store
 *     enters them in the owner dashboard or imports real inventory.
 *   • Photos belong to their owners (retailers/brands). Obtain permission or
 *     approved manufacturer images before public commercial use.
 * Field map → Shopify: handle, title, brand → Vendor, category → Product type,
 * price → Variant price, stock → Inventory, image → Image src.
 * ------------------------------------------------------------------
 */
window.AS_CATEGORIES = [
  { id: "grains",    name: "Rice, Grains & Flours",   short: "Grains & Flours", icon: "grain",  tint: "#F3EAD2" },
  { id: "beans",     name: "Beans & Legumes",         short: "Beans",           icon: "bean",   tint: "#EFE3D2" },
  { id: "spices",    name: "Spices & Seasonings",     short: "Seasonings",      icon: "spice",  tint: "#F6E0D2" },
  { id: "pantry",    name: "Pantry Essentials",       short: "Pantry",          icon: "bottle", tint: "#F4E7CF" },
  { id: "breakfast", name: "Breakfast & Beverages",   short: "Breakfast & Drinks", icon: "snack", tint: "#F6EBC8" },
  { id: "milk",      name: "Milk & Dairy",            short: "Milk",            icon: "drop",   tint: "#EAF0E2" }
];

/* Aisles in the brief that have no confirmed products yet. Shown as
   "awaiting store inventory" — no illustrations or sample items. */
window.AS_PENDING_AISLES = [
  "Snacks", "Teas & dried ingredients", "Beauty & personal care",
  "Household essentials", "Fresh produce", "Halal meat & frozen", "Clothing & accessories (if carried)"
];

window.AS_REGIONS = [
  { id: "nigeria", name: "Nigerian Kitchen",   countries: "Garri, honey beans, Indomie, Maggi, Peak", hue: "#1F6B45" },
  { id: "ghana",   name: "Ghanaian Favorites", countries: "Cocoyam fufu, Milo, Titus sardines", hue: "#C9622B" },
  { id: "west",    name: "West African Pantry", countries: "Rice, Rosa margarine, Bird's custard, Nido", hue: "#3D6FB0" }
];

const IMG = "img/products/";
window.AS_PRODUCTS = [
  { id: "r01", handle: "tropiway-cocoyam-fufu-flour", brand: "Tropiway", title: "Cocoyam Fufu Flour", size: "", category: "grains", regions: ["ghana", "west"],
    image: IMG + "01_tropiway_cocoyam_fufu_flour.webp", imageSource: "africanmarketonline.com", desc: "Cocoyam-based fufu flour; stir into hot water for smooth fufu to serve with light soup or groundnut soup." },
  { id: "r02", handle: "rosa-margarine-450g", brand: "Rosa", title: "Margarine", size: "450 g", category: "pantry", regions: ["west", "nigeria"],
    image: IMG + "02_rosa_margarine_450g.webp", imageSource: "africanmarketonline.com", desc: "Creamy margarine tub for bread, cooking and baking." },
  { id: "r03", handle: "titus-sardines-soybean-oil", brand: "Titus", title: "Sardines in Soybean Oil", size: "", category: "pantry", regions: ["nigeria", "ghana"],
    image: IMG + "03_titus_sardines_in_soybean_oil.webp", imageSource: "shop.pathmark.com", desc: "Tinned sardines in soybean oil, a West African favorite with bread, rice or stews." },
  { id: "r04", handle: "nido-fortificada-dry-whole-milk", brand: "Nestlé", title: "NIDO Fortificada Dry Whole Milk", size: "12.6 oz", category: "milk", regions: ["west"],
    image: IMG + "04_nestle_nido_fortificada_dry_whole_milk.webp", imageSource: "heb.com", desc: "Powdered whole milk fortified with vitamins and minerals." },
  { id: "r05", handle: "peak-evaporated-milk-13oz", brand: "Peak", title: "Evaporated Milk", size: "13 oz", category: "milk", regions: ["nigeria", "west"],
    image: IMG + "05_peak_evaporated_milk_13oz.webp", imageSource: "heb.com", desc: "Evaporated milk for tea, custard, pap and baking." },
  { id: "r06", handle: "birds-original-custard-powder", brand: "Bird's", title: "Original Custard Powder", size: "", category: "breakfast", regions: ["west", "nigeria", "ghana"],
    image: IMG + "06_birds_original_custard_powder.webp", imageSource: "kroger.com", desc: "Classic custard powder, often served with akara or as a breakfast pudding." },
  { id: "r07", handle: "afrigrid-ijebu-garri", brand: "Afrigrid", title: "Ijebu Garri", size: "", category: "grains", regions: ["nigeria"],
    image: IMG + "07_ijebu_garri_afrigrid.webp", imageSource: "afrigrid.us", desc: "Sharp, crisp Ijebu-style garri for soaking or eba." },
  { id: "r08", handle: "tropical-sun-fragrant-rice", brand: "Tropical Sun", title: "Fragrant Rice", size: "", category: "grains", regions: ["west"],
    image: IMG + "08_tropical_sun_fragrant_rice.webp", imageSource: "tropicalsunfoods.com", desc: "Fragrant long-grain rice for everyday meals." },
  { id: "r09", handle: "maggi-chicken-cube", brand: "Maggi", title: "Chicken Seasoning Cubes", size: "", category: "spices", regions: ["nigeria", "ghana", "west"],
    image: IMG + "09_maggi_chicken_cube.webp", imageSource: "a1cashandcarry.com", desc: "Chicken bouillon cubes, the base of countless stews, soups and jollof." },
  { id: "r10", handle: "honey-beans-oloyin-5lb", brand: "Market pack", title: "Honey Beans (Oloyin)", size: "5 lb", category: "beans", regions: ["nigeria"],
    image: IMG + "10_honey_beans_oloyin_5lbs.webp", imageSource: "asherafricanmarket.com", desc: "Naturally sweet brown beans for ewa agoyin and bean porridge." },
  { id: "r11", handle: "nestle-milo-tin-1-5kg", brand: "Nestlé", title: "Milo Chocolate Malt Drink, Tin", size: "1.5 kg", category: "breakfast", regions: ["ghana", "nigeria"],
    image: IMG + "11_nestle_milo_tin_1_5kg.webp", imageSource: "africanmarketonline.com", desc: "Family-size tin of Milo chocolate malt drink powder." },
  { id: "r12", handle: "indomie-onion-chicken-noodles", brand: "Indomie", title: "Onion Chicken Flavor Instant Noodles", size: "70 g packs", category: "pantry", regions: ["nigeria", "ghana"],
    image: IMG + "12_indomie_onion_chicken_noodles.webp", imageSource: "africanmarketonline.com", desc: "Quick instant noodles in onion chicken flavor; available by the pack or carton, to be confirmed by the store." }
].map((p, i) => Object.assign({ sku: "DEMO-R" + String(i + 1).padStart(2, "0"), price: null, stock: null, ship: null, weightLb: null, storage: "ambient", demo: true }, p));

/* Proposed bundles — contents only. No bundle price until the store sets item prices. */
window.AS_BOXES = [
  { id: "box-naija", title: "Nigerian Pantry Starter", items: ["r07", "r10", "r09", "r12", "r03"], tag: "Garri, honey beans, Maggi, Indomie and sardines", hue: "#1F6B45" },
  { id: "box-breakfast", title: "West African Breakfast Box", items: ["r11", "r05", "r06", "r02"], tag: "Milo, Peak, Bird's custard and Rosa margarine", hue: "#C9622B" },
  { id: "box-care", title: "Away-From-Home Care Box", items: ["r12", "r03", "r11", "r01"], tag: "A taste of home for students far from family", hue: "#3D6FB0" }
];
