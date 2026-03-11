import { useTheme } from "../context/ThemeContext"

const ThemeToggle = () => {

  const { darkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm"
    >
      {darkMode ? "☀ Light" : "🌙 Dark"}
    </button>
  )
}

export default ThemeToggle