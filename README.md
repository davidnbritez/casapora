# Casa Porã — catálogo con pedido por WhatsApp

Sitio estático en **Astro**, panel de carga en **/admin** (Decap CMS + Netlify Identity) y publicación en **Netlify**.
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

## Publicación (Cloudflare Pages)

- Web: **https://casapora.pages.dev** (rama `main`). Cloudflare Pages publica solo en cada cambio de `main` (plan gratis: 500 publicaciones por mes).
- Configuración del proyecto en Cloudflare: *Workers & Pages → casapora*. Build: `npm run build`, carpeta `dist`, Node 22 (archivo `.node-version`). Cabeceras en `public/_headers`.
- **El panel guarda en la rama `borrador`**, no en la web. Vista previa: **https://borrador.casapora.pages.dev** (Cloudflare hace vista previa de cada rama).
- **Para publicar lo del panel:** menú del panel → *Publicar cambios en la web*, o github.com/davidnbritez/casapora → **Actions → Publicar cambios → Run workflow**.
- Cuando cambia `main`, la acción *Sincronizar borrador* lleva esos cambios al borrador.
- Dominio propio: cambiar `https://casapora.pages.dev` en `astro.config.mjs` y `public/admin/config.yml`.

## Login del panel (con GitHub)

Cada persona entra a `/admin` con **su cuenta de GitHub**. Configuración (una sola vez):

1. **Servicio de inicio de sesión:** desplegar [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) con el botón *Deploy to Cloudflare Workers*. Queda en `https://sveltia-cms-auth.<subdominio>.workers.dev`.
2. **OAuth App en GitHub:** *Settings → Developer settings → OAuth Apps → New OAuth App*.
   - Homepage URL: `https://casapora.pages.dev`
   - Authorization callback URL: `https://sveltia-cms-auth.<subdominio>.workers.dev/callback`
3. En el worker (*Settings → Variables and Secrets*): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (como secreto) y `ALLOWED_DOMAINS` = `casapora.pages.dev, *.casapora.pages.dev, localhost`.
4. Poner la dirección del worker en `base_url` de `public/admin/config.yml`.
5. Dar acceso a la segunda persona: github.com/davidnbritez/casapora → *Settings → Collaborators → Add people*.
