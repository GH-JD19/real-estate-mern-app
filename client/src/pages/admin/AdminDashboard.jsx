import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import {
  Users,
  UserCheck,
  Home,
  Clock,
  Ban,
  CalendarCheck
} from "lucide-react";

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const chartColors = {
  users: "#3B82F6",
  agents: "#8B5CF6",
  properties: "#22C55E",
  pending: "#EAB308",
  blocked: "#EF4444",
  bookings: "#14B8A6"
};

const AdminDashboard = () => {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalProperties: 0,
    pendingProperties: 0,
    blockedUsers: 0,
    totalBookings: 0
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {

  const loadDashboard = async () => {
    await Promise.all([
      fetchStats(),
      fetchCharts()
    ])
  }

  loadDashboard()

  // ✅ CONNECT SOCKET
  socket.connect()
  socket.emit("joinAdmin")

  // ✅ LISTEN EVENTS
  socket.on("dashboard:update", (data) => {

    console.log("Realtime:", data)

    // 🔥 SMART UPDATE
    fetchStats()
    fetchCharts()

  })

  return () => {
    socket.off("dashboard:update")
  }

}, [])

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin-analytics/dashboard");
      setStats(res.data.stats || {});
    } catch (err) {
      console.log("Stats fetch error:", err.response?.data);
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await api.get("/admin-analytics/charts");

      const safeData = (res.data.chartData || []).map((item, index) => ({
        name: months[index],
        users: item.users || 0,
        agents: item.agents || 0,
        properties: item.properties || 0,
        pending: item.pending || 0,
        blocked: item.blocked || 0,
        bookings: item.bookings || 0
      }));

      setChartData(safeData);

    } catch (err) {
      console.log("Chart fetch error:", err.response?.data);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-6">

      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of platform analytics and activity
          </p>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">

        <StatCard
          icon={<Users size={26}/>}
          title="Users"
          value={stats.totalUsers ?? "..."}
          color="bg-blue-500"
          onClick={()=>handleNavigate("/admin/users?role=user")}
        />

        <StatCard
          icon={<UserCheck size={26}/>}
          title="Agents"
          value={stats.totalAgents ?? "..."}
          color="bg-purple-500"
          onClick={()=>handleNavigate("/admin/users?role=agent")}
        />

        <StatCard
          icon={<Home size={26}/>}
          title="Properties"
          value={stats.totalProperties ?? "..."}
          color="bg-green-500"
          onClick={()=>handleNavigate("/admin/properties")}
        />

        <StatCard
          icon={<Clock size={26}/>}
          title="Pending"
          value={stats.pendingProperties ?? "..."}
          color="bg-yellow-500"
          onClick={()=>handleNavigate("/admin/pending-properties")}
        />

        <StatCard
          icon={<Ban size={26}/>}
          title="Blocked"
          value={stats.blockedUsers ?? "..."}
          color="bg-red-500"
          onClick={()=>handleNavigate("/admin/users?blocked=true")}
        />

        <StatCard
          icon={<CalendarCheck size={26}/>}
          title="Bookings"
          value={stats.totalBookings ?? "..."}
          color="bg-teal-500"
          onClick={()=>handleNavigate("/admin/bookings")}
        />

      </div>

      {/* ===== CHARTS ===== */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Monthly Analytics
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Yearly growth overview of platform data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <Chart title="User Growth" dataKey="users" data={chartData}/>
        <Chart title="Agent Growth" dataKey="agents" data={chartData}/>
        <Chart title="Property Growth" dataKey="properties" data={chartData}/>
        <Chart title="Pending Approvals" dataKey="pending" data={chartData}/>
        <Chart title="Blocked Users" dataKey="blocked" data={chartData}/>
        <Chart title="Bookings" dataKey="bookings" data={chartData}/>

      </div>

    </div>
  );

};


/* ============================= */
/* STAT CARD */
/* ============================= */

const StatCard = ({icon,title,value,color,onClick}) => (

  <div
    onClick={onClick}
    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 flex items-center gap-4"
  >

    <div className={`${color} text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition`}>
      {icon}
    </div>

    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-xl font-bold mt-1">
        {value}
      </h3>
    </div>

  </div>

);


/* ============================= */
/* CHART */
/* ============================= */

const Chart = ({title,dataKey,data}) => (

  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition p-5">

    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
        {title}
      </h3>
    </div>

    <ResponsiveContainer width="100%" height={260}>

      <BarChart data={data}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="name"
          angle={-30}
          textAnchor="end"
          interval={0}
          tick={{ fontSize: 12 }}
        />

        <YAxis tick={{ fontSize: 12 }} />

        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        />

        <Bar
          dataKey={dataKey}
          fill={chartColors[dataKey]}
          radius={[8,8,0,0]}
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

);

export default AdminDashboard;