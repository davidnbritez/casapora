import { defineConfig } from "astro/config";

// Cambiá "site" por el dominio definitivo (sirve para los enlaces al compartir).
export default defineConfig({
  site: "https://nicehome.pages.dev",
  output: "static",
  trailingSlash: "ignore",
});
