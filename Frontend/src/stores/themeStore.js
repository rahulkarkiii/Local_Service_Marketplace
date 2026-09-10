import { create } from "zustand"

function getInitialTheme() {
  const stored = localStorage.getItem("theme")
  if (stored === "dark" || stored === "light") return stored
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  return "light"
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
  localStorage.setItem("theme", theme)
}

const useThemeStore = create((set, get) => ({
  theme: typeof window !== "undefined" ? getInitialTheme() : "light",
  initialized: false,
  init: () => {
    const t = getInitialTheme()
    applyTheme(t)
    set({ theme: t, initialized: true })
  },
  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark"
    applyTheme(next)
    set({ theme: next })
  },
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))

export default useThemeStore
