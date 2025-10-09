// src/controllers/checkoutController.ts
import axios from "axios";
import type { Request, Response } from "express";
import crypto from "crypto";

export const createCheckoutLink = async (req: Request, res: Response) => {
  try {
    const { user_id, items, total } = req.body;

    if (
      !user_id ||
      !items ||
      !Array.isArray(items) ||
      typeof total !== "number"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
    if (!PAYMONGO_SECRET)
      return res.status(500).json({ error: "PayMongo key missing" });

    const authHeader =
      "Basic " + Buffer.from(`${PAYMONGO_SECRET}:`).toString("base64");

    // ✅ Generate our own local order reference
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

    // ✅ Return our custom reference + PayMongo checkout URL
    return res.json({ url: checkoutUrl, order_ref: orderRef });
  } catch (err: any) {
    console.error(
      "createCheckoutLink error:",
      err?.response?.data ?? err.message
    );
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
