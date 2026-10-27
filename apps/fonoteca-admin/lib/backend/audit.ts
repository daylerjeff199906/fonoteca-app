import "server-only";

export interface AuditEvent {
  action: "user.create" | "user.update" | "user.delete" | "user.roles.change" | "user.password.reset" | "access.denied";
  actor: { id: string; email: string; roles: string[] };
  target?: { id: string; email?: string };
  before?: unknown;
  after?: unknown;
  detail?: string;
}

/**
 * Registra un evento de auditoría como una línea JSON estructurada en el log del servidor
 * (prefijo [AUDIT]). El backend no expone todavía un endpoint de bitácora; cuando exista, este
 * es el único punto que debe enviarlo.
 */
export function recordAudit(event: AuditEvent): void {
  console.info(`[AUDIT] ${JSON.stringify({ at: new Date().toISOString(), ...event })}`);
}
