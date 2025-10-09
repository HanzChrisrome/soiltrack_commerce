import { useEffect, useState, useMemo } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";
import AddProduct from "./AddProduct";
import { Search, Pencil, Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 15;

const ViewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stock, setStock] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product_id: string) => {
    try {
      await productService.deleteProduct(product_id);
      setProducts(products.filter((p) => p.product_id !== product_id));
      setDeletingProduct(null);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleSaveSuccess = (savedProduct: Product) => {
    if (
      savedProduct.product_id &&
      products.some((p) => p.product_id === savedProduct.product_id)
    ) {
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === savedProduct.product_id ? savedProduct : p
        )
      );
    } else {
      setProducts((prev) => [...prev, savedProduct]);
    }
    setAddingProduct(false);
    setSelectedProduct(null);
  };

  // ✅ Filter + sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((p) =>
        p.product_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "All") {
      result = result.filter((p) => p.product_category === category);
    }

    if (stock !== "All") {
      result =
        stock === "In Stock"
          ? result.filter((p) => (p.product_quantity ?? 0) > 0)
          : result.filter((p) => (p.product_quantity ?? 0) === 0);
    }

    if (sortBy === "Newest") {
      result = result.sort(
        (a, b) =>
          new Date(b.created_at ?? "").getTime() -
          new Date(a.created_at ?? "").getTime()
      );
    } else if (sortBy === "Price: Low → High") {
      result = result.sort(
        (a, b) => (a.product_price ?? 0) - (b.product_price ?? 0)
      );
    } else if (sortBy === "Price: High → Low") {
      result = result.sort(
        (a, b) => (b.product_price ?? 0) - (a.product_price ?? 0)
      );
    }

    return result;
  }, [products, search, category, stock, sortBy]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <p className="text-center mt-10">Loading products...</p>;

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-7xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
          <button
            onClick={() => setAddingProduct(true)}
            className="px-5 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition"
          >
            + Add Product
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option>All</option>
            <option>Fertilizer</option>
            <option>Herbicide</option>
            <option>Pesticide</option>
          </select>

          <select
            value={stock}
            onChange={(e) => {
              setStock(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option>All</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option>Newest</option>
            <option>Price: Low → High</option>
            <option>Price: High → Low</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Image
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.product_id}>
                    <td className="px-4 py-3">{p.product_name}</td>
                    <td className="px-4 py-3">{p.product_category}</td>
                    <td className="px-4 py-3 font-medium">
                      ₱
                      {p.product_price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {p.product_quantity.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3">
                      {p.product_image && (
                        <img
                          src={`http://localhost:5000/${p.product_image}`}
                          alt={p.product_name ?? "Product"}
                          className="h-12 w-12 object-cover rounded-md border"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-3">
                      {/* Edit button */}
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#FFAE00] bg-[#FFEDA4] hover:bg-[#FFD76B]"
                      >
                        <Pencil className="w-5 h-5 text-[#FFAE00]" />
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => setDeletingProduct(p)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#FF0000] bg-[#FFA8A8] hover:bg-[#FF7A7A]"
                      >
                        <Trash2 className="w-5 h-5 text-[#FF0000]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-green-900 text-white" : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Add Product Modal */}
        {addingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex">
            <div className="ml-auto h-full w-full max-w-lg transform translate-x-0 transition-transform duration-300 ease-out">
              <AddProduct
                onSuccess={handleSaveSuccess}
                onCancel={() => setAddingProduct(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex">
            <div className="ml-auto h-full w-full max-w-lg transform translate-x-0 transition-transform duration-300 ease-out">
              <AddProduct
                initialData={selectedProduct}
                onSuccess={handleSaveSuccess}
                onCancel={() => setSelectedProduct(null)}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[24rem] shadow-lg text-center">
              <h2 className="text-lg font-bold mb-4">Delete Product</h2>
              <p className="mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deletingProduct.product_name}
                </span>
                ?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingProduct.product_id!)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProducts;
