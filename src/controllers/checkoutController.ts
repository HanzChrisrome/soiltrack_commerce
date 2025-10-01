// src/controllers/checkoutController.ts
import axios from "axios";
import type { Request, Response } from "express";

export const createCheckoutLink = async (req: Request, res: Response) => {
  try {
    const { user_id, items, total } = req.body as {
      user_id?: string;
      items?: Array<{
        product_id: string;
        product_name: string;
        product_price: number;
        quantity: number;
      }>;
      total?: number;
    };

    if (
      !user_id ||
      !items ||
      !Array.isArray(items) ||
      typeof total !== "number"
    ) {
      return res.status(400).json({ error: "Missing or invalid payload" });
    }

    const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
    if (!PAYMONGO_SECRET) {
      return res.json({ url: "https://example.com/fake-checkout?test=1" });
    }

    // ✅ Use Checkout Sessions API (recommended)
    const payload = {
      data: {
        attributes: {
          line_items: items.map((i) => ({
            currency: "PHP",
            amount: Math.round(i.product_price * 100), // convert pesos → centavos
            name: i.product_name,
            quantity: i.quantity,
          })),
          payment_method_types: ["card", "gcash", "paymaya"],
          success_url:
            process.env.CHECKOUT_SUCCESS_URL ||
            "http://localhost:5173/checkout/success",
          cancel_url:
            process.env.CHECKOUT_CANCEL_URL ||
            "http://localhost:5173/checkout/cancel",
        },
      },
    };

    const authHeader =
      "Basic " + Buffer.from(`${PAYMONGO_SECRET}:`).toString("base64");

    const paymongoRes = await axios.post(
      "https://api.paymongo.com/v1/payment_links",
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
      console.error("Unexpected PayMongo response:", paymongoRes.data);
      return res.status(500).json({ error: "Unexpected PayMongo response" });
    }

    return res.json({ url: checkoutUrl });
  } catch (err: any) {
    console.error(
      "create-payment-link error:",
      err?.response?.data ?? err.message
    );
    return res.status(500).json({ error: "Failed to create payment link" });
  }
};
