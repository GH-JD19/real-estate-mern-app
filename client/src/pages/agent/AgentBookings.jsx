import { useEffect, useState } from "react"
import api from "../../services/api"

const AgentBookings = () => {

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {

      const res = await api.get("/visits/agent")

      setBookings(res.data.visits || [])

    } catch (err) {

      console.log("Agent bookings fetch error", err)
      setBookings([])

    } finally {

      setLoading(false)

    }
  }

  const updateStatus = async (id, status) => {

    try {

      await api.patch(`/visits/${id}`, { status })

      fetchBookings()

    } catch (err) {

      console.log("Status update failed", err)

    }

  }

  const getStatusBadge = (status) => {

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
    <>

      <h2 className="text-2xl font-bold mb-6">
        Visit Requests
      </h2>

      {loading ? (

        <div className="bg-white p-6 rounded shadow text-center">
          Loading...
        </div>

      ) : bookings.length === 0 ? (

        <div className="bg-white p-6 rounded shadow text-center">
          No Visit Requests Yet
        </div>

      ) : (

        <table className="w-full bg-white rounded shadow">

          <thead className="bg-gray-200">

            <tr>

              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Property</th>
              <th className="p-4 text-left">Visit Date</th>
              <th className="p-4 text-center">Action</th>

            </tr>

          </thead>

          <tbody>

            {bookings.map(b => (

              <tr key={b._id} className="border-t">

                <td className="p-4">
                  {b.user?.name}
                </td>

                <td className="p-4">
                  {b.property?.title}
                </td>

                <td className="p-4">
                  {new Date(b.visitDate).toLocaleDateString()}
                </td>

                <td className="p-4 text-center">

                  {b.status === "PENDING" ? (

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => updateStatus(b._id, "APPROVED")}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(b._id, "REJECTED")}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>

                    </div>

                  ) : (

                    <span
                      className={`text-white px-3 py-1 rounded text-sm ${getStatusBadge(b.status)}`}
                    >
                      {b.status}
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </>
  )

}

export default AgentBookings