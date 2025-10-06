import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

export const finalizeOrder = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    console.log("👉 finalizeOrder called for user:", user_id);

    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    // 🟢 Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id);

    if (cartError) {
      console.error("❌ Failed to fetch cart items:", cartError);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }

    if (!cartItems || cartItems.length === 0) {
      console.log("⚠️ No items in cart — nothing to finalize.");
      return res
        .status(400)
        .json({ error: "No cart items found for this user" });
    }

    // 🧮 Compute total amount (convert to centavos)
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product_price ?? 0) * item.quantity,
      0
    );

    // 🟢 Create new order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          total_amount: Math.round(totalAmount * 100), // pesos → centavos
          order_status: "paid",
          shipping_status: "To Ship",
        },
      ])
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("❌ Failed to create new order:", orderError);
      return res.status(500).json({ error: "Failed to create order" });
    }

    console.log("✅ Created new order:", newOrder.order_id);

    // 🟢 Move cart_items → order_items (match schema: order_item_quantity)
    const orderItemsPayload = cartItems.map((ci) => ({
      order_id: newOrder.order_id,
      product_id: ci.product_id,
      order_item_quantity: ci.quantity,
      unit_price: Math.round((ci.product_price ?? 0) * 100),
      subtotal: Math.round((ci.product_price ?? 0) * ci.quantity * 100),
    }));

    const { error: insertError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (insertError) {
      console.error("❌ Failed to insert order_items:", insertError);
      return res.status(500).json({ error: "Failed to insert order items" });
    }

    console.log(
      `✅ Moved ${orderItemsPayload.length} items into order_items for order ${newOrder.order_id}`
    );

    // 🧹 Clear user's cart
    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id);

    if (clearError) {
      console.error("⚠️ Failed to clear cart:", clearError);
    } else {
      console.log("🧹 Cleared user's cart after checkout.");
    }

    return res.json({
      message: "✅ Order finalized successfully",
      orderId: newOrder.order_id,
    });
  } catch (err: any) {
    console.error("❌ finalizeOrder error:", err.message);
    return res.status(500).json({ error: "Failed to finalize order" });
  }
};
