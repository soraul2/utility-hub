/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via 'class' strategy
  theme: {
    extend: {
      colors: {
        // HUD Template Colors
        primary: '#0271ff', // $blue
        secondary: '#617a86', // $gray-500
        success: '#249d79', // $teal
        info: '#009be3', // $cyan
        warning: '#ff9f0c', // $orange
        danger: '#e00000', // $red
        dark: '#1f2937', // Approximation of $gray-800
        light: '#f3f4f6', // Approximation of $gray-100
        
        // Custom Theme Colors
        theme: '#249d79', // $teal as default theme
        
        // Dark Mode Backgrounds
        'dark-bg': '#111827', // $gray-900 approximation
        'dark-card': '#1f2937', // $gray-800 approximation
      },
      fontFamily: {
        sans: ['"Chakra Petch"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
