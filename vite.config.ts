import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: { allowedHosts: true },
});
