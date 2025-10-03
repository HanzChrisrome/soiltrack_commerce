// src/models/order.ts

export type Product = {
  product_id: string;
  product_name: string;
  product_image: string | null;
};

export type OrderItem = {
  order_item_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products?: Product | null; // Flattened single product
};

export type Order = {
  order_id: string;
  order_ref: string | null;
  status: string;
  total_amount: number; // stored in centavos in DB
  created_at: string;
  order_items: OrderItem[];
};
