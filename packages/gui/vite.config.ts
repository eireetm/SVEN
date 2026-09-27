import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { hostPlugin } from "./host/plugin.ts";

// `npm run dev:gui` (repository root) starts this dev server and opens the browser (its --open flag; a plain `vite`, as the
// end-to-end tests run it, opens nothing). SVE_GUI_PORT changes the port (default 5173, or the next free one).
export default defineConfig({
  plugins: [react(), hostPlugin()],
  server: {
    port: Number(process.env.SVE_GUI_PORT ?? 5173),
  },
  worker: { format: "es" },
  build: { target: "es2022", chunkSizeWarningLimit: 10_000 },
});
