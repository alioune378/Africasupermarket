/*
 * Africa Supermarket — store configuration (DEMO / DEVELOPMENT DATA)
 * Prepared by Dalal Technologies.
 *
 * Every value in this file is a placeholder for demonstration. Shipping rates,
 * zones, delivery ZIP codes, fees and coupons have NOT been agreed with the owner.
 * The owner dashboard can override these values (saved in the browser only).
 * In production these settings would live in Shopify (or another e-commerce
 * backend): Shipping profiles, Local delivery zones, Discounts.
 */
window.AS_CONFIG = {
  demo: true,
  store: {
    name: "Africa Supermarket",
    street: "3639 E Livingston Avenue",
    city: "Columbus",
    state: "OH",
    zip: "43227",
    phone: "(614) 237-7988",
    phoneHref: "tel:+16142377988",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=3639+E+Livingston+Ave+Columbus+OH+43227",
    hoursNote: "Store hours to be confirmed with the owner"
  },
  builder: {
    name: "Dalal Technologies",
    tagline: "Technology that moves business forward.",
    website: "https://dalaltechnologies.com/en/",
    websiteLabel: "dalaltechnologies.com",
    email: "info@dalaltechnologies.com",
    phone: "+1 (718) 912-3441",
    phoneHref: "tel:+17189123441",
    address: "228 Park Ave S, PMB 473086, New York, NY 10003",
    /* Path to the official Dalal Technologies logo file. Leave null to show the
       built-in text wordmark. Example: "img/dalal-logo-reverse.png" */
    logo: null
  },
  /* Presenter PIN for the sales demonstration view (present.html).
     Client-side only — this hides the panel from casual visitors, it is not security. */
  presenterPin: "2026",

  /* Fulfillment modes. `active:false` would hide a mode from shoppers. */
  fulfillment: {
    ship:   { label: "Nationwide shipping", short: "Ship", active: true, proposed: true,
              note: "Proposed: eligible packaged items, pending owner approval" },
    pickup: { label: "Columbus store pickup", short: "Pickup", active: true,
              note: "Order online, collect at 3639 E Livingston Ave", fee: 0,
              readyNote: "Pickup times would follow store hours" },
    local:  { label: "Local delivery", short: "Delivery", active: true, proposed: true,
              note: "Proposed service for approved Columbus ZIP codes", fee: 7.99, minOrder: 35,
              windowNote: "Delivery windows to be set by the store" }
  },

  /* Nationwide shipping — sample rate table by zone. Zone is chosen from the
     first digit of the destination ZIP (approximation of distance from Ohio). */
  shipping: {
    originZip: "43227",
    handlingFee: 2.5,
    freeThreshold: 99,
    maxPackageLb: 50,
    zones: [
      { id: "Z1", name: "Zone 1 · Ohio Valley & Midwest", zipFirstDigits: ["4"], base: 8.95, perLb: 0.45, days: "2–3" },
      { id: "Z2", name: "Zone 2 · East, South & Plains", zipFirstDigits: ["1","2","3","5","6"], base: 11.95, perLb: 0.65, days: "3–4" },
      { id: "Z3", name: "Zone 3 · Northeast coast & South Central", zipFirstDigits: ["0","7"], base: 12.95, perLb: 0.75, days: "3–5" },
      { id: "Z4", name: "Zone 4 · Mountain & West Coast", zipFirstDigits: ["8","9"], base: 15.95, perLb: 0.95, days: "4–6" }
    ],
    /* Destinations where the demo will not ship (configurable). */
    blockedZipPrefixes: ["967", "968", "995", "996", "997", "998", "999", "006", "007", "009"],
    blockedNote: "Hawaii, Alaska and Puerto Rico are excluded in this demo"
  },

  /* Local delivery — sample list of approved ZIP codes around the store. */
  localZips: ["43227","43232","43213","43209","43205","43207","43219","43224","43229","43231","43068","43110","43123","43230","43211","43206","43004","43125"],

  /* Coupons — sample codes for the demo checkout. */
  coupons: [
    { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 0,  active: true, note: "10% off a first online order" },
    { code: "PANTRY5",   type: "fixed",   value: 5,  minSubtotal: 50, active: true, note: "$5 off orders of $50+" },
    { code: "SHIPFREE",  type: "freeship", value: 0, minSubtotal: 60, active: false, note: "Free shipping over $60 (paused)" }
  ],

  /* Storage classes decide default shipping eligibility. */
  storageRules: {
    ambient: { label: "Shelf-stable", shipDefault: true },
    fragile: { label: "Glass / fragile", shipDefault: false, reason: "Glass bottles — pickup or local delivery only" },
    fresh:   { label: "Fresh / perishable", shipDefault: false, reason: "Perishable — pickup or local delivery only" },
    chilled: { label: "Refrigerated", shipDefault: false, reason: "Refrigerated — pickup or local delivery only" },
    frozen:  { label: "Frozen", shipDefault: false, reason: "Frozen — pickup or local delivery only" }
  }
};
