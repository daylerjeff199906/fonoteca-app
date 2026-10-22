import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const screens = [...walk(join(root, "app/dashboard")), ...walk(join(root, "components/dashboard"))]
  .filter((f) => f.endsWith(".tsx"))
  .map((file) => ({ name: relative(root, file).split("\\").join("/"), text: readFileSync(file, "utf8") }));

// La vista previa de importación masiva no es un listado: muestra filas de un archivo y se desplaza a propósito.
const PREVIEW_ONLY = ["components/dashboard/bulk/bulk-client.tsx"];
const withTable = screens.filter((s) => /<Table[\s>]/.test(s.text) && !PREVIEW_ONLY.includes(s.name));

test("hay pantallas con tabla que revisar", () => {
  assert.ok(withTable.length >= 10);
});

test("toda tabla administrativa usa el contenedor y el estado vacío compartidos", () => {
  const offenders = withTable
    .filter((s) => !s.text.includes("<DataTableCard") || !s.text.includes("<TableEmptyRow"))
    .map((s) => s.name);
  assert.deepEqual(offenders, []);
});

test("el contenedor de la tabla no añade un segundo scroll vertical", () => {
  const offenders = withTable
    .filter((s) => /<Table[\s>][\s\S]*?<\/Table>/.test(s.text))
    .filter((s) => /<DataTableCard[^>]*(overflow-y|max-h-|h-\[)/.test(s.text))
    .map((s) => s.name);
  assert.deepEqual(offenders, []);
});

test("las tablas con casilla de selección tienen acciones masivas", () => {
  const offenders = withTable
    .filter((s) => /aria-label="Seleccionar todos"|aria-label=\{`Seleccionar /.test(s.text))
    .filter((s) => !/BulkActionBar|MultipleDeleteConfirmDialog|handleBulk|handleMultipleDelete|exportSelected|selectedIds\.length > 0/.test(s.text))
    .map((s) => s.name);
  assert.deepEqual(offenders, []);
});

test("la paginación se oculta cuando no hay resultados", () => {
  const pagination = readFileSync(join(root, "components/dashboard/pagination-buttons.tsx"), "utf8");
  assert.match(pagination, /totalCount <= 0\) return null/);
});

test("el contenedor del dashboard no limita el ancho con .container", () => {
  const layout = readFileSync(join(root, "app/dashboard/layout.tsx"), "utf8");
  assert.doesNotMatch(layout, /className="container /);
});

test("la tabla base tiene altura mínima y máxima, desplazamiento interno y cabecera fija", () => {
  const table = readFileSync(join(root, "components/ui/table.tsx"), "utf8");
  assert.match(table, /min-h-\[[^\]]+\][^"]*max-h-\[[^\]]+\][^"]*overflow-auto/);
  assert.match(table, /sticky top-0/);
});
