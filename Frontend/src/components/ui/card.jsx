import { cn } from "../../lib/utils"

export function Card({ className, ...props }) {
  return <div className={cn("rounded-2xl border bg-card text-card-foreground shadow-soft hover:shadow-medium transition-shadow duration-200", className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-[18px] font-bold leading-tight tracking-tight font-display", className)} {...props} />
}
export function CardDescription({ className, ...props }) {
  return <p className={cn("text-[13px] leading-relaxed text-muted-foreground", className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-2", className)} {...props} />
}
export function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}
