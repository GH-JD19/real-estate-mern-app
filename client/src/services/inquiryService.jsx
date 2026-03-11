import api from "./api"

export const sendInquiry = (propertyId, data) =>
  api.post(`/inquiries/${propertyId}`, data)

export const getAgentInquiries = () =>
  api.get("/inquiries/agent")

export const updateInquiryStatus = (id, status) =>
  api.patch(`/inquiries/${id}`, { status })