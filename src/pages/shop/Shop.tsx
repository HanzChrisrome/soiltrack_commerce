import type { Product } from "../../models/product";
import { useEffect, useState } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../widgets/Navbar";
import SearchFilter from "../../widgets/SearchFilter";
import ProductCard from "../../widgets/ProductCard";
import Footer from "../../widgets/Footer";
import { ShoppingCart } from "lucide-react";

const Shop = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, fetchProducts, addItemToCart, productLoading } =
    useShopStore();
  const { authUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedProduct]);

  const handleAddToCart = async (product_id: string) => {
    if (!authUser) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      await addItemToCart(authUser.user_id, product_id, 1);

      // ✅ Show notification for 1 second
      setShowAddedModal(true);
      setTimeout(() => setShowAddedModal(false), 1200);
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  let filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let matchesCategory = false;
    if (selectedCategory === "All Categories") {
      matchesCategory = true;
    } else if (selectedCategory === "Points") {
      matchesCategory = !!p.is_point_product;
    } else {
      matchesCategory =
        p.product_category?.toLowerCase() === selectedCategory.toLowerCase();
    }
    const matchesMinPrice = minPrice === null || p.product_price >= minPrice;
    const matchesMaxPrice = maxPrice === null || p.product_price <= maxPrice;
    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });

  // Sort logic
  if (sortBy === "price-asc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.product_price - b.product_price
    );
  } else if (sortBy === "price-desc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.product_price - a.product_price
    );
  } else if (sortBy === "name-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      a.product_name.localeCompare(b.product_name)
    );
  } else if (sortBy === "name-desc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      b.product_name.localeCompare(a.product_name)
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts: Product[] = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <>
      <Navbar />

      {/* Hero Banner */}
      <div className="min-h-screen bg-gray-50 mt-14">
        <div
          className="relative py-10 md:py-28 mb-12"
          style={{
            backgroundImage: "url('/shop image.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                Buy products and{" "}
                <span className="text-yellow-300">earn points</span>
              </h1>
              <div className="max-w-xl">
                <p className="mb-5 text-lg text-white/90">
                  Shop for your farm essentials and earn points with every
                  purchase. Use your points to get discounts or buy other
                  products right here!
                </p>
              </div>
              <button className="bg-yellow-300 text-green-900 font-bold px-6 py-3 rounded-lg shadow hover:bg-yellow-400 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Category filter chips and sort */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              "All Categories",
              "Fertilizer",
              "Herbicide",
              "Fungicide",
              "Insecticide",
              "Pesticide",
              "Molluscicide",
              "Points",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat
                    ? "bg-green-700 text-white border-green-700 shadow"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">
              Sort by:
            </label>
            <select
              className="border border-gray-200 rounded px-2 py-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {/* Content wrapper */}
        <div className="max-w-6xl mx-auto flex mt-6 gap-6 px-4">
          <div className="flex-1 pb-10">
            {productLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative bg-white rounded-2xl shadow p-4 min-h-[260px] animate-pulse flex flex-col"
                  >
                    <div className="absolute top-3 left-3 h-6 w-24 bg-gray-200 rounded-full" />
                    <div className="h-28 w-full bg-gray-200 rounded-xl mb-3" />
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
                    <div className="flex items-end gap-2 mt-auto pt-2">
                      <div className="h-6 w-20 bg-gray-200 rounded" />
                      <div className="h-4 w-10 bg-gray-100 rounded" />
                    </div>
                    <div className="h-9 w-16 bg-gray-200 rounded-full absolute bottom-4 right-4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-gray-600">No products found.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedProducts.map((product: Product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      onAddToCart={() => handleAddToCart(product.product_id)}
                      onView={(product: Product) => setSelectedProduct(product)}
                    />
                  ))}
                </div>
                {/* Product Modal (outside grid) */}
                {selectedProduct && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-0 relative animate-fadeIn grid grid-cols-1 md:grid-cols-2">
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold z-10"
                        onClick={() => setSelectedProduct(null)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      {/* Image section */}
                      <div className="flex items-center justify-center bg-gray-50 rounded-l-2xl h-full min-h-[400px]">
                        {selectedProduct.product_image && (
                          <img
                            src={`http://localhost:5000/${selectedProduct.product_image}`}
                            alt={selectedProduct.product_name}
                            className="object-contain h-[90%] w-auto max-h-[500px] mx-auto"
                            style={{ maxHeight: "90vh" }}
                          />
                        )}
                      </div>
                      {/* Details section */}
                      <div className="flex flex-col justify-between p-8 h-full">
                        <div>
                          <div className="flex justify-start items-center gap-3">
                            <h2 className="text-2xl font-bold mb-1 text-gray-900">
                              {selectedProduct.product_name
                                .toLowerCase()
                                .replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                                  letter.toUpperCase()
                                )}
                            </h2>
                            <div className="text-sm text-gray-500 mb-3">
                              <span className="inline-block rounded-full border border-gray-300 px-3 py-1 bg-gray-100">
                                {selectedProduct.product_category}
                              </span>
                            </div>
                          </div>

                          {selectedProduct.product_description && (
                            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                              {selectedProduct.product_description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="text-green-700 font-bold text-2xl">
                              ₱{selectedProduct.product_price.toFixed(2)}
                            </span>

                            {selectedProduct.orig_price &&
                              selectedProduct.orig_price >
                                selectedProduct.product_price && (
                                <span className="text-gray-400 line-through text-lg">
                                  ₱{selectedProduct.orig_price.toFixed(2)}
                                </span>
                              )}

                            {selectedProduct.is_point_product && (
                              <span className="ml-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Can be bought with Points:{" "}
                                {selectedProduct.points_price ?? 0}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          className="w-full bg-gradient-to-r from-green-800 via-green-700 to-green-600 hover:from-green-900 hover:to-green-700 text-white font-semibold py-3 rounded-lg text-lg transition mb-2 flex items-center justify-center gap-2"
                          onClick={() => {
                            handleAddToCart(selectedProduct.product_id);
                            setSelectedProduct(null);
                          }}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((p: number) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded disabled:opacity-50 flex items-center justify-center"
                      aria-label="Previous page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-1 rounded ${
                          currentPage === i + 1
                            ? "bg-green-700 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p: number) =>
                          Math.min(totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded disabled:opacity-50 flex items-center justify-center"
                      aria-label="Next page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* ✅ Animated Toast Notification */}
      <div
        className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          showAddedModal
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-green-700 text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium">
          <span className="text-lg">✅</span>
          <span>Item added to cart</span>
        </div>
      </div>
    </>
  );
};

export default Shop;
