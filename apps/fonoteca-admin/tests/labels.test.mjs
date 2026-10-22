import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTE_PATTERNS, getBreadcrumbs, getPageTitle, routeLabel } from "../config/route-labels.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const norm = (p) => p.split("\\").join("/");

const pagePaths = walk(join(root, "app/dashboard"))
  .map(norm)
  .filter((f) => f.endsWith("/page.tsx"))
  .map((f) => "/dashboard/" + relative(join(root, "app/dashboard"), f).split("\\").join("/").replace(/\/?page\.tsx$/, ""))
  .map((p) => p.replace(/\/$/, "").replace(/\/\([^)]*\)/g, "").replace(/\[[^\]]+\]/g, "[id]"));

test("toda página del dashboard tiene nombre y título en el mapa central", () => {
  // /dashboard/monitoring solo redirige a Eventos de muestreo
  const missing = pagePaths.filter((p) => p !== "/dashboard/monitoring" && !ROUTE_PATTERNS.includes(p));
  assert.deepEqual(missing, []);
});

test("el mapa central no declara páginas inexistentes", () => {
  const extra = ROUTE_PATTERNS.filter((p) => p !== "/dashboard" && !pagePaths.includes(p));
  assert.deepEqual(extra, []);
});

test("migas de pan de eventos de muestreo", () => {
  const crumbs = getBreadcrumbs("/dashboard/monitoring/events");
  assert.deepEqual(crumbs.map((c) => c.label), ["Inicio", "Monitoreo", "Eventos de muestreo"]);
  assert.deepEqual(crumbs.map((c) => c.href), ["/dashboard", "/dashboard/monitoring", undefined]);
});

test("migas de pan de edición con identificador dinámico", () => {
  const crumbs = getBreadcrumbs("/dashboard/monitoring/events/3f2a/edit");
  assert.deepEqual(crumbs.map((c) => c.label), ["Inicio", "Monitoreo", "Eventos de muestreo", "Editar"]);
  assert.equal(crumbs[2].href, "/dashboard/monitoring/events");
});

test("las migas no muestran slugs ni identificadores técnicos", () => {
  const samples = [
    "/dashboard/taxa/classes", "/dashboard/taxa/genera", "/dashboard/audio-requests", "/dashboard/geography/natural-regions",
    "/dashboard/occurrences/9c1d/multimedia", "/dashboard/monitoring/register/events/9c1d/occurrences", "/dashboard/users",
  ];
  for (const path of samples) {
    for (const crumb of getBreadcrumbs(path)) {
      assert.doesNotMatch(crumb.label, /[-_/]|^[0-9a-f]{4,}$/i, `${path} -> ${crumb.label}`);
    }
  }
});

test("todo enlace de miga apunta a una página existente", () => {
  const exists = (url) => {
    const parts = url.split("/").filter(Boolean);
    return pagePaths.concat("/dashboard/monitoring").some((p) => {
      const pp = p.split("/").filter(Boolean);
      return pp.length === parts.length && pp.every((seg, i) => seg === "[id]" || seg === parts[i]);
    });
  };
  for (const path of ["/dashboard/taxa/classes", "/dashboard/occurrences/9c1d/edit", "/dashboard/monitoring/register/occurrences/9c1d/multimedia", "/dashboard/multimedia/9c1d/edit"]) {
    for (const crumb of getBreadcrumbs(path)) if (crumb.href) assert.ok(exists(crumb.href), `${path} -> ${crumb.href}`);
  }
});

test("el título superior sale de la ruta", () => {
  assert.equal(getPageTitle("/dashboard/users"), "Usuarios");
  assert.equal(getPageTitle("/dashboard/profile"), "Mi perfil");
  assert.equal(getPageTitle("/dashboard/monitoring/events/ab12/edit"), "Editar evento de muestreo");
  assert.equal(getPageTitle("/dashboard/taxa/orders"), "Órdenes");
  assert.equal(getPageTitle("/dashboard/bulk"), "Operaciones masivas");
});

test("el menú lateral usa los nombres del mapa central", () => {
  const source = readFileSync(join(root, "config/admin-routes.ts"), "utf8");
  assert.doesNotMatch(source, /title:\s*["'`]/, "admin-routes.ts no debe escribir títulos a mano");
  assert.equal(routeLabel("/dashboard/taxa/classes"), "Clases");
  assert.equal(routeLabel("/dashboard/audio-requests"), "Solicitudes de audio");
});

test("los PageHeader no escriben su título a mano", () => {
  const offenders = [...walk(join(root, "app/dashboard")), ...walk(join(root, "components/dashboard"))]
    .filter((f) => f.endsWith(".tsx"))
    .filter((f) => /<PageHeader[^>]*?\btitle="/s.test(readFileSync(f, "utf8")))
    .map((f) => norm(relative(root, f)));
  assert.deepEqual(offenders, []);
});

// --- Auditoría de cadenas visibles ---
const uiFiles = [...walk(join(root, "app")), ...walk(join(root, "components")), ...walk(join(root, "lib/validations"))]
  .map(norm)
  .filter((f) => /\.(tsx?)$/.test(f) && !f.includes("/components/ui/") && !f.includes("/app/api/"));

const visibleStrings = (text) => [...text.matchAll(/"([^"\n]{3,})"|>([^<>{}\n]{3,})</g)].map((m) => m[1] ?? m[2]);

test("no quedan términos en inglés en cadenas visibles", () => {
  const banned = /\b(Classes|Families|Genera|Bulk|Audio-Requests|Draft|Published|Dashboard Overview|Admin Console|Platform|Switch Apps|Delete Project|is required|Invalid [A-Z]\w+ ID)\b/;
  const found = [];
  for (const file of uiFiles) {
    for (const s of visibleStrings(readFileSync(file, "utf8"))) if (banned.test(s)) found.push(`${norm(relative(root, file))}: ${s.trim()}`);
  }
  assert.deepEqual(found, []);
});

test("no quedan textos informales (tuteo) en cadenas visibles", () => {
  const informal = /\b(tu|tus|Tu|Tus|Estás|estás|puedes|Puedes|deseas|Haz clic|Comencemos|inténtalo|Olvidaste)\b/;
  const found = [];
  for (const file of uiFiles) {
    for (const s of visibleStrings(readFileSync(file, "utf8"))) if (informal.test(s)) found.push(`${norm(relative(root, file))}: ${s.trim().slice(0, 80)}`);
  }
  assert.deepEqual(found, []);
});
