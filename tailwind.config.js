/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060608',
          900: '#0a0a0d',
          850: '#0e0e12',
          800: '#131317',
          750: '#17171c',
          700: '#1d1d23',
          600: '#2a2a31',
          500: '#3d3d46',
          400: '#5c5c66',
        },
        crimson: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb5c68',
          500: '#f43f4e',
          600: '#e11d33',
          700: '#be1226',
          800: '#9f1222',
          900: '#85121f',
          950: '#4c0a12',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(244,63,94,0.25), 0 10px 40px -10px rgba(225,29,51,0.45)',
        'glow-sm': '0 0 0 1px rgba(244,63,94,0.2), 0 4px 18px -6px rgba(225,29,51,0.4)',
        lift: '0 24px 60px -24px rgba(0,0,0,0.65)',
        panel: '0 16px 50px -20px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.22,0.85,0.25,1) both',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.2,0.9,0.3,1.25) both',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
