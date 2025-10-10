import supabase from "../lib/supabase";
import type { Order } from "../models/order";

export const fetchOrdersByUser = async (user_id: string): Promise<Order[]> => {
  console.log("🧾 Fetching orders for user_id:", user_id);

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      order_id,
      order_ref,
      user_id,
      total_amount,
      order_status,
      shipping_status,
      created_at,
      payment_method,
      platform_fee,
      shipping_fee,
      points_used,
      order_items (
        order_item_id,
        product_id,
        order_item_quantity,
        unit_price,
        subtotal,
        created_at,
        products (
          product_name,
          product_image
        )
      )
    `
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  console.log("🧾 Raw Supabase data:", data);
  console.log("🧾 Supabase error:", error);

  if (error) {
    console.error("❌ Error fetching orders:", error);
    return [];
  }

  const orders = Array.isArray(data) ? data : [];
  console.log("✅ Returning orders:", orders.length);
  return orders;
};
