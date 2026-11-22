import { html, raw } from "../lib/html.js";
import { SITE, CATEGORIES } from "../data/catalog.js";
import { CSS } from "./styles.js";

/**
 * @param {{origin:string, path:string, title:string, description:string, noindex?:boolean, schema?:any[], hero?:any}} meta
 */
export function layout(meta, body) {
  const url = meta.origin + meta.path;
  const title = meta.title.includes(SITE.name) ? meta.title : `${meta.title} | ${SITE.name}`;
  return html`<!doctype html>
<html lang="en-IN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${meta.description}">
<link rel="canonical" href="${url}">
${meta.noindex ? raw('<meta name="robots" content="noindex,follow">') : raw('<meta name="robots" content="index,follow,max-snippet:-1">')}
<meta name="theme-color" content="#0b7a5f">
<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${meta.description}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<style>${raw(CSS)}</style>
${meta.schema || []}
</head><body>
<header class="site"><div class="wrap"><a class="logo" href="/">Fair<b>Bill</b></a>
<nav>${CATEGORIES.map((c) => html`<a href="/${c.slug}">${c.name}</a>`)}<a href="/about">Method</a></nav></div></header>
${body}
<div class="wrap"><footer>
<p><b>${SITE.name}</b> compares quotes with published rate cards, government rates and prices paid by real people. It is not medical or financial advice; actual costs vary by case. Prices in ₹.</p>
<p>${CATEGORIES.map((c) => html`<a href="/${c.slug}">${c.name} costs</a> · `)}<a href="/about">How we get our data</a></p>
</footer></div>
<script src="/app.js" defer></script>
</body></html>`;
}

export const crumbs = (items) =>
  html`<div class="crumbs">${items.map((it, i) => (it.href ? html`<a href="${it.href}">${it.name}</a>` : html`${it.name}`)).flatMap((x, i, a) => (i < a.length - 1 ? [x, raw(" › ")] : [x]))}</div>`;

export function breadcrumbSchema(origin, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, ...(it.href ? { item: origin + it.href } : {}) })),
  };
}
