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

## Publicación

- Sitio: **https://casapora.netlify.app** — repositorio `davidnbritez/casapora`. Cada push a `main` se publica solo.
- Para usar un dominio propio, cambiá `https://casapora.netlify.app` en `astro.config.mjs` y en `public/admin/config.yml`.

## Login del panel (una sola vez, en Netlify)

1. **Project configuration → Identity → Enable Identity.**
2. En *Registration preferences* elegí **Invite only** (nadie se puede registrar solo).
3. En *Services → Git Gateway* tocá **Enable Git Gateway** (le da permiso al panel para guardar en GitHub).
4. En la pestaña **Identity** (arriba) tocá **Invite users** y poné los emails de las dos personas.
5. Cada una recibe un email, toca el enlace, elige contraseña y queda adentro de `casapora.netlify.app/admin`.
