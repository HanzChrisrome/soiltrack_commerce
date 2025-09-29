import { useEffect, useState } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";

const ViewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const updated = await productService.updateProduct(
        editingProduct,
        imageFile || undefined
      );

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.product_id === updated.product_id ? updated : p))
      );

      setEditingProduct(null);
      setImageFile(null);
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
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
                    onClick={() => handleEdit(p)}
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

      {/* ✅ Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editingProduct.product_name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    product_name: e.target.value,
                  })
                }
                placeholder="Product Name"
                className="input input-bordered w-full"
              />
              <select
                value={editingProduct.product_category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    product_category: e.target
                      .value as Product["product_category"],
                  })
                }
                className="select select-bordered w-full"
              >
                <option>Insecticide</option>
                <option>Herbicide</option>
                <option>Pesticide</option>
                <option>Molluscicide</option>
                <option>Fertilizer</option>
              </select>
              <input
                type="number"
                value={editingProduct.product_price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    product_price: Number(e.target.value),
                  })
                }
                placeholder="Price"
                className="input input-bordered w-full"
              />
              <input
                type="number"
                value={editingProduct.product_quantity}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    product_quantity: Number(e.target.value),
                  })
                }
                placeholder="Quantity"
                className="input input-bordered w-full"
              />
              <textarea
                value={editingProduct.product_description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    product_description: e.target.value,
                  })
                }
                placeholder="Description"
                className="textarea textarea-bordered w-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
                className="file-input w-full"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProducts;
