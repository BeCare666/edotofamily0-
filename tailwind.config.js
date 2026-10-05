module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        // Nom de marque (logo en-tête et pied de page)
        brand: ['"Cormorant Garamond"', 'Georgia', 'serif']
      },
      colors: {
        edotoPink: '#FF6EA9',
        edotoBlue: '#4AB3F4'
      }
    },
  },
  plugins: [],
}
