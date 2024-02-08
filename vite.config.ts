import wasm from "vite-plugin-wasm";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wasm(),
    react()],
})
