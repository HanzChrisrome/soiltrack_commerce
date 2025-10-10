import type { Product } from "../models/product";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onView?: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onView }: ProductCardProps) => {
  // Badge logic
  const badges: { label: string; color: string }[] = [];
  if (product.is_point_product)
    badges.push({
      label: `Can be bought with Points: ${product.points_price ?? 0}`,
      color: "bg-green-600 text-white",
    });
  if (product.orig_price && product.orig_price > product.product_price)
    badges.push({ label: "On Sale", color: "bg-orange-500 text-white" });
  if (product.product_category?.toLowerCase().includes("best"))
    badges.push({ label: "Best Sale", color: "bg-red-600 text-white" });
  // Add more badge logic as needed

  return (
    <div
      className="relative bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col p-4 min-h-[260px] cursor-pointer"
      onClick={() => onView?.(product)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.product_name}`}
    >
      <div className="relative z-20 flex flex-col h-full">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-30">
          {badges.map((b, i) => (
            <span
              key={i}
              className={`text-xs font-bold px-2 py-1 rounded-full ${b.color}`}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Product image */}
        <div className="block mb-3">
          {product.product_image ? (
            <img
              src={`http://localhost:5000/${product.product_image}`}
              alt={product.product_name}
              className="h-40 w-full object-contain rounded-xl bg-gray-50 border mb-2"
            />
          ) : (
            <div className="h-40 w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-2">
              No Image
            </div>
          )}
        </div>

        {/* Product name */}
        <div className=" text-base font-semibold line-clamp-2 mb-1 text-gray-900">
          {product.product_name.charAt(0).toUpperCase() +
            product.product_name.slice(1).toLowerCase()}
        </div>

        {/* (Optional) Product description or size - can be customized */}
        {product.product_description && (
          <div className="text-xs text-gray-400 mb-1 line-clamp-4">
            {product.product_description}
          </div>
        )}

        {/* Bottom row: price left, add right */}
        <div className="flex items-center justify-between mt-3 pt-2">
          <div className="flex items-end gap-2">
            <span className="text-green-700 font-bold text-lg">
              ₱{product.product_price.toFixed(2)}
            </span>
            {product.orig_price &&
              product.orig_price > product.product_price && (
                <span className="text-gray-400 line-through text-sm">
                  ₱{product.orig_price.toFixed(2)}
                </span>
              )}
          </div>
        </div>
      </div>
      {/* Add to Cart button (z-30, above link, pointer-events-auto) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product.product_id);
        }}
        className="absolute bottom-4 right-4 bg-green-800 hover:bg-green-900 text-white rounded-full py-1 px-3 shadow transition flex items-center gap-2 z-30 pointer-events-auto"
        title="Add to Cart"
        tabIndex={0}
      >
        <ShoppingCart className="h-3 w-3" />
        Add
      </button>
    </div>
  );
};

export default ProductCard;
