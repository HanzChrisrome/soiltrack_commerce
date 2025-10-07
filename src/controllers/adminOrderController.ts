// src/store/useAdminOrderStore.ts
import { create } from "zustand";
import axios from "axios";
import type { Order } from "../models/order";

interface AdminOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export const useAdminOrdersStore = create<AdminOrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // ✅ Fetch all admin orders
  fetchAllOrders: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/orders"
      );
      set({ orders: data, loading: false });
    } catch (err: any) {
      console.error("❌ Error fetching all orders:", err);
      set({ error: err.message, loading: false });
    }
  },

  // ✅ Update order status and update local state instantly
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      // Update in database
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}`, {
        shipping_status: newStatus,
      });

      // 🔥 Update in local state immediately (no refresh needed)
      set((state) => ({
        orders: state.orders.map((order) =>
          order.order_id === orderId
            ? { ...order, shipping_status: newStatus }
            : order
        ),
      }));
    } catch (err: any) {
      console.error("❌ Error updating order status:", err);
      set({ error: err.message });
    }
  },
}));
