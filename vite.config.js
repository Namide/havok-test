import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          console.log(id);
          if (id.includes('three')) {
            return 'render';
          } else {
            return 'index';
          }
        },
      },
    },
  },
});