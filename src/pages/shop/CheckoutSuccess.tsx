/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useShopStore } from "../../store/useShopStore";
import Navbar from "../../widgets/Navbar";
import axios from "axios";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/Payment Success.json";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, setAuthUser } = useAuthStore();
  const { clearCart, fetchCart } = useShopStore();
  const hasFinalized = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const order_ref = queryParams.get("ref");

    const finalizeOrder = async () => {
      if (!authUser?.user_id || hasFinalized.current) return;
      hasFinalized.current = true;

      try {
        // IMPORTANT: Fetch cart first before trying to access it
        await fetchCart(authUser.user_id);

        // Now get cart items from store after fetching
        const cartItems = useShopStore.getState().cart;
        if (!cartItems.length) {
          console.warn("Cart is empty, nothing to finalize");
          return;
        }

        // For ONLINE payment: order_ref comes from URL (payment was successful)
        // For COD: order_ref was already created when checkout was initiated
        if (!order_ref) {
          console.error("No order reference found");
          return;
        }

        // Retrieve checkout summary from localStorage
        const checkoutSummaryStr = localStorage.getItem("checkout_summary");
        if (!checkoutSummaryStr) {
          console.error("No checkout summary found in localStorage");
          console.warn(
            "Attempting to create order without checkout summary (legacy flow)"
          );
          // Fallback: If no summary, backend will compute from cart items
        }

        const checkoutSummary = checkoutSummaryStr
          ? JSON.parse(checkoutSummaryStr)
          : {};

        console.log("📦 Checkout Summary:", checkoutSummary);

        // Create the order in the database (this is when it actually gets saved)
        const payload = {
          user_id: authUser.user_id,
          order_ref: order_ref,
          checkout_url: window.location.href,
          payment_method: checkoutSummary.paymentMethod || "COD", // Use stored payment method
          // Always include checkout summary data if available
          total:
            checkoutSummary.total !== undefined
              ? checkoutSummary.total
              : undefined,
          subtotal:
            checkoutSummary.subtotal !== undefined
              ? checkoutSummary.subtotal
              : undefined,
          shippingFee:
            checkoutSummary.shippingFee !== undefined
              ? checkoutSummary.shippingFee
              : undefined,
          platformFee:
            checkoutSummary.platformFee !== undefined
              ? checkoutSummary.platformFee
              : undefined,
          platformFeeRate:
            checkoutSummary.platformFeeRate !== undefined
              ? checkoutSummary.platformFeeRate
              : undefined,
          redeemedItems: checkoutSummary.redeemedItems || [], // Pass which items were redeemed
        };

        console.log("📤 Sending payload to backend:", payload);

        await axios.post("http://localhost:5000/api/orders/finalize", payload);

        // Clean up localStorage after successful order creation
        localStorage.removeItem("checkout_summary");

        // Deduct points for redeemed items (if applicable)
        const redeemedPoints = cartItems
          .filter((i) => i.redeemedWithPoints)
          .reduce((sum, i) => sum + (i.pointsCost ?? 0), 0);

        if (redeemedPoints > 0) {
          await axios.post("http://localhost:5000/api/points/deduct", {
            user_id: authUser.user_id,
            points: redeemedPoints,
          });

          setAuthUser({
            ...authUser,
            points: Math.max((authUser.points ?? 0) - redeemedPoints, 0),
          });
        }

        // Clear cart from database and local state
        await clearCart(authUser.user_id);
      } catch (err: any) {
        console.error(
          "Failed to finalize order or deduct points:",
          err.response?.data || err.message
        );
      }
    };

    finalizeOrder();
  }, [authUser, location.search, clearCart, fetchCart, setAuthUser]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="w-96 h-96">
          <Lottie
            loop
            animationData={loadingAnimation}
            play
            style={{ padding: 0 }}
          />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Order Confirmed
        </h1>
        <p className="text-gray-700 mb-6 text-center">
          Thank you for your purchase! Your order has been confirmed.
          <span> You can track it in your Orders page.</span>
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/shop")}
            className="bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-white px-6 py-2 rounded-lg shadow hover:from-green-800 hover:to-green-950 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="border border-green-600 text-green-700 px-6 py-2 rounded-lg shadow hover:bg-green-50"
          >
            View My Orders
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutSuccess;
