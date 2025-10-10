// src/types/orders.ts

export interface Product {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  order_item_quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  products?: Product | null;
}

export interface Order {
  order_id: string;
  order_ref: string | null;
  user_id: string;
  total_amount: number;
  order_status: string | null;
  shipping_status: string | null;
  created_at: string;
  order_items: OrderItem[];
  payment_provider_link?: string | null;
  metadata?: any;
  users?: {
    user_fname: string;
    user_lname: string;
    user_email: string;
  } | null;
}

/**
 * Represents a refund or cancellation request initiated by the user.
 * This request must be approved by an admin before status changes to "Cancelled" or "Returned".
 */
export interface RefundRequest {
  refund_id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string | null;
}

/**
 * Props for refund modal component.
 * Shared between UI components to enforce consistency.
 */
export interface RefundModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}
