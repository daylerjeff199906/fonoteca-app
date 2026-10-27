import { toast, ToastOptions } from "react-toastify";
import React from "react";

interface ToastContentProps {
  title: string;
  description?: string;
}

type BackendPayload = unknown;

export function getBackendMessage(payload: BackendPayload, fallback: string) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { message?: unknown; error?: unknown; errors?: unknown; detail?: unknown; description?: unknown };
  for (const value of [record.message, record.description, record.detail, record.error, record.errors]) {
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value)) {
      const message = value.filter((item): item is string => typeof item === "string").join(" ");
      if (message) return message;
    }
    if (value && typeof value === "object") {
      const message = Object.values(value as Record<string, unknown>).flat().filter((item): item is string => typeof item === "string").join(" ");
      if (message) return message;
    }
  }
  return fallback;
}

const ToastContent = ({ title, description }: ToastContentProps) => (
  <div className="flex flex-col gap-0.5 min-w-0 p-1">
    <h4 className="font-bold text-sm leading-tight text-foreground">{title}</h4>
    {description && (
      <p className="text-xs opacity-80 leading-snug break-words">{description}</p>
    )}
  </div>
);

export const showToast = {
  success: (title: string, description?: string, options?: ToastOptions) => {
    toast.success(<ToastContent title={title} description={description} />, options);
  },
  error: (title: string, description?: string, options?: ToastOptions) => {
    toast.error(<ToastContent title={title} description={description} />, options);
  },
  info: (title: string, description?: string, options?: ToastOptions) => {
    toast.info(<ToastContent title={title} description={description} />, options);
  },
  warning: (title: string, description?: string, options?: ToastOptions) => {
    toast.warning(<ToastContent title={title} description={description} />, options);
  },
  response: (response: { success?: boolean; error?: unknown; message?: unknown; description?: unknown }, successTitle: string, successDescription: string) => {
    if (response.success) {
      showToast.success(successTitle, getBackendMessage(response.message ?? response.description, successDescription));
      return;
    }
    showToast.error("No se pudo completar la operación", getBackendMessage(response.error ?? response.message ?? response.description, "Inténtalo nuevamente o contacta al administrador."));
  },
};
