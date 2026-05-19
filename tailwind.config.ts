import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        border: "#222222",
        "text-primary": "#f0ede8",
        "text-secondary": "#888888",
        "text-muted": "#444444",
        accent: "#d4af7a",
        "accent-dim": "rgba(212, 175, 122, 0.15)",
        glow: "rgba(240, 237, 232, 0.06)",
        crisis: "#c0392b",
        "crisis-dim": "rgba(192, 57, 43, 0.15)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Libre Baskerville", "Georgia", "serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.4",
            filter: "drop-shadow(0 0 8px rgba(212, 175, 122, 0.3))",
          },
          "50%": {
            opacity: "1",
            filter: "drop-shadow(0 0 20px rgba(212, 175, 122, 0.6))",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
