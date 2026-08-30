/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        progress: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        progress: 'progress 1.2s linear infinite',
      },
      colors: {
        light: {
          bg:       '#f0ebe5',
          surface:  '#e6e0d8',
          border:   '#e8e2da',
          muted:    '#ddd6cd',
          subtle:   '#bfb3a4',
          strong:   '#a89e92',
        },
        dark: {
          bg:       '#4a1f24',
          surface:  '#5e2a2e',
          border:   '#7a2e2e',
          strong:   '#6a2b2f',
          muted:    '#8c3a3a',
          subtle:   '#aaaaaa',
        },
      },
    },
  },
  plugins: [],
}
