import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Dashboard/LandingPage";
import AuthRoutes from "./routes/AuthRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import ShopRoutes from "./routes/ShopRoutes"; // ✅ import shop routes
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

const App = () => {
  const { checkAuth, isAuthLoaded } = useAuthStore();

  useEffect(() => {
    checkAuth(); // ✅ restore session on refresh
  }, [checkAuth]);

  if (!isAuthLoaded) {
    return <div>Loading...</div>; // or a spinner
  }

  return (
    <div data-theme="lightTheme">
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth-related Routes (Login, Register, etc.) */}
        {AuthRoutes()}

        {/* Admin Dashboard Routes */}
        {AdminRoutes()}

        {/* Shop / Client-Facing Routes */}
        {ShopRoutes()}
      </Routes>
    </div>
  );
};

export default App;
