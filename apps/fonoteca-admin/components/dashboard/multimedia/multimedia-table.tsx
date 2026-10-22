"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Plus, Play, X } from "lucide-react"
import type { Multimedia } from "@/types/fonoteca"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScientificName } from "@/components/ui/scientific-name"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MediaImage } from "@/components/dashboard/media-image"
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm"
import { DataTableCard, TableEmptyRow } from "@/components/panel-admin/data-table"
import { deleteMultimedia } from "@/actions/multimedia"
import { mediaTypeLabel, recordStatusLabel } from "@/config/glossary"

export type MultimediaRow = Multimedia & {
  /** Miniatura resuelta en el servidor cuando el registro no trae `thumbnail_url`. */
  previewUrl?: string | null
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "-"

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return null
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function PreviewCell({ media }: { media: MultimediaRow }) {
  const [playing, setPlaying] = useState(false)
  const [open, setOpen] = useState(false)
  const label = media.title || media.originalFilename || "archivo multimedia"

  if (media.type === "Sound") {
    const src = media.audio_url || media.identifier
    if (!playing) {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir ${label}`}
        >
          <Play className="h-4 w-4" />
          Escuchar
        </Button>
      )
    }
    return (
      <div className="flex items-center gap-1">
        {/* preload="none": el audio solo se descarga cuando se pulsa Escuchar */}
        <audio controls autoPlay preload="none" src={src} className="h-9 w-56" aria-label={`Reproductor de ${label}`} />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlaying(false)} aria-label="Cerrar reproductor">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (media.type === "Still") {
    const thumb = media.thumbnail_url || media.previewUrl || media.identifier
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`Ampliar imagen ${label}`}
        >
          <MediaImage src={thumb} alt={label} className="object-cover" containerClassName="h-14 w-14 rounded-md border" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <MediaImage
              src={media.display_url || media.identifier}
              alt={label}
              className="object-contain"
              containerClassName="max-h-[70vh] min-h-64 w-full rounded-md"
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return <span className="text-xs text-muted-foreground">Sin vista previa</span>
}

export function MultimediaTable({
  items,
  canWrite,
  hasFilters,
}: {
  items: MultimediaRow[]
  canWrite: boolean
  hasFilters: boolean
}) {
  const columns = canWrite ? 8 : 7

  return (
    <DataTableCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vista previa</TableHead>
            <TableHead>Archivo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Ocurrencia / Especie</TableHead>
            <TableHead>Estado</TableHead>
            {canWrite && <TableHead className="w-[100px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((media) => (
              <TableRow key={media.id}>
                <TableCell>
                  <PreviewCell media={media} />
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <p className="truncate font-medium">{media.title || "Sin título"}</p>
                  <p className="truncate text-xs text-muted-foreground">{media.originalFilename || "-"}</p>
                </TableCell>
                <TableCell>
                  <p>{mediaTypeLabel(media.type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {[media.format, formatBytes(media.file_size_bytes)].filter(Boolean).join(" · ")}
                  </p>
                </TableCell>
                <TableCell>{media.creator || "Sin autor"}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{formatDate(media.created_at)}</TableCell>
                <TableCell>
                  {media.occurrence_id && media.occurrence ? (
                    <Link href={`/dashboard/occurrences/${media.occurrence_id}`} className="group block">
                      <span className="font-medium group-hover:underline">{media.occurrence.occurrenceID}</span>
                      {media.occurrence.taxon?.scientificName && (
                        <span className="block text-xs text-muted-foreground">
                          <ScientificName>{media.occurrence.taxon.scientificName}</ScientificName>
                        </span>
                      )}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin ocurrencia asociada</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={media.record_status === "published" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                    {recordStatusLabel(media.record_status)}
                  </Badge>
                </TableCell>
                {canWrite && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/multimedia/${media.id}/edit`}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                        title="Editar"
                        aria-label={`Editar ${media.title || "archivo multimedia"}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButtonWithConfirm id={media.id} onConfirm={deleteMultimedia} itemName="archivo multimedia" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableEmptyRow
              colSpan={columns}
              title={hasFilters ? "No hay archivos que coincidan con la búsqueda" : "Aún no hay archivos multimedia"}
              description={hasFilters ? "Pruebe con otro término o cambie el filtro de tipo." : "Suba el primer audio o imagen para comenzar."}
              action={
                !hasFilters && canWrite
                  ? { label: "Subir archivo", href: "/dashboard/multimedia/create", icon: <Plus className="h-4 w-4" /> }
                  : undefined
              }
            />
          )}
        </TableBody>
      </Table>
    </DataTableCard>
  )
}
