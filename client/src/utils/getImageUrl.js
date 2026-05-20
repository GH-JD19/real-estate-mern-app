const BASE_URL = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com"

// 🔹 FALLBACK IMAGE
const FALLBACK_IMAGE = "/no-image.jpg"

// 🔹 GET IMAGE URL (PRODUCTION SAFE)
export const getImageUrl = (image) => {
  try {
    // ❌ No image → fallback
    if (!image) return FALLBACK_IMAGE

    // 🔹 If array → take first image
    if (Array.isArray(image)) {
      if (!image.length) return FALLBACK_IMAGE
      image = image[0]
    }

    // ❌ Invalid type
    if (typeof image !== "string") return FALLBACK_IMAGE

    // 🔹 External / Cloudinary / CDN
    if (image.startsWith("http")) {
      return image
    }

    // 🔹 Local uploads
    return `${BASE_URL}/uploads/${image}`

  } catch {
    return FALLBACK_IMAGE
  }
}