"use client"

import * as React from "react"
import Link from "next/link"
import { Inbox, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Contenedor estándar de las tablas administrativas: ocupa todo el ancho disponible,
 * crece con su contenido (sin scroll vertical interno) y desplaza solo en horizontal.
 */
export function DataTableCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full rounded-md border bg-card shadow-sm", className)} {...props} />
}

export interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

/** Mensaje de estado vacío con acción principal opcional. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", className)}>
      <Inbox className="h-8 w-8 text-muted-foreground/60" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-md text-xs text-muted-foreground">{description}</p>}
      {action && (
        <Button
          asChild={!!action.href}
          size="sm"
          className="mt-2 h-9"
          onClick={action.href ? undefined : action.onClick}
        >
          {action.href ? (
            <Link href={action.href}>{action.icon}{action.label}</Link>
          ) : (
            <>{action.icon}{action.label}</>
          )}
        </Button>
      )}
    </div>
  )
}

interface TableEmptyRowProps extends EmptyStateProps {
  colSpan: number
}

/** Fila única para tablas sin resultados. */
export function TableEmptyRow({ colSpan, ...state }: TableEmptyRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="p-0">
        <EmptyState {...state} />
      </TableCell>
    </TableRow>
  )
}

interface BulkActionBarProps {
  count: number
  onClear: () => void
  children: React.ReactNode
  /** Sustantivo en plural, p. ej. "hábitats". */
  itemLabel?: string
}

/** Barra contextual que aparece solo cuando hay filas seleccionadas. */
export function BulkActionBar({ count, onClear, children, itemLabel }: BulkActionBarProps) {
  if (count === 0) return null
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Acciones sobre la selección"
      className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2"
    >
      <span className="text-sm font-medium">
        {count} {count === 1 ? "seleccionado" : "seleccionados"}
        {itemLabel ? ` · ${itemLabel}` : ""}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button variant="ghost" size="sm" className="ml-auto h-9" onClick={onClear}>
        <X className="h-4 w-4" />
        Limpiar selección
      </Button>
    </div>
  )
}

/** Selección múltiple de filas; se reinicia cuando cambia el conjunto de filas visibles (página o filtros). */
export function useRowSelection(ids: string[]) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const signature = ids.join("|")

  React.useEffect(() => {
    setSelectedIds([])
  }, [signature])

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }, [])

  const toggleAll = React.useCallback(() => {
    setSelectedIds((current) => (current.length === ids.length ? [] : [...ids]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  const clear = React.useCallback(() => setSelectedIds([]), [])

  return {
    selectedIds,
    count: selectedIds.length,
    isSelected: (id: string) => selectedIds.includes(id),
    allSelected: ids.length > 0 && selectedIds.length === ids.length,
    toggle,
    toggleAll,
    clear,
  }
}
