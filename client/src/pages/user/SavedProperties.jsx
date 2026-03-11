import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { getImageUrl } from "../../utils/getImageUrl"
import { toast } from "react-toastify"

function SavedProperties() {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {

    try {

      const res = await api.get("/wishlist")

      setProperties(res.data.properties || [])

    } catch (err) {

      console.log(err)
      toast.error("Failed to load wishlist")

    } finally {

      setLoading(false)

    }

  }

  const removeWishlist = async (id) => {

    try {

      await api.put(`/wishlist/remove/${id}`)

      setProperties(prev =>
        prev.filter(property => property._id !== id)
      )

      toast.success("Removed from wishlist")

    } catch (err) {

      console.log(err)
      toast.error("Failed to remove property")

    }

  }

  if (loading) {
    return <p className="text-gray-500">Loading saved properties...</p>
  }

  return (

    <div>

      <h2 className="text-2xl font-bold mb-6">
        Saved Properties
      </h2>

      {properties.length === 0 ? (

        <div className="bg-white rounded-lg shadow p-10 text-center">

          <h3 className="text-lg font-semibold mb-2">
            No saved properties
          </h3>

          <p className="text-gray-500 mb-4">
            Browse properties and save the ones you like.
          </p>

          <button
            onClick={() => navigate("/properties")}
            className="bg-[#000080] text-white px-6 py-2 rounded"
          >
            Browse Properties
          </button>

        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {properties.map(p => (

            <div
              key={p._id}
              className="bg-white shadow rounded overflow-hidden"
            >

              <img
                src={getImageUrl(p.media?.images?.[0])}
                alt={p.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-4">

                <h3 className="font-semibold text-lg">
                  {p.title}
                </h3>

                <p className="text-blue-600 font-bold">
                  ₹ {p.price?.toLocaleString()}
                </p>

                <p className="text-gray-600 mb-4">
                  {p.city}
                </p>

                <div className="flex gap-2">

                  <button
                    onClick={() => navigate(`/property/${p._id}`)}
                    className="flex-1 bg-[#000080] text-white py-2 rounded"
                  >
                    View
                  </button>

                  <button
                    onClick={() => removeWishlist(p._id)}
                    className="flex-1 border border-red-500 text-red-500 py-2 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}

export default SavedProperties