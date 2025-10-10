// services/pointsServices.ts
import {
  getRedeemablePointCost,
  isRedeemableProduct,
} from "../models/redeemableProducts";
import type { CartItem } from "../models/cart";

export const canRedeem = (cartItem: CartItem, userPoints: number) => {
  if (!cartItem.product_name || !isRedeemableProduct(cartItem.product_name))
    return false;
  const cost = getRedeemablePointCost(cartItem.product_name);
  if (cost === null) return false;
  return userPoints >= cost * (cartItem.quantity ?? 1);
};

export const redeemCartItem = (cartItem: CartItem, userPoints: number) => {
  const cost = getRedeemablePointCost(cartItem.product_name ?? "");
  const totalCost = (cost ?? 0) * (cartItem.quantity ?? 1);

  if (!cost || userPoints < totalCost)
    return { updatedItem: cartItem, remainingPoints: userPoints };

  return {
    updatedItem: {
      ...cartItem,
      redeemedWithPoints: true,
      pointsCost: cost,
      product_price: 0,
    },
    remainingPoints: userPoints - totalCost,
  };
};
