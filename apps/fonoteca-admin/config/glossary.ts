// Glosario de términos del panel en español institucional.
// Los valores guardados (draft, Sound, species…) no cambian; solo se traducen al mostrarlos.

export const RECORD_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  inactive: "Inactivo",
  active: "Activo",
  deleted: "Eliminado",
}

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  expired: "Expirada",
}

export const MEDIA_TYPE_LABELS: Record<string, string> = {
  Sound: "Audio",
  Still: "Imagen",
  StillImage: "Imagen",
  MovingImage: "Video",
  Text: "Documento",
}

export const TAXON_RANK_LABELS: Record<string, string> = {
  kingdom: "Reino",
  phylum: "Filo",
  class: "Clase",
  order: "Orden",
  family: "Familia",
  genus: "Género",
  species: "Especie",
  subspecies: "Subespecie",
}

const labelFrom = (map: Record<string, string>) => (value: string | null | undefined, fallback = "-") =>
  value ? (map[value] ?? map[value.toLowerCase()] ?? value) : fallback

export const recordStatusLabel = labelFrom(RECORD_STATUS_LABELS)
export const requestStatusLabel = labelFrom(REQUEST_STATUS_LABELS)
export const mediaTypeLabel = labelFrom(MEDIA_TYPE_LABELS)
export const taxonRankLabel = labelFrom(TAXON_RANK_LABELS)
