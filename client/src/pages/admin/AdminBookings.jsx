import { useEffect, useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"

function AdminBookings() {

  const [bookings, setBookings] = useState([])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {

      const res = await api.get("/visits/admin")

      setBookings(res.data.visits || [])

    } catch (err) {

      toast.error("Failed to load bookings")

    }
  }

  const updateStatus = async (id, status) => {

    try {

      await api.put(`/visits/${id}`, { status })

      toast.success(`Booking ${status}`)

      fetchBookings()

    } catch (error) {

      toast.error("Failed to update booking")

    }

  }

  const statusColor = (status) => {

    switch (status) {
      case "APPROVED":
        return "bg-green-500"

      case "REJECTED":
        return "bg-red-500"

      default:
        return "bg-yellow-500"
    }

  }

  
  return (

    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">

      <h2 className="text-2xl font-bold mb-6">
        All Bookings
      </h2>

      {bookings.length === 0 ? (

        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
          No bookings found
        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {bookings.map(b => (

            <div
              key={b._id}
              className="bg-white dark:bg-gray-800 shadow rounded p-5"
            >

              <h3 className="font-semibold text-lg mb-2">
                {b.property?.title || "Property"}
              </h3>

              <p className="text-sm mb-1">
                <strong>User:</strong> {b.user?.name}
              </p>

              <p className="text-sm mb-1">
                <strong>Email:</strong> {b.user?.email}
              </p>

              <p className="text-sm mb-1">
                <strong>Visit Date:</strong>{" "}
                {new Date(b.visitDate).toLocaleString()}
              </p>

              <div className="mt-2 mb-3">

                <span className={`text-white px-3 py-1 rounded text-xs ${statusColor(b.status)}`}>
                  {b.status}
                </span>

              </div>

              {b.status === "PENDING" && (

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() => updateStatus(b._id, "APPROVED")}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(b._id, "REJECTED")}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  )

}

export default AdminBookings