/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          accent: 'var(--accent)',
          'accent-dark': 'var(--accent-dark)',
        },
        typography: {
          DEFAULT: {
            css: {
              maxWidth: '720px',
              color: '#333333',
              a: {
                color: 'var(--accent)',
                '&:hover': {
                  color: 'var(--accent-dark)',
                },
              },
              h1: {
                color: '#111111',
              },
              h2: {
                color: '#111111',
              },
              h3: {
                color: '#111111',
              },
              strong: {
                color: '#111111',
              },
            },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }