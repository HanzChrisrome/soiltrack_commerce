import { useEffect, useState } from "react";
import { useOrdersStore } from "../../store/useOrderStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { Order, OrderItem } from "../../models/order";
import Navbar from "../../widgets/Navbar";
import Footer from "../../widgets/Footer";
import CancelOrderForm from "../../widgets/CancelOrderForm";
import RefundOrderForm from "../../widgets/RefundOrderForm";
import axios from "axios";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/Sandy Loading.json";

const TABS = [
  { key: "all", label: "All Orders", icon: Package },
  { key: "To Ship", label: "To Ship", icon: Package },
  { key: "To Receive", label: "To Receive", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle },
  { key: "returns", label: "Returns / Refunds", icon: RefreshCcw },
];

const ITEMS_PER_PAGE = 7;

const Orders = () => {
  const { authUser } = useAuthStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Modal states
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [confirmReceiveOrderId, setConfirmReceiveOrderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (authUser?.user_id) fetchOrders(authUser.user_id);
  }, [authUser, fetchOrders]);

  // ---- PDF RECEIPT GENERATION ----
  const handleDownloadReceipt = async (order: Order) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header - Company Logo/Name
      pdf.setFillColor(34, 139, 34); // Green header
      pdf.rect(0, 0, pageWidth, 35, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("SOILTRACK COMMERCE", pageWidth / 2, 15, { align: "center" });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Agricultural Solutions Provider", pageWidth / 2, 22, {
        align: "center",
      });
      pdf.text(
        "Email: support@soiltrack.com | Phone: +63 123 456 7890",
        pageWidth / 2,
        28,
        { align: "center" }
      );

      yPosition = 45;

      // Receipt Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("OFFICIAL RECEIPT", pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 10;

      // Order Information Section
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPosition, pageWidth - 30, 35, "F");

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("ORDER DETAILS", 20, yPosition);

      yPosition += 6;
      pdf.setFont("helvetica", "normal");
      pdf.text(`Order ID: ${order.order_ref || order.order_id}`, 20, yPosition);
      pdf.text(
        `Date: ${new Date(order.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );

      yPosition += 6;
      pdf.text(
        `Customer: ${authUser?.user_fname || ""} ${authUser?.user_lname || ""}`,
        20,
        yPosition
      );
      pdf.text(`Status: ${order.shipping_status}`, pageWidth - 20, yPosition, {
        align: "right",
      });

      yPosition += 6;
      pdf.text(`Email: ${authUser?.user_email || "N/A"}`, 20, yPosition);

      yPosition += 15;

      // Products Table Header
      pdf.setFillColor(34, 139, 34);
      pdf.rect(15, yPosition, pageWidth - 30, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Product", 20, yPosition + 5.5);
      pdf.text("Qty", pageWidth / 2 + 10, yPosition + 5.5, { align: "center" });
      pdf.text("Unit Price", pageWidth / 2 + 40, yPosition + 5.5, {
        align: "right",
      });
      pdf.text("Subtotal", pageWidth - 20, yPosition + 5.5, { align: "right" });

      yPosition += 8;

      // Products List
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      order.order_items.forEach((item: OrderItem, index: number) => {
        // Alternating row colors
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(15, yPosition, pageWidth - 30, 7, "F");
        }

        const productName = item.products?.product_name || "Unknown Product";
        const quantity = item.order_item_quantity;
        const unitPrice = `₱${(item.unit_price / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        const subtotal = `₱${(item.subtotal / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

        pdf.text(productName, 20, yPosition + 5);
        pdf.text(quantity.toString(), pageWidth / 2 + 10, yPosition + 5, {
          align: "center",
        });
        pdf.text(unitPrice, pageWidth / 2 + 40, yPosition + 5, {
          align: "right",
        });
        pdf.text(subtotal, pageWidth - 20, yPosition + 5, { align: "right" });

        yPosition += 7;
      });

      // Total Section
      yPosition += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);

      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("TOTAL AMOUNT:", pageWidth / 2 + 10, yPosition);
      pdf.text(
        `₱${(order.total_amount / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );

      // Footer
      yPosition = pageHeight - 30;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Thank you for your business!", pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 5;
      pdf.text(
        "This is an official receipt generated by SoilTrack Commerce.",
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );

      yPosition += 5;
      pdf.text(
        "For inquiries, please contact our customer support.",
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );

      // Bottom border
      pdf.setFillColor(34, 139, 34);
      pdf.rect(0, pageHeight - 10, pageWidth, 10, "F");

      // Open PDF in new tab
      pdf.output("dataurlnewwindow");

      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate receipt");
    }
  };

  if (!authUser)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600 text-lg">
            Please log in to view your orders.
          </p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <Lottie
          loop
          animationData={loadingAnimation}
          play
          style={{ width: 150, height: 150 }}
        />
      </div>
    );

  // ---- FILTER ORDERS ----

  // ---- FILTER ORDERS ----
  const filteredOrders = (() => {
    let filtered = orders;
    // Tab filter
    if (activeTab !== "all") {
      if (activeTab === "returns") {
        filtered = filtered.filter(
          (o) =>
            o.shipping_status === "For Cancellation" ||
            o.shipping_status === "For Refund"
        );
      } else {
        filtered = filtered.filter((o) => o.shipping_status === activeTab);
      }
    }
    // Date filter
    if (startDate) {
      filtered = filtered.filter(
        (o) => new Date(o.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      // Add 1 day to endDate to make it inclusive
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter((o) => new Date(o.created_at) < end);
    }
    return filtered;
  })();

  // ---- PAGINATION ----
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      toast.success("✅ Your cancellation request has been submitted.");
      setCancelOrderId(null);
      fetchOrders(authUser.user_id);
    } catch (err) {
      console.error("❌ Cancel request failed:", err);
      toast.error("Failed to cancel order. Please try again.");
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
      toast.success("✅ Your refund request has been submitted for review.");
      setRefundOrderId(null);
      fetchOrders(authUser.user_id);
    } catch (err) {
      console.error("❌ Refund request failed:", err);
      toast.error("Failed to request refund. Please try again.");
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
      toast.success("✅ Order marked as received!");
      setConfirmReceiveOrderId(null);
      fetchOrders(authUser.user_id);
    } catch (err) {
      console.error("❌ Failed to mark order as received:", err);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  const selectedCancelOrder = orders.find((o) => o.order_id === cancelOrderId);
  const selectedRefundOrder = orders.find((o) => o.order_id === refundOrderId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "To Ship":
        return <Package className="h-5 w-5" />;
      case "To Receive":
        return <Truck className="h-5 w-5" />;
      case "Delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "Cancelled":
      case "For Cancellation":
        return <XCircle className="h-5 w-5" />;
      case "For Refund":
      case "Refunded":
        return <RefreshCcw className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Ship":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "To Receive":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "For Cancellation":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "For Refund":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Refunded":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-900 to-green-800 text-transparent bg-clip-text">
              My Orders
            </h1>
            <p className="text-gray-600">
              Track and manage all your orders in one place
            </p>
          </div>

          {/* Tabs and Date Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-2 flex flex-wrap gap-2 border border-gray-200">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-green-700 to-green-900 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2">
              <label className="text-sm text-gray-600 font-medium">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
                max={endDate || undefined}
              />
              <label className="text-sm text-gray-600 font-medium">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
                min={startDate || undefined}
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  className="ml-2 text-xs text-gray-500 hover:text-red-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500">
                You don't have any orders in this category yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Order ID
                          </p>
                          <p className="font-semibold text-gray-900">
                            #{order.order_ref || order.order_id.slice(0, 8)}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Order Date
                          </p>
                          <p className="text-sm text-gray-700">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                            order.shipping_status || "Pending"
                          )}`}
                        >
                          {getStatusIcon(order.shipping_status || "Pending")}
                          {order.shipping_status || "Pending"}
                        </span>
                        <button
                          onClick={() => handleDownloadReceipt(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <button
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order.order_id
                            ? null
                            : order.order_id
                        )
                      }
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 font-medium"
                    >
                      {expandedOrderId === order.order_id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {expandedOrderId === order.order_id ? "Hide" : "View"}{" "}
                      items ({order.order_items?.length || 0})
                    </button>

                    {expandedOrderId === order.order_id && (
                      <div className="space-y-3 mb-4">
                        {order.order_items?.map((item) => (
                          <div
                            key={item.order_item_id}
                            className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            {item.products?.product_image ? (
                              <img
                                src={`http://localhost:5000/${item.products.product_image}`}
                                alt={item.products.product_name}
                                className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                              />
                            ) : (
                              <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                <Package className="h-8 w-8" />
                              </div>
                            )}

                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {item.products?.product_name ||
                                  "Unnamed Product"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.order_item_quantity} × ₱
                                {(item.unit_price / 100).toLocaleString(
                                  "en-US"
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">
                                Subtotal
                              </p>
                              <p className="text-lg font-bold text-green-900">
                                ₱{(item.subtotal / 100).toLocaleString("en-US")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Footer */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-900">
                            {(order.total_amount / 100)
                              .toLocaleString("en-PH", {
                                style: "currency",
                                currency: "PHP",
                                minimumFractionDigits: 2,
                              })
                              .replace("PHP", "")
                              .trim()}
                          </span>
                          <span className="text-gray-600 font-medium">
                            Order Total
                          </span>
                        </div>

                        <div className="flex gap-3">
                          {/* Cancel for To Ship */}
                          {order.shipping_status === "To Ship" && (
                            <button
                              onClick={() => setCancelOrderId(order.order_id)}
                              className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel Order
                            </button>
                          )}

                          {/* Mark as Received */}
                          {order.shipping_status === "To Receive" && (
                            <button
                              onClick={() =>
                                setConfirmReceiveOrderId(order.order_id)
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg hover:from-green-800 hover:to-green-950 transition-colors font-medium"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Order Received
                            </button>
                          )}

                          {/* Refund for Delivered */}
                          {order.shipping_status === "Delivered" && (
                            <button
                              onClick={() => setRefundOrderId(order.order_id)}
                              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Request Refund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronDown
                style={{ transform: "rotate(90deg)" }}
                className="h-5 w-5 text-gray-600"
              />
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[2.5rem] px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-green-700 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronDown
                style={{ transform: "rotate(-90deg)" }}
                className="h-5 w-5 text-gray-600"
              />
            </button>
          </div>
        )}
      </div>

      <Footer />

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
