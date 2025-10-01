import { useEffect } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../widgets/Navbar";

const Cart = () => {
  const { authUser } = useAuthStore();
  const {
    cart,
    fetchCart,
    cartLoading,
    updateItemQuantity,
    removeItemFromCart,
  } = useShopStore();

  useEffect(() => {
    if (authUser?.user_id) fetchCart(authUser.user_id);
  }, [authUser, fetchCart]);

  if (!authUser) {
    return (
      <p className="text-center mt-20">Please log in to view your cart.</p>
    );
  }

  if (cartLoading) return <p className="text-center mt-20">Loading cart...</p>;

  const total = cart.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 mt-16">
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">My Cart</h1>

          {cart.length === 0 ? (
            <p className="text-center text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex items-center bg-white shadow rounded-lg p-4"
                >
                  {item.product_image && (
                    <img
                      src={`http://localhost:5000/${item.product_image}`}
                      alt={item.product_name}
                      className="h-20 w-20 object-cover rounded-md mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">
                      {item.product_name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ₱{item.product_price.toFixed(2)}
                    </p>

                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() =>
                          updateItemQuantity(
                            item.cart_item_id,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
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
                    <p className="font-bold text-green-600">
                      ₱{(item.product_price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      className="text-red-600 text-sm mt-2"
                      onClick={() => removeItemFromCart(item.cart_item_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-right mt-6">
                <h2 className="text-xl font-bold">
                  Total: ₱{total.toFixed(2)}
                </h2>
                <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
