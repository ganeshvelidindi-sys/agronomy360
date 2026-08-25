import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          DEFAULT: "#1a5c2a",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          DEFAULT: "#f5a623",
        },
        earth: {
          50:  "#fdf8f0",
          100: "#faefd9",
          200: "#f5ddb0",
          300: "#edc67c",
          400: "#e4a94a",
          500: "#d4882a",
          DEFAULT: "#8B6914",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": "linear-gradient(135deg, #1a5c2a 0%, #2d8a4e 50%, #f5a623 100%)",
        "card-gradient": "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(26,92,42,0.08)",
        "card-hover": "0 8px 40px rgba(26,92,42,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
