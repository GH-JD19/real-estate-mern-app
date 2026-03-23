import { createContext, useContext, useState, useEffect } from "react"
import { loaderRef } from "./LoaderRef"

const LoaderContext = createContext()

export const LoaderProvider = ({ children }) => {

  const [loading, setLoading] = useState(false)

  // 🔥 CONNECT LoaderRef here
  useEffect(() => {
    loaderRef.current = { setLoading }
  }, [setLoading])

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  )
}

export const useLoader = () => useContext(LoaderContext)