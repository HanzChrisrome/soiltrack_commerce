import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Menu,
  X,
  UserCog,
  Package,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { authUser, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full bg-gray-100 text-black px-6 py-4 flex justify-between items-center shadow-md">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/DARK HORIZONTAL.png"
            alt="SoilTrack Logo"
            className="w-36 h-auto"
          />
          <span className="hidden text-gray-500 md:block font-bold text-xl tracking-wide">
            Commerce
          </span>
        </div>

        {/* Desktop Menu (centered links) */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link
            to="/admin"
            className="hover:text-green-700 font-medium flex items-center gap-2"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="hover:text-green-700 font-medium flex items-center gap-2"
          >
            <UserCog size={18} /> Users
          </Link>
          <Link
            to="/admin/manage-orders"
            className="hover:text-green-700 font-medium flex items-center gap-2"
          >
            <ShoppingBag size={18} /> Orders
          </Link>
          <Link
            to="/admin/view-product"
            className="hover:text-green-700 font-medium flex items-center gap-2"
          >
            <Package size={18} /> Products
          </Link>
        </div>

        {/* Profile Dropdown (right side) */}
        {authUser && (
          <div className="hidden md:flex relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-green-700"
            >
              <UserCog size={20} />
              <ChevronDown size={16} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 border rounded-lg shadow-lg py-2">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setProfileOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-100 text-black px-6 py-4 space-y-4">
          <Link
            to="/admin"
            className="block hover:text-green-700 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block hover:text-green-700 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Manage Users
          </Link>
          <Link
            to="/admin/manage-orders"
            className="block hover:text-green-700 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/products"
            className="block hover:text-green-700 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Manage Products
          </Link>

          {authUser && (
            <>
              <Link
                to="/profile"
                className="block hover:text-green-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left hover:text-green-700 font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
