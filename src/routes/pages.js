import { page } from "../lib/http.js";
import { procedureBySlug, cityBySlug, categoryBySlug, stateBySlug, NATIONAL } from "../data/catalog.js";
import { getPublished, resolvePublished, getReportPrices, cityOverview } from "../lib/db.js";
import { homePage, categoryPage, statePage, procedureOverviewPage, pricePage, aboutPage, notFoundPage } from "../views/pages.js";

export async function renderPage(url, env) {
  const ctx = { origin: url.origin, path: url.pathname };
  const parts = url.pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);

  if (parts.length === 0) return page(homePage(ctx));
  if (parts.length === 1 && parts[0] === "about") return page(aboutPage(ctx));

  if (parts.length === 1 && categoryBySlug(parts[0])) return page(categoryPage(ctx, categoryBySlug(parts[0])));

  if (parts[0] === "state" && parts.length === 2) {
    const state = stateBySlug(parts[1]);
    return state ? page(statePage(ctx, state)) : page(notFoundPage(ctx), 404);
  }

  if (parts[0] === "cost" && parts.length >= 2 && parts.length <= 3) {
    const procedure = procedureBySlug(parts[1]);
    if (!procedure) return page(notFoundPage(ctx), 404);

    if (parts.length === 2) {
      const nationalRows = await getPublished(env.DB, procedure.slug, NATIONAL.slug);
      if (nationalRows.length) {
        const reports = await getReportPrices(env.DB, procedure.slug, NATIONAL.slug);
        return page(pricePage(ctx, procedure, NATIONAL, nationalRows, reports, "national"));
      }
      return page(procedureOverviewPage(ctx, procedure, await cityOverview(env.DB, procedure.slug)));
    }

    const city = cityBySlug(parts[2]);
    if (!city || city.slug === NATIONAL.slug) return page(notFoundPage(ctx), 404);
    const [{ rows, scope }, reports] = await Promise.all([
      resolvePublished(env.DB, procedure.slug, city),
      getReportPrices(env.DB, procedure.slug, city.slug),
    ]);
    return page(pricePage(ctx, procedure, city, rows, reports, scope));
  }

  return page(notFoundPage(ctx), 404);
}
