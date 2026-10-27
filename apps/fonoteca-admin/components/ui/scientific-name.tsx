import * as React from "react"
import { cn } from "@/lib/utils"

interface ScientificNameProps extends React.HTMLAttributes<HTMLElement> {
  /** Género, especie o subespecie. Se muestra siempre en cursiva; el dato guardado no cambia. */
  children?: React.ReactNode
  /** Autoría y año (p. ej. "Linnaeus, 1758"): van en redonda, fuera de la cursiva. */
  authorship?: string | null
}

export function ScientificName({ children, authorship, className, ...props }: ScientificNameProps) {
  return (
    <>
      <i className={cn("italic", className)} {...props}>{children}</i>
      {authorship ? <span className="not-italic"> {authorship}</span> : null}
    </>
  )
}
