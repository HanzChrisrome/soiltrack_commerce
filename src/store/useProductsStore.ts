import { create } from "zustand";
import type { Product } from "../models/product";
import { productService } from "../services/productService";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Product, imageFile?: File) => Promise<void>;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,

  addProduct: async (product, imageFile) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await productService.addProduct(product, imageFile);
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await productService.getProducts();
      set({ products, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
