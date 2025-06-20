import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["sphere.png", "icon-192x192.jpg", "icon-512x512.jpg"],
      manifest: {
        name: "Sphere Wallet",
        short_name: "Sphere",
        description: "Modern crypto wallet application",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192x192.jpg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "icon-512x512.jpg",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
        shortcuts: [
          {
            name: "Wallet Home",
            short_name: "Home",
            description: "View your wallet balance and tokens",
            url: "/app",
            icons: [
              {
                src: "icon-192x192.jpg",
                sizes: "192x192",
              },
            ],
          },
          {
            name: "Swap Tokens",
            short_name: "Swap",
            description: "Exchange cryptocurrencies",
            url: "/app/swap",
            icons: [
              {
                src: "icon-192x192.jpg",
                sizes: "192x192",
              },
            ],
          },
          {
            name: "Transaction History",
            short_name: "History",
            description: "View recent transactions",
            url: "/app/history",
            icons: [
              {
                src: "icon-192x192.jpg",
                sizes: "192x192",
              },
            ],
          },
          {
            name: "Buy Crypto",
            short_name: "Buy",
            description: "Purchase cryptocurrency",
            url: "/app/oo",
            icons: [
              {
                src: "icon-192x192.jpg",
                sizes: "192x192",
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
  server: { allowedHosts: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
