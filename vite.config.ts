import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStartVite } from "@tanstack/react-start/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStartVite({
      server: { entry: "src/server.ts" },
    }),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
