"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/dashboard/search-input"
import { cn } from "@/lib/utils"

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Imagen" },
] as const

export function MultimediaFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("type") ?? ""

  const setType = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("type", value)
    else params.delete("type")
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput placeholder="Buscar por título, archivo o código de ocurrencia..." />
      <div role="group" aria-label="Filtrar por tipo de archivo" className="inline-flex rounded-md border p-0.5">
        {TYPE_OPTIONS.map((option) => (
          <Button
            key={option.value || "all"}
            type="button"
            size="sm"
            variant={current === option.value ? "default" : "ghost"}
            aria-pressed={current === option.value}
            className={cn("h-8 px-3", current !== option.value && "text-muted-foreground")}
            onClick={() => setType(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
