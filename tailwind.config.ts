import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a3a5c',
          light: '#234d7a',
          dark: '#0f2540',
        },
        sage: {
          DEFAULT: '#5a7a5c',
          light: '#7a9e7c',
        },
        gold: {
          DEFAULT: '#c8a84b',
          light: '#e0c06a',
        },
        cream: {
          DEFAULT: '#f8f4ed',
          dark: '#efe8d8',
        },
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.1)',
        panel: '0 4px 12px rgba(0,0,0,.12)',
        modal: '0 8px 32px rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
}

export default config
