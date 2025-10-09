import { create } from "zustand";
import axios from "axios";
import type { Order } from "../models/order";

interface AdminOrdersState {
  orders: Order[];
  loading: boolean;
  fetchAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export const useAdminOrdersStore = create<AdminOrdersState>((set) => ({
  orders: [],
  loading: false,

  fetchAllOrders: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("http://localhost:5000/api/admin/orders");
      set({ orders: res.data, loading: false });
    } catch (err) {
      console.error("❌ Error fetching all orders:", err);
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId: string, newStatus: string) => {
    try {
      await axios.put("http://localhost:5000/api/admin/orders/update-status", {
        order_id: orderId,
        new_status: newStatus,
      });
    } catch (err) {
      console.error("❌ Failed to update order status:", err);
    }
  },
}));
