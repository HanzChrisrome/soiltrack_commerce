import type { Request, Response } from "express";
import { supabase } from "../supabaseClient";

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log("🔔 PayMongo Webhook:", JSON.stringify(event, null, 2));

    const sessionId = event.data?.id;
    const status = event.data?.attributes?.payment_status; // "paid" | "unpaid" | "failed"

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    // ✅ Update order status
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_ref", sessionId)
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to update order:", error);
      return res.status(500).json({ error: "Failed to update order" });
    }

    // ✅ If paid, clear cart
    if (status === "paid" && order?.user_id) {
      const { error: cartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", order.user_id);

      if (cartError) {
        console.error("❌ Failed to clear cart:", cartError);
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    res.status(400).send("Webhook error");
  }
};
