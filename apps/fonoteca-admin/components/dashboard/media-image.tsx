"use client";

import { AlertCircle, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type MediaImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  /** La variante optimizada aún no está disponible. */
  processing?: boolean;
};

/**
 * Imagen resiliente para multimedia: muestra un asset local mientras carga,
 * cuando el worker está procesando y si una URL firmada deja de ser válida.
 */
export function MediaImage({ src, alt, className, containerClassName, processing = false }: MediaImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src, processing]);

  const showPlaceholder = processing || !src || failed || !loaded;
  const message = processing ? "Procesando multimedia" : failed ? "No se pudo cargar la multimedia" : "Cargando multimedia";

  return (
    <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
      {showPlaceholder && (
        <div className="absolute inset-0 grid place-items-center overflow-hidden bg-muted/45">
          {!failed && <div className="absolute inset-0 animate-pulse bg-background/45 backdrop-blur-md" />}
          <div className="relative flex flex-col items-center gap-2 text-muted-foreground">
            <div className="grid h-14 w-16 place-items-center rounded-md border-4 border-muted-foreground/45 bg-background/60 shadow-sm">
              {failed ? <AlertCircle className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
            </div>
            <span className="rounded-full bg-background/75 px-2.5 py-1 text-[10px] font-semibold shadow-sm">{message}</span>
          </div>
        </div>
      )}
      {!processing && src && (
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full transition-opacity duration-200", loaded && !failed ? "opacity-100" : "opacity-0", className)}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
