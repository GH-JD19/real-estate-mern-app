import axios from "axios";
import { loaderRef } from "../context/LoaderRef";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    loaderRef.current?.setLoading(true);

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    loaderRef.current?.setLoading(false);
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    loaderRef.current?.setLoading(false);
    return response;
  },
  async (error) => {
    loaderRef.current?.setLoading(false);

    const originalRequest = error.config;

    // 🔥 TOKEN EXPIRED HANDLING
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // 🔁 CALL REFRESH API
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        // 💾 SAVE NEW TOKEN
        localStorage.setItem("accessToken", newAccessToken);

        // 🔁 UPDATE HEADER
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 🔁 RETRY ORIGINAL REQUEST
        return api(originalRequest);

      } catch (err) {
        // ❌ REFRESH FAILED → LOGOUT
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;