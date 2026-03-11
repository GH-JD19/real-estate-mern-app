import { useNavigate } from "react-router-dom"

function ManageProperties() {

  const navigate = useNavigate()

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-6">
        Manage Properties
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Add Property */}
        <div
          onClick={() => navigate("/agent/add-property")}
          className="p-6 bg-white dark:bg-gray-800 shadow rounded cursor-pointer hover:shadow-lg"
        >
          <h3 className="text-lg font-semibold">
            Add Property
          </h3>
          <p>Create a new listing</p>
        </div>

        {/* My Listings */}
        <div
          onClick={() => navigate("/agent/my-listings")}
          className="p-6 bg-white dark:bg-gray-800 shadow rounded cursor-pointer hover:shadow-lg"
        >
          <h3 className="text-lg font-semibold">
            My Listings
          </h3>
          <p>View added properties</p>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => navigate("/agent/pending-properties")}
          className="p-6 bg-white dark:bg-gray-800 shadow rounded cursor-pointer hover:shadow-lg"
        >
          <h3 className="text-lg font-semibold">
            Pending Approval
          </h3>
          <p>Track admin approval status</p>
        </div>

      </div>

    </div>
  )
}

export default ManageProperties