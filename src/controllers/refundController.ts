// src/controllers/refundController.ts
import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

/**
 * Handles both refund and cancellation requests
 * - /refund  → sets shipping_status = 'For Refund'
 * - /cancel  → sets shipping_status = 'For Cancellation'
 */
export const requestRefund = async (req: Request, res: Response) => {
  try {
    const { order_id, user_id, reason, otherReason, type } = req.body;

    if (!order_id || !user_id || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Determine whether this is a refund or cancellation
    const isRefund = type === "refund";
    const newShippingStatus = isRefund ? "For Refund" : "For Cancellation";

    // 1️⃣ Validate order existence
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id, shipping_status")
      .eq("order_id", order_id)
      .eq("user_id", user_id)
      .single();

    if (orderError || !orderData) {
      console.error("❌ Order not found:", orderError);
      return res.status(404).json({ error: "Order not found" });
    }

    // 2️⃣ Update order’s shipping_status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ shipping_status: newShippingStatus })
      .eq("order_id", order_id);

    if (updateError) {
      console.error("❌ Failed to update order shipping_status:", updateError);
      return res
        .status(500)
        .json({ error: "Failed to update order shipping_status" });
    }

    // 3️⃣ Create refund or cancellation record
    const { error: insertError } = await supabase.from("order_refunds").insert([
      {
        order_id,
        user_id,
        reason: otherReason ? `${reason} - ${otherReason}` : reason,
        status: "Pending",
      },
    ]);

    if (insertError) {
      console.error("❌ Failed to insert refund/cancellation:", insertError);
      return res
        .status(500)
        .json({ error: "Failed to create refund/cancellation request" });
    }

    res.json({
      message: isRefund
        ? "✅ Refund request submitted successfully"
        : "✅ Cancellation request submitted successfully",
      shipping_status: newShippingStatus,
    });
  } catch (err: any) {
    console.error("❌ requestRefund error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
