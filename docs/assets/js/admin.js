/**
 * admin.js — Panel administrativo de demostración y gestión de productos (Atlas).
 *
 * Se carga en: admin.html.
 * Requiere cargar antes: shared.js (leerListaDemo, guardarListaDemo, formatoCOP,
 * nombresMetodosPago y las claves de localStorage).
 *
 * Origen: fragmentos de docs/assets/js/options.js (se conserva intacto como respaldo).
 * Cada bloque indica con "// ── ... ──" de qué líneas de options.js proviene;
 * el código de dentro es una copia exacta de esas líneas.
 */

// ── Panel administrativo: acceso, pedidos, pagos, solicitudes y gestión de productos (Atlas) (options.js L1416–L1605) ──
const formularioAdminAcceso = document.querySelector("#form-admin-acceso");
const seccionAdminAcceso = document.querySelector("#admin-acceso");
const panelAdmin = document.querySelector("#panel-admin");
const formularioProductoAdmin = document.querySelector("#form-admin-producto");
const estadoProductoAdmin = document.querySelector("#estado-producto-admin");
const listaProductosAdminDB = document.querySelector("#admin-lista-productos-db");
const estadoSinProductosAdminDB = document.querySelector("#admin-sin-productos-db");
const totalProductosAdmin = document.querySelector("#admin-total-productos");
const claveSesionAdminDemo = "calles-dulces-admin-demo-sesion-v1";

function crearRegistroProductoAdmin(producto) {
  const item = document.createElement("li");
  item.className = "admin-registro";

  const titulo = document.createElement("strong");
  titulo.textContent = `${producto.name} · ${formatoCOP.format(producto.priceCOP)}`;

  const detalle = document.createElement("p");
  const peso = producto.weightGrams ? ` · ${producto.weightGrams} g` : "";
  detalle.textContent = `${producto.category}${peso} · guardado en Atlas`;
  item.append(titulo, detalle);
  return item;
}

async function cargarProductosAtlasAdmin(mostrarEstado = true) {
  if (!listaProductosAdminDB) return;

  try {
    const respuesta = await fetch("/api/products", { headers: { Accept: "application/json" } });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudo consultar Atlas.");

    const items = Array.isArray(resultado.items) ? resultado.items : [];
    totalProductosAdmin.textContent = String(items.length);
    listaProductosAdminDB.replaceChildren(...items.map(crearRegistroProductoAdmin));
    estadoSinProductosAdminDB.hidden = items.length > 0;
    if (mostrarEstado && estadoProductoAdmin) {
      estadoProductoAdmin.textContent = `Atlas respondió: ${items.length} producto${items.length === 1 ? "" : "s"} activo${items.length === 1 ? "" : "s"}.`;
    }
    return items;
  } catch {
    totalProductosAdmin.textContent = "—";
    listaProductosAdminDB.replaceChildren();
    estadoSinProductosAdminDB.hidden = false;
    if (estadoProductoAdmin) {
      estadoProductoAdmin.textContent = "No se pudo leer el catálogo de Atlas. Revisa que el servidor esté iniciado con npm start.";
    }
    return null;
  }
}

function renderizarPanelAdminDemo() {
  if (!panelAdmin) return;
  let sesionActiva = false;
  try {
    sesionActiva = sessionStorage.getItem(claveSesionAdminDemo) === "activa";
  } catch {
    sesionActiva = false;
  }
  panelAdmin.hidden = !sesionActiva;
  if (seccionAdminAcceso) seccionAdminAcceso.hidden = sesionActiva;
  if (!sesionActiva) return;

  const pedidos = leerListaDemo(clavePedidosDemo);
  const pagos = leerListaDemo(clavePagosDemo);
  const solicitudes = leerListaDemo(claveSolicitudesDemo);
  cargarProductosAtlasAdmin();
  document.querySelector("#admin-total-pedidos").textContent = String(pedidos.length);
  document.querySelector("#admin-total-solicitudes").textContent = String(solicitudes.length);

  const listaPedidosAdmin = document.querySelector("#admin-lista-pedidos");
  listaPedidosAdmin.replaceChildren();
  document.querySelector("#admin-sin-pedidos").hidden = pedidos.length > 0;
  pedidos.forEach((pedido) => {
    const item = document.createElement("li");
    item.className = "admin-registro";
    const titulo = document.createElement("strong");
    titulo.textContent = `${pedido.recibo} · ${pedido.nombre}`;
    const detalle = document.createElement("p");
    detalle.textContent = `${pedido.metodo} · ${formatoCOP.format(pedido.total)} · ${pedido.estado}`;
    const etiquetaEstado = document.createElement("label");
    etiquetaEstado.textContent = "estado de preparación";
    const selector = document.createElement("select");
    selector.dataset.pedidoAdmin = pedido.id;
    ["confirmado", "preparando", "listo para entregar", "en camino", "entregado"].forEach((estado) => {
      const opcion = document.createElement("option");
      opcion.value = estado;
      opcion.textContent = estado;
      opcion.selected = (pedido.estadoEntrega || "confirmado") === estado;
      selector.append(opcion);
    });
    etiquetaEstado.append(selector);
    item.append(titulo, detalle, etiquetaEstado);
    listaPedidosAdmin.append(item);
  });

  const listaPagosAdmin = document.querySelector("#admin-lista-pagos");
  listaPagosAdmin.replaceChildren();
  document.querySelector("#admin-sin-pagos").hidden = pagos.length > 0;
  pagos.forEach((pago) => {
    const item = document.createElement("li");
    item.className = "admin-registro";
    const titulo = document.createElement("strong");
    titulo.textContent = `${nombresMetodosPago[pago.metodo] || pago.metodo} · ${pago.estado}`;
    const detalle = document.createElement("p");
    detalle.textContent = `${formatoCOP.format(pago.monto)} · ${new Date(pago.fecha).toLocaleString("es-CO")}`;
    item.append(titulo, detalle);
    listaPagosAdmin.append(item);
  });

  const listaSolicitudesAdmin = document.querySelector("#admin-lista-solicitudes");
  listaSolicitudesAdmin.replaceChildren();
  document.querySelector("#admin-sin-solicitudes").hidden = solicitudes.length > 0;
  solicitudes.forEach((solicitud) => {
    const item = document.createElement("li");
    item.className = "admin-registro";
    const titulo = document.createElement("strong");
    titulo.textContent = `${solicitud.tipo} · ${solicitud.nombre || solicitud.correo || "sin nombre"}`;
    const detalle = document.createElement("p");
    const resumen = Object.entries(solicitud)
      .filter(([clave]) => !["id", "tipo", "fecha"].includes(clave))
      .map(([clave, valor]) => `${clave}: ${valor}`)
      .join(" · ");
    detalle.textContent = `${new Date(solicitud.fecha).toLocaleString("es-CO")} · ${resumen}`;
    item.append(titulo, detalle);
    listaSolicitudesAdmin.append(item);
  });
}

formularioProductoAdmin?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!formularioProductoAdmin.reportValidity()) return;

  const datos = Object.fromEntries(new FormData(formularioProductoAdmin).entries());
  datos.priceCOP = Number(datos.priceCOP);
  datos.weightGrams = datos.weightGrams ? Number(datos.weightGrams) : null;
  if (estadoProductoAdmin) estadoProductoAdmin.textContent = "Enviando el producto al servidor...";

  try {
    const respuesta = await fetch("/api/dev/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "El servidor rechazó el producto.");

    formularioProductoAdmin.reset();
    await cargarProductosAtlasAdmin(false);
    if (estadoProductoAdmin) {
      estadoProductoAdmin.textContent = `Guardado en Atlas: ${resultado.item.name} (id ${resultado.item._id}).`;
    }
  } catch (error) {
    if (estadoProductoAdmin) estadoProductoAdmin.textContent = error.message;
  }
});

formularioAdminAcceso?.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!formularioAdminAcceso.reportValidity()) return;
  try {
    sessionStorage.setItem(claveSesionAdminDemo, "activa");
  } catch {
    document.querySelector("#estado-admin-acceso").textContent = "El navegador bloqueó la sesión de prueba.";
    return;
  }
  renderizarPanelAdminDemo();
});

document.querySelector("#cerrar-admin")?.addEventListener("click", () => {
  try {
    sessionStorage.removeItem(claveSesionAdminDemo);
  } catch {
    // La página vuelve al formulario aunque el almacenamiento de sesión no esté disponible.
  }
  renderizarPanelAdminDemo();
});

document.querySelector("#admin-lista-pedidos")?.addEventListener("change", (evento) => {
  const selector = evento.target.closest("select[data-pedido-admin]");
  if (!selector) return;
  const pedidos = leerListaDemo(clavePedidosDemo);
  const pedido = pedidos.find((item) => item.id === selector.dataset.pedidoAdmin);
  if (!pedido) return;
  pedido.estadoEntrega = selector.value;
  guardarListaDemo(clavePedidosDemo, pedidos);
  renderizarPanelAdminDemo();
});

renderizarPanelAdminDemo();
