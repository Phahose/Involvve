/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2D6A4F",
          dark: "#1B4332",
          accent: "#52B788",
          light: "#D8F3DC",
        }
      }
    },
  },
  plugins: [],
}