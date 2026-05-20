import api from "./api"

// 🔹 NORMALIZED ERROR HANDLER
const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"

  return Promise.reject({
    message,
    status: error?.response?.status || 500,
    data: error?.response?.data || null
  })
}

// ================= BOOK VISIT =================
export const bookVisit = async (propertyId, data) => {
  if (!propertyId) {
    return Promise.reject({ message: "Property ID is required" })
  }

  try {
    const res = await api.post(`/visits/${propertyId}`, data)
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= USER VISITS =================
export const getUserVisits = async () => {
  try {
    const res = await api.get("/visits/user")
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= AGENT VISITS =================
export const getAgentVisits = async () => {
  try {
    const res = await api.get("/visits/agent")
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= UPDATE STATUS =================
export const updateVisitStatus = async (id, status) => {
  if (!id) {
    return Promise.reject({ message: "Visit ID is required" })
  }

  try {
    const res = await api.patch(`/visits/${id}`, { status })
    return res.data
  } catch (error) {
    return handleError(error)
  }
}