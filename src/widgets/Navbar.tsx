import { useState } from "react";
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // ✅ adjust path

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { authUser, logout } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-300 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="../public/DARK HORIZONTAL.png"
            alt="SoilTrack Logo"
            className="w-36 h-auto"
          />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8 pl-10">
            <a
              href="#features"
              className="hover:text-green-600 font-semibold tracking-tight"
            >
              Features
            </a>
            <a
              href="/shop"
              className="hover:text-green-600 font-semibold tracking-tight"
            >
              Shop
            </a>
            <a
              href="#contact"
              className="hover:text-green-600 font-semibold tracking-tight"
            >
              Contact
            </a>
          </div>
        </div>

        {/* CTA + Mobile Button */}
        <div className="flex items-center space-x-4 relative">
          {!authUser ? (
            // Logged OUT
            <Link
              to="/auth/login"
              className="hidden md:block bg-green-900 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
            >
              Login
            </Link>
          ) : (
            // Logged IN
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/cart" className="text-gray-700 hover:text-green-700">
                <ShoppingCart size={24} />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-green-700 focus:outline-none"
                >
                  <User size={24} />
                  <ChevronDown size={16} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    ></button>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          <a
            href="#about"
            className="block text-gray-700 hover:text-green-600 font-medium"
          >
            About
          </a>
          <a
            href="#features"
            className="block text-gray-700 hover:text-green-600 font-medium"
          >
            Features
          </a>
          <a
            href="/shop"
            className="block text-gray-700 hover:text-green-600 font-medium"
          >
            Shop
          </a>
          <a
            href="#sustainability"
            className="block text-gray-700 hover:text-green-600 font-medium"
          >
            Sustainability
          </a>
          <a
            href="#contact"
            className="block text-gray-700 hover:text-green-600 font-medium"
          >
            Contact
          </a>

          {!authUser ? (
            <Link
              to="/auth/login"
              className="block w-full bg-green-900 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 text-center"
            >
              Login
            </Link>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/cart"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-700"
              >
                <ShoppingCart size={20} /> <span>Cart</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-700"
              >
                <User size={20} /> <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-700"
              >
                <LogOut size={20} /> <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
