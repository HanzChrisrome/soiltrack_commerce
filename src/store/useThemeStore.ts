import { create } from "zustand";

interface ThemeState {
  theme: string;
  setTheme: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem("theme") || "light",
  setTheme: () => {
    const newTheme =
      localStorage.getItem("theme") === "lightTheme"
        ? "darkTheme"
        : "lightTheme";
    localStorage.setItem("theme", newTheme);
    set({ theme: newTheme });
  },
}));

export default useThemeStore;
