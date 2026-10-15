import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],

  // RELATIVE STATIC ASSET PATHS
  // COMPATIBLE WITH VITE + HASHROUTER
  base: "./",

  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
  },
});