const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PUBLIC_BACKEND_API_URL) {
    return import.meta.env.PUBLIC_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env && process.env.BACKEND_API_URL) {
    return process.env.BACKEND_API_URL;
  }
  return "http://127.0.0.1:3000/api/v1";
};

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
