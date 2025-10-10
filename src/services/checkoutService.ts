// src/services/checkoutService.ts
import axios from "axios";

const API = "http://localhost:5000/api/checkout";

export const checkoutService = {
  createPaymentLink: async (
    user_id: string,
    items: any[],
    total: number,
    payment_method: "ONLINE" | "COD"
  ) => {
    const res = await axios.post(`${API}/create-payment-link`, {
      user_id,
      items,
      total,
      payment_method,
    });
    return res.data; // expects { url?, order_ref }
  },
};
