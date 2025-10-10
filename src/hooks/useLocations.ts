import { useEffect, useState } from "react";

export interface ILocation {
  code: string;
  name: string;
}

export const useLocations = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const fetchRegions = async () => {
    const res = await fetch("https://psgc.gitlab.io/api/regions/");
    setRegions(await res.json());
  };

  const fetchProvinces = async (regionCode: string) => {
    const res = await fetch(
      `https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`
    );
    setProvinces(await res.json());
  };

  const fetchCities = async (provinceCode: string) => {
    const res = await fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`
    );
    setCities(await res.json());
  };

  const fetchBarangays = async (cityCode: string) => {
    const res = await fetch(
      `https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`
    );
    setBarangays(await res.json());
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  };
};
