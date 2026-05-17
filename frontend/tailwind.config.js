/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- THIS TELLS TAILWIND TO SCAN APP.JSX
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}