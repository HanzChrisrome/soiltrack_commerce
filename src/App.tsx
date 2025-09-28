import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Dashboard/LandingPage";
import AuthRoutes from "./routes/AuthRoutes";
import AdminRoutes from "./routes/AdminRoutes"; // ✅ import admin routes
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
        <Route path="/" element={<LandingPage />} />
        {AuthRoutes()}
        {AdminRoutes()}
      </Routes>
    </div>
  );
};

export default App;
