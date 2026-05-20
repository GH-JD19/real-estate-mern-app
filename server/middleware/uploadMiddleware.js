const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")
const path = require("path")

// ============================
// ✅ Allowed types
// ============================
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp"]

// ============================
// ✅ File filter (STRICT)
// ============================
const fileFilter = (req, file, cb) => {
  const isValidMime = ALLOWED_FORMATS.includes(file.mimetype)

  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"]

  const isValidExt = allowedExt.includes(ext)

  if (isValidMime && isValidExt) {
    cb(null, true)
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false)
  }
}

// ============================
// ✅ Safe filename (UNIQUE)
// ============================
const generatePublicId = (file) => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000000)

  const safeName = file.originalname
    .split(".")[0]
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase()

  return `${timestamp}-${random}-${safeName}`
}

// ============================
// ✅ Cloudinary storage
// ============================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "real-estate",
    resource_type: "image",
    allowed_formats: ["jpg", "png", "webp"],
    public_id: generatePublicId(file),

    // 🔥 IMAGE OPTIMIZATION (IMPORTANT)
    transformation: [
      { width: 1200, height: 800, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  }),
})

// ============================
// ✅ Multer instance
// ============================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
})

// ============================
// ✅ Wrapper (SAFE)
// ============================
const handleUpload = (field = "images", maxCount = 5) => {
  return (req, res, next) => {
    const uploader = upload.array(field, maxCount)

    uploader(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message,
        })
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        })
      }

      // 🔴 Extra safety: ensure files exist
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        })
      }

      next()
    })
  }
}

module.exports = {
  upload,
  handleUpload,
}