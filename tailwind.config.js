/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        accent: "#A855F7",
        dark: "#0F0F1A",
        card: "#1A1A2E",
      },
    },
  },
  plugins: [],
};