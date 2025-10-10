import { useEffect, useState, useMemo } from "react";
import { userService, type User } from "../../services/userService";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  X as Close,
  UserCog,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Award,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/sparkels.json";

const ITEMS_PER_PAGE = 12;

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // User stats for detail view
  const [userStats, setUserStats] = useState<{
    totalOrders: number;
    totalSpent: number;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    role_id: 3,
    points: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.fetchAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Get role name helper
  const getRoleName = (user: User): string => {
    if (!user.roles) return "User";
    return Array.isArray(user.roles)
      ? user.roles[0]?.role_name || "User"
      : user.roles.role_name || "User";
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.user_fname?.toLowerCase().includes(searchLower) ||
          u.user_lname?.toLowerCase().includes(searchLower) ||
          u.user_email?.toLowerCase().includes(searchLower) ||
          u.user_id?.toLowerCase().includes(searchLower)
      );
    }

    if (roleFilter !== "All") {
      result = result.filter((u) => {
        const roleName = getRoleName(u);
        return roleName === roleFilter;
      });
    }

    return result;
  }, [users, search, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Handle view user
  const handleViewUser = async (user: User) => {
    setViewUser(user);
    try {
      const stats = await userService.getUserOrderStats(user.user_id);
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStats({ totalOrders: 0, totalSpent: 0 });
    }
  };

  const handleCloseViewUser = () => {
    setViewUser(null);
    setUserStats(null);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditFormData({
      role_id: user.role_id,
      points: user.points || 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;

    try {
      // Update role if changed
      if (editFormData.role_id !== editUser.role_id) {
        await userService.updateUserRole(
          editUser.user_id,
          editFormData.role_id
        );
      }

      // Update points if changed
      if (editFormData.points !== (editUser.points || 0)) {
        await userService.updateUserPoints(
          editUser.user_id,
          editFormData.points
        );
      }

      toast.success("User updated successfully!");
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  // Handle delete user
  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    try {
      await userService.deleteUser(deleteUser.user_id);
      toast.success("User deleted successfully!");
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="">
      <div className="px-8 mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 text-transparent bg-clip-text mb-3">
          Manage Users
        </h1>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg p-4 mb-2 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
              <option value="Customer">Customer</option>
            </select>
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
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-12 text-gray-500 italic">
              No users found for this filter.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                        Name
                      </th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                        Email
                      </th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                        Role
                      </th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                        Location
                      </th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                        Points
                      </th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">
                        Joined
                      </th>
                      <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-gray-900 text-sm">
                            {user.user_fname} {user.user_lname}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="text-sm text-gray-700">
                            {user.user_email}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2.5 py-1 text-xs border rounded-md font-medium ${
                              user.role_id === 2
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {getRoleName(user)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {user.user_municipality || "N/A"}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-gray-900 text-sm">
                          {user.points?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1.5 rounded-md text-yellow-600 hover:bg-yellow-50 transition-colors"
                              title="Edit User"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteUser(user)}
                              className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseViewUser}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <Close size={22} />
            </button>

            <h2 className="text-2xl font-bold text-green-900 mb-6">
              User Details
            </h2>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <UserCog className="text-green-900 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold">
                      {viewUser.user_fname} {viewUser.user_lname}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-green-900 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{viewUser.user_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="text-green-900 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold">
                      {viewUser.phone_number || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="text-green-900 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="font-semibold text-green-800">
                      {viewUser.points?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCog className="text-green-900 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-semibold">{getRoleName(viewUser)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-green-900 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-semibold">
                      {new Date(viewUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 pt-4 border-t">
                <MapPin className="text-green-900 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold">
                    {[
                      viewUser.user_barangay,
                      viewUser.user_municipality,
                      viewUser.user_province,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Order Stats */}
              {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="text-green-900 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="font-semibold text-lg">
                        {userStats.totalOrders}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="text-green-900 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="font-semibold text-lg text-green-800">
                        ₱{(userStats.totalSpent / 100).toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseViewUser}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setEditUser(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <Close size={22} />
            </button>

            <h2 className="text-2xl font-bold text-green-900 mb-6">
              Edit User
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name
                </label>
                <p className="text-gray-800 font-semibold">
                  {editUser.user_fname} {editUser.user_lname}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role_id}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      role_id: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value={2}>Admin</option>
                  <option value={3}>User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={editFormData.points}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      points: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setDeleteUser(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <Close size={22} />
            </button>

            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Delete User
            </h2>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {deleteUser.user_fname} {deleteUser.user_lname}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
