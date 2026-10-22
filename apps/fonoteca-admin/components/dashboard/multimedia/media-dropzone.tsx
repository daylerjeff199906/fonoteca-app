"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, FileAudio, ImageIcon, Loader2, RefreshCw, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadFileWithProgress } from "@/lib/file-service.client"
import type { UploadedFile } from "@/lib/file-service.schemas"
import { ALLOWED_FORMATS_TEXT, MEDIA_ACCEPT, validateMediaBytes, validateMediaMeta, type MediaKind } from "@/lib/media-rules"
import { cn } from "@/lib/utils"

export interface UploadedMedia {
  file: File
  uploaded: UploadedFile
  kind: MediaKind
}

interface MediaDropzoneProps {
  onUploaded: (media: UploadedMedia) => void
  onRemoved: (media: UploadedMedia) => void
  /** Metadatos que acompañan el archivo en el servicio de archivos. */
  metadata?: Record<string, unknown>
  disabled?: boolean
  /** Notifica si hay una carga en curso (para bloquear el envío del formulario). */
  onBusyChange?: (busy: boolean) => void
}

type State =
  | { status: "idle" }
  | { status: "uploading"; file: File; progress: number }
  | { status: "done"; media: UploadedMedia }
  | { status: "error"; file?: File; message: string }

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

export function MediaDropzone({ onUploaded, onRemoved, metadata, disabled, onBusyChange }: MediaDropzoneProps) {
  const [state, setState] = useState<State>({ status: "idle" })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    onBusyChange?.(state.status === "uploading")
  }, [state.status, onBusyChange])

  const start = useCallback(
    async (file: File) => {
      const meta = validateMediaMeta({ name: file.name, size: file.size, type: file.type })
      if (!meta.ok) return setState({ status: "error", file, message: meta.error })

      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
      const content = validateMediaBytes(file.name, head)
      if (!content.ok) return setState({ status: "error", file, message: content.error })

      const controller = new AbortController()
      abortRef.current = controller
      setState({ status: "uploading", file, progress: 0 })
      try {
        const uploaded = await uploadFileWithProgress(
          {
            file,
            duplicatePolicy: "reuse",
            processImage: meta.kind === "image",
            processAudio: meta.kind === "audio",
            metadata: { source: "multimedia_form", ...metadata },
          },
          (progress) => setState((current) => (current.status === "uploading" ? { ...current, progress } : current)),
          controller.signal,
        )
        const media = { file, uploaded, kind: meta.kind }
        setState({ status: "done", media })
        onUploaded(media)
      } catch (error) {
        if (controller.signal.aborted) return setState({ status: "idle" })
        setState({ status: "error", file, message: error instanceof Error ? error.message : "No se pudo subir el archivo." })
      }
    },
    [metadata, onUploaded],
  )

  const pick = (files: FileList | null) => {
    const file = files?.[0]
    if (file) void start(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  const cancelOrRemove = () => {
    if (state.status === "uploading") {
      abortRef.current?.abort()
    } else if (state.status === "done") {
      onRemoved(state.media)
      setState({ status: "idle" })
    } else {
      setState({ status: "idle" })
    }
  }

  const locked = disabled || state.status === "uploading"

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        className="sr-only"
        id="media-file-input"
        aria-describedby="media-file-help"
        disabled={locked || state.status === "done"}
        onChange={(event) => pick(event.target.files)}
      />

      {state.status === "idle" || state.status === "error" ? (
        <label
          htmlFor="media-file-input"
          onDragOver={(event) => {
            event.preventDefault()
            if (!locked) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            if (!locked) pick(event.dataTransfer.files)
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/50",
            dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
            state.status === "error" && "border-destructive/50",
            locked && "pointer-events-none opacity-50",
          )}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">Arrastre un archivo aquí o haga clic para seleccionarlo</span>
          <span id="media-file-help" className="text-xs text-muted-foreground">{ALLOWED_FORMATS_TEXT}</span>
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
          {state.status === "uploading" ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          ) : state.media.kind === "audio" ? (
            <FileAudio className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          ) : (
            <ImageIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{state.status === "uploading" ? state.file.name : state.media.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(state.status === "uploading" ? state.file.size : state.media.file.size)}
              {state.status === "done" && (state.media.uploaded.duplicate ? " · Ya existía en el servicio; se reutilizará" : " · Carga completa")}
            </p>
            {state.status === "uploading" && (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={state.progress}
                aria-label="Progreso de la carga"
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div className="h-full bg-primary transition-[width]" style={{ width: `${state.progress}%` }} />
              </div>
            )}
          </div>
          {state.status === "done" && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-label="Carga completa" />}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cancelOrRemove}
            aria-label={state.status === "uploading" ? "Cancelar carga" : "Quitar archivo"}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {state.status === "error" && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="flex-1">{state.message}</p>
          {state.file && (
            <Button type="button" variant="outline" size="sm" onClick={() => void start(state.file!)}>
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
