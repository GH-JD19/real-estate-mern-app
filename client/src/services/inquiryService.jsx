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

// ================= SEND INQUIRY =================
export const sendInquiry = async (propertyId, data) => {
  if (!propertyId) {
    return Promise.reject({ message: "Property ID is required" })
  }

  try {
    const res = await api.post(`/inquiries/${propertyId}`, data)
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= GET AGENT INQUIRIES =================
export const getAgentInquiries = async () => {
  try {
    const res = await api.get("/inquiries/agent")
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= UPDATE INQUIRY STATUS =================
export const updateInquiryStatus = async (id, status) => {
  if (!id) {
    return Promise.reject({ message: "Inquiry ID is required" })
  }

  try {
    const res = await api.patch(`/inquiries/${id}`, { status })
    return res.data
  } catch (error) {
    return handleError(error)
  }
}