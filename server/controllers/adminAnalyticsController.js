const User = require("../models/User")
const Property = require("../models/Property")
const Visit = require("../models/Visit")

// ============================
// DASHBOARD STATS
// ============================
exports.getDashboardStats = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments({
      role: "user",
      isActive: true,
      isBlocked: false
    })

    const totalAgents = await User.countDocuments({
      role: "agent",
      isActive: true,
      isBlocked: false
    })

    const totalAdmins = await User.countDocuments({
      role: "admin"
    })

    const totalProperties = await Property.countDocuments({
      status: "APPROVED"
    })

    const pendingProperties = await Property.countDocuments({
      status: { $regex: /^pending$/i }
    })

    const blockedUsers = await User.countDocuments({
      isBlocked: true
    })

    const totalBookings = await Visit.countDocuments()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)

    const propertiesThisMonth = await Property.countDocuments({
      status: "APPROVED",
      createdAt: { $gte: startOfMonth }
    })

    const propertyTypeStats = await Property.aggregate([
      { $match: { status: "APPROVED" } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ])

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")

    const latestProperties = await Property.find({
      status: "APPROVED"
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name email")

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalAdmins,
        totalProperties,
        pendingProperties,
        propertiesThisMonth,
        blockedUsers,
        totalBookings
      },
      latestUsers,
      latestProperties
    })

  } catch (error) {

    res.status(500).json({
      success:false,
      message:error.message
    })

  }
}


// ============================
// MONTHLY CHART DATA
// ============================
exports.getMonthlyCharts = async (req,res)=>{

  try{

    const users = await User.aggregate([
      {
        $match:{
          role:"user",
          isActive:true,
          isBlocked:false,
          createdAt:{ $exists:true }
        }
      },
      { $group:{ _id:{ $month:"$createdAt" }, count:{ $sum:1 } } }
    ])

    const agents = await User.aggregate([
      {
        $match:{
          role:"agent",
          isActive:true,
          isBlocked:false,
          createdAt:{ $exists:true }
        }
      },
      { $group:{ _id:{ $month:"$createdAt" }, count:{ $sum:1 } } }
    ])

    const properties = await Property.aggregate([
      {
        $match:{
          status:"APPROVED",
          createdAt:{ $exists:true }
        }
      },
      { $group:{ _id:{ $month:"$createdAt" }, count:{ $sum:1 } } }
    ])

    const pending = await Property.aggregate([
      {
        $match:{
          status:{ $regex:/^pending$/i },
          createdAt:{ $exists:true }
        }
      },
      { $group:{ _id:{ $month:"$createdAt" }, count:{ $sum:1 } } }
    ])

    const blocked = await User.aggregate([
      {
        $match:{
          isBlocked:true,
          createdAt:{ $exists:true }
        }
      },
      { $group:{ _id:{ $month:"$createdAt" }, count:{ $sum:1 } } }
    ])

    const bookings = await Visit.aggregate([
      {
        $match:{
          visitDate:{ $exists:true }
        }
      },
      {
        $group:{
          _id:{ $month:{ $toDate:"$visitDate" } },
          count:{ $sum:1 }
        }
      }
    ])


    const buildMonthlyData = (data)=>{
      const months = Array(12).fill(0)

      data.forEach(item=>{
        months[item._id-1] = item.count
      })

      return months
    }


    const usersData = buildMonthlyData(users)
    const agentsData = buildMonthlyData(agents)
    const propertiesData = buildMonthlyData(properties)
    const pendingData = buildMonthlyData(pending)
    const blockedData = buildMonthlyData(blocked)
    const bookingsData = buildMonthlyData(bookings)


    const chartData = Array.from({length:12},(_,i)=>({
      users:usersData[i],
      agents:agentsData[i],
      properties:propertiesData[i],
      pending:pendingData[i],
      blocked:blockedData[i],
      bookings:bookingsData[i]
    }))


    res.json({ chartData })

  }
  catch(error){

    res.status(500).json({
      message:error.message
    })

  }

}