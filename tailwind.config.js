/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2f25a7',
        'violet-deep': '#21114E',
        'rose-deep': '#A70069',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #21114E 0%, #A70069 100%)',
      }
    },
  },
  plugins: [],
}