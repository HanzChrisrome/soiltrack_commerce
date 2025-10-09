import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Printer,
  Pencil,
  FileSpreadsheet,
  Eye,
  X as Close,
  Archive,
} from "lucide-react";
import { useAdminOrdersStore } from "../../store/useAdminOrderStore";
import type { Order } from "../../models/order";
import toast from "react-hot-toast";

const ALL_STATUSES = [
  "To Ship",
  "To Receive",
  "Received",
  "For Cancellation",
  "For Refund",
  "Cancelled",
  "Refunded",
];

// ✅ Admin can only change to these statuses
const EDITABLE_STATUSES = ["To Ship", "To Receive", "Cancelled"];

const ManageOrders = () => {
  const { orders, fetchAllOrders, updateOrderStatus, loading } =
    useAdminOrdersStore();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editData, setEditData] = useState<Partial<Order>>({});
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // ✅ Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "All" || order.shipping_status === filterStatus;
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items.some((item) =>
        item.products?.product_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    const matchesUser = userFilter === "" || order.user_id.includes(userFilter);
    return matchesStatus && matchesSearch && matchesUser;
  });

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOrders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "Orders_Report.xlsx");
  };

  // ✅ Print Label
  const handlePrintLabel = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Shipping Label</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>Shipping Label</h1>
          <p><strong>Order ID:</strong> ${order.order_ref || order.order_id}</p>
          <p><strong>User ID:</strong> ${order.user_id}</p>
          <p><strong>Status:</strong> ${order.shipping_status}</p>
          <p><strong>Total Amount:</strong> ₱${(
            order.total_amount / 100
          ).toLocaleString("en-US")}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ✅ Open Update Modal
  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditData(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setEditData({});
  };

  // ✅ Save Update
  const handleSaveUpdate = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.order_id, editData.shipping_status!);
    toast.success(
      `Order ${selectedOrder.order_ref || selectedOrder.order_id} updated to "${
        editData.shipping_status
      }"`
    );
    handleCloseModal();
  };

  // ✅ Open "View Full Order" modal
  const handleViewOrder = (order: Order) => setViewOrder(order);
  const handleCloseViewOrder = () => setViewOrder(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-green-900">Manage Orders</h1>

          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            >
              <option value="All">All</option>
              {ALL_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            />

            <input
              type="text"
              placeholder="Filter by User ID..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            />

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <FileSpreadsheet size={18} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-600">
            No orders found for this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-900 text-white">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {order.order_ref || order.order_id.slice(0, 8)}
                    </td>
                    <td className="p-3 text-gray-700">{order.user_id}</td>
                    <td className="p-3 font-semibold text-green-800">
                      ₱{(order.total_amount / 100).toLocaleString("en-US")}
                    </td>
                    <td className="p-3 text-gray-700">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg border">
                        {order.shipping_status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 flex justify-center gap-3">
                      <button
                        onClick={() => handlePrintLabel(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Print Label"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="text-green-700 hover:text-green-900"
                        title="Update Order"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-gray-600 hover:text-gray-800"
                        title="View Full Order"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📝 Update Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <Close size={22} />
            </button>

            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Update Order
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Shipping Status
                </label>
                <select
                  value={editData.shipping_status || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      shipping_status: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  {EDITABLE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() =>
                  alert("🗑️ Archiving logic will go here (soft delete or flag)")
                }
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
              >
                <Archive size={16} /> Archive
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUpdate}
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👀 View Full Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl relative">
            <button
              onClick={handleCloseViewOrder}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <Close size={22} />
            </button>

            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Order Details
            </h2>

            <p className="text-gray-700 mb-4">
              <strong>Order ID:</strong>{" "}
              {viewOrder.order_ref || viewOrder.order_id}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>User ID:</strong> {viewOrder.user_id}
            </p>

            <table className="w-full text-left border border-gray-200 rounded-lg">
          <thead className="bg-green-900 text-white">
            <tr>
              <th className="p-2">Product Name</th>
              <th className="p-2 text-center">Quantity</th>
              <th className="p-2 text-right">Product Price</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {viewOrder.order_items.map((item) => (
              <tr key={item.order_item_id} className="border-b">
                <td className="p-2">
                  {item.products?.product_name || "Unknown Product"}
                </td>
                <td className="p-2 text-center">{item.order_item_quantity}</td>
                <td className="p-2 text-right">
                   ₱{(item.unit_price / 100).toLocaleString("en-US")}
                </td>
                <td className="p-2 text-right">
                  ₱{(item.subtotal / 100).toLocaleString("en-US")}
                </td>
              </tr>
            ))}
          </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <p className="text-lg font-semibold text-green-900">
                Total: ₱{(viewOrder.total_amount / 100).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
