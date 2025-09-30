// store/useShopStore.ts
import { create } from "zustand";
import type { Product } from "../models/product";
import type { CartItem } from "../models/cart";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";

interface ShopState {
  products: Product[];
  cart: CartItem[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  fetchCart: (user_id: string) => Promise<void>;
  addItemToCart: (user_id: string, product_id: string, quantity: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshCart: (user_id: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  products: [],
  cart: [],
  loading: false,

  // fetch only if not cached
  fetchProducts: async () => {
    if (get().products.length > 0) return;
    set({ loading: true });
    try {
      const data = await productService.getProducts();
      set({ products: data });
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchCart: async (user_id: string) => {
    if (!user_id) return;
    if (get().cart.length > 0) return;
    set({ loading: true });
    try {
      const data = await cartService.getCart(user_id);
      set({ cart: data });
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      set({ loading: false });
    }
  },

  addItemToCart: async (user_id: string, product_id: string, quantity: number) => {
    try {
      const newItem = await cartService.addToCart(user_id, product_id, quantity);
      set((state) => {
        const exists = state.cart.find((c) => c.product_id === product_id);
        if (exists) {
          return {
            cart: state.cart.map((c) =>
              c.product_id === product_id ? { ...c, quantity: c.quantity + quantity } : c
            ),
          };
        }
        return { cart: [...state.cart, newItem] };
      });
    } catch (err) {
      console.error("Failed to add item to cart", err);
    }
  },

  // force refresh
  refreshProducts: async () => {
    set({ loading: true });
    try {
      const data = await productService.getProducts();
      set({ products: data });
    } catch (err) {
      console.error("Failed to refresh products", err);
    } finally {
      set({ loading: false });
    }
  },

  refreshCart: async (user_id: string) => {
    if (!user_id) return;
    set({ loading: true });
    try {
      const data = await cartService.getCart(user_id);
      set({ cart: data });
    } catch (err) {
      console.error("Failed to refresh cart", err);
    } finally {
      set({ loading: false });
    }
  },
}));
