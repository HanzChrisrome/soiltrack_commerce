import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { useAdminOrdersStore } from "../../store/useAdminOrderStore";
import type { Order } from "../../models/order";
import toast from "react-hot-toast";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/sparkels.json";

const ITEMS_PER_PAGE = 10;

const ALL_STATUSES = [
  "To Ship",
  "To Receive",
  "Delivered",
  "For Cancellation",
  "For Refund",
  "Cancelled",
  "Refunded",
];

// ✅ Admin can only change to these statuses
const EDITABLE_STATUSES = ["To Ship", "To Receive", "Delivered"];

const ManageOrders = () => {
  const {
    orders,
    fetchAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    loading,
  } = useAdminOrdersStore();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Status change confirmation modal
  const [statusChangeModal, setStatusChangeModal] = useState<{
    order: Order;
    newStatus: string;
  } | null>(null);

  // Payment status change modal
  const [paymentStatusModal, setPaymentStatusModal] = useState<{
    order: Order;
    newPaymentStatus: string;
  } | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // ✅ Filter logic with user name search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "All" || order.shipping_status === filterStatus;

    // Search by order ID, order ref, product name, or user name
    const userName = `${order.users?.user_fname || ""} ${
      order.users?.user_lname || ""
    }`.toLowerCase();
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.includes(searchTerm.toLowerCase()) ||
      order.order_items.some((item) =>
        item.products?.product_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  // Sort by created date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedOrders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "Orders_Report.xlsx");
  };

  const handlePrintLabel = async (order: Order) => {
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
        `Customer: ${order.users?.user_fname || ""} ${
          order.users?.user_lname || ""
        }`,
        20,
        yPosition
      );
      pdf.text(
        `Shipping Status: ${order.shipping_status}`,
        pageWidth - 20,
        yPosition,
        {
          align: "right",
        }
      );

      yPosition += 6;
      pdf.text(
        `Order Status: ${order.order_status ?? "N/A"}`,
        pageWidth - 20,
        yPosition,
        {
          align: "right",
        }
      );

      yPosition += 6;
      pdf.text(`Email: ${order.users?.user_email || "N/A"}`, 20, yPosition);

      yPosition += 6;
      pdf.text(
        `Payment Method: ${order.payment_method || "COD"}`,
        20,
        yPosition
      );
      pdf.text(
        `Payment Status: ${order.order_status || "Pending"}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );

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

      order.order_items.forEach((item, index) => {
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

      // Subtotal calculation (total - fees)
      const orderSubtotal =
        order.total_amount -
        (order.shipping_fee || 0) -
        (order.platform_fee || 0);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Subtotal:", pageWidth / 2 + 10, yPosition);
      pdf.text(
        `₱${(orderSubtotal / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );

      yPosition += 6;
      pdf.text("Shipping Fee:", pageWidth / 2 + 10, yPosition);
      pdf.text(
        `₱${((order.shipping_fee || 0) / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );

      yPosition += 6;
      pdf.text("Platform Fee:", pageWidth / 2 + 10, yPosition);
      pdf.text(
        `₱${((order.platform_fee || 0) / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );

      // Points voucher if applicable
      if (order.points_used && order.points_used > 0) {
        yPosition += 6;
        pdf.setTextColor(184, 134, 11); // Gold color for points
        pdf.text("Points Voucher:", pageWidth / 2 + 10, yPosition);
        pdf.text(
          `${order.points_used} points used`,
          pageWidth - 20,
          yPosition,
          { align: "right" }
        );
        pdf.setTextColor(0, 0, 0); // Reset to black
      }

      yPosition += 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(pageWidth / 2 + 10, yPosition, pageWidth - 20, yPosition);

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

      toast.success("Receipt generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate receipt");
    }
  };

  const handleStatusChangeRequest = (order: Order, newStatus: string) => {
    setStatusChangeModal({ order, newStatus });
  };

  const handlePaymentStatusChangeRequest = (
    order: Order,
    newPaymentStatus: string
  ) => {
    setPaymentStatusModal({ order, newPaymentStatus });
  };

  // ✅ Confirm status change
  const handleConfirmStatusChange = async () => {
    if (!statusChangeModal) return;

    const { order, newStatus } = statusChangeModal;
    try {
      await updateOrderStatus(order.order_id, newStatus);
      toast.success(
        `Order ${
          order.order_ref || order.order_id
        } status updated to "${newStatus}"`
      );
      await fetchAllOrders(); // Refresh orders
      setStatusChangeModal(null);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    }
  };

  // ✅ Confirm payment status change
  const handleConfirmPaymentStatusChange = async () => {
    if (!paymentStatusModal) return;

    const { order, newPaymentStatus } = paymentStatusModal;
    try {
      await updatePaymentStatus(order.order_id, newPaymentStatus);
      toast.success(
        `Order ${
          order.order_ref || order.order_id
        } payment status updated to "${newPaymentStatus}"`
      );
      await fetchAllOrders(); // Refresh orders
      setPaymentStatusModal(null);
    } catch (error) {
      toast.error("Failed to update payment status");
      console.error(error);
    }
  };

  // ✅ Open "View Full Order" modal
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="">
      <div className="px-8 mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 text-transparent bg-clip-text mb-3">
          Manage Orders
        </h1>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg p-4 mb-2 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by order, customer name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            >
              <option value="All">All Status</option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-700 to-green-900 text-white px-4 py-1.5 rounded-md hover:from-green-800 hover:to-green-950 transition-colors whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            Export as Excel File
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex min-h-[650px] justify-center items-center">
              <Lottie
                loop
                animationData={loadingAnimation}
                play
                style={{ width: 100, height: 100 }}
              />
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center py-12 text-gray-500 italic">
              No orders found for this filter.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Shipping Status
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={toggleSort}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors"
                        >
                          Created At
                          {sortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedOrders.map((order) => (
                      <>
                        <tr
                          key={order.order_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2.5">
                            <div className="font-medium text-gray-900 text-sm">
                              {order.order_ref || order.order_id.slice(0, 8)}
                            </div>
                            <button
                              onClick={() => toggleOrderDetails(order.order_id)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                            >
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${
                                  expandedOrderId === order.order_id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                              {expandedOrderId === order.order_id
                                ? "Hide"
                                : "View"}{" "}
                              items
                            </button>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-sm font-medium text-gray-900">
                              {order.users?.user_fname || "N/A"}{" "}
                              {order.users?.user_lname || ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.users?.user_email || ""}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="font-semibold text-gray-900 text-sm">
                              ₱
                              {(order.total_amount / 100).toLocaleString(
                                "en-US"
                              )}
                            </div>
                            {order.points_used && order.points_used > 0 && (
                              <div className="text-xs text-yellow-700 font-medium mt-1">
                                🎁 {order.points_used} pts used
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-xs text-gray-600 mb-1">
                              {order.payment_method || "COD"}
                            </div>
                            <select
                              value={order.order_status || "pending"}
                              onChange={(e) =>
                                handlePaymentStatusChangeRequest(
                                  order,
                                  e.target.value
                                )
                              }
                              className={`px-2.5 py-1 text-xs border rounded-md font-medium focus:ring-2 focus:ring-indigo-300 focus:outline-none ${getPaymentStatusColor(
                                order.order_status || "pending"
                              )}`}
                              disabled={
                                order.payment_method?.toLowerCase() !== "cod"
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <select
                              value={order.shipping_status || ""}
                              onChange={(e) =>
                                handleStatusChangeRequest(order, e.target.value)
                              }
                              className={`px-2.5 py-1 text-xs border rounded-md font-medium focus:ring-2 focus:ring-indigo-300 focus:outline-none ${getStatusColor(
                                order.shipping_status || "Unknown"
                              )}`}
                            >
                              {EDITABLE_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handlePrintLabel(order)}
                                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Print Label"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Order Items */}
                        {expandedOrderId === order.order_id && (
                          <tr>
                            <td colSpan={7} className="px-4 py-3 bg-gray-50">
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                  Order Items
                                </h4>
                                <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                          Product Name
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                                          Quantity
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                                          Unit Price
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                                          Subtotal
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {order.order_items.map((item) => (
                                        <tr
                                          key={item.order_item_id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-3 py-2 text-gray-900">
                                            {item.products?.product_name
                                              ? item.products.product_name
                                                  .toLowerCase()
                                                  .replace(/(^\w|\s\w)/g, (m) =>
                                                    m.toUpperCase()
                                                  )
                                              : "Unknown Product"}
                                          </td>
                                          <td className="px-3 py-2 text-center text-gray-700">
                                            {item.order_item_quantity}
                                          </td>
                                          <td className="px-3 py-2 text-right text-gray-700">
                                            ₱
                                            {(
                                              item.unit_price / 100
                                            ).toLocaleString("en-US")}
                                          </td>
                                          <td className="px-3 py-2 text-right font-medium text-gray-900">
                                            ₱
                                            {(
                                              item.subtotal / 100
                                            ).toLocaleString("en-US")}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Change Confirmation Modal */}
        {statusChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Confirm Status Change
                  </h2>
                  <p className="text-xs text-gray-500">
                    This action will update the order status
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-gray-900">
                      {statusChangeModal.order.order_ref ||
                        statusChangeModal.order.order_id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">
                      {statusChangeModal.order.users?.user_fname}{" "}
                      {statusChangeModal.order.users?.user_lname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        statusChangeModal.order.shipping_status || ""
                      )}`}
                    >
                      {statusChangeModal.order.shipping_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">New Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        statusChangeModal.newStatus
                      )}`}
                    >
                      {statusChangeModal.newStatus}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to change the status from{" "}
                <span className="font-semibold text-gray-900">
                  {statusChangeModal.order.shipping_status}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {statusChangeModal.newStatus}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStatusChangeModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg hover:from-green-800 hover:to-green-950 transition-colors font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Change Confirmation Modal */}
        {paymentStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Confirm Payment Status Change
                  </h2>
                  <p className="text-xs text-gray-500">
                    Mark COD order as paid
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-gray-900">
                      {paymentStatusModal.order.order_ref ||
                        paymentStatusModal.order.order_id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">
                      {paymentStatusModal.order.users?.user_fname}{" "}
                      {paymentStatusModal.order.users?.user_lname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">
                      {paymentStatusModal.order.payment_method || "COD"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        paymentStatusModal.order.order_status || ""
                      )}`}
                    >
                      {paymentStatusModal.order.order_status || "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">New Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        paymentStatusModal.newPaymentStatus
                      )}`}
                    >
                      {paymentStatusModal.newPaymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to change the payment status to{" "}
                <span className="font-semibold text-gray-900">
                  {paymentStatusModal.newPaymentStatus}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentStatusModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPaymentStatusChange}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg hover:from-green-800 hover:to-green-950 transition-colors font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
