// src/pages/shop/Cart.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShopStore } from "../../store/useShopStore";
import { useAuthStore } from "../../store/useAuthStore";
import { checkoutService } from "../../services/checkoutService";
import Navbar from "../../widgets/Navbar";
import {
  isRedeemableProduct,
  getRedeemablePointCost,
} from "../../models/redeemableProducts";
import { X, Minus, Plus, Package } from "lucide-react";
import Footer from "../../widgets/Footer";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/Sandy Loading.json";

const Cart = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const {
    cart,
    fetchCart,
    cartLoading,
    updateItemQuantity,
    removeItemFromCart,
    redeemItemWithPoints: markRedeemItem,
    cancelRedeemItem,
    clearCart,
  } = useShopStore();

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">(
    "ONLINE"
  );

  useEffect(() => {
    if (authUser) fetchCart(authUser.user_id);
  }, [authUser, fetchCart]);

  if (cartLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <Lottie
          loop
          animationData={loadingAnimation}
          play
          style={{ width: 150, height: 150 }}
        />
      </div>
    );

  const subtotal = cart.reduce((sum, item) => {
    const price =
      item.redeemedWithPoints && item.pointsCost ? 0 : item.product_price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = cart.length > 0 ? 100 : 0;

  let platformFeeRate = 0.05;
  if (subtotal < 2000) platformFeeRate = 0.07;
  else if (subtotal >= 10000) platformFeeRate = 0.03;

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
        product_id: null, // COD-friendly placeholder
        product_name: "Shipping Fee",
        product_price: shippingFee,
        quantity: 1,
      },
      {
        product_id: null, // COD-friendly placeholder
        product_name: `Platform Fee (${Math.round(platformFeeRate * 100)}%)`,
        product_price: platformFee,
        quantity: 1,
      },
    ];

    try {
      const res = await checkoutService.createPaymentLink(
        authUser.user_id,
        itemsPayload,
        total,
        paymentMethod
      );

      if (paymentMethod === "ONLINE" && res?.url) {
        window.location.href = res.url;
      } else if (paymentMethod === "COD") {
        clearCart();
        navigate(`/checkout/success`);
      } else {
        alert("Checkout failed.");
      }
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
      <div className="min-h-screen bg-gray-50 mt-8 pt-8">
        <div
          className="text-center mb-8 py-12"
          style={{
            backgroundImage: "url('/background shopping cart.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <Package className="w-12 h-12 text-white drop-shadow-lg" />
            <h1 className="text-5xl font-extrabold text-white">
              Shopping Cart
            </h1>
          </div>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-white">
            Review your selected items below. You can adjust quantities, redeem
            eligible products with your points, or remove items before
            proceeding to checkout.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl text-gray-600 mb-2">Your cart is empty</p>
              <p className="text-gray-500 mb-6">
                Add some products to get started!
              </p>
              <a
                href="/shop"
                className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT COLUMN - Cart Table */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  {/* Table Header */}
                  <div className="bg-orange-50 border-b border-orange-100">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4">
                      <div className="col-span-5 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Product
                      </div>
                      <div className="col-span-2 text-sm font-semibold text-gray-700 uppercase tracking-wider text-center">
                        Price
                      </div>
                      <div className="col-span-2 text-sm font-semibold text-gray-700 uppercase tracking-wider text-center">
                        Quantity
                      </div>
                      <div className="col-span-2 text-sm font-semibold text-gray-700 uppercase tracking-wider text-center">
                        Subtotal
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => {
                      const itemPrice = item.redeemedWithPoints
                        ? 0
                        : item.product_price ?? 0;
                      const itemSubtotal = itemPrice * item.quantity;

                      return (
                        <div
                          key={item.cart_item_id}
                          className="grid grid-cols-12 gap-4 px-6 py-6 hover:bg-gray-50 transition-colors"
                        >
                          {/* Product Info */}
                          <div className="col-span-5 flex items-center gap-4">
                            <button
                              onClick={() =>
                                removeItemFromCart(item.cart_item_id)
                              }
                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {item.product_image ? (
                              <img
                                src={`http://localhost:5000/${item.product_image}`}
                                alt={item.product_name ?? ""}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {item.product_name
                                  ? item.product_name.charAt(0).toUpperCase() +
                                    item.product_name.slice(1).toLowerCase()
                                  : "Unnamed product"}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Category: {item.product_category ?? "N/A"}
                              </p>
                              {item.redeemedWithPoints && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Redeemed with Points
                                  </span>
                                  <button
                                    className="ml-2 text-xs text-red-600 hover:text-red-800"
                                    onClick={() =>
                                      cancelRedeemItem(item.cart_item_id)
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              {!item.redeemedWithPoints &&
                                isRedeemableProduct(
                                  item.product_name ?? ""
                                ) && (
                                  <button
                                    className={`mt-2 px-2 py-1 rounded text-xs ${
                                      canRedeem(item)
                                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                    disabled={!canRedeem(item)}
                                    onClick={() =>
                                      markRedeemItem(
                                        item.cart_item_id,
                                        authUser.points
                                      )
                                    }
                                  >
                                    Redeem (
                                    {(
                                      (getRedeemablePointCost(
                                        item.product_name ?? ""
                                      ) ?? 0) * item.quantity
                                    ).toLocaleString()}{" "}
                                    pts)
                                  </button>
                                )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-2 flex items-center justify-center">
                            {item.redeemedWithPoints ? (
                              <div className="text-center">
                                <p className="text-gray-900 font-semibold">
                                  ₱0.00
                                </p>
                                <p className="text-xs text-gray-400 line-through">
                                  ₱{(item.product_price ?? 0).toFixed(2)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-900 font-semibold">
                                ₱{(item.product_price ?? 0).toFixed(2)}
                              </p>
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="col-span-2 flex items-center justify-center">
                            <div className="inline-flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() =>
                                  updateItemQuantity(
                                    item.cart_item_id,
                                    Math.max(item.quantity - 1, 1)
                                  )
                                }
                                className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="px-4 py-2 bg-gray-50 text-gray-900 font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateItemQuantity(
                                    item.cart_item_id,
                                    item.quantity + 1
                                  )
                                }
                                className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-2 flex items-center justify-center">
                            <p className="text-gray-900 font-bold">
                              ₱{itemSubtotal.toFixed(2)}
                            </p>
                          </div>

                          {/* Empty space for alignment */}
                          <div className="col-span-1"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Icons */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Free Shipping
                      </h3>
                      <p className="text-xs text-gray-500">
                        Free shipping for order above ₱100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Flexible Payment
                      </h3>
                      <p className="text-xs text-gray-500">
                        Pay with secure payment options
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <HeadphonesIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        24×7 Support
                      </h3>
                      <p className="text-xs text-gray-500">
                        We support online all days
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* RIGHT COLUMN - Order Summary */}

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Summary
                    </h2>
                  </div>

                  <div className="px-6 py-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Items</span>
                        <span className="text-gray-900 font-medium">
                          {cart.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900 font-medium">
                          ₱{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900 font-medium">
                          ₱{shippingFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Platform Fee</span>
                        <span className="text-gray-900 font-medium">
                          ₱{platformFee.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="mb-6">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Select Payment Method
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={paymentMethod}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "ONLINE" | "COD")
                        }
                      >
                        <option value="ONLINE">Online Payment</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                      </select>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        ₱{total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Cart;
