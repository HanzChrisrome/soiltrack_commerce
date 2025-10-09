import { create } from "zustand";
import type { Order } from "../models/order";
import { fetchOrdersByUser } from "../services/orderService";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: (userId: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (userId: string) => {
    try {
      set({ loading: true });
      const orders = await fetchOrdersByUser(userId);
      console.log("🟢 Setting orders in store:", orders.length);
      set({ orders, loading: false });
    } catch (err: any) {
      console.error("❌ Error in fetchOrders:", err);
      set({ error: err.message, loading: false });
    }
  },
}));
