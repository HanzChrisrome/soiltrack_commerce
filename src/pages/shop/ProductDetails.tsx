import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../widgets/Navbar";
import { useShopStore } from "../../store/useShopStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { Product } from "../../models/product";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, fetchProducts, addItemToCart, productLoading } =
    useShopStore();
  const { authUser } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      if (products.length > 0) {
        const found = products.find((p) => p.product_id === id);
        if (found) {
          setProduct(found);
          return;
        }
      }

      await fetchProducts();
      const found = useShopStore
        .getState()
        .products.find((p) => p.product_id === id);
      if (found) setProduct(found);
    };

    loadProduct();
  }, [id, products, fetchProducts]);

  const handleAddToCart = async () => {
    if (!authUser?.user_id) {
      alert("You must be logged in to add items to the cart.");
      return;
    }

    if (!product?.product_id) return;

    try {
      await addItemToCart(authUser.user_id, product.product_id, quantity);
      alert("Added to cart!");
      navigate("/cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (productLoading || !product) {
    return <p className="text-center mt-20">Loading product...</p>;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 mt-16">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={`http://localhost:5000/${product.product_image}`}
                  alt={product.product_name}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="flex gap-3 mt-4">
                {[1, 2, 3].map((thumb) => (
                  <div
                    key={thumb}
                    className="border rounded-lg w-24 h-24 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-600"
                  >
                    <img
                      src={`http://localhost:5000/${product.product_image}`}
                      alt={`Thumbnail ${thumb}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {product.product_name}
              </h1>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <span className="font-semibold">Category</span>
                <span className="mx-2">:</span>
                <span className="font-bold text-green-900">
                  {product.product_category}
                </span>
              </div>

              <div className="inline-block bg-green-100 text-green-700 font-bold text-2xl px-6 py-2 rounded-full mb-6">
                ₱{product.product_price.toFixed(2)}
              </div>

              <div className="border-t border-b py-4 mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-semibold">Shipping:</span>
                  <span className="text-gray-600">Nationwide</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Guarantee:</span>
                  <span className="text-gray-600">Shopping Guarantee</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Quantity:</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 border rounded-lg"
                  >
                    -
                  </button>
                  <span className="px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 border rounded-lg"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">
                    Stock: {product.product_quantity}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="bg-green-100 text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-200"
                >
                  Add to Cart
                </button>
                <button className="bg-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Product Specifications</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="font-semibold">Category:</div>
              <div>{product.product_category}</div>

              <div className="font-semibold">Stock:</div>
              <div>{product.product_quantity}</div>

              <div className="font-semibold">Brand:</div>
              <div>Antechors Planters</div>

              <div className="font-semibold">Ships from:</div>
              <div>{product.user_province || "Philippines"}</div>
            </div>

            <h2 className="text-xl font-bold mt-10 mb-4">
              Product Description
            </h2>
            <p className="text-gray-700">{product.product_description}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
