import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

function ScrollToTop() {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // ✅ Prevent scroll on initial load (better UX)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // ✅ Safe browser check
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  }, [pathname])

  return null
}

export default ScrollToTop