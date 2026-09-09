/**
 * Render each route to HTML at build time.
 *
 * The head of every page is already correct — prerender.mjs sees to that — but
 * the body shipped as an empty <div id="root"> and the words "You need to
 * enable JavaScript to run this app". Google runs the JavaScript and indexes
 * the site anyway, so this is not the emergency it is often described as; what
 * it costs is a slower first pass, nothing at all if a script fails to load,
 * and no text for any reader that does not execute JavaScript.
 *
 * The app is built by Create React App, which has no server build, so esbuild
 * makes one: the same components compiled for Node, rendered through React's
 * own renderToString against a static router. Nothing about the browser bundle
 * changes.
 *
 * Two things make this simpler than it usually is. No component imports an
 * image as a module — every picture is a URL string in the data — so there is
 * nothing for a loader to resolve. And every use of window or document sits
 * inside an effect, which never runs on the server.
 */
import { build } from "esbuild";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO = path.resolve(import.meta.dirname, "..");

/** A server entry that renders one route. Written beside the sources so its
 *  relative imports resolve exactly as the app's own do. */
const ENTRY = `
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export function render(route) {
  return renderToString(
    React.createElement(StaticRouter, { location: route },
      React.createElement(App)),
  );
}
`;

export async function renderRoutes(routes) {
  const entryPath = path.join(REPO, "src", "__ssr-entry.jsx");
  const outFile = path.join(os.tmpdir(), `ssr-${Date.now()}.mjs`);

  fs.writeFileSync(entryPath, ENTRY, "utf8");

  try {
    await build({
      entryPoints: [entryPath],
      outfile: outFile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      jsx: "automatic",
      logLevel: "silent",
      loader: {
        // Create React App allows JSX inside .js, which esbuild does not
        // assume; App.js is written that way.
        ".js": "jsx",
        // Stylesheets say nothing about the markup, and the browser bundle
        // already carries them.
        ".css": "empty",
        ".scss": "empty",
        ".sass": "empty",
      },
      define: { "process.env.NODE_ENV": '"production"' },
      /*
       * React's server renderer is CommonJS and reaches for Node's stream
       * module through require, which does not exist in an ES module. This is
       * the usual bridge: give the bundle a require of its own.
       */
      banner: {
        js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
      },
    });

    const { render } = await import(pathToFileURL(outFile).href);

    const rendered = {};
    for (const route of routes) {
      rendered[route] = render(route);
    }
    return rendered;
  } finally {
    fs.rmSync(entryPath, { force: true });
    fs.rmSync(outFile, { force: true });
  }
}
