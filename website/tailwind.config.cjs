/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../packages/react/src/**/*.{html,js,jsx,md,mdx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        train: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        train: 'train 2s linear infinite',
      },
      colors: {
        // Kāl Design System - Gold & Shadow
        'surface-container-lowest': '#0a0a0a',
        'surface-container-low': '#110d08',
        'surface-container': '#1c1408',
        'surface-container-high': '#251c0a',
        'surface-container-highest': '#2d230e',
        'surface-variant': '#1c1408',
        'on-surface-variant': '#c9a84caa',
        'surface-tint': '#c9a84c',
        'outline-variant': '#c9a84c33',
        background: '#0a0a0a',
        'on-background': '#f0d080',
        primary: '#f0d080',
        'on-primary': '#0a0a0a',
        'primary-container': '#c9a84c',
        'on-primary-container': '#0a0a0a',
        secondary: '#a07830',
        'on-secondary': '#f0d080',
        'secondary-container': '#463a1a',
        'on-secondary-container': '#f0d080',
        muted: '#c9a84c22',
        // keep old variables for compatibility
        foreground: 'var(--foreground)',
        caret: 'var(--caret)',
        selection: 'var(--selection)',
        lineHighlight: 'var(--lineHighlight)',
      },
      fontFamily: {
        sora: ['Sora', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
        'code-primary': ['JetBrains Mono'],
        cinzel: ['Cinzel', 'serif'],
        'cinzel-decorative': ['Cinzel Decorative', 'cursive'],
      },
      fontSize: {
        'code-primary': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '0.15em', fontWeight: '600' }],
        'label-uppercase': ['11px', { lineHeight: '1', letterSpacing: '0.2em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      spacing: {
        unit: '4px',
        gutter: '24px',
        'margin-desktop': '40px',
        'margin-mobile': '16px',
        'app-height': 'var(--app-height)',
        'app-width': 'var(--app-width)',
      },
      typography(theme) {
        return {
          DEFAULT: {
            css: {
              'code::before': {
                content: 'none', // don’t wrap code in backticks
              },
              'code::after': {
                content: 'none',
              },
              color: 'var(--foreground) !important',
              a: {
                color: 'var(--foreground) !important',
              },
              h1: {
                color: 'var(--foreground) !important',
              },
              h2: {
                color: 'var(--foreground) !important',
              },
              h3: {
                color: 'var(--foreground) !important',
              },
              h4: {
                color: 'var(--foreground) !important',
              },
              pre: {
                color: 'var(--foreground) !important',
                background: 'var(--background) !important',
              },
              code: {
                color: 'var(--foreground) !important',
              },
            },
          },
        };
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
