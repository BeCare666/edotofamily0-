module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Une seule police sur tout le site (06/10/2026) : Poppins, y compris pour les classes
      // font-serif, font-sans et font-brand déjà utilisées dans les pages et les tableaux de bord
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
        serif: ['Poppins', 'sans-serif'],
        brand: ['Poppins', 'sans-serif']
      },
      colors: {
        edotoPink: '#FF6EA9',
        edotoBlue: '#4AB3F4'
      }
    },
  },
  plugins: [],
}
