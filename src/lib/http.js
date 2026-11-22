const SECURITY = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
};

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...SECURITY } });

export const page = (body, status = 200, cache = "public, max-age=300") =>
  new Response(String(body), {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": status === 200 ? cache : "no-store", ...SECURITY },
  });

export const text = (body, type, cache = "public, max-age=3600") =>
  new Response(body, { headers: { "content-type": type, "cache-control": cache } });

export async function ipHash(request) {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fairbill:" + ip));
  return [...new Uint8Array(d)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}
