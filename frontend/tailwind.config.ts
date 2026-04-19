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
        // ── BolKeOrder Desi Maximalist — Warm Woody Light Palette ──
        "bko-bg":        "#F5EDD8",   // warm parchment — global background
        "bko-surface":   "#FDF6E3",   // card surface — warm paper
        "bko-elevated":  "#FAF0CC",   // slightly deeper card
        "bko-border":    "#C8A96E",   // sandalwood border

        // Primary palette
        "bko-terracotta":"#C1440E",   // primary CTA terracotta
        "bko-saffron":   "#D4841A",   // saffron gold — accent / headlines
        "bko-turmeric":  "#D4841A",   // alias
        "bko-crimson":   "#C1440E",   // alias for terracotta
        "bko-gold":      "#D4841A",   // saffron gold

        // Text
        "bko-text":      "#4A2C0A",   // deep walnut — body text
        "bko-ivory":     "#4A2C0A",   // remapped: dark walnut on light bg
        "bko-muted":     "#7A5230",   // medium walnut muted
        "bko-dim":       "#A0784A",   // lighter warm dim

        // Accent kept for component compatibility
        "bko-peacock":   "#1A7A6E",
        "bko-indigo":    "#3D3B8E",
        "bko-lotus":     "#E75480",
        "bko-marigold":  "#FF9933",
        "bko-leaf":      "#4A7C59",

        // Legacy compat
        "bko-blue":      "#3D3B8E",
        "bko-cyan":      "#1A7A6E",
        "bko-green":     "#4A7C59",
        "bko-amber":     "#D4841A",
        "bko-red":       "#C1440E",
      },
      fontFamily: {
        display: ["var(--font-rosehot)", "serif"],
        heading: ["var(--font-quivert)", "sans-serif"],
        sans:    ["var(--font-quivert)", "system-ui", "sans-serif"],
        mono:    ["var(--font-quivert)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "mesh-hero":        "radial-gradient(at 30% 10%, #D4841A18 0px, transparent 55%), radial-gradient(at 80% 20%, #C1440E14 0px, transparent 55%)",
        "indian-pattern":   "url('/images/bg_pattern.png')",
        "gold-shimmer":     "linear-gradient(135deg, #D4841A 0%, #F5A623 50%, #D4841A 100%)",
        "saffron-gradient": "linear-gradient(135deg, #C1440E 0%, #D4841A 100%)",
        "festival-gradient":"linear-gradient(135deg, #C1440E 0%, #D4841A 50%, #F5C842 100%)",
      },
      animation: {
        "wave":          "wave 1.5s ease-in-out infinite",
        "pulse-slow":    "pulse 3s ease-in-out infinite",
        "float":         "float 3s ease-in-out infinite",
        "shimmer":       "shimmer 2.5s ease-in-out infinite",
        "spin-slow":     "spin 8s linear infinite",
        "rangoli-spin":  "spin 20s linear infinite",
        "flicker":       "flicker 2s ease-in-out infinite",
        "slide-up":      "slideUp 0.5s ease-out",
        "marquee":       "marquee 22s linear infinite",
      },
      keyframes: {
        wave:     { "0%,100%": { transform: "scaleY(0.4)" }, "50%": { transform: "scaleY(1)" } },
        float:    { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer:  { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        slideUp:  { from: { transform: "translateY(30px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        flicker:  { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.85" } },
        marquee:  { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      boxShadow: {
        "gold":     "0 4px 24px rgba(212, 132, 26, 0.20)",
        "saffron":  "0 4px 24px rgba(193, 68, 14, 0.20)",
        "crimson":  "0 4px 20px rgba(193, 68, 14, 0.18)",
        "festival": "0 8px 40px rgba(193, 68, 14, 0.15), 0 2px 8px rgba(212, 132, 26, 0.18)",
        "warm":     "0 2px 16px rgba(74, 44, 10, 0.10)",
        "inset-gold": "inset 0 0 0 2px rgba(212,132,26,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
