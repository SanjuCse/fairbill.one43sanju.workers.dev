import { NATIONAL, procedureBySlug, cityBySlug } from "../data/catalog.js";

const MIN_YEAR = 2023;

export function validateReport(body, now = new Date()) {
  const procedure = procedureBySlug(body?.procedure);
  if (!procedure) return { error: "Choose a procedure from the list." };
  const city = cityBySlug(body?.city);
  if (!city || city.slug === NATIONAL.slug) return { error: "Choose a city from the list." };
  const price = Number(body?.price);
  if (!Number.isInteger(price) || price < 50 || price > 50_000_000) return { error: "Enter the price in rupees (50 – 5,00,00,000)." };
  const year = body?.year === undefined || body?.year === "" ? now.getFullYear() : Number(body.year);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > now.getFullYear()) return { error: `Year must be between ${MIN_YEAR} and ${now.getFullYear()}.` };
  return { value: { procedure: procedure.slug, city: city.slug, price, year } };
}

export function validateQuote(params) {
  const procedure = procedureBySlug(params.get("procedure"));
  const city = cityBySlug(params.get("city"));
  const quote = Number(params.get("quote"));
  if (!procedure) return { error: "Choose a procedure from the list." };
  if (!city) return { error: "Choose a city from the list." };
  if (!Number.isInteger(quote) || quote <= 0) return { error: "Enter your quote as a whole number of rupees." };
  return { value: { procedure: procedure.slug, city: city.slug, quote } };
}
