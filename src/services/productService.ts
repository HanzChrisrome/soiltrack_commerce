import type { Product } from "../models/product";

const API_URL = "http://localhost:5000/api/products";

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  addProduct: async (product: Product, imageFile?: File): Promise<Product> => {
    const formData = new FormData();
    formData.append("product_name", product.product_name);
    formData.append("product_category", product.product_category);
    formData.append("product_price", String(product.product_price));
    formData.append("product_quantity", String(product.product_quantity));
    formData.append("product_description", product.product_description || "");
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Failed to add product";
        try {
          const errorData = await res.json();
          message = errorData.error || message;
        } catch (_) {}
        throw new Error(message);
      }

      return res.json();
    } catch (err) {
      console.error("Network error while adding product:", err);
      throw err;
    }
  },
};
