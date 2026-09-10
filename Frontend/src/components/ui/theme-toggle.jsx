import { Moon, Sun } from "lucide-react"
import useThemeStore from "../../stores/themeStore"

export function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useThemeStore()

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200 overflow-hidden group ${className}`}
    >
      <Sun className={`h-4 w-4 absolute transition-all duration-300 ${theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
      <Moon className={`h-4 w-4 absolute transition-all duration-300 ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

// compact pill variant for dashboards
export function ThemeTogglePill() {
  const { theme, toggle } = useThemeStore()
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
    >
      {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  )
}
