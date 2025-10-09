import { Navigate, Route } from "react-router-dom";
import AuthLayout from "../pages/Auth/AuthLayout";
import LoginForm from "../pages/Auth/LoginPage";
import SignupForm from "../pages/Auth/SignupForm";

const AuthRoutes = () => (
  <Route path="/auth" element={<AuthLayout />}>
    <Route index element={<Navigate to="login" />} />
    <Route path="login" element={<LoginForm />} />
    <Route path="signup" element={<SignupForm />} />
  </Route>
);

export default AuthRoutes;
