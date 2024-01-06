import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vite-plugin-fastify-routes.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['os', 'path', 'glob', 'lodash.maxby'],
    },
  },
  plugins: [dts()],
});
