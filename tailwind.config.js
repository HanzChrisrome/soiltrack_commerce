import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {},
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        darkTheme: {
          primary: "#FFFFFF",
          secondary: "#FFFFFF",
          accent: "#FFFFFF",
          neutral: "#f0f0f0",
          "base-100": "#252525",
          "base-200": "#1f1f1f",
          "base-300": "#121212",
          info: "#3a86ff",
          success: "#23d160",
          warning: "#ffcc00",
          error: "#f14668",
        },
        lightTheme: {
          primary: "#134f14",
          secondary: "#178219",
          accent: "#78ce1b",
          neutral: "#757575",
          "base-100": "#ffffff",
          "base-200": "#e5e7e9",
          "base-300": "#f0f3f4",
          info: "#3a86ff",
          success: "#52c776",
          warning: "#f7e39b",
          error: "#f09e9e",
        },
      },
    ],
  },
};
