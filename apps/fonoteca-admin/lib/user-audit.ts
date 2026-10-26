// Análisis de solo lectura del inventario de cuentas. No modifica nada: produce un informe
// para que el responsable funcional decida qué revisar, desactivar o eliminar.

import { effectiveRole, redundantRoles, unknownRoles } from "./roles.ts"

export interface AuditUser {
  id: string
  email: string
  name: string
  roles: string[]
}

const TEST_DOMAINS = ["example.com", "example.org", "example.net", "test.com", "mailinator.com", "localhost", "invalid", "fonoteca.test"]
const TEST_LOCAL_PARTS = /^(test|tester|prueba|demo|admin|administrador|user|usuario|dummy|seed|sample|fake|root)\d*$/i
const TEST_NAMES = /\b(test|tester|prueba|demo|dummy|fake|lorem|ipsum|seed|john doe|jane doe|usuario\s*\d+)\b/i
const FICTIONAL_NAMES = /^(juan p[eé]rez|mar[ií]a garc[ií]a|pedro p[eé]rez|ana l[oó]pez|fulano|mengano)\b/i

const strip = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "")

/** Motivos por los que una cuenta parece sembrada o de prueba; vacío si no hay indicios. */
export function testAccountReasons(user: AuditUser): string[] {
  const reasons: string[] = []
  const [local = "", domain = ""] = user.email.toLowerCase().split("@")
  if (TEST_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) reasons.push(`dominio de prueba (${domain})`)
  if (TEST_LOCAL_PARTS.test(local)) reasons.push(`correo genérico (${local}@)`)
  const name = strip(user.name ?? "")
  if (TEST_NAMES.test(name)) reasons.push("nombre con palabra de prueba")
  if (FICTIONAL_NAMES.test(name)) reasons.push("nombre ficticio frecuente")
  return reasons
}

export function isLikelyTestAccount(user: AuditUser): boolean {
  return testAccountReasons(user).length > 0
}

/** Correo normalizado para detectar la misma persona escrita de dos formas. */
export function normalizeEmail(email: string): string {
  const [rawLocal = "", domain = ""] = email.trim().toLowerCase().split("@")
  let local = rawLocal.split("+")[0]
  if (domain === "gmail.com" || domain === "googlemail.com") local = local.replace(/\./g, "")
  return `${local}@${domain === "googlemail.com" ? "gmail.com" : domain}`
}

/** Nombre sin tildes ni orden, para encontrar «Ana Pérez» y «Pérez, Ana». */
export function normalizeName(name: string): string {
  return strip(name).toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean).sort().join(" ")
}

export interface DuplicateGroup {
  kind: "correo" | "nombre"
  key: string
  users: AuditUser[]
}

export function findDuplicates(users: AuditUser[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = []
  const collect = (kind: DuplicateGroup["kind"], keyOf: (u: AuditUser) => string) => {
    const byKey = new Map<string, AuditUser[]>()
    for (const user of users) {
      const key = keyOf(user)
      if (!key) continue
      byKey.set(key, [...(byKey.get(key) ?? []), user])
    }
    for (const [key, members] of byKey) if (members.length > 1) groups.push({ kind, key, users: members })
  }
  collect("correo", (u) => normalizeEmail(u.email))
  // Un nombre de una sola palabra es demasiado ambiguo para sospechar de duplicado.
  collect("nombre", (u) => (normalizeName(u.name).split(" ").length >= 2 ? normalizeName(u.name) : ""))
  return groups
}

export interface UserAuditReport {
  total: number
  likelyTestAccounts: Array<{ user: AuditUser; reasons: string[] }>
  duplicates: DuplicateGroup[]
  accumulatedRoles: Array<{ user: AuditUser; effective: string; redundant: string[] }>
  withoutRoles: AuditUser[]
  unrecognizedRoles: Array<{ user: AuditUser; roles: string[] }>
  superadmins: AuditUser[]
}

export function buildUserAuditReport(users: AuditUser[]): UserAuditReport {
  return {
    total: users.length,
    likelyTestAccounts: users
      .map((user) => ({ user, reasons: testAccountReasons(user) }))
      .filter((entry) => entry.reasons.length > 0),
    duplicates: findDuplicates(users),
    accumulatedRoles: users
      .map((user) => ({ user, effective: effectiveRole(user.roles) ?? "", redundant: redundantRoles(user.roles) as string[] }))
      .filter((entry) => entry.redundant.length > 0),
    withoutRoles: users.filter((user) => user.roles.length === 0),
    unrecognizedRoles: users
      .map((user) => ({ user, roles: unknownRoles(user.roles) }))
      .filter((entry) => entry.roles.length > 0),
    superadmins: users.filter((user) => effectiveRole(user.roles) === "SUPERADMIN"),
  }
}

/** Informe en Markdown, listo para revisión del responsable funcional. */
export function renderUserAuditMarkdown(report: UserAuditReport, generatedAt = new Date()): string {
  const who = (u: AuditUser) => `${u.name || "(sin nombre)"} <${u.email}> · id ${u.id}`
  const section = (title: string, lines: string[]) =>
    `## ${title}\n\n${lines.length ? lines.map((l) => `- ${l}`).join("\n") : "_Sin hallazgos._"}\n`

  return [
    `# Inventario de usuarios y roles`,
    ``,
    `Generado: ${generatedAt.toISOString()} · Cuentas analizadas: ${report.total}`,
    ``,
    `> Informe de solo lectura. No se desactivó, eliminó ni modificó ninguna cuenta. Toda acción requiere validación del responsable funcional.`,
    ``,
    section("Posibles cuentas semilla o de prueba", report.likelyTestAccounts.map((e) => `${who(e.user)} — ${e.reasons.join("; ")}`)),
    section("Posibles duplicados", report.duplicates.map((g) => `Mismo ${g.kind} (${g.key}): ${g.users.map(who).join(" | ")}`)),
    section("Roles acumulados (ya cubiertos por el rol principal)", report.accumulatedRoles.map((e) => `${who(e.user)} — principal: ${e.effective}; redundantes: ${e.redundant.join(", ")}`)),
    section("Cuentas sin rol", report.withoutRoles.map(who)),
    section("Roles no reconocidos", report.unrecognizedRoles.map((e) => `${who(e.user)} — ${e.roles.join(", ")}`)),
    section("Superadministradores", report.superadmins.map(who)),
  ].join("\n")
}
