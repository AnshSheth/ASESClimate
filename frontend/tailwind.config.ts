import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ecodify: {
          sage: '#6B8E23',      // Olive Drab - richer green
          moss: '#2F4F4F',      // Dark Slate Gray - deep forest
          leaf: '#556B2F',      // Dark Olive Green - rich earthy
          sky: '#87CEEB',       // Brighter sky blue
          sand: '#DEB887',      // Burlywood - warmer sand
          earth: '#8B4513',     // Saddle Brown - deeper earth
          autumn: '#CD853F'     // Peru - warmer autumn
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'natural': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};

export default config;
