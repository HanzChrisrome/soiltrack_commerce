export interface CartItem {
  cart_item_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product_name: string | null;
  product_price: number | null;
  product_image: string | null;
  product_category: string | null;
}
