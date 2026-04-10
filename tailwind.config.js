/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                game: ['"Outfit"', 'sans-serif'],
            },
            colors: {
                bomb: { 50: '#fff7ed', 500: '#f97316', 900: '#431407' },
                neon: { blue: '#38bdf8', pink: '#f472b6', green: '#4ade80', yellow: '#fbbf24' },
            },
            animation: {
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                glowPulse: {
                    '0%, 100%': { textShadow: '0 0 10px #f97316, 0 0 20px #f97316' },
                    '50%': { textShadow: '0 0 30px #f97316, 0 0 60px #f97316, 0 0 90px #fb923c' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
};
