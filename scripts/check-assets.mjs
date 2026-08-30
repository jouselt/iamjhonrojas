// scripts/check-assets.mjs — fails if any <img src> / css url() references a missing file.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let missing = [];

// HTML <img src> and <link href> and preload
const html = readFileSync(join(root, "index.html"), "utf8");
const htmlRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1])
  .filter((s) => !/^(https?:|mailto:|tel:|#)/.test(s) && !s.startsWith("data:"));
for (const ref of htmlRefs) {
  const p = join(root, ref);
  if (!existsSync(p)) missing.push("HTML: " + ref);
}

// JS fetch() string literals starting with data/ or assets/
for (const f of ["js/bio.js", "js/scroll.js"]) {
  const js = readFileSync(join(root, f), "utf8");
  const refs = [...js.matchAll(/(?:fetch\()["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(data\/|assets\/)/.test(ref) && !existsSync(join(root, ref))) missing.push(f + ": " + ref);
  }
}

// CSS-like url() in inline style attributes of index.html (chapter layers)
const htmlStyleRefs = [...html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1])
  .filter((s) => s.startsWith("assets/"));
for (const ref of htmlStyleRefs) {
  const p = join(root, ref);
  if (!existsSync(p)) missing.push("HTML style: " + ref);
}
for (const f of ["css/tokens.css", "css/base.css"]) {
  const css = readFileSync(join(root, f), "utf8");
  const refs = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]);
  const cssDir = dirname(join(root, f));
  for (const ref of refs) {
    if (!/^(https?:|data:)/.test(ref) && !existsSync(join(cssDir, ref))) missing.push(f + ": " + ref);
  }
}

if (missing.length) {
  console.error("ASSET CHECK FAILED:");
  missing.forEach((m) => console.error("  - " + m));
  process.exit(1);
}
console.log("ASSET CHECK OK — all local refs resolve.");
console.log("Images in assets/img:", readdirSync(join(root, "assets/img")).filter((f) => statSync(join(root, "assets/img", f)).isFile()).length);
