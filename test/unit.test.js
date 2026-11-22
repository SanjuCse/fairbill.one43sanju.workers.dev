import test from "node:test";
import assert from "node:assert/strict";
import { judge, summarize } from "../src/lib/stats.js";
import { validateReport, validateQuote } from "../src/lib/validate.js";
import { html, escape } from "../src/lib/html.js";
import { PUBLISHED } from "../src/data/published.js";
import { procedureBySlug, cityBySlug, CITIES, PROCEDURES, TIERS, TIER_SLUGS } from "../src/data/catalog.js";
import { expandCoverage } from "../src/lib/coverage.js";

const pub = [{ low: 5000, high: 7000 }];

test("judge uses published range under 3 reports", () => {
  assert.equal(judge(6000, [9000, 9500], pub).basis, "published");
  assert.equal(judge(6000, [], pub).verdict, "fair");
  assert.equal(judge(9000, [], pub).verdict, "high");
  assert.equal(judge(20000, [], pub).verdict, "very_high");
  assert.equal(judge(1000, [], pub).verdict, "low");
  assert.equal(judge(1, [], []), null);
});

test("judge prefers community data from 3 reports", () => {
  const r = judge(6000, [9000, 9500, 10000], pub);
  assert.equal(r.basis, "community");
  assert.equal(r.verdict, "low");
  assert.equal(summarize([1, 2, 3]).median, 2);
});

test("validateReport", () => {
  const now = new Date("2026-06-01");
  assert.ok(validateReport({ procedure: "root-canal", city: "pune", price: 5000, year: 2026 }, now).value);
  assert.ok(validateReport({ procedure: "nope", city: "pune", price: 5000 }, now).error);
  assert.ok(validateReport({ procedure: "root-canal", city: "india", price: 5000 }, now).error);
  assert.ok(validateReport({ procedure: "root-canal", city: "pune", price: 5.5 }, now).error);
  assert.ok(validateReport({ procedure: "root-canal", city: "pune", price: 5000, year: 2030 }, now).error);
});

test("validateQuote", () => {
  assert.ok(validateQuote(new URLSearchParams("procedure=root-canal&city=pune&quote=5000")).value);
  assert.ok(validateQuote(new URLSearchParams("procedure=root-canal&city=pune&quote=-1")).error);
});

test("html escapes interpolations", () => {
  assert.equal(escape("<b>"), "&lt;b&gt;");
  assert.equal(String(html`<p>${"<script>"}</p>`), "<p>&lt;script&gt;</p>");
  assert.equal(String(html`<ul>${["a", "<"].map((x) => html`<li>${x}</li>`)}</ul>`), "<ul><li>a</li><li>&lt;</li></ul>");
});

test("seed data is consistent with the catalog", () => {
  assert.ok(PUBLISHED.length > 50);
  for (const r of PUBLISHED) {
    assert.ok(procedureBySlug(r.procedure), r.procedure);
    assert.ok(cityBySlug(r.city) || TIER_SLUGS.includes(r.city), r.city);
    assert.ok(r.low > 0 && r.high >= r.low, JSON.stringify(r));
    assert.match(r.url, /^https:\/\//);
    assert.match(r.asOf, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("catalog: unique slugs, every city has state and tier", () => {
  assert.equal(new Set(CITIES.map((c) => c.slug)).size, CITIES.length);
  assert.equal(new Set(PROCEDURES.map((p) => p.slug)).size, PROCEDURES.length);
  assert.ok(CITIES.length > 500 && PROCEDURES.length > 100);
  for (const c of CITIES) assert.ok(c.state && TIERS[c.tier], c.slug);
  assert.ok(PROCEDURES.every((p) => PUBLISHED.some((r) => r.procedure === p.slug)));
});

test("tier slugs are not valid report cities", () => {
  assert.ok(validateReport({ procedure: "root-canal", city: "tier-x", price: 5000 }).error);
  assert.equal(cityBySlug("tier-z"), undefined);
});

test("expandCoverage spreads tier rows over cities and skips national rows", () => {
  const cov = expandCoverage([
    { procedure: "mri-brain", city: "tier-x" },
    { procedure: "root-canal", city: "pune" },
    { procedure: "vet-consultation", city: "india" },
  ]);
  const xCities = CITIES.filter((c) => c.tier === "X").length;
  assert.equal(cov.get("mri-brain").size, xCities);
  assert.deepEqual([...cov.get("root-canal")], ["pune"]);
  assert.equal(cov.get("vet-consultation").size, 0);
});
