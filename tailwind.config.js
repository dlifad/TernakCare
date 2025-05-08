import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './resources/**/*.blade.php',
      './resources/**/*.jsx',
      './resources/**/*.js',
    ],
    theme: {
      extend: {
        colors: {
          // Tema warna warm
          primary: {
            light: '#FFDFC1',
            DEFAULT: '#FF9A5A',
            dark: '#D66E2B',
          },
          secondary: {
            light: '#FFE8C2',
            DEFAULT: '#F0B775',
            dark: '#D18E3A',
          },
          accent: {
            light: '#FFE0B2',
            DEFAULT: '#E67E22',
            dark: '#B35900',
          },
          neutral: {
            lightest: '#F9F4EF',
            light: '#E8DED3',
            DEFAULT: '#9E8A78',
            dark: '#6D5D4B',
            darkest: '#3D3429',
          },
          success: '#5CB85C',
          warning: '#F0AD4E',
          danger: '#D9534F',
          info: '#5BC0DE',
        },
        fontFamily: {
          sans: ['Nunito', 'sans-serif'],
          heading: ['Poppins', 'sans-serif'],
        },
        boxShadow: {
          soft: '0 4px 6px rgba(0, 0, 0, 0.05)',
          card: '0 8px 15px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    plugins: [],
  }
