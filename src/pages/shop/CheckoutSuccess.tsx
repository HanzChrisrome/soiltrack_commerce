// src/pages/shop/CheckoutSuccess.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShopStore } from "../../store/useShopStore";
import Navbar from "../../widgets/Navbar";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const clearCart = useShopStore((state) => state.clearCart);

  useEffect(() => {
    clearCart(); // empty cart after successful payment
  }, [clearCart]);

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
        <button
          onClick={() => navigate("/shop")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    </>
  );
};

export default CheckoutSuccess;
