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
        paper: "#f5efe4",
        ink: "#1c1916",
        margin: "#b7a78f",
        stamp: "#9e3329",
        dossier: "#4d5f67",
        washblue: "#6f848f",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        dossier: "0 1px 2px rgba(28, 25, 22, 0.10), 0 8px 22px rgba(28, 25, 22, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
