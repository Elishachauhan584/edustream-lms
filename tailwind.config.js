import { withUt } from "uploadthing/tw";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      height: {
        navbar: "var(--navbar-height)",
        "screen-nav": "calc(100vh - var(--navbar-height))",
      },
      width: {
        sidebar: "var(--sidebar-width)",
      },
      zIndex: {
        navbar: "var(--navbar-z)",
      },
      keyframes: {
        "sidebar-slide": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "sidebar-slide": "sidebar-slide 0.3s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default withUt(config);
