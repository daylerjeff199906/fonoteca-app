import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MB, sniffMediaKind, validateMediaBytes, validateMediaMeta } from "../lib/media-rules.ts";
import { canWriteMedia } from "../lib/media-permissions.ts";

const read = (path) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");
const bytes = (...values) => Uint8Array.from([...values, ...new Array(16).fill(0)].slice(0, 16));
const ascii = (text) => [...text].map((c) => c.charCodeAt(0));

const wavHeader = Uint8Array.from([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE"), 0, 0, 0, 0]);
const webpHeader = Uint8Array.from([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP"), 0, 0, 0, 0]);
const jpeg = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0);
const png = bytes(0x89, ...ascii("PNG"), 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0);
const exe = bytes(...ascii("MZ"), 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0xff, 0xff);

test("acepta un WAV válido", () => {
  assert.deepEqual(validateMediaMeta({ name: "canto.wav", size: 5 * MB, type: "audio/wav" }), { ok: true, kind: "audio" });
  assert.deepEqual(validateMediaBytes("canto.wav", wavHeader), { ok: true, kind: "audio" });
});

test("acepta una imagen válida (JPG, PNG, WebP)", () => {
  assert.equal(validateMediaMeta({ name: "ave.jpg", size: MB, type: "image/jpeg" }).ok, true);
  assert.equal(validateMediaBytes("ave.jpg", jpeg).ok, true);
  assert.equal(validateMediaBytes("ave.png", png).ok, true);
  assert.equal(validateMediaBytes("ave.webp", webpHeader).ok, true);
});

test("rechaza formatos no permitidos", () => {
  for (const name of ["virus.exe", "doc.pdf", "video.mp4", "anim.gif", "dibujo.svg", "sin_extension"]) {
    const result = validateMediaMeta({ name, size: MB, type: "" });
    assert.equal(result.ok, false, name);
    assert.match(result.error, /formato permitido/);
  }
});

test("rechaza un MIME que no coincide con la extensión", () => {
  const result = validateMediaMeta({ name: "canto.wav", size: MB, type: "image/png" });
  assert.equal(result.ok, false);
  assert.match(result.error, /no coincide/);
});

test("aplica los límites de tamaño: 40 MB audio, 10 MB imagen", () => {
  assert.equal(validateMediaMeta({ name: "a.wav", size: 40 * MB, type: "audio/wav" }).ok, true);
  assert.match(validateMediaMeta({ name: "a.wav", size: 40 * MB + 1, type: "audio/wav" }).error, /40 MB/);
  assert.equal(validateMediaMeta({ name: "a.jpg", size: 10 * MB, type: "image/jpeg" }).ok, true);
  assert.match(validateMediaMeta({ name: "a.jpg", size: 10 * MB + 1, type: "image/jpeg" }).error, /10 MB/);
  assert.match(validateMediaMeta({ name: "a.wav", size: 0, type: "audio/wav" }).error, /vacío/);
});

test("rechaza un ejecutable renombrado como audio o imagen", () => {
  assert.equal(validateMediaMeta({ name: "malo.wav", size: MB, type: "audio/wav" }).ok, true);
  assert.equal(validateMediaBytes("malo.wav", exe).ok, false);
  assert.equal(validateMediaBytes("malo.jpg", exe).ok, false);
  assert.equal(sniffMediaKind(exe), null);
});

test("rechaza contenido de otro formato con extensión válida", () => {
  assert.equal(validateMediaBytes("foto.jpg", wavHeader).ok, false);
  assert.equal(validateMediaBytes("canto.wav", jpeg).ok, false);
});

test("solo los roles con privilegio de escritura pueden subir archivos", () => {
  assert.equal(canWriteMedia({ roles: ["ADMIN"], permissions: [] }), true);
  assert.equal(canWriteMedia({ roles: ["SUPERADMIN"], permissions: [] }), true);
  assert.equal(canWriteMedia({ roles: ["EDITOR"], permissions: [] }), true);
  assert.equal(canWriteMedia({ roles: ["VIEWER"], permissions: ["data.read"] }), false);
  assert.equal(canWriteMedia({ roles: [], permissions: [] }), false);
  assert.equal(canWriteMedia(null), false);
  assert.equal(canWriteMedia({ roles: ["VIEWER"], permissions: ["*"] }), true);
});

test("toda ruta que usa el token del servicio de archivos exige sesión y rol", () => {
  for (const route of [
    "app/api/files/upload/route.ts",
    "app/api/files/upload-multiple/route.ts",
    "app/api/files/[fileId]/route.ts",
    "app/api/r2/upload/route.ts",
    "app/api/r2/delete/route.ts",
  ]) {
    assert.match(read(route), /requireMediaWrite\(\)/, route);
  }
  for (const route of ["app/api/files/upload/route.ts", "app/api/files/upload-multiple/route.ts", "app/api/r2/upload/route.ts"]) {
    assert.match(read(route), /validateUploadFiles\(/, route);
  }
});

test("las acciones del servidor que tocan archivos exigen permiso de escritura", () => {
  const actions = read("actions/multimedia.ts");
  for (const fn of ["deleteMultimedia", "uploadToFileService", "deleteFileFromFile"]) {
    const body = actions.slice(actions.indexOf(`function ${fn}(`));
    assert.match(body.slice(0, 400), /assertMediaWrite\(\)/, fn);
  }
});

test("el formulario de multimedia sube archivos y ya no pide una URL manual", () => {
  const form = read("components/dashboard/multimedia/multimedia-form.tsx");
  assert.match(form, /<MediaDropzone/);
  assert.doesNotMatch(form, /Identificador \/ URL del Archivo/);
});

test("el listado ofrece búsqueda, filtro de tipo y vista previa", () => {
  assert.match(read("components/dashboard/multimedia/multimedia-filters.tsx"), /Todos[\s\S]*Audio[\s\S]*Imagen/);
  const table = read("components/dashboard/multimedia/multimedia-table.tsx");
  assert.match(table, /<audio /);
  assert.match(table, /<Dialog /);
  assert.match(table, /media\.creator/);
});
