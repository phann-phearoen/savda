import { defineConfig } from "vite";
import { resolve } from "node:path";

// Locale pages are generated into en/ and km/ by scripts/build-locales.mjs before dev/build runs.
export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, "../../assets"),
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        en: resolve(__dirname, "en/index.html"),
        km: resolve(__dirname, "km/index.html"),
        shop: resolve(__dirname, "shop-placeholder/index.html"),
      },
    },
  },
});
