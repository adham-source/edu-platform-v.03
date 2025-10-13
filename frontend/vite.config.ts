import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import tailwindcssPlugin from '@tailwindcss/postcss';
// import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // css: {
  //   postcss: {
  //     plugins: [
  //       tailwindcssPlugin(),
  //       autoprefixer(),
  //     ],
  //   },
  // },
})
