import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom"; // ✅ import useNavigate
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn, authUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      if (authUser.role_id === 2) {
        navigate("/admin/dashboard"); // redirect admins
      } else {
        navigate("/"); // redirect customers / non-admins
      }
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;
    await login(email, password);
  };

  return (
    <>
      <div className="flex flex-col justify-center text-center space-y-12">
        <h2 className="text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
          Sign in to <br /> your Account
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* Email input */}
          <div className="form-control">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-base-content/40" />
              </div>
              <input
                type="email"
                className="input input-bordered rounded-xl w-full pl-10"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-control">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-base-content/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered rounded-xl w-full pl-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-base-content/40" />
                ) : (
                  <Eye className="h-5 w-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-secondary">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Loading...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      <div className="text-center font-semibold">
        <p>
          Don't have an account?{" "}
          <Link to="/auth/signup" className="text-secondary cursor-pointer">
            Create an Account
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
