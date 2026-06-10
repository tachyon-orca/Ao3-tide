#!/usr/bin/env node
/**
 * Combines the 4 skin CSS files into standalone skins:
 *   dist/dark-combined.css
 *   dist/light-combined.css
 *   dist/ao3-user-skins.css
 *
 * The mobile/tablet fix files have no media queries of their own —
 * they are normally applied by AO3's skin system based on device detection.
 * Here we wrap them in @media rules matching the breakpoints used in
 * the otwarchive's own responsive CSS:
 *   62em → 25-media-midsize.css (tablet/iPad)
 *   42em → 26-media-narrow.css  (phone)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const TABLET_BP = "62em";
const PHONE_BP = "42em";

mkdirSync(DIST, { recursive: true });

const tablet = readFileSync(join(ROOT, "ipad-fix.css"), "utf8");
const mobile = readFileSync(join(ROOT, "mobile-fix.css"), "utf8");
const importBlocks = [];

function stripCharset(css) {
  return css.replace(/^\s*@charset\s+["'][^"']+["'];\s*/i, "");
}

for (const theme of ["dark", "light"]) {
  const base = stripCharset(readFileSync(join(ROOT, `${theme}.css`), "utf8"));

  const combined = [
    '@charset "UTF-8";',
    `/* === ${theme.toUpperCase()} BASE === */`,
    base,
    `/* === TABLET OVERRIDES (max-width: ${TABLET_BP}) === */`,
    `@media screen and (max-width: ${TABLET_BP}) {\n${tablet}\n}`,
    `/* === PHONE OVERRIDES (max-width: ${PHONE_BP}) === */`,
    `@media screen and (max-width: ${PHONE_BP}) {\n${mobile}\n}`,
  ].join("\n\n");

  const outPath = join(DIST, `${theme}-combined.css`);
  writeFileSync(outPath, combined);
  console.log(`✓ wrote ${outPath}`);

  importBlocks.push([
    `/* SKIN: AO3 Tide ${theme[0].toUpperCase() + theme.slice(1)} */`,
    combined.replace(/^@charset "UTF-8";\n\n/, ""),
    "/* END SKIN */",
  ].join("\n\n"));
}

const importPath = join(DIST, "ao3-user-skins.css");
writeFileSync(importPath, `${importBlocks.join("\n\n")}\n`);
console.log(`✓ wrote ${importPath}`);
