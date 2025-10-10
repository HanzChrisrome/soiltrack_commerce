/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuthStore } from "../../store/useAuthStore";
import { Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  Package,
  ShoppingCart,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  dashboardService,
  type DashboardStats,
  type RecentOrder,
  type MonthlySalesData,
  type UserStatusData,
  type TimeFilter,
} from "../../services/dashboardService";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/sparkels.json";

const AdminDashboard = () => {
  const { authUser } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    ordersGrowth: 0,
    approvedOrders: 0,
    approvedGrowth: 0,
    totalUsers: 0,
    usersGrowth: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    monthTotal: 0,
    monthGrowth: 0,
    todayTotal: 0,
    paidInvoices: 0,
    fundsReceived: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlySalesData[]>(
    []
  );
  const [userStatusData, setUserStatusData] = useState<UserStatusData[]>([]);
  const [productStockData, setProductStockData] = useState<UserStatusData[]>(
    []
  );

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [stats, orders, salesData, userData, stockData] = await Promise.all(
        [
          dashboardService.getDashboardStats(timeFilter),
          dashboardService.getRecentOrders(5),
          dashboardService.getMonthlySalesData(selectedYear),
          dashboardService.getUserStatusData(),
          dashboardService.getProductStockData(),
        ]
      );

      setStats(stats);
      setRecentOrders(orders);
      setMonthlySalesData(salesData);
      setUserStatusData(userData);
      setProductStockData(stockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) return <Navigate to="/auth/login" />;
  if (authUser.role_id !== 2) return <Navigate to="/" />;

  if (!authUser) return <Navigate to="/auth/login" />;
  if (authUser.role_id !== 2) return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Lottie
          loop
          animationData={loadingAnimation}
          play
          style={{ width: 100, height: 100 }}
        />
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-8">
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-transparent bg-clip-text">
              Dashboard
            </h1>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-white border text-gray-700 text-sm font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
            >
              + Add Product
            </a>
            <a
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow hover:bg-gray-100 transition"
            >
              View Products
            </a>
            <a
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow hover:bg-gray-100 transition"
            >
              View Orders
            </a>
          </div>
        </div>

        {/* Stats Grid - Combined Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2 auto-rows-fr">
          {/* Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {timeFilter === "week"
                  ? "This Week Orders"
                  : timeFilter === "month"
                  ? "This Month Orders"
                  : timeFilter === "year"
                  ? "This Year Orders"
                  : "Total Orders"}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalOrders}
              </h3>
              <div className="flex items-center gap-1">
                {stats.ordersGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    stats.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.ordersGrowth)}%
                </span>
                <span className="text-xs text-gray-400">
                  {timeFilter === "week"
                    ? "vs last week"
                    : timeFilter === "year"
                    ? "vs last year"
                    : "since last month"}
                </span>
              </div>
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Package className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {timeFilter === "week"
                  ? "This Week Approved"
                  : timeFilter === "month"
                  ? "This Month Approved"
                  : timeFilter === "year"
                  ? "This Year Approved"
                  : "Total Approved"}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.approvedOrders}
              </h3>
              <div className="flex items-center gap-1">
                {stats.approvedGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    stats.approvedGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.approvedGrowth)}%
                </span>
                <span className="text-xs text-gray-400">
                  {timeFilter === "week"
                    ? "vs last week"
                    : timeFilter === "year"
                    ? "vs last year"
                    : "since last month"}
                </span>
              </div>
            </div>
          </div>

          {/* Users Card with Pie Chart - Spans 2 rows */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 row-span-2">
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Users
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-0.5">
                {stats.totalUsers.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-400 mb-2">since last week</p>
            </div>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={userStatusData as any}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {userStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-600 font-medium">
                  {userStatusData[0]?.value || 0}% New
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-200"></div>
                <span className="text-gray-600 font-medium">
                  {userStatusData[1]?.value || 0}% Return
                </span>
              </div>
            </div>
          </div>

          {/* Product Stock Status Card with Pie Chart - Spans 2 rows */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 row-span-2">
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Subscriptions
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-0.5">
                {stats.activeProducts}
              </h3>
              <p className="text-xs text-gray-400 mb-2">active products</p>
            </div>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={productStockData as any}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productStockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 font-medium">
                  {productStockData[0]?.value || 0}% In Stock
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                <span className="text-gray-600 font-medium">
                  {productStockData[1]?.value || 0}% Low Stock
                </span>
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Today's Revenue
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                ₱
                {(stats.todayTotal / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <div className="flex items-center gap-1">
                {stats.monthGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    stats.monthGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.monthGrowth).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">vs yesterday</span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {timeFilter === "week"
                  ? "This Week Revenue"
                  : timeFilter === "month"
                  ? "This Month Revenue"
                  : timeFilter === "year"
                  ? "This Year Revenue"
                  : "Total Revenue (All Time)"}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                ₱
                {(stats.totalRevenue / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <div className="flex items-center gap-1">
                {stats.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">
                  {timeFilter === "week"
                    ? "vs last week"
                    : timeFilter === "year"
                    ? "vs last year"
                    : "since last month"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          {/* Sales Dynamics Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Sales dynamics
              </h3>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-2.5 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              >
                <option value={2021}>2021</option>
                <option value={2022}>2022</option>
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={monthlySalesData}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  cursor={{ fill: "rgba(16, 185, 129, 0.05)" }} // green-500/5
                />
                <Bar
                  dataKey="sales"
                  fill="#10B981" // Tailwind green-500
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Transactions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-sm text-gray-400"
                      >
                        No recent transactions
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order.order_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-sm text-gray-700 font-medium">
                          {order.order_ref || order.order_id.substring(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {order.user_name || "Unknown"}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              order.order_status === "delivered"
                                ? "bg-green-50 text-green-700"
                                : order.order_status === "pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : order.order_status === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {order.order_status.charAt(0).toUpperCase() +
                              order.order_status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">
                          ${order.total_amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
