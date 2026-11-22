// Collects Clove Dental city cost pages and Sabka Dentist regional price lists.
// Usage: node scripts/collect/dental.mjs  ->  scripts/out/clove.json, scripts/out/sabka.json
import { mkdirSync, writeFileSync } from "node:fs";

const UA = { "user-agent": "Mozilla/5.0" };
const fetchText = async (url) => {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch {}
    await new Promise((r) => setTimeout(r, 1200));
  }
  return null;
};
const text = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

const PAGES = ["root-canal-treatment-cost", "dental-crown-cost", "dental-implant-cost", "teeth-braces-cost", "dental-filling-cost", "teeth-cleaning-cost", "dentures-cost", "dental-veneers-cost", "dental-bridges-cost"];
const CLOVE_CITIES = ["ahmedabad", "amritsar", "bengaluru", "chandigarh", "chennai", "faridabad", "gandhinagar", "ghaziabad", "greater-noida", "gurgaon", "hyderabad", "jaipur", "jalandhar", "kakinada", "ludhiana", "mohali", "mumbai", "navi-mumbai", "new-delhi", "noida", "panchkula", "panvel", "pune", "secunderabad", "thane", "vijayawada", "vizag", "zirakpur", "kalyan-dombivili"];

const clove = { pages: {}, cities: {} };
for (const page of PAGES) {
  clove.cities[page] = [];
  for (const city of CLOVE_CITIES) {
    const h = await fetchText(`https://clovedental.in/cost/${page}/${city}`);
    if (!h || /<title>[^<]*Best Dentists/i.test(h)) continue;
    clove.cities[page].push(city);
    if (!clove.pages[page]) {
      const t = text(h);
      clove.pages[page] = [...t.matchAll(/[^.]{0,160}₹\s?[\d,]+[^.]{0,160}/g)].map((m) => m[0].trim()).slice(0, 12);
    }
  }
  console.log(page, clove.cities[page].length);
}

const sabka = {};
for (const region of ["maharashtra", "gujarat", "bangalore"]) {
  const h = await fetchText(`https://sabkadentist.com/complete-pricelist-${region}/`);
  if (!h) continue;
  const t = text(h.replace(/<\/t[dh]>/g, " | "));
  sabka[region] = [...t.matchAll(/\|?\s*([A-Za-z][^|]{2,70})\|\s*(?:[^|]{0,400}\|\s*)?([\d,]{3,7})\s*\/-/g)].map((m) => ({ name: m[1].trim(), price: Number(m[2].replace(/,/g, "")) }));
  console.log(region, sabka[region].length);
}
mkdirSync(new URL("../out/", import.meta.url), { recursive: true });
writeFileSync(new URL("../out/clove.json", import.meta.url), JSON.stringify(clove, null, 1));
writeFileSync(new URL("../out/sabka.json", import.meta.url), JSON.stringify(sabka, null, 1));
