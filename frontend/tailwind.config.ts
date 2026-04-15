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
        // BolKeOrder SaaS Design System
        "bko-bg":       "#0A0F1E",
        "bko-surface":  "#111827",
        "bko-elevated": "#1F2937",
        "bko-border":   "#374151",
        "bko-blue":     "#2563EB",
        "bko-cyan":     "#06B6D4",
        "bko-green":    "#10B981",
        "bko-amber":    "#F59E0B",
        "bko-red":      "#EF4444",
        "bko-text":     "#F9FAFB",
        "bko-muted":    "#9CA3AF",
        // Voice demo palette (peach/mauve)
        peach:    "#F7C1BB",
        mauve:    "#885A5A",
        slate:    "#353A47",
        sage:     "#84B082",
        magenta:  "#DC136C",
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jb-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-hero": "radial-gradient(at 40% 20%, #2563EB22 0px, transparent 50%), radial-gradient(at 80% 0%, #06B6D422 0px, transparent 50%), radial-gradient(at 20% 80%, #10B98111 0px, transparent 50%)",
      },
      animation: {
        "wave": "wave 1.5s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        wave: { "0%,100%": { transform: "scaleY(0.4)" }, "50%": { transform: "scaleY(1)" } },
        slideIn: { from: { transform: "translateX(-100%)", opacity: "0" }, to: { transform: "translateX(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};
export default config;
