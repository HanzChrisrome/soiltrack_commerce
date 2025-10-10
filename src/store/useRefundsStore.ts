// src/store/useRefundsStore.ts
import { create } from "zustand";
import supabase from "../lib/supabase";

export interface RefundRequest {
  refund_id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: string;
  admin_notes?: string | null;
  created_at: string;
  orders?: {
    order_ref: string;
    total_amount: number;
    shipping_status: string;
    order_items: Array<{
      order_item_id: string;
      order_item_quantity: number;
      unit_price: number;
      subtotal: number;
      products: {
        product_name: string;
        product_image: string;
      } | null;
    }>;
  };
  users?: {
    user_fname: string;
    user_lname: string;
    user_email: string;
  };
}

interface RefundsStore {
  refunds: RefundRequest[];
  loading: boolean;
  fetchRefunds: () => Promise<void>;
  approveRefund: (refundId: string, adminNotes?: string) => Promise<void>;
  rejectRefund: (refundId: string, adminNotes?: string) => Promise<void>;
}

export const useRefundsStore = create<RefundsStore>((set) => ({
  refunds: [],
  loading: false,

  fetchRefunds: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from("order_refunds")
        .select(
          `
          *,
          orders (
            order_ref,
            total_amount,
            shipping_status,
            order_items (
              order_item_id,
              order_item_quantity,
              unit_price,
              subtotal,
              products (
                product_name,
                product_image
              )
            )
          ),
          users (
            user_fname,
            user_lname,
            user_email
          )
        `
        )
        .order("created_at", { ascending: false });

      console.log("Fetched refunds:", data);

      if (error) {
        console.error("Error fetching refunds:", error);
        throw error;
      }

      set({ refunds: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      set({ loading: false });
    }
  },

  approveRefund: async (refundId: string, adminNotes?: string) => {
    try {
      // Get the refund to find the order_id
      const { data: refund, error: refundError } = await supabase
        .from("order_refunds")
        .select("order_id")
        .eq("refund_id", refundId)
        .single();

      if (refundError || !refund) throw refundError;

      // Get order details to check points_used
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("user_id, points_used")
        .eq("order_id", refund.order_id)
        .single();

      if (orderError || !orderData) throw orderError;

      const pointsUsed = orderData.points_used || 0;

      // Update refund status
      const { error: updateRefundError } = await supabase
        .from("order_refunds")
        .update({
          status: "Approved",
          admin_notes: adminNotes || null,
        })
        .eq("refund_id", refundId);

      if (updateRefundError) throw updateRefundError;

      // Update order shipping status to "Refunded"
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({
          shipping_status: "Refunded",
        })
        .eq("order_id", refund.order_id);

      if (updateOrderError) throw updateOrderError;

      // 🔄 Refund points if any were used
      if (pointsUsed > 0) {
        const { data: userData, error: userFetchError } = await supabase
          .from("users")
          .select("points")
          .eq("user_id", orderData.user_id)
          .single();

        if (userFetchError) {
          console.error(
            "⚠️ Failed to fetch user points for refund:",
            userFetchError
          );
        } else {
          const currentPoints = userData?.points ?? 0;
          const newPoints = currentPoints + pointsUsed;

          const { error: pointsRefundError } = await supabase
            .from("users")
            .update({ points: newPoints })
            .eq("user_id", orderData.user_id);

          if (pointsRefundError) {
            console.error("⚠️ Failed to refund points:", pointsRefundError);
          } else {
            console.log(
              `🔄 Refunded ${pointsUsed} points to user ${orderData.user_id} (${currentPoints} → ${newPoints})`
            );
          }
        }
      }

      // Refresh refunds list
      await useRefundsStore.getState().fetchRefunds();
    } catch (error) {
      console.error("Failed to approve refund:", error);
      throw error;
    }
  },

  rejectRefund: async (refundId: string, adminNotes?: string) => {
    try {
      // Get the refund to find the order_id
      const { data: refund, error: refundError } = await supabase
        .from("order_refunds")
        .select("order_id")
        .eq("refund_id", refundId)
        .single();

      if (refundError || !refund) throw refundError;

      // Update refund status
      const { error: updateRefundError } = await supabase
        .from("order_refunds")
        .update({
          status: "Rejected",
          admin_notes: adminNotes || null,
        })
        .eq("refund_id", refundId);

      if (updateRefundError) throw updateRefundError;

      // Update order shipping status back to "Received" (or keep as is)
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({
          shipping_status: "Received", // or remove "For Refund" status
        })
        .eq("order_id", refund.order_id);

      if (updateOrderError) throw updateOrderError;

      // Refresh refunds list
      await useRefundsStore.getState().fetchRefunds();
    } catch (error) {
      console.error("Failed to reject refund:", error);
      throw error;
    }
  },
}));
