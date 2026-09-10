import { cn } from "../../lib/utils"

// solid, high-contrast pills — consistent across light/dark, no low-contrast muted defaults
const variants = {
  default: "bg-violet-600 text-white dark:bg-violet-500 dark:text-white border border-violet-600 dark:border-violet-500",
  secondary: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100",
  outline: "bg-white text-zinc-700 border-2 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600",
  success: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white border border-emerald-600 dark:border-emerald-500",
  warning: "bg-amber-500 text-white dark:bg-amber-500 dark:text-white border border-amber-500",
  destructive: "bg-red-600 text-white dark:bg-red-500 dark:text-white border border-red-600 dark:border-red-500",
  info: "bg-sky-600 text-white dark:bg-sky-500 dark:text-white border border-sky-600 dark:border-sky-500",
  neutral: "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
}

export function Badge({ className, variant="default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide leading-none border shadow-sm",
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
    CANCELLED: "neutral",
    FAILED: "destructive",
    REFUNDED: "neutral",
    REVIEWED: "info",
    RESOLVED: "success",
    EXPIRED: "neutral",
  }
  return <Badge variant={map[status] || "neutral"}>{status}</Badge>
}
