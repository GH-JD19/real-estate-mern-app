import API from "../api/axios"

// 🔹 SAFE TOKEN STORAGE (ALIGNED WITH AUTH CONTEXT)
const storeTokens = (accessToken, refreshToken, keepLoggedIn = true) => {
  if (!accessToken) return

  if (keepLoggedIn) {
    localStorage.setItem("accessToken", accessToken)
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken)

    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
  } else {
    sessionStorage.setItem("accessToken", accessToken)
    if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken)

    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }
}

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

// ================= LOGIN =================
export const loginUser = async (data, keepLoggedIn = true) => {
  try {
    const res = await API.post("/auth/login", data)

    const { accessToken, refreshToken } = res.data || {}

    storeTokens(accessToken, refreshToken, keepLoggedIn)

    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= REGISTER =================
export const registerUser = async (data, keepLoggedIn = true) => {
  try {
    const res = await API.post("/auth/register", data)

    const { accessToken, refreshToken } = res.data || {}

    storeTokens(accessToken, refreshToken, keepLoggedIn)

    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= LOGOUT =================
export const logoutUser = async () => {
  try {
    await API.post("/auth/logout")
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    // 🔹 CLEAR ALL STORAGE (CONSISTENT WITH API LAYER)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  }
}

// ================= GET CURRENT USER =================
export const getMe = async () => {
  try {
    const res = await API.get("/auth/me")
    return res.data
  } catch (error) {
    return handleError(error)
  }
}

// ================= CHANGE PASSWORD =================
export const changePassword = async (data) => {
  try {
    const res = await API.put("/auth/change-password", data)
    return res.data
  } catch (error) {
    return handleError(error)
  }
}