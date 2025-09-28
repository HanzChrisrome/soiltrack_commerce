import { useState } from "react";
import { useProductsStore } from "../../store/useProductsStore";
import type { Product } from "../../models/product";

export default function AdminAddProduct() {
  const { addProduct, loading, error } = useProductsStore();

  const [form, setForm] = useState<Product>({
    product_name: "",
    product_category: "Insecticide",
    product_price: 0,
    product_quantity: 0,
    product_description: "",
  });

  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "product_price" || name === "product_quantity"
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(undefined);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.product_name || form.product_price <= 0) {
      alert("Please enter valid product details.");
      return;
    }

    try {
      await addProduct(form, imageFile); // This will send the image file to backend
      alert("Product added successfully!");

      // Reset form
      setForm({
        product_name: "",
        product_category: "Insecticide",
        product_price: 0,
        product_quantity: 0,
        product_description: "",
      });
      setImageFile(undefined);
      setImagePreview(null);
    } catch {
      // errors handled in store
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

      {error && (
        <p className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="product_category"
            value={form.product_category}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
          >
            <option>Insecticide</option>
            <option>Herbicide</option>
            <option>Pesticide</option>
            <option>Molluscicide</option>
            <option>Fertilizer</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            name="product_quantity"
            min={0}
            value={form.product_quantity}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (₱)
          </label>
          <input
            type="number"
            step="0.01"
            name="product_price"
            min={0}
            value={form.product_price}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="product_description"
            value={form.product_description}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded border"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset form?")) {
                setForm({
                  product_name: "",
                  product_category: "Insecticide",
                  product_price: 0,
                  product_quantity: 0,
                  product_description: "",
                });
                setImageFile(undefined);
                setImagePreview(null);
              }
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
