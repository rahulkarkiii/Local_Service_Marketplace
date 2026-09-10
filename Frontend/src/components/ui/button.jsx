import * as React from "react"
import { cn } from "../../lib/utils"

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  accent: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
}

const sizes = {
  default: "h-10 px-5 py-2",
  sm: "h-8 px-3 text-sm",
  lg: "h-11 px-8 text-base",
  icon: "h-10 w-10",
}

export function Button({ className, variant="default", size="default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
