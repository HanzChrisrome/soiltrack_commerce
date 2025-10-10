import { useEffect, useState, useMemo } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";
import AddProduct from "./AddProduct";
import {
  Search,
  Pencil,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/sparkels.json";

const ITEMS_PER_PAGE = 10;

const ViewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [status, setStatus] = useState("All Status");
  // sorting: column can be 'newest'|'price'|'stocks'
  const [sortColumn, setSortColumn] = useState<"newest" | "price" | "stocks">(
    "newest"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to convert to sentence case
  const toSentenceCase = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

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

  // Update product status inline (Active <-> Draft)
  const updateProductStatus = async (
    p: Product,
    newStatus: "Active" | "Draft"
  ) => {
    try {
      // For simplicity, map Active -> ensure quantity >=1, Draft -> set quantity to 0
      const updated: Product = {
        ...p,
        product_quantity:
          newStatus === "Active" ? Math.max(1, p.product_quantity ?? 1) : 0,
      };
      const saved = await productService.updateProduct(updated);
      setProducts((prev) =>
        prev.map((x) => (x.product_id === saved.product_id ? saved : x))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // ✅ Filter + sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((p) =>
        p.product_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "All Products" && category !== "Category") {
      result = result.filter((p) => p.product_category === category);
    }

    if (status !== "All Status" && status !== "Status") {
      if (status === "Active") {
        result = result.filter((p) => (p.product_quantity ?? 0) > 0);
      } else if (status === "Draft") {
        result = result.filter((p) => (p.product_quantity ?? 0) === 0);
      }
    }

    // sorting by column + direction
    if (sortColumn === "newest") {
      result = result.sort(
        (a, b) =>
          new Date(b.created_at ?? "").getTime() -
          new Date(a.created_at ?? "").getTime()
      );
    } else if (sortColumn === "price") {
      result = result.sort((a, b) => {
        const diff = (a.product_price ?? 0) - (b.product_price ?? 0);
        return sortDirection === "asc" ? diff : -diff;
      });
    } else if (sortColumn === "stocks") {
      const diff = (a: Product, b: Product) =>
        (a.product_quantity ?? 0) - (b.product_quantity ?? 0);
      result = result.sort((a, b) =>
        sortDirection === "asc" ? diff(a, b) : -diff(a, b)
      );
    }

    return result;
  }, [products, search, category, status, sortColumn, sortDirection]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Lottie
          loop
          animationData={loadingAnimation}
          play
          style={{ width: 150, height: 150 }}
        />
      </div>
    );
  }

  return (
    <div className="">
      <div className="px-8 mx-auto">
        {/* Top toolbar */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 text-transparent bg-clip-text">
          Products
        </h1>
        {/* Secondary filters row */}
        <div className="bg-white rounded-lg p-4 mb-2 shadow-sm flex items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                placeholder="Search product"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            >
              <option value="Category">Category</option>
              <option value="All Products">All Products</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Herbicide">Herbicide</option>
              <option value="Pesticide">Pesticide</option>
              <option value="Insecticide">Insecticide</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            >
              <option value="Status">Status</option>
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <button
            onClick={() => setAddingProduct(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-700 to-green-900 text-white px-4 py-2 rounded-md hover:from-green-800 hover:to-green-950 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Table container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Original Price
                  </th>
                  <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                    <button
                      onClick={() => {
                        if (sortColumn === "price")
                          setSortDirection((d) =>
                            d === "asc" ? "desc" : "asc"
                          );
                        else setSortColumn("price");
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors"
                    >
                      Selling Price
                      {sortColumn === "price" ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortColumn === "stocks")
                          setSortDirection((d) =>
                            d === "asc" ? "desc" : "asc"
                          );
                        else setSortColumn("stocks");
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors"
                    >
                      Stocks
                      {sortColumn === "stocks" ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-gray-500 italic"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, index) => {
                    const profitMargin =
                      p.orig_price && p.orig_price > 0
                        ? ((p.product_price - p.orig_price) / p.orig_price) *
                          100
                        : null;

                    return (
                      <tr
                        key={p.product_id}
                        className={`hover:bg-gray-100 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-2.5 flex items-center gap-3">
                          {p.product_image ? (
                            <img
                              src={`http://localhost:5000/${p.product_image}`}
                              alt={p.product_name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {toSentenceCase(p.product_name)}
                            </div>
                            <div className="text-xs text-gray-400">
                              SKU: {p.product_id?.substring(0, 8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 text-sm">
                          {p.orig_price ? `₱${p.orig_price.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-gray-900 text-sm">
                          ₱{p.product_price?.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 text-sm">
                          {p.product_quantity ?? 0}
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={
                              (p.product_quantity ?? 0) > 0 ? "Active" : "Draft"
                            }
                            onChange={(e) =>
                              updateProductStatus(
                                p,
                                e.target.value as "Active" | "Draft"
                              )
                            }
                            className="px-2.5 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                          >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-center">
                            <button
                              onClick={() => setSelectedProduct(p)}
                              className="px-2.5 py-1 rounded-md bg-green-700 text-white hover:bg-green-800 flex items-center gap-1.5 text-xs transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[2.5rem] px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-green-700 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

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
                  {deletingProduct?.product_name}
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
                  onClick={() =>
                    deletingProduct && handleDelete(deletingProduct.product_id)
                  }
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
