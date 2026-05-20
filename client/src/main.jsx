import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { HelmetProvider } from "react-helmet-async"

import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { LoaderProvider } from "./context/LoaderContext"

import "./index.css"

// 🔹 ROOT ELEMENT SAFETY
const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>

        {/* 🔹 GLOBAL PROVIDERS (ORDER MATTERS) */}
        <ThemeProvider>
          <AuthProvider>
            <LoaderProvider>

              {/* 🔹 MAIN APP */}
              <App />

              {/* 🔹 TOAST CONFIG (PRODUCTION SAFE) */}
              <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                pauseOnFocusLoss
                theme="colored"
              />

            </LoaderProvider>
          </AuthProvider>
        </ThemeProvider>

      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)