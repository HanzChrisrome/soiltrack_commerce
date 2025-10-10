// src/views/UserProfilePage.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../widgets/Navbar";
import { useAuthStore } from "../store/useAuthStore";
import { fetchUserProfileData } from "../services/userProfileService";
import type { IProfilePageData, IUser, IOrderSummary } from "../models/user";

const formatCurrency = (centavos: number) =>
  `₱${(centavos / 10000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Badge: React.FC<{ status?: string }> = ({ status }) => {
  const base = "px-3 py-1 rounded-full text-sm font-semibold";
  if (!status)
    return <span className={`${base} bg-gray-100 text-gray-700`}>Pending</span>;
  if (status === "To Ship")
    return (
      <span className={`${base} bg-orange-100 text-orange-700`}>{status}</span>
    );
  if (status === "To Receive")
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>
    );
  if (status === "Delivered")
    return (
      <span className={`${base} bg-green-100 text-green-700`}>{status}</span>
    );
  if (status === "Cancelled")
    return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
  return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
};

const UserProfilePage: React.FC = () => {
  const { authUser } = useAuthStore();
  const [data, setData] = useState<IProfilePageData | null>(null);
  const [loading, setLoading] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditAddresses, setShowEditAddresses] = useState(false);

  const [profileDraft, setProfileDraft] = useState<Partial<IUser>>({});
  const [addressesDraft, setAddressesDraft] = useState({
    shipping_address: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!authUser?.user_id) return;
      setLoading(true);
      try {
        const res = await fetchUserProfileData(authUser.user_id);
        setData(res);

        setProfileDraft({
          user_fname: res.profile.user_fname ?? "",
          user_lname: res.profile.user_lname ?? "",
          phone_number: res.profile.phone_number ?? "",
        });

        setAddressesDraft({
          shipping_address: res.profile.user_barangay
            ? `${res.profile.user_barangay}, ${
                res.profile.user_municipality ?? ""
              }, ${res.profile.user_province ?? ""}`
            : "",
        });
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser]);

  if (!authUser)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-6 shadow">
          Please log in to view profile.
        </div>
      </div>
    );

  const onSaveProfile = () => {
    if (!data) return;
    setData({ ...data, profile: { ...data.profile, ...profileDraft } });
    setShowEditProfile(false);
  };

  const onSaveAddresses = () => {
    if (!data) return;
    setData({ ...data, profile: { ...data.profile, ...addressesDraft } });
    setShowEditAddresses(false);
  };

  const exportOrdersCSV = (orders: IOrderSummary[]) => {
    const rows = [
      ["Order Ref", "Total (PHP)", "Status", "Created At"],
      ...orders.map((o) => [
        o.order_ref ?? o.order_id,
        (o.total_amount / 100).toFixed(2),
        o.order_status,
        new Date(o.created_at).toLocaleString(),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${authUser.user_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top row: Profile + Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Profile</h2>
                  <p className="text-sm text-gray-500">Account details</p>
                </div>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold">
                    {data?.profile.user_fname} {data?.profile.user_lname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg">{data?.profile.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg">{data?.profile.phone_number ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="text-lg">
                    {data
                      ? new Date(data.profile.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Points Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">My Points</h2>
                  <p className="text-sm text-gray-500">Loyalty & rewards</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Points</p>
                  <p className="text-4xl font-bold text-green-900">
                    {data?.profile.points ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle row: Addresses + Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Addresses</h2>
                  <p className="text-sm text-gray-500">Shipping</p>
                </div>
                <button
                  onClick={() => setShowEditAddresses(true)}
                  className="bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit Addresses
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="text-base">
                    {addressesDraft.shipping_address ||
                      "No shipping address provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Quick Stats
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Orders (last 90 days)
                  </span>
                  <span className="font-semibold">
                    {data?.orders.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Points (current)
                  </span>
                  <span className="font-semibold">
                    {data?.profile.points ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Order History */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Order History
                </h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => data && exportOrdersCSV(data.orders)}
                  className="bg-white border border-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Export
                </button>
                <button
                  onClick={() => window.location.assign("/my-orders")}
                  className="bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  View All Orders
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="p-3">Order</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : data?.orders.length ? (
                    data.orders.slice(0, 10).map((o) => (
                      <tr key={o.order_id} className="border-t">
                        <td className="p-3 font-medium">
                          {o.order_ref ?? o.order_id.slice(0, 8)}
                        </td>
                        <td className="p-3">
                          {formatCurrency(o.total_amount)}
                        </td>
                        <td className="p-3">
                          <Badge status={o.order_status} />
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(o.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
