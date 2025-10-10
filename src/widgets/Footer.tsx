import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-300 py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Column */}
        <div className="md:col-span-2">
          <img
            src="../public/DARK HORIZONTAL.png"
            alt="SoilTrack Logo"
            className="h-8 mb-4 brightness-0 invert"
          />
          <p className="text-sm text-gray-400 mb-4 max-w-md">
            SoilTrack is a smart farming system designed to help farmers monitor
            soil moisture and nutrient levels. Grow more and waste less with
            confidence.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <span className="text-xl">f</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <span className="text-xl">𝕏</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <span className="text-xl">📷</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Installation Guide
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 transition-colors">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>© 2024 SoilTrack. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Made with 💚 for Filipino Farmers</p>
      </div>
    </div>
  </footer>
);

export default Footer;
