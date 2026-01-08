import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Green Palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Earth Tones
        earth: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8dcc8',
          300: '#d4c4a8',
          400: '#bda87d',
          500: '#a08a5c',
          600: '#8b7349',
          700: '#6d5a3a',
          800: '#5a4a32',
          900: '#4a3d2b',
          950: '#2a2218',
        },
        // Accent Colors
        sage: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#c9d7ca',
          300: '#a3bba5',
          400: '#7a9b7d',
          500: '#5a7d5d',
          600: '#46634a',
          700: '#3a503d',
          800: '#314234',
          900: '#29372c',
          950: '#141d16',
        },
        // Emerald for highlights
        eco: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-eco': 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
      },
      boxShadow: {
        'eco': '0 4px 14px 0 rgba(34, 197, 94, 0.25)',
        'eco-lg': '0 10px 40px -10px rgba(34, 197, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
