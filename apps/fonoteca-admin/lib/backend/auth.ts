import "server-only";

import { cookies } from "next/headers";

const SESSION_COOKIE = "fonoteca_admin_session";
const REFRESH_COOKIE = "fonoteca_admin_refresh";

export async function getAccessToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
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
  expiresAt?: string | number | null;
}

export interface LoginResult {
  token?: string;
  refreshToken?: string;
  user?: BackendUser | null;
  mfaRequired?: boolean;
  mfaToken?: string;
  expiresAt?: string | number | null;
}

function apiUrl(path: string) {
  const baseUrl = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";
  return new URL(path.replace(/^\//, ""), `${baseUrl.replace(/\/$/, "")}/`).toString();
}

function authPath(
  name:
    | "LOGIN"
    | "ME"
    | "LOGOUT"
    | "LOGOUT_ALL"
    | "FORGOT_PASSWORD"
    | "RESET_PASSWORD"
    | "SIGNUP"
    | "REFRESH"
    | "MFA_VERIFY"
    | "MFA_SETUP"
    | "MFA_ENABLE",
  fallback: string
) {
  return process.env[`BACKEND_AUTH_${name}_PATH`] ?? fallback;
}

function unwrap(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  return record.data && typeof record.data === "object"
    ? (record.data as Record<string, unknown>)
    : record;
}

function normalizeUser(payload: unknown): BackendUser | null {
  const data = unwrap(payload);
  const source =
    data.user && typeof data.user === "object"
      ? (data.user as Record<string, unknown>)
      : data.profile && typeof data.profile === "object"
      ? (data.profile as Record<string, unknown>)
      : data;
  const rawId = source.id ?? source.user_id ?? source.userId ?? source.sub ?? source.uuid;
  const rawEmail = source.email ?? source.email_address ?? source.correo ?? data.email;
  if ((typeof rawId !== "string" && typeof rawId !== "number") || typeof rawEmail !== "string") return null;
  const id = String(rawId);
  const email = rawEmail;

  const firstName = typeof source.first_name === "string" ? source.first_name : "";
  const lastName = typeof source.last_name === "string" ? source.last_name : "";
  const name = typeof source.name === "string" ? source.name : `${firstName} ${lastName}`.trim();
  const rawRoles =
    source.roles ??
    source.role ??
    source.user_roles ??
    source.userRoles ??
    data.roles ??
    data.role ??
    data.user_roles ??
    data.userRoles;
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
        return typeof record.code === "string"
          ? record.code
          : typeof record.name === "string"
          ? record.name
          : typeof record.role === "string"
          ? record.role
          : "";
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
  const isAdmin =
    roles.some((value) => ["ADMIN", "SUPERADMIN", "SUPER_ADMIN", "ROLE_ADMIN"].includes(value)) ||
    permissions.includes("*");
  const role = roles[0] ?? "USER";
  const expiresAt = (data.expires_at ?? data.expiresAt ?? source.expires_at ?? source.expiresAt) as
    | string
    | number
    | null
    | undefined;

  return {
    id,
    email,
    name: name || email,
    role,
    avatar: typeof source.avatar === "string" ? source.avatar : null,
    roles,
    permissions,
    isAdmin,
    expiresAt,
  };
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
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function refreshSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  try {
    const response = await fetch(apiUrl(authPath("REFRESH", "/auth/refresh")), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken, refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) {
      if ([400, 401, 403].includes(response.status)) {
        cookieStore.delete(SESSION_COOKIE);
        cookieStore.delete(REFRESH_COOKIE);
      }
      return null;
    }
    const data = unwrap(await response.json().catch(() => null));
    const accessToken = (data.access_token ?? data.accessToken ?? data.token) as string | undefined;
    const nextRefreshToken = (data.refresh_token ?? data.refreshToken ?? refreshToken) as string;
    if (typeof accessToken !== "string" || !accessToken) return null;
    cookieStore.set(SESSION_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    cookieStore.set(REFRESH_COOKIE, nextRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return accessToken;
  } catch {
    return null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  let token = await getAccessToken();
  if (!token) {
    token = await refreshSession();
  }
  return token;
}

export async function fetchWithSession(input: RequestInfo | URL, init: RequestInit = {}) {
  const request = async (t: string) =>
    fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${t}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

  let token = await getValidAccessToken();
  if (!token) {
    return new Response(JSON.stringify({ message: "Sesión no disponible." }), {
      status: 401,
      statusText: "Unauthorized",
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await request(token);
  if (response.status !== 401) return response;

  const refreshedToken = await refreshSession();
  return refreshedToken ? request(refreshedToken) : response;
}

// 1. POST /api/v1/auth/signup
export async function signup(payloadData: Record<string, unknown>): Promise<{ user: BackendUser | null; message?: string }> {
  const response = await fetch(apiUrl(authPath("SIGNUP", "/auth/signup")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payloadData),
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  const data = unwrap(payload);
  if (!response.ok) {
    throw new Error(typeof data.message === "string" ? data.message : "No se pudo crear la cuenta.");
  }
  const token = (data.access_token ?? data.accessToken ?? data.token) as string | undefined;
  const refreshToken = (data.refresh_token ?? data.refreshToken) as string | undefined;
  if (token && refreshToken) {
    await createSession(token, refreshToken);
  }
  return { user: normalizeUser(payload), message: typeof data.message === "string" ? data.message : undefined };
}

// 2. POST /api/v1/auth/login
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
  if (data.mfa_required === true || data.mfaRequired === true) {
    const mfaToken = (data.mfa_token ?? data.mfaToken) as string;
    return { mfaRequired: true, mfaToken };
  }

  const token = (data.access_token ?? data.accessToken ?? data.token) as string;
  const refreshToken = (data.refresh_token ?? data.refreshToken) as string;
  if (typeof token !== "string" || !token) throw new Error("El backend no devolvió un token de sesión válido.");
  if (typeof refreshToken !== "string" || !refreshToken) throw new Error("El backend no devolvió un refresh token válido.");

  return { token, refreshToken, user: normalizeUser(payload), expiresAt: (data.expires_at ?? data.expiresAt) as string | number };
}

// 3. GET /api/v1/auth/me
export async function getCurrentUser(): Promise<BackendUser | null> {
  try {
    const response = await fetchWithSession(apiUrl(authPath("ME", "/auth/me")));
    if (!response.ok) return null;
    return normalizeUser(await response.json().catch(() => null));
  } catch (error) {
    console.error("No fue posible verificar la sesión con el backend.", error);
    return null;
  }
}

// 4. POST /api/v1/auth/logout-all
export async function logoutAll() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (token) {
    await fetch(apiUrl(authPath("LOGOUT_ALL", "/auth/logout-all")), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken, refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// 6. POST /api/v1/auth/mfa/verify-login
export async function verifyMfaLogin(mfaToken: string, code: string): Promise<LoginResult> {
  const response = await fetch(apiUrl(authPath("MFA_VERIFY", "/auth/mfa/verify-login")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ mfa_token: mfaToken, mfaToken, code, otp: code }),
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const data = unwrap(payload);
    throw new Error(typeof data.message === "string" ? data.message : "Código de verificación incorrecto o expirado.");
  }
  const data = unwrap(payload);
  const token = (data.access_token ?? data.accessToken ?? data.token) as string;
  const refreshToken = (data.refresh_token ?? data.refreshToken) as string;
  if (typeof token !== "string" || !token) throw new Error("El backend no devolvió un token válido.");
  if (typeof refreshToken !== "string" || !refreshToken) throw new Error("El backend no devolvió un refresh token válido.");
  return { token, refreshToken, user: normalizeUser(payload) };
}

// 7. POST /api/v1/auth/forgot-password
export async function requestPasswordReset(email: string) {
  await fetch(apiUrl(authPath("FORGOT_PASSWORD", "/auth/forgot-password")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
}

// 8. POST /api/v1/auth/reset-password
export async function resetPassword(token: string, password: string) {
  const response = await fetch(apiUrl(authPath("RESET_PASSWORD", "/auth/reset-password")), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token, password }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("El enlace no es válido o ya expiró.");
}

// 9. POST /api/v1/auth/logout
export async function clearSession(notifyBackend = true) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (notifyBackend && token) {
    await fetch(apiUrl(authPath("LOGOUT", "/auth/logout")), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken, refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// 10. POST /api/v1/auth/mfa/setup
export async function setupMfa(): Promise<{ secret: string; qrCodeUrl: string }> {
  const response = await fetchWithSession(apiUrl(authPath("MFA_SETUP", "/auth/mfa/setup")), {
    method: "POST",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const data = unwrap(payload);
    throw new Error(typeof data.message === "string" ? data.message : "No se pudo iniciar la configuración de MFA.");
  }
  const data = unwrap(payload);
  const secret = (data.secret ?? data.totp_secret ?? data.totpSecret) as string;
  const qrCodeUrl = (data.qr_code ?? data.qrCode ?? data.totp_url ?? data.totpUrl ?? data.url) as string;
  return { secret, qrCodeUrl };
}

// 11. POST /api/v1/auth/mfa/enable
export async function enableMfa(code: string): Promise<{ success: boolean; backupCodes?: string[] }> {
  const response = await fetchWithSession(apiUrl(authPath("MFA_ENABLE", "/auth/mfa/enable")), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, otp: code }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const data = unwrap(payload);
    throw new Error(typeof data.message === "string" ? data.message : "Código de verificación MFA inválido.");
  }
  const data = unwrap(payload);
  return {
    success: true,
    backupCodes: Array.isArray(data.backup_codes) ? (data.backup_codes as string[]) : undefined,
  };
}
