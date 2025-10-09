import { useEffect, useState } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../widgets/Navbar";
import SearchFilter from "../../widgets/SearchFilter";
import ProductCard from "../../widgets/ProductCard";

const Shop = () => {
  const { products, fetchProducts, addItemToCart, productLoading } =
    useShopStore();
  const { authUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (product_id: string) => {
    if (!authUser) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      await addItemToCart(authUser.user_id, product_id, 1);
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  // Simple filter by name
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />

      {/* Search bar */}
      <div className="sticky top-16 z-10 bg-gray-200 border-b">
        <div className="max-w-6xl mx-auto flex items-center gap-2 px-4 py-4">
          <select className="border rounded px-2 py-2 bg-white">
            <option>All Categories</option>
            <option>Insecticide</option>
            <option>Herbicide</option>
            <option>Pesticide</option>
            <option>Molluscicide</option>
            <option>Fertilizer</option>
          </select>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600">
            Search
          </button>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="min-h-screen bg-gray-50 mt-16">
        <div className="max-w-6xl mx-auto flex mt-6 gap-6 px-4">
          {/* Sidebar filter */}
          <div className="w-1/4 hidden md:block">
            <SearchFilter />
          </div>

          {/* Main product grid */}
          <div className="flex-1 pb-10">
            {productLoading ? (
              <p className="text-center mt-20">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-gray-600">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product.product_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
