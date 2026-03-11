import api from "./api"

// Add property to wishlist
export const addToWishlist = (id) => {
  return api.put(`/wishlist/add/${id}`)
}

// Remove property from wishlist
export const removeFromWishlist = (id) => {
  return api.put(`/wishlist/remove/${id}`)
}

// Get wishlist
export const getWishlist = () => {
  return api.get("/wishlist")
}