// src/controllers/orderController.ts
import type { Request, Response } from "express";
import supabase from "../lib/supabase";

export const finalizeOrder = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    console.log("👉 finalizeOrder called for user:", user_id);

    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    // Find latest pending order for this user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (orderError || !order) {
      console.error("❌ Pending order not found:", orderError);
      return res.status(404).json({ error: "Pending order not found" });
    }

    console.log("✅ Found order:", order.order_id);

    // ✅ Idempotency check: stop if order already has items
    const { data: existingItems, error: existingError } = await supabase
      .from("order_items")
      .select("order_item_id")
      .eq("order_id", order.order_id);

    if (existingError) {
      console.error("❌ Failed to check existing order items:", existingError);
      return res.status(500).json({ error: "DB check failed" });
    }

    if (existingItems && existingItems.length > 0) {
      console.log("⚠️ Order already finalized, skipping duplicate insert");
      return res.json({
        message: "Order already finalized",
        orderId: order.order_id,
      });
    }

    // Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id);

    if (cartError) {
      console.error("❌ Cart fetch error:", cartError);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.json({ message: "Cart already empty", order });
    }

    console.log("👉 Moving cart items:", cartItems.length);

    // Convert cart items → order_items (centavos expected by bigint fields)
    const orderItemsPayload = cartItems.map((ci) => ({
      order_id: order.order_id,
      product_id: ci.product_id,
      quantity: ci.quantity,
      unit_price: Math.round((ci.product_price ?? 0) * 100), // pesos → centavos
      subtotal: Math.round((ci.product_price ?? 0) * ci.quantity * 100),
    }));

    const { error: oiError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (oiError) {
      console.error("❌ Order items insert error:", oiError);
      return res.status(500).json({ error: "Failed to insert order items" });
    }

    // Clear cart
    const { error: delError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id);

    if (delError) {
      console.error("⚠️ Failed to clear cart:", delError);
    }

    // Mark order as "paid"
    const { error: updError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", order.order_id);

    if (updError) {
      console.error("⚠️ Failed to update order status:", updError);
    }

    return res.json({ message: "✅ Order finalized", orderId: order.order_id });
  } catch (err: any) {
    console.error("❌ finalizeOrder error:", err.message);
    return res.status(500).json({ error: "Failed to finalize order" });
  }
};
