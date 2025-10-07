// src/controllers/orderController.ts
import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

/**
 * Finalize an order after successful PayMongo checkout
 * Moves all items from cart_items → order_items
 * Creates a new order with payment + shipping details
 */
export const finalizeOrder = async (req: Request, res: Response) => {
  try {
    const { user_id, order_ref, checkout_url } = req.body;
    console.log(
      "👉 finalizeOrder called for user:",
      user_id,
      "ref:",
      order_ref
    );

    if (!user_id || !order_ref || !checkout_url) {
      return res
        .status(400)
        .json({ error: "Missing user_id, order_ref, or checkout_url" });
    }

    // 🛒 1. Fetch all items from user's cart
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        cart_item_id,
        user_id,
        quantity,
        product_id,
        products (
          product_price,
          product_name
        )
      `
      )
      .eq("user_id", user_id);

    if (cartError) {
      console.error("❌ Cart fetch error:", cartError);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 🧮 2. Compute total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      const price =
        (item.products as any)?.product_price ??
        (Array.isArray(item.products) && item.products[0]?.product_price) ??
        0;
      return sum + price * item.quantity;
    }, 0);

    // 🧾 3. Build metadata for order tracking
    const metadata = cartItems.map((item) => ({
      product_id: item.product_id,
      product_name:
        (item.products as any)?.product_name ??
        (Array.isArray(item.products) && item.products[0]?.product_name) ??
        "Unknown",
      quantity: item.quantity,
      price:
        (item.products as any)?.product_price ??
        (Array.isArray(item.products) && item.products[0]?.product_price) ??
        0,
    }));

    // 🟢 4. Create a new order record
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          order_ref,
          total_amount: Math.round(totalAmount * 100), // Convert to centavos
          order_status: "paid",
          shipping_status: "To Ship",
          metadata,
          payment_provider_link: checkout_url,
          payment_provider_data: {
            provider: "paymongo",
            status: "success",
            order_ref,
          },
        },
      ])
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("❌ Failed to create order:", orderError);
      return res.status(500).json({ error: "Failed to create order" });
    }

    console.log("✅ Created new order:", newOrder.order_ref);

    // 🟢 5. Move cart items → order_items
    const orderItemsPayload = cartItems.map((ci) => {
      const price =
        (ci.products as any)?.product_price ??
        (Array.isArray(ci.products) && ci.products[0]?.product_price) ??
        0;
      return {
        order_id: newOrder.order_id,
        product_id: ci.product_id,
        order_item_quantity: ci.quantity,
        unit_price: Math.round(price * 100), // centavos
        subtotal: Math.round(price * ci.quantity * 100),
      };
    });

    const { error: oiError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (oiError) {
      console.error("❌ Failed to insert order_items:", oiError);
      return res.status(500).json({ error: "Failed to insert order items" });
    }

    console.log(
      `✅ Moved ${orderItemsPayload.length} cart items to order_items`
    );

    // 🧹 6. Clear user's cart
    const { error: delError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id);

    if (delError) {
      console.error("⚠️ Failed to clear cart:", delError);
    }

    return res.json({
      message: "✅ Order finalized successfully",
      orderRef: newOrder.order_ref,
      payment_provider_link: newOrder.payment_provider_link,
      total_amount: totalAmount,
      order_id: newOrder.order_id,
    });
  } catch (err: any) {
    console.error("❌ finalizeOrder error:", err.message);
    return res.status(500).json({ error: "Failed to finalize order" });
  }
};
