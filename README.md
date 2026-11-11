# Casa Porã — catálogo con pedido por WhatsApp

Sitio estático en **Astro**, panel de carga en **/admin** (Sveltia CMS) y publicación en **Netlify**.
El brief completo está en [BRIEF.md](BRIEF.md). El prototipo original quedó en [prototipo/index.html](prototipo/index.html).

## Usar en tu computadora

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera la carpeta dist/
```

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Nombre, WhatsApp, textos, portada, tipos y ambientes | `src/data/tienda.json` |
| Productos (uno por archivo) | `src/content/productos/*.json` |
| Fotos | `src/assets/uploads/` (se convierten solas a WebP al compilar) |
| Colores, tipografías y bordes | `src/styles/global.css` (variables al principio) |
| Panel /admin | `public/admin/config.yml` |

Las fotos de muestra (living, almohadones, cortinas, canastos y cajas) vienen del prototipo de Áurea Hogar. **Reemplazalas por fotos propias antes de publicar.**

## Publicar en Netlify (una sola vez)

1. Subí esta carpeta a un repositorio nuevo de GitHub.
2. En Netlify: *Add new site → Import from Git*, elegí el repositorio. La configuración ya está en `netlify.toml`.
3. Cambiá `https://casapora.netlify.app` por tu dominio en `astro.config.mjs` y en `public/admin/config.yml`.
4. Login del panel: desplegá el worker [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) en Cloudflare (gratis), creá una *OAuth App* en GitHub que apunte a ese worker, y poné su dirección en `base_url` y tu repositorio en `repo` dentro de `public/admin/config.yml`.
5. Listo: entrás a `tudominio/admin`, editás y al guardar Netlify republica en ~1 minuto.

Para probar el panel sin configurar nada, abrí `http://localhost:4321/admin/index.html` en Chrome o Edge y elegí **Work with Local Repository** sobre esta carpeta.
