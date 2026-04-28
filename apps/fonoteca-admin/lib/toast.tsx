import { toast, ToastOptions } from "react-toastify";
import React from "react";

interface ToastContentProps {
  title: string;
  description?: string;
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
};
