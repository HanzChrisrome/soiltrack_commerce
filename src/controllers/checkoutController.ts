/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { Request, Response } from "express";
import crypto from "crypto";

export const createCheckoutLink = async (req: Request, res: Response) => {
  try {
    const { user_id, items, total, paymentMethod } = req.body;

    if (
      !user_id ||
      !items ||
      !Array.isArray(items) ||
      typeof total !== "number"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Generate local order reference
    const orderRef = "cs_" + crypto.randomBytes(8).toString("hex");

    if (paymentMethod === "ONLINE") {
      const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
      if (!PAYMONGO_SECRET)
        return res.status(500).json({ error: "PayMongo key missing" });

      const authHeader =
        "Basic " + Buffer.from(`${PAYMONGO_SECRET}:`).toString("base64");

      const payload = {
        data: {
          attributes: {
            line_items: items.map((i) => ({
              name: i.product_name,
              amount: Math.round(i.product_price * 100), // PayMongo expects centavos
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
      if (!checkoutUrl)
        return res.status(500).json({ error: "Unexpected PayMongo response" });

      // For ONLINE payment: Don't create order yet!
      // Store the checkout data temporarily - order will be created only after successful payment
      // This prevents cancelled/incomplete payments from creating orphaned orders in the database

      // Store items data as metadata for later order creation
      const sessionMetadata = {
        user_id,
        items,
        total_amount: total * 100,
        created_at: new Date().toISOString(),
      };

      // You can optionally store this in a temporary sessions table or just pass via URL
      // For now, we'll rely on the cart still being available when user returns

      return res.json({
        url: checkoutUrl,
        order_ref: orderRef,
        metadata: sessionMetadata,
      });
    }

    // COD Payment - Don't create order yet, just return order_ref
    // Order will be created in finalizeOrder endpoint (same as ONLINE flow)
    // This ensures both payment methods go through the same finalization process
    // and all fees (shipping, platform) are properly calculated and stored

    return res.json({ order_ref: orderRef });
  } catch (err: any) {
    console.error(
      "createCheckoutLink error:",
      err?.response?.data ?? err.message
    );
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
