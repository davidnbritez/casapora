// Carga la tienda y los productos (archivos JSON editados desde el panel /admin)
// y convierte las fotos subidas en WebP de varios tamaños.
import { getImage } from "astro:assets";
import tienda from "../data/tienda.json";

const archivos = import.meta.glob("../content/productos/*.json", { eager: true, import: "default" });
const fotosLocales = import.meta.glob("../assets/uploads/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}", { eager: true, import: "default" });

const porNombre = Object.fromEntries(
  Object.entries(fotosLocales).map(([ruta, img]) => [ruta.split("/").pop(), img])
);

const cache = new Map();

/** "/uploads/foto.jpg" → { sm, md, lg, w, h } con WebP optimizado. */
export async function foto(ruta) {
  if (!ruta) return null;
  if (cache.has(ruta)) return cache.get(ruta);
  const archivo = porNombre[decodeURIComponent(ruta.split("/").pop())];
  let out;
  if (!archivo) {
    // Foto que no está en src/assets/uploads (por ej. una URL externa): se usa tal cual.
    out = { sm: ruta, md: ruta, lg: ruta, w: 1200, h: 900 };
  } else {
    const [sm, md, lg] = await Promise.all(
      [400, 800, 1400].map(width => getImage({ src: archivo, width: Math.min(width, archivo.width), format: "webp", quality: 78 }))
    );
    out = { sm: sm.src, md: md.src, lg: lg.src, w: archivo.width, h: archivo.height };
  }
  cache.set(ruta, out);
  return out;
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

export async function getProductos() {
  const lista = Object.values(archivos).filter(p => p && p.slug && p.nombre && p.activo !== false);
  const productos = await Promise.all(lista.map(async ({ precioOferta, ...p }) => {
    const base = aPrecioVenta(p.precio, precioOferta);
    const items = (p.opciones && p.opciones.items) || [];
    return {
      ...p,
      ...base,
      id: p.slug,
      ambientes: p.ambientes || [],
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
  // "Destacados": primero los marcados como destacados, después por número de orden.
  return productos.sort((a, b) =>
    (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || (a.orden ?? 999) - (b.orden ?? 999) || a.nombre.localeCompare(b.nombre, "es"));
}

export async function getTienda() {
  return { ...tienda, portadaImg: await foto(tienda.portada) };
}

/** Tipos y ambientes en el orden definido en tienda.json (solo los que tienen productos). */
export function listas(tienda, productos) {
  const ordenar = (base = [], usados) => [...base.filter(x => usados.has(x)), ...[...usados].filter(x => !base.includes(x))];
  return {
    tipos: ordenar(tienda.tipos, new Set(productos.map(p => p.categoria))),
    ambientes: ordenar(tienda.ambientes, new Set(productos.flatMap(p => p.ambientes))),
  };
}

export const gs = n => "Gs. " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const precioMin = p => Math.min(p.precio, ...((p.opciones && p.opciones.items) || []).map(o => o.precio || p.precio));
