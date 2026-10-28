/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FDFBF7',
          100: '#F7F1E6',
          200: '#F5EBD7', // ครีมหลักจากเอกสาร
          300: '#EAD7BD',
          400: '#D4B28C',
          500: '#C19A6B', // น้ำตาลหลักจากเอกสาร
          600: '#A27B4D',
          700: '#6F4E37', // น้ำตาลเข้มจากเอกสาร
          800: '#4A3324',
          900: '#2C1810',
          dark: '#1E130D',
        },
        cream: {
          bg: '#F5EBD7',
          light: '#FAF4EB',
          card: '#FFFDF9',
        },
        accent: {
          mint: '#2D6A4F',
          teal: '#4E878C',
          orange: '#E07A5F',
          amber: '#D97706',
        }
      },
      fontFamily: {
        sans: ['"Prompt"', '"Noto Sans Thai"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(111, 78, 55, 0.08)',
        'float': '0 14px 35px rgba(44, 24, 16, 0.12)',
        'glow': '0 0 20px rgba(193, 154, 107, 0.35)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
