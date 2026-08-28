import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname),
  build: {
    outDir: resolve(__dirname, "../dist"),
    emptyOutDir: true,
  },
  preview: {
    allowedHosts: ["tempinbox-frontend-production.up.railway.app"],
  },
});
