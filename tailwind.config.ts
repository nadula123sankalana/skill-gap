import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#22C39E",
          "teal-dark": "#11A385",
          "teal-light": "#5FDCC0",
          blue: "#3B82F6",
          indigo: "#4F46E5",
          violet: "#7C6CF0",
        },
        ink: {
          950: "#080D18",
          900: "#0B1220",
          800: "#121B2C",
          700: "#1B2740",
          600: "#2A3854",
        },
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
          hover: "#2563EB",
        },
        background: "#FFFFFF",
        subtle: "#F6F7FC",
        surface: "#FFFFFF",
        foreground: "#121B2C",
        muted: {
          DEFAULT: "#5B6580",
          foreground: "#5B6580",
        },
        border: "#E5E9F2",
        ring: "#3B82F6",
        severity: {
          red: "#E5484D",
          yellow: "#EA9A16",
          green: "#17B981",
        },
        destructive: {
          DEFAULT: "#E5484D",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#EEF2FE",
          foreground: "#121B2C",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#121B2C",
        },
        input: "#E5E9F2",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        sans: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      backgroundImage: {
        "mesh-hero":
          "radial-gradient(ellipse 70% 60% at 78% 22%, #2BC9A3 0%, transparent 62%), radial-gradient(ellipse 60% 55% at 8% 4%, #4F7DF0 0%, transparent 60%), radial-gradient(ellipse 65% 60% at 4% 96%, #7C6CF0 0%, transparent 58%), radial-gradient(ellipse 80% 70% at 96% 92%, #17B99A 0%, transparent 60%), linear-gradient(135deg, #4F6BE8 0%, #2FA9C0 48%, #22C39E 100%)",
        "brand-band":
          "linear-gradient(120deg, #17B994 0%, #22C39E 45%, #2ECFA8 100%)",
        "brand-pill": "linear-gradient(120deg, #3B82F6 0%, #7C6CF0 100%)",
        "ink-band": "linear-gradient(180deg, #0B1220 0%, #101A2C 100%)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 18, 32, 0.04), 0 8px 24px rgba(11, 18, 32, 0.06)",
        lift: "0 12px 32px rgba(11, 18, 32, 0.12), 0 2px 8px rgba(11, 18, 32, 0.06)",
        glass:
          "0 8px 32px rgba(8, 13, 24, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.24)",
        glow: "0 0 0 1px rgba(59, 130, 246, 0.16), 0 12px 36px rgba(59, 130, 246, 0.22)",
      },
      keyframes: {
        "dot-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "dot-pulse": "dot-pulse 1.8s ease-in-out infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
