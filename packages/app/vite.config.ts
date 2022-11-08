import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
console.log(__dirname, '__dirname');
// https://vitejs.dev/config/
export default defineConfig({
 plugins: [react()],
 resolve: {
  alias: {
   '^': path.resolve(__dirname, 'src'),
  },
 },
});
