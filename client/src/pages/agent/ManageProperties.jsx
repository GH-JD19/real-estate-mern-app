import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Home, PlusCircle, Clock, XCircle } from "lucide-react"

function ManageProperties() {

  const navigate = useNavigate()

  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {!showContent ? (

        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded-xl shadow animate-pulse">
          Loading dashboard...
        </div>

      ) : (

        <>
          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Manage Properties
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your listings, approvals and activities
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* ADD PROPERTY */}
            <div
              onClick={() => navigate("/agent/add-property")}
              className="group p-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <PlusCircle className="text-green-600" size={28} />
                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                  Action
                </span>
              </div>

              <h3 className="text-lg font-semibold">
                Add Property
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create a new property listing
              </p>
            </div>

            {/* MY LISTINGS */}
            <div
              onClick={() => navigate("/agent/my-listings")}
              className="group p-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <Home className="text-blue-600" size={28} />
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                  View
                </span>
              </div>

              <h3 className="text-lg font-semibold">
                My Listings
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and manage your properties
              </p>
            </div>

            {/* PENDING */}
            <div
              onClick={() => navigate("/agent/pending-properties")}
              className="group p-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <Clock className="text-yellow-600" size={28} />
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
                  Pending
                </span>
              </div>

              <h3 className="text-lg font-semibold">
                Pending Approval
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track properties awaiting approval
              </p>
            </div>

            {/* REJECTED */}
            <div
              onClick={() => navigate("/agent/rejected-properties")}
              className="group p-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <XCircle className="text-red-600" size={28} />
                <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                  Alert
                </span>
              </div>

              <h3 className="text-lg font-semibold">
                Rejected Properties
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View rejected listings and fix issues
              </p>
            </div>

          </div>

          {/* EXTRA INFO SECTION */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h4 className="font-semibold text-lg mb-2">
                Tips for Approval
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Upload high-quality images</li>
                <li>• Add complete property details</li>
                <li>• Use correct pricing</li>
                <li>• Verify location properly</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h4 className="font-semibold text-lg mb-2">
                Quick Stats (Coming Soon)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analytics for your listings performance will appear here.
              </p>
            </div>

          </div>

        </>

      )}

    </div>
  )
}

export default ManageProperties