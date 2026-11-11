# Casa Porã — Brief del proyecto (para Claude Code)

> Tienda web de artículos para el hogar (Paraguay). El cliente arma el pedido en la web y lo **envía por WhatsApp**; el pago se coordina en el chat. Se publica en **Netlify**. Tiene un **panel simple** para cargar productos, activarlos/desactivarlos y manejar promociones. **Sin base de datos por ahora**: empezar simple y crecer después.

`prototipo/index.html` es la **referencia de comportamiento** (un solo HTML con CSS y JS): la versión nueva tiene que funcionar igual. El **aspecto visual** sigue el estilo Áurea ya implementado en `src/styles/global.css` (decisión del dueño del 11/11/2026, ver sección 6).

---

## 1. Alcance de esta primera versión

**Sí entra:**
- Todo el sitio del prototipo (catálogo, filtros por ambiente y tipo, buscador, orden, ficha, opciones de color/tamaño, carrito, envío por WhatsApp).
- **Panel** en `/admin` para:
  - crear / editar / borrar productos y subir fotos;
  - **activar o desactivar** cada producto (desactivado = no aparece en la web) y marcarlo **agotado**;
  - **promociones**: precio de oferta (precio tachado + % de descuento), etiqueta ("Oferta", "Más vendido"…), producto destacado de la portada;
  - editar los textos y datos de la tienda (nombre, WhatsApp, anuncios, portada).
- Cada cambio guardado en el panel se publica solo en la web (~1 minuto).

**Queda para después** (sección 7): base de datos, stock por cantidades, registro de pedidos, clientes, estadísticas, cupones, pago online.

---

## 2. Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Sitio | **Astro** (salida estática) | HTML rápido y gratis de alojar. Lee productos desde archivos. Facilita agregar servidor/base de datos más adelante. |
| Panel | **Sveltia CMS** en `/admin` (alternativa: Decap CMS) | Panel visual que guarda los cambios como archivos en GitHub. Sin base de datos ni servidor. Usable desde el celular. |
| Hosting | **Netlify** (gratis) | Publica solo en cada cambio. Dominio propio + HTTPS gratis. |
| Código | **GitHub** | Repositorio del proyecto. |
| Estilos | CSS propio portado del prototipo | Ya está hecho y revisado. |

**Login del panel:** dos personas van a entrar (el dueño y alguien más). Opciones: login con GitHub (worker oficial `sveltia/sveltia-cms-auth`) o Decap + Netlify Identity (Netlify revirtió su deprecación el 19/02/2026). Elegir la que permita a alguien **sin conocimientos técnicos** entrar fácil desde el celular.

---

## 3. Estructura sugerida

```
/
├─ public/
│  ├─ admin/index.html + config.yml   # panel
│  └─ uploads/                        # fotos subidas desde el panel
├─ src/
│  ├─ content/productos/*.json        # un archivo por producto
│  ├─ data/tienda.json                # configuración de la tienda
│  ├─ components/                     # Header, Hero, Filtros, Card, Ficha, Carrito, Footer
│  ├─ scripts/                        # carrito, filtros, ventanas (JS del prototipo)
│  ├─ styles/global.css
│  └─ pages/
│     ├─ index.astro
│     └─ producto/[slug].astro        # página propia por producto (para compartir)
├─ netlify.toml
└─ package.json
```

---

## 4. Datos

### `tienda.json` (editable desde el panel)
Nombre, lema, número de WhatsApp, anuncios de la barra superior, textos de portada y del catálogo, producto destacado, compromisos (envíos, pagos, atención), texto "sobre nosotros", texto del pie. Listas editables de **tipos** (Textiles, Vajilla, Decoración, Cocina, Organización) y **ambientes** (Living, Comedor, Cocina, Dormitorio, Baño).

### Producto (`src/content/productos/<id>.json`)
| Campo | En el panel | Notas |
|---|---|---|
| `activo` | **interruptor** | Si está apagado, el producto no aparece en la web. |
| `agotado` | interruptor | Aparece, pero no se puede agregar; botón "Avisarme". |
| `nombre`, `slug` | texto | |
| `categoria` | lista | tipo de producto |
| `ambientes` | selección múltiple | |
| `precio` | número (Gs.) | |
| `precioOferta` | número, opcional | **Promoción**: si tiene valor, se muestra este precio y el normal tachado con el % de descuento. |
| `etiqueta` | texto, opcional | "Oferta", "Más vendido", "Hecho a mano"… |
| `nuevo` | interruptor | |
| `destacado` | interruptor | Aparece primero en "Destacados". |
| `medida`, `resumen`, `descripcion` | texto | |
| `detalles` | lista clave/valor | Material, Medidas, Cuidado… |
| `fotos` | imágenes (varias) | |
| `opciones` | título + lista | Cada opción: nombre, color (selector), nota (ej. medidas), precio y precio de oferta propios (opcionales), fotos (opcionales). |
| `orden` | número | |

> En el prototipo el campo de oferta se llama `precioAntes` (precio viejo) y `precio` es el actual. En el panel conviene más pensarlo como **precio normal + precio de oferta**; adaptar la lógica.

---

## 5. Sitio público — comportamiento (como el prototipo)

- Barra de anuncios, header con marca + menú de tipos + WhatsApp + carrito con contador.
- Portada editorial con producto destacado y compromisos.
- Filtros por **ambiente** + **tipo** + buscador (ignora tildes) + orden (Destacados, Novedades, Menor/Mayor precio). Agotados al final. "Limpiar filtros".
- Tarjetas con etiqueta, % de oferta, ambiente · medida, resumen, muestras de color que cambian la imagen, "+ Añadir". Productos con opciones que no son color → "Elegir tamaño/aroma" abre la ficha.
- Ficha (modal / hoja inferior en celular) con galería, opciones, cantidad, "Agregar al pedido", "Hacer una consulta", copiar enlace.
- **Página propia por producto** `/producto/<slug>` con vista previa al compartir (Open Graph: foto, nombre, precio) para Instagram, Facebook, TikTok y WhatsApp.
- Carrito con cantidades, quitar, vaciar (confirmación en dos toques), nombre y notas opcionales, total y **"Enviar pedido por WhatsApp"**:

```
¡Hola Casa Porã! Quiero hacer este pedido:

• 2 × Taza de cerámica artesanal (Azul petróleo) — Gs. 90.000
• 1 × Tabla de picar de madera (Grande, 40 × 25 cm) — Gs. 120.000

*Total: Gs. 210.000*
Nombre: …
Notas: …

¿Está todo disponible?
```
- Carrito guardado en `localStorage` (con try/catch). El "atrás" del celular cierra ficha y carrito; deslizar hacia abajo cierra las hojas.
- Nunca mostrar la dirección del dueño (se trabaja desde casa; retiro coordinado por WhatsApp).

---

## 6. Diseño (respetar)

- **Bordes cuadrados en todo** (`border-radius: 0`), salvo el puntito de "Disponible". Decisión del dueño.
- Tipografías: **Playfair Display** (títulos, nombres, precios) + **DM Sans** (texto).
- Colores (paleta Áurea, decisión del dueño 11/11/2026; fuente de verdad: variables de `src/styles/global.css`): fondo `#faf8f5`, fondo 2 `#f4efeb`, fondo 3 `#e8e2d9`, tarjeta `#ffffff`, líneas `#e8e2d9` / `#d5c7b3`, texto `#24211d`, texto 2 `#5f584f`, texto 3 `#776d60`, acento terracota `#a14b2a` (texto y botones) y `#c36b47` (solo decorativo, no para texto), salvia `#55644b`, WhatsApp `#15803d`. Texto con contraste ≥ 4,5:1.
- Estilo Áurea: portada con foto grande y tarjeta "Destacado", tarjetas blancas con borde fino y foto 4:3, zoom suave y "Vista rápida" al pasar el mouse, botón negro "Mi pedido" con contador. Título de portada sin cursiva separada.
- Botón principal negro (`#24211d`); etiquetas en mayúsculas con espaciado.
- Áreas táctiles ≥ 44 px, foco visible, `prefers-reduced-motion`, enlace "Saltar al catálogo", `inert` en el fondo con ventanas abiertas.
- Mobile first. Fotos optimizadas (WebP, tamaños responsive, lazy load).
- Referencia de estilo: "Áurea Hogar" (Google AI Studio).

---

## 7. Para más adelante (no hacer ahora)

Ideas que el dueño ya mencionó, para una segunda etapa. Dejar el código ordenado para poder sumarlas:

- **Base de datos** (probablemente Supabase) para lo que necesita memoria:
  - **stock por cantidades** (también por opción), descontado al **confirmar** un pedido en el panel; ventas manuales;
  - **registro de pedidos** con estados y número de pedido en el mensaje de WhatsApp;
  - **lista de clientes**;
  - **estadísticas** (más vendidos, ventas por mes);
  - **cupones** (porcentaje, envío gratis, vencimiento, límite de usos).
- **Envío según zona** con costo en el carrito + **envío gratis desde un monto**.
- **Factura**: RUC y razón social en el carrito.
- **Combos / packs** con precio especial.
- **Opiniones de clientes** (las carga el dueño) y página de **Cambios y devoluciones**.
- **Pago online** (Bancard, Pagopar u otro).
- **Meta Pixel / Google Analytics** si se hace publicidad.

---

## 8. Orden de trabajo

1. Proyecto Astro con los componentes y estilos del prototipo, usando los productos de ejemplo.
2. Publicar en Netlify (sitio visible desde el primer día).
3. Panel Sveltia/Decap: productos (con interruptores activo/agotado y precio de oferta) y configuración de la tienda. Login para 2 personas.
4. Páginas por producto con vista previa para redes.
5. Cargar los productos reales.
6. Dominio propio.

---

## 9. Repos de referencia

- `sveltia/sveltia-cms` — el panel (reemplazo moderno de Decap/Netlify CMS).
- `jshuntley/astro-decap-cloudflare-starter` — Astro + panel con login de GitHub.
- `codestitchofficial/advanced-astro-snipcart` — productos como *content collection* de Astro y páginas por producto.

---

## 10. Pendiente del dueño

- [x] Nombre definitivo de la tienda: **Casa Porã** (direcciones web: `casapora`)
- [ ] Número de WhatsApp
- [ ] Productos (nombre, precio, tipo, ambientes, opciones) y fotos
- [ ] Textos de envíos y formas de pago para la sección de compromisos
- [ ] Cuentas: GitHub y Netlify (y el email de la segunda persona que va a usar el panel)
- [ ] Dominio (.com en Cloudflare o Porkbun ≈ US$ 11/año; .com.py ≈ US$ 70–100/año)
