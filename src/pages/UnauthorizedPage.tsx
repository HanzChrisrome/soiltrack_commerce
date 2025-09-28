// pages/UnauthorizedPage.tsx
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Unauthorized Access</h1>
      <p className="text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/auth/login")}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
