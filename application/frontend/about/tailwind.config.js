/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warmBeige: "#FAF5EE",
        softYellow: "#F3E9DC",
        lightBrown: "#E2C8A2",
        mediumBrown: "#D4AA6F",
        darkBrown: "#8B4F23",
        accentBrown: "#A56E3C",
        textBrown: "#5C3A21",
        gold: "#B68B56",
      },
      fontFamily: {
        serif: ["Merriweather", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
