export interface Product {
  product_id: string;
  product_name: string;
  product_category: string;
  product_description?: string;
  product_price: number;
  product_quantity: number;
  product_image?: string;
  points_price?: number | null; // points needed for redemption
  is_point_product?: boolean; // true if redeemable with points
  user_province?: string;
}
