import api from "./api"

export const createBooking = (data) => {
  return api.post("/bookings", data)
}

export const getMyVisits = () => {
  return api.get("/bookings/my-visits")
}