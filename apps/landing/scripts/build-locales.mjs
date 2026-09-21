// Generates en/index.html and km/index.html from templates/page.html + content/<locale>.json.
// Minimal mustache-like syntax: {{path.to.value}} and {{#each path}}...{{/each}} with {{this.x}} inside.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const templatePath = resolve(root, "templates/page.html");
const template = readFileSync(templatePath, "utf-8");

const locales = ["en", "km"];

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function render(tpl, data) {
  // Handle {{#each path}}...{{/each}} blocks first (non-nested).
  let out = tpl.replace(/{{#each ([\w.]+)}}([\s\S]*?){{\/each}}/g, (_match, path, block) => {
    const items = getPath(data, path);
    if (!Array.isArray(items)) return "";
    return items
      .map((item) => block.replace(/{{this\.([\w.]+)}}/g, (_m, key) => getPath(item, key) ?? ""))
      .join("");
  });

  // Handle remaining {{path}} placeholders.
  out = out.replace(/{{([\w.]+)}}/g, (_match, path) => {
    const value = getPath(data, path);
    return value == null ? "" : String(value);
  });

  return out;
}

for (const locale of locales) {
  const contentPath = resolve(root, `content/${locale}.json`);
  const data = JSON.parse(readFileSync(contentPath, "utf-8"));
  const html = render(template, data);

  const outDir = resolve(root, locale);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), html);
  console.log(`Generated ${locale}/index.html`);
}
