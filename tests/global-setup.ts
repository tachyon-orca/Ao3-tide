/**
 * Playwright global setup: starts the static file server for test_page/ once,
 * before any workers start. The server PID is written to a temp file so
 * global-teardown.ts can shut it down.
 */
import { createServer } from "http";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEST_PAGE_DIR = join(ROOT, "test_page");
const WORK_HTML =
  "The Complicated Logistics of Creating a Successful Superhero Duo - Chapter 1 - Anemones2Hydrangeas - Multifandom [Archive of Our Own].html";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

export const STATIC_PORT = 4321;

export default async function globalSetup() {
  await new Promise<void>((resolve, reject) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url ?? "/");
      const filePath = join(TEST_PAGE_DIR, urlPath === "/" ? WORK_HTML : urlPath);
      if (existsSync(filePath)) {
        const ext = extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
        res.end(readFileSync(filePath));
      } else {
        res.writeHead(404);
        res.end("Not found: " + urlPath);
      }
    });
    server.on("error", reject);
    server.listen(STATIC_PORT, () => {
      // Store server reference on global so teardown can close it
      (globalThis as any).__staticServer = server;
      console.log(`\n  Static server started on http://localhost:${STATIC_PORT}/`);
      resolve();
    });
  });
}
