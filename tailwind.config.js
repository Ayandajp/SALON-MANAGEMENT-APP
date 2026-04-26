/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F8F9FB',
        border: '#E6E8EC',
        'text-primary': '#111111',
        'text-secondary': '#5A5F66',
        accent: '#0E7C66',
        danger: '#D64545',
        success: '#1F9D55',
        'dark-background': '#0F0F0F',
        'dark-surface': '#1A1A1A',
        'dark-border': '#2A2A2A',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      fontSize: {
        h1: ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5' }],
        caption: ['14px', { lineHeight: '1.4' }],
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0,0,0,0.05)',
        medium: '0 4px 12px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        heading: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
