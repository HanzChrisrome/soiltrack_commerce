import axios from "axios";
import type { Request, Response } from "express";
import crypto from "crypto";
import supabase from "../../supabaseServer";

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

      // Insert order and items in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_ref: orderRef,
          user_id,
          total_amount: total * 100, // store in centavos
          order_status: "pending",
          payment_provider_link: checkoutUrl,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.order_id;

      const orderItems = items.map((i: any) => ({
        order_id: orderId,
        product_id: i.product_id ?? null,
        unit_price: Math.round((i.product_price ?? 0) * 100),
        order_item_quantity: i.quantity,
        subtotal: Math.round((i.product_price ?? 0) * i.quantity * 100),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      return res.json({ url: checkoutUrl, order_ref: orderRef });
    }

    // COD Payment
    const { data: codOrder, error: codError } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        user_id,
        total_amount: total * 100, // store in centavos
        order_status: "pending",
        payment_provider_link: null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (codError) throw codError;
    const orderId = codOrder.order_id;

    const codItems = items.map((i: any) => ({
      order_id: orderId,
      product_id: i.product_id ?? null,
      unit_price: Math.round((i.product_price ?? 0) * 100),
      order_item_quantity: i.quantity,
      subtotal: Math.round((i.product_price ?? 0) * i.quantity * 100),
    }));

    const { error: codItemsError } = await supabase
      .from("order_items")
      .insert(codItems);
    if (codItemsError) throw codItemsError;

    return res.json({ order_ref: orderRef });
  } catch (err: any) {
    console.error(
      "createCheckoutLink error:",
      err?.response?.data ?? err.message
    );
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
