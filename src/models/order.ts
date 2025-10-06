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
}
