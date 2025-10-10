import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  UserCog,
  Package,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  BarChart2,
  // ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", to: "/admin/dashboard", Icon: LayoutDashboard },

    { name: "Orders", to: "/admin/manage-orders", Icon: ShoppingBag },
    { name: "Products", to: "/admin/view-product", Icon: Package },
    { name: "Sales Report", to: "/admin/analytics", Icon: BarChart2 },
    {
      name: "Refund Request",
      to: "/admin/view-refund-request",
      Icon: Package,
    },
    { name: "Inquiries", to: "/admin/view-inquiries", Icon: ShoppingBag },
    { name: "Users", to: "/admin/users", Icon: UserCog },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r transition-all duration-200 flex flex-col h-screen sticky top-0 overflow-auto ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div
          className={`flex items-center border-b py-4 ${
            isOpen ? "justify-between px-4" : "justify-center"
          }`}
        >
          {isOpen && (
            <img
              src="/DARK HORIZONTAL.png"
              alt="SoilTrack Logo"
              className="h-8 w-auto"
            />
          )}

          <button
            aria-label="Toggle sidebar"
            onClick={() => setIsOpen((s) => !s)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navItems.map(({ name, to, Icon }) => {
              const active =
                location.pathname === to ||
                (to !== "/admin" && location.pathname.startsWith(to + "/"));
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center ${
                      isOpen ? "justify-start gap-3 px-3" : "justify-center"
                    } py-2 rounded-md transition-colors ${
                      active
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        active ? "text-green-700" : "text-gray-500"
                      }`}
                    />
                    {isOpen && (
                      <span className="text-sm font-medium">{name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-2 border-t">
          <div className="space-y-2">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              {isOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content (right) */}
      <main className="flex-1 overflow-auto">
        <div className="py-6">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() => setIsOpen((s) => !s)}
              className="p-2 rounded-md bg-white shadow-sm"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="bg-transparent">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
