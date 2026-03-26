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
        'float-gentle': 'float-gentle 10s ease-in-out infinite',
        'float-slow': 'float-slow 14s ease-in-out infinite',
        'float-drift': 'float-drift 12s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(96, 70, 163, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(96, 70, 163, 0)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-28px) rotate(8deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-22px) rotate(-5deg)' },
        },
        'float-drift': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-18px) translateX(12px) rotate(5deg)' },
          '66%': { transform: 'translateY(-10px) translateX(-8px) rotate(-3deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
