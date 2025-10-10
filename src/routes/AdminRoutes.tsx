// routes/AdminRoutes.tsx
import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import RoleProtectedRoute from "../helper/RoleProtectedRoute";
import ViewProducts from "../pages/Admin/ViewProducts";
import OrdersAdmin from "../pages/Admin/ManageOrders";
import Analytics from "../pages/Admin/Analytics";
import ManageUsers from "../pages/Admin/ManageUsers";
import ViewInquiries from "../pages/Admin/ViewInquiries";

const AdminRoutes = () => (
  <>
    <Route
      path="admin"
      element={
        <RoleProtectedRoute allowedRoles={[2]}>
          <AdminLayout />
        </RoleProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="view-product" element={<ViewProducts />} />
      <Route path="manage-orders" element={<OrdersAdmin />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="view-inquiries" element={<ViewInquiries />} />
    </Route>
  </>
);

export default AdminRoutes;
