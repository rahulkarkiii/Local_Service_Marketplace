import * as React from "react"
import { cn } from "../../lib/utils"

export const Input = React.forwardRef(({ className, type="text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border-2 border-input bg-background px-3.5 py-2 text-[14px] font-normal ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-[14px] ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export const Label = ({ className, ...props }) => (
  <label className={cn("text-[13px] font-semibold leading-none tracking-wide text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
)

export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border-2 border-input bg-background px-3.5 py-2 text-[14px] focus-visible:outline-none focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20",
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = "Select"
