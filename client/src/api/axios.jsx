import axios from "axios"

// ==============================
// CONFIG
// ==============================
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com/api"

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15s timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// ==============================
// TOKEN HELPERS
// ==============================
const getAccessToken = () => localStorage.getItem("accessToken")
const setAccessToken = (token) =>
  localStorage.setItem("accessToken", token)
const clearAccessToken = () =>
  localStorage.removeItem("accessToken")

// ==============================
// LOGOUT HANDLER
// ==============================
const logout = () => {
  clearAccessToken()
  window.location.href = "/login"
}

// ==============================
// REQUEST INTERCEPTOR
// ==============================
API.interceptors.request.use(
  (config) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ==============================
// REFRESH TOKEN QUEUE SYSTEM
// ==============================
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

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error)
      return Promise.reject(error)
    }

    const status = error.response.status

    // ==========================
    // HANDLE 401 (TOKEN EXPIRED)
    // ==========================
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(API(originalRequest))
            },
            reject: (err) => reject(err),
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.get(`${BASE_URL}/auth/refresh`, {
          withCredentials: true,
        })

        const newAccessToken = res?.data?.accessToken

        if (!newAccessToken) {
          throw new Error("No access token received")
        }

        setAccessToken(newAccessToken)

        // Update default header
        API.defaults.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return API(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // ==========================
    // HANDLE OTHER ERRORS
    // ==========================
    if (status === 403) {
      console.warn("Forbidden request")
    }

    if (status >= 500) {
      console.error("Server error:", error.response.data)
    }

    return Promise.reject(error)
  }
)

export default API