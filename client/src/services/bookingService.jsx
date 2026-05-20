import api from "./api"

// 🔹 NORMALIZED ERROR HANDLER (CONSISTENT ACROSS APP)
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

// ================= CREATE BOOKING =================
export const createBooking = async (data) => {
  try {
    const res = await api.post("/bookings", data)
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= GET MY VISITS =================
export const getMyVisits = async () => {
  try {
    const res = await api.get("/bookings/my-visits")
    return res.data
  } catch (error) {
    return handleError(error)
  }
}