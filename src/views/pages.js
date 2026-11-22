import { html, raw, jsonLd } from "../lib/html.js";
import { inr, range, dateLabel } from "../lib/format.js";
import { summarize, referenceRange, MIN_REPORTS } from "../lib/stats.js";
import { SITE, CATEGORIES, CITIES, STATE_LIST, TIERS, NATIONAL, proceduresIn, categoryBySlug, procedureBySlug, citiesInState, tierSlugOf } from "../data/catalog.js";
import { layout, crumbs, breadcrumbSchema } from "./layout.js";
import { checkerCard, reportCard } from "./components.js";

export function homePage(ctx) {
  const body = html`<section class="hero"><div class="wrap"><h1>Is your dentist, vet or hospital quote fair?</h1>
<p>Compare any quote with published rate cards, official government rates and prices paid by real people in Indian cities.</p></div></section>
<div class="wrap">${checkerCard({})}
${CATEGORIES.map(
  (c) => html`<section class="card"><h2><a href="/${c.slug}" style="text-decoration:none">${c.name} prices</a></h2><p class="lead">${c.blurb}</p>
<div class="grid">${proceduresIn(c.slug).slice(0, 12).map((p) => html`<a class="tile" href="/cost/${p.slug}"><b>${p.name}</b><span>${p.unit}</span></a>`)}</div>
<p><a href="/${c.slug}">See all ${proceduresIn(c.slug).length} ${c.name.toLowerCase()} procedures</a></p></section>`
)}
<section class="card"><h2>Browse by state</h2><p class="lead">${CITIES.length} cities and towns across ${STATE_LIST.length} states and union territories.</p>
<p>${STATE_LIST.map((s) => html`<a href="/state/${s.slug}">${s.name}</a> · `)}</p></section>
${reportCard({})}</div>`;
  return layout(
    {
      ...ctx,
      title: `${SITE.name}: ${SITE.tagline} Dental, hospital & vet prices in India`,
      description: SITE.description,
      schema: [
        jsonLd({ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: ctx.origin + "/", description: SITE.description }),
      ],
    },
    body
  );
}

export function categoryPage(ctx, category) {
  const items = [{ name: "Home", href: "/" }, { name: category.name }];
  const body = html`<div class="wrap">${crumbs(items)}<h1 class="pg">${category.name} costs in India</h1>
<p class="lead">${category.blurb}. Pick a procedure to see price ranges by city and check a quote.</p>
<div class="grid">${proceduresIn(category.slug).map((p) => html`<a class="tile" href="/cost/${p.slug}"><b>${p.name}</b><span>${p.about}</span></a>`)}</div>
${checkerCard({ procedure: proceduresIn(category.slug)[0].slug })}</div>`;
  return layout(
    {
      ...ctx,
      title: `${category.name} Costs in India (${SITE.year}): Price Ranges by City`,
      description: `${category.blurb}. See typical ${category.name.toLowerCase()} prices in Indian cities and check if your quote is fair.`,
      schema: [jsonLd(breadcrumbSchema(ctx.origin, items))],
    },
    body
  );
}

export function statePage(ctx, state) {
  const cities = citiesInState(state.name);
  const items = [{ name: "Home", href: "/" }, { name: state.name }];
  const featured = PROCEDURE_HIGHLIGHTS.map((slug) => procedureBySlug(slug)).filter(Boolean);
  const body = html`<div class="wrap">${crumbs(items)}<h1 class="pg">Medical, dental and vet costs in ${state.name}</h1>
<p class="lead">${cities.length} cities and towns in ${state.name}. Pick a city, then a procedure.</p>
<section class="card"><h2>Cities in ${state.name}</h2>
<table><tr><th>City</th><th>Government rate tier</th><th>Popular procedures</th></tr>${cities.map(
    (c) => html`<tr><td>${c.name}</td><td>${TIERS[c.tier].label}</td><td>${featured.map((p) => html`<a href="/cost/${p.slug}/${c.slug}">${p.name}</a> · `)}</td></tr>`
  )}</table></section>${checkerCard({})}</div>`;
  return layout(
    {
      ...ctx,
      title: `Healthcare, Dental & Vet Costs in ${state.name} (${SITE.year}) | City-wise Prices`,
      description: `Compare surgery, scan, dental and vet prices across ${cities.length} cities and towns in ${state.name}, using government rates and published rate cards.`,
      schema: [jsonLd(breadcrumbSchema(ctx.origin, items))],
    },
    body
  );
}

const PROCEDURE_HIGHLIGHTS = ["root-canal", "cataract-surgery", "normal-delivery", "mri-brain", "knee-replacement"];

export function procedureOverviewPage(ctx, procedure, overview) {
  const category = categoryBySlug(procedure.category);
  const items = [{ name: "Home", href: "/" }, { name: category.name, href: `/${category.slug}` }, { name: procedure.name }];
  const byScope = new Map();
  for (const r of overview.published) byScope.set(r.city, r);
  const counts = new Map(overview.reports.map((r) => [r.city, r.n]));
  const rangeFor = (c) => byScope.get(c.slug) || byScope.get(tierSlugOf(c));
  const covered = CITIES.filter((c) => rangeFor(c) || (counts.get(c.slug) || 0) >= MIN_REPORTS);
  const tierRows = Object.values(TIERS).filter((t) => byScope.has(t.slug));
  const states = STATE_LIST.map((s) => ({ s, cities: covered.filter((c) => c.state === s.name) })).filter((g) => g.cities.length);
  const body = html`<div class="wrap">${crumbs(items)}<h1 class="pg">${procedure.name} cost in India (${SITE.year})</h1>
<p class="lead">${procedure.about} Unit: ${procedure.unit}.</p>
${tierRows.length ? html`<section class="card"><h2>Government rate by city tier</h2>
<table><tr><th>City tier</th><th>Reference range</th></tr>${tierRows.map((t) => html`<tr><td>${t.label}</td><td><b>${range(byScope.get(t.slug).low, byScope.get(t.slug).high)}</b></td></tr>`)}</table>
<p class="note">Tiers follow the HRA X/Y/Z city classification as a proxy for CGHS tiers. Pick your city below for its tier.</p></section>` : ""}
<section class="card"><h2>${covered.length ? `Price by city (${covered.length} cities)` : "Price by city"}</h2>
${covered.length ? states.map(({ s, cities }) => html`<h3><a href="/state/${s.slug}">${s.name}</a></h3><p>${cities.map((c) => html`<a href="/cost/${procedure.slug}/${c.slug}">${c.name}</a>${rangeFor(c) && !tierRows.length ? html` <span class="note">${range(rangeFor(c).low, rangeFor(c).high)}</span>` : ""} · `)}</p>`) : html`<p>No city has enough data yet. Be the first to share a price below.</p>`}</section>
${checkerCard({ procedure: procedure.slug })}${reportCard({ procedure: procedure.slug })}</div>`;
  return layout(
    {
      ...ctx,
      noindex: !covered.length,
      title: `${procedure.name} Cost in India (${SITE.year}): Prices by City`,
      description: `How much does ${procedure.name.toLowerCase()} cost in India? Compare prices across ${covered.length || "Indian"} cities from published rate cards and government rates.`,
      schema: [jsonLd(breadcrumbSchema(ctx.origin, items))],
    },
    body
  );
}

export function pricePage(ctx, procedure, city, published, reportPrices, scope = "city") {
  const category = categoryBySlug(procedure.category);
  const national = city.slug === NATIONAL.slug;
  const place = national ? "India" : city.name;
  const items = [
    { name: "Home", href: "/" },
    { name: category.name, href: `/${category.slug}` },
    ...(national ? [] : [{ name: procedure.name, href: `/cost/${procedure.slug}` }]),
    { name: national ? procedure.name : city.name },
  ];
  const ref = referenceRange(published);
  const community = reportPrices.length >= MIN_REPORTS ? summarize(reportPrices) : null;
  // A city page that only shows the national fallback would duplicate the national page, so keep it out of the index.
  const indexable = !!community || (!!ref && (national || scope !== "national"));
  const asOf = published.length ? published.map((p) => p.asOf).sort().at(-1) : null;
  const tierNote = !national && scope === "tier" ? `${city.name} (${city.state}) is a ${TIERS[city.tier].label}, so the government reference rate is scaled for that tier.` : "";
  const fallbackNote = !national && scope === "national" ? `No ${city.name}-specific price has been published yet, so these are national figures.` : "";
  const sameState = citiesInState(city.state).filter((c) => c.slug !== city.slug);

  const headline = community ? `Typical price paid: ${range(community.p25, community.p75)}` : ref ? `Published price: ${range(ref.low, ref.high)}` : "No price data yet";
  const summaryText = [
    ref && `${procedure.name} in ${place} is published at ${range(ref.low, ref.high)} ${procedure.unit} across ${published.length} source${published.length > 1 ? "s" : ""}.`,
    community && `${community.count} people reported paying a median of ${inr(community.median)} (middle half: ${range(community.p25, community.p75)}).`,
  ].filter(Boolean);

  const faq = [
    { q: `How much does ${procedure.name.toLowerCase()} cost in ${place}?`, a: summaryText.join(" ") || `We do not have enough data for ${place} yet.` },
    { q: `Why do ${procedure.name.toLowerCase()} quotes vary?`, a: `${procedure.about} Quotes also differ by clinic or hospital tier, doctor experience, materials and what is included, so always ask for an itemised estimate.` },
    { q: "How should I use these numbers?", a: "Treat them as a reference range, not a guarantee. If your quote is far above the range, ask what is included and get a second opinion." },
  ];

  const body = html`<div class="wrap">${crumbs(items)}<h1 class="pg">${procedure.name} cost in ${place} (${SITE.year})</h1>
<p class="lead">${procedure.about}</p>
<section class="card"><div class="note">${procedure.unit}</div><div class="big">${headline}</div>
${summaryText.map((t) => html`<p>${t}</p>`)}
${tierNote || fallbackNote ? html`<p class="note">${tierNote} ${fallbackNote}</p>` : ""}
${community ? html`<p class="note">Community data: ${community.count} anonymous reports. Range shows the middle half.</p>` : html`<p class="note">Fewer than ${MIN_REPORTS} community reports so far. <a href="#report">Add what you paid</a>.</p>`}</section>
${published.length ? html`<section class="card"><h2>Published prices</h2><table><tr><th>Source</th><th>Price</th><th>What it covers</th></tr>${published.map(
    (p) => html`<tr><td><a href="${p.url}" rel="nofollow noopener" target="_blank">${p.source}</a><br><span class="note">checked ${dateLabel(p.asOf)}</span></td><td><b>${range(p.low, p.high)}</b></td><td>${p.label}</td></tr>`
  )}</table>
<p class="note">${procedure.category === "hospital" ? "Government (CGHS) rates are reimbursement ceilings for empanelled hospitals, not what every hospital charges. Private bills can be higher." : "Chain rate cards usually list starting prices. Independent clinics and complex cases can differ."}</p></section>` : ""}
<section class="card"><h2>Frequently asked questions</h2>${faq.map((f) => html`<details><summary>${f.q}</summary><p>${f.a}</p></details>`)}</section>
${checkerCard({ procedure: procedure.slug, city: city.slug })}${reportCard({ procedure: procedure.slug, city: city.slug })}
${national ? "" : html`<section class="card"><h2>${procedure.name} in other ${city.state} cities</h2><p>${sameState.slice(0, 60).map((c) => html`<a href="/cost/${procedure.slug}/${c.slug}">${c.name}</a> · `)}<a href="/state/${STATE_LIST.find((s) => s.name === city.state).slug}">All ${city.state} cities</a> · <a href="/cost/${procedure.slug}">All cities</a></p></section>`}</div>`;

  return layout(
    {
      ...ctx,
      noindex: !indexable,
      title: `${procedure.name} Cost in ${place} (${SITE.year}): Price Range & Quote Checker`,
      description: `${summaryText[0] || `Check ${procedure.name.toLowerCase()} prices in ${place}.`} Compare your quote with real prices${asOf ? `, updated ${dateLabel(asOf)}` : ""}.`.slice(0, 300),
      schema: [
        jsonLd(breadcrumbSchema(ctx.origin, items)),
        jsonLd({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }),
      ],
    },
    body
  );
}

export function aboutPage(ctx) {
  const items = [{ name: "Home", href: "/" }, { name: "How we get our data" }];
  const body = html`<div class="wrap">${crumbs(items)}<h1 class="pg">How we get our data</h1>
<section class="card"><h2>Three kinds of prices</h2>
<p><b>Published rate cards.</b> Starting prices that dental chains (Clove Dental, Sabka Dentist) list on their public websites, per city or region. Clove shows the same price on every city page; Sabka publishes separate lists for Maharashtra, Gujarat and Bangalore. Each row links to its source and shows when we last checked it.</p>
<p><b>Government rates.</b> Hospital, scan, lab and some dental figures come from the Central Government Health Scheme (CGHS) package rate list, effective 13 October 2025. They are reimbursement ceilings for empanelled hospitals, not what every private hospital charges. CGHS pays 10% less in Tier Y cities and 20% less in Tier Z towns, and non-NABH hospitals get 85% of the NABH rate; we show the range between those. We use the Government of India HRA X/Y/Z city classification as a proxy for CGHS tiers, so a city's tier may differ slightly from its official CGHS tier.</p>
<p><b>Vet prices.</b> National ranges taken from published price guides by vet chains and pet-care sites. They do not vary by city.</p>
<p><b>Prices paid by real people.</b> Anonymous reports from visitors. Once a city has ${MIN_REPORTS}+ reports for a procedure, community figures replace published ranges in the quote checker. We keep only the procedure, city, price and year, plus a salted hash of the network address to stop duplicate submissions. This starts empty and grows as people contribute.</p></section>
<section class="card"><h2>Coverage and limits</h2><p>We list ${CITIES.length} cities and towns across ${STATE_LIST.length} states and union territories. It is a curated list, not every town in India. Government-rate pages exist for every listed city; city-specific dental rate cards exist only where a chain publishes them. Nothing here is medical advice, and your final cost depends on your case.</p></section></div>`;
  return layout(
    { ...ctx, title: "How FairBill gets its price data", description: "Where FairBill's dental, hospital and vet prices come from: published rate cards, CGHS government rates and anonymous community reports.", schema: [jsonLd(breadcrumbSchema(ctx.origin, items))] },
    body
  );
}

export function notFoundPage(ctx) {
  return layout(
    { ...ctx, noindex: true, title: "Page not found", description: "This page does not exist." },
    html`<div class="wrap"><h1 class="pg">Page not found</h1><p class="lead"><a href="/">Back to FairBill</a></p></div>`
  );
}
