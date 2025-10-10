// src/controllers/orderController.ts
import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

/**
 * Finalize an order after successful PayMongo checkout
 * - Moves all items from cart_items → order_items
 * - Deducts points from user if applicable
 * - Creates a new order with payment + shipping details
 */
export const finalizeOrder = async (req: Request, res: Response) => {
  try {
    const { user_id, order_ref, checkout_url } = req.body;

    if (!user_id || !order_ref || !checkout_url) {
      return res
        .status(400)
        .json({ error: "Missing user_id, order_ref, or checkout_url" });
    }

    // 1️⃣ Fetch cart items with product info
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        cart_item_id,
        product_id,
        quantity,
        products (
          product_name,
          product_price,
          points_price,
          is_point_product
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

    // 2️⃣ Compute total cash amount and total points used
    let totalAmount = 0; // in PHP
    let totalPointsUsed = 0;

    const metadataProducts = cartItems.map((item) => {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      const unitPrice = product?.product_price ?? 0;
      const pointsPrice = product?.points_price ?? 0;
      const isPointProduct = product?.is_point_product ?? false;

      if (isPointProduct) {
        totalPointsUsed += pointsPrice * item.quantity;
      } else {
        totalAmount += unitPrice * item.quantity;
      }

      return {
        product_id: item.product_id,
        product_name: product?.product_name ?? "Unknown",
        quantity: item.quantity,
        unit_price: unitPrice,
        points_price: isPointProduct ? pointsPrice : 0,
        is_point_product: isPointProduct,
      };
    });

    // 3️⃣ Deduct points safely if needed
    if (totalPointsUsed > 0) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("points")
        .eq("user_id", user_id)
        .single();

      if (userError || !userData) {
        console.error("❌ Failed to fetch user points:", userError);
        return res
          .status(500)
          .json({ error: "Failed to fetch user points for deduction" });
      }

      const newPoints = Math.max((userData.points ?? 0) - totalPointsUsed, 0);

      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("user_id", user_id);

      if (updateError) {
        console.error("❌ Failed to deduct points:", updateError);
        return res
          .status(500)
          .json({ error: "Failed to deduct points from user" });
      }
    }

    // 4️⃣ Create a new order record
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          order_ref,
          total_amount: Math.round(totalAmount * 100), // convert to centavos
          order_status: "paid",
          shipping_status: "To Ship",
          metadata: {
            products: metadataProducts,
            pointsUsed: totalPointsUsed,
          },
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

    // 5️⃣ Insert order_items (exclude points_price)
    const orderItemsPayload = cartItems.map((item) => {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      const unitPrice = product?.product_price ?? 0;
      const isPointProduct = product?.is_point_product ?? false;

      return {
        order_id: newOrder.order_id,
        product_id: item.product_id,
        order_item_quantity: item.quantity,
        unit_price: Math.round(unitPrice * 100), // centavos
        subtotal: Math.round(unitPrice * item.quantity * 100), // centavos
      };
    });

    const { error: oiError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (oiError) {
      console.error("❌ Failed to insert order_items:", oiError);
      return res.status(500).json({ error: "Failed to insert order items" });
    }

    // 6️⃣ Clear user's cart
    const { error: delError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id);

    if (delError) {
      console.error("⚠️ Failed to clear cart:", delError);
    }

    console.log("✅ Order finalized successfully:", newOrder.order_ref);

    return res.json({
      message: "✅ Order finalized successfully",
      orderRef: newOrder.order_ref,
      payment_provider_link: newOrder.payment_provider_link,
      total_amount: totalAmount,
      total_points_used: totalPointsUsed,
      order_id: newOrder.order_id,
    });
  } catch (err: any) {
    console.error("❌ finalizeOrder error:", err.message);
    return res.status(500).json({ error: "Failed to finalize order" });
  }
};
// src/controllers/orderController.ts

export const markOrderAsReceived = async (req: Request, res: Response) => {
  try {
    const { order_id, user_id } = req.body;

    if (!order_id || !user_id) {
      return res.status(400).json({ error: "Missing order_id or user_id" });
    }

    // Only allow changing "To Receive" → "Delivered"
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("shipping_status")
      .eq("order_id", order_id)
      .eq("user_id", user_id)
      .single();

    if (fetchError || !orderData) {
      console.error("❌ Failed to fetch order:", fetchError);
      return res.status(404).json({ error: "Order not found" });
    }

    if (orderData.shipping_status !== "To Receive") {
      return res
        .status(400)
        .json({ error: "Order is not in 'To Receive' status" });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ shipping_status: "Delivered" })
      .eq("order_id", order_id)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("❌ Failed to update order status:", updateError);
      return res
        .status(500)
        .json({ error: "Failed to mark order as received" });
    }

    return res.json({ message: "✅ Order marked as received" });
  } catch (err: any) {
    console.error("❌ markOrderAsReceived error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
