// Crawls the public CGHS rate listing (cghshospitals.com) and writes every procedure with its Tier X NABH rate.
// Usage: node scripts/collect/cghs-index.mjs  ->  scripts/out/cghs-index.json
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "https://cghshospitals.com";
const get = async (path) => {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(BASE + path, { headers: { "user-agent": "Mozilla/5.0" } });
      if (r.ok) return await r.text();
    } catch {}
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("failed " + path);
};
const strip = (s) => s.replace(/<[^>]+>/g, "|").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/\|+/g, "|");
const num = (s) => Number(s.replace(/[^\d]/g, ""));

const index = await get("/rates");
const specialties = [...new Set([...index.matchAll(/href="\/rates\/specialty\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
const out = [];
for (const sp of specialties) {
  const html = await get(`/rates/specialty/${sp}`);
  const seen = new Set();
  for (const m of html.matchAll(/<a[^>]*href="\/rates\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const parts = strip(m[2]).split("|").map((s) => s.trim()).filter((s) => s && s !== "·");
    const price = parts.find((p) => p.startsWith("₹"));
    out.push({ slug: m[1], specialty: sp, name: parts[0], price: price ? num(price) : null });
  }
  console.log(sp, seen.size);
}
mkdirSync(new URL("../out/", import.meta.url), { recursive: true });
writeFileSync(new URL("../out/cghs-index.json", import.meta.url), JSON.stringify(out, null, 1));
console.log("total", out.length);
