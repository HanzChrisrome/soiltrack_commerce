import { useState } from "react";
import { Menu, X } from "lucide-react"; // hamburger + close icons

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
              href="#about"
              className=" hover:text-green-600 font-semibold tracking-tight"
            >
              About
            </a>
            <a
              href="#features"
              className=" hover:text-green-600 font-semibold tracking-tight"
            >
              Features
            </a>
            <a
              href="#shop"
              className=" hover:text-green-600 font-semibold tracking-tight"
            >
              Shop
            </a>
            <a
              href="#sustainability"
              className=" hover:text-green-600 font-semibold tracking-tight"
            >
              Sustainability
            </a>
            <a
              href="#contact"
              className=" hover:text-green-600 font-semibold tracking-tight"
            >
              Contact
            </a>
          </div>
        </div>

        {/* CTA + Mobile Button */}
        <div className="flex items-center space-x-4">
          <button className="hidden md:block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">
            Get SoilTrack
          </button>

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
            href="#shop"
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
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">
            Get SoilTrack
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
