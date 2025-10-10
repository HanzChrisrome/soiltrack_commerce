import { useState } from "react";

interface SearchFilterProps {
  onPriceFilter?: (min: number | null, max: number | null) => void;
}

const SearchFilter = ({ onPriceFilter }: SearchFilterProps) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleApply = () => {
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    if (onPriceFilter) {
      onPriceFilter(min, max);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-4 mt-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-2 border-b pb-1">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="₱ Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="₱ Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
        </div>
        <button
          className="mt-2 w-full bg-green-700 text-white py-1 rounded text-sm hover:bg-green-600"
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
