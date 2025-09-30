import { useEffect, useState } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading products...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Shop</h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-600">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.product_id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col"
            >
              {p.product_image && (
                <img
                  src={`http://localhost:5000/${p.product_image}`}
                  alt={p.product_name}
                  className="h-40 w-full object-cover rounded-md mb-3"
                />
              )}
              <h2 className="text-lg font-semibold">{p.product_name}</h2>
              <p className="text-sm text-gray-500">{p.product_category}</p>
              <p className="text-green-600 font-bold mt-2">
                ₱{p.product_price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Stock: {p.product_quantity}
              </p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {p.product_description}
              </p>

              <button
                className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => alert(`Added ${p.product_name} to cart`)}
                disabled={p.product_quantity <= 0}
              >
                {p.product_quantity > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
