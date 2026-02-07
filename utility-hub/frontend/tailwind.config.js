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

        // Mystic Theme Colors (CSS variable based - auto light/dark)
        'mystic-bg': 'var(--mystic-bg-primary)',
        'mystic-bg-secondary': 'var(--mystic-bg-secondary)',
        'mystic-bg-card': 'var(--mystic-bg-card)',
        'mystic-border': 'var(--mystic-border)',
        'mystic-text': 'var(--mystic-text-primary)',
        'mystic-text-secondary': 'var(--mystic-text-secondary)',
        'mystic-text-muted': 'var(--mystic-text-muted)',
        'mystic-accent': 'var(--mystic-accent)',
        'mystic-accent-light': 'var(--mystic-accent-light)',

        // Mystic Gradient Colors (for from-*/via-*/to-* utilities)
        'mystic-grad-from': 'var(--mystic-gradient-from)',
        'mystic-grad-via': 'var(--mystic-gradient-via)',
        'mystic-grad-to': 'var(--mystic-gradient-to)',
        'mystic-grad-from-muted': 'var(--mystic-gradient-from-muted)',
        'mystic-grad-to-muted': 'var(--mystic-gradient-to-muted)',
      },
      fontFamily: {
        sans: ['"Chakra Petch"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
