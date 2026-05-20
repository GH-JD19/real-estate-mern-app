import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { loaderRef } from "./LoaderRef"

const LoaderContext = createContext()

export const LoaderProvider = ({ children }) => {

  const [loading, setLoading] = useState(false)

  // 🔹 STABLE SETTER (prevents unnecessary re-renders)
  const setLoader = useCallback((state) => {
    setLoading(!!state)
  }, [])

  // 🔹 OPTIONAL TOGGLE (useful in real apps)
  const toggleLoader = useCallback(() => {
    setLoading((prev) => !prev)
  }, [])

  // 🔥 CONNECT LoaderRef SAFELY
  useEffect(() => {
    loaderRef.current = {
      setLoading: setLoader,
      toggle: toggleLoader
    }

    return () => {
      loaderRef.current = null // cleanup to prevent stale reference
    }
  }, [setLoader, toggleLoader])

  // 🔹 MEMOIZED CONTEXT VALUE (important for large apps)
  const value = useMemo(() => ({
    loading,
    setLoading: setLoader,
    toggleLoader
  }), [loading, setLoader, toggleLoader])

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  )
}

// 🔹 SAFE HOOK
export const useLoader = () => {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error("useLoader must be used within LoaderProvider")
  }

  return context
}