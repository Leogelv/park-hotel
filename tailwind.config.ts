import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", 
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета
        primary: {
          DEFAULT: "#fc7514", // Яркий оранжевый для названий
          light: "#ff8a33",
          dark: "#e66200",
          50: "#FFF7F1",
          100: "#FFEAD8",
          200: "#FFD4B0",
          300: "#FFBD89",
          400: "#ff8a33",
          500: "#fc7514",
          600: "#e66200",
          700: "#C66A2F",
          800: "#A45525",
          900: "#82401B",
        },
        // Коричневый для заголовков
        secondary: {
          DEFAULT: "#c56f33", // Коричневый для топ заголовков
          light: "#d68247",
          dark: "#a85929",
        },
        // Бежевые тона
        beige: {
          DEFAULT: "#F5E6D3",
          light: "#FAF5EE",
          dark: "#E8D3B7",
          50: "#FEFBF7",
          100: "#FAF5EE",
          200: "#F5E6D3",
          300: "#E8D3B7",
          400: "#D9BE9A",
          500: "#C9A87E",
          600: "#B59365",
          700: "#997A54",
          800: "#7D6143",
          900: "#614832",
        },
        // Пастельные акценты
        pastel: {
          peach: "#FFE5CC",
          mint: "#D4E9E0",
          lavender: "#E8D9F1",
          sky: "#D9E7F2",
          rose: "#F7D4D9",
          sage: "#DDE8D4",
        },
        // Нейтральные
        neutral: {
          DEFAULT: "#6B6B6B",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        // Переопределение базовых
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Дополнительные настройки
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;