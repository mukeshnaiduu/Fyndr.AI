/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
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
    extend: {
      colors: {
        border: "var(--color-border)", /* glassmorphic border */
        input: "var(--color-input)", /* elevated surface */
        ring: "var(--color-ring)", /* soft purple */
        background: "var(--color-background)", /* near-white with blue undertone */
        foreground: "var(--color-foreground)", /* deep slate */
        primary: {
          DEFAULT: "var(--color-primary)", /* soft purple */
          foreground: "var(--color-primary-foreground)", /* white */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* light periwinkle */
          foreground: "var(--color-secondary-foreground)", /* deep slate */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* clear red */
          foreground: "var(--color-destructive-foreground)", /* white */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* elevated surface */
          foreground: "var(--color-muted-foreground)", /* medium slate */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* warm orange */
          foreground: "var(--color-accent-foreground)", /* white */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* white */
          foreground: "var(--color-popover-foreground)", /* deep slate */
        },
        card: {
          DEFAULT: "var(--color-card)", /* elevated surface */
          foreground: "var(--color-card-foreground)", /* deep slate */
        },
        success: {
          DEFAULT: "var(--color-success)", /* vibrant green */
          foreground: "var(--color-success-foreground)", /* white */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* balanced amber */
          foreground: "var(--color-warning-foreground)", /* deep slate */
        },
        error: {
          DEFAULT: "var(--color-error)", /* clear red */
          foreground: "var(--color-error-foreground)", /* white */
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)", /* 0.5rem */
        md: "calc(var(--radius-lg) - 2px)", /* 0.375rem */
        sm: "calc(var(--radius-lg) - 4px)", /* 0.25rem */
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      boxShadow: {
        'glassmorphic': 'var(--glassmorphic-shadow)',
        'glow-primary': 'var(--glow-primary)',
        'glow-accent': 'var(--glow-accent)',
      },
      transitionTimingFunction: {
        'spring': `cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
      },
      transitionDuration: {
        'standard': 'var(--transition-standard)',
      },
      backdropFilter: {
        'glass': 'blur(16px)',
      },
      zIndex: {
        'header': '50',
        'sidebar': '40',
        'modal': '60',
        'overlay': '55',
        'dropdown': '45',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
  ],
}
