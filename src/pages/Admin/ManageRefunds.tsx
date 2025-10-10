// src/pages/Admin/ManageRefunds.tsx
import { useEffect, useState } from "react";
import { useRefundsStore } from "../../store/useRefundsStore";
import type { RefundRequest } from "../../store/useRefundsStore";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/sparkels.json";

const ITEMS_PER_PAGE = 10;

const ALL_STATUSES = ["Pending", "Approved", "Rejected"];

const ManageRefunds = () => {
  const { refunds, fetchRefunds, approveRefund, rejectRefund, loading } =
    useRefundsStore();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modal states
  const [actionModal, setActionModal] = useState<{
    refund: RefundRequest;
    action: "approve" | "reject";
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [viewModal, setViewModal] = useState<RefundRequest | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  // Filter logic
  const filteredRefunds = refunds.filter((refund) => {
    const matchesStatus =
      filterStatus === "All" || refund.status === filterStatus;

    // Search by order ID, order ref, or user name
    const userName = `${refund.users?.user_fname || ""} ${
      refund.users?.user_lname || ""
    }`.toLowerCase();
    const matchesSearch =
      refund.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orders?.order_ref
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      userName.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Sort by created date
  const sortedRefunds = [...filteredRefunds].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Handle approve/reject confirmation
  const handleConfirmAction = async () => {
    if (!actionModal) return;

    const { refund, action } = actionModal;
    try {
      if (action === "approve") {
        await approveRefund(refund.refund_id, adminNotes);
        toast.success(
          `Refund request approved for order ${
            refund.orders?.order_ref || refund.order_id
          }`
        );
      } else {
        await rejectRefund(refund.refund_id, adminNotes);
        toast.success(
          `Refund request rejected for order ${
            refund.orders?.order_ref || refund.order_id
          }`
        );
      }
      setActionModal(null);
      setAdminNotes("");
    } catch (error) {
      toast.error(`Failed to ${action} refund request`);
      console.error(error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(sortedRefunds.length / ITEMS_PER_PAGE);
  const paginatedRefunds = sortedRefunds.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="">
      <div className="px-8 mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 text-transparent bg-clip-text mb-3">
          Manage Refund Requests
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold">{sortedRefunds.length}</span>{" "}
              refund
              {sortedRefunds.length !== 1 ? "s" : ""}
            </span>
          </div>
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
          ) : filteredRefunds.length === 0 ? (
            <p className="text-center py-12 text-gray-500 italic">
              No refund requests found for this filter.
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
                        Order Total
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={toggleSort}
                      >
                        <div className="flex items-center gap-1">
                          Requested Date
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedRefunds.map((refund) => (
                      <tr
                        key={refund.refund_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {refund.orders?.order_ref || refund.order_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {refund.users?.user_fname} {refund.users?.user_lname}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ₱
                          {(
                            (refund.orders?.total_amount || 0) / 100
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {refund.reason}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              refund.status
                            )}`}
                          >
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(refund.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* View Details Button */}
                            <button
                              onClick={() => setViewModal(refund)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Approve/Reject buttons only for Pending */}
                            {refund.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      refund,
                                      action: "approve",
                                    })
                                  }
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                  title="Approve Refund"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      refund,
                                      action: "reject",
                                    })
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Reject Refund"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
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
                          className={`min-w-[2rem] h-8 rounded-md text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-green-700 text-white"
                              : "hover:bg-white text-gray-700"
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

        {/* Approve/Reject Confirmation Modal */}
        {actionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    actionModal.action === "approve"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {actionModal.action === "approve" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {actionModal.action === "approve"
                      ? "Approve Refund Request"
                      : "Reject Refund Request"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Order:{" "}
                    {actionModal.refund.orders?.order_ref ||
                      actionModal.refund.order_id}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">
                      {actionModal.refund.users?.user_fname}{" "}
                      {actionModal.refund.users?.user_lname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total:</span>
                    <span className="font-medium text-gray-900">
                      ₱
                      {(
                        (actionModal.refund.orders?.total_amount || 0) / 100
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Reason:</span>
                    <p className="text-gray-900 mt-1">
                      {actionModal.refund.reason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to{" "}
                <span className="font-semibold text-gray-900">
                  {actionModal.action}
                </span>{" "}
                this refund request?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setAdminNotes("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-white ${
                    actionModal.action === "approve"
                      ? "bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950"
                      : "bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950"
                  }`}
                >
                  Confirm{" "}
                  {actionModal.action === "approve" ? "Approval" : "Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Refund Request Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Order: {viewModal.orders?.order_ref || viewModal.order_id}
                  </p>
                </div>
                <button
                  onClick={() => setViewModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-2">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {viewModal.users?.user_fname}{" "}
                        {viewModal.users?.user_lname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">
                        {viewModal.users?.user_email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Order Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Total:</span>
                      <span className="font-medium text-gray-900">
                        ₱
                        {(
                          (viewModal.orders?.total_amount || 0) / 100
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          viewModal.orders?.shipping_status === "For Refund"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {viewModal.orders?.shipping_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Order Items
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {viewModal.orders?.order_items.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="p-4 flex items-center gap-4"
                      >
                        {item.products?.product_image && (
                          <img
                            src={`http://localhost:5000/${item.products.product_image}`}
                            alt={item.products.product_name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.products?.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.order_item_quantity} × ₱
                            {(item.unit_price / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₱{(item.subtotal / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Details */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-3">
                    Refund Request Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-yellow-700 font-medium">
                        Reason:
                      </span>
                      <p className="text-yellow-900 mt-1">{viewModal.reason}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                      <span className="text-yellow-700 font-medium">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          viewModal.status
                        )}`}
                      >
                        {viewModal.status}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-yellow-200">
                      <span className="text-yellow-700 font-medium">
                        Requested Date:
                      </span>
                      <span className="text-yellow-900">
                        {new Date(viewModal.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    {viewModal.admin_notes && (
                      <div className="pt-2 border-t border-yellow-200">
                        <span className="text-yellow-700 font-medium">
                          Admin Notes:
                        </span>
                        <p className="text-yellow-900 mt-1">
                          {viewModal.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons if pending */}
                {viewModal.status === "Pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setViewModal(null);
                        setActionModal({ refund: viewModal, action: "reject" });
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:from-red-800 hover:to-red-950 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Refund
                    </button>
                    <button
                      onClick={() => {
                        setViewModal(null);
                        setActionModal({
                          refund: viewModal,
                          action: "approve",
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg hover:from-green-800 hover:to-green-950 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Refund
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRefunds;
