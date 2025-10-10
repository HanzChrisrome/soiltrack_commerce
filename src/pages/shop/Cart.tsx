// src/pages/shop/Cart.tsx
import { useEffect } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useAuthStore } from "../../store/useAuthStore";
import { checkoutService } from "../../services/checkoutService";
import Navbar from "../../widgets/Navbar";
import {
  isRedeemableProduct,
  getRedeemablePointCost,
} from "../../models/redeemableProducts";

const Cart = () => {
  const { authUser } = useAuthStore();
  const {
    cart,
    fetchCart,
    cartLoading,
    updateItemQuantity,
    removeItemFromCart,
    redeemItemWithPoints: markRedeemItem,
    cancelRedeemItem,
  } = useShopStore();

  useEffect(() => {
    if (authUser?.user_id) fetchCart(authUser.user_id);
  }, [authUser, fetchCart]);

  if (!authUser)
    return (
      <p className="text-center mt-20">Please log in to view your cart.</p>
    );

  if (cartLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
        <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // UI-only subtotal (redeemed items show as 0)
  const subtotal = cart.reduce((sum, item) => {
    const price =
      item.redeemedWithPoints && item.pointsCost ? 0 : item.product_price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = cart.length > 0 ? 100 : 0;
  // Dynamic platform fee
  let platformFeeRate = 0.05; // default medium
  if (subtotal < 2000) {
    platformFeeRate = 0.07; // small order
  } else if (subtotal >= 10000) {
    platformFeeRate = 0.03; // large/bulk order
  }
  const platformFee = Math.round(subtotal * platformFeeRate);
  const total = subtotal + shippingFee + platformFee;

  const handleProceedToCheckout = async () => {
    if (!authUser) {
      alert("Please log in to checkout.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const itemsPayload = [
      ...cart.map((ci) => ({
        product_id: ci.product_id,
        product_name: ci.product_name ?? "",
        product_price: ci.product_price ?? 0,
        quantity: ci.quantity,
        redeemedWithPoints: ci.redeemedWithPoints ?? false,
        pointsCost: ci.redeemedWithPoints
          ? getRedeemablePointCost(ci.product_name ?? "")
          : undefined,
      })),
      {
        product_id: "SHIPPING_FEE",
        product_name: "Shipping Fee",
        product_price: shippingFee,
        quantity: 1,
      },
      {
        product_id: "PLATFORM_FEE",
        product_name: `Platform Fee (${Math.round(platformFeeRate * 100)}%)`,
        product_price: platformFee,
        quantity: 1,
      },
    ];

    try {
      const res = await checkoutService.createPaymentLink(
        authUser.user_id,
        itemsPayload,
        total
      );
      if (res?.url) window.location.href = res.url;
      else alert("Failed to create checkout link.");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. See console.");
    }
  };

  const canRedeem = (item: (typeof cart)[0]) => {
    if (!authUser || !item.product_name) return false;
    if (!isRedeemableProduct(item.product_name)) return false;
    const cost = getRedeemablePointCost(item.product_name) ?? 0;
    return authUser.points >= cost && !item.redeemedWithPoints;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-16 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Shopping Cart ({cart.length})
          </h1>

          {cart.length === 0 ? (
            <p className="text-center text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT COLUMN - Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex flex-col bg-white rounded-2xl shadow-md p-4"
                  >
                    <div className="flex items-center">
                      {item.product_image ? (
                        <img
                          src={`http://localhost:5000/${item.product_image}`}
                          alt={item.product_name ?? ""}
                          className="h-24 w-24 object-cover rounded-lg mr-4"
                        />
                      ) : (
                        <div className="h-24 w-24 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-gray-500 text-sm">
                          No Image
                        </div>
                      )}

                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800">
                          {item.product_name ?? "Unnamed product"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {item.product_category ?? "Uncategorized"}
                        </p>

                        {/* Price display */}
                        <p className="text-sm font-medium mt-1 flex items-center space-x-2">
                          {item.redeemedWithPoints ? (
                            <>
                              <span className="line-through text-gray-400">
                                ₱
                                {(item.product_price ?? 0).toLocaleString(
                                  "en-US"
                                )}
                              </span>
                              <span className="text-green-900">₱0</span>
                            </>
                          ) : (
                            <span className="text-green-900">
                              ₱
                              {(item.product_price ?? 0).toLocaleString(
                                "en-US"
                              )}
                            </span>
                          )}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center mt-3 space-x-1">
                          <button
                            className="px-3 py-2 border border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200"
                            onClick={() =>
                              updateItemQuantity(
                                item.cart_item_id,
                                Math.max(item.quantity - 1, 1)
                              )
                            }
                          >
                            -
                          </button>
                          <div className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-md">
                            {item.quantity}
                          </div>
                          <button
                            className="px-3 py-2 border border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200"
                            onClick={() =>
                              updateItemQuantity(
                                item.cart_item_id,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-2">
                          {/* Item total */}
                          <p className="text-sm font-medium mt-1 flex items-center space-x-2">
                            {item.redeemedWithPoints ? (
                              <>
                                <span className="line-through text-gray-400">
                                  ₱
                                  {(item.product_price ?? 0).toLocaleString(
                                    "en-US"
                                  )}
                                </span>
                                <span className="text-green-900">₱0</span>
                              </>
                            ) : (
                              <span className="text-green-900">
                                ₱
                                {(item.product_price ?? 0).toLocaleString(
                                  "en-US"
                                )}
                              </span>
                            )}
                          </p>

                          {/* Remove button */}
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-red-400 bg-red-100 text-red-600 hover:bg-red-200"
                            onClick={() =>
                              removeItemFromCart(item.cart_item_id)
                            }
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Redeem / Cancel Buttons */}
                    <div className="mt-2">
                      {!item.redeemedWithPoints &&
                        isRedeemableProduct(item.product_name ?? "") && (
                          <button
                            className={`px-3 py-1 rounded text-sm ${
                              canRedeem(item)
                                ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!canRedeem(item)}
                            onClick={() =>
                              markRedeemItem(item.cart_item_id, authUser.points)
                            }
                          >
                            Redeem with Points (
                            {(
                              (getRedeemablePointCost(
                                item.product_name ?? ""
                              ) ?? 0) * item.quantity
                            ).toLocaleString()}{" "}
                            pts )
                          </button>
                        )}
                      {item.redeemedWithPoints && (
                        <button
                          className="px-3 py-1 mt-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                          onClick={() => cancelRedeemItem(item.cart_item_id)}
                        >
                          Cancel Redemption
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT COLUMN - Order Summary */}
              <div>
                <div className="bg-white rounded-2xl shadow-md flex flex-col h-full">
                  <div className="p-6 flex-1">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex justify-between">
                        <span>
                          Subtotal ({cart.length}{" "}
                          {cart.length === 1 ? "item" : "items"})
                        </span>
                        <span className="text-green-900">
                          ₱{subtotal.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="text-green-900">
                          ₱{shippingFee.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Platform Fee ({Math.round(platformFeeRate * 100)}%)
                        </span>
                        <span className="text-green-900">
                          ₱{platformFee.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-green-900">
                          ₱{total.toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    className="w-full flex items-center justify-center bg-green-900 hover:bg-green-800 text-white font-semibold py-4 rounded-b-2xl transition"
                    onClick={handleProceedToCheckout}
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="20" r="1" fill="currentColor" />
                      <circle cx="18" cy="20" r="1" fill="currentColor" />
                    </svg>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
