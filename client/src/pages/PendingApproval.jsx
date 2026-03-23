import { useNavigate } from "react-router-dom"
import { Home } from "lucide-react"

function PendingApproval() {

  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl text-center max-w-lg">

        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          Account Pending Approval
        </h2>

        <p className="text-gray-600 dark:text-gray-300">
          Your account has been created successfully.
        </p>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Admin will activate your account within 24 hours.
        </p>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          You will receive an email notification once approved.
        </p>

      </div>
    </div>
  )
}

export default PendingApproval