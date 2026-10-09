/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5EFE3",
        ink: "#1A1A18",
        light: "#ebebf4",
        dark: "#121313",
        primary: "#155bd5",
        primaryDark: "#0e47ad",
        secondary: "#ff6b35",
        teal: "#00c2b3",
        ice: "#eef3fb",
        mist: "#f8f9fa",
        line: "#e9ecef",
        body: "#3a3a3a",
        li: {
          bg: "#000000",
          card: "#1B1F23",
          header: "#1B1F23",
          border: "#38434F",
          text: "#E7E9EA",
          muted: "#9BA3AB",
          blue: "#0A66C2",
          blueHover: "#004182",
          link: "#70B5F9",
          input: "#38434F",
          gold: "#E7A33E",
          green: "#057642"
        },
        materai: {
          DEFAULT: "#1B5E3B",
          dark: "#14492E"
        },
        stamp: "#8A1F1F",
        muted: "#5B5B55"
      },
      fontFamily: {
        display: ["Georgia", '"Times New Roman"', "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
