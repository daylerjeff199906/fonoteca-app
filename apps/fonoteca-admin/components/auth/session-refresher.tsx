"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refresco cada 3.5 minutos en segundo plano para evitar caducidad del JWT
const REFRESH_INTERVAL_MS = 3.5 * 60 * 1000;

export function SessionRefresher() {
  const router = useRouter();

  useEffect(() => {
    let refreshing = false;

    const refresh = async () => {
      if (refreshing || document.visibilityState !== "visible") return;
      refreshing = true;
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (response.status === 401) {
          router.replace("/login");
        }
      } catch {
        // Fallos temporales de red en segundo plano se ignoran hasta la siguiente reintento
      } finally {
        refreshing = false;
      }
    };

    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  return null;
}
