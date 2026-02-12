import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  darkMode: 'class', // Enable dark mode using class strategy

  plugins: [react()],
  theme: {
    extend: {},
  },
  base: '/', // Ensure this is set correctly
});
