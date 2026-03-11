export const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";

  // Cloudinary or external image
  if (image.startsWith("http")) {
    return image;
  }

  // Local uploaded image
  return `http://localhost:5000/uploads/${image}`;
};