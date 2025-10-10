import { useEffect, useState } from "react";
import { useOrdersStore } from "../../store/useOrderStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../widgets/Navbar";
import CancelOrderForm from "../../widgets/CancelOrderForm";
import RefundOrderForm from "../../widgets/RefundOrderForm";
import axios from "axios";

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "To Ship", label: "To Ship" },
  { key: "To Receive", label: "To Receive" },
  { key: "Delivered", label: "Delivered" },
  { key: "returns", label: "Returns / Refunds" }, // ✅ new section
];

const Orders = () => {
  const { authUser } = useAuthStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const [activeTab, setActiveTab] = useState("all");

  // Modal states
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [confirmReceiveOrderId, setConfirmReceiveOrderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (authUser?.user_id) fetchOrders(authUser.user_id);
  }, [authUser, fetchOrders]);

  if (!authUser)
    return (
      <p className="text-center mt-20">Please log in to view your orders.</p>
    );

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
        <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // ---- FILTER ORDERS ----
  const filteredOrders = (() => {
    if (activeTab === "all") return orders;
    if (activeTab === "returns") {
      return orders.filter(
        (o) =>
          o.shipping_status === "For Cancellation" ||
          o.shipping_status === "For Refund"
      );
    }
    return orders.filter((o) => o.shipping_status === activeTab);
  })();

  // ---- API HANDLERS ----

  // Cancel Order (To Ship)
  const handleCancel = async (data: {
    reason: string;
    otherReason?: string;
  }) => {
    if (!cancelOrderId || !authUser) return;

    try {
      await axios.post("http://localhost:5000/api/orders/cancel", {
        order_id: cancelOrderId,
        user_id: authUser.user_id,
        ...data,
      });

      alert("✅ Your cancellation request has been submitted.");
      setCancelOrderId(null);
      fetchOrders(authUser.user_id);
    } catch (err) {
      console.error("❌ Cancel request failed:", err);
      alert("Failed to cancel order. Please try again.");
    }
  };

  // Refund Order (Delivered)
  const handleRefund = async (data: {
    reason: string;
    otherReason?: string;
  }) => {
    if (!refundOrderId || !authUser) return;

    try {
      await axios.post("http://localhost:5000/api/orders/refund", {
        order_id: refundOrderId,
        user_id: authUser.user_id,
        ...data,
      });

      alert("✅ Your refund request has been submitted for review.");
      setRefundOrderId(null);
      fetchOrders(authUser.user_id);
    } catch (err) {
      console.error("❌ Refund request failed:", err);
      alert("Failed to request refund. Please try again.");
    }
  };

  // Mark as Received
  const handleMarkAsReceived = async () => {
    if (!confirmReceiveOrderId || !authUser) return;

    try {
      await axios.post("http://localhost:5000/api/orders/mark-received", {
        order_id: confirmReceiveOrderId,
        user_id: authUser.user_id,
      });

      alert("✅ Order marked as received!");
      setConfirmReceiveOrderId(null);
      fetchOrders(authUser.user_id);
    } catch (err) {
      console.error("❌ Failed to mark order as received:", err);
      alert("Failed to update order status. Please try again.");
    }
  };

  const selectedCancelOrder = orders.find((o) => o.order_id === cancelOrderId);
  const selectedRefundOrder = orders.find((o) => o.order_id === refundOrderId);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 mt-16 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {/* Tabs */}
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

          {/* Orders List */}
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
                  {/* Header */}
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
                          : order.shipping_status === "For Refund"
                          ? "bg-blue-100 text-blue-700"
                          : order.shipping_status === "For Cancellation"
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
                      {/* Cancel for To Ship */}
                      {order.shipping_status === "To Ship" && (
                        <button
                          onClick={() => setCancelOrderId(order.order_id)}
                          className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Mark as Received */}
                      {order.shipping_status === "To Receive" && (
                        <button
                          onClick={() =>
                            setConfirmReceiveOrderId(order.order_id)
                          }
                          className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Order Received
                        </button>
                      )}

                      {/* Refund for Delivered */}
                      {order.shipping_status === "Delivered" && (
                        <button
                          onClick={() => setRefundOrderId(order.order_id)}
                          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                        >
                          Request Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {selectedCancelOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="w-full max-w-lg">
            <CancelOrderForm
              orderId={
                selectedCancelOrder.order_ref || selectedCancelOrder.order_id
              }
              onBackToDetails={() => setCancelOrderId(null)}
              onConfirmCancellation={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {selectedRefundOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="w-full max-w-lg">
            <RefundOrderForm
              orderId={selectedRefundOrder.order_id}
              userId={authUser.user_id}
              onBackToDetails={() => setRefundOrderId(null)}
              onRefundSuccess={() => fetchOrders(authUser.user_id)}
              onConfirmRefund={handleRefund}
            />
          </div>
        </div>
      )}

      {/* Confirm Received Modal */}
      {confirmReceiveOrderId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Order Received
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you’ve received your order? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmReceiveOrderId(null)}
                className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsReceived}
                className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
