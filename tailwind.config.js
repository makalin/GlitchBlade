/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: '#00ff9d',
          secondary: '#bd00ff',
          dark: '#0a0a0a',
          panel: '#1a1a1a',
          accent: '#ff0055',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}

