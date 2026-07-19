import { writable } from "svelte/store"

type Theme = "light" | "dark"

// Simple browser detection for non-SvelteKit environments
const isBrowser = typeof window !== "undefined"

function getSavedTheme(): Theme {
  if (!isBrowser) return "dark"
  const saved = (localStorage.getItem("theme") || sessionStorage.getItem("theme")) as Theme
  return saved === "light" || saved === "dark" ? saved : "dark"
}

function saveTheme(theme: Theme) {
  if (!isBrowser) return
  localStorage.setItem("theme", theme)
  sessionStorage.setItem("theme", theme)
  document.documentElement.classList.toggle("dark", theme === "dark")
}

function createThemeStore() {
  const defaultTheme: Theme = getSavedTheme()
  if (isBrowser) {
    document.documentElement.classList.toggle("dark", defaultTheme === "dark")
  }

  const { subscribe, set, update } = writable<Theme>(defaultTheme)

  return {
    subscribe,
    toggle: () => {
      update((current) => {
        const newTheme = current === "dark" ? "light" : "dark"
        saveTheme(newTheme)
        return newTheme
      })
    },
    set: (theme: Theme) => {
      saveTheme(theme)
      set(theme)
    },
    init: () => {
      if (isBrowser) {
        const theme = getSavedTheme()
        saveTheme(theme)
        set(theme)
      }
    },
  }
}

export const theme = createThemeStore()

