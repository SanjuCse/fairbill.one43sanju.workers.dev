import { text } from "../lib/http.js";
import { CATEGORIES, PROCEDURES, STATE_LIST, procedureBySlug } from "../data/catalog.js";
import { indexablePairs, lastModified } from "../lib/db.js";
import { expandCoverage } from "../lib/coverage.js";

const XML = "application/xml; charset=utf-8";
const head = '<?xml version="1.0" encoding="UTF-8"?>';

export const robots = (origin) =>
  text(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`, "text/plain; charset=utf-8");

const urlset = (origin, paths, lastmod) =>
  text(
    `${head}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}${p}</loc><lastmod>${lastmod}</lastmod></url>`).join("")}</urlset>`,
    XML
  );

// Sitemap index: one file for site pages plus one per procedure that has city pages.
export async function sitemapIndex(origin, db) {
  const [pairs, lastmod] = await Promise.all([indexablePairs(db), lastModified(db)]);
  const coverage = expandCoverage(pairs);
  const files = ["/sitemaps/pages.xml", ...PROCEDURES.filter((p) => coverage.get(p.slug)?.size).map((p) => `/sitemaps/cost-${p.slug}.xml`)];
  return text(
    `${head}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${files.map((f) => `<sitemap><loc>${origin}${f}</loc><lastmod>${lastmod}</lastmod></sitemap>`).join("")}</sitemapindex>`,
    XML
  );
}

export async function sitemapFile(origin, db, name) {
  const lastmod = await lastModified(db);
  if (name === "pages") {
    return urlset(
      origin,
      ["/", "/about", ...CATEGORIES.map((c) => `/${c.slug}`), ...STATE_LIST.map((s) => `/state/${s.slug}`), ...PROCEDURES.map((p) => `/cost/${p.slug}`)],
      lastmod
    );
  }
  const slug = name.replace(/^cost-/, "");
  if (!name.startsWith("cost-") || !procedureBySlug(slug)) return null;
  const cities = expandCoverage(await indexablePairs(db)).get(slug);
  if (!cities?.size) return null;
  return urlset(origin, [...cities].sort().map((c) => `/cost/${slug}/${c}`), lastmod);
}
