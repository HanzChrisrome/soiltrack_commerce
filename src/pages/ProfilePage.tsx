import React, { useEffect, useState } from "react";
import Navbar from "../widgets/Navbar";
import { useAuthStore } from "../store/useAuthStore";
import { fetchUserProfileData } from "../services/userProfileService";
import { useLocations } from "../hooks/useLocations";
import type {
  IProfilePageData,
  IUser,
  IOrderSummary,
  IShippingAddress,
} from "../models/user";

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
  const [addresses, setAddresses] = useState<IShippingAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<IShippingAddress | null>(
    null
  );
  const [showDefaultConfirm, setShowDefaultConfirm] = useState(false);
  const [addressToDefault, setAddressToDefault] =
    useState<IShippingAddress | null>(null);

  const [profileDraft, setProfileDraft] = useState<Partial<IUser>>({});

  const [addressForm, setAddressForm] = useState<Partial<IShippingAddress>>({});

  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = useLocations();

  // Load user profile + addresses
  useEffect(() => {
    const load = async () => {
      if (!authUser?.user_id) return;
      setLoading(true);
      try {
        const res = await fetchUserProfileData(authUser.user_id);
        setData(res);
        setAddresses(res.addresses || []);
        setProfileDraft({
          user_fname: res.profile.user_fname ?? "",
          user_lname: res.profile.user_lname ?? "",
          phone_number: res.profile.phone_number ?? "",
        });
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser]);

  // Save profile
  const saveProfileToSupabase = async () => {
    if (!authUser?.user_id) return;
    const updates: any = {};
    if (profileDraft.user_fname !== undefined)
      updates.user_fname = profileDraft.user_fname;
    if (profileDraft.user_lname !== undefined)
      updates.user_lname = profileDraft.user_lname;
    if (profileDraft.phone_number !== undefined)
      updates.phone_number = profileDraft.phone_number;
    if (Object.keys(updates).length === 0) return;
    const { default: supabase } = await import("../lib/supabase");
    await supabase
      .from("users")
      .update(updates)
      .eq("user_id", authUser.user_id);
  };

  const onSaveProfile = () => {
    if (!data) return;
    setData({ ...data, profile: { ...data.profile, ...profileDraft } });
    saveProfileToSupabase();
    setShowEditProfile(false);
  };

  // 🟢 Address CRUD
  const openAddAddressModal = () => {
    setIsEditingAddress(false);
    setAddressForm({});
    setShowAddressModal(true);
  };

  const openEditAddressModal = (address: IShippingAddress) => {
    setIsEditingAddress(true);
    setAddressToEdit(address);
    setAddressForm(address);
    if (address.region_code) fetchProvinces(address.region_code);
    if (address.province_code) fetchCities(address.province_code);
    if (address.city_code) fetchBarangays(address.city_code);
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    if (!authUser?.user_id) return;
    const { default: supabase } = await import("../lib/supabase");

    if (
      !addressForm.street ||
      !addressForm.region_code ||
      !addressForm.province_code ||
      !addressForm.city_code ||
      !addressForm.barangay_code
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (isEditingAddress && addressToEdit) {
      await supabase
        .from("shipping_addresses")
        .update({
          ...addressForm,
          updated_at: new Date().toISOString(),
        })
        .eq("address_id", addressToEdit.address_id);
    } else {
      await supabase.from("shipping_addresses").insert([
        {
          ...addressForm,
          user_id: authUser.user_id,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    const { data: updatedAddresses } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", authUser.user_id)
      .order("created_at", { ascending: true });

    setAddresses(updatedAddresses || []);
    setShowAddressModal(false);
  };

  const deleteAddress = async (id: string) => {
    if (!authUser?.user_id) return;
    if (!confirm("Are you sure you want to delete this address?")) return;

    const { default: supabase } = await import("../lib/supabase");
    await supabase.from("shipping_addresses").delete().eq("address_id", id);

    setAddresses((prev) => prev.filter((a) => a.address_id !== id));
  };

  // 🟩 Set Default Address
  const confirmSetDefault = (address: IShippingAddress) => {
    setAddressToDefault(address);
    setShowDefaultConfirm(true);
  };

  const handleSetDefault = async () => {
    if (!authUser?.user_id || !addressToDefault) return;
    const { default: supabase } = await import("../lib/supabase");

    await supabase
      .from("shipping_addresses")
      .update({ is_default: false })
      .eq("user_id", authUser.user_id);

    await supabase
      .from("shipping_addresses")
      .update({ is_default: true })
      .eq("address_id", addressToDefault.address_id);

    const { data: updatedAddresses } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", authUser.user_id)
      .order("created_at", { ascending: true });

    setAddresses(updatedAddresses || []);
    setShowDefaultConfirm(false);
    setAddressToDefault(null);
  };

  if (!authUser)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-6 shadow">
          Please log in to view profile.
        </div>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile + Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Profile</h2>
                  <p className="text-sm text-gray-500">Account details</p>
                </div>
                {showEditProfile ? (
                  <div className="flex gap-2">
                    <button
                      onClick={onSaveProfile}
                      className="bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowEditProfile(false)}
                      className="bg-gray-300 text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  {showEditProfile ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profileDraft.user_fname ?? ""}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            user_fname: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-1/2"
                      />
                      <input
                        type="text"
                        value={profileDraft.user_lname ?? ""}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            user_lname: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-1/2"
                      />
                    </div>
                  ) : (
                    <p className="text-lg font-semibold">
                      {data?.profile.user_fname} {data?.profile.user_lname}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg">{data?.profile.user_email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {showEditProfile ? (
                    <input
                      type="text"
                      value={profileDraft.phone_number ?? ""}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          phone_number: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-lg">
                      {data?.profile.phone_number ?? "—"}
                    </p>
                  )}
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
              <h2 className="text-xl font-bold text-gray-800">My Points</h2>
              <p className="text-sm text-gray-500">Loyalty & rewards</p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">Current Points</p>
                <p className="text-4xl font-bold text-green-900">
                  {data?.profile.points ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Addresses</h2>
                <p className="text-sm text-gray-500">
                  Manage shipping addresses
                </p>
              </div>
              <button
                onClick={openAddAddressModal}
                className="bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                + Add Address
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {addresses.length === 0 ? (
                <p className="text-gray-500">No shipping addresses yet.</p>
              ) : (
                addresses.map((a) => (
                  <div
                    key={a.address_id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold">{a.street}</p>
                      <p className="text-sm text-gray-600">
                        {a.barangay_name}, {a.city_name}, {a.province_name},{" "}
                        {a.region_name}
                      </p>
                      {a.is_default && (
                        <span className="text-green-700 font-semibold text-sm">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEditAddressModal(a)}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(a.address_id)}
                        className="text-red-600 text-sm"
                      >
                        Delete
                      </button>
                      {!a.is_default && (
                        <button
                          onClick={() => confirmSetDefault(a)}
                          className="text-green-700 text-sm"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Default Modal */}
      {showDefaultConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-2">
              Change Default Address?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to set this as your default shipping
              address? This will replace your current default.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDefaultConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSetDefault}
                className="px-4 py-2 bg-green-700 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 space-y-4">
            <h3 className="text-lg font-semibold">
              {isEditingAddress ? "Edit Address" : "Add Address"}
            </h3>

            {/* Dropdowns */}
            <div className="space-y-2">
              <select
                className="select select-bordered w-full"
                value={addressForm.region_code || ""}
                onChange={(e) => {
                  const selected = regions.find(
                    (r: { code: string; name: string }) =>
                      r.code === e.target.value
                  );
                  setAddressForm({
                    ...addressForm,
                    region_code: selected?.code || "",
                    region_name: selected?.name || "",
                    province_code: "",
                    province_name: "",
                    city_code: "",
                    city_name: "",
                    barangay_code: "",
                    barangay_name: "",
                  });
                  fetchProvinces(selected?.code || "");
                }}
              >
                <option value="">Select Region</option>
                {regions.map((r: { code: string; name: string }) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={addressForm.province_code || ""}
                onChange={(e) => {
                  const selected = provinces.find(
                    (p: { code: string; name: string }) =>
                      p.code === e.target.value
                  );
                  setAddressForm({
                    ...addressForm,
                    province_code: selected?.code || "",
                    province_name: selected?.name || "",
                    city_code: "",
                    city_name: "",
                    barangay_code: "",
                    barangay_name: "",
                  });
                  fetchCities(selected?.code || "");
                }}
              >
                <option value="">Select Province</option>
                {provinces.map((p: { code: string; name: string }) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={addressForm.city_code || ""}
                onChange={(e) => {
                  const selected = cities.find(
                    (c: { code: string; name: string }) =>
                      c.code === e.target.value
                  );
                  setAddressForm({
                    ...addressForm,
                    city_code: selected?.code || "",
                    city_name: selected?.name || "",
                    barangay_code: "",
                    barangay_name: "",
                  });
                  fetchBarangays(selected?.code || "");
                }}
              >
                <option value="">Select City</option>
                {cities.map((c: { code: string; name: string }) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={addressForm.barangay_code || ""}
                onChange={(e) => {
                  const selected = barangays.find(
                    (b: { code: string; name: string }) =>
                      b.code === e.target.value
                  );
                  setAddressForm({
                    ...addressForm,
                    barangay_code: selected?.code || "",
                    barangay_name: selected?.name || "",
                  });
                }}
              >
                <option value="">Select Barangay</option>
                {barangays.map((b: { code: string; name: string }) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Street"
                value={addressForm.street || ""}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className="px-4 py-2 bg-green-700 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfilePage;
