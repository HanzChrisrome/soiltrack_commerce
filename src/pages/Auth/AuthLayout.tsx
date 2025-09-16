import { Outlet } from "react-router-dom";
import backgroundLightImage from "../../assets/background/square-flower.jpg";
import linearDarkLogo from "../../../public/DARK HORIZONTAL.png";

const AuthLayout = () => {
  return (
    <div className="h-screen grid lg:grid-cols-2 py-5 px-8 bg-base-100">
      {/* Left Side */}
      <div
        className="relative items-center justify-center hidden lg:block rounded-badge"
        style={{
          backgroundImage: `url(${backgroundLightImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Right Side */}
      <div className="flex justify-center rounded-badge">
        <div className="flex flex-col py-8 w-full max-w-md space-y-8 justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <img
                src={linearDarkLogo}
                alt="Logo"
                className="w-auto h-12 rounded-xl"
              />
            </div>
          </div>
          {/* Form Section */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
