// Catálogo, ficha de producto y pedido por WhatsApp (lado del navegador).
import { ICO, ART } from "./arte.js";

const { tienda: TIENDA, productos: PRODUCTOS, opiniones: OPINIONES = [] } = JSON.parse(document.getElementById("datos").textContent);
const ENVIO = TIENDA.envio || { activo: false };
const REGALO = TIENDA.regalo || { activo: false };

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const gs = n => "Gs. " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const norm = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const waLink = msg => `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(msg)}`;
const pageUrl = () => location.origin + "/producto/";
const byId = id => PRODUCTOS.find(p => p.id === id);
const opts = p => (p.opciones && p.opciones.items) || [];
const hasColors = p => opts(p).length > 0 && opts(p).every(o => o.color);
const optAt = (p, i) => opts(p)[i] || null;
const isCombo = p => p.tipo === "combo";
function priceOf(p, i) { const o = optAt(p, i); return { precio: (o && o.precio) || p.precio, antes: o && o.precio ? o.precioAntes : p.precioAntes }; }
const minPrice = p => Math.min(p.precio, ...opts(p).map(o => o.precio || p.precio));
const pricesVary = p => new Set(opts(p).map((o, k) => priceOf(p, k).precio)).size > 1;
const fotosOf = (p, i) => { const o = optAt(p, i); return (o && o.fotos && o.fotos.length) ? o.fotos : (p.fotos || []); };
// Producto que se agrega con un toque (sin opciones o con colores); los demás abren la ficha para elegir.
const quickAdd = p => !p.agotado && (!opts(p).length || hasColors(p));
/** "Manta tejida (Terracota) + 2 × Funda de almohadón de lino (Natural) + …" */
const incluyeTexto = p => (p.incluye || []).map(i => `${i.cantidad > 1 ? `${i.cantidad} × ` : ""}${i.nombre}${i.opcion ? ` (${i.opcion})` : ""}`).join(" + ");

const SIZES = { card: "(max-width:640px) 50vw, (max-width:1000px) 50vw, (max-width:1100px) 33vw, 320px", big: "(max-width:900px) 100vw, 560px", th: "80px", mini: "120px" };
function imgFor(p, i = 0, photo = 0, size = "card", eager = false) {
  const o = optAt(p, i);
  const fotos = fotosOf(p, i);
  const f = fotos[photo] || fotos[0];
  const alt = `${esc(p.nombre)}${o ? ` — ${esc(o.nombre)}` : ""}`;
  if (f) return `<img src="${f.md}" srcset="${f.sm} 400w, ${f.md} 800w, ${f.lg} 1400w" sizes="${SIZES[size]}" width="${f.w}" height="${f.h}" alt="${alt}" ${eager ? "" : 'loading="lazy"'} decoding="async">`;
  const accent = (o && o.color) || "#b85c38";
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}"><rect width="200" height="200" fill="${p.fondo || "#ece4d8"}"/>${ART[p.ilustracion] ? ART[p.ilustracion](accent) : `<text x="100" y="98" text-anchor="middle" font-family="Georgia,serif" font-size="12.5" fill="#5f584f">${esc(p.nombre.length > 30 ? p.nombre.slice(0, 29) + "…" : p.nombre)}</text><text x="100" y="118" text-anchor="middle" font-family="system-ui,sans-serif" font-size="7" letter-spacing="1.6" fill="#776d60">FOTO PRÓXIMAMENTE</text>`}</svg>`;
}
function priceHTML(p, i) { const { precio, antes } = priceOf(p, i); return antes ? `<b class="sale">${gs(precio)}</b><s>${gs(antes)}</s>` : `<b>${gs(precio)}</b>`; }
function pillsHTML(p, i) {
  const { precio, antes } = priceOf(p, i);
  const left = p.agotado ? `<span class="pill l out">Agotado</span>` : p.etiqueta ? `<span class="pill l">${esc(p.etiqueta)}</span>` : p.nuevo ? `<span class="pill l">Nuevo</span>` : "";
  const right = !p.agotado && antes ? `<span class="pill r off">${isCombo(p) ? "Ahorrás " : "−"}${Math.round((1 - precio / antes) * 100)}%</span>` : "";
  return left + right;
}

/* ---------- Catálogo: filtros, orden y grilla ---------- */
const presentes = new Set(PRODUCTOS.flatMap(p => p.ambientes));
const AMBIENTES = [...(TIENDA.ambientes || []).filter(a => presentes.has(a)), ...[...presentes].filter(a => !(TIENDA.ambientes || []).includes(a))];
const tiposPresentes = new Set(PRODUCTOS.map(p => p.categoria));
const baseTipos = ["Combos", ...(TIENDA.tipos || [])];
const TIPOS = [...baseTipos.filter(t => tiposPresentes.has(t)), ...[...tiposPresentes].filter(t => !baseTipos.includes(t))];
let amb = "Todos", tipo = "Todo", query = "", sort = "dest";
const sel = {};
const selOf = id => sel[id] || 0;

function renderFilters() {
  $("#ambs").innerHTML = ["Todos", ...AMBIENTES].map(a => `<button class="amb" aria-pressed="${a === amb}" data-amb="${esc(a)}">${a === "Todos" ? "Todos los ambientes" : esc(a)}</button>`).join("");
  $("#tabs").innerHTML = ["Todo", ...TIPOS].map(t => `<button class="tab" aria-pressed="${t === tipo}" data-tipo="${esc(t)}">${t === "Todo" ? "Todos los artículos" : esc(t)}</button>`).join("");
}
function swatchesHTML(p, big = false) {
  const i = selOf(p.id);
  return `<div class="${big ? "opt-row" : "swatches"}" role="radiogroup" aria-label="${esc(p.opciones.titulo)} de ${esc(p.nombre)}">` +
    opts(p).map((o, k) => `<button class="sw" role="radio" aria-checked="${k === i}" aria-label="${esc(o.nombre)}" title="${esc(o.nombre)}" data-sw="${p.id}" data-k="${k}"><i style="background:${esc(o.color)}"></i></button>`).join("") +
    (big ? "" : `<span class="sw-name">${esc(optAt(p, i).nombre)}</span>`) + `</div>`;
}
function addButton(p, compact = false) {
  if (p.agotado) return `<button class="btn-notify" data-open="${p.id}">Avisarme</button>`;
  if (!quickAdd(p)) return `<button class="btn-add" data-open="${p.id}">Elegir${compact ? "" : ` ${esc(p.opciones.titulo.toLowerCase())}`}</button>`;
  return `<button class="btn-add" data-add="${p.id}" aria-label="Añadir ${esc(p.nombre)} al pedido">${ICO.plus}<span>Añadir</span></button>`;
}
function cardHTML(p, idx) {
  const i = selOf(p.id);
  const many = opts(p).length && !hasColors(p);
  const meta = [(p.ambientes[0] || p.categoria), p.medida].filter(Boolean).map(esc).join(`<i aria-hidden="true">·</i>`);
  const priceBox = many && pricesVary(p) ? `<span class="from">desde</span><b>${gs(minPrice(p))}</b>` : priceHTML(p, i);
  const extra = isCombo(p)
    ? `<p class="combo-inc">${esc(incluyeTexto(p))}</p>${p.separado > p.precio ? `<p class="combo-sep">Si los comprás por separado: ${gs(p.separado)}</p>` : ""}`
    : hasColors(p) ? swatchesHTML(p) : many ? `<div class="opts-note">${opts(p).length} opciones de ${esc(p.opciones.titulo.toLowerCase())}</div>` : "";
  return `<article class="card${p.agotado ? " soldout" : ""}${isCombo(p) ? " combo" : ""}" data-card="${p.id}" style="animation-delay:${Math.min(idx, 8) * 40}ms">
    <button class="img" data-open="${p.id}" aria-label="Ver ${esc(p.nombre)}">${pillsHTML(p, i)}${imgFor(p, i, 0, "card", idx < 4)}<span class="quick" aria-hidden="true">${ICO.eye}Vista rápida</span></button>
    <div class="body">
      <div class="meta">${meta}</div>
      <button class="nm" data-open="${p.id}" tabindex="-1">${esc(p.nombre)}</button>
      <p class="desc">${esc(p.resumen)}</p>
      ${extra}
      <div class="foot"><div class="price">${priceBox}</div>${addButton(p)}</div>
    </div>
  </article>`;
}
function filtered() {
  const q = norm(query.trim());
  const base = PRODUCTOS.map((p, k) => ({ p, k }))
    .filter(({ p }) => amb === "Todos" || p.ambientes.includes(amb))
    .filter(({ p }) => tipo === "Todo" || p.categoria === tipo)
    .filter(({ p }) => !q || norm([p.nombre, p.categoria, p.ambientes.join(" "), p.resumen, p.descripcion, opts(p).map(o => o.nombre).join(" "), incluyeTexto(p)].join(" ")).includes(q));
  const cmp = { dest: (a, b) => a.k - b.k, nuevo: (a, b) => (b.p.nuevo ? 1 : 0) - (a.p.nuevo ? 1 : 0) || a.k - b.k, asc: (a, b) => minPrice(a.p) - minPrice(b.p), desc: (a, b) => minPrice(b.p) - minPrice(a.p) }[sort];
  return base.sort((a, b) => (a.p.agotado ? 1 : 0) - (b.p.agotado ? 1 : 0) || cmp(a, b)).map(x => x.p);
}
function renderGrid() {
  const list = filtered();
  const active = amb !== "Todos" || tipo !== "Todo" || query.trim();
  $("#count").innerHTML = `Mostrando <b>${list.length}</b> ${list.length === 1 ? "artículo" : "artículos"}${amb !== "Todos" ? ` para <b>${esc(amb)}</b>` : ""}`;
  $("#resetFilters").hidden = !active;
  $("#grid").innerHTML = list.length ? list.map(cardHTML).join("")
    : `<div class="empty"><b>No encontramos nada con eso</b>Probá con otro filtro, o escribinos: capaz lo tenemos y todavía no está cargado.<div class="cta"><button class="btn btn-ghost" data-reset>Ver todo</button><a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`¡Hola! Estoy buscando: ${(query.trim() || amb)}. ¿Tienen algo?`)}">${ICO.wa}Preguntar por WhatsApp</a></div></div>`;
}
function resetFilters() { amb = "Todos"; tipo = "Todo"; query = ""; $("#q").value = ""; $("#clearQ").hidden = true; renderFilters(); renderGrid(); }
function selectOption(id, k) {
  sel[id] = k; const p = byId(id);
  const card = document.querySelector(`[data-card="${id}"]`);
  if (card) {
    const img = card.querySelector(".img");
    img.innerHTML = pillsHTML(p, k) + imgFor(p, k) + `<span class="quick" aria-hidden="true">${ICO.eye}Vista rápida</span>`;
    card.querySelectorAll(".sw").forEach(b => b.setAttribute("aria-checked", +b.dataset.k === k));
    const nm = card.querySelector(".sw-name"); if (nm) nm.textContent = optAt(p, k).nombre;
    const pr = card.querySelector(".foot .price"); if (pr && hasColors(p)) pr.innerHTML = priceHTML(p, k);
  }
  if (openId === id) fillProductOptions(p);
}

/* ---------- Sugerencias: "Completá el ambiente" ---------- */
function relacionados(p) {
  const directos = (p.combinaCon || []).map(byId).filter(Boolean);
  const mismoAmbiente = PRODUCTOS.filter(x => !isCombo(x) && x.ambientes.some(a => p.ambientes.includes(a)));
  return [...directos, ...mismoAmbiente];
}
function sugerencias(base, excluir, cantidad, faltante = 0) {
  const vistos = new Set(excluir);
  const lista = [];
  for (const p of base) {
    if (!p || vistos.has(p.id) || p.agotado || isCombo(p)) continue;
    vistos.add(p.id); lista.push(p);
  }
  // Si falta poco para el envío gratis, primero los que lo completan (el más barato que alcanza primero).
  if (faltante > 0) {
    const completan = lista.filter(p => minPrice(p) >= faltante).sort((a, b) => minPrice(a) - minPrice(b));
    const resto = lista.filter(p => minPrice(p) < faltante);
    return [...completan, ...resto].slice(0, cantidad);
  }
  return lista.slice(0, cantidad);
}
function miniHTML(p) {
  return `<div class="mini" data-card-mini="${p.id}">
    <button class="mini-img" data-open="${p.id}" aria-label="Ver ${esc(p.nombre)}">${imgFor(p, 0, 0, "mini")}</button>
    <div class="mini-b"><button class="mini-nm" data-open="${p.id}">${esc(p.nombre)}</button>
    <div class="price">${opts(p).length && pricesVary(p) ? `<span class="from">desde</span><b>${gs(minPrice(p))}</b>` : priceHTML(p, 0)}</div>
    ${addButton(p, true)}</div>
  </div>`;
}

/* ---------- Pedido (carrito), guardado en este navegador ---------- */
const CART_KEY = "pedido-" + norm(TIENDA.nombre).replace(/\s+/g, "-");
let cart = {}, regalo = false;
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}") || {}; } catch { cart = {}; }
try { regalo = REGALO.activo && localStorage.getItem(CART_KEY + "-regalo") === "1"; } catch { regalo = false; }
const keyOf = (id, k) => `${id}::${k}`;
const parseKey = key => { const [id, k] = key.split("::"); return { p: byId(id), k: +k || 0 }; };
function cleanCart() { for (const key in cart) { const { p, k } = parseKey(key); if (!p || p.agotado || !(cart[key] > 0) || (opts(p).length && !optAt(p, k))) delete cart[key]; } }
function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); localStorage.setItem(CART_KEY + "-regalo", regalo ? "1" : "0"); } catch {} }
const cartItems = () => Object.entries(cart).map(([key, q]) => ({ key, ...parseKey(key), q }));
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
const cartSubtotal = () => cartItems().reduce((t, { p, k, q }) => t + priceOf(p, k).precio * q, 0);
const optLabel = (p, k) => { const o = optAt(p, k); return o ? `${o.nombre}${o.nota ? `, ${o.nota}` : ""}` : ""; };
/* ---------- Datos del cliente (paso 2), guardados en este navegador ---------- */
const ZONAS = TIENDA.zonas || [];
const RETIRO = TIENDA.retiro || { activo: false };
const EXTRAS = TIENDA.camposExtra || [];
const DATOS_KEY = CART_KEY + "-datos";
const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
const marcado = name => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ""; };
/** Lo que eligió el cliente en el paso 2. */
function leerDatos() {
  const entrega = marcado("entrega");
  const zona = entrega && entrega[0] === "z" ? ZONAS[+entrega.slice(1)] || null : null;
  const factura = !!(document.getElementById("fFactura") || {}).checked;
  return {
    nombre: val("fNombre"),
    entrega, zona, retiro: entrega === "retiro",
    direccion: val("fDir"),
    pago: marcado("pago"),
    factura, ruc: val("fRuc"), razon: val("fRazon"),
    extras: EXTRAS.map((c, i) => ({ etiqueta: c.etiqueta, valor: val(`fx${i}`), obligatorio: c.obligatorio })),
    notas: val("cNotes"),
  };
}
function guardarDatos() {
  const d = leerDatos();
  try { localStorage.setItem(DATOS_KEY, JSON.stringify({ nombre: d.nombre, entrega: d.entrega, direccion: d.direccion, pago: d.pago, factura: d.factura, ruc: d.ruc, razon: d.razon, extras: d.extras.map(x => x.valor) })); } catch {}
}
function cargarDatos() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DATOS_KEY) || "null"); } catch { d = null; }
  if (!d) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
  set("fNombre", d.nombre); set("fDir", d.direccion); set("fRuc", d.ruc); set("fRazon", d.razon);
  (d.extras || []).forEach((v, i) => set(`fx${i}`, v));
  [["entrega", d.entrega], ["pago", d.pago]].forEach(([n, v]) => { const el = v && document.querySelector(`input[name="${n}"][value="${CSS.escape(v)}"]`); if (el) el.checked = true; });
  const f = document.getElementById("fFactura"); if (f) f.checked = !!d.factura;
}
const normRuc = s => s.replace(/[.\s]/g, "");
const rucValido = s => /^\d{5,9}(-\d)?$/.test(normRuc(s));
/** Campos con problema (vacío obligatorio o formato inválido). */
function validar() {
  const d = leerDatos(), mal = [];
  if (!d.nombre) mal.push("nombre");
  if ((ZONAS.length || RETIRO.activo) && !d.entrega) mal.push("entrega");
  if (d.zona && !d.direccion) mal.push("direccion");
  if ((TIENDA.pagos || []).length && !d.pago) mal.push("pago");
  if (d.factura && !rucValido(d.ruc)) mal.push("ruc");
  if (d.factura && !d.razon) mal.push("razon");
  d.extras.forEach((x, i) => { if (x.obligatorio && !x.valor) mal.push(`extra${i}`); });
  return mal;
}
function mostrarErrores(mal) {
  document.querySelectorAll("#cForm [data-campo]").forEach(f => {
    const err = mal.includes(f.dataset.campo);
    f.classList.toggle("invalido", err);
    const msg = f.querySelector(".err"); if (msg) msg.hidden = !err;
    f.querySelectorAll("input,textarea,select").forEach(i => i.setAttribute("aria-invalid", err ? "true" : "false"));
  });
}
/** Muestra u oculta dirección y datos de factura según lo elegido. */
function actualizarFormulario() {
  const d = leerDatos();
  const dir = document.querySelector('[data-campo="direccion"]'); if (dir) dir.hidden = !d.zona;
  const fc = document.getElementById("fFacturaCampos"); if (fc) fc.hidden = !d.factura;
}

/** Subtotal, envío (según la zona elegida), regalo y total del pedido. */
function cuentas() {
  const subtotal = cartSubtotal();
  const d = leerDatos();
  const alcanzaGratis = ENVIO.activo && subtotal >= ENVIO.gratisDesde;
  // envio: null = todavía no se sabe (sin zona elegida o costo a coordinar); 0 = gratis o retiro.
  let envio = null, envioTexto = "", aCoordinar = false;
  if (d.retiro) { envio = 0; envioTexto = RETIRO.texto || "Retiro coordinado"; }
  else if (d.zona) {
    if (alcanzaGratis && !d.zona.sinEnvioGratis) { envio = 0; envioTexto = "gratis"; }
    else if (d.zona.costo > 0) { envio = d.zona.costo; envioTexto = gs(d.zona.costo); }
    else { aCoordinar = true; envioTexto = "a coordinar"; }
  }
  const extraRegalo = REGALO.activo && regalo ? REGALO.precio : 0;
  return {
    subtotal, envio, envioTexto, aCoordinar, zona: d.zona, retiro: d.retiro, envioGratis: alcanzaGratis,
    faltante: ENVIO.activo ? Math.max(0, ENVIO.gratisDesde - subtotal) : 0,
    regalo: extraRegalo, total: subtotal + (envio || 0) + extraRegalo,
  };
}

function addToCart(id, k = 0, qty = 1) {
  const p = byId(id); if (!p || p.agotado) return;
  const key = keyOf(id, k);
  cart[key] = Math.min(99, (cart[key] || 0) + qty);
  saveCart(); renderCart(true);
  const lbl = optAt(p, k) ? ` · ${optAt(p, k).nombre}` : "";
  toast(`Agregado: ${p.nombre}${lbl}${qty > 1 ? ` (×${qty})` : ""}`);
}
function setQty(key, q) { if (q <= 0) delete cart[key]; else cart[key] = Math.min(99, q); saveCart(); renderCart(); }
function orderMessage() {
  const c = cuentas(), d = leerDatos();
  const lines = cartItems().map(({ p, k, q }) =>
    `• ${q} × ${p.nombre}${optAt(p, k) ? ` (${optLabel(p, k)})` : ""} — ${gs(priceOf(p, k).precio * q)}${isCombo(p) ? ` (${incluyeTexto(p)}${p.bono ? ` · ${p.bono}` : ""})` : ""}`);
  const out = [`¡Hola ${TIENDA.nombre}! Quiero hacer este pedido:`, "", ...lines, ""];
  const conDesglose = c.envioTexto || c.regalo;
  if (conDesglose) out.push(`Subtotal: ${gs(c.subtotal)}`);
  if (c.regalo) out.push(`Envoltorio para regalo: ${gs(c.regalo)}`);
  if (c.retiro) out.push(`Entrega: ${c.envioTexto}`);
  else if (c.zona) out.push(`Envío (${c.zona.nombre}): ${c.envioTexto}`);
  out.push(`*Total: ${gs(c.total)}*${c.aCoordinar ? " + envío a coordinar" : ""}`);
  out.push("");
  if (d.nombre) out.push(`Nombre: ${d.nombre}`);
  if (c.zona) out.push(`Dirección: ${d.direccion || "a confirmar"}`);
  if (d.pago) out.push(`Pago: ${d.pago}`);
  if (d.factura) out.push(`Factura: RUC ${normRuc(d.ruc)} · Razón social ${d.razon}`);
  d.extras.forEach(x => { if (x.valor) out.push(`${x.etiqueta}: ${x.valor}`); });
  if (d.notas) out.push(`Notas: ${d.notas}`);
  out.push("", "¿Está todo disponible?");
  return out.join("\n");
}
function opinionCorta() {
  const enCarrito = new Set(cartItems().map(x => x.p.id));
  const delCarrito = OPINIONES.filter(o => enCarrito.has(o.producto));
  const lista = (delCarrito.length ? delCarrito : OPINIONES).slice().sort((a, b) => a.texto.length - b.texto.length);
  return lista[0] || null;
}
function opinionHTML(o, chica = false) {
  return `<figure class="op-mini${chica ? " chica" : ""}"><blockquote>“${esc(o.texto)}”</blockquote><figcaption>${esc(o.nombre)}${o.barrio ? `, ${esc(o.barrio)}` : ""}</figcaption></figure>`;
}
function infoHTML(lugar) {
  const items = [];
  if (TIENDA.plazoEntrega) items.push(`${ICO.clock}<span>Entrega ${esc(TIENDA.plazoEntrega)}</span>`);
  if (TIENDA.garantia) items.push(`${ICO.shield}<span>${esc(TIENDA.garantia)}</span>`);
  return items.map(x => `<li>${x}</li>`).join("");
}
function renderCart(bump = false) {
  cleanCart();
  const n = cartCount(), c = cuentas();
  const badge = $("#cartCount");
  badge.textContent = n; badge.hidden = n === 0;
  $("#cartBtn").setAttribute("aria-label", n ? `Ver tu pedido, ${n} ${n === 1 ? "artículo" : "artículos"}` : "Ver tu pedido");
  $("#fabCart").hidden = n === 0;
  $("#fabN").textContent = n; $("#fabTotal").textContent = gs(c.total);
  if (bump) [badge, $("#fabN")].forEach(el => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); });
  updateFab();
  $("#cSub").textContent = n ? ` · ${n} ${n === 1 ? "artículo" : "artículos"}` : "";
  if (!n) paso = 1;
  $("#cFoot").hidden = n === 0;
  mostrarPaso();

  // Sugerencias según lo que hay en el pedido.
  const items = cartItems();
  const base = items.flatMap(({ p }) => isCombo(p) ? (p.incluye || []).map(i => byId(i.slug)).filter(Boolean).flatMap(relacionados) : relacionados(p));
  const sug = n ? sugerencias(base, items.map(x => x.p.id).concat(items.flatMap(x => (x.p.incluye || []).map(i => i.slug))), 2, c.faltante) : [];

  $("#cBody").innerHTML = n ? items.map(({ key, p, k, q }) => `
    <div class="line">
      <div class="th">${imgFor(p, k, 0, "th")}</div>
      <div>
        <div class="nm">${esc(p.nombre)}</div>
        ${optAt(p, k) ? `<div class="up">${esc(p.opciones.titulo)}: ${esc(optLabel(p, k))}</div>` : ""}${isCombo(p) ? `<div class="up">${esc(incluyeTexto(p))}</div>` : ""}<div class="up">${gs(priceOf(p, k).precio)} c/u</div>
        <div class="row2">
          <div class="stepper" aria-label="Cantidad de ${esc(p.nombre)}">
            <button data-dec="${key}" aria-label="Menos uno">${ICO.minus}</button>
            <output>${q}</output>
            <button data-inc="${key}" aria-label="Más uno" ${q >= 99 ? "disabled" : ""}>${ICO.plus}</button>
          </div>
          <button class="rm" data-rm="${key}" aria-label="Quitar ${esc(p.nombre)}">${ICO.trash}</button>
        </div>
      </div>
      <div class="sub">${gs(priceOf(p, k).precio * q)}</div>
    </div>`).join("") + `<button class="clear-cart" id="clearCart">Vaciar pedido</button>` +
    (sug.length ? `<div class="sug c-sug"><h4>${c.faltante > 0 && minPrice(sug[0]) >= c.faltante ? "Sumá uno y llegás al envío gratis" : "Completá el ambiente"}</h4><div class="mini-row">${sug.map(miniHTML).join("")}</div></div>` : "")
    : `<div class="cart-empty"><div class="ic">${ICO.bag}</div><b>Tu pedido está vacío</b>Agregá productos con el botón “Añadir” y después nos lo mandás por WhatsApp.<br><button class="btn btn-primary" id="cBrowse">Ver catálogo</button></div>`;

  // Envío gratis: barra de progreso.
  const eb = $("#cEnvio");
  eb.hidden = !ENVIO.activo || !n;
  if (ENVIO.activo && n) {
    const pct = Math.min(100, Math.round((c.subtotal / ENVIO.gratisDesde) * 100));
    const excluida = c.zona && c.zona.sinEnvioGratis;
    eb.hidden = !!excluida || c.retiro;
    eb.innerHTML = `<p>${c.envioGratis ? `${ICO.truck}<b>¡Tenés envío gratis!</b>` : `${ICO.truck}<span>Te faltan <b>${gs(c.faltante)}</b> para el envío gratis</span>`}</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>`;
  }
  // Desglose: subtotal, regalo y envío (cuando ya se eligió cómo recibirlo).
  const rs = $("#cResumen");
  const desglose = !!(c.envioTexto || c.regalo);
  rs.hidden = !desglose;
  const filaEnvio = c.retiro ? `<dt>Entrega</dt><dd>${esc(c.envioTexto)}</dd>` : c.zona ? `<dt>Envío (${esc(c.zona.nombre)})</dt><dd>${c.envio === 0 ? "Gratis" : esc(c.envioTexto)}</dd>` : "";
  rs.innerHTML = desglose ? `<dt>Subtotal</dt><dd>${gs(c.subtotal)}</dd>${c.regalo ? `<dt>Envoltorio para regalo</dt><dd>${gs(c.regalo)}</dd>` : ""}${filaEnvio}` : "";
  $("#cTotal").textContent = gs(c.total) + (c.aCoordinar ? " + envío" : "");
  // Una opinión corta, encima del botón de enviar.
  const op = n && paso === 2 ? opinionCorta() : null;
  $("#cOpinion").hidden = !op; $("#cOpinion").innerHTML = op ? opinionHTML(op, true) : "";
  const ci = infoHTML("carrito"); $("#cInfo").hidden = !ci; $("#cInfo").innerHTML = ci;
  updateSendLink();
}
function updateSendLink() { $("#cSend").href = waLink(orderMessage()); }
let paso = 1;
function mostrarPaso() {
  const dos = paso === 2 && cartCount() > 0;
  $("#cBody").hidden = dos; $("#cForm").hidden = !dos;
  $("#cNext").hidden = dos; $("#cSend").hidden = !dos;
  $("#cBack").hidden = !dos;
  $("#cTitleTxt").textContent = dos ? "Tus datos" : "Tu pedido";
  $("#cPasos").hidden = cartCount() === 0;
  if (dos) { $("#cP1").removeAttribute("aria-current"); $("#cP2").setAttribute("aria-current", "step"); }
  else { $("#cP2").removeAttribute("aria-current"); $("#cP1").setAttribute("aria-current", "step"); }
}
function irAPaso(n, push = true) {
  paso = n; renderCart();
  if (n === 2) {
    actualizarFormulario();
    if (push && location.hash !== "#datos") { try { history.pushState({ layer: "datos" }, "", "#datos"); } catch {} }
    setTimeout(() => { const f = $("#fNombre"); if (f && !f.value) f.focus(); else $("#cBack").focus(); }, 60);
  }
  $(".drawer").scrollTop = 0; $("#cForm").scrollTop = 0; $("#cBody").scrollTop = 0;
}

/* ---------- Ventanas: ficha y pedido (el "atrás" del celular las cierra) ---------- */
const BG = ["main", "header.top", "footer", "#fab", "#fabCart", ".skip", ".announce", ".band"];
let lastFocus = null, pushed = false, mQty = 1, openId = null;
const isOpen = el => el.classList.contains("open");
const anyOpen = () => isOpen($("#scrim")) || isOpen($("#cartScrim"));
function setBackground(locked) {
  BG.forEach(s => document.querySelectorAll(s).forEach(el => { el.inert = locked; }));
  document.body.style.overflow = locked ? "hidden" : "";
  document.body.classList.toggle("capa-abierta", locked);
  updateFab();
}
function showLayer(scrim, focusEl, hash, push) {
  if (!anyOpen()) lastFocus = document.activeElement;
  [$("#scrim"), $("#cartScrim")].forEach(x => { if (x !== scrim) { x.classList.remove("open"); x.setAttribute("aria-hidden", "true"); } });
  scrim.classList.add("open"); scrim.setAttribute("aria-hidden", "false");
  setBackground(true);
  if (push && location.hash !== "#" + hash) { try { history.pushState({ layer: hash }, "", "#" + hash); pushed = true; } catch { pushed = false; } }
  setTimeout(() => focusEl.focus(), 60);
}
function hideLayers() {
  const was = anyOpen();
  [$("#scrim"), $("#cartScrim")].forEach(x => { x.classList.remove("open"); x.setAttribute("aria-hidden", "true"); });
  openId = null;
  if (!was) return;
  setBackground(false);
  if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
}
function closeLayer() {
  if (pushed) { pushed = false; history.back(); return; }
  hideLayers();
  if (location.hash) try { history.replaceState(null, "", location.pathname + location.search); } catch {}
}
function setMQty(q) { mQty = Math.max(1, Math.min(99, q)); $("#mQty").textContent = mQty; $("#mMinus").disabled = mQty <= 1; }
function fillProductOptions(p) {
  const k = selOf(p.id);
  const fotos = fotosOf(p, k);
  $("#mImg").innerHTML = pillsHTML(p, k) + imgFor(p, k, 0, "big", true);
  $("#mThumbs").innerHTML = fotos.length > 1 ? fotos.map((f, i) => `<button aria-current="${i === 0}" data-i="${i}" aria-label="Foto ${i + 1}"><img src="${f.sm}" alt=""></button>`).join("") : "";
  $("#mPrice").innerHTML = priceHTML(p, k);
  if (!opts(p).length) { $("#mOpts").hidden = true; return; }
  $("#mOpts").hidden = false;
  $("#mOpts").innerHTML = `<div class="opt-label">${esc(p.opciones.titulo)}: <b>${esc(optAt(p, k).nombre)}</b></div>` +
    (hasColors(p) ? swatchesHTML(p, true)
      : `<div class="opt-row" role="radiogroup" aria-label="${esc(p.opciones.titulo)}">${opts(p).map((o, j) => `<button class="opt-chip" role="radio" aria-checked="${j === k}" data-sw="${p.id}" data-k="${j}">${esc(o.nombre)}${o.nota ? `<small>${esc(o.nota)}</small>` : ""}${o.precio ? `<small>${gs(o.precio)}</small>` : ""}</button>`).join("")}</div>`);
}
function openProduct(id, push = true) {
  const p = byId(id); if (!p) return;
  openId = id;
  $("#mMeta").textContent = [...new Set([p.categoria, ...p.ambientes])].join(" · ");
  $("#mName").textContent = p.nombre;
  fillProductOptions(p);
  $("#mThumbs").onclick = e => { const b = e.target.closest("button"); if (!b) return; $("#mImg").innerHTML = pillsHTML(p, selOf(p.id)) + imgFor(p, selOf(p.id), +b.dataset.i, "big", true); [...$("#mThumbs").children].forEach(x => x.setAttribute("aria-current", x === b)); };
  const st = $("#mStock"); st.textContent = p.agotado ? "Agotado por ahora" : "Disponible"; st.classList.toggle("out", !!p.agotado);
  $("#mBuy").hidden = !!p.agotado;
  setMQty(1); $("#mAdd .t").textContent = "Agregar al pedido";
  // Opiniones de este producto (o de un producto del combo), debajo de "Agregar al pedido".
  const ids = new Set([p.id, ...(p.incluye || []).map(i => i.slug)]);
  const ops = OPINIONES.filter(o => ids.has(o.producto)).slice(0, 2);
  $("#mOps").hidden = !ops.length; $("#mOps").innerHTML = ops.map(o => opinionHTML(o)).join("");
  const wa = $("#mWa");
  wa.className = "btn " + (p.agotado ? "btn-wa" : "btn-wa-ghost");
  wa.href = waLink(p.agotado ? `¡Hola! Vi en el catálogo "${p.nombre}" que está agotado. ¿Cuándo vuelve a llegar?` : `¡Hola! Tengo una consulta sobre "${p.nombre}".`);
  $("#mWa .t").textContent = p.agotado ? "Avisarme cuando llegue" : "Hacer una consulta";
  const info = infoHTML("ficha"); $("#mInfo").hidden = !info; $("#mInfo").innerHTML = info;
  // Combo: qué incluye y cuánto saldría por separado.
  const inc = $("#mIncluye");
  inc.hidden = !isCombo(p);
  inc.innerHTML = isCombo(p) ? `<h4>Incluye</h4><ul>${p.incluye.map(i => `<li><span>${i.cantidad > 1 ? `${i.cantidad} × ` : ""}${esc(i.nombre)}${i.opcion ? ` <small>(${esc(i.opcion)})</small>` : ""}</span><span>${gs(i.precio * i.cantidad)}</span></li>`).join("")}</ul>${p.separado > p.precio ? `<p class="combo-sep">Si los comprás por separado: <s>${gs(p.separado)}</s> · <b>Precio del combo: ${gs(p.precio)}</b></p>` : ""}${p.bono ? `<p class="bono">${ICO.gift}<span>${esc(p.bono)}</span></p>` : ""}` : "";
  $("#mDesc").textContent = p.descripcion || "";
  $("#mSpecs").innerHTML = p.detalles.map(d => `<dt>${esc(d.clave)}</dt><dd>${esc(d.valor)}</dd>`).join("");
  $("#mSpecs").hidden = !p.detalles.length;
  // Completá el ambiente.
  const sug = isCombo(p) ? [] : sugerencias(relacionados(p), [p.id], 3);
  $("#mSug").hidden = !sug.length;
  $("#mSug").innerHTML = sug.length ? `<h4>Completá el ambiente</h4><div class="mini-row">${sug.map(miniHTML).join("")}</div>` : "";
  $("#mShare").onclick = async () => {
    const url = pageUrl() + p.id;
    try {
      if (navigator.share && matchMedia("(hover:none)").matches) { await navigator.share({ title: p.nombre, url }); return; }
      await navigator.clipboard.writeText(url); toast("Enlace copiado");
    } catch (e) { if (e && e.name !== "AbortError") toast("Enlace: " + url); }
  };
  showLayer($("#scrim"), $("#mClose"), p.id, push);
  $("#scrim .sheet").scrollTop = 0;
}
function openCart(push = true) { renderCart(); showLayer($("#cartScrim"), $("#cClose"), paso === 2 ? "datos" : "pedido", push); }
let tt; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2600); }
function goCatalog() { $("#catTitle").scrollIntoView({ behavior: "smooth", block: "start" }); }

/* ---------- Botón flotante de WhatsApp: que no tape nada ---------- */
// Se oculta: con la ficha o el carrito abiertos, cuando hay pedido (aparece "Ver pedido"),
// mientras se ve el "Escribinos" de la portada y, en el celular, al bajar con el dedo.
let heroVisible = true, bajando = false, lastY = scrollY;
function updateFab() {
  const fab = $("#fab"); if (!fab) return;
  const ocultar = document.body.classList.contains("capa-abierta") || cartCount() > 0 || heroVisible || bajando;
  fab.classList.toggle("fab-off", ocultar);
}
const heroBtn = $("#heroWa");
if (heroBtn && "IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; updateFab(); }).observe(heroBtn);
} else heroVisible = false;
let scrollT;
addEventListener("scroll", () => {
  if (innerWidth > 640) { if (bajando) { bajando = false; updateFab(); } return; }
  const y = scrollY, nuevo = y > lastY + 4 ? true : y < lastY - 4 ? false : bajando;
  lastY = y;
  if (nuevo !== bajando) { bajando = nuevo; updateFab(); }
  clearTimeout(scrollT); scrollT = setTimeout(() => { bajando = false; updateFab(); }, 900);
}, { passive: true });

/* ---------- Eventos ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("button,a"); if (!t) return;
  if (t.dataset.amb) { amb = t.dataset.amb; renderFilters(); renderGrid(); return; }
  if (t.dataset.tipo) { tipo = t.dataset.tipo; renderFilters(); renderGrid(); return; }
  if (t.dataset.gotoTipo) { amb = "Todos"; tipo = t.dataset.gotoTipo; renderFilters(); renderGrid(); goCatalog(); return; }
  if (t.dataset.gotoAmb) { tipo = "Todo"; amb = t.dataset.gotoAmb; renderFilters(); renderGrid(); goCatalog(); return; }
  if (t.dataset.reset !== undefined || t.id === "resetFilters") { resetFilters(); return; }
  if (t.dataset.sw) { selectOption(t.dataset.sw, +t.dataset.k); return; }
  if (t.dataset.add) {
    const enCarrito = !!t.closest("#cartScrim");
    addToCart(t.dataset.add, selOf(t.dataset.add));
    if (enCarrito) return;   // el carrito se vuelve a dibujar solo
    t.classList.add("done"); t.innerHTML = `${ICO.check}<span>Agregado</span>`;
    setTimeout(() => { if (document.contains(t)) { t.classList.remove("done"); t.innerHTML = `${ICO.plus}<span>Añadir</span>`; } }, 1200);
    return;
  }
  if (t.dataset.open) { e.preventDefault(); openProduct(t.dataset.open, !anyOpen() || !isOpen($("#scrim"))); return; }
});
$("#q").addEventListener("input", e => { query = e.target.value; $("#clearQ").hidden = !query; renderGrid(); });
$("#clearQ").addEventListener("click", () => { query = ""; $("#q").value = ""; $("#clearQ").hidden = true; renderGrid(); $("#q").focus(); });
$("#sort").addEventListener("change", e => { sort = e.target.value; renderGrid(); });
$("#mMinus").addEventListener("click", () => setMQty(mQty - 1));
$("#mPlus").addEventListener("click", () => setMQty(mQty + 1));
$("#mAdd").addEventListener("click", () => {
  if (!openId) return;
  addToCart(openId, selOf(openId), mQty);
  $("#mAdd .t").textContent = "¡Agregado!";
  setTimeout(() => { $("#mAdd .t").textContent = "Agregar al pedido"; setMQty(1); }, 1400);
});
$("#cartBtn").addEventListener("click", () => openCart());
$("#fabCart").addEventListener("click", () => openCart());
$("#cBody").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.inc) setQty(t.dataset.inc, cart[t.dataset.inc] + 1);
  else if (t.dataset.dec) setQty(t.dataset.dec, cart[t.dataset.dec] - 1);
  else if (t.dataset.rm) { const { p } = parseKey(t.dataset.rm); delete cart[t.dataset.rm]; saveCart(); renderCart(); toast(`Quitado: ${p.nombre}`); }
  else if (t.id === "clearCart") {
    if (t.classList.contains("armed")) { cart = {}; saveCart(); renderCart(); }
    else { t.classList.add("armed"); t.textContent = "¿Seguro? Tocá de nuevo para vaciar"; setTimeout(() => { if (document.contains(t)) { t.classList.remove("armed"); t.textContent = "Vaciar pedido"; } }, 3000); }
    return;
  }
  else if (t.id === "cBrowse") { closeLayer(); setTimeout(goCatalog, 80); return; }
  if (!document.contains(t)) $("#cClose").focus();
});
cargarDatos(); actualizarFormulario();
$("#cForm").addEventListener("input", () => { actualizarFormulario(); guardarDatos(); renderCart(); if ($("#cForm").dataset.intento) mostrarErrores(validar()); });
$("#cForm").addEventListener("change", () => { actualizarFormulario(); guardarDatos(); renderCart(); if ($("#cForm").dataset.intento) mostrarErrores(validar()); });
$("#cForm").addEventListener("submit", e => e.preventDefault());
$("#cNext").addEventListener("click", () => irAPaso(2));
$("#cBack").addEventListener("click", () => { if (location.hash === "#datos") history.back(); else irAPaso(1); });
const regaloBox = $("#cRegalo");
if (regaloBox) { regaloBox.checked = regalo; regaloBox.addEventListener("change", () => { regalo = regaloBox.checked; saveCart(); }); }
$("#cSend").addEventListener("click", e => {
  const mal = validar();
  $("#cForm").dataset.intento = "1";
  mostrarErrores(mal);
  if (mal.length) {
    e.preventDefault();
    const primero = document.querySelector(`#cForm [data-campo="${mal[0]}"]`);
    if (primero) { primero.scrollIntoView({ behavior: "smooth", block: "center" }); const i = primero.querySelector("input,textarea,select"); if (i) setTimeout(() => i.focus({ preventScroll: true }), 250); }
    toast(mal.length === 1 ? "Falta completar un dato" : `Faltan completar ${mal.length} datos`);
    return;
  }
  guardarDatos(); updateSendLink(); toast("Abriendo WhatsApp con tu pedido…");
});
$("#mClose").addEventListener("click", closeLayer);
$("#cClose").addEventListener("click", closeLayer);
["#scrim", "#cartScrim"].forEach(s => $(s).addEventListener("click", e => { if (e.target === e.currentTarget) closeLayer(); }));
document.addEventListener("keydown", e => { if (e.key === "Escape" && anyOpen()) closeLayer(); });
$("#brand").addEventListener("click", e => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });
function syncHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id === "pedido") { paso = 1; openCart(false); }
  else if (id === "datos") { paso = 2; openCart(false); actualizarFormulario(); }
  else if (byId(id)) openProduct(id, false);
  else { pushed = false; hideLayers(); }
}
window.addEventListener("popstate", syncHash);
// Al abrir el carrito desde el botón, siempre arranca en el paso 1.
["#cartBtn", "#fabCart"].forEach(s => $(s).addEventListener("click", () => { paso = 1; }, true));
window.addEventListener("hashchange", syncHash);
/* Deslizar hacia abajo para cerrar (celular) */
[".sheet", ".drawer"].forEach(s => {
  const sh = $(s); let y0 = null, dy = 0;
  sh.addEventListener("touchstart", e => {
    const inner = s === ".drawer" ? $("#cBody") : sh;
    if (innerWidth <= 640 && sh.scrollTop <= 0 && inner.scrollTop <= 0 && !e.target.closest("input,textarea,.mini-row")) { y0 = e.touches[0].clientY; dy = 0; } else y0 = null;
  }, { passive: true });
  sh.addEventListener("touchmove", e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0) { sh.style.transition = "none"; sh.style.transform = `translateY(${dy}px)`; } }, { passive: true });
  sh.addEventListener("touchend", () => { if (y0 === null) return; sh.style.transition = ""; sh.style.transform = ""; if (dy > 110) closeLayer(); y0 = null; });
});

renderFilters(); renderGrid(); renderCart();
syncHash();
