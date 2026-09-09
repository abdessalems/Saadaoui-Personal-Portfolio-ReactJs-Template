/**
 * Give each route its own HTML file.
 *
 * The app is one bundle behind one index.html, so every route shipped the
 * homepage's title, description and share card. Googlebot runs the JavaScript
 * and eventually sees the corrected head — but the crawler's first pass does
 * not, and the scrapers behind LinkedIn, Facebook, Slack and X never run it at
 * all. Sharing /boxing showed the homepage card.
 *
 * So after the build, each route gets a copy of index.html with its own tags
 * substituted in. Same bundle, same hashed asset names, correct head before a
 * line of JavaScript runs. vercel.json points the route at its file.
 *
 * Run automatically as npm's postbuild step.
 */
import fs from "node:fs";
import path from "node:path";

import meta from "../src/data/RouteMetaData.json" with { type: "json" };
import { renderRoutes } from "./render-routes.mjs";
import { writeSitemap } from "./sitemap.mjs";

const BUILD = path.resolve("build");
const SITE = "https://www.saadaoui.it.com";

const escape = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Replace the content of a meta/link tag already present in index.html. */
function set(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: no tag matched ${pattern}`);
  return html.replace(pattern, replacement);
}

const template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");

/*
 * The body, not only the head.
 *
 * Each route's markup is rendered by React here, at build time, and placed
 * inside the root element, so the words are in the file rather than assembled
 * by a script afterwards. Google runs JavaScript and was indexing the site
 * regardless — but its first pass saw an empty page, nothing that skips
 * scripts saw anything at all, and a bundle that failed to load left a reader
 * with a single sentence asking them to enable JavaScript.
 */
const bodies = await renderRoutes(Object.keys(meta.routes));

/** Puts rendered markup inside the empty root element. */
function withBody(html, route) {
  const body = bodies[route];
  if (!body) return html;
  return set(html, /<div id="root">\s*<\/div>/, `<div id="root">${body}</div>`);
}

// The home page is the template itself, so it is written back over index.html.
fs.writeFileSync(path.join(BUILD, "index.html"), withBody(template, "/"));
console.log("prerendered / -> build/index.html");

for (const [route, page] of Object.entries(meta.routes)) {
  // "/" has just been written from the template above.
  if (route === "/") continue;

  const url = `${SITE}${route}`;
  const title = escape(page.title);
  const description = escape(page.description);

  let html = template;
  html = set(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = set(html, /<meta name="description" content="[^"]*" ?\/>/,
    `<meta name="description" content="${description}" />`);
  html = set(html, /<link rel="canonical" href="[^"]*" ?\/>/,
    `<link rel="canonical" href="${url}" />`);
  html = set(html, /<meta property="og:title" content="[^"]*" ?\/>/,
    `<meta property="og:title" content="${title}" />`);
  html = set(html, /<meta property="og:description" content="[^"]*" ?\/>/,
    `<meta property="og:description" content="${description}" />`);
  html = set(html, /<meta property="og:url" content="[^"]*" ?\/>/,
    `<meta property="og:url" content="${url}" />`);
  html = set(html, /<meta name="twitter:title" content="[^"]*" ?\/>/,
    `<meta name="twitter:title" content="${title}" />`);
  html = set(html, /<meta name="twitter:description" content="[^"]*" ?\/>/,
    `<meta name="twitter:description" content="${description}" />`);

  const file = `${route.replace(/^\//, "")}.html`;
  fs.writeFileSync(path.join(BUILD, file), withBody(html, route));
  console.log(`prerendered ${route} -> build/${file}`);
}

// The sitemap is derived from what was just built, so it cannot drift again.
const listed = writeSitemap({
  buildDir: BUILD,
  publicDir: path.resolve("public"),
  routes: Object.keys(meta.routes).map((route) => (route === "/" ? "/" : route)),
});
console.log(`sitemap: ${listed} urls -> build/sitemap.xml`);
