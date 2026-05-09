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
        paper: "#f4efe6",
        ink: "#1c1916",
        margin: "#c9bca8",
        stamp: "#a63d32",
        dossier: "#5c6b73",
        washblue: "#7a8d96",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        dossier: "0 1px 2px rgba(28, 25, 22, 0.08), 0 4px 12px rgba(28, 25, 22, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
