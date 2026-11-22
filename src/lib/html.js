const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Raw(s);

// Tagged template: interpolated values are escaped unless wrapped in raw() or produced by html``.
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => {
    const part = Array.isArray(v) ? v.map((x) => (x instanceof Raw ? x.s : escape(x))).join("") : v instanceof Raw ? v.s : escape(v);
    out += part + strings[i + 1];
  });
  return new Raw(out);
}

export const jsonLd = (obj) => raw(`<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`);
