/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 低感官負荷：奶油底色 + 低飽和度色票，避免高對比閃爍
        cream: '#FBF7F0',
        paper: '#FFFDF9',
        ink: '#3F3A34',
        inkSoft: '#7A736A',
        line: '#E8E0D4',
        happy: '#F3C14F',
        sad: '#7FA9D4',
        angry: '#E08A6E',
        scared: '#A99BD4',
        surprised: '#6FC2C0',
        calm: '#93C08A',
        shy: '#EDA5B6',
        tired: '#B7AFA4',
      },
      fontFamily: {
        round: ['"PingFang TC"', '"Noto Sans TC"', '"Microsoft JhengHei"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { blob: '2rem' },
      boxShadow: {
        soft: '0 4px 0 0 rgba(63,58,52,0.10)',
        lift: '0 10px 24px -12px rgba(63,58,52,0.35)',
      },
      keyframes: {
        popIn: { '0%': { transform: 'scale(0.86)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        sway: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
      },
      animation: {
        popIn: 'popIn 260ms ease-out both',
        floatY: 'floatY 3.2s ease-in-out infinite',
        sway: 'sway 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
