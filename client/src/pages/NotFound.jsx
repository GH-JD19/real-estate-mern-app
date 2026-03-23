import { useNavigate } from "react-router-dom"
import { Home } from "lucide-react"

function NotFound() {

  const navigate = useNavigate()

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">

      <div className="text-center max-w-md">

        {/* 404 TEXT */}
        <h1 className="text-7xl font-bold text-blue-600 mb-6">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <Home size={18} />
          Back to Home
        </button>

      </div>

    </div>

  )
}

export default NotFound