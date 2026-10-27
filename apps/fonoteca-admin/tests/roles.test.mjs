import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  assignableRoles,
  canManageAccount,
  canManageUsers,
  effectiveRole,
  effectiveRoleLabel,
  normalizeRole,
  redundantRoles,
  roleLabel,
  unknownRoles,
  usersHelpText,
} from "../lib/roles.ts";
import { permissionLabel, summarizePermissions } from "../lib/permission-labels.ts";
import { buildUserAuditReport, findDuplicates, isLikelyTestAccount, renderUserAuditMarkdown } from "../lib/user-audit.ts";

const read = (path) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

test("el rol efectivo es el de mayor jerarquía", () => {
  assert.equal(effectiveRole(["VIEWER", "EDITOR", "ADMIN"]), "ADMIN");
  assert.equal(effectiveRole(["ADMIN", "SUPERADMIN"]), "SUPERADMIN");
  assert.equal(effectiveRole(["viewer"]), "VIEWER");
  assert.equal(effectiveRole([]), null);
  assert.equal(effectiveRole(["OTRO"]), null);
});

test("reconoce variantes de código del backend", () => {
  assert.equal(normalizeRole("ROLE_ADMIN"), "ADMIN");
  assert.equal(normalizeRole("super_admin"), "SUPERADMIN");
  assert.equal(normalizeRole("Lector"), "VIEWER");
  assert.equal(normalizeRole(undefined), null);
});

test("no muestra acumulación redundante: solo el rol principal", () => {
  const roles = ["SUPERADMIN", "ADMIN", "EDITOR", "VIEWER"];
  assert.equal(effectiveRoleLabel(roles), "Superadministrador");
  assert.deepEqual(redundantRoles(roles).sort(), ["ADMIN", "EDITOR", "VIEWER"]);
  assert.deepEqual(redundantRoles(["EDITOR"]), []);
});

test("los roles desconocidos no se ocultan ni se confunden con la jerarquía", () => {
  assert.deepEqual(unknownRoles(["ADMIN", "AUDITOR_EXTERNO"]), ["AUDITOR_EXTERNO"]);
  assert.equal(roleLabel("AUDITOR_EXTERNO"), "Rol especial (AUDITOR_EXTERNO)");
  assert.equal(roleLabel(null), "Sin rol");
});

test("mínimo privilegio: cada rol solo asigna roles inferiores", () => {
  assert.deepEqual(assignableRoles(["SUPERADMIN"]), ["VIEWER", "EDITOR", "ADMIN", "SUPERADMIN"]);
  assert.deepEqual(assignableRoles(["ADMIN"]), ["VIEWER", "EDITOR"]);
  assert.deepEqual(assignableRoles(["EDITOR"]), []);
  assert.deepEqual(assignableRoles(["VIEWER"]), []);
  assert.equal(canManageUsers(["EDITOR"]), false);
  assert.equal(canManageUsers(["ADMIN"]), true);
});

test("un Administrador no gestiona a otros Administradores ni a Superadministradores", () => {
  const base = { actorId: "a", actorRoles: ["ADMIN"] };
  assert.equal(canManageAccount({ ...base, targetId: "b", targetRoles: ["EDITOR"] }).allowed, true);
  assert.equal(canManageAccount({ ...base, targetId: "b", targetRoles: [] }).allowed, true);
  const denied = canManageAccount({ ...base, targetId: "b", targetRoles: ["ADMIN", "EDITOR"] });
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /Superadministrador/);
  assert.equal(canManageAccount({ ...base, targetId: "b", targetRoles: ["SUPERADMIN"] }).allowed, false);
});

test("un Superadministrador gestiona a todos, pero nadie se cambia a sí mismo", () => {
  const sa = { actorId: "a", actorRoles: ["SUPERADMIN"] };
  assert.equal(canManageAccount({ ...sa, targetId: "b", targetRoles: ["ADMIN"] }).allowed, true);
  const self = canManageAccount({ ...sa, targetId: "a", targetRoles: ["SUPERADMIN"] });
  assert.equal(self.allowed, false);
  assert.match(self.reason, /propio rol/);
});

test("Editor y Visualizador no administran cuentas", () => {
  for (const role of ["EDITOR", "VIEWER"]) {
    assert.equal(canManageAccount({ actorId: "a", actorRoles: [role], targetId: "b", targetRoles: ["VIEWER"] }).allowed, false);
  }
});

test("el texto de ayuda cambia según el rol y no se contradice", () => {
  assert.match(usersHelpText(["SUPERADMIN"]), /todas las cuentas/);
  assert.match(usersHelpText(["ADMIN"]), /Editores y Visualizadores/);
  assert.match(usersHelpText(["VIEWER"]), /no permite modificarlas/);
});

test("los permisos técnicos se traducen y no se exponen en crudo", () => {
  assert.equal(permissionLabel("*"), "Acceso total al sistema");
  assert.equal(permissionLabel("data.read"), "Consultar información del sistema");
  assert.equal(permissionLabel("multimedia.write"), "Registrar y editar archivos multimedia");
  assert.equal(permissionLabel("interno.algo.raro"), null);

  assert.deepEqual(summarizePermissions(["*", "data.read"]), { labels: ["Acceso total al sistema"], hidden: 0 });
  const mixed = summarizePermissions(["data.read", "data.read", "secret.internal"]);
  assert.deepEqual(mixed, { labels: ["Consultar información del sistema"], hidden: 1 });
  assert.ok(!JSON.stringify(mixed).includes("secret"));
});

const users = [
  { id: "1", email: "ana.perez@iiap.gob.pe", name: "Ana Pérez", roles: ["ADMIN", "EDITOR", "VIEWER"] },
  { id: "2", email: "Ana.Perez+prueba@iiap.gob.pe", name: "Pérez Ana", roles: ["VIEWER"] },
  { id: "3", email: "test@example.com", name: "Usuario Test", roles: [] },
  { id: "4", email: "admin@fonoteca.test", name: "Admin", roles: ["SUPERADMIN"] },
  { id: "5", email: "luis@iiap.gob.pe", name: "Luis Torres", roles: ["AUDITOR_EXTERNO"] },
];

test("el inventario detecta cuentas de prueba sin marcar a personas reales", () => {
  assert.equal(isLikelyTestAccount(users[2]), true);
  assert.equal(isLikelyTestAccount(users[3]), true);
  assert.equal(isLikelyTestAccount(users[0]), false);
  assert.equal(isLikelyTestAccount(users[4]), false);
});

test("el inventario detecta duplicados por correo y por nombre", () => {
  const groups = findDuplicates(users);
  assert.ok(groups.some((g) => g.kind === "correo" && g.users.map((u) => u.id).sort().join() === "1,2"));
  assert.ok(groups.some((g) => g.kind === "nombre" && g.users.map((u) => u.id).sort().join() === "1,2"));
  assert.equal(findDuplicates([{ id: "a", email: "a@x.pe", name: "Ana", roles: [] }, { id: "b", email: "b@x.pe", name: "Ana", roles: [] }]).length, 0);
});

test("el informe es de solo lectura y lista roles acumulados, sin rol y superadmins", () => {
  const report = buildUserAuditReport(users);
  assert.equal(report.total, 5);
  assert.equal(report.accumulatedRoles.length, 1);
  assert.deepEqual(report.withoutRoles.map((u) => u.id), ["3"]);
  assert.deepEqual(report.unrecognizedRoles.map((e) => e.user.id), ["5"]);
  assert.deepEqual(report.superadmins.map((u) => u.id), ["4"]);
  const md = renderUserAuditMarkdown(report, new Date("2026-01-01T00:00:00Z"));
  assert.match(md, /solo lectura/);
  assert.match(md, /validación del responsable funcional/);
});

test("las acciones sobre cuentas validan el rol de quien actúa y dejan auditoría", () => {
  const actions = read("actions/system-users.ts");
  for (const fn of ["createSystemUser", "updateSystemUser", "deleteSystemUser", "changeUserRole", "resetSystemPassword"]) {
    const body = actions.slice(actions.indexOf(`export async function ${fn}(`));
    assert.match(body.slice(0, 500), /authorize\(/, `${fn} sin autorización`);
  }
  for (const action of ["user.create", "user.update", "user.delete", "user.roles.change", "user.password.reset", "access.denied"]) {
    assert.match(actions, new RegExp(`action: "${action}"`), action);
  }
  assert.doesNotMatch(actions, /export async function (assign|revoke)SystemRoles/);
  assert.doesNotMatch(read("actions/users.ts"), /export async function (assignUserRole|removeUserRole)/);
});

test("la pantalla de usuarios no muestra códigos de rol ni cambia roles sin confirmar", () => {
  const client = read("app/dashboard/users/users-client.tsx");
  assert.match(client, /effectiveRoleLabel\(/);
  assert.match(client, /Confirmar cambio de rol/);
  assert.doesNotMatch(client, /\{role\}\s*<\/Badge>/);
  assert.doesNotMatch(client, /assignSystemRoles|revokeSystemRoles/);
});

test("los permisos crudos no viajan al navegador", () => {
  assert.match(read("app/api/auth/me/route.ts"), /permissions: _permissions/);
  assert.match(read("app/dashboard/profile/page.tsx"), /permissions: \[\]/);
});
