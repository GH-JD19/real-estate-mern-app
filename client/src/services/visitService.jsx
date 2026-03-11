import api from "./api"

export const bookVisit = (propertyId, data) =>
  api.post(`/visits/${propertyId}`, data)

export const getUserVisits = () =>
  api.get("/visits/user")

export const getAgentVisits = () =>
  api.get("/visits/agent")

export const updateVisitStatus = (id, status) =>
  api.patch(`/visits/${id}`, { status })