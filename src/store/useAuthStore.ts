import { create } from "zustand";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import supabase from "../lib/supabase";
import { axiosInstance } from "../lib/axios";

export type AuthUser = {
  user_id: string;
  user_email: string;
  user_fname: string;
  user_lname: string;
  user_municipality: string;
  user_province: string;
  user_barangay: string;
  role_id: number;
  role_name: string;
};

type SupabaseUserData = {
  user_id: string;
  user_email: string;
  user_fname: string;
  user_lname: string;
  user_municipality: string;
  user_province: string;
  user_barangay: string;
  role_id: number;
  roles?: { role_name: string } | { role_name: string }[];
};

interface AuthState {
  authUser: AuthUser | null;
  isAuthLoaded: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isCheckingAuth: boolean;
  isLoggingOut: boolean;
  isForgotPassword: boolean;
  isChangingPassword: boolean;

  checkAuth: () => Promise<void>;
  signup: (data: { email: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    password: string,
    token: string,
    email: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  isAuthLoaded: false,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: false,
  isForgotPassword: false,
  isChangingPassword: false,
  isLoggingOut: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        set({ authUser: null, isAuthLoaded: true });
        return;
      }

      const { data: userLoggedIn, error: userError } = await supabase
        .from("users")
        .select(
          "user_id, user_email, user_fname, user_lname, user_municipality, user_province, user_barangay, role_id, roles(role_name)"
        )
        .eq("user_id", data.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        set({ authUser: null, isAuthLoaded: true });
        return;
      }

      const userData = userLoggedIn as SupabaseUserData;

      const roleName = Array.isArray(userData.roles)
        ? userData.roles[0]?.role_name
        : userData.roles?.role_name;

      const user: AuthUser = {
        user_id: userData.user_id,
        user_email: userData.user_email,
        user_fname: userData.user_fname,
        user_lname: userData.user_lname,
        user_municipality: userData.user_municipality,
        user_province: userData.user_province,
        user_barangay: userData.user_barangay,
        role_id: userData.role_id,
        role_name: roleName ?? "User",
      };

      set({ authUser: user, isAuthLoaded: true });
    } catch (err) {
      console.error("Error during checkAuth:", err);
      set({ authUser: null, isAuthLoaded: true });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      await axiosInstance.post("/auth/signup", data);
      toast.success("Signed up successfully!");
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage =
        (error.response?.data as { message: string }).message ||
        "Failed to sign up!";
      toast.error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (emailOrUsername: string, password: string) => {
    set({ isLoggingIn: true });

    const { data, error: userError } = await supabase
      .from("users")
      .select(
        "user_id, user_email, user_fname, user_lname, user_municipality, user_province, user_barangay, role_id, roles(role_name)"
      )
      .eq("user_email", emailOrUsername)
      .in("role_id", [1, 2])
      .single();

    if (userError) {
      console.error(
        "Full Supabase error object:",
        JSON.stringify(userError, null, 2)
      );
      toast.error("No user found with this email or username.");
      set({ authUser: null, isLoggingIn: false });
      return;
    }

    const userData = data as SupabaseUserData;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });

    if (error) {
      toast.error(error.message || "Failed to log in!");
      set({ authUser: null, isLoggingIn: false });
      return;
    }

    const roleName = Array.isArray(userData.roles)
      ? userData.roles[0]?.role_name
      : userData.roles?.role_name;

    const user: AuthUser = {
      user_id: userData.user_id,
      user_email: userData.user_email,
      user_fname: userData.user_fname,
      user_lname: userData.user_lname,
      user_municipality: userData.user_municipality,
      user_province: userData.user_province,
      user_barangay: userData.user_barangay,
      role_id: userData.role_id,
      role_name: roleName ?? "User",
    };

    set({ authUser: user, isLoggingIn: false });
  },

  forgotPassword: async (email: string) => {
    set({ isForgotPassword: true });
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("Password reset email sent successfully!");
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage =
        (error.response?.data as { message: string }).message ||
        "Failed to send password reset email!";
      toast.error(errorMessage);
    } finally {
      set({ isForgotPassword: false });
    }
  },

  resetPassword: async (password: string, token: string, email: string) => {
    set({ isChangingPassword: true });

    try {
      await axiosInstance.post("/auth/reset-password", {
        password,
        token,
        email,
      });
      toast.success("Password changed successfully!");
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage =
        (error.response?.data as { message: string }).message ||
        "Failed to change password!";
      toast.error(errorMessage);
    } finally {
      set({ isChangingPassword: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    toast.loading("Logging out...");

    const { error } = await supabase.auth.signOut();

    if (error) toast.error(error.message || "Failed to log out!");

    set({ authUser: null, isLoggingOut: false });
    toast.dismiss();
    toast.success("Logged out successfully!");
  },
}));
