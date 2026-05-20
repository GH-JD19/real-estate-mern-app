import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"
import { useCallback } from "react"

function NotFound() {
  const navigate = useNavigate()

  const handleHome = useCallback(() => {
    navigate("/")
  }, [navigate])

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }, [navigate])

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">

      <div className="text-center max-w-md bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <Home size={48} className="text-blue-500" />
        </div>

        {/* HEADER */}
        <header>
          <h1 className="text-7xl font-bold text-blue-600 mb-8">
            404
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Page Not Found
          </h2>
        </header>

        <p className="text-gray-500 dark:text-gray-400 mb-10">
          Looks like this property or page is no longer available.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Home Button */}
          <button
            onClick={handleHome}
            aria-label="Go to homepage"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <Home size={18} />
            Back to Home
          </button>

          {/* Back Button */}
          <button
            onClick={handleBack}
            aria-label="Go to previous page"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2 py-1"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

        </div>

      </div>

    </section>
  )
}

export default NotFound