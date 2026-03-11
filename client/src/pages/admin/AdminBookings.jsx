import { useEffect, useState } from "react"
import api from "../../services/api"

function AdminBookings() {

  const [bookings, setBookings] = useState([])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {

    try {

      const res = await api.get("/visits/admin")
      setBookings(res.data.visits)

    } catch (err) {
      console.log(err)
    }

  }

  return (

    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">
        All Bookings
      </h2>

      {bookings.map(b => (

        <div
          key={b._id}
          className="bg-white shadow rounded p-4 mb-4"
        >

          <h3 className="font-semibold">
            {b.property?.title}
          </h3>

          <p>User: {b.user?.name}</p>

          <p>
            Visit Date:
            {new Date(b.visitDate).toLocaleString()}
          </p>

          <p>Status: {b.status}</p>

        </div>

      ))}

    </div>

  )

}

export default AdminBookings