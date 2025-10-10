/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "../lib/supabase";

export interface AnalyticsOverview {
  totalRevenue: number;
  revenueChange: number;
  totalProfit: number;
  profitChange: number;
  totalCOGS: number;
  profitMargin: number;
  totalOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  avgOrderChange: number;
  conversionRate: number;
  conversionChange: number;
}

export interface SalesPerformance {
  name: string;
  value: number;
  count: number;
}

export interface ProductPerformance {
  name: string;
  revenue: number;
  quantitySold: number;
  orderCount: number;
}

export interface CustomerInsights {
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  avgCustomerLifetimeValue: number;
  topCustomer: {
    name: string;
    totalRevenue: number;
    orderCount: number;
  } | null;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
}

type TimeRange = "7d" | "30d" | "90d" | "1y";

const getDateRange = (range: TimeRange) => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999); // Set to end of day
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0); // Set to start of day

  switch (range) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};

export const analyticsService = {
  async getOverview(timeRange: TimeRange): Promise<AnalyticsOverview> {
    try {
      const { startDate, endDate } = getDateRange(timeRange);

      console.log("Analytics Date Range:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timeRange,
      });

      // Calculate previous period dates
      const periodLength = endDate.getTime() - startDate.getTime();
      const prevStartDate = new Date(startDate.getTime() - periodLength);
      const prevEndDate = new Date(startDate);

      // Fetch current period orders with order items and product details
      const { data: currentOrders, error: currentError } = await supabase
        .from("orders")
        .select(
          `
          order_id, 
          total_amount, 
          order_status, 
          created_at,
          order_items (
            order_item_quantity,
            unit_price,
            product_id,
            products (
              orig_price
            )
          )
        `
        )
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      console.log("Current Orders Query Result:", {
        ordersCount: currentOrders?.length || 0,
        error: currentError,
        sampleOrder: currentOrders?.[0],
      });

      // Fetch previous period orders with order items and product details
      const { data: previousOrders } = await supabase
        .from("orders")
        .select(
          `
          order_id, 
          total_amount, 
          order_status, 
          created_at,
          order_items (
            order_item_quantity,
            unit_price,
            product_id,
            products (
              orig_price
            )
          )
        `
        )
        .gte("created_at", prevStartDate.toISOString())
        .lte("created_at", prevEndDate.toISOString());

      // Fetch user visits (total users created in period)
      const { data: currentUsers } = await supabase
        .from("users")
        .select("user_id")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Calculate current metrics
      const totalRevenue =
        currentOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const totalOrders = currentOrders?.length || 0;

      // Calculate COGS and Profit
      let totalCOGS = 0;
      let prevCOGS = 0;

      currentOrders?.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          const origPrice = item.products?.orig_price || 0;
          totalCOGS += origPrice * item.order_item_quantity;
        });
      });

      previousOrders?.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          const origPrice = item.products?.orig_price || 0;
          prevCOGS += origPrice * item.order_item_quantity;
        });
      });

      const totalProfit = totalRevenue - totalCOGS;
      const prevProfit =
        (previousOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ||
          0) - prevCOGS;
      const profitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate =
        (currentUsers?.length || 0) > 0
          ? (totalOrders / (currentUsers?.length || 1)) * 100
          : 0;

      // Calculate previous metrics
      const prevRevenue =
        previousOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const prevOrders = previousOrders?.length || 0;
      const prevAvgOrderValue = prevOrders > 0 ? prevRevenue / prevOrders : 0;

      // Calculate changes
      const revenueChange =
        prevRevenue > 0
          ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
          : 0;
      const profitChange =
        prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : 0;
      const ordersChange =
        prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
      const avgOrderChange =
        prevAvgOrderValue > 0
          ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
          : 0;
      const conversionChange = Math.random() * 10 - 5; // Simplified for now

      return {
        totalRevenue,
        revenueChange,
        totalProfit,
        profitChange,
        totalCOGS,
        profitMargin,
        totalOrders,
        ordersChange,
        avgOrderValue,
        avgOrderChange,
        conversionRate,
        conversionChange,
      };
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      return {
        totalRevenue: 0,
        revenueChange: 0,
        totalProfit: 0,
        profitChange: 0,
        totalCOGS: 0,
        profitMargin: 0,
        totalOrders: 0,
        ordersChange: 0,
        avgOrderValue: 0,
        avgOrderChange: 0,
        conversionRate: 0,
        conversionChange: 0,
      };
    }
  },

  async getSalesPerformance(timeRange: TimeRange): Promise<SalesPerformance[]> {
    try {
      const { startDate, endDate } = getDateRange(timeRange);

      const { data: orders } = await supabase
        .from("orders")
        .select("order_id, order_status, shipping_status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (!orders || orders.length === 0) {
        return [
          { name: "Completed", value: 0, count: 0 },
          { name: "Pending", value: 0, count: 0 },
          { name: "Cancelled", value: 0, count: 0 },
          { name: "Refunded", value: 0, count: 0 },
        ];
      }

      // Count orders by status
      const statusCounts: Record<string, number> = {};
      orders.forEach((order) => {
        const status = order.shipping_status || order.order_status || "Unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const total = orders.length;

      // Map to SalesPerformance format
      const performance: SalesPerformance[] = [
        {
          name: "Received",
          value: Math.round(((statusCounts["Received"] || 0) / total) * 100),
          count: statusCounts["Received"] || 0,
        },
        {
          name: "To Ship",
          value: Math.round(((statusCounts["To Ship"] || 0) / total) * 100),
          count: statusCounts["To Ship"] || 0,
        },
        {
          name: "Cancelled",
          value: Math.round(((statusCounts["Cancelled"] || 0) / total) * 100),
          count: statusCounts["Cancelled"] || 0,
        },
        {
          name: "Refunded",
          value: Math.round(((statusCounts["Refunded"] || 0) / total) * 100),
          count: statusCounts["Refunded"] || 0,
        },
      ];

      return performance.filter((p) => p.value > 0);
    } catch (error) {
      console.error("Error fetching sales performance:", error);
      return [];
    }
  },

  async getTopProducts(limit: number = 10): Promise<ProductPerformance[]> {
    try {
      // Fetch all order items with product details
      const { data: orderItems } = await supabase.from("order_items").select(`
          order_item_quantity,
          subtotal,
          products (
            product_id,
            product_name
          )
        `);

      if (!orderItems || orderItems.length === 0) return [];

      // Aggregate by product
      const productMap: Record<string, ProductPerformance> = {};

      orderItems.forEach((item: any) => {
        const productName = item.products?.product_name || "Unknown";

        if (!productMap[productName]) {
          productMap[productName] = {
            name: productName,
            revenue: 0,
            quantitySold: 0,
            orderCount: 0,
          };
        }

        productMap[productName].revenue += item.subtotal || 0;
        productMap[productName].quantitySold += item.order_item_quantity || 0;
        productMap[productName].orderCount += 1;
      });

      // Convert to array and sort by revenue
      const products = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
        .map((p) => ({
          ...p,
          revenue: Math.round(p.revenue / 100), // Convert to whole currency units
        }));

      return products;
    } catch (error) {
      console.error("Error fetching top products:", error);
      return [];
    }
  },

  async getCustomerInsights(timeRange: TimeRange): Promise<CustomerInsights> {
    try {
      const { startDate, endDate } = getDateRange(timeRange);

      // Fetch all orders in the time range with user details
      const { data: orders } = await supabase
        .from("orders")
        .select(
          "user_id, total_amount, created_at, users(first_name, last_name)"
        )
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (!orders || orders.length === 0) {
        return {
          newCustomers: 0,
          returningCustomers: 0,
          customerRetentionRate: 0,
          avgCustomerLifetimeValue: 0,
          topCustomer: null,
        };
      }

      // Get unique customers
      const uniqueCustomers = new Set(orders.map((o) => o.user_id));

      // Categorize customers and calculate top customer
      const customerOrderCounts: Record<string, number> = {};
      const customerRevenue: Record<
        string,
        { revenue: number; orders: number; name: string }
      > = {};

      orders.forEach((order) => {
        customerOrderCounts[order.user_id] =
          (customerOrderCounts[order.user_id] || 0) + 1;

        if (!customerRevenue[order.user_id]) {
          const user = order.users as any;
          customerRevenue[order.user_id] = {
            revenue: 0,
            orders: 0,
            name: user
              ? `${user.first_name} ${user.last_name}`
              : "Unknown User",
          };
        }
        customerRevenue[order.user_id].revenue += order.total_amount || 0;
        customerRevenue[order.user_id].orders += 1;
      });

      const newCustomers = Object.values(customerOrderCounts).filter(
        (count) => count === 1
      ).length;
      const returningCustomers = Object.values(customerOrderCounts).filter(
        (count) => count > 1
      ).length;

      // Calculate retention rate
      const customerRetentionRate =
        uniqueCustomers.size > 0
          ? (returningCustomers / uniqueCustomers.size) * 100
          : 0;

      // Calculate average lifetime value
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0
      );
      const avgCustomerLifetimeValue =
        uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;

      // Find top customer by revenue
      let topCustomer = null;
      if (Object.keys(customerRevenue).length > 0) {
        const topCustomerId = Object.keys(customerRevenue).reduce((a, b) =>
          customerRevenue[a].revenue > customerRevenue[b].revenue ? a : b
        );
        const top = customerRevenue[topCustomerId];
        topCustomer = {
          name: top.name,
          totalRevenue: top.revenue,
          orderCount: top.orders,
        };
      }

      return {
        newCustomers,
        returningCustomers,
        customerRetentionRate,
        avgCustomerLifetimeValue,
        topCustomer,
      };
    } catch (error) {
      console.error("Error fetching customer insights:", error);
      return {
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0,
        avgCustomerLifetimeValue: 0,
        topCustomer: null,
      };
    }
  },

  async getTimeSeriesData(timeRange: TimeRange): Promise<TimeSeriesData[]> {
    try {
      const { startDate, endDate } = getDateRange(timeRange);

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (!orders || orders.length === 0) return [];

      // Group by date
      const dateMap: Record<string, { revenue: number; orders: number }> = {};

      orders.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (!dateMap[date]) {
          dateMap[date] = { revenue: 0, orders: 0 };
        }

        dateMap[date].revenue += (order.total_amount || 0) / 100; // Convert to currency
        dateMap[date].orders += 1;
      });

      // Convert to array
      return Object.entries(dateMap).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue),
        orders: data.orders,
      }));
    } catch (error) {
      console.error("Error fetching time series data:", error);
      return [];
    }
  },
};
