// src/controllers/adminOrderController.ts
import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        order_ref,
        user_id,
        total_amount,
        order_status,
        shipping_status,
        created_at,
        order_items (
          order_item_id,
          product_id,
          order_item_quantity,
          unit_price,
          subtotal,
          products (
            product_id,
            product_name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("❌ Error fetching all orders:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { order_id, new_status } = req.body;

    if (!order_id || !new_status)
      return res.status(400).json({ error: "Missing order_id or new_status" });

    const { error } = await supabase
      .from("orders")
      .update({ shipping_status: new_status })
      .eq("order_id", order_id);

    if (error) throw error;
    res.json({ message: "✅ Order status updated successfully" });
  } catch (err: any) {
    console.error("❌ updateOrderStatus error:", err.message);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
