// Reglas de archivos multimedia aceptados por el panel. Sin dependencias: las usan el
// formulario (validación inmediata) y el proxy de carga (validación que no se puede omitir).

export type MediaKind = "audio" | "image"

export const MB = 1024 * 1024

interface KindRule {
  label: string
  /** Tipos MIME aceptados (en minúsculas). */
  mimes: readonly string[]
  /** Extensiones aceptadas, sin punto. */
  extensions: readonly string[]
  maxBytes: number
}

export const MEDIA_RULES: Record<MediaKind, KindRule> = {
  audio: {
    label: "audio",
    mimes: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave", "audio/mpeg", "audio/mp3", "audio/flac", "audio/x-flac"],
    extensions: ["wav", "mp3", "flac"],
    maxBytes: 40 * MB,
  },
  image: {
    label: "imagen",
    mimes: ["image/jpeg", "image/png", "image/webp"],
    extensions: ["jpg", "jpeg", "png", "webp"],
    maxBytes: 10 * MB,
  },
}

/** Valor para el atributo `accept` del selector de archivos. */
export const MEDIA_ACCEPT = [
  ...MEDIA_RULES.audio.extensions.map((e) => `.${e}`),
  ...MEDIA_RULES.image.extensions.map((e) => `.${e}`),
].join(",")

export const ALLOWED_FORMATS_TEXT = "WAV, MP3 y FLAC (hasta 40 MB); JPG, PNG y WebP (hasta 10 MB)"

export interface MediaFileMeta {
  name: string
  size: number
  type: string
}

export type MediaCheck = { ok: true; kind: MediaKind } | { ok: false; error: string }

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".")
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase()
}

const formatMb = (bytes: number) => `${Math.round(bytes / MB)} MB`

/** Valida nombre, extensión, tipo MIME y tamaño. No lee el contenido (ver sniffMediaKind). */
export function validateMediaMeta(file: MediaFileMeta): MediaCheck {
  const ext = extensionOf(file.name)
  const mime = file.type.toLowerCase()

  const kind = (Object.keys(MEDIA_RULES) as MediaKind[]).find((k) => MEDIA_RULES[k].extensions.includes(ext))
  if (!kind) {
    return { ok: false, error: `El archivo «${file.name}» no tiene un formato permitido. Formatos aceptados: ${ALLOWED_FORMATS_TEXT}.` }
  }

  const rule = MEDIA_RULES[kind]
  // Algunos navegadores no informan el MIME de ciertos audios; si viene, debe coincidir.
  if (mime && !rule.mimes.includes(mime)) {
    return { ok: false, error: `El tipo de archivo «${file.type}» no coincide con la extensión .${ext}. Verifique que el archivo no esté dañado o renombrado.` }
  }

  if (file.size <= 0) return { ok: false, error: `El archivo «${file.name}» está vacío.` }
  if (file.size > rule.maxBytes) {
    return { ok: false, error: `El archivo «${file.name}» supera el límite de ${formatMb(rule.maxBytes)} para ${rule.label}.` }
  }

  return { ok: true, kind }
}

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))

/** Identifica el formato real por los primeros bytes del archivo. */
export function sniffMediaKind(bytes: Uint8Array): { kind: MediaKind; extensions: readonly string[] } | null {
  if (bytes.length < 12) return null
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WAVE") return { kind: "audio", extensions: ["wav"] }
  if (ascii(bytes, 0, 4) === "fLaC") return { kind: "audio", extensions: ["flac"] }
  if (ascii(bytes, 0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return { kind: "audio", extensions: ["mp3"] }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: "image", extensions: ["jpg", "jpeg"] }
  if (bytes[0] === 0x89 && ascii(bytes, 1, 4) === "PNG") return { kind: "image", extensions: ["png"] }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return { kind: "image", extensions: ["webp"] }
  return null
}

/** Comprueba que el contenido corresponda con la extensión declarada. */
export function validateMediaBytes(name: string, bytes: Uint8Array): MediaCheck {
  const ext = extensionOf(name)
  const detected = sniffMediaKind(bytes)
  if (!detected || !detected.extensions.includes(ext)) {
    return { ok: false, error: `El contenido de «${name}» no corresponde a un archivo .${ext} válido.` }
  }
  return { ok: true, kind: detected.kind }
}
