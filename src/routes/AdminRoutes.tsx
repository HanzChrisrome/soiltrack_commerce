// routes/AdminRoutes.tsx
import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminAddProduct from "../pages/Admin/AddProduct";
import RoleProtectedRoute from "../helper/RoleProtectedRoute";
import ViewProducts from "../pages/Admin/ViewProducts";

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
      <Route path="add-product" element={<AdminAddProduct />} />
      <Route path="view-product" element={<ViewProducts />} />
    </Route>
  </>
);

export default AdminRoutes;
