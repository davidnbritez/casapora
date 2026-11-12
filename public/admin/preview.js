/* Vista previa del panel: muestra el producto como se ve en la web (foto, precio, oferta, opciones). */
(function () {
  if (!window.CMS) return;
  const h = window.h, createClass = window.createClass;
  const gs = n => "Gs. " + Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const venta = (normal, oferta) => (oferta > 0 && oferta < normal) ? { precio: oferta, antes: normal } : { precio: normal, antes: null };

  function precioHTML(normal, oferta) {
    if (!normal) return h("span", { className: "muted" }, "Sin precio");
    const v = venta(Number(normal), Number(oferta));
    return v.antes
      ? h("span", {}, h("b", { className: "sale" }, gs(v.precio)), " ", h("s", {}, gs(v.antes)))
      : h("b", {}, gs(v.precio));
  }

  const Producto = createClass({
    getInitialState() { return { foto: 0 }; },
    render() {
      const d = this.props.entry.get("data").toJS();
      const getAsset = this.props.getAsset;
      const url = p => { try { return p ? String(getAsset(p)) : ""; } catch (e) { return p; } };
      const fotos = (d.fotos || []).filter(Boolean);
      const items = (d.opciones && d.opciones.items) || [];
      const v = venta(Number(d.precio), Number(d.precioOferta));
      const descuento = v.antes ? Math.round((1 - v.precio / v.antes) * 100) : 0;
      const sel = Math.min(this.state.foto, Math.max(fotos.length - 1, 0));
      const etiqueta = d.agotado ? "Agotado" : (d.etiqueta || (d.nuevo ? "Nuevo" : ""));

      return h("div", { className: "pv" },
        d.activo === false && h("div", { className: "aviso off" }, "Desactivado: este producto NO se ve en la web."),
        d.agotado && h("div", { className: "aviso" }, "Agotado: se ve en la web, pero no se puede agregar al pedido."),
        d.destacado && h("div", { className: "aviso ok" }, "Destacado: aparece primero en el catálogo."),
        h("div", { className: "ficha" },
          h("div", {},
            h("div", { className: "foto" },
              fotos.length ? h("img", { src: url(fotos[sel]), alt: d.nombre || "" }) : h("div", { className: "sinfoto" }, "Sin foto todavía"),
              etiqueta && h("span", { className: "pill l" + (d.agotado ? " out" : "") }, etiqueta),
              descuento > 0 && !d.agotado && h("span", { className: "pill r off" }, "−" + descuento + "%")
            ),
            fotos.length > 1 && h("div", { className: "thumbs" },
              fotos.map((f, i) => h("button", { key: i, className: i === sel ? "on" : "", onClick: () => this.setState({ foto: i }) }, h("img", { src: url(f), alt: "" })))
            )
          ),
          h("div", { className: "info" },
            h("div", { className: "meta" }, [d.categoria].concat(d.ambientes || []).filter(Boolean).join(" · ")),
            h("h1", {}, d.nombre || "Producto sin nombre"),
            h("div", { className: "precio" }, precioHTML(d.precio, d.precioOferta)),
            d.medida && h("div", { className: "muted" }, d.medida),
            d.resumen && h("p", { className: "resumen" }, d.resumen),
            items.length > 0 && h("div", { className: "opts" },
              h("div", { className: "opt-t" }, (d.opciones && d.opciones.titulo) || "Opciones"),
              h("div", { className: "opt-row" }, items.map((o, i) =>
                h("div", { key: i, className: "chip" },
                  o.color && h("i", { style: { background: o.color } }),
                  h("span", {}, o.nombre || "—",
                    o.nota && h("small", {}, o.nota),
                    (o.precio || o.precioOferta) && h("small", {}, precioHTML(o.precio || d.precio, o.precioOferta)))
                )))
            ),
            d.descripcion && h("p", { className: "desc" }, d.descripcion),
            (d.detalles || []).length > 0 && h("dl", {}, (d.detalles || []).map((x, i) => [h("dt", { key: "t" + i }, x.clave), h("dd", { key: "d" + i }, x.valor)]))
          )
        ),
        h("p", { className: "nota" }, "Vista previa aproximada. Al tocar Publicar, la web se actualiza en ~1 minuto.")
      );
    }
  });

  // Accesos en el menú del panel: ver el borrador (gratis) y publicar todo junto (15 créditos).
  if (typeof CMS.registerAdditionalLink === "function") {
    CMS.registerAdditionalLink({ id: "ver-borrador", title: "Ver borrador (gratis)", data: "https://borrador.nicehomepy.pages.dev", options: { icon: "page" } });
    CMS.registerAdditionalLink({ id: "publicar", title: "Publicar cambios en la web", data: "https://github.com/davidnbritez/nicehome/actions/workflows/publicar.yml", options: { icon: "page" } });
  }

  CMS.registerPreviewStyle("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap");
  CMS.registerPreviewStyle("/admin/preview.css");
  CMS.registerPreviewTemplate("productos", Producto);
})();
