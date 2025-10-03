// src/services/orderService.ts
import supabase from "../lib/supabase";
import type { Order } from "../models/order";

export const orderService = {
  async fetchOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        order_id,
        order_ref,
        status,
        total_amount,
        created_at,
        order_items (
          order_item_id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          products (
            product_id,
            product_name,
            product_image
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching orders:", error.message);
      throw new Error(error.message);
    }

    // Flatten Supabase response (products[] → product | null)
    return (data || []).map((o: any) => ({
      ...o,
      order_items: o.order_items.map((i: any) => ({
        ...i,
        products: i.products ? i.products[0] ?? null : null,
      })),
    })) as Order[];
  },
};
