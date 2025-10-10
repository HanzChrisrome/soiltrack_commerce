export interface Product {
  product_id: string;
  product_name: string;
  product_category:
    | "Insecticide"
    | "Herbicide"
    | "Pesticide"
    | "Molluscicide"
    | "Fertilizer";
  product_description?: string;
  orig_price?: number; // Original/cost price
  product_price: number; // Selling price
  product_quantity: number;
  product_image?: string;
  created_at?: string;
  updated_at?: string;
  points_price?: number;
  is_point_product?: boolean;
}
