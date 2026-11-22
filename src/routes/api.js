import { cityBySlug } from "../data/catalog.js";
import { json, ipHash } from "../lib/http.js";
import { validateReport, validateQuote } from "../lib/validate.js";
import { judge } from "../lib/stats.js";
import { resolvePublished, getReportPrices, hasReported, insertReport } from "../lib/db.js";

export async function postReport(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const { value, error } = validateReport(body);
  if (error) return json({ error }, 400);
  const hash = await ipHash(request);
  if (await hasReported(env.DB, hash, value.procedure, value.city)) return json({ error: "You have already reported this procedure in this city." }, 429);
  await insertReport(env.DB, value, hash);
  return json({ ok: true }, 201);
}

export async function getCheck(request, env) {
  const { value, error } = validateQuote(new URL(request.url).searchParams);
  if (error) return json({ error }, 400);
  const [{ rows: published }, prices] = await Promise.all([
    resolvePublished(env.DB, value.procedure, cityBySlug(value.city)),
    getReportPrices(env.DB, value.procedure, value.city),
  ]);
  const result = judge(value.quote, prices, published);
  return json(result ? { found: true, quote: value.quote, ...result } : { found: false });
}
