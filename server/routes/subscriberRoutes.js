const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// POST /api/subscribe
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // ✅ Check duplicate
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    const subscriber = await Subscriber.create({ email });

    res.status(201).json({
      message: "Subscribed successfully",
      subscriber,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;