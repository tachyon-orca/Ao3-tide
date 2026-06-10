#!/usr/bin/env node
/**
 * Serves screenshots/ and dist/ from the project root on port 4322.
 * Used by .claude/launch.json for the Claude Preview MCP (screenshots gallery).
 */
import { createServer } from "http";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function buildGallery() {
  const skins = ["dark", "light"];
  const imgs = skins.flatMap((skin) => {
    try {
      return readdirSync(join(ROOT, "screenshots", skin))
        .filter((f) => f.endsWith(".png"))
        .sort()
        .map(
          (f) => `<figure style="margin:8px;display:inline-block;vertical-align:top;background:#222;padding:4px;border-radius:4px">
            <figcaption style="color:#ccc;font:11px monospace;text-align:center">${skin}/${f}</figcaption>
            <img src="/screenshots/${skin}/${f}" style="max-width:380px;display:block">
          </figure>`
        );
    } catch {
      return [];
    }
  });
  return `<!doctype html><html><body style="background:#111;margin:0;padding:8px">${imgs.join("")}</body></html>`;
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url ?? "/");

  if (urlPath === "/" || urlPath === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(buildGallery());
    return;
  }

  if (urlPath.startsWith("/dist/") || urlPath.startsWith("/screenshots/")) {
    const filePath = join(ROOT, urlPath);
    if (existsSync(filePath)) {
      const ext = extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
      res.end(readFileSync(filePath));
      return;
    }
  }

  res.writeHead(404);
  res.end("not found: " + urlPath);
});

server.listen(4322, () => {
  console.log("Screenshot gallery at http://localhost:4322/");
});
