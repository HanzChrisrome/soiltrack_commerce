export interface Product {
  product_id?: string;
  product_name: string;
  product_category:
    | "Insecticide"
    | "Herbicide"
    | "Pesticide"
    | "Molluscicide"
    | "Fertilizer";
  product_description?: string;
  product_price: number;
  product_quantity: number;
  product_image?: string; // URL/path in Supabase storage or public assets
  created_at?: string;
  updated_at?: string;
}
