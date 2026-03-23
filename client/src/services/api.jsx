import axios from "axios"
import { loaderRef } from "../context/LoaderRef"   // ✅ ADD THIS

const api = axios.create({
  baseURL: "http://localhost:5000/api"
})

api.interceptors.request.use(
  (config) => {

    // 🔥 START LOADER
    loaderRef.current?.setLoading(true)

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    loaderRef.current?.setLoading(false)   // 🔥 STOP LOADER ON ERROR
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    loaderRef.current?.setLoading(false)   // 🔥 STOP LOADER
    return response
  },
  (error) => {
    loaderRef.current?.setLoading(false)   // 🔥 STOP LOADER
    return Promise.reject(error)
  }
)

export default api