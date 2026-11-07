import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],

  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  prefix: "",

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    fontFamily: {
      sans: ["var(--font-sans)"],
    },

    fontSize: {
      small: ["var(--text-small)", { lineHeight: "var(--leading-small)" }],
      medium: ["var(--text-medium)", { lineHeight: "var(--leading-medium)" }],
      large: ["var(--text-large)", { lineHeight: "var(--leading-large)" }],
      xs: ["var(--text-small)", { lineHeight: "var(--leading-small)" }],
      sm: ["var(--text-medium)", { lineHeight: "var(--leading-medium)" }],
      base: ["var(--text-medium)", { lineHeight: "var(--leading-medium)" }],
      "2xl": ["var(--text-large)", { lineHeight: "var(--leading-large)" }],
      lg: "var(--text-lg)",
      xl: "var(--text-xl)",
      "3xl": "var(--text-3xl)",
      "4xl": "var(--text-4xl)",
    },

    fontWeight: {
      regular: "400",
      semibold: "600",
      normal: "400",
      medium: "600",
    },

    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          hover: "var(--color-surface-hover)",
          canvas: "var(--color-canvas)",
          sidebar: "var(--color-sidebar)",
        },

        line: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
        },

        text: {
          primary: "var(--color-text)",
          secondary: "var(--color-text-secondary)",
          placeholder: "var(--color-text-placeholder)",
          inverse: "var(--color-text-inverse)",
          tertiary: "var(--color-text-tertiary)",
        },

        bone: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          muted: "var(--color-accent-muted)",
          subtle: "var(--color-accent-subtle)",
        },

        accentCopper: "var(--color-accent)",

        status: {
          success: "var(--color-success)",
          info: "var(--color-info)",
          warning: "var(--color-warning)",
          danger: "var(--color-danger)",
          neutral: "var(--color-neutral)",
        },

        task: {
          backlog: "var(--status-backlog)",
          progress: "var(--status-progress)",
          review: "var(--status-review)",
          done: "var(--status-done)",
          cancelled: "var(--status-cancelled)",
        },

        priority: {
          low: "var(--priority-low)",
          medium: "var(--priority-medium)",
          high: "var(--priority-high)",
          urgent: "var(--priority-urgent)",
        },

        brand: {
          rose: "var(--color-brand-rose)",
          charcoal: "var(--color-brand-charcoal)",
          blue: "var(--color-brand-blue)",
          green: "var(--color-brand-green)",
          amber: "var(--color-brand-amber)",
        },
      },

      borderRadius: {
        lg: "var(--radius-large)",
        md: "var(--radius-medium)",
        sm: "var(--radius-small)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },

        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;