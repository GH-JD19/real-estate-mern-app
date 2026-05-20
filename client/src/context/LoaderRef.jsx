import { createRef } from "react"

// 🔹 GLOBAL LOADER REF (SAFE DEFAULTS)
export const loaderRef = createRef()

// 🔹 INITIAL SAFE SHAPE (prevents undefined errors anywhere in app)
loaderRef.current = {
  setLoading: () => {},
  toggle: () => {}
}