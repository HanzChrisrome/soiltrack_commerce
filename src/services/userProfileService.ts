import supabase from "../lib/supabase";
import type { IUser, IOrderSummary, IProfilePageData } from "../models/user";

export const fetchUserProfileData = async (
  userId: string
): Promise<IProfilePageData> => {
  // fetch user
  const { data: userData, error: userError } = await supabase
    .from<IUser>("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (userError || !userData) throw userError ?? new Error("User not found");

  // fetch orders
  const { data: ordersData, error: ordersError } = await supabase
    .from<IOrderSummary>("orders")
    .select("order_id, order_ref, total_amount, order_status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;

  const orders: IOrderSummary[] = (ordersData ?? []).map((o) => ({
    order_id: o.order_id,
    order_ref: o.order_ref,
    total_amount: Number(o.total_amount ?? 0) * 100, // to centavos
    order_status: o.order_status ?? "Pending",
    created_at: o.created_at ?? new Date().toISOString(),
  }));

  return {
    profile: userData,
    orders,
  };
};
