import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/family-organizer-panel.ts"),
      formats: ["es"],
      fileName: () => "family-organizer.js",
    },
    outDir: resolve(import.meta.dirname, "../custom_components/family_organizer/frontend"),
    emptyOutDir: true,
    sourcemap: true,
  },
});
