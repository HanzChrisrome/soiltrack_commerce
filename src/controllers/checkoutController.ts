// src/controllers/checkoutController.ts
import axios from "axios";
import type { Request, Response } from "express";
import supabase from "../../supabaseServer";

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
      return res.status(400).json({ error: "Invalid payload" });
    }

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
            amount: Math.round(i.product_price * 100), // centavos
            currency: "PHP",
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

    const sessionId = paymongoRes?.data?.data?.id;
    const checkoutUrl = paymongoRes?.data?.data?.attributes?.checkout_url;

    if (!sessionId || !checkoutUrl) {
      console.error("Unexpected PayMongo response:", paymongoRes.data);
      return res.status(500).json({ error: "Unexpected PayMongo response" });
    }

    // Insert pending order in Supabase (store centavos in total_amount)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          total_amount: Math.round(total * 100), // centavos
          status: "pending",
          order_ref: sessionId,
          payment_provider_link: checkoutUrl,
          payment_provider_data: paymongoRes.data,
          metadata: { items }, // optional snapshot; useful for debugging
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Supabase insert error:", orderError);
      // We still return the checkout url so customer may pay — but log this to fix later
      return res.status(500).json({ error: "Failed to create order in DB" });
    }

    return res.json({ url: checkoutUrl });
  } catch (err: any) {
    console.error(
      "createCheckoutLink error:",
      err?.response?.data ?? err.message
    );
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
