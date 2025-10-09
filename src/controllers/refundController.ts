import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

export const requestRefund = async (req: Request, res: Response) => {
  try {
    const { user_id, order_id, reason } = req.body;

    if (!user_id || !order_id || !reason) {
      return res
        .status(400)
        .json({ error: "Missing user_id, order_id, or reason" });
    }

    // Check order eligibility
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("order_id, shipping_status, user_id")
      .eq("order_id", order_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (order.shipping_status !== "To Ship") {
      return res
        .status(400)
        .json({ error: "Order cannot be refunded at this stage" });
    }

    // Insert refund request
    const { data: refund, error: refundError } = await supabase
      .from("order_refunds")
      .insert([{ order_id, user_id, reason, status: "Pending" }])
      .select()
      .single();

    if (refundError) {
      console.error("❌ Failed to insert refund request:", refundError);
      return res.status(500).json({ error: "Failed to create refund request" });
    }

    // ✅ Update order shipping_status to indicate cancellation requested
    const { error: updateError } = await supabase
      .from("orders")
      .update({ shipping_status: "For Cancellation" })
      .eq("order_id", order_id);

    if (updateError) {
      console.error("❌ Failed to update order status:", updateError);
      // Not critical — the refund request was still created
    }

    res.json({
      message:
        "✅ Refund request submitted for review. Order marked as 'For Cancellation'.",
      refund,
    });
  } catch (err: any) {
    console.error("❌ requestRefund error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
