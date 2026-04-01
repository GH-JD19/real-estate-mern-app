const express = require("express")
const router = express.Router()
const { getHomeData } = require("../controllers/homeController")

router.get("/home-data", getHomeData)

module.exports = router