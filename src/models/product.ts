export interface Product {
  product_id: string;
  product_name: string;
  product_category: string;
  product_description?: string;
  orig_price?: number; // Original/cost price
  product_price: number; // Selling price
  product_quantity: number;
  product_image?: string;
  points_price?: number | null; // points needed for redemption
  is_point_product?: boolean; // true if redeemable with points
  user_province?: string;
  created_at?: string;
  updated_at?: string;
  points_price?: number;
  is_point_product?: boolean;
}
