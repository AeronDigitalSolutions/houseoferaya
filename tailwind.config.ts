import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          100: "#F7F3EE",
          200: "#EEE8E0"
        },
        royal: {
          700: "#2A2927",
          800: "#1D1C1A"
        },
        gold: {
          500: "#A9895F"
        }
      },
      boxShadow: {
        soft: "0 20px 40px rgba(36, 34, 31, 0.09)",
        tactile: "0 12px 24px rgba(36, 34, 31, 0.15)",
        luxe: "0 8px 30px rgba(36, 34, 31, 0.08), inset 0 1px 0 rgba(255,255,255,0.65)"
      },
      backgroundImage: {
        "eraya-texture": "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.72), transparent 36%), radial-gradient(circle at 80% 22%, rgba(169,137,95,0.2), transparent 36%), radial-gradient(circle at 24% 86%, rgba(38,36,33,0.08), transparent 44%), linear-gradient(140deg, #F7F3EE 0%, #EFE9E1 50%, #FBF8F4 100%)"
      },
      borderRadius: {
        luxury: "1.5rem"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
