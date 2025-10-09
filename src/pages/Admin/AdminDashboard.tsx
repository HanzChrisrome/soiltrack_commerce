import { useAuthStore } from "../../store/useAuthStore";
import { Navigate, Link } from "react-router-dom";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"; // ✅ lucide-react icons

const AdminDashboard = () => {
  const { authUser } = useAuthStore();

  if (!authUser) return <Navigate to="/auth/login" />;
  if (authUser.role_id !== 2) return <Navigate to="/" />; // redirect if not admin

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Welcome Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome Back!</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Sales */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <h3 className="text-2xl font-bold text-green-900">₱15,250</h3>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <h3 className="text-2xl font-bold text-blue-600">45</h3>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <h3 className="text-2xl font-bold text-orange-500">12</h3>
            </div>
          </div>

          {/* New Users */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">New Users</p>
              <h3 className="text-2xl font-bold text-purple-600">3</h3>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Users */}
            <Link
              to="/admin/users"
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start gap-2"
            >
              <Users className="h-6 w-6 text-green-900" />
              <h4 className="font-semibold text-lg text-green-900">Users</h4>
              <p className="text-gray-500 text-sm">Manage registered users</p>
            </Link>

            {/* Products */}
            <Link
              to="/admin/view-product"
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start gap-2"
            >
              <Package className="h-6 w-6 text-green-900" />
              <h4 className="font-semibold text-lg text-green-900">Products</h4>
              <p className="text-gray-500 text-sm">
                Add, edit, and remove products
              </p>
            </Link>

            {/* Orders */}
            <Link
              to="/admin/orders"
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start gap-2"
            >
              <ShoppingCart className="h-6 w-6 text-green-900" />
              <h4 className="font-semibold text-lg text-green-900">Orders</h4>
              <p className="text-gray-500 text-sm">
                View and manage customer orders
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
