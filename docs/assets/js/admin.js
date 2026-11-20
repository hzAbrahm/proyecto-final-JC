/**
 * admin.js — Panel administrativo protegido y gestión integral (Atlas).
 *
 * Se carga en: admin.html.
 * Requiere cargar antes: shared.js (formatoCOP y nombresMetodosPago).
 */

const formularioAdminAcceso = document.querySelector("#form-admin-acceso");
const seccionAdminAcceso = document.querySelector("#admin-acceso");
const panelAdmin = document.querySelector("#panel-admin");
const estadoAdminAcceso = document.querySelector("#estado-admin-acceso");
const formularioProductoAdmin = document.querySelector("#form-admin-producto");
const estadoProductoAdmin = document.querySelector("#estado-producto-admin");
const listaProductosAdminDB = document.querySelector("#admin-lista-productos-db");
const estadoSinProductosAdminDB = document.querySelector("#admin-sin-productos-db");
const totalProductosAdmin = document.querySelector("#admin-total-productos");
const totalPedidosAdmin = document.querySelector("#admin-total-pedidos");
const totalSolicitudesAdmin = document.querySelector("#admin-total-solicitudes");
const listaPedidosAdmin = document.querySelector("#admin-lista-pedidos");
const estadoSinPedidosAdmin = document.querySelector("#admin-sin-pedidos");
const listaSolicitudesAdmin = document.querySelector("#admin-lista-solicitudes");
const estadoSinSolicitudesAdmin = document.querySelector("#admin-sin-solicitudes");
const botonCerrarAdmin = document.querySelector("#cerrar-admin");

const claveTokenAdmin = "calles-dulces-admin-token-v1";

function obtenerTokenAdmin() {
  try {
    return sessionStorage.getItem(claveTokenAdmin) || "";
  } catch {
    return "";
  }
}

function guardarTokenAdmin(token) {
  try {
    if (token) {
      sessionStorage.setItem(claveTokenAdmin, token);
    } else {
      sessionStorage.removeItem(claveTokenAdmin);
    }
  } catch {
    // Si el navegador bloquea sessionStorage, continúa en memoria.
  }
}

async function fetchConAuth(url, opciones = {}) {
  const token = obtenerTokenAdmin();
  const headers = {
    Accept: "application/json",
    ...(opciones.headers || {})
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const respuesta = await fetch(window.apiUrl(url), { ...opciones, headers });

  if (respuesta.status === 401) {
    guardarTokenAdmin("");
    renderizarPanelAdmin();
    if (estadoAdminAcceso) {
      estadoAdminAcceso.textContent = "Tu sesión ha expirado o no es válida. Inicia sesión nuevamente.";
    }
    throw new Error("Sesión no autorizada.");
  }

  return respuesta;
}

function crearRegistroProductoAdmin(producto) {
  const item = document.createElement("li");
  item.className = "admin-registro";

  const titulo = document.createElement("strong");
  const estadoTexto = producto.active ? "" : " (Inactivo)";
  titulo.textContent = `${producto.name} · ${formatoCOP.format(producto.priceCOP)}${estadoTexto}`;

  const detalle = document.createElement("p");
  const peso = producto.weightGrams ? ` · ${producto.weightGrams} g` : "";
  const restriccion = producto.restriction ? ` · ${producto.restriction}` : "";
  detalle.textContent = `${producto.category}${peso}${restriccion} · en MongoDB`;

  const botonToggle = document.createElement("button");
  botonToggle.type = "button";
  botonToggle.className = "boton-secundario";
  botonToggle.dataset.productoId = producto._id;
  botonToggle.dataset.activo = String(Boolean(producto.active));
  botonToggle.textContent = producto.active ? "desactivar" : "activar";

  item.append(titulo, detalle, botonToggle);
  return item;
}

async function cargarProductosAtlasAdmin(mostrarEstado = true) {
  if (!listaProductosAdminDB) return;

  try {
    const respuesta = await fetchConAuth("/api/products");
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudo consultar el catálogo.");

    const items = Array.isArray(resultado.items) ? resultado.items : [];
    if (totalProductosAdmin) totalProductosAdmin.textContent = String(items.length);
    listaProductosAdminDB.replaceChildren(...items.map(crearRegistroProductoAdmin));
    if (estadoSinProductosAdminDB) estadoSinProductosAdminDB.hidden = items.length > 0;
    if (mostrarEstado && estadoProductoAdmin) {
      estadoProductoAdmin.textContent = `MongoDB respondió: ${items.length} producto${items.length === 1 ? "" : "s"} activo${items.length === 1 ? "" : "s"}.`;
    }
    return items;
  } catch (error) {
    if (totalProductosAdmin) totalProductosAdmin.textContent = "—";
    listaProductosAdminDB.replaceChildren();
    if (estadoSinProductosAdminDB) estadoSinProductosAdminDB.hidden = false;
    if (estadoProductoAdmin) {
      estadoProductoAdmin.textContent = error.message || "No se pudo leer el catálogo de MongoDB.";
    }
    return null;
  }
}

async function cargarPedidosAtlasAdmin() {
  if (!listaPedidosAdmin) return;

  try {
    const respuesta = await fetchConAuth("/api/admin/orders");
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudieron obtener los pedidos.");

    const pedidos = Array.isArray(resultado.orders) ? resultado.orders : [];
    if (totalPedidosAdmin) totalPedidosAdmin.textContent = String(pedidos.length);
    listaPedidosAdmin.replaceChildren();
    if (estadoSinPedidosAdmin) estadoSinPedidosAdmin.hidden = pedidos.length > 0;

    pedidos.forEach((pedido) => {
      const item = document.createElement("li");
      item.className = "admin-registro";

      const titulo = document.createElement("strong");
      const clienteNombre = pedido.customer?.name || "Sin nombre";
      titulo.textContent = `${pedido.receipt} · ${clienteNombre}`;

      const detalle = document.createElement("p");
      const resumenItems = Array.isArray(pedido.items)
        ? pedido.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")
        : "";
      const fecha = pedido.createdAt ? new Date(pedido.createdAt).toLocaleString("es-CO") : "";
      detalle.textContent = `Total: ${formatoCOP.format(pedido.totalCOP)} · ${pedido.paymentMethod} · ${fecha} · Ítems: [${resumenItems}]`;

      const datosCliente = document.createElement("p");
      datosCliente.textContent = `Contacto: ${pedido.customer?.phone || "Sin tel"} · ${pedido.customer?.email || ""} · ${pedido.customer?.city || ""}, ${pedido.customer?.address || ""}`;

      const etiquetaEstado = document.createElement("label");
      etiquetaEstado.textContent = "estado de preparación";
      const selector = document.createElement("select");
      selector.dataset.pedidoAdmin = pedido._id;

      const estadoActual = pedido.deliveryStatus || pedido.estadoEntrega || "confirmado";
      ["confirmado", "preparando", "listo para entregar", "en camino", "entregado"].forEach((estado) => {
        const opcion = document.createElement("option");
        opcion.value = estado;
        opcion.textContent = estado;
        opcion.selected = estadoActual === estado;
        selector.append(opcion);
      });

      etiquetaEstado.append(selector);
      item.append(titulo, detalle, datosCliente, etiquetaEstado);
      listaPedidosAdmin.append(item);
    });
  } catch (error) {
    if (totalPedidosAdmin) totalPedidosAdmin.textContent = "—";
    listaPedidosAdmin.replaceChildren();
    if (estadoSinPedidosAdmin) {
      estadoSinPedidosAdmin.hidden = false;
      estadoSinPedidosAdmin.textContent = error.message || "Error al cargar pedidos.";
    }
  }
}

async function cargarSolicitudesAtlasAdmin() {
  if (!listaSolicitudesAdmin) return;

  try {
    const [respuestaContactos, respuestaSugerencias] = await Promise.all([
      fetchConAuth("/api/admin/helprequests"),
      fetchConAuth("/api/admin/suggestions")
    ]);
    const [resultadoContactos, resultadoSugerencias] = await Promise.all([
      respuestaContactos.json(),
      respuestaSugerencias.json()
    ]);
    if (!respuestaContactos.ok) throw new Error(resultadoContactos.error || "No se pudieron obtener las solicitudes.");
    if (!respuestaSugerencias.ok) throw new Error(resultadoSugerencias.error || "No se pudieron obtener las recomendaciones.");

    const contactos = Array.isArray(resultadoContactos.items) ? resultadoContactos.items : [];
    const sugerencias = Array.isArray(resultadoSugerencias.items) ? resultadoSugerencias.items : [];
    const registros = [
      ...contactos.map((item) => ({ ...item, tipoRegistro: "contacto" })),
      ...sugerencias.map((item) => ({ ...item, tipoRegistro: "sugerencia" }))
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (totalSolicitudesAdmin) totalSolicitudesAdmin.textContent = String(registros.length);
    listaSolicitudesAdmin.replaceChildren();
    if (estadoSinSolicitudesAdmin) estadoSinSolicitudesAdmin.hidden = registros.length > 0;

    registros.forEach((solicitud) => {
      const item = document.createElement("li");
      item.className = "admin-registro";
      const titulo = document.createElement("strong");
      const fecha = solicitud.createdAt ? new Date(solicitud.createdAt).toLocaleString("es-CO") : "";

      if (solicitud.tipoRegistro === "sugerencia") {
        titulo.textContent = "Recomendación de producto";
        const detalle = document.createElement("p");
        detalle.textContent = `Fecha: ${fecha}`;
        const mensaje = document.createElement("p");
        mensaje.textContent = solicitud.product || solicitud.producto || "Sin descripción";
        item.append(titulo, detalle, mensaje);
      } else {
        const nombre = solicitud.name || solicitud.nombre || "Contacto sin nombre";
        titulo.textContent = `Mensaje de: ${nombre}`;
        const detalle = document.createElement("p");
        const correo = solicitud.email || solicitud.correo || "";
        const tel = solicitud.phone || solicitud.numero || "";
        detalle.textContent = `Correo: ${correo} · Tel: ${tel} · Fecha: ${fecha}`;
        const mensaje = document.createElement("p");
        mensaje.textContent = `"${solicitud.message || solicitud.mensaje || ""}"`;
        item.append(titulo, detalle, mensaje);
      }
      listaSolicitudesAdmin.append(item);
    });
  } catch (error) {
    if (totalSolicitudesAdmin) totalSolicitudesAdmin.textContent = "—";
    listaSolicitudesAdmin.replaceChildren();
    if (estadoSinSolicitudesAdmin) {
      estadoSinSolicitudesAdmin.hidden = false;
      estadoSinSolicitudesAdmin.textContent = error.message || "Error al cargar solicitudes.";
    }
  }
}

async function renderizarPanelAdmin() {
  const token = obtenerTokenAdmin();
  const sesionActiva = Boolean(token);

  if (panelAdmin) panelAdmin.hidden = !sesionActiva;
  if (seccionAdminAcceso) seccionAdminAcceso.hidden = sesionActiva;
  if (!sesionActiva) return;

  await Promise.all([
    cargarProductosAtlasAdmin(true),
    cargarPedidosAtlasAdmin(),
    cargarSolicitudesAtlasAdmin()
  ]);
}

// Evento: Crear producto
formularioProductoAdmin?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!formularioProductoAdmin.reportValidity()) return;

  const datos = Object.fromEntries(new FormData(formularioProductoAdmin).entries());
  datos.priceCOP = Number(datos.priceCOP);
  datos.weightGrams = datos.weightGrams ? Number(datos.weightGrams) : null;
  if (estadoProductoAdmin) estadoProductoAdmin.textContent = "Guardando producto en MongoDB...";

  try {
    const respuesta = await fetchConAuth("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "El servidor rechazó el producto.");

    formularioProductoAdmin.reset();
    await cargarProductosAtlasAdmin(false);
    if (estadoProductoAdmin) {
      estadoProductoAdmin.textContent = `Guardado con éxito en MongoDB: ${resultado.item.name}.`;
    }
  } catch (error) {
    if (estadoProductoAdmin) estadoProductoAdmin.textContent = error.message;
  }
});

// Evento: Activar/desactivar producto
listaProductosAdminDB?.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-producto-id]");
  if (!boton) return;

  const id = boton.dataset.productoId;
  const activoActual = boton.dataset.activo === "true";
  boton.disabled = true;

  try {
    const respuesta = await fetchConAuth(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !activoActual })
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudo actualizar el estado.");

    await cargarProductosAtlasAdmin(false);
  } catch (error) {
    alert(error.message || "Error al actualizar el producto.");
  } finally {
    boton.disabled = false;
  }
});

// Evento: Cambiar estado de pedido
listaPedidosAdmin?.addEventListener("change", async (evento) => {
  const selector = evento.target.closest("select[data-pedido-admin]");
  if (!selector) return;

  const id = selector.dataset.pedidoAdmin;
  const nuevoEstado = selector.value;
  selector.disabled = true;

  try {
    const respuesta = await fetchConAuth(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryStatus: nuevoEstado })
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudo actualizar el pedido.");

    selector.style.outline = "2px solid #2E8DB6";
    window.setTimeout(() => { selector.style.outline = ""; }, 1200);
  } catch (error) {
    alert(error.message || "Error al actualizar el estado del pedido.");
    await cargarPedidosAtlasAdmin();
  } finally {
    selector.disabled = false;
  }
});

// Evento: Iniciar sesión
formularioAdminAcceso?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!formularioAdminAcceso.reportValidity()) return;

  const correo = formularioAdminAcceso.elements.correo.value.trim().toLowerCase();
  const contrasena = formularioAdminAcceso.elements.contrasena.value;
  const botonSubmit = formularioAdminAcceso.querySelector("button[type='submit']");

  if (botonSubmit) botonSubmit.disabled = true;
  if (estadoAdminAcceso) estadoAdminAcceso.textContent = "Verificando credenciales...";

  try {
    const respuesta = await fetch(window.apiUrl("/api/admin/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ correo, contrasena })
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo iniciar sesión.");
    }

    guardarTokenAdmin(resultado.token);
    formularioAdminAcceso.reset();
    if (estadoAdminAcceso) estadoAdminAcceso.textContent = "";
    await renderizarPanelAdmin();
  } catch (error) {
    if (estadoAdminAcceso) {
      estadoAdminAcceso.textContent = error.message || "Credenciales incorrectas.";
    }
  } finally {
    if (botonSubmit) botonSubmit.disabled = false;
  }
});

// Evento: Cerrar sesión
botonCerrarAdmin?.addEventListener("click", async () => {
  try {
    await fetchConAuth("/api/admin/logout", { method: "POST" });
  } catch {
    // Si falla la red, cerramos la sesión local de todas formas.
  }
  guardarTokenAdmin("");
  await renderizarPanelAdmin();
});

// Verificación inicial de sesión al cargar la página
async function inicializarSesionAdmin() {
  const token = obtenerTokenAdmin();
  if (!token) {
    renderizarPanelAdmin();
    return;
  }

  try {
    const respuesta = await fetch(window.apiUrl("/api/admin/me"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!respuesta.ok) {
      guardarTokenAdmin("");
    }
  } catch {
    guardarTokenAdmin("");
  }

  renderizarPanelAdmin();
}

inicializarSesionAdmin();
