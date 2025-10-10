import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "./store/useAuthStore";
import useThemeStore from "./store/useThemeStore";

import LandingPage from "./pages/Dashboard/LandingPage";
import Unauthorized from "./pages/UnauthorizedPage";

import AuthRoutes from "./routes/AuthRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import ShopRoutes from "./routes/ShopRoutes";

const App = () => {
  const { authUser, checkAuth, isAuthLoaded } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Shop / Client-Facing Routes */}
        {ShopRoutes()}

        {/* Admin Dashboard Routes (requires authUser) */}
        {authUser ? (
          AdminRoutes()
        ) : (
          <Route path="/admin/*" element={<Navigate to="/login" />} />
        )}

        {/* Auth-related Routes (Login, Register, etc.) */}
        {AuthRoutes()}

        {/* Unauthorized fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
