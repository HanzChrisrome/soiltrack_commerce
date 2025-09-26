import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useLocations } from "../../hooks/useLocations"; // PSGC API hook
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const { signup, login, isSigningUp } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    user_fname: "",
    user_lname: "",
    email: "",
    password: "",
    phone_number: "",
    region: "",
    region_name: "",
    province: "",
    province_name: "",
    city: "",
    city_name: "",
    barangay: "",
    barangay_name: "",
    street: "",
  });

  // Locations hook (PSGC API)
  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = useLocations();

  const validateStepOne = () => {
    if (!formData.user_fname.trim())
      return toast.error("First name is required");
    if (!formData.user_lname.trim())
      return toast.error("Last name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.password.trim()) return toast.error("Password is required");
    if (formData.password.length < 8)
      return toast.error("Password must be at least 8 characters long");
    return true;
  };

  const validateStepTwo = () => {
    if (!formData.phone_number.trim())
      return toast.error("Phone number is required");
    if (!formData.region) return toast.error("Region is required");
    if (!formData.province) return toast.error("Province is required");
    if (!formData.city) return toast.error("City is required");
    if (!formData.barangay) return toast.error("Barangay is required");
    if (!formData.street.trim()) return toast.error("Street is required");
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStepOne() === true) setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStepTwo() === true) {
      setShowConfirm(true); // open confirmation modal
    }
  };

  const handleConfirmSignup = async () => {
    setShowConfirm(false);
    await signup(formData);
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-col justify-center text-center space-y-12">
        <h2 className="text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
          Create <br /> an Account
        </h2>

        {/* Step 1: Account Info */}
        {step === 1 && (
          <form onSubmit={handleNext} className="flex flex-col space-y-6">
            <input
              type="text"
              className="input input-bordered rounded-xl w-full"
              placeholder="First Name"
              value={formData.user_fname}
              onChange={(e) =>
                setFormData({ ...formData, user_fname: e.target.value })
              }
              required
            />

            <input
              type="text"
              className="input input-bordered rounded-xl w-full"
              placeholder="Last Name"
              value={formData.user_lname}
              onChange={(e) =>
                setFormData({ ...formData, user_lname: e.target.value })
              }
              required
            />

            <div className="form-control">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-base-content/40" />
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

            <div className="form-control">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-base-content/40" />
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

            <button
              type="submit"
              className="btn bg-primary text-white w-full"
              disabled={isSigningUp}
            >
              Next
            </button>
          </form>
        )}

        {/* Step 2: Contact & Address */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            {/* Phone */}
            <div className="form-control">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-base-content/40" />
                <input
                  type="text"
                  className="input input-bordered rounded-xl w-full pl-10"
                  placeholder="Phone Number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Location Selects */}
            <div className="form-control space-y-3">
              <select
                className="select select-bordered w-full"
                value={formData.region}
                onChange={(e) => {
                  const selected = regions.find(
                    (r) => r.code === e.target.value
                  );
                  setFormData({
                    ...formData,
                    region: selected?.code || "",
                    region_name: selected?.name || "",
                    province: "",
                    province_name: "",
                    city: "",
                    city_name: "",
                    barangay: "",
                    barangay_name: "",
                  });
                  fetchProvinces(e.target.value);
                }}
                required
              >
                <option value="">Select Region</option>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={formData.province}
                onChange={(e) => {
                  const selected = provinces.find(
                    (p) => p.code === e.target.value
                  );
                  setFormData({
                    ...formData,
                    province: selected?.code || "",
                    province_name: selected?.name || "",
                    city: "",
                    city_name: "",
                    barangay: "",
                    barangay_name: "",
                  });
                  fetchCities(e.target.value);
                }}
                required
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={formData.city}
                onChange={(e) => {
                  const selected = cities.find(
                    (c) => c.code === e.target.value
                  );
                  setFormData({
                    ...formData,
                    city: selected?.code || "",
                    city_name: selected?.name || "",
                    barangay: "",
                    barangay_name: "",
                  });
                  fetchBarangays(e.target.value);
                }}
                required
              >
                <option value="">Select City/Municipality</option>
                {cities.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={formData.barangay}
                onChange={(e) => {
                  const selected = barangays.find(
                    (b) => b.code === e.target.value
                  );
                  setFormData({
                    ...formData,
                    barangay: selected?.code || "",
                    barangay_name: selected?.name || "",
                  });
                }}
                required
              >
                <option value="">Select Barangay</option>
                {barangays.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Street"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex w-full space-x-4">
              <button
                type="button"
                className="btn w-1/2 bg-gray-200 text-black"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn w-1/2 bg-primary text-white"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 space-y-4">
            <h3 className="text-xl font-semibold">Confirm Registration</h3>
            <p className="text-sm text-gray-600">
              Please confirm that your details are correct before finishing
              registration.
            </p>
            <ul className="text-left text-sm space-y-1">
              <li>
                <strong>Name:</strong> {formData.user_fname}{" "}
                {formData.user_lname}
              </li>
              <li>
                <strong>Email:</strong> {formData.email}
              </li>
              <li>
                <strong>Phone:</strong> {formData.phone_number}
              </li>
              <li>
                <strong>Address:</strong> {formData.street},{" "}
                {formData.barangay_name}, {formData.city_name},{" "}
                {formData.province_name}, {formData.region_name}
              </li>
            </ul>

            <div className="flex justify-end space-x-3">
              <button
                className="btn bg-gray-200 text-black"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-primary text-white"
                onClick={handleConfirmSignup}
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Section */}
      <div className="text-center font-semibold mt-6">
        <p className="text-center font-light">
          By creating an account you agree to{" "}
          <span className="font-semibold">SoilTrack's</span>{" "}
          <span className="text-secondary font-semibold">
            Terms of Services
          </span>{" "}
          and
          <span className="text-secondary font-semibold">
            {" "}
            Privacy Policy.{" "}
          </span>
        </p>
        <p>
          Already have an account?{" "}
          <Link to="/auth/login" className="text-secondary cursor-pointer">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignupForm;
