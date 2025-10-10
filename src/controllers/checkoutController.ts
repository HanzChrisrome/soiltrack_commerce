// src/controllers/checkoutController.ts
import axios from "axios";
import type { Request, Response } from "express";
import crypto from "crypto";
import supabase from "../../supabaseServer";

export const createCheckoutLink = async (req: Request, res: Response) => {
  try {
    const { user_id, items, total, payment_method } = req.body;

    if (
      !user_id ||
      !items ||
      !Array.isArray(items) ||
      typeof total !== "number"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // ✅ Handle Cash on Delivery
    if (payment_method === "COD") {
      const orderRef = "cod_" + crypto.randomBytes(8).toString("hex");

      // Insert main order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id,
            order_ref: orderRef,
            payment_provider_link: null,
            payment_provider_data: null,
            total_amount: total,
            order_status: "pending",
            metadata: { payment_method: "COD" },
            shipping_status: "pending",
          },
        ])
        .select(); // returns the inserted order row

      if (orderError || !orderData || orderData.length === 0) {
        console.error("Supabase COD order insert error:", orderError);
        return res.status(500).json({ error: "Failed to create COD order" });
      }

      const orderId = orderData[0].order_id;

      // Insert items into order_items table
      const orderItemsPayload = items.map((i) => ({
        order_id: orderId,
        product_id:
          i.product_id?.startsWith("SHIPPING") ||
          i.product_id?.startsWith("PLATFORM")
            ? null
            : i.product_id,
        order_item_quantity: i.quantity,
        unit_price: Math.round(i.product_price ?? 0),
        subtotal: Math.round((i.product_price ?? 0) * i.quantity),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) {
        console.error("Supabase COD order_items insert error:", itemsError);
        return res
          .status(500)
          .json({ error: "Failed to create COD order items" });
      }

      return res.json({
        message: "COD order created successfully",
        order_ref: orderRef,
      });
    }

    // ✅ Online payment (PayMongo)
    const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
    if (!PAYMONGO_SECRET)
      return res.status(500).json({ error: "PayMongo key missing" });

    const authHeader =
      "Basic " + Buffer.from(`${PAYMONGO_SECRET}:`).toString("base64");
    const orderRef = "cs_" + crypto.randomBytes(8).toString("hex");

    const payload = {
      data: {
        attributes: {
          line_items: items.map((i) => ({
            name: i.product_name,
            amount: Math.round(i.product_price * 100),
            currency: "PHP",
            quantity: i.quantity,
          })),
          payment_method_types: ["card", "gcash", "paymaya"],
          success_url: `http://localhost:5173/checkout/success?ref=${orderRef}`,
          cancel_url: `http://localhost:5173/checkout/cancel?ref=${orderRef}`,
        },
      },
    };

    const paymongoRes = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      payload,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    const checkoutUrl = paymongoRes?.data?.data?.attributes?.checkout_url;
    if (!checkoutUrl) {
      return res.status(500).json({ error: "Unexpected PayMongo response" });
    }

    return res.json({ url: checkoutUrl, order_ref: orderRef });
  } catch (err: any) {
    console.error(
      "createCheckoutLink error:",
      err?.response?.data ?? err.message
    );
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
