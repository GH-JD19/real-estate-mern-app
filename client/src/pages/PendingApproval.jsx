import { useNavigate } from "react-router-dom"
import { Home, Clock } from "lucide-react"
import { useCallback } from "react"

function PendingApproval() {
  const navigate = useNavigate()

  const handleHome = useCallback(() => {
    navigate("/")
  }, [navigate])

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-10">

      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg text-center max-w-lg w-full border border-gray-100 dark:border-gray-700">

        {/* ICON */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
            <Clock className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
        </div>

        {/* HEADER */}
        <header>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Account Pending Approval
          </h2>
        </header>

        {/* DESCRIPTION */}
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Your account has been created successfully.
        </p>

        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Our admin team is reviewing your account.
        </p>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          This usually takes up to{" "}
          <span className="font-medium">24 hours</span>.
          You’ll receive an email once your account is activated.
        </p>

        {/* BUTTON */}
        <button
          onClick={handleHome}
          aria-label="Go to homepage"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <Home size={18} />
          Back to Home
        </button>

      </div>

    </section>
  )
}

export default PendingApproval