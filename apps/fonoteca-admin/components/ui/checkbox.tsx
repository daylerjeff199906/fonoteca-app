"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
    HTMLButtonElement,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "checked" | "onChange"> & {
        checked?: boolean
        onCheckedChange?: (checked: boolean) => void
    }
>(({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-primary text-primary-foreground" : "bg-transparent",
            className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
    >
        <div className={cn("flex items-center justify-center text-current", !checked && "opacity-0")}>
            <Check className="h-3.5 w-3.5 stroke-[3]" />
        </div>
    </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
