import { useAuthStore } from "../../store/useAuthStore";
import { Navigate, Link } from "react-router-dom";

const AdminDashboard = () => {
  const { authUser } = useAuthStore();

  if (!authUser) return <Navigate to="/auth/login" />;
  if (authUser.role_id !== 2) return <Navigate to="/" />; // redirect if not admin

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users */}
        <Link
          to="/admin/users"
          className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="font-semibold text-lg">Users</h2>
          <p className="text-gray-500 text-sm">Manage registered users</p>
        </Link>

        {/* Orders */}
        <Link
          to="/admin/view-product"
          className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="font-semibold text-lg">Products</h2>
          <p className="text-gray-500 text-sm">
            Add, edit, and remove products
          </p>
        </Link>

        {/* Products */}
        <Link
          to="/admin/placeholder"
          className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="font-semibold text-lg">Placeholder</h2>
          <p className="text-gray-500 text-sm">placeholder description</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
