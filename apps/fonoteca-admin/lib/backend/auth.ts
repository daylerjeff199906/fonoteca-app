import "server-only";

import { cookies } from "next/headers";

const SESSION_COOKIE = "fonoteca_admin_session";
const REFRESH_COOKIE = "fonoteca_admin_refresh";

export async function getAccessToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
}

type LoginResult = { token: string; refreshToken: string; user: BackendUser | null };

function apiUrl(path: string) {
  const baseUrl = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";
  return new URL(path.replace(/^\//, ""), `${baseUrl.replace(/\/$/, "")}/`).toString();
}

function authPath(name: "LOGIN" | "ME" | "LOGOUT" | "FORGOT_PASSWORD" | "RESET_PASSWORD", fallback: string) {
  return process.env[`BACKEND_AUTH_${name}_PATH`] ?? fallback;
}

function unwrap(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  return record.data && typeof record.data === "object"
    ? record.data as Record<string, unknown>
    : record;
}

function normalizeUser(payload: unknown): BackendUser | null {
  const data = unwrap(payload);
  const source = data.user && typeof data.user === "object"
    ? data.user as Record<string, unknown>
    : data.profile && typeof data.profile === "object"
      ? data.profile as Record<string, unknown>
      : data;
  const rawId = source.id ?? source.user_id ?? source.userId ?? source.sub ?? source.uuid;
  const rawEmail = source.email ?? source.email_address ?? source.correo ?? data.email;
  if ((typeof rawId !== "string" && typeof rawId !== "number") || typeof rawEmail !== "string") return null;
  const id = String(rawId);
  const email = rawEmail;

  const firstName = typeof source.first_name === "string" ? source.first_name : "";
  const lastName = typeof source.last_name === "string" ? source.last_name : "";
  const name = typeof source.name === "string" ? source.name : `${firstName} ${lastName}`.trim();
  const rawRoles = source.roles ?? source.role ?? source.user_roles ?? source.userRoles ?? data.roles ?? data.role ?? data.user_roles ?? data.userRoles;
  const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles])
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const nestedRole = record.role ?? record.roles ?? record.permission;
        if (nestedRole && typeof nestedRole === "object") {
          const nested = nestedRole as Record<string, unknown>;
          return typeof nested.code === "string" ? nested.code : typeof nested.name === "string" ? nested.name : "";
        }
        return typeof record.code === "string" ? record.code : typeof record.name === "string" ? record.name : typeof record.role === "string" ? record.role : "";
      }
      return "";
    })
    .filter(Boolean)
    .map((role) => role.trim().toUpperCase());
  const rawPermissions = source.permissions ?? data.permissions ?? [];
  const permissions = (Array.isArray(rawPermissions) ? rawPermissions : [rawPermissions])
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return typeof record.code === "string" ? record.code : typeof record.name === "string" ? record.name : "";
      }
      return "";
    })
    .filter(Boolean)
    .map((permission) => permission.trim());
  const isAdmin = roles.some((value) => ["ADMIN", "SUPERADMIN", "SUPER_ADMIN", "ROLE_ADMIN"].includes(value)) || permissions.includes("*");
  const role = roles[0] ?? "USER";

  return { id, email, name: name || email, role, avatar: typeof source.avatar === "string" ? source.avatar : null, roles, permissions, isAdmin };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(apiUrl(authPath("LOGIN", "/auth/login")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const data = unwrap(payload);
    throw new Error(typeof data.message === "string" ? data.message : "No se pudo iniciar sesión.");
  }

  const data = unwrap(payload);
  const token = data.access_token ?? data.accessToken ?? data.token;
  const refreshToken = data.refresh_token ?? data.refreshToken;
  if (typeof token !== "string" || !token) throw new Error("El backend no devolvió un token de sesión válido.");
  if (typeof refreshToken !== "string" || !refreshToken) throw new Error("El backend no devolvió un refresh token válido.");
  return { token, refreshToken, user: normalizeUser(payload) };
}

export async function refreshSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  try {
    const response = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) {
      cookieStore.delete(SESSION_COOKIE);
      cookieStore.delete(REFRESH_COOKIE);
      return null;
    }
    const data = unwrap(await response.json().catch(() => null));
    const accessToken = data.access_token ?? data.accessToken;
    const nextRefreshToken = data.refresh_token ?? data.refreshToken ?? refreshToken;
    if (typeof accessToken !== "string" || typeof nextRefreshToken !== "string") return null;
    cookieStore.set(SESSION_COOKIE, accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    cookieStore.set(REFRESH_COOKIE, nextRefreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return accessToken;
  } catch {
    // Un fallo transitorio de red no debe destruir una sesión aún válida.
    return null;
  }
}

export async function fetchWithSession(input: RequestInfo | URL, init: RequestInit = {}) {
  const request = async (token: string) => fetch(input, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" });
  const token = await getAccessToken();
  if (!token) throw new Error("Sesión no disponible.");
  const response = await request(token);
  if (response.status !== 401) return response;
  const refreshedToken = await refreshSession();
  return refreshedToken ? request(refreshedToken) : response;
}

export async function getCurrentUser(): Promise<BackendUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const response = await fetchWithSession(apiUrl(authPath("ME", "/auth/me")));
    if (!response.ok) return null;
    return normalizeUser(await response.json().catch(() => null));
  } catch (error) {
    // La API puede reiniciarse mientras Next.js renderiza; nunca debe derribar el dashboard.
    console.error("No fue posible verificar la sesión con el backend.", error);
    return null;
  }
}

export async function clearSession(notifyBackend = true) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (notifyBackend && token) {
    await fetch(apiUrl(authPath("LOGOUT", "/auth/logout")), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function createSession(token: string, refreshToken: string, remember = false) {
  const cookieStore = await cookies();
  const maxAge = remember ? 60 * 60 * 24 * 14 : 60 * 60 * 8;
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
}

export async function requestPasswordReset(email: string, resetUrl: string) {
  await fetch(apiUrl(authPath("FORGOT_PASSWORD", "/auth/forgot-password")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, reset_url: resetUrl }),
    cache: "no-store",
  });
}

export async function resetPassword(token: string, password: string) {
  const response = await fetch(apiUrl(authPath("RESET_PASSWORD", "/auth/reset-password")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token, password }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("El enlace no es válido o ya expiró.");
}
