import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.vue", "./components/**/*.vue"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.blue[200],
          border: colors.blue[500],
          foreground: colors.blue[500],
          hover: colors.blue[500],
          "hover-foreground": colors.blue[200],
        },
        secondary: {
          DEFAULT: "transparent",
          border: colors.slate[400],
          foreground: colors.slate[500],
          hover: colors.slate[400],
          "hover-foreground": colors.slate[200],
        },
        accent: {
          DEFAULT: colors.red[200],
          border: colors.red[500],
          foreground: colors.red[500],
          hover: colors.red[500],
          "hover-foreground": colors.red[200],
        },
        link: {
          DEFAULT: colors.blue[400],
          hover: colors.blue[500],
          visited: colors.violet[300],
          muted: colors.slate[300],
          "muted-hover": colors.slate[500],
        },
        input: {
          DEFAULT: colors.slate[50],
          border: colors.slate[400],
          foreground: colors.slate[700],
          placeholder: colors.slate[400],
          focus: colors.blue[50],
          "focus-border": colors.blue[500],
          "focus-foreground": colors.blue[900],
          "focus-placeholder": colors.blue[300],
          error: colors.red[50],
          "error-border": colors.red[500],
          "error-foreground": colors.red[900],
          "error-placeholder": colors.red[300],
          label: colors.slate[500],
          warning: colors.red[700],
        },
        card: {
          DEFAULT: colors.slate[100],
          border: colors.slate[400],
          ring: colors.slate[300],
          foreground: colors.slate[700],
          shadow: colors.black,
        },
        domain: {
          bg: colors.slate[800],
          text: colors.white,
          particle: colors.violet[200],
          accent: {
            DEFAULT: colors.violet[300],
            dim: colors.violet[600],
            glow: colors.violet[200],
            subtle: colors.violet[700],
            ring: colors.violet[500],
          },
          detail: {
            DEFAULT: colors.fuchsia[400],
            dim: colors.fuchsia[600],
            glow: colors.fuchsia[300],
            bracket: colors.fuchsia[400],
            shadow: colors.fuchsia[500],
          },
          ray: {
            DEFAULT: colors.indigo[400],
            dim: colors.indigo[600],
          },
          slash: {
            red: colors.rose[600],
            redGlow: colors.rose[800],
            redStart: colors.rose[700],
          },
          slashBlue: {
            DEFAULT: colors.indigo[800],
            dark: colors.indigo[950],
            glow: colors.indigo[600],
          },
          overlay: {
            scanline: colors.black,
            veil: colors.violet[900],
            crt: colors.slate[950],
          },
          corner: {
            pink: colors.rose[400],
            purple: colors.indigo[400],
          },
        },
      },
      opacity: {
        3: "0.03",
        4: "0.04",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
        22: "0.22",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        80: "0.8",
      },
      boxShadow: {
        "transparent-sm": "2px 2px 0 0 rgba(0, 0, 0, 0.25)",
        "transparent-md": "4px 4px 0 0 rgba(0, 0, 0, 0.25)",
        "transparent-lg": "6px 6px 0 0 rgba(0, 0, 0, 0.25)",
      },
      fontFamily: {
        sans: ["Pixelify Sans", "monospace"],
        alt: ["Rajdhani", "sans-serif"],
      },
      animation: {
        "domain-ring-breathe": "domain-ring-breathe 18s ease-in-out infinite",
        "domain-ray-pulse": "domain-ray-pulse 22s ease-in-out infinite",
        "domain-bracket-blink": "domain-bracket-blink 6s steps(1) infinite",
        "domain-slow-rotate":
          "domain-slow-rotate 60s ease-in-out infinite alternate",
        "domain-seal-flicker": "domain-seal-flicker 20s steps(1) infinite",
        "domain-particle-float":
          "domain-particle-float var(--pdur, 10s) ease-in-out infinite",
        "domain-corner-pulse": "domain-corner-pulse 8s ease-in-out infinite",
        "domain-pulse-glow": "domain-pulse-glow 14s ease-in-out infinite",
        "domain-veil-pulse": "domain-veil-pulse 20s ease-in-out infinite",
        "domain-streak-slide": "domain-streak-slide 24s ease-in-out infinite",
        "domain-crt": "domain-crt 0.15s steps(1) infinite",
      },
      keyframes: {
        "domain-ring-breathe": {
          "0%, 100%": { strokeOpacity: "0.3" },
          "50%": { strokeOpacity: "0.9" },
        },
        "domain-ray-pulse": {
          "0%, 100%": { strokeOpacity: "0.2" },
          "50%": { strokeOpacity: "0.6" },
        },
        "domain-bracket-blink": {
          "0%, 90%, 100%": { opacity: "1" },
          "91%": { opacity: "0" },
          "95%": { opacity: "1" },
          "96%": { opacity: "0" },
        },
        "domain-slow-rotate": {
          from: { transform: "translate(50px, 50px) rotate(15deg)" },
          to: { transform: "translate(50px, 50px) rotate(60deg)" },
        },
        "domain-seal-flicker": {
          "0%, 100%": { opacity: "0.5" },
          "48%": { opacity: "0.9" },
          "50%": { opacity: "0.1" },
          "51%": { opacity: "0.9" },
          "52%": { opacity: "0.1" },
          "53%": { opacity: "0.9" },
        },
        "domain-particle-float": {
          "0%": { opacity: "0", transform: "translateY(0px)" },
          "10%, 90%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
        "domain-corner-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "domain-pulse-glow": {
          "0%, 100%": { opacity: "0.04" },
          "50%": { opacity: "0.1" },
        },
        "domain-veil-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "domain-streak-slide": {
          "0%": { opacity: "0", transform: "translateX(-5%)" },
          "15%, 85%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateX(5%)" },
        },
        "domain-crt": {
          "0%, 100%": { boxShadow: "inset 0 0 0px rgba(0,0,0,0)" },
          "50%": { boxShadow: "inset 0 0 40px rgba(2,6,23,0.04)" },
        },
      },
    },
  },
  plugins: [],
};
