// Published price points collected from public sources. Update `asOf` when re-checked.
// - CGHS hospital/diagnostic rows are stored once per tier (tier-x/y/z) and resolved per city by tier.
// - Clove and Sabka rows are stored per city they publish prices for.
// - Vet rows are national (city "india") and act as a fallback for every city.
import { TIERS } from "./catalog.js";
import { HOSPITAL, DENTAL_CGHS } from "./hospital.js";
import { SABKA_REGIONS } from "./sabka.js";

const CHECKED = "2026-11-22";

const CGHS_SOURCE = "CGHS official rate list (effective 13 Oct 2025)";
const cghsRows = (procedure, cghsSlug, nabhRate, label) =>
  Object.values(TIERS).map((t) => ({
    procedure,
    city: t.slug,
    low: Math.round(nabhRate * t.factor * 0.85),
    high: Math.round(nabhRate * t.factor),
    label: `${label} (${t.label}: non-NABH to NABH hospital)`,
    source: CGHS_SOURCE,
    url: `https://cghshospitals.com/rates/${cghsSlug}`,
    asOf: "2025-10-13",
  }));

// Cities Clove Dental publishes cost pages for: [catalog slug, Clove URL slug].
const CLOVE_CITIES = [
  ["ahmedabad", "ahmedabad"], ["amritsar", "amritsar"], ["bengaluru", "bengaluru"], ["chandigarh", "chandigarh"], ["chennai", "chennai"],
  ["faridabad", "faridabad"], ["gandhinagar", "gandhinagar"], ["ghaziabad", "ghaziabad"], ["greater-noida", "greater-noida"], ["gurgaon", "gurgaon"],
  ["hyderabad", "hyderabad"], ["jaipur", "jaipur"], ["jalandhar", "jalandhar"], ["kakinada", "kakinada"], ["kalyan-dombivli", "kalyan-dombivili"],
  ["ludhiana", "ludhiana"], ["mohali", "mohali"], ["mumbai", "mumbai"], ["navi-mumbai", "navi-mumbai"], ["delhi", "new-delhi"], ["new-delhi", "new-delhi"],
  ["noida", "noida"], ["panchkula", "panchkula"], ["panvel", "panvel"], ["pune", "pune"], ["secunderabad", "secunderabad"], ["thane", "thane"],
  ["vijayawada", "vijayawada"], ["visakhapatnam", "vizag"], ["zirakpur", "zirakpur"],
];

// Clove prices are identical on every city page, so each entry applies to all Clove cities.
const CLOVE = [
  ["root-canal-treatment-cost", "root-canal", 5500, 12500, "Single-root to specialist RCT"],
  ["root-canal-treatment-cost", "re-root-canal", 6800, 10000, "Re-RCT starting prices (standard to specialist)"],
  ["dental-crown-cost", "dental-crown", 3300, 13000, "Metal to all-ceramic crowns, starting prices"],
  ["dental-implant-cost", "dental-implant", 30000, 64000, "Single implant, up to ₹64,000 with zirconia crown"],
  ["teeth-braces-cost", "metal-braces", 30000, 30000, "Traditional metal braces, starting price"],
  ["teeth-braces-cost", "ceramic-braces", 50000, 50000, "Ceramic (tooth-coloured) braces, starting price"],
  ["teeth-braces-cost", "clear-aligners", 60000, 60000, "Clear aligners, starting price"],
  ["dental-filling-cost", "tooth-filling", 1100, 2700, "Small composite filling to a larger cavity"],
  ["teeth-cleaning-cost", "teeth-cleaning", 1799, 3300, "Routine scaling to heavy-tartar cleaning"],
  ["dentures-cost", "complete-denture", 11000, 17000, "Acrylic complete denture: single arch to both arches"],
  ["dental-veneers-cost", "dental-veneers", 5000, 11600, "Composite to porcelain veneers, per tooth"],
  ["dental-bridges-cost", "dental-bridge", 6600, 17800, "Metal to zirconia bridge, per missing tooth"],
];

const cloveRows = CLOVE.flatMap(([page, procedure, low, high, label]) =>
  CLOVE_CITIES.map(([city, slug]) => ({
    procedure, city, low, high, label,
    source: "Clove Dental rate card", url: `https://clovedental.in/cost/${page}/${slug}`, asOf: CHECKED,
  }))
);

// Sabka Dentist publishes separate price lists per region.
const SABKA_CITIES = {
  maharashtra: ["mumbai", "navi-mumbai", "thane", "vasai-virar", "mira-bhayandar", "pune", "nashik", "satara"],
  gujarat: ["ahmedabad", "surat", "vadodara"],
  bangalore: ["bengaluru"],
};
const SABKA_NAME = { maharashtra: "Maharashtra", gujarat: "Gujarat", bangalore: "Bangalore" };
const sabkaRows = Object.entries(SABKA_CITIES).flatMap(([region, cities]) => {
  const v = SABKA_REGIONS[region];
  const defs = [
    ["root-canal", v.rct, v.rct, "Root canal treatment"],
    ["re-root-canal", v.reRct, v.reRct, "Re-root canal treatment"],
    ["dental-crown", v.crownEconomy, v.crownPremium, "Economy to premium crown"],
    ["dental-implant", v.implant, v.implant, "Dental implant"],
    ["complete-denture", v.dentureEconomy, v.denturePremium, "Indian to premium complete denture"],
    ["metal-braces", v.bracesMetal, v.bracesMetal, "Metallic braces"],
    ["ceramic-braces", v.bracesCeramic, v.bracesCeramic, "Ceramic braces"],
    ["clear-aligners", v.aligners, v.aligners, "Clear aligners"],
    ["tooth-filling", v.fillingLow, v.fillingHigh, "GIC to composite filling"],
    ["tooth-extraction", v.extractSimple, v.extractRoot, "Normal to root-piece extraction"],
    ["wisdom-tooth-extraction", v.extractSurgical, v.extractSurgical, "Surgical extraction of impacted tooth"],
    ["teeth-cleaning", v.cleanBasic, v.cleanDeep, "Basic to deep cleaning"],
  ];
  return cities.flatMap((city) =>
    defs.map(([procedure, low, high, label]) => ({
      procedure, city, low, high, label,
      source: `Sabka Dentist price list (${SABKA_NAME[region]})`,
      url: `https://sabkadentist.com/complete-pricelist-${region}/`, asOf: CHECKED,
    }))
  );
});

const national = (procedure, low, high, label, [source, url]) => ({ procedure, city: "india", low, high, label, source, url, asOf: CHECKED });
const PAWVERSE = ["Pawverse vet-visit price guide 2026", "https://pawversepet.com/blogs/how-much-does-a-vet-visit-cost-in-india-2026-price-guide"];
const VETIC_VACC = ["Vetic vaccination price guide", "https://vetic.in/blog/pet-health/dog-vaccination-cost-in-india-complete-price-guide/"];
const VETIC_SPAY = ["Vetic spay/neuter price guide", "https://vetic.in/blog/dogs/puppy-spay-cost-vs-adult-dog-spay-cost-complete-price-guide-in-india/"];

const vetRows = [
  national("vet-consultation", 300, 1000, "Routine clinic consultation", PAWVERSE),
  national("vet-followup-visit", 200, 500, "Follow-up consultation", PAWVERSE),
  national("online-vet-consultation", 150, 700, "Chat, voice or video consultation", PAWVERSE),
  national("dog-spay-neuter", 2500, 15000, "Neutering from ₹2,500; private spay up to ₹15,000", VETIC_SPAY),
  national("rabies-vaccine", 699, 899, "Rabies dose starting prices", VETIC_VACC),
  national("nine-in-one-vaccine", 849, 899, "9-in-1 combination vaccine starting price", VETIC_VACC),
  national("kennel-cough-vaccine", 1349, 1349, "Kennel cough vaccine, starting price", VETIC_VACC),
  national("puppy-vaccination-series", 1800, 3000, "Full puppy series, excluding consultation", PAWVERSE),
  national("cat-booster-vaccines", 1200, 2500, "Adult cat annual boosters", PAWVERSE),
  national("dog-deworming", 300, 800, "Deworming", PAWVERSE),
  national("annual-wellness-checkup", 2000, 4500, "Exam, boosters and deworming for an adult dog", PAWVERSE),
  national("vet-blood-test", 800, 2500, "Routine blood tests", VETIC_SPAY),
  national("pet-urine-test", 500, 1000, "Urine test", PAWVERSE),
  national("pet-xray", 500, 750, "Single-view X-ray at larger chains", PAWVERSE),
  national("pet-dental-cleaning", 2000, 8000, "Dental cleaning, extractions billed separately", PAWVERSE),
  national("parvo-treatment", 10000, 50000, "Parvovirus hospitalisation", PAWVERSE),
  national("cat-urinary-blockage", 8000, 30000, "Cat urinary blockage treatment", PAWVERSE),
  national("emergency-vet-visit", 15000, 40000, "Emergency visit and treatment", PAWVERSE),
];

export const PUBLISHED = [
  ...HOSPITAL.flatMap((h) => cghsRows(h.slug, h.cghs, h.rate, h.name)),
  ...DENTAL_CGHS.flatMap((d) => cghsRows(d.procedure, d.cghs, d.rate, d.label)),
  ...cloveRows,
  ...sabkaRows,
  ...vetRows,
];
