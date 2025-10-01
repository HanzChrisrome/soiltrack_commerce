// store/useShopStore.ts
import { create } from "zustand";
import type { Product } from "../models/product";
import type { CartItem } from "../models/cart";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";

interface ShopState {
  products: Product[];
  cart: CartItem[];
  productLoading: boolean;
  cartLoading: boolean;
  lastFetchedProducts: number | null;
  lastFetchedCart: number | null;

  fetchProducts: () => Promise<void>;
  fetchCart: (user_id: string) => Promise<void>;
  addItemToCart: (
    user_id: string,
    product_id: string,
    quantity: number
  ) => Promise<void>;
  updateItemQuantity: (cart_item_id: string, quantity: number) => Promise<void>;
  removeItemFromCart: (cart_item_id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshCart: (user_id: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  products: [],
  cart: [],
  productLoading: false,
  cartLoading: false,
  lastFetchedProducts: null,
  lastFetchedCart: null,

  // ✅ fetch products only if empty or stale (>5 mins)
  fetchProducts: async () => {
    const { products, lastFetchedProducts } = get();
    const isStale =
      !lastFetchedProducts || Date.now() - lastFetchedProducts > 5 * 60 * 1000;
    if (products.length > 0 && !isStale) return;

    set({ productLoading: true });
    try {
      const data = await productService.getProducts();
      set({ products: data, lastFetchedProducts: Date.now() });
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      set({ productLoading: false });
    }
  },

  // ✅ fetch cart only if empty or stale (>2 mins)
  fetchCart: async (user_id: string) => {
    if (!user_id) return;
    const { cart, lastFetchedCart } = get();
    const isStale =
      !lastFetchedCart || Date.now() - lastFetchedCart > 2 * 60 * 1000;
    if (cart.length > 0 && !isStale) return;

    set({ cartLoading: true });
    try {
      const data = await cartService.getCart(user_id);
      set({ cart: data, lastFetchedCart: Date.now() });
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      set({ cartLoading: false });
    }
  },

  addItemToCart: async (user_id, product_id, quantity) => {
    try {
      const newItem = await cartService.addToCart(
        user_id,
        product_id,
        quantity
      );
      set((state) => {
        const exists = state.cart.find((c) => c.product_id === product_id);
        if (exists) {
          return {
            cart: state.cart.map((c) =>
              c.product_id === product_id
                ? { ...c, quantity: c.quantity + quantity }
                : c
            ),
            lastFetchedCart: Date.now(),
          };
        }
        return { cart: [...state.cart, newItem], lastFetchedCart: Date.now() };
      });
    } catch (err) {
      console.error("Failed to add item to cart", err);
      throw err;
    }
  },

  updateItemQuantity: async (cart_item_id, quantity) => {
    try {
      await cartService.updateQuantity(cart_item_id, quantity);
      set((state) => ({
        cart: state.cart.map((item) =>
          item.cart_item_id === cart_item_id ? { ...item, quantity } : item
        ),
        lastFetchedCart: Date.now(),
      }));
    } catch (err) {
      console.error("Failed to update quantity", err);
      throw err;
    }
  },

  removeItemFromCart: async (cart_item_id) => {
    try {
      await cartService.removeItem(cart_item_id);
      set((state) => ({
        cart: state.cart.filter((item) => item.cart_item_id !== cart_item_id),
        lastFetchedCart: Date.now(),
      }));
    } catch (err) {
      console.error("Failed to remove item", err);
      throw err;
    }
  },

  // ✅ force refresh products
  refreshProducts: async () => {
    set({ productLoading: true });
    try {
      const data = await productService.getProducts();
      set({ products: data, lastFetchedProducts: Date.now() });
    } catch (err) {
      console.error("Failed to refresh products", err);
    } finally {
      set({ productLoading: false });
    }
  },

  // ✅ force refresh cart
  refreshCart: async (user_id) => {
    if (!user_id) return;
    set({ cartLoading: true });
    try {
      const data = await cartService.getCart(user_id);
      set({ cart: data, lastFetchedCart: Date.now() });
    } catch (err) {
      console.error("Failed to refresh cart", err);
    } finally {
      set({ cartLoading: false });
    }
  },
}));
