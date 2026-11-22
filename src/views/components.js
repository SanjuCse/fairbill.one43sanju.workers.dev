import { html } from "../lib/html.js";
import { STATE_LIST, citiesInState, CATEGORIES, PROCEDURES, NATIONAL } from "../data/catalog.js";

const procedureOptions = (selected) =>
  CATEGORIES.map(
    (c) => html`<optgroup label="${c.name}">${PROCEDURES.filter((p) => p.category === c.slug).map(
      (p) => html`<option value="${p.slug}" ${p.slug === selected ? "selected" : ""}>${p.name}</option>`
    )}</optgroup>`
  );

const cityOptions = (selected, withNational) => [
  ...(withNational ? [html`<option value="${NATIONAL.slug}" ${selected === NATIONAL.slug ? "selected" : ""}>${NATIONAL.name}</option>`] : []),
  ...STATE_LIST.map(
    (s) => html`<optgroup label="${s.name}">${citiesInState(s.name).map((c) => html`<option value="${c.slug}" ${c.slug === selected ? "selected" : ""}>${c.name}</option>`)}</optgroup>`
  ),
];

export function checkerCard({ procedure, city }) {
  return html`<section class="card" id="check"><h2>Check your quote</h2>
<p class="lead">Enter what you were quoted and we'll tell you if it is in the usual range.</p>
<form id="check-form" novalidate><div class="row">
<div><label for="c-proc">Procedure</label><select id="c-proc" name="procedure" required>${procedureOptions(procedure)}</select></div>
<div><label for="c-city">City</label><select id="c-city" name="city" required>${cityOptions(city, true)}</select></div>
<div><label for="c-quote">Your quote (₹)</label><input id="c-quote" name="quote" type="number" min="1" step="1" inputmode="numeric" required></div>
</div><button type="submit">Is this fair?</button></form><div class="res" hidden aria-live="polite"></div></section>`;
}

export function reportCard({ procedure, city }) {
  const year = new Date().getFullYear();
  return html`<section class="card" id="report"><h2>Share what you paid</h2>
<p class="lead">Help others: add a real price anonymously. We store no names, clinics or contact details.</p>
<form id="report-form" novalidate><div class="row">
<div><label for="r-proc">Procedure</label><select id="r-proc" name="procedure" required>${procedureOptions(procedure)}</select></div>
<div><label for="r-city">City</label><select id="r-city" name="city" required>${cityOptions(city === NATIONAL.slug ? "" : city, false)}</select></div>
<div><label for="r-price">Price paid (₹)</label><input id="r-price" name="price" type="number" min="50" step="1" inputmode="numeric" required></div>
<div><label for="r-year">Year</label><input id="r-year" name="year" type="number" min="2023" max="${year}" value="${year}" required></div>
</div><button type="submit">Submit anonymously</button></form><div class="res" hidden aria-live="polite"></div></section>`;
}
