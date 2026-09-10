import * as React from "react"
import { cn } from "../../lib/utils"

// polished, intentional palette — violet primary, neutral secondary, solid outline for dark visibility
const variants = {
  default: "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-500 shadow-sm border border-violet-600 dark:border-violet-500",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700",
  outline: "bg-white text-zinc-900 border-2 border-zinc-200 hover:bg-muted/40 hover:border-zinc-300 dark:bg-transparent dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:border-zinc-500 dark:hover:text-white",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
  destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-sm border border-red-600",
  accent: "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-400 shadow-sm border border-orange-500",
}

const sizes = {
  default: "h-10 px-5 py-2 text-[14px]",
  sm: "h-8 px-3 text-[13px]",
  lg: "h-11 px-7 text-[15px]",
  icon: "h-9 w-9",
}

export function Button({ className, variant="default", size="default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
        variants[variant],
        sizes[size],
        // ensure visible focus and not muted when enabled
        "enabled:shadow-sm",
        className
      )}
      {...props}
    />
  )
}
