/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/shop/CheckoutSuccess.tsx
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
  const clearCart = useShopStore((state) => state.clearCart);
  const hasFinalized = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const order_ref = queryParams.get("ref");
    const checkout_url = window.location.href;

    const finalizeOrder = async () => {
      if (!authUser?.user_id || !order_ref || hasFinalized.current) return;
      hasFinalized.current = true;

      try {
        const cartItems = useShopStore.getState().cart;

        // 1️⃣ Finalize the order
        await axios.post("http://localhost:5000/api/orders/finalize", {
          user_id: authUser.user_id,
          order_ref,
          checkout_url,
          cartItems,
        });

        // 2️⃣ Deduct points for redeemed items
        const redeemedPoints = cartItems
          .filter((i) => i.redeemedWithPoints)
          .reduce((sum, i) => sum + (i.pointsCost ?? 0), 0);

        if (redeemedPoints > 0) {
          // Deduct points in the backend
          await axios.post("http://localhost:5000/api/points/deduct", {
            user_id: authUser.user_id,
            points: redeemedPoints,
          });

          // Deduct points in the frontend store safely
          setAuthUser({
            ...authUser,
            points: Math.max((authUser.points ?? 0) - redeemedPoints, 0),
          });
        }

        // 3️⃣ Clear cart
        clearCart();
      } catch (err: any) {
        console.error(
          "Failed to finalize order or deduct points:",
          err.response?.data || err.message
        );
      }
    };

    finalizeOrder();
  }, [authUser, location.search, clearCart, setAuthUser]);

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
          Payment Successful
        </h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase! Your order has been confirmed.
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
