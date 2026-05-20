import React, { memo } from "react"
import { useTheme } from "../context/ThemeContext"

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    >
      {darkMode ? "☀ Light" : "🌙 Dark"}
    </button>
  )
}

export default memo(ThemeToggle)