import typography from "@tailwindcss/typography";

const config = {
    darkMode: 'class', // enables class-based dark mode
    content: [
      './src/app/**/*.{ts,tsx}',
      './src/components/**/*.{ts,tsx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [typography],
  }

  export default config;