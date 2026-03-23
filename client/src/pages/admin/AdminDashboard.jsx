import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

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

    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-500">
          Overview of platform analytics and activity
        </p>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">

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
      <h2 className="text-xl font-semibold mb-6">
        Monthly Analytics
      </h2>

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
    className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition cursor-pointer p-5 flex items-center gap-4"
  >

    <div className={`${color} text-white p-3 rounded-lg`}>
      {icon}
    </div>

    <div>
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className="text-xl font-bold">
        {value}
      </h3>
    </div>

  </div>

);


/* ============================= */
/* CHART */
/* ============================= */

const Chart = ({title,dataKey,data}) => (

  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">

    <h3 className="font-semibold mb-4">
      {title}
    </h3>

    <ResponsiveContainer width="100%" height={260}>

      <BarChart data={data}>

        <CartesianGrid strokeDasharray="3 3"/>

        <XAxis
          dataKey="name"
          angle={-30}
          textAnchor="end"
          interval={0}
        />

        <YAxis/>

        <Tooltip/>

        <Bar
          dataKey={dataKey}
          fill={chartColors[dataKey]}
          radius={[6,6,0,0]}
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

);

export default AdminDashboard;