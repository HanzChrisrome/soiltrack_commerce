// src/store/useOrdersStore.ts
import { create } from "zustand";
import type { Order } from "../models/order";
import { orderService } from "../services/orderService";

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
    set({ loading: true, error: null });
    try {
      const orders = await orderService.fetchOrders(userId);
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
