import { useEffect, useState } from "react"
import { useLoader } from "../../context/LoaderContext"

const GlobalLoader = () => {
  const { loading } = useLoader()
  const [visible, setVisible] = useState(false)

  // ================= SMOOTH LOADER (NO FLICKER) =================
  useEffect(() => {
    let timer

    if (loading) {
      timer = setTimeout(() => setVisible(true), 200) // delay to avoid flicker
    } else {
      setVisible(false)
    }

    return () => clearTimeout(timer)
  }, [loading])

  // ================= PREVENT BACKGROUND SCROLL =================
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto"
    >
      <div className="bg-white dark:bg-gray-800 px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">

        {/* SPINNER */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin motion-reduce:animate-none"></div>

        {/* TEXT */}
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
          Please wait...
        </p>

      </div>
    </div>
  )
}

export default GlobalLoader