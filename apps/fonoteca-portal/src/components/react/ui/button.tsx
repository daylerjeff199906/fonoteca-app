import * as React from "react"
import { cn } from "../../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'icon'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green disabled:opacity-50 disabled:pointer-events-none",
          variant === 'default' && "bg-gray-900 text-white hover:bg-gray-800 dark:bg-accent-green dark:text-white dark:hover:bg-accent-green/80",
          variant === 'outline' && "border border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300",
          variant === 'ghost' && "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/40",
          variant === 'icon' && "bg-transparent",
          size === 'default' && "h-10 px-4 py-2 text-sm",
          size === 'sm' && "h-8 px-3 text-xs",
          size === 'lg' && "h-11 px-8",
          size === 'icon' && "h-10 w-10 p-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
