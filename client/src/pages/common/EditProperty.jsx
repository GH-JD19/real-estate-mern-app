import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"
import AddProperty from "./AddProperty"

const EditProperty = () => {
  const { id } = useParams()
  const [property, setProperty] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/properties/${id}`)

        // ✅ IMPORTANT FIX
        setProperty(res.data.property)

      } catch {
        console.error("Failed to fetch property")
      }
    }

    fetch()
  }, [id])

  if (!property) return <p>Loading...</p>

  return (
    <AddProperty
      editMode={true}
      propertyData={property}
      propertyId={id}
    />
  )
}

export default EditProperty