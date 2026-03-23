import { useLoader } from "../../context/LoaderContext"

const GlobalLoader = () => {
  const { loading } = useLoader()

  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
          Please wait...
        </p>
      </div>
    </div>
  )
}

export default GlobalLoader