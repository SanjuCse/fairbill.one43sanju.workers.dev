export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

export const range = (low, high) => (low === high ? inr(low) : `${inr(low)} – ${inr(high)}`);

export const dateLabel = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
