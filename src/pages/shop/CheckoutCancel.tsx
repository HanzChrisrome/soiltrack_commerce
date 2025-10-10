// src/pages/shop/CheckoutCancel.tsx
import { useNavigate } from "react-router-dom";
import Navbar from "../../widgets/Navbar";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-4">
          Payment Cancelled ❌
        </h1>
        <p className="text-gray-700 mb-6">
          Your payment was not completed. You can try again or review your cart.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700"
        >
          Back to Cart
        </button>
      </div>
    </>
  );
};

export default CheckoutCancel;
