#!/usr/bin/env node
/**
 * Builds distributable skin CSS:
 *   dist/dark-base.css
 *   dist/dark-tablet.css
 *   dist/dark-phone.css
 *   dist/light-base.css
 *   dist/light-tablet.css
 *   dist/light-phone.css
 *   dist/ao3-user-skins.css
 *
 * The mobile/tablet fix files have no media queries of their own. AO3 applies
 * them through each skin's Advanced Media setting; putting @media blocks in a
 * single AO3 skin does not survive AO3's CSS cleaner.
 *
 * Breakpoints used by the original instructions and otwarchive's own CSS:
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

function withCharset(css) {
  return `@charset "UTF-8";\n\n${stripCharset(css).trimEnd()}\n`;
}

function titleCase(value) {
  return value[0].toUpperCase() + value.slice(1);
}

function writeDistFile(filename, css) {
  const outPath = join(DIST, filename);
  writeFileSync(outPath, css);
  console.log(`✓ wrote ${outPath}`);
}

function skinBlock(title, css, comments = []) {
  return [
    `/* SKIN: ${title} */`,
    ...comments.map((comment) => `/* ${comment} */`),
    stripCharset(css).trim(),
    "/* END SKIN */",
  ].join("\n\n");
}

for (const theme of ["dark", "light"]) {
  const base = stripCharset(readFileSync(join(ROOT, `${theme}.css`), "utf8"));
  const label = titleCase(theme);

  writeDistFile(`${theme}-base.css`, withCharset(base));
  writeDistFile(`${theme}-tablet.css`, withCharset(tablet));
  writeDistFile(`${theme}-phone.css`, withCharset(mobile));

  importBlocks.push(
    skinBlock(`AO3 Tide ${label} Base`, base, [
      "Use as a parent skin. Leave Advanced Media as default/all.",
      "PARENT_ONLY",
    ]),
    skinBlock(`AO3 Tide ${label} Tablet`, tablet, [
      `Use as a parent skin. In Advanced Media, select only screen and (max-width: ${TABLET_BP}); clear all/screen.`,
      "PARENT_ONLY",
    ]),
    skinBlock(`AO3 Tide ${label} Phone`, mobile, [
      `Use this skin. In Advanced Media, select only screen and (max-width: ${PHONE_BP}); clear all/screen.`,
      `PARENTS: AO3 Tide ${label} Base, AO3 Tide ${label} Tablet`,
    ]),
  );
}

const importPath = join(DIST, "ao3-user-skins.css");
writeFileSync(importPath, `${importBlocks.join("\n\n")}\n`);
console.log(`✓ wrote ${importPath}`);
