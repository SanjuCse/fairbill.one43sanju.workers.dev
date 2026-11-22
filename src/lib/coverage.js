import { CITIES, NATIONAL, TIER_SLUGS, tierSlugOf } from "../data/catalog.js";

/**
 * Expands stored (procedure, city) pairs into the concrete city slugs that deserve an indexable page.
 * Tier-keyed rows cover every city in that tier; national rows are a fallback and are not indexable per city.
 * @returns {Map<string, Set<string>>} procedure slug -> city slugs
 */
export function expandCoverage(pairs) {
  const byTier = new Map(TIER_SLUGS.map((t) => [t, CITIES.filter((c) => tierSlugOf(c) === t).map((c) => c.slug)]));
  const out = new Map();
  for (const { procedure, city } of pairs) {
    if (!out.has(procedure)) out.set(procedure, new Set());
    const set = out.get(procedure);
    if (city === NATIONAL.slug) continue;
    if (byTier.has(city)) byTier.get(city).forEach((c) => set.add(c));
    else set.add(city);
  }
  return out;
}
