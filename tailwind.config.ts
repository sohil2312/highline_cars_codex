import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        border: "#000000",
        background: "#fff7f0",
        foreground: "#000000",
        accent: "#f97316",
        accentSoft: "#ffe8d6",
        accentBlue: "#0ea5e9",
        ok: "#1f9d55",
        minor: "#f59e0b",
        major: "#dc2626",
        muted: "#f5f5f5",
        mutedForeground: "#404040"
      },
      boxShadow: {
        brutal: "6px 6px 0 #000"
      }
    }
  },
  plugins: []
};

export default config;
