import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#17372f",
        "forest-light": "#245344",
        gold: "#c89d48",
        "gold-light": "#f0d58f",
        cream: "#f5f3eb",
        ink: "#24352f",
        muted: "#65746b",
      },
    },
  },
  plugins: [],
};

export default config;
