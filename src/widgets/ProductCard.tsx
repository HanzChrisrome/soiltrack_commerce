import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "../models/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col hover:shadow-md transition">
      <Link to={`/product/${product.product_id}`}>
        {product.product_image && (
          <img
            src={`http://localhost:5000/${product.product_image}`}
            alt={product.product_name}
            className="h-40 w-full object-contain rounded-md mb-3"
          />
        )}
      </Link>

      <Link
        to={`/product/${product.product_id}`}
        className="hover:underline text-sm font-semibold line-clamp-2"
      >
        {product.product_name}
      </Link>

      <p className="text-green-600 font-bold mt-2">
        ₱{product.product_price.toFixed(2)}
      </p>

      {/* Hardcoded rating */}
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <div>{product.product_category}</div>
      </div>

      <button
        onClick={onAddToCart}
        className="mt-3 bg-green-900 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
