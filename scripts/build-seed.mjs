// Generates db/seed.sql from src/data/published.js.  Usage: node scripts/build-seed.mjs
import { writeFileSync } from "node:fs";
import { PUBLISHED } from "../src/data/published.js";

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const rows = PUBLISHED.map(
  (r) => `(${q(r.procedure)},${q(r.city)},${r.low},${r.high},${q(r.label)},${q(r.source)},${q(r.url)},${q(r.asOf)})`
);
const CHUNK = 50;
const cols = "(procedure_slug, city_slug, low, high, label, source_name, source_url, as_of)";
const stmts = [];
for (let i = 0; i < rows.length; i += CHUNK) stmts.push(`INSERT INTO published_prices ${cols} VALUES\n${rows.slice(i, i + CHUNK).join(",\n")};`);
const sql = `DELETE FROM published_prices;\n${stmts.join("\n")}\n`;
writeFileSync(new URL("../db/seed.sql", import.meta.url), sql);
console.log(`wrote ${rows.length} published price rows`);
