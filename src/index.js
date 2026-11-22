import { text, json } from "./lib/http.js";
import { CLIENT_JS } from "./views/client.js";
import { postReport, getCheck } from "./routes/api.js";
import { renderPage } from "./routes/pages.js";
import { robots, sitemapIndex, sitemapFile } from "./routes/seo.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    try {
      if (pathname === "/api/reports") return request.method === "POST" ? await postReport(request, env) : json({ error: "Method not allowed." }, 405);
      if (pathname === "/api/check") return await getCheck(request, env);
      if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "Method not allowed." }, 405);
      if (pathname === "/app.js") return text(CLIENT_JS, "application/javascript; charset=utf-8");
      if (pathname === "/robots.txt") return robots(url.origin);
      if (pathname === "/sitemap.xml") return await sitemapIndex(url.origin, env.DB);
      const sm = pathname.match(/^\/sitemaps\/([a-z0-9-]+)\.xml$/);
      if (sm) return (await sitemapFile(url.origin, env.DB, sm[1])) || new Response("Not found", { status: 404 });
      return await renderPage(url, env);
    } catch (err) {
      console.error(err);
      return json({ error: "Something went wrong." }, 500);
    }
  },
};
