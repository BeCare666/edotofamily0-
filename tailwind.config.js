module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Une seule police sur tout le site (06/10/2026) : celle de styles/edoto-font.css
      // (variable --edoto-font), y compris pour font-serif, font-sans, font-brand et font-poppins
      fontFamily: {
        poppins: ['var(--edoto-font)'],
        sans: ['var(--edoto-font)'],
        serif: ['var(--edoto-font)'],
        brand: ['var(--edoto-font)']
      },
      colors: {
        edotoPink: '#FF6EA9',
        edotoBlue: '#4AB3F4'
      }
    },
  },
  plugins: [],
}
