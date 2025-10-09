import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import linearLogo from "/DARK HORIZONTAL.png";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const { resetPassword, isChangingPassword } = useAuthStore();

  const tokenHash = searchParams.get("token_hash");
  const redirectUrl = searchParams.get("redirectUrl");
  let email = "";

  if (redirectUrl) {
    const urlParams = new URLSearchParams(new URL(redirectUrl).search);
    email = urlParams.get("email") || "";
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords are not matching!");

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email is ", email);
    console.log("Redirect URL:", redirectUrl);
    console.log("Token Hash:", tokenHash);
    const success = validateForm();
    if (success === true) resetPassword(formData.password, tokenHash!, email);
  };

  return (
    <>
    <div className="flex items-center justify-center bg-white rounded-badge p-8">
        <div className="flex flex-col w-full max-w-md p-8 space-y-8 justify-between">
          {/* Logo Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 group mb-12">
              <img
                src={linearLogo}
                alt="Logo"
                className="w-auto h-12 rounded-xl"
              />
            </div>
            <h2 className="text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-500">
              Reset <br /> Password
            </h2>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="form-control">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered rounded-xl w-full pl-10"
                  placeholder="Enter new password"
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

            <div className="form-control">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered rounded-xl w-full pl-10"
                  placeholder="Enter new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
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

            <button
              type="submit"
              className="btn bg-primary text-white w-full hover:bg-secondary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  {" "}
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
