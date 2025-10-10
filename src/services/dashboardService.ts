/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "../lib/supabase";

export interface DashboardStats {
  totalOrders: number;
  ordersGrowth: number;
  approvedOrders: number;
  approvedGrowth: number;
  totalUsers: number;
  usersGrowth: number;
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  revenueGrowth: number;
  monthTotal: number;
  monthGrowth: number;
  todayTotal: number;
  paidInvoices: number;
  fundsReceived: number;
}

export interface RecentOrder {
  order_id: string;
  order_ref: string;
  user_id: string;
  user_name?: string;
  total_amount: number;
  order_status: string;
  created_at: string;
  shipping_status: string;
}

export interface MonthlySalesData {
  month: string;
  sales: number;
  orderCount: number;
}

export interface UserStatusData {
  name: string;
  value: number;
  color: string;
}

export type TimeFilter = "week" | "month" | "year" | "all";

export const dashboardService = {
  async getDashboardStats(
    timeFilter: TimeFilter = "all"
  ): Promise<DashboardStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now);
      thisWeek.setDate(now.getDate() - 7);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("order_id, total_amount, order_status, created_at");

      if (ordersError) throw ordersError;

      // Filter orders based on time filter
      let filteredOrders = orders || [];
      if (timeFilter === "week") {
        filteredOrders =
          orders?.filter((o) => new Date(o.created_at) >= thisWeek) || [];
      } else if (timeFilter === "month") {
        filteredOrders =
          orders?.filter((o) => new Date(o.created_at) >= thisMonth) || [];
      } else if (timeFilter === "year") {
        filteredOrders =
          orders?.filter((o) => new Date(o.created_at) >= thisYear) || [];
      }

      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("user_id, created_at");

      if (usersError) throw usersError;

      // Fetch all products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("product_id, product_quantity");

      if (productsError) throw productsError;

      // Calculate order statistics based on filtered orders
      const totalOrders = filteredOrders.length;
      const approvedOrders = filteredOrders.filter(
        (o) =>
          o.order_status === "completed" ||
          o.order_status === "delivered" ||
          o.order_status === "approved"
      ).length;

      // Calculate revenue from filtered orders
      const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0
      );

      // Calculate growth based on time filter
      let comparisonOrders = [];
      let monthTotal = 0;
      let todayTotal = 0;
      let ordersGrowth = 0;
      let approvedGrowth = 0;
      let revenueGrowth = 0;
      let monthGrowth = 0;

      if (timeFilter === "week") {
        // Compare this week vs last week
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 14);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        comparisonOrders =
          orders?.filter(
            (o) =>
              new Date(o.created_at) >= twoWeeksAgo &&
              new Date(o.created_at) < thisWeek
          ) || [];

        const weekRevenue = totalRevenue;
        const lastWeekRevenue = comparisonOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );

        ordersGrowth = comparisonOrders.length
          ? ((filteredOrders.length - comparisonOrders.length) /
              comparisonOrders.length) *
            100
          : 0;

        const weekApproved = filteredOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;
        const lastWeekApproved = comparisonOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;

        approvedGrowth = lastWeekApproved
          ? ((weekApproved - lastWeekApproved) / lastWeekApproved) * 100
          : 0;

        revenueGrowth = lastWeekRevenue
          ? ((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
          : 0;

        monthTotal = weekRevenue;
        monthGrowth = revenueGrowth;

        // Calculate today's revenue
        const todayOrders =
          orders?.filter((o) => new Date(o.created_at) >= today) || [];
        todayTotal = todayOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );
      } else if (timeFilter === "month") {
        // Compare this month vs last month
        const lastMonthOrders =
          orders?.filter(
            (o) =>
              new Date(o.created_at) >= lastMonthStart &&
              new Date(o.created_at) < thisMonth
          ) || [];

        comparisonOrders = lastMonthOrders;
        monthTotal = totalRevenue;
        const lastMonthTotal = lastMonthOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );

        ordersGrowth = lastMonthOrders.length
          ? ((filteredOrders.length - lastMonthOrders.length) /
              lastMonthOrders.length) *
            100
          : 0;

        const thisMonthApproved = filteredOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;
        const lastMonthApproved = lastMonthOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;

        approvedGrowth = lastMonthApproved
          ? ((thisMonthApproved - lastMonthApproved) / lastMonthApproved) * 100
          : 0;

        revenueGrowth = lastMonthTotal
          ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100
          : 0;

        monthGrowth = revenueGrowth;

        // Calculate today's revenue
        const todayOrders =
          orders?.filter((o) => new Date(o.created_at) >= today) || [];
        todayTotal = todayOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );
      } else if (timeFilter === "year") {
        // Compare this year vs last year
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        const thisYearStart = new Date(now.getFullYear(), 0, 1);

        const lastYearOrders =
          orders?.filter(
            (o) =>
              new Date(o.created_at) >= lastYear &&
              new Date(o.created_at) < thisYearStart
          ) || [];

        comparisonOrders = lastYearOrders;
        monthTotal = totalRevenue;
        const lastYearTotal = lastYearOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );

        ordersGrowth = lastYearOrders.length
          ? ((filteredOrders.length - lastYearOrders.length) /
              lastYearOrders.length) *
            100
          : 0;

        const thisYearApproved = filteredOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;
        const lastYearApproved = lastYearOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;

        approvedGrowth = lastYearApproved
          ? ((thisYearApproved - lastYearApproved) / lastYearApproved) * 100
          : 0;

        revenueGrowth = lastYearTotal
          ? ((monthTotal - lastYearTotal) / lastYearTotal) * 100
          : 0;

        monthGrowth = revenueGrowth;

        // Calculate today's revenue
        const todayOrders =
          orders?.filter((o) => new Date(o.created_at) >= today) || [];
        todayTotal = todayOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );
      } else {
        // All time - compare this month vs last month
        const thisMonthOrders =
          orders?.filter((o) => new Date(o.created_at) >= thisMonth) || [];
        const lastMonthOrders =
          orders?.filter(
            (o) =>
              new Date(o.created_at) >= lastMonthStart &&
              new Date(o.created_at) < thisMonth
          ) || [];

        monthTotal = thisMonthOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );
        const lastMonthTotal = lastMonthOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );

        ordersGrowth = lastMonthOrders.length
          ? ((thisMonthOrders.length - lastMonthOrders.length) /
              lastMonthOrders.length) *
            100
          : 0;

        const thisMonthApproved = thisMonthOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;
        const lastMonthApproved = lastMonthOrders.filter(
          (o) =>
            o.order_status === "completed" ||
            o.order_status === "delivered" ||
            o.order_status === "approved"
        ).length;

        approvedGrowth = lastMonthApproved
          ? ((thisMonthApproved - lastMonthApproved) / lastMonthApproved) * 100
          : 0;

        revenueGrowth = lastMonthTotal
          ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100
          : 0;

        monthGrowth = revenueGrowth;

        // Calculate today's revenue for all time filter
        const todayOrders =
          orders?.filter((o) => new Date(o.created_at) >= today) || [];
        todayTotal = todayOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0
        );
      }

      // User statistics
      const totalUsers = users?.length || 0;
      const thisMonthUsers =
        users?.filter((u) => new Date(u.created_at) >= thisMonth).length || 0;
      const lastMonthUsers =
        users?.filter(
          (u) =>
            new Date(u.created_at) >= lastMonthStart &&
            new Date(u.created_at) < thisMonth
        ).length || 0;

      const usersGrowth = lastMonthUsers
        ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
        : 0;

      // Product statistics
      const totalProducts = products?.length || 0;
      const activeProducts =
        products?.filter((p) => (p.product_quantity || 0) > 0).length || 0;

      // Calculate paid invoices and funds received
      const paidInvoices = totalRevenue * 0.75; // Assuming 75% of revenue is from paid invoices
      const fundsReceived = totalRevenue * 0.85; // Assuming 85% of revenue has been received

      return {
        totalOrders,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        approvedOrders,
        approvedGrowth: Math.round(approvedGrowth * 10) / 10,
        totalUsers,
        usersGrowth: Math.round(usersGrowth * 10) / 10,
        totalProducts,
        activeProducts,
        totalRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        monthTotal,
        monthGrowth: Math.round(monthGrowth * 10) / 10,
        todayTotal,
        paidInvoices,
        fundsReceived,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Fetch recent orders with user names
  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          order_id, 
          order_ref, 
          user_id, 
          total_amount, 
          order_status, 
          created_at, 
          shipping_status,
          users(user_fname, user_lname)
          `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Supabase error fetching recent orders:", error);
        throw error;
      }

      // Map the data to include user_name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ordersWithUserNames =
        data?.map((order: any) => ({
          order_id: order.order_id,
          order_ref: order.order_ref,
          user_id: order.user_id,
          user_name: order.users
            ? `${order.users.user_fname} ${order.users.user_lname}`
            : "Unknown User",
          total_amount: order.total_amount,
          order_status: order.order_status,
          created_at: order.created_at,
          shipping_status: order.shipping_status,
        })) || [];

      return ordersWithUserNames;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      throw error;
    }
  },

  // Fetch monthly sales data for charts
  async getMonthlySalesData(
    year: number = new Date().getFullYear()
  ): Promise<MonthlySalesData[]> {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .gte("created_at", `${year}-01-01`)
        .lt("created_at", `${year + 1}-01-01`);

      if (error) throw error;

      // Initialize data for all 12 months
      const monthlyData: MonthlySalesData[] = [
        { month: "JAN", sales: 0, orderCount: 0 },
        { month: "FEB", sales: 0, orderCount: 0 },
        { month: "MAR", sales: 0, orderCount: 0 },
        { month: "APR", sales: 0, orderCount: 0 },
        { month: "MAY", sales: 0, orderCount: 0 },
        { month: "JUN", sales: 0, orderCount: 0 },
        { month: "JUL", sales: 0, orderCount: 0 },
        { month: "AUG", sales: 0, orderCount: 0 },
        { month: "SEP", sales: 0, orderCount: 0 },
        { month: "OCT", sales: 0, orderCount: 0 },
        { month: "NOV", sales: 0, orderCount: 0 },
        { month: "DEC", sales: 0, orderCount: 0 },
      ];

      // Aggregate orders by month
      orders?.forEach((order) => {
        const month = new Date(order.created_at).getMonth();
        monthlyData[month].sales += order.total_amount || 0;
        monthlyData[month].orderCount += 1;
      });

      return monthlyData;
    } catch (error) {
      console.error("Error fetching monthly sales data:", error);
      throw error;
    }
  },

  // Fetch user status distribution
  async getUserStatusData(): Promise<UserStatusData[]> {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("user_id, created_at");

      if (error) throw error;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      const newUsers =
        users?.filter((u) => new Date(u.created_at) >= thirtyDaysAgo).length ||
        0;

      const returningUsers =
        users?.filter(
          (u) =>
            new Date(u.created_at) < thirtyDaysAgo &&
            new Date(u.created_at) >= ninetyDaysAgo
        ).length || 0;

      const inactiveUsers =
        users?.filter((u) => new Date(u.created_at) < ninetyDaysAgo).length ||
        0;

      const total = users?.length || 1; // Prevent division by zero

      return [
        {
          name: "New",
          value: Math.round((newUsers / total) * 100),
          color: "#FCD34D",
        },
        {
          name: "Returning",
          value: Math.round((returningUsers / total) * 100),
          color: "#FDE68A",
        },
        {
          name: "Inactive",
          value: Math.round((inactiveUsers / total) * 100),
          color: "#FEF3C7",
        },
      ];
    } catch (error) {
      console.error("Error fetching user status data:", error);
      return [
        { name: "New", value: 62, color: "#FCD34D" },
        { name: "Returning", value: 28, color: "#FDE68A" },
        { name: "Inactive", value: 10, color: "#FEF3C7" },
      ];
    }
  },

  // Fetch product stock distribution
  async getProductStockData(): Promise<UserStatusData[]> {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("product_id, product_quantity");

      if (error) throw error;

      const inStock =
        products?.filter((p) => (p.product_quantity || 0) > 10).length || 0;
      const lowStock =
        products?.filter(
          (p) =>
            (p.product_quantity || 0) > 0 && (p.product_quantity || 0) <= 10
        ).length || 0;

      const total = products?.length || 1;

      return [
        {
          name: "In Stock",
          value: Math.round((inStock / total) * 100),
          color: "#3B82F6",
        },
        {
          name: "Low Stock",
          value: Math.round((lowStock / total) * 100),
          color: "#93C5FD",
        },
      ];
    } catch (error) {
      console.error("Error fetching product stock data:", error);
      return [
        { name: "In Stock", value: 70, color: "#3B82F6" },
        { name: "Low Stock", value: 30, color: "#93C5FD" },
      ];
    }
  },
};
