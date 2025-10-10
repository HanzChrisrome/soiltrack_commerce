import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Navigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsService } from "../../services/analyticsService.ts";
import type {
  AnalyticsOverview,
  SalesPerformance,
  ProductPerformance,
  CustomerInsights,
  TimeSeriesData,
} from "../../services/analyticsService.ts";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/sparkels.json";

const Analytics = () => {
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    avgOrderValue: 0,
    avgOrderChange: 0,
    conversionRate: 0,
    conversionChange: 0,
    totalProfit: 0,
    profitChange: 0,
    totalCOGS: 0,
    profitMargin: 0,
  });

  const [salesPerformance, setSalesPerformance] = useState<SalesPerformance[]>(
    []
  );
  const [productPerformance, setProductPerformance] = useState<
    ProductPerformance[]
  >([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights>({
    newCustomers: 0,
    returningCustomers: 0,
    customerRetentionRate: 0,
    avgCustomerLifetimeValue: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [overview, sales, products, customers, timeSeries] =
          await Promise.all([
            analyticsService.getOverview(timeRange),
            analyticsService.getSalesPerformance(timeRange),
            analyticsService.getTopProducts(10),
            analyticsService.getCustomerInsights(timeRange),
            analyticsService.getTimeSeriesData(timeRange),
          ]);

        setOverview(overview);
        setSalesPerformance(sales);
        setProductPerformance(products);
        setCustomerInsights(customers);
        setTimeSeriesData(timeSeries);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (!authUser) return <Navigate to="/auth/login" />;
  if (authUser.role_id !== 2) return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Lottie
          loop
          animationData={loadingAnimation}
          play
          style={{ width: 150, height: 150 }}
        />
      </div>
    );
  }

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-8">
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-transparent bg-clip-text">
              Analytics & Insights
            </h1>
            <p className="text-gray-600">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "7d" | "30d" | "90d" | "1y")
              }
              className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  overview.revenueChange >= 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {overview.revenueChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(overview.revenueChange).toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Revenue
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                ₱
                {(overview.totalRevenue / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {overview.revenueChange >= 0 ? "+" : ""}
                {overview.revenueChange.toFixed(1)}% from previous period
              </p>
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  overview.profitChange >= 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {overview.profitChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(overview.profitChange).toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Profit
              </p>
              <h3 className="text-3xl font-bold text-emerald-700">
                ₱
                {(overview.totalProfit / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Margin: {overview.profitMargin.toFixed(1)}% | COGS: ₱
                {(overview.totalCOGS / 100).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  overview.ordersChange >= 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {overview.ordersChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(overview.ordersChange).toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Orders
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {overview.totalOrders.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {overview.ordersChange >= 0 ? "+" : ""}
                {overview.ordersChange.toFixed(1)}% from previous period
              </p>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  overview.avgOrderChange >= 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {overview.avgOrderChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(overview.avgOrderChange).toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Avg Order Value
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                ₱
                {(overview.avgOrderValue / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {overview.avgOrderChange >= 0 ? "+" : ""}
                {overview.avgOrderChange.toFixed(1)}% from previous period
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
          {/* Revenue & Orders Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Revenue & Orders Trend
                </h3>
                <p className="text-sm text-gray-500">
                  Track your revenue and order volume over time
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
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
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Revenue (₱)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  strokeWidth={2}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales by Status
              </h3>
              <p className="text-sm text-gray-500">Order status distribution</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={salesPerformance.map((item) => ({
                      name: item.name,
                      value: item.value,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {salesPerformance.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend Below Chart */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {salesPerformance.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-gray-700">{entry.name}</span>
                    <span className="text-gray-500 font-medium">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Top Performing Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Performing Products
                </h3>
                <p className="text-sm text-gray-500">Best sellers by revenue</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={productPerformance}
                  layout="vertical"
                  margin={{ top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F3F4F6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fill: "#9CA3AF",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={95}
                    tickFormatter={(value: string) =>
                      value
                        .toLowerCase()
                        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => [
                      `₱${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                    labelFormatter={(label: string) =>
                      label
                        .toLowerCase()
                        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10B981"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Insights
              </h3>
              <p className="text-sm text-gray-500">
                Understanding your customer base
              </p>
            </div>

            <div className="space-y-6">
              {/* New vs Returning */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    New Customers
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {customerInsights.newCustomers}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (customerInsights.newCustomers /
                          (customerInsights.newCustomers +
                            customerInsights.returningCustomers || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Returning Customers
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {customerInsights.returningCustomers}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (customerInsights.returningCustomers /
                          (customerInsights.newCustomers +
                            customerInsights.returningCustomers || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Retention Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customerInsights.customerRetentionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Avg Lifetime Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱
                    {(
                      customerInsights.avgCustomerLifetimeValue / 100
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>

              {/* Top Customer */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Top Customer
                    </h4>
                    {customerInsights.topCustomer ? (
                      <div className="text-xs text-blue-700 leading-relaxed">
                        <p className="font-semibold text-sm mb-1">
                          {customerInsights.topCustomer.name}
                        </p>
                        <p>
                          Total Revenue: ₱
                          {(
                            customerInsights.topCustomer.totalRevenue / 100
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p>Orders: {customerInsights.topCustomer.orderCount}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-blue-700">
                        No customer data available.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Insight Box */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-1">
                      Insight
                    </h4>
                    <p className="text-xs text-green-700 leading-relaxed">
                      {customerInsights.customerRetentionRate > 50
                        ? "Great retention! Your customers are coming back for more."
                        : "Focus on retention strategies to increase repeat purchases."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Summary
            </h3>
            <p className="text-sm text-gray-500">
              Key performance indicators at a glance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Products Sold
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {productPerformance.reduce((sum, p) => sum + p.quantitySold, 0)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Total Customers
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {customerInsights.newCustomers +
                  customerInsights.returningCustomers}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Best Selling Product
              </p>
              <p className="text-xl font-bold text-gray-900 truncate">
                {productPerformance[0]?.name || "N/A"}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Revenue Growth
              </p>
              <p
                className={`text-3xl font-bold ${
                  overview.revenueChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {overview.revenueChange >= 0 ? "+" : ""}
                {overview.revenueChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Analytics;
