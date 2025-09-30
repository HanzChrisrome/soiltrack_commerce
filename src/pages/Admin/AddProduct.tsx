import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";

interface AddProductProps {
  initialData?: Product | null; // if passed → Edit mode
  onSuccess: (savedProduct: Product) => void;
  onCancel: () => void;
}

export default function AddProduct({
  initialData,
  onSuccess,
  onCancel,
}: AddProductProps) {
  const [form, setForm] = useState<Product>({
    product_name: "",
    product_category: "Insecticide",
    product_price: 0,
    product_quantity: 0,
    product_description: "",
  });

  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Populate form if editing
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      if (initialData.product_image) {
        setImagePreview(`http://localhost:5000/${initialData.product_image}`);
      }
    }
  }, [initialData]);

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
      setLoading(true);
      let savedProduct: Product;

      if (initialData?.product_id) {
        // ✅ Update
        savedProduct = await productService.updateProduct(form, imageFile);
      } else {
        // ✅ Add
        savedProduct = await productService.addProduct(form, imageFile);
      }

      onSuccess(savedProduct);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Edit Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="product_category"
            value={form.product_category}
            onChange={handleChange}
            className="select select-bordered w-full"
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
          <label className="block text-sm font-medium mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            name="product_quantity"
            value={form.product_quantity}
            onChange={handleChange}
            className="input input-bordered w-full"
            min={0}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (₱)</label>
          <input
            type="number"
            step="0.01"
            name="product_price"
            value={form.product_price}
            onChange={handleChange}
            className="input input-bordered w-full"
            min={0}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="product_description"
            value={form.product_description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            rows={3}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input w-full"
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
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Saving..." : initialData ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
