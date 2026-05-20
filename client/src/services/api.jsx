import axios from "axios"
import { loaderRef } from "../context/LoaderRef"

// 🔹 BASE URL (ENV SAFE)
const API_BASE = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com/api"

// 🔹 AXIOS INSTANCE
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// 🔹 TOKEN HELPERS
const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken")

const getRefreshToken = () =>
  localStorage.getItem("refreshToken") ||
  sessionStorage.getItem("refreshToken")

const setAccessToken = (token) => {
  if (localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", token)
  } else {
    sessionStorage.setItem("accessToken", token)
  }
}

// 🔹 LOGOUT HANDLER (CENTRALIZED)
const handleLogout = () => {
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = "/login"
}

// 🔹 REFRESH CONTROL (PREVENT MULTIPLE CALLS)
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    loaderRef.current?.setLoading(true)

    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    loaderRef.current?.setLoading(false)
    return Promise.reject(error)
  }
)

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    loaderRef.current?.setLoading(false)
    return response
  },
  async (error) => {
    loaderRef.current?.setLoading(false)

    const originalRequest = error.config

    // 🔴 HANDLE 401
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        // 🔁 QUEUE REQUESTS
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            },
            reject: (err) => reject(err)
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          throw new Error("No refresh token")
        }

        // 🔁 REFRESH CALL
        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken
        })

        const newAccessToken = res.data.accessToken

        setAccessToken(newAccessToken)

        // 🔁 UPDATE DEFAULT HEADER
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)

        // 🔁 RETRY ORIGINAL REQUEST
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (err) {
        processQueue(err, null)
        handleLogout()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api