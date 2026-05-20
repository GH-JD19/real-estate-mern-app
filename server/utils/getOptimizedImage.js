const getOptimizedImage = (url, width = 800) => {
  // ✅ Basic validation
  if (!url || typeof url !== "string") return url

  // ✅ Ensure it's a Cloudinary URL
  if (!url.includes("res.cloudinary.com")) return url

  // ✅ Ensure /upload/ exists
  if (!url.includes("/upload/")) return url

  // ✅ Prevent duplicate transformations
  if (url.includes("/upload/f_") || url.includes("/upload/q_")) return url

  // ✅ Sanitize width
  const safeWidth =
    typeof width === "number" && width > 0 && width <= 3000
      ? Math.round(width)
      : 800

  // ✅ Apply optimized transformation
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${safeWidth}/`
  )
}

module.exports = getOptimizedImage