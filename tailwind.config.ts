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
        primary: {
          DEFAULT: "#0E5F6B",
          foreground: "#FFFFFF",
          hover: "#0A4A54",
        },
        background: "#F2F5F6",
        surface: "#FFFFFF",
        foreground: "#1A2B30",
        muted: {
          DEFAULT: "#5A6B70",
          foreground: "#5A6B70",
        },
        border: "#D5DEE1",
        ring: "#0E5F6B",
        severity: {
          red: "#C44536",
          yellow: "#C49A1A",
          green: "#2A7A55",
        },
        destructive: {
          DEFAULT: "#C44536",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E4EBED",
          foreground: "#1A2B30",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A2B30",
        },
        input: "#D5DEE1",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26, 43, 48, 0.04), 0 4px 12px rgba(26, 43, 48, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
