import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Skip TypeScript type checking during build
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: 'tsconfig.app.json',
    },
  },
})
