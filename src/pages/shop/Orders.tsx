// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useOrdersStore } from "../../store/useOrderStore";
import type { Order } from "../../models/order";

const tabs = ["All Orders", "To Ship", "To Receive", "Cancelled/Refunded"];

const statusColors: Record<string, string> = {
  "To Ship": "bg-orange-500 text-white",
  "To Receive": "bg-blue-500 text-white",
  "Cancelled/Refunded": "bg-gray-400 text-white",
  pending: "bg-yellow-500 text-white",
  completed: "bg-green-600 text-white",
};

const OrderCard = ({ order }: { order: Order }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          Order ID: #{order.order_ref || order.order_id.slice(0, 8)}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[order.status] || "bg-gray-200 text-gray-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Products */}
      <div className="space-y-4">
        {order.order_items.map((item) => (
          <div key={item.order_item_id} className="flex items-center gap-4">
            {item.products?.product_image ? (
              <img
                src={`http://localhost:5000/${item.products.product_image}`}
                alt={item.products.product_name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                No Image
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium">{item.products?.product_name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold">
              ₱ {(item.unit_price / 100).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-lg font-bold">
          Order Total: ₱ {(order.total_amount / 100).toFixed(2)}
        </p>
        <div className="flex gap-3">
          <button className="bg-green-700 text-white px-4 py-2 rounded-xl shadow hover:bg-green-800">
            Track Order
          </button>
          <button className="border border-green-600 text-green-700 px-4 py-2 rounded-xl hover:bg-green-50">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const { authUser } = useAuthStore();
  const { orders, loading, error, fetchOrders } = useOrdersStore();
  const [activeTab, setActiveTab] = useState("To Ship");

  useEffect(() => {
    if (authUser?.user_id) {
      fetchOrders(authUser.user_id);
    }
  }, [authUser, fetchOrders]);

  const filteredOrders =
    activeTab === "All Orders"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-medium ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        filteredOrders.map((order: Order) => (
          <OrderCard key={order.order_id} order={order} />
        ))
      )}
    </div>
  );
};

export default Orders;
