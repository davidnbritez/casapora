// Después de compilar, copia las fotos originales a dist/uploads/.
// Así la dirección que guarda el panel ("/uploads/foto.jpg") existe de verdad
// y el panel puede mostrar la foto en la vista previa.
// La web sigue usando las versiones WebP optimizadas que genera Astro.
import { cpSync, existsSync } from "node:fs";

const origen = "src/assets/uploads";
if (existsSync(origen)) {
  cpSync(origen, "dist/uploads", { recursive: true });
  console.log("Fotos copiadas a dist/uploads");
}
