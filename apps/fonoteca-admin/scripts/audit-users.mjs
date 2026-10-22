// Inventario de usuarios y roles. SOLO LECTURA: no crea, modifica ni elimina cuentas.
//
//   BACKEND_API_URL=https://.../api/v1 ADMIN_ACCESS_TOKEN=<token de un administrador> \
//     node scripts/audit-users.mjs
//
// Escribe reports/user-audit-<fecha>.md (contiene correos: no se versiona ni se comparte fuera del equipo).

import { mkdirSync, writeFileSync } from "node:fs";
import { buildUserAuditReport, renderUserAuditMarkdown } from "../lib/user-audit.ts";

const base = (process.env.BACKEND_API_URL ?? "").replace(/\/$/, "");
const token = process.env.ADMIN_ACCESS_TOKEN;
if (!base || !token) {
  console.error("Defina BACKEND_API_URL y ADMIN_ACCESS_TOKEN.");
  process.exit(1);
}

const roleCodes = (user) =>
  user.roles?.map((role) => (typeof role === "string" ? role : role.code)).filter(Boolean) ??
  user.user_roles?.map((entry) => entry.roles?.code).filter(Boolean) ??
  [];

const users = [];
for (let page = 1; ; page += 1) {
  const response = await fetch(`${base}/users?page=${page}&limit=100`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
  if (!response.ok) {
    console.error(`El backend respondió HTTP ${response.status} al consultar usuarios.`);
    process.exit(1);
  }
  const payload = await response.json();
  const records = Array.isArray(payload) ? payload : (payload.data ?? []);
  users.push(...records.map((u) => ({ id: String(u.id), email: u.email ?? "", name: u.name ?? [u.first_name, u.last_name].filter(Boolean).join(" "), roles: roleCodes(u) })));
  const totalPages = payload.meta?.totalPages ?? 1;
  if (Array.isArray(payload) || page >= totalPages) break;
}

const report = buildUserAuditReport(users);
const stamp = new Date().toISOString().slice(0, 10);
mkdirSync(new URL("../reports/", import.meta.url), { recursive: true });
const file = new URL(`../reports/user-audit-${stamp}.md`, import.meta.url);
writeFileSync(file, renderUserAuditMarkdown(report));

console.log(`Cuentas analizadas: ${report.total}`);
console.log(`Posibles semilla/prueba: ${report.likelyTestAccounts.length} · Duplicados: ${report.duplicates.length} · Roles acumulados: ${report.accumulatedRoles.length} · Sin rol: ${report.withoutRoles.length}`);
console.log(`Informe: ${file.pathname}`);
