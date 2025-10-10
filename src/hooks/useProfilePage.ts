import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  fetchUserProfileData,
  saveProfileToSupabase,
} from "../services/profileService";
import { addressService } from "../services/addressService";
import { useLocations } from "../hooks/useLocations";
import type { IProfilePageData, IUser, IShippingAddress } from "../models/user";

export const useProfilePage = () => {
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
  const locations = useLocations();

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

  const onSaveProfile = async () => {
    if (!authUser?.user_id || !data) return;
    setData({ ...data, profile: { ...data.profile, ...profileDraft } });
    await saveProfileToSupabase(authUser.user_id, profileDraft);
    setShowEditProfile(false);
  };

  const openAddAddressModal = () => {
    setIsEditingAddress(false);
    setAddressForm({});
    setShowAddressModal(true);
  };

  const openEditAddressModal = (address: IShippingAddress) => {
    setIsEditingAddress(true);
    setAddressToEdit(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    if (!authUser?.user_id) return;
    await addressService.saveAddress(
      authUser.user_id,
      addressForm,
      isEditingAddress,
      addressToEdit
    );
    const updated = await addressService.fetchAddresses(authUser.user_id);
    setAddresses(updated);
    setShowAddressModal(false);
  };

  const deleteAddress = async (id: string) => {
    if (!authUser?.user_id) return;
    await addressService.deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.address_id !== id));
  };

  const confirmSetDefault = (address: IShippingAddress) => {
    setAddressToDefault(address);
    setShowDefaultConfirm(true);
  };

  const handleSetDefault = async () => {
    if (!authUser?.user_id || !addressToDefault) return;
    await addressService.setDefaultAddress(
      authUser.user_id,
      addressToDefault.address_id
    );
    const updated = await addressService.fetchAddresses(authUser.user_id);
    setAddresses(updated);
    setShowDefaultConfirm(false);
    setAddressToDefault(null);
  };

  return {
    authUser,
    data,
    addresses,
    loading,
    showEditProfile,
    setShowEditProfile,
    profileDraft,
    setProfileDraft,
    showAddressModal,
    setShowAddressModal,
    isEditingAddress,
    addressForm,
    setAddressForm,
    showDefaultConfirm,
    setShowDefaultConfirm,
    openAddAddressModal,
    openEditAddressModal,
    saveAddress,
    deleteAddress,
    confirmSetDefault,
    handleSetDefault,
    onSaveProfile,
    locations,
  };
};
