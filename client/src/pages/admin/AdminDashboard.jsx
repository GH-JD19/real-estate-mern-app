import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

const chartColors = {
  users: "#3B82F6",
  agents: "#8B5CF6",
  properties: "#22C55E",
  pending: "#EAB308",
  blocked: "#EF4444",
  bookings: "#14B8A6"
};

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

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
    fetchStats();
    fetchCharts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin-analytics/dashboard");
      setStats(res.data.stats);
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

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">

        <Card
          title="Users"
          value={stats.totalUsers || 0}
          color="bg-blue-500"
          onClick={() => navigate("/admin/users?role=user")}
        />

        <Card
          title="Agents"
          value={stats.totalAgents || 0}
          color="bg-purple-500"
          onClick={() => navigate("/admin/users?role=agent")}
        />

        <Card
          title="Total Properties"
          value={stats.totalProperties || 0}
          color="bg-green-500"
          onClick={() => navigate("/admin/properties")}
        />

        <Card
          title="Pending Approval"
          value={stats.pendingProperties || 0}
          color="bg-yellow-500"
          onClick={() => navigate("/admin/pending-properties")}
        />

        <Card
          title="Blocked Users"
          value={stats.blockedUsers || 0}
          color="bg-red-500"
          onClick={() => navigate("/admin/users?blocked=true")}
        />

        <Card
          title="Bookings"
          value={stats.totalBookings || 0}
          color="bg-teal-500"
          onClick={() => navigate("/admin/bookings")}
        />

      </div>

      {/* ===== CHARTS ===== */}
      <h3 className="text-xl font-semibold mb-4">Monthly Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Chart title="User Growth" dataKey="users" data={chartData} />
        <Chart title="Agent Growth" dataKey="agents" data={chartData} />
        <Chart title="Property Growth" dataKey="properties" data={chartData} />
        <Chart title="Pending Approval" dataKey="pending" data={chartData} />
        <Chart title="Blocked Users" dataKey="blocked" data={chartData} />
        <Chart title="Bookings" dataKey="bookings" data={chartData} />

      </div>

    </div>
  );
};

const Card = ({ title, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} cursor-pointer text-white p-5 rounded-xl shadow-md text-center hover:scale-105 transition`}
  >
    <h4 className="text-sm">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Chart = ({ title, dataKey, data }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="font-semibold mb-3">{title}</h3>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          angle={-35}
          textAnchor="end"
          interval={0}
          height={70}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={chartColors[dataKey]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default AdminDashboard;