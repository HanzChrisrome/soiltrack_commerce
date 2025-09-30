import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../widgets/Navbar";
import { productService } from "../../services/productService";
import { cartService } from "../../services/cartService";
import { useAuthStore } from "../../store/useAuthStore";
import type { Product } from "../../models/product";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!authUser?.user_id) {
      alert("You must be logged in to add items to the cart.");
      return;
    }

    if (!product?.product_id) return;

    try {
      await cartService.addToCart(authUser.user_id, product.product_id, 1);
      alert("Added to cart!");
      navigate("/cart"); 
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading product...</p>;
  if (!product) return <p className="text-center mt-10">Product not found.</p>;

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          {product.product_image && (
            <img
              src={`http://localhost:5000/${product.product_image}`}
              alt={product.product_name}
              className="w-full h-96 object-cover rounded-lg shadow"
            />
          )}

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
            <p className="text-gray-600 mb-4">{product.product_category}</p>
            <p className="text-2xl text-green-600 font-semibold mb-4">
              ₱{product.product_price.toFixed(2)}
            </p>
            <p className="mb-4">{product.product_description}</p>
            <p className="text-sm text-gray-500 mb-4">
              Stock: {product.product_quantity}
            </p>

            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              onClick={handleAddToCart}
              disabled={product.product_quantity <= 0}
            >
              {product.product_quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
