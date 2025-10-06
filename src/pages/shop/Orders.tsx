import { useEffect, useState } from "react";
import { useOrdersStore } from "../../store/useOrderStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../widgets/Navbar";

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "To Ship", label: "To Ship" },
  { key: "To Receive", label: "To Receive" },
  { key: "Delivered", label: "Delivered" },
  { key: "Cancelled/Refunded", label: "Cancelled / Refunded" },
];

const Orders = () => {
  const { authUser } = useAuthStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    console.log("👤 Auth user object:", authUser);
    if (authUser?.user_id) fetchOrders(authUser.user_id);
  }, [authUser, fetchOrders]);

  if (!authUser)
    return (
      <p className="text-center mt-20">Please log in to view your orders.</p>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="w-10 h-10 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // 🟢 Filter orders based on activeTab
  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.shipping_status === activeTab);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-16 p-6">
        <div className="max-w-6xl mx-auto">
          {/* ✅ Page Title */}
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {/* ✅ Tab Navigation */}
          <div className="flex flex-wrap gap-3 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  activeTab === tab.key
                    ? "bg-green-800 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ✅ Orders Section */}
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-600">
              No orders found for this category.
            </p>
          ) : (
            <div className="space-y-8">
              {filteredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl shadow-md p-6"
                >
                  {/* Header: Order ID + Status */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-green-900">
                      Order #{order.order_ref || order.order_id.slice(0, 8)}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.shipping_status === "To Ship"
                          ? "bg-orange-100 text-orange-700"
                          : order.shipping_status === "To Receive"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.shipping_status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.shipping_status === "Cancelled/Refunded"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {order.shipping_status || "Pending"}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex items-center bg-gray-50 rounded-lg p-3"
                      >
                        {item.products?.product_image ? (
                          <img
                            src={`http://localhost:5000/${item.products.product_image}`}
                            alt={item.products.product_name}
                            className="h-20 w-20 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-gray-500 text-sm">
                            No Image
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.products?.product_name || "Unnamed Product"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Qty: {item.order_item_quantity}
                          </p>
                        </div>

                        <p className="text-green-900 font-bold text-lg">
                          ₱{(item.subtotal / 100).toLocaleString("en-US")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t mt-4 pt-4 flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-700">
                      Order Total:{" "}
                      <span className="text-green-900 font-bold text-xl">
                        ₱{(order.total_amount / 100).toLocaleString("en-US")}
                      </span>
                    </p>
                    <div className="flex space-x-3">
                      <button className="bg-green-900 text-white px-4 py-2 rounded-lg hover:bg-green-800">
                        Track Order
                      </button>
                      <button className="border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50">
                        Contact Seller
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;
