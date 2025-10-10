import supabase from "../lib/supabase";

export interface User {
  user_id: string;
  user_fname: string;
  user_lname: string;
  user_email: string;
  user_municipality?: string;
  user_province?: string;
  user_barangay?: string;
  phone_number?: string;
  points?: number;
  role_id: number;
  created_at: string;
  roles?: { role_name: string } | { role_name: string }[];
}

export const userService = {
  // Fetch all users with their roles
  async fetchAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        user_id,
        user_fname,
        user_lname,
        user_email,
        user_municipality,
        user_province,
        user_barangay,
        phone_number,
        points,
        role_id,
        created_at,
        roles(role_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }

    return data as User[];
  },

  // Update user role
  async updateUserRole(userId: string, newRoleId: number): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ role_id: newRoleId })
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error updating user role:", error);
      throw error;
    }
  },

  // Update user points
  async updateUserPoints(userId: string, newPoints: number): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ points: newPoints })
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error updating user points:", error);
      throw error;
    }
  },

  // Delete/deactivate user (you might want soft delete instead)
  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error deleting user:", error);
      throw error;
    }
  },

  // Get user order statistics
  async getUserOrderStats(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, total_amount, order_status")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error fetching user orders:", error);
      throw error;
    }

    const totalOrders = data?.length || 0;
    const totalSpent =
      data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    return {
      totalOrders,
      totalSpent,
    };
  },
};
