/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E11D48',
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          950: '#4C0519',
        },
        crimson: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#991B1B',
        },
        dark: {
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#27272A',
          800: '#18181B',
          900: '#0F0F12',
          950: '#08080A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0,0,0,0.08), 0 0 1px 1px rgba(0,0,0,0.03)',
        'premium-hover': '0 30px 60px -15px rgba(225,29,72,0.2), 0 0 1px 1px rgba(225,29,72,0.3)',
        'premium-dark': '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.08)',
        'glow-red-sm': '0 0 15px rgba(225, 29, 72, 0.35)',
        'glow-red': '0 0 30px rgba(225, 29, 72, 0.45)',
        'glow-red-strong': '0 0 50px rgba(225, 29, 72, 0.75)',
        'glow-red-card': '0 10px 30px -10px rgba(225, 29, 72, 0.3)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-delayed': 'float 5s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'marquee': 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee-reverse 60s linear infinite',
        'marquee-slow': 'marquee 75s linear infinite',
        'marquee-reverse-slow': 'marquee-reverse 75s linear infinite',
        'marquee-fast': 'marquee 30s linear infinite',
        'marquee-x': 'marqueeX 50s linear infinite',
        'aurora': 'aurora 10s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'beacon': 'beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        marqueeX: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        aurora: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)' },
          '100%': { transform: 'scale(0.9) rotate(360deg)' },
        },
        beacon: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
