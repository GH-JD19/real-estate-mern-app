import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"

const ThemeContext = createContext()

// 🔹 SAFE GET INITIAL THEME
const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem("theme")

    if (stored === "dark") return true
    if (stored === "light") return false

    // fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  } catch {
    return false
  }
}

export const ThemeProvider = ({ children }) => {

  const [darkMode, setDarkMode] = useState(getInitialTheme)

  // 🔹 APPLY THEME (NO FLICKER)
  useEffect(() => {
    const root = document.documentElement

    if (darkMode) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  // 🔹 TOGGLE (SAFE)
  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev)
  }, [])

  // 🔹 OPTIONAL: LISTEN TO SYSTEM CHANGES (ONLY IF USER HASN'T SET MANUALLY)
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (e) => {
      const stored = localStorage.getItem("theme")
      if (!stored) {
        setDarkMode(e.matches)
      }
    }

    media.addEventListener("change", handleChange)

    return () => {
      media.removeEventListener("change", handleChange)
    }
  }, [])

  // 🔹 MEMO VALUE
  const value = useMemo(() => ({
    darkMode,
    toggleTheme
  }), [darkMode, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 🔹 SAFE HOOK
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}