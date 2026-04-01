const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const protect = require("../middleware/authMiddleware")

// ================= GET NOTIFICATIONS =================
router.get("/", protect, async (req, res) => {

  let filter = {}

  if (req.user.role === "admin") {
    filter.role = "admin"
  }

  if (req.user.role === "agent") {
    filter.role = "agent"
  }

  if (req.user.role === "user") {
    filter.userId = req.user._id.toString()
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })

  res.json({ notifications })
})


// ================= MARK ONE AS READ =================
router.put("/:id/read", protect, async (req, res) => {

  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    return res.status(404).json({ message: "Not found" })
  }

  notification.read = true
  await notification.save()

  res.json({ success: true })
})


// ================= MARK ALL AS READ =================
router.put("/read-all", protect, async (req, res) => {

  let filter = {}

  if (req.user.role === "admin") filter.role = "admin"
  if (req.user.role === "agent") filter.role = "agent"
  if (req.user.role === "user") filter.userId = req.user._id.toString()

  await Notification.updateMany(filter, { read: true })

  res.json({ success: true })
})

module.exports = router