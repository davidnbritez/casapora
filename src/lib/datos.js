// Carga la tienda, los productos, los combos y las opiniones (archivos JSON editados desde el panel /admin)
// y convierte las fotos subidas en WebP de varios tamaños (y JPG 1200×630 para compartir en redes).
import { getImage } from "astro:assets";
import tienda from "../data/tienda.json";

const archivos = import.meta.glob("../content/productos/*.json", { eager: true, import: "default" });
const archivosCombos = import.meta.glob("../content/combos/*.json", { eager: true, import: "default" });
const archivosOpiniones = import.meta.glob("../content/opiniones/*.json", { eager: true, import: "default" });
const fotosLocales = import.meta.glob("../assets/uploads/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}", { eager: true, import: "default" });

const porNombre = Object.fromEntries(
  Object.entries(fotosLocales).map(([ruta, img]) => [ruta.split("/").pop(), img])
);
const archivoDe = ruta => ruta && porNombre[decodeURIComponent(String(ruta).split("/").pop())];

const cache = new Map();

/** "/uploads/foto.jpg" → { sm, md, lg, w, h } con WebP optimizado. */
export async function foto(ruta) {
  if (!ruta) return null;
  if (cache.has(ruta)) return cache.get(ruta);
  const archivo = archivoDe(ruta);
  let out;
  if (!archivo) {
    // Foto que no está en src/assets/uploads (por ej. una URL externa): se usa tal cual.
    out = { sm: ruta, md: ruta, lg: ruta, w: 1200, h: 900, src: ruta };
  } else {
    const [sm, md, lg] = await Promise.all(
      [400, 800, 1400].map(width => getImage({ src: archivo, width: Math.min(width, archivo.width), format: "webp", quality: 78 }))
    );
    out = { sm: sm.src, md: md.src, lg: lg.src, w: archivo.width, h: archivo.height, src: ruta };
  }
  cache.set(ruta, out);
  return out;
}

/** Imagen para compartir en WhatsApp/Facebook: JPG 1200×630 recortado al centro. */
export async function fotoCompartir(ruta) {
  const archivo = archivoDe(ruta);
  if (!archivo) return ruta || null;
  const img = await getImage({ src: archivo, width: 1200, height: 630, fit: "cover", position: "center", format: "jpg", quality: 80 });
  return img.src;
}

const fotosDe = lista => Promise.all((lista || []).filter(Boolean).map(foto));

/**
 * En el panel se carga "precio normal" + "precio de oferta" (opcional).
 * Para mostrar se convierte a: precio = lo que se cobra, precioAntes = el tachado.
 * Una oferta igual o mayor al precio normal se ignora.
 */
function aPrecioVenta(normal, oferta) {
  return oferta > 0 && oferta < normal ? { precio: oferta, precioAntes: normal } : { precio: normal, precioAntes: undefined };
}

const ordenar = (a, b) =>
  (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || (a.orden ?? 999) - (b.orden ?? 999) || a.nombre.localeCompare(b.nombre, "es");

let memo = null;

async function cargarProductos() {
  const lista = Object.values(archivos).filter(p => p && p.slug && p.nombre && p.activo !== false);
  const productos = await Promise.all(lista.map(async ({ precioOferta, ...p }) => {
    const base = aPrecioVenta(p.precio, precioOferta);
    const items = (p.opciones && p.opciones.items) || [];
    return {
      ...p,
      ...base,
      id: p.slug,
      tipo: "producto",
      ambientes: p.ambientes || [],
      combinaCon: (p.combinaCon || []).filter(Boolean),
      detalles: Array.isArray(p.detalles) ? p.detalles.filter(d => d && d.clave) : [],
      fotos: await fotosDe(p.fotos),
      opciones: items.length
        ? {
            titulo: p.opciones.titulo || "Opción",
            items: await Promise.all(items.map(async ({ precioOferta: of, ...o }) => ({
              ...o,
              // Opción sin precio propio: usa el del producto (con su oferta, si la tiene).
              ...(o.precio ? aPrecioVenta(o.precio, of) : of ? aPrecioVenta(p.precio, of) : { precio: undefined, precioAntes: undefined }),
              fotos: await fotosDe(o.fotos),
            }))),
          }
        : null,
    };
  }));
  return productos;
}

/** Precio actual de un producto (o de una de sus opciones, buscada por nombre). */
function precioDe(p, opcionNombre) {
  const o = opcionNombre && p.opciones ? p.opciones.items.find(x => x.nombre.toLowerCase() === String(opcionNombre).toLowerCase()) : null;
  return { precio: (o && o.precio) || p.precio, opcion: o };
}

/**
 * Combos: se muestran como un producto más (tipo Combos), con la lista de lo que incluye
 * y el precio "por separado" calculado solo a partir de los productos.
 */
async function cargarCombos(productos) {
  const porSlug = Object.fromEntries(productos.map(p => [p.slug, p]));
  const lista = Object.values(archivosCombos).filter(c => c && c.slug && c.nombre && c.activo !== false && c.precio > 0);
  const combos = await Promise.all(lista.map(async c => {
    const incluye = (c.incluye || []).filter(i => i && i.producto).map(i => {
      const p = porSlug[i.producto];
      if (!p) return { faltante: true };
      const cantidad = Math.max(1, Number(i.cantidad) || 1);
      const { precio, opcion } = precioDe(p, i.opcion);
      return { slug: p.slug, nombre: p.nombre, opcion: opcion ? opcion.nombre : (i.opcion || ""), cantidad, precio, agotado: !!p.agotado, ambientes: p.ambientes, foto: (opcion && opcion.fotos[0]) || p.fotos[0] || null };
    });
    if (!incluye.length) return null;
    const faltan = incluye.some(i => i.faltante);
    const separado = incluye.reduce((t, i) => t + (i.precio || 0) * (i.cantidad || 0), 0);
    const fotosPropias = await fotosDe(c.fotos);
    return {
      id: c.slug,
      slug: c.slug,
      tipo: "combo",
      nombre: c.nombre,
      categoria: "Combos",
      ambientes: [...new Set(incluye.flatMap(i => i.ambientes || []))],
      precio: c.precio,
      precioAntes: separado > c.precio ? separado : undefined,
      separado,
      incluye: incluye.filter(i => !i.faltante).map(({ ambientes, ...i }) => i),
      bono: c.bono || "",
      etiqueta: c.etiqueta || "Combo",
      resumen: c.resumen || "",
      descripcion: c.descripcion || "",
      medida: `${incluye.reduce((t, i) => t + (i.cantidad || 0), 0)} piezas`,
      fotos: fotosPropias.length ? fotosPropias : incluye.map(i => i.foto).filter(Boolean).slice(0, 1),
      destacado: !!c.destacado,
      orden: c.orden ?? 5,
      // Un combo está agotado si falta o está agotado cualquiera de sus productos.
      agotado: faltan || incluye.some(i => i.agotado),
      combinaCon: [],
      detalles: [],
      opciones: null,
      nuevo: false,
    };
  }));
  return combos.filter(Boolean);
}

/** Productos y combos activos, ordenados como "Destacados". */
export async function getProductos() {
  if (!memo) {
    memo = (async () => {
      const productos = await cargarProductos();
      const combos = await cargarCombos(productos);
      return [...productos, ...combos].sort(ordenar);
    })();
  }
  return memo;
}

/** Opiniones activas (las carga el dueño en el panel). */
export async function getOpiniones() {
  const lista = Object.values(archivosOpiniones).filter(o => o && o.texto && o.nombre && o.activo !== false);
  const out = await Promise.all(lista.map(async o => ({
    texto: o.texto, nombre: o.nombre, barrio: o.barrio || "", producto: o.producto || "",
    foto: o.foto ? await foto(o.foto) : null, orden: o.orden ?? 100,
  })));
  return out.sort((a, b) => a.orden - b.orden);
}

export async function getTienda() {
  const envio = tienda.envio || {};
  const regalo = tienda.regalo || {};
  const envioOk = { activo: !!envio.activo && envio.gratisDesde > 0, costo: Number(envio.costo) || 0, gratisDesde: Number(envio.gratisDesde) || 0 };
  const plazo = (tienda.plazoEntrega || "").trim();
  const garantia = (tienda.garantia || "").trim();
  return {
    ...tienda,
    plazoEntrega: plazo,
    garantia,
    // La barra de anuncios suma sola el envío gratis cuando está activado.
    anunciosTodos: [...(envioOk.activo ? [`Envío gratis desde ${gs(envioOk.gratisDesde)}`] : []), ...(tienda.anuncios || [])],
    // Los compromisos suman solos el plazo de entrega y la garantía cuando están cargados.
    compromisosTodos: [
      ...(tienda.compromisos || []),
      ...(plazo ? [{ icono: "clock", texto: `Entrega ${plazo}` }] : []),
      ...(garantia ? [{ icono: "shield", texto: garantia }] : []),
    ],
    envio: envioOk,
    regalo: { activo: !!regalo.activo && regalo.precio >= 0, precio: Number(regalo.precio) || 0 },
    portadaImg: await foto(tienda.portada),
    portadaCompartir: await fotoCompartir(tienda.portada),
  };
}

/** Tipos y ambientes en el orden definido en tienda.json (solo los que tienen productos). Combos va primero. */
export function listas(tienda, productos) {
  const ordenarLista = (base = [], usados) => [...base.filter(x => usados.has(x)), ...[...usados].filter(x => !base.includes(x))];
  return {
    tipos: ordenarLista(["Combos", ...(tienda.tipos || [])], new Set(productos.map(p => p.categoria))),
    ambientes: ordenarLista(tienda.ambientes, new Set(productos.flatMap(p => p.ambientes))),
  };
}

export const gs = n => "Gs. " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const precioMin = p => Math.min(p.precio, ...((p.opciones && p.opciones.items) || []).map(o => o.precio || p.precio));
