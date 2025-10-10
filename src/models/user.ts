//models/user.ts
export interface IUser {
  user_id: string;
  user_fname?: string | null;
  user_lname?: string | null;
  user_email?: string | null;
  phone_number?: string | null;
  user_municipality?: string | null;
  user_province?: string | null;
  user_barangay?: string | null;
  created_at: string;
  updated_at?: string | null;
  role_id?: number | null;
  points?: number | null;
  is_associated?: boolean | null;
}

export interface IOrderSummary {
  order_id: string;
  order_ref?: string | null;
  total_amount: number; // in centavos
  order_status: string;
  created_at: string;
}

export interface IProfilePageData {
  profile: IUser;
  orders: IOrderSummary[];
}

export interface IShippingAddress {
  address_id: string;
  user_id: string;
  street: string;
  is_default?: boolean | null;
  created_at?: string;
  updated_at?: string;
  region_code?: string | null;
  region_name?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  city_code?: string | null;
  city_name?: string | null;
  barangay_code?: string | null;
  barangay_name?: string | null;
}

// helpers

export interface IProfilePageData {
  profile: IUser;
  orders: IOrderSummary[];
  addresses?: IShippingAddress[];
}

export const getFullName = (user: IUser) =>
  `${user.user_fname ?? ""} ${user.user_lname ?? ""}`.trim();

export const getFullAddress = (user: IUser) =>
  `${user.user_barangay ?? ""}, ${user.user_municipality ?? ""}, ${
    user.user_province ?? ""
  }`.replace(/^, |, , |, $/g, "");
