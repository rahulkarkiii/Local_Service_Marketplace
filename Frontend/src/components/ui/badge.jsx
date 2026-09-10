import { cn } from "../../lib/utils"

const variants = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border text-foreground",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
  destructive: "bg-red-500 text-white",
  info: "bg-sky-500 text-white",
}

export function Badge({ className, variant="default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export function StatusBadge({ status }) {
  const map = {
    PENDING: "warning",
    ACCEPTED: "info",
    REJECTED: "destructive",
    COMPLETED: "success",
    CANCELLED: "secondary",
    FAILED: "destructive",
  }
  return <Badge variant={map[status] || "secondary"}>{status}</Badge>
}
