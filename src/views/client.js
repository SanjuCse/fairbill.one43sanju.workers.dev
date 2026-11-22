// Browser script for the quote checker and report forms (served at /app.js).
export const CLIENT_JS = `
const $ = (s, r = document) => r.querySelector(s);
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function show(box, cls, html) { box.className = 'res ' + cls; box.innerHTML = html; box.hidden = false; }

function wire(form, onSubmit) {
  const box = $('.res', form.parentElement);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button', form); btn.disabled = true;
    try { await onSubmit(Object.fromEntries(new FormData(form)), box, form); }
    catch { show(box, 'err', 'Network problem. Please try again.'); }
    btn.disabled = false;
  });
}

const check = $('#check-form');
if (check) wire(check, async (d, box) => {
  const r = await (await fetch('/api/check?' + new URLSearchParams(d))).json();
  if (r.error) return show(box, 'err', esc(r.error));
  if (!r.found) return show(box, '', 'We have no price data for this combination yet. Share what you paid to help the next person.');
  const msg = { low: 'Below the usual range. Good price, but confirm what is included.', fair: 'Within the usual range.', high: 'Above the usual range. Ask for an itemised bill or a second opinion.', very_high: 'Well above the usual range. Get a second quote before paying.' }[r.verdict];
  const basis = r.basis === 'community' ? 'Based on ' + r.count + ' prices paid by real people (middle half of reports).' : 'Based on published rate cards and government rates.';
  show(box, r.verdict, '<b>' + msg + '</b><br>Your quote ' + inr(r.quote) + ' vs typical ' + inr(r.low) + ' – ' + inr(r.high) + '.<br><span class="note">' + basis + '</span>');
});

const add = $('#report-form');
if (add) wire(add, async (d, box, form) => {
  const res = await fetch('/api/reports', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
  const j = await res.json();
  if (j.ok) { show(box, 'fair', 'Thank you! Your report was added anonymously.'); form.reset(); const y = $('[name=year]', form); if (y) y.value = new Date().getFullYear(); }
  else show(box, 'err', esc(j.error || 'Something went wrong.'));
});
`;
