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
        // ── Indian Maximalist BolKeOrder Design System ──
        // Warm base
        "bko-bg":        "#1A0A00",   // deep burnt umber — rich night-market dark
        "bko-surface":   "#2B1200",   // dark saffron-wood
        "bko-elevated":  "#3D1A00",   // elevated card surface
        "bko-border":    "#8B4513",   // saddle brown border

        // Primary palette — festival saffron/turmeric
        "bko-saffron":   "#E8631A",   // primary saffron-orange
        "bko-turmeric":  "#F5A623",   // turmeric gold
        "bko-crimson":   "#C0392B",   // deep festival red
        "bko-gold":      "#D4AF37",   // antique gold
        "bko-ivory":     "#FAF0DC",   // warm ivory / cream

        // Accent palette — peacock & rangoli
        "bko-peacock":   "#1A7A6E",   // peacock teal-green
        "bko-indigo":    "#3D3B8E",   // deep indigo (flag-inspired)
        "bko-lotus":     "#E75480",   // lotus pink
        "bko-marigold":  "#FF9933",   // marigold orange
        "bko-leaf":      "#4A7C59",   // paan leaf green

        // Text
        "bko-text":      "#FAF0DC",   // warm ivory text
        "bko-muted":     "#C4A882",   // warm muted text
        "bko-dim":       "#8B6F47",   // very dim text

        // Legacy compat
        "bko-blue":      "#3D3B8E",
        "bko-cyan":      "#1A7A6E",
        "bko-green":     "#4A7C59",
        "bko-amber":     "#D4AF37",
        "bko-red":       "#C0392B",
      },
      fontFamily: {
        display: ["var(--font-rosehot)", "serif"],
        heading: ["var(--font-quivert)", "sans-serif"],
        sans:    ["var(--font-quivert)", "system-ui", "sans-serif"],
        mono:    ["var(--font-quivert)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "mesh-hero":        "radial-gradient(at 30% 10%, #E8631A22 0px, transparent 55%), radial-gradient(at 80% 20%, #D4AF3722 0px, transparent 55%), radial-gradient(at 10% 80%, #C0392B18 0px, transparent 55%)",
        "indian-pattern":   "url('/images/bg_pattern.png')",
        "gold-shimmer":     "linear-gradient(135deg, #D4AF37 0%, #F5A623 50%, #D4AF37 100%)",
        "saffron-gradient": "linear-gradient(135deg, #E8631A 0%, #F5A623 100%)",
        "festival-gradient":"linear-gradient(135deg, #C0392B 0%, #E8631A 50%, #F5A623 100%)",
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
      },
      keyframes: {
        wave:     { "0%,100%": { transform: "scaleY(0.4)" }, "50%": { transform: "scaleY(1)" } },
        float:    { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer:  { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        slideUp:  { from: { transform: "translateY(30px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        flicker:  { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.85" } },
      },
      boxShadow: {
        "gold":     "0 4px 24px rgba(212, 175, 55, 0.35)",
        "saffron":  "0 4px 24px rgba(232, 99, 26, 0.40)",
        "crimson":  "0 4px 20px rgba(192, 57, 43, 0.35)",
        "festival": "0 8px 40px rgba(232, 99, 26, 0.25), 0 2px 8px rgba(212, 175, 55, 0.3)",
        "inset-gold": "inset 0 0 0 2px rgba(212,175,55,0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
