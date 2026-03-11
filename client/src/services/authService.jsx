import api from "./api"

export const changePassword = (data) => {
  return api.put("/auth/change-password", data)
}