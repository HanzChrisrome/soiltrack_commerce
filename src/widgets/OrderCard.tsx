// src/components/OrderCard.tsx
import React from "react";

interface OrderItem {
  order_item_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  order_id: string;
  shipping_status?: string;
  created_at?: string;
  total_amount?: number;
  order_items: OrderItem[];
}

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="border rounded-2xl p-4 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">Order #{order.order_id}</h3>
        <span className="text-sm text-gray-500">
          {order.shipping_status || "Pending"}
        </span>
      </div>

      <div className="space-y-3">
        {order.order_items?.map((item) => (
          <div
            key={item.order_item_id}
            className="flex items-center gap-3 border-b pb-2"
          >
            <img
              src={item.product_image}
              alt={item.product_name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity} × ₱{item.unit_price.toLocaleString()}
              </p>
            </div>
            <p className="font-semibold">₱{item.subtotal.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-3 font-medium">
        <span>Order Total:</span>
        <span>
          ₱
          {order.total_amount
            ? order.total_amount.toLocaleString()
            : order.order_items
                .reduce((sum, i) => sum + (i.subtotal || 0), 0)
                .toLocaleString()}
        </span>
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Placed on {new Date(order.created_at || "").toLocaleDateString()}
      </p>
    </div>
  );
};

export default OrderCard;
