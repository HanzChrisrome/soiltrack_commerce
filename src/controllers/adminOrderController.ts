/* eslint-disable @typescript-eslint/no-explicit-any */
// src/controllers/adminOrderController.ts
import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
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
          payment_method,
          shipping_fee,
          platform_fee,
          points_used,
          created_at,
          users (
            user_id,
            user_fname,
            user_lname,
            user_email
          ),
          order_items (
            order_item_id,
            order_item_quantity,
            unit_price,
            subtotal,
            products (
              product_id,
              product_name
            )
          )
        `
      )
      .order("created_at", { ascending: false });

    console.log("📦 Fetched orders:", JSON.stringify(data, null, 2));

    if (error) {
      console.error("❌ Supabase error:", error);
      throw error;
    }
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

    // Fetch order details before updating
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("order_id, user_id, points_used, shipping_status")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !orderData) {
      console.error("❌ Order not found:", fetchError);
      return res.status(404).json({ error: "Order not found" });
    }

    const pointsUsed = orderData.points_used || 0;

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({ shipping_status: new_status })
      .eq("order_id", order_id);

    if (error) throw error;

    // 🔄 Refund points if order is cancelled or refunded AND points were used
    const shouldRefundPoints =
      (new_status === "Cancelled" || new_status === "Refunded") &&
      pointsUsed > 0;

    if (shouldRefundPoints) {
      // Fetch user's current points
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("points")
        .eq("user_id", orderData.user_id)
        .single();

      if (userFetchError) {
        console.error(
          "⚠️ Failed to fetch user points for refund:",
          userFetchError
        );
      } else {
        const currentPoints = userData?.points ?? 0;
        const newPoints = currentPoints + pointsUsed;

        // Restore points to user
        const { error: pointsRefundError } = await supabase
          .from("users")
          .update({ points: newPoints })
          .eq("user_id", orderData.user_id);

        if (pointsRefundError) {
          console.error("⚠️ Failed to refund points:", pointsRefundError);
        } else {
          console.log(
            `🔄 Refunded ${pointsUsed} points to user ${orderData.user_id} (${currentPoints} → ${newPoints})`
          );
        }
      }
    }

    res.json({
      message: "✅ Order status updated successfully",
      pointsRefunded: shouldRefundPoints ? pointsUsed : 0,
    });
  } catch (err: any) {
    console.error("❌ updateOrderStatus error:", err.message);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { order_id, payment_status } = req.body;

    if (!order_id || !payment_status)
      return res
        .status(400)
        .json({ error: "Missing order_id or payment_status" });

    // Update payment status (order_status field)
    const { error } = await supabase
      .from("orders")
      .update({ order_status: payment_status })
      .eq("order_id", order_id);

    if (error) throw error;

    res.json({
      message: "✅ Payment status updated successfully",
    });
  } catch (err: any) {
    console.error("❌ updatePaymentStatus error:", err.message);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
