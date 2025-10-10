import { create } from "zustand";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import supabase from "../lib/supabase";

// AuthUser shape for your session state
export type AuthUser = {
  user_id: string;
  user_email: string;
  user_fname: string;
  user_lname: string;
  user_municipality: string; // stored in UPPERCASE
  user_province: string; // stored in UPPERCASE
  user_barangay: string; // stored in UPPERCASE
  role_id: number;
  role_name: string;
  points: number; // Add this
};

// Raw Supabase user data shape
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
  points: number; // Add this
};

interface AuthState {
  authUser: AuthUser | null;
  isAuthLoaded: boolean;
  hasCheckedAuth: boolean; // ✅ NEW
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isCheckingAuth: boolean;
  isLoggingOut: boolean;
  isForgotPassword: boolean;
  isChangingPassword: boolean;
  setAuthUser: (user: AuthUser | null) => void;

  checkAuth: () => Promise<void>;
  signup: (data: {
    user_fname: string;
    user_lname: string;
    email: string;
    password: string;
    phone_number: string;
    region: string;
    region_name: string;
    province: string;
    province_name: string;
    city: string;
    city_name: string;
    barangay: string;
    barangay_name: string;
    street: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    password: string,
    token: string,
    email: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isAuthLoaded: false,
  hasCheckedAuth: false, // ✅ NEW
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: false,
  isForgotPassword: false,
  isChangingPassword: false,
  isLoggingOut: false,

  checkAuth: async () => {
    if (get().hasCheckedAuth) {
      return; // ✅ Prevent multiple re-checks
    }

    set({ isCheckingAuth: true });

    try {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        set({ authUser: null, isAuthLoaded: true, hasCheckedAuth: true });
        return;
      }

      const { data: userLoggedIn, error: userError } = await supabase
        .from("users")
        .select(
          "user_id, user_email, user_fname, user_lname, user_municipality, user_province, user_barangay, role_id, roles(role_name), points"
        )
        .eq("user_id", data.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        set({ authUser: null, isAuthLoaded: true, hasCheckedAuth: true });
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
        points: userData.points, // Add this
      };

      set({ authUser: user, isAuthLoaded: true, hasCheckedAuth: true });
    } catch (err) {
      console.error("Error during checkAuth:", err);
      set({ authUser: null, isAuthLoaded: true, hasCheckedAuth: true });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User not created");

      const user_id = authData.user.id;

      try {
        // insert into users
        const { error: userError } = await supabase.from("users").insert([
          {
            user_id,
            user_email: data.email,
            user_fname: data.user_fname,
            user_lname: data.user_lname,
            user_municipality: data.city_name.toUpperCase(),
            user_province: data.province_name.toUpperCase(),
            user_barangay: data.barangay_name.toUpperCase(),
            role_id: 3,
            phone_number: data.phone_number,
          },
        ]);
        if (userError) throw userError;

        // insert shipping address
        const { error: addressError } = await supabase
          .from("shipping_addresses")
          .insert([
            {
              user_id,
              region_code: data.region,
              region_name: data.region_name,
              province_code: data.province,
              province_name: data.province_name,
              city_code: data.city,
              city_name: data.city_name,
              barangay_code: data.barangay,
              barangay_name: data.barangay_name,
              street: data.street,
              is_default: true,
            },
          ]);
        if (addressError) throw addressError;

        // ✅ Auto-login: set authUser from Supabase
        set({ authUser: authData.user });
        console.log("Signup finished successfully", authData.user);
        toast.success("Signed up and logged in!");
      } catch (dbError) {
        await supabase.auth.admin.deleteUser(user_id).catch((cleanupErr) => {
          console.error("Failed to cleanup orphaned auth user:", cleanupErr);
        });
        throw dbError;
      }
    } catch (err) {
      console.error("Signup error:", err);
      const error = err as { message?: string };
      toast.error(error.message || "Failed to sign up!");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoggingIn: true });

    const { data, error: userError } = await supabase
      .from("users")
      .select(
        "user_id, user_email, user_fname, user_lname, user_municipality, user_province, user_barangay, role_id, roles(role_name), points"
      )
      .eq("user_email", email)
      .in("role_id", [1, 2, 3])
      .single();

    if (userError) {
      console.error("Supabase error:", userError);
      toast.error("No user found with this email.");
      set({ authUser: null, isLoggingIn: false });
      return;
    }

    const userData = data as SupabaseUserData;

    const { error } = await supabase.auth.signInWithPassword({
      email,
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
      points: userData.points,
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
  setAuthUser: (user) => set({ authUser: user }),
}));
