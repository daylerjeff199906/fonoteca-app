"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchMediaFileState } from "@/lib/media-upload.client"
import { isAwaitingDerivative, type LiveMediaItem } from "@/lib/media-state"

type Derivatives = Pick<LiveMediaItem, "thumbnail_url" | "display_url" | "audio_url" | "processing_status">

const FIRST_CHECK_MS = 700
const MAX_ATTEMPTS = 60

/** Espera creciente entre consultas: rápida al principio (las imágenes tardan segundos) y más espaciada después. */
const delayFor = (attempt: number) => Math.min(FIRST_CHECK_MS * 1.4 ** attempt, 5000)

/**
 * Devuelve los multimedia con sus derivados al día. Los archivos que el backend todavía procesa se consultan hasta
 * que terminan y la lista se actualiza sola, sin recargar la página ni volver a guardar el registro.
 */
export function useLiveMedia<T extends LiveMediaItem>(items: T[]): T[] {
  const [updates, setUpdates] = useState<Record<string, Derivatives>>({})

  const merged = useMemo(
    () =>
      items.map((item) => {
        const update = updates[item.id]
        if (!update) return item
        return {
          ...item,
          thumbnail_url: item.thumbnail_url ?? update.thumbnail_url ?? null,
          display_url: item.display_url ?? update.display_url ?? null,
          audio_url: item.audio_url ?? update.audio_url ?? null,
          processing_status: update.processing_status ?? item.processing_status,
        }
      }),
    [items, updates],
  )

  // Los ids pendientes forman la clave del efecto: cuando uno termina, la consulta continúa solo con los restantes.
  const pending = merged.filter(isAwaitingDerivative)
  const pendingKey = pending.map((item) => `${item.id}:${item.file_id}`).join("|")

  useEffect(() => {
    if (!pendingKey) return
    const targets = pendingKey.split("|").map((entry) => {
      const [id, fileId] = entry.split(":")
      return { id, fileId }
    })
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0

    const check = async () => {
      const results = await Promise.all(
        targets.map(async ({ id, fileId }) => {
          try {
            return { id, state: await fetchMediaFileState(fileId) }
          } catch {
            return { id, state: null }
          }
        }),
      )
      if (cancelled) return

      const changes: Record<string, Derivatives> = {}
      for (const { id, state } of results) {
        if (!state) continue
        changes[id] = {
          thumbnail_url: state.assets?.thumbnail_url ?? null,
          display_url: state.assets?.display_url ?? null,
          audio_url: state.assets?.audio_url ?? null,
          processing_status: state.status,
        }
      }
      if (Object.keys(changes).length) setUpdates((current) => ({ ...current, ...changes }))

      attempt += 1
      if (attempt < MAX_ATTEMPTS) timer = setTimeout(check, delayFor(attempt))
    }

    timer = setTimeout(check, FIRST_CHECK_MS)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [pendingKey])

  return merged
}
