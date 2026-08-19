import { defineConfig } from "astro/config";

const base = process.env.BASE_PATH || "/";
const site = process.env.SITE_URL || "https://fabriziocaragiulo.com";

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
    },
  },
});
