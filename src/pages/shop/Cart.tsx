import { useEffect, useState } from "react";
import { cartService } from "../../services/cartService";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../widgets/Navbar";

interface CartItem {
  cart_item_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  product_price: number;
  product_image: string | null;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthStore();

  const fetchCart = async () => {
    if (!authUser) return;
    try {
      const data = await cartService.getCart(authUser.user_id);
      setCartItems(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [authUser]);

  const handleUpdateQuantity = async (cart_item_id: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await cartService.updateQuantity(cart_item_id, quantity);
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleRemoveItem = async (cart_item_id: string) => {
    try {
      await cartService.removeItem(cart_item_id);
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  if (!authUser) {
    return <p className="text-center mt-10">Please log in to view your cart.</p>;
  }

  if (loading) return <p className="text-center mt-10">Loading cart...</p>;

  const total = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">My Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
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
                  <h2 className="text-lg font-semibold">{item.product_name}</h2>
                  <p className="text-sm text-gray-500">
                    ₱{item.product_price.toFixed(2)}
                  </p>

                  <div className="flex items-center mt-2 space-x-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() =>
                        handleUpdateQuantity(item.cart_item_id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() =>
                        handleUpdateQuantity(item.cart_item_id, item.quantity + 1)
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
                    onClick={() => handleRemoveItem(item.cart_item_id)}
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
    </>
  );
};

export default Cart;
