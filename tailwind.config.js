
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./AI_UI/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          "Segoe UI",
          "sans-serif"
        ]
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        darkbg: '#0f172a',
        cardbg: '#1e293b'
      },
      animation: {
        'pulse-danger': 'pulse-danger 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-danger': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      }
    }
  },
  plugins: []
};

