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

// ================= ADD TO WISHLIST =================
export const addToWishlist = async (id) => {
  if (!id) {
    return Promise.reject({ message: "Property ID is required" })
  }

  try {
    const res = await api.put(`/wishlist/add/${id}`)
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= REMOVE FROM WISHLIST =================
export const removeFromWishlist = async (id) => {
  if (!id) {
    return Promise.reject({ message: "Property ID is required" })
  }

  try {
    const res = await api.put(`/wishlist/remove/${id}`)
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= GET WISHLIST =================
export const getWishlist = async () => {
  try {
    const res = await api.get("/wishlist")
    return res.data
  } catch (error) {
    return handleError(error)
  }
}