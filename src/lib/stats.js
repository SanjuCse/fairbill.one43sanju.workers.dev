export function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export function summarize(prices) {
  const s = [...prices].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { count: s.length, median: median(s), p25: q(0.25), p75: q(0.75), min: s[0], max: s[s.length - 1] };
}

export const MIN_REPORTS = 3;

// Combines published ranges into one reference range.
export function referenceRange(published) {
  if (!published.length) return null;
  return { low: Math.min(...published.map((p) => p.low)), high: Math.max(...published.map((p) => p.high)) };
}

/**
 * Judges a quote. Community data wins when there are enough reports; otherwise the published range is used.
 * @returns {{basis: string, verdict: string, low: number, high: number} | null}
 */
export function judge(quote, reportPrices, published) {
  if (reportPrices.length >= MIN_REPORTS) {
    const st = summarize(reportPrices);
    const verdict = quote < st.p25 ? "low" : quote <= st.p75 ? "fair" : quote <= st.p75 * 1.5 ? "high" : "very_high";
    return { basis: "community", verdict, low: st.p25, high: st.p75, median: st.median, count: st.count };
  }
  const ref = referenceRange(published);
  if (!ref) return null;
  const verdict = quote < ref.low ? "low" : quote <= ref.high ? "fair" : quote <= ref.high * 1.5 ? "high" : "very_high";
  return { basis: "published", verdict, low: ref.low, high: ref.high };
}
