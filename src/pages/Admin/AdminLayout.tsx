import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-green-950 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold">SoilTrack</h2>
        <nav className="flex flex-col space-y-3">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/users">Manage Users</Link>
          <Link to="/admin/orders">Manage Orders</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
