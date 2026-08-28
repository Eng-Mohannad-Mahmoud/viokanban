/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core violet/purple identity
        vio: {
          DEFAULT: '#7c3aed',
          deep: '#4c1d95',
          dark: '#140b24',
          darker: '#0d0716',
          soft: '#c4b5fd',
          pink: '#d8b4fe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,.25), 0 20px 45px -18px rgba(124,58,237,.55)',
        soft: '0 12px 30px -12px rgba(0,0,0,.55)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .35s ease-out both',
        pop: 'pop .2s ease-out both',
      },
    },
  },
  plugins: [],
}
