/**
 * Build the sitemap from the pages that actually exist.
 *
 * It was written by hand, and had drifted the way a hand-written list always
 * does: /fa/compare was missing, and /fa/studio was listed although it is an
 * authoring tool rather than something to read. Neither was anybody's mistake
 * exactly — the workspace gained a page and the list did not.
 *
 * So the list is derived instead. The portfolio's own routes come from the
 * metadata that already describes them, and the workspace's from the files in
 * public/fa, each of which is asked whether it wants to be indexed: a page
 * carrying "noindex" is left out, because a sitemap that recommends a page the
 * page itself refuses is a contradiction Search Console will report.
 *
 * Run from prerender.mjs, after the build.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.saadaoui.it.com";

/** How often a section changes, and how much it matters relative to the rest. */
const WEIGHT = [
  { match: /^\/$/, priority: "1.0" },
  { match: /^\/fa\/$/, priority: "0.9" },
  { match: /^\/fa\/(requirements|functional-specification|traceability|swagger-api|test-cases)\/$/, priority: "0.8" },
  { match: /^\/fa\//, priority: "0.7" },
  { match: /./, priority: "0.6" },
];

const priorityFor = (url) => WEIGHT.find((rule) => rule.match.test(url)).priority;

/** A page that asks not to be indexed does not belong in a sitemap. */
function wantsIndexing(file) {
  const html = fs.readFileSync(file, "utf8");
  const robots = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i);
  return !robots || !/noindex/i.test(robots[1]);
}

export function writeSitemap({ buildDir, publicDir, routes }) {
  const urls = new Set(routes);

  /*
   * The workspace is a separate static export copied in whole, so its pages
   * are found by looking rather than by being told about.
   */
  const fa = path.join(publicDir, "fa");
  if (fs.existsSync(fa)) {
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // _next holds assets, and 404 is not a destination.
          if (entry.name === "_next" || entry.name === "404") continue;
          walk(full);
          continue;
        }
        if (entry.name !== "index.html") continue;
        if (!wantsIndexing(full)) continue;

        const url = `/${path.relative(publicDir, dir).split(path.sep).join("/")}/`;
        urls.add(url);
      }
    };
    walk(fa);
  }

  const today = new Date().toISOString().slice(0, 10);
  const body = [...urls]
    .sort((a, b) => Number(priorityFor(b)) - Number(priorityFor(a)) || a.localeCompare(b))
    .map(
      (url) =>
        `  <url>\n` +
        `    <loc>${SITE}${url}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>${priorityFor(url)}</priority>\n` +
        `  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  // Written to both, so `npm start` serves the same list the build publishes.
  fs.writeFileSync(path.join(buildDir, "sitemap.xml"), xml);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);

  return urls.size;
}
