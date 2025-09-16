import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Dashboard/LandingPage";
import AuthRoutes from "./routes/AuthRoutes";

const App = () => {
  return (
    <div data-theme="lightTheme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {AuthRoutes()}
      </Routes>
    </div>
  );
};

export default App;
