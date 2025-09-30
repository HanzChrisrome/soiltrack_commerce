import { useEffect, useState } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";
import AddProduct from "./AddProduct";

const ViewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // for Edit
  const [addingProduct, setAddingProduct] = useState(false);

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
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(product_id);
      setProducts(products.filter((p) => p.product_id !== product_id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleSaveSuccess = (savedProduct: Product) => {
    if (
      savedProduct.product_id &&
      products.some((p) => p.product_id === savedProduct.product_id)
    ) {
      // ✅ Update existing
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === savedProduct.product_id ? savedProduct : p
        )
      );
    } else {
      // ✅ Add new
      setProducts((prev) => [...prev, savedProduct]);
    }
    setAddingProduct(false);
    setSelectedProduct(null);
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <button
          onClick={() => setAddingProduct(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Product
        </button>
      </div>

      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_name}</td>
                <td>{p.product_category}</td>
                <td>₱{p.product_price.toFixed(2)}</td>
                <td>{p.product_quantity}</td>
                <td>
                  {p.product_image && (
                    <img
                      src={`http://localhost:5000/${p.product_image}`}
                      alt={p.product_name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </td>
                <td>
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="btn btn-sm btn-warning mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.product_id!)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Add Product Modal */}
      {addingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[32rem]">
            <AddProduct
              onSuccess={handleSaveSuccess}
              onCancel={() => setAddingProduct(false)}
            />
          </div>
        </div>
      )}

      {/* ✅ Edit Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[32rem]">
            <AddProduct
              initialData={selectedProduct}
              onSuccess={handleSaveSuccess}
              onCancel={() => setSelectedProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProducts;
