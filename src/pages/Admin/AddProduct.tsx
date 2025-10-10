import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import type { Product } from "../../models/product";
import { Upload, X } from "lucide-react";

interface AddProductProps {
  initialData?: Product | null;
  onSuccess: (savedProduct: Product) => void;
  onCancel: () => void;
}

export default function AddProduct({
  initialData,
  onSuccess,
  onCancel,
}: AddProductProps) {
  const [form, setForm] = useState<Partial<Product>>({
    product_name: "",
    product_category: "Insecticide",
    orig_price: 0,
    product_price: 0,
    product_quantity: 0,
    product_description: "",
  });

  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animation states
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // ✅ Trigger slide-in after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

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
        name === "product_price" ||
        name === "product_quantity" ||
        name === "orig_price"
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

    if (!form.product_name || !form.product_price || form.product_price <= 0) {
      alert("Please enter valid product details.");
      return;
    }

    try {
      setLoading(true);
      let savedProduct: Product;

      if (initialData?.product_id) {
        savedProduct = await productService.updateProduct(
          form as Product,
          imageFile
        );
      } else {
        savedProduct = await productService.addProduct(
          form as Product,
          imageFile
        );
      }

      onSuccess(savedProduct);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onCancel();
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Sliding panel */}
      <div
        className={`ml-auto h-screen w-[28rem] bg-white shadow-2xl rounded-l-lg flex flex-col transform transition-transform duration-300 ease-in-out
        ${isVisible && !isClosing ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="bg-green-900 text-white px-6 py-4 flex items-center justify-between rounded-tl-lg">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2"
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
              className="w-full rounded-md bg-gray-100 px-3 py-2"
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
              className="w-full rounded-md bg-gray-100 px-3 py-2"
              min={0}
            />
          </div>

          {/* Original/Cost Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Original Price (₱){" "}
              <span className="text-xs text-gray-500">(Cost/Wholesale)</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="orig_price"
              value={form.orig_price || 0}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2"
              min={0}
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Selling Price (₱){" "}
              <span className="text-xs text-gray-500">(Retail)</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="product_price"
              value={form.product_price}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2"
              min={0}
            />
            {form.orig_price && form.product_price && form.orig_price > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Markup:{" "}
                {(
                  ((form.product_price - form.orig_price) / form.orig_price) *
                  100
                ).toFixed(1)}
                % | Margin:{" "}
                {(
                  ((form.product_price - form.orig_price) /
                    form.product_price) *
                  100
                ).toFixed(1)}
                %
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="product_description"
              value={form.product_description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md bg-gray-100 px-3 py-2"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Image
            </label>
            <label className="flex items-center justify-center w-full px-4 py-3 bg-green-900 text-white rounded-md cursor-pointer hover:bg-green-800">
              <Upload size={20} className="mr-2" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="mt-3 flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded shadow-md"
                />
                <span className="text-sm text-gray-600 mt-1">
                  {imageFile?.name || "Current image"}
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 mr-1 w-screen rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 w-screen rounded-md bg-green-900 text-white font-semibold hover:bg-green-800"
            >
              {loading ? "Saving..." : initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
