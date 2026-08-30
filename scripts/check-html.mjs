// scripts/check-html.mjs — lightweight well-formedness check (tag balance + quote balance).
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const h = readFileSync(root + "/index.html", "utf8");

const block = ["html","head","body","header","nav","main","section","footer","ul","ol","li","div","figure","figcaption","script","style","a","p","h1","h2","h3"];
const selfClose = new Set(["img","meta","link","br","input","source","area","base","col","embed","hr","param","track","wbr"]);

const re = /<(\/?)([a-zA-Z0-9]+)(\s[^>]*?)?(\/?)>/g;
let m, stack = [], errors = [];
while ((m = re.exec(h))) {
  const closing = m[1] === "/";
  const tag = m[2].toLowerCase();
  const self = m[4] === "/";
  if (selfClose.has(tag) || self) continue;
  if (closing) {
    if (!stack.length || stack[stack.length - 1] !== tag) {
      errors.push(`unbalanced </${tag}> (stack top: ${stack[stack.length - 1] || "none"})`);
    } else stack.pop();
  } else {
    stack.push(tag);
  }
}
if (stack.length) errors.push("unclosed: " + stack.join(", "));

// quote balance
const dq = (h.match(/"/g) || []).length;
if (dq % 2 !== 0) errors.push("unbalanced double-quotes");

if (errors.length) {
  console.error("HTML CHECK FAILED:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("HTML CHECK OK — tags balanced, quotes balanced.");
