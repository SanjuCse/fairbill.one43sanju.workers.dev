import { MIN_REPORTS } from "./stats.js";
import { NATIONAL, tierSlugOf } from "../data/catalog.js";

export async function getPublished(db, procedure, city) {
  const { results } = await db
    .prepare("SELECT low, high, label, source_name AS source, source_url AS url, as_of AS asOf FROM published_prices WHERE procedure_slug=? AND city_slug=? ORDER BY low")
    .bind(procedure, city)
    .all();
  return results;
}

// Resolves published rows for a city: city-specific rows first, then its CGHS tier rows, then national rows.
export async function resolvePublished(db, procedure, city) {
  const candidates = city.slug === NATIONAL.slug ? [NATIONAL.slug] : [city.slug, tierSlugOf(city), NATIONAL.slug];
  const { results } = await db
    .prepare(
      `SELECT city_slug AS scope, low, high, label, source_name AS source, source_url AS url, as_of AS asOf FROM published_prices WHERE procedure_slug=? AND city_slug IN (${candidates.map(() => "?").join(",")}) ORDER BY low`
    )
    .bind(procedure, ...candidates)
    .all();
  for (const scope of candidates) {
    const rows = results.filter((r) => r.scope === scope);
    if (rows.length) return { rows, scope: scope === city.slug ? "city" : scope === NATIONAL.slug ? "national" : "tier" };
  }
  return { rows: [], scope: "none" };
}

export async function getReportPrices(db, procedure, city) {
  const { results } = await db.prepare("SELECT price FROM reports WHERE procedure_slug=? AND city_slug=?").bind(procedure, city).all();
  return results.map((r) => r.price);
}

export async function hasReported(db, hash, procedure, city) {
  return !!(await db.prepare("SELECT 1 FROM reports WHERE ip_hash=? AND procedure_slug=? AND city_slug=?").bind(hash, procedure, city).first());
}

export async function insertReport(db, r, hash) {
  await db
    .prepare("INSERT INTO reports (procedure_slug, city_slug, price, year, ip_hash) VALUES (?,?,?,?,?)")
    .bind(r.procedure, r.city, r.price, r.year, hash)
    .run();
}

// Per-city published range and report count for one procedure.
export async function cityOverview(db, procedure) {
  const [pub, rep] = await Promise.all([
    db.prepare("SELECT city_slug AS city, MIN(low) AS low, MAX(high) AS high FROM published_prices WHERE procedure_slug=? GROUP BY city_slug").bind(procedure).all(),
    db.prepare("SELECT city_slug AS city, COUNT(*) AS n FROM reports WHERE procedure_slug=? GROUP BY city_slug").bind(procedure).all(),
  ]);
  return { published: pub.results, reports: rep.results };
}

// Procedure/city pairs that have enough data to deserve an indexable page.
export async function indexablePairs(db) {
  const { results } = await db
    .prepare(
      `SELECT procedure_slug AS procedure, city_slug AS city FROM published_prices
       UNION
       SELECT procedure_slug, city_slug FROM reports GROUP BY procedure_slug, city_slug HAVING COUNT(*) >= ${MIN_REPORTS}`
    )
    .all();
  return results;
}

export async function lastModified(db) {
  const row = await db.prepare("SELECT MAX(as_of) AS d FROM published_prices").first();
  return row?.d || "2026-11-22";
}
