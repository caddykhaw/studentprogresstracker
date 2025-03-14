/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        bg: {
          light: 'var(--color-bg-light)',
          dark: 'var(--color-bg-dark)',
        },
        text: {
          light: 'var(--color-text-light)',
          dark: 'var(--color-text-dark)',
          'muted-light': 'var(--color-text-muted-light)',
          'muted-dark': 'var(--color-text-muted-dark)',
        },
        border: {
          light: 'var(--color-border-light)',
          dark: 'var(--color-border-dark)',
        },
        error: 'var(--color-error)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 