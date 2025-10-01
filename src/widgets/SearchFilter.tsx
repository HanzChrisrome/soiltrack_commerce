import { useState } from "react";

const SearchFilter = () => {
  const [shippedFrom, setShippedFrom] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const toggleShippedFrom = (value: string) => {
    setShippedFrom((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      {/* Shipped From */}
      <div>
        <h3 className="font-semibold mb-2 border-b pb-1">Shipped From</h3>
        <div className="space-y-1 text-sm">
          {["Manila", "Cebu", "Davao"].map((location) => (
            <label key={location} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shippedFrom.includes(location)}
                onChange={() => toggleShippedFrom(location)}
              />
              {location}
            </label>
          ))}
        </div>
      </div>

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
        <button className="mt-2 w-full bg-green-700 text-white py-1 rounded text-sm hover:bg-green-600">
          Apply
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
