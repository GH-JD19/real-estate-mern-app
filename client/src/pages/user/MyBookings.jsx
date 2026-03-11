import { useEffect, useState } from "react"
import api from "../../services/api"

function MyBookings() {

  const [bookings, setBookings] = useState([])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {

    try {

      const res = await api.get("/visits/user")

      setBookings(res.data.visits)

    } catch (err) {
      console.log(err)
    }

  }

  return (

    <div>

      <h2 className="text-2xl font-bold mb-6">
        My Visits
      </h2>

      {bookings.length === 0 ? (
        <p>No visits booked</p>
      ) : (

        <div className="space-y-6">

          {bookings.map(b => (

            <div
              key={b._id}
              className="flex bg-white shadow rounded p-4"
            >

              <div className="flex-1">

                <h3 className="font-semibold text-lg">
                  {b.property?.title}
                </h3>

                <p>{b.property?.city}</p>

                <p className="text-blue-600 font-bold">
                  ₹ {b.property?.price?.toLocaleString()}
                </p>

                <p className="mt-2">
                  Visit Date:
                  <span className="ml-2">
                    {new Date(b.visitDate).toLocaleString()}
                  </span>
                </p>

                <p className="mt-2">
                  Status:
                  <span className="ml-2 font-semibold">
                    {b.status}
                  </span>
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  )
}

export default MyBookings