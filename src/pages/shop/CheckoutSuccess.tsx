import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useShopStore } from "../../store/useShopStore";
import Navbar from "../../widgets/Navbar";
import axios from "axios";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const clearCart = useShopStore((state) => state.clearCart);
  const hasFinalized = useRef(false);

  useEffect(() => {
    const finalizeOrder = async () => {
      if (!authUser?.user_id || hasFinalized.current) return;
      hasFinalized.current = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/orders/finalize",
          { user_id: authUser.user_id }
        );
        console.log("✅ Finalize response:", res.data);
        clearCart();
      } catch (err) {
        console.error("❌ Failed to finalize order:", err);
      }
    };

    finalizeOrder();
  }, [authUser, clearCart]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase! Your order has been confirmed.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/shop")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/my-orders")}
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
