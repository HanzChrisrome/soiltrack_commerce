import { useEffect, useState } from "react";
import { inquiryService, type Inquiry } from "../../services/inquiryService";
import { Mail, User, Calendar, Trash2, Search } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Navigate } from "react-router-dom";

const ViewInquiries = () => {
  const { authUser } = useAuthStore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const data = await inquiryService.getAllInquiries();
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inquiry_id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      setDeletingId(inquiry_id);
      await inquiryService.deleteInquiry(inquiry_id);
      setInquiries(inquiries.filter((i) => i.inquiry_id !== inquiry_id));
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      alert("Failed to delete inquiry");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInquiries = inquiries.filter(
    (i) =>
      i.user_name.toLowerCase().includes(search.toLowerCase()) ||
      i.user_email.toLowerCase().includes(search.toLowerCase()) ||
      i.user_inquiry.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!authUser) return <Navigate to="/auth/login" />;
  if (authUser.role_id !== 2) return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading inquiries...</div>
      </div>
    );
  }

  return (
    <div className="px-8 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-900 text-transparent bg-clip-text">
          Customer Inquiries
        </h1>
        <p className="text-gray-600">
          Manage and respond to customer inquiries from the landing page
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(inquiries.map((i) => i.user_email)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  inquiries.filter(
                    (i) =>
                      new Date(i.created_at || "").toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {search
              ? "No inquiries found matching your search"
              : "No inquiries yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.inquiry_id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {inquiry.user_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${inquiry.user_email}`}
                          className="hover:text-green-700 hover:underline"
                        >
                          {inquiry.user_email}
                        </a>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {inquiry.user_inquiry}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(inquiry.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(inquiry.inquiry_id!)}
                    disabled={deletingId === inquiry.inquiry_id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete inquiry"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInquiries;
