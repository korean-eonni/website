import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Korean Eonni Brand Colors
      colors: {
        primary: {
          DEFAULT: '#B8B5D8',
          light: '#C2BFE3',
          dark: '#9D9AC4',
        },
        secondary: '#F5F4F8',
        accent: '#000000',
      },
      // Fonts
      fontFamily: {
        sans: ['Gilroy', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'bebas': ['Bebas Neue Cyrillic', 'sans-serif'],
        'gilroy': ['Gilroy', 'sans-serif'],
      },
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(96, 70, 163, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(96, 70, 163, 0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
