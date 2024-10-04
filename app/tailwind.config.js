import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            primary: "#4ade80",

            secondary: "#e879f9",

            accent: "#0c4a6e",

            neutral: "#1f2937",

            "base-100": "#1c1917",

            info: "#0000ff",
          
            success: "#4ade80",
          
            warning: "#fbbf24",
          
            danger: "#ff0000",
          },
        },
      },
    }),
  ],
};
