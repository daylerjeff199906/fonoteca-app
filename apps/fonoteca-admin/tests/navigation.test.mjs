import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRedirects } from "../config/legacy-redirects.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const appDir = join(root, "app");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return [full];
  });

// Patrones de ruta (con :param) de cada page.tsx; los grupos (x) no forman parte de la URL.
const pagePatterns = walk(appDir)
  .filter((file) => file.split("\\").join("/").endsWith("/page.tsx"))
  .map((file) =>
    "/" +
    relative(appDir, file)
      .split("\\").join("/")
      .replace(/\/?page\.tsx$/, "")
      .split("/")
      .filter((seg) => seg && !/^\(.*\)$/.test(seg))
      .map((seg) => (/^\[.+\]$/.test(seg) ? ":param" : seg))
      .join("/"),
  )
  .map((p) => (p === "/" ? p : p.replace(/\/$/, "")));

const pageExists = (url) => {
  const path = url.split(/[?#]/)[0].replace(/\$\{[^}]*\}/g, "x").replace(/:\w+/g, "x").replace(/\[id\]/g, "x");
  const segments = path.split("/").filter(Boolean);
  return pagePatterns.some((pattern) => {
    const parts = pattern.split("/").filter(Boolean);
    return parts.length === segments.length && parts.every((part, i) => part === ":param" || part === segments[i]);
  });
};

const sourceFiles = [...walk(join(root, "app")), ...walk(join(root, "components")), ...walk(join(root, "config"))].filter(
  (f) => /\.(tsx?|js)$/.test(f),
);

test("los destinos del sidebar existen", () => {
  const source = readFileSync(join(root, "config/admin-routes.ts"), "utf8");
  const urls = [...source.matchAll(/url:\s*[`"'](\/[^`"']*)[`"']/g)].map((m) => m[1]);
  assert.ok(urls.length > 10);
  const missing = urls.filter((url) => !pageExists(url));
  assert.deepEqual(missing, []);
});

test("todo enlace interno a /dashboard apunta a una página existente", () => {
  const missing = [];
  for (const file of sourceFiles) {
    if (file.endsWith("legacy-redirects.js")) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/[`"'](\/dashboard[^`"'\s]*)[`"']/g)) {
      if (!pageExists(m[1])) missing.push(`${relative(root, file)}: ${m[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("las redirecciones heredadas llevan a páginas existentes y no a otra redirección", () => {
  const sources = new Set(legacyRedirects.map((r) => r.source));
  for (const { source, destination } of legacyRedirects) {
    assert.ok(pageExists(destination), `${source} -> ${destination} no existe`);
    assert.ok(!sources.has(destination), `${source} encadena otra redirección`);
  }
});

test("las rutas heredadas ya no tienen páginas propias (evita 404 por mezcla)", () => {
  assert.equal(existsSync(join(appDir, "dashboard/collections")), false);
  assert.equal(existsSync(join(appDir, "dashboard/events")), false);
});

test("la ruta de monitoreo y la página 404 existen", () => {
  assert.ok(pageExists("/dashboard/monitoring"));
  assert.ok(existsSync(join(appDir, "not-found.tsx")));
});
