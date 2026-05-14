import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        syne: ['var(--font-jakarta)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'accent-mid': 'var(--accent-mid)',
        'accent-border': 'var(--accent-border)',
        bg: 'var(--bg)',
        glass: 'var(--glass)',
        text: {
          DEFAULT: 'var(--text)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        danger: 'var(--danger)',
        gold: 'var(--gold)',
      },
      borderRadius: {
        '2xl': 'var(--radius)',
        xl: 'var(--radius-sm)',
        md: 'var(--radius-xs)',
      },
      boxShadow: {
        card: 'var(--shadow)',
        sm: 'var(--shadow-sm)',
        xs: 'var(--shadow-xs)',
        accent: 'var(--shadow-accent)',
      },
    },
  },
  plugins: [],
}
export default config
