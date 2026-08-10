const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PUBLIC_BACKEND_API_URL) {
    return import.meta.env.PUBLIC_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env && process.env.BACKEND_API_URL) {
    return process.env.BACKEND_API_URL;
  }
  return "http://127.0.0.1:3000/api/v1";
};

/**
 * El portal solo debe consumir recursos expuestos públicamente por el backend.
 * Mantener este prefijo centralizado evita volver a consultar Supabase o, por
 * error, rutas administrativas que requieren autenticación.
 */
export function getPublicEndpoint(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return cleanEndpoint.startsWith("/public/") ? cleanEndpoint : `/public${cleanEndpoint}`;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message || errorBody?.detail || `Error HTTP ${response.status} al consultar ${endpoint}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return response.json() as Promise<T>;
}

export function fetchPublicApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return fetchApi<T>(getPublicEndpoint(endpoint), options);
}
