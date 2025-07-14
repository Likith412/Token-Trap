import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 8000,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
