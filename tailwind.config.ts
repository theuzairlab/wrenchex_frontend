import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WrenchEX Color Palette
        wrench: {
          // Primary Backgrounds
          'bg-primary': '#F1F5EC',    // Light sage background
          'bg-secondary': '#FFFFFF',   // Pure white for cards/sections
          
          // Text Colors
          'text-primary': '#000000',   // Black for primary text
          'text-secondary': '#666666', // Gray for secondary text
          'text-muted': '#999999',     // Light gray for muted text
          
          // Accent & Interactive
          'accent': '#D4F142',         // Lime green for CTAs, highlights
          'accent-hover': '#C5E23A',   // Darker lime for hover states
          'accent-light': '#E8F57D',   // Lighter lime for backgrounds
          
          // Navigation
          'nav-bg': '#121212',         // Dark background for navigation
          'nav-text': '#FFFFFF',       // White text on navigation
          
          // Status Colors
          'success': '#22C55E',        // Green for success
          'warning': '#F59E0B',        // Orange for warnings
          'error': '#EF4444',          // Red for errors
          'info': '#3B82F6',           // Blue for info
          
          // Borders & Dividers
          'border': '#E5E7EB',         // Light gray borders
          'border-dark': '#D1D5DB',    // Darker borders
        },
        
        // Semantic Colors
        text: {
          primary: '#000000',
          secondary: '#666666', 
          muted: '#999999',
        },
        
        background: {
          primary: '#F1F5EC',
          secondary: '#FFFFFF',
        },
        
        accent: {
          DEFAULT: '#D4F142',
          hover: '#C5E23A',
          light: '#E8F57D',
        },
      },
      
      boxShadow: {
        // WrenchEX Shadow System
        'wrench-card': '0px 4px 10px rgba(0, 0, 0, 0.05)',
        'wrench-elevated': '0px 8px 20px rgba(0, 0, 0, 0.08)',
        'wrench-hover': '0px 6px 15px rgba(0, 0, 0, 0.1)',
        'wrench-pressed': '0px 2px 5px rgba(0, 0, 0, 0.1)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        'heading-1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['1.5rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config; 